import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, Square, Loader2, Trash2 } from 'lucide-react';

// Recording is capped at 60s client-side to keep audio payloads small
// (stored as encrypted base64 alongside the entry text, see entryService.js).
const MAX_RECORDING_SECONDS = 60;
const AUDIO_MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
// SpeechRecognition.stop() doesn't cut off immediately: the browser keeps processing
// already-captured audio and can fire one last onresult before onend. Cap how long we
// wait for that flush so the UI never hangs if onend never fires.
const RECOGNITION_FLUSH_TIMEOUT_MS = 1500;

const getSpeechRecognitionCtor = () =>
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) || null;

const isRecordingSupported = () =>
  typeof window !== 'undefined' &&
  !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) &&
  typeof window.MediaRecorder !== 'undefined';

const isTranscriptionSupported = () => !!getSpeechRecognitionCtor();

function pickAudioMimeType() {
  if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) return undefined;
  return AUDIO_MIME_CANDIDATES.find((candidate) => MediaRecorder.isTypeSupported(candidate));
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export default function VoiceInputButton({ audioValue, onAudioChange, onTranscript }) {
  const [status, setStatus] = useState('idle'); // idle | recording | transcribing | processing
  const [elapsed, setElapsed] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const transcriptRef = useRef('');
  const transcriptionErrorRef = useRef(false);
  const timerRef = useRef(null);

  const supported = isRecordingSupported();
  const transcriptionSupported = isTranscriptionSupported();

  const releaseResources = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch { /* already stopped */ }
      recognitionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => releaseResources, [releaseResources]);

  // Stops the recognizer and waits for its final onresult/onend to fire before
  // resolving, so the last spoken segment isn't lost when handlers are detached.
  const flushRecognition = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return Promise.resolve();
    return new Promise((resolve) => {
      let settled = false;
      let timeoutId;
      const finish = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        resolve();
      };
      timeoutId = setTimeout(finish, RECOGNITION_FLUSH_TIMEOUT_MS);
      recognition.onend = finish;
      try { recognition.stop(); } catch { finish(); }
    });
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const startRecording = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      transcriptRef.current = '';
      transcriptionErrorRef.current = false;

      const mimeType = pickAudioMimeType();
      const recorder = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        audioBitsPerSecond: 32000,
      });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (recognitionRef.current) {
          setStatus('transcribing');
          await flushRecognition();
        }
        releaseResources();
        setStatus('processing');
        try {
          const base64 = await blobToBase64(blob);
          onAudioChange(base64);
          const transcript = transcriptRef.current.trim();
          if (transcript) {
            onTranscript(transcript);
          } else if (transcriptionErrorRef.current) {
            setErrorMessage("La transcription a échoué, l'audio a été conservé.");
          }
        } catch {
          setErrorMessage("Impossible d'enregistrer l'audio.");
        } finally {
          setStatus('idle');
          setElapsed(0);
        }
      };

      recorder.start();
      setStatus('recording');

      const SpeechRecognitionCtor = getSpeechRecognitionCtor();
      if (SpeechRecognitionCtor) {
        const recognition = new SpeechRecognitionCtor();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = navigator.language || 'en-US';
        recognition.onresult = (event) => {
          let finalText = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalText += event.results[i][0].transcript;
            }
          }
          if (finalText) {
            transcriptRef.current = `${transcriptRef.current} ${finalText}`.trim();
          }
        };
        // Live transcription is best-effort; the audio recording is kept even if it fails.
        // 'no-speech'/'aborted' are expected (silence, or our own stop()) and not real failures.
        recognition.onerror = (event) => {
          if (event?.error !== 'no-speech' && event?.error !== 'aborted') {
            transcriptionErrorRef.current = true;
          }
        };
        recognitionRef.current = recognition;
        try { recognition.start(); } catch { /* already running */ }
      }

      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds += 1;
        setElapsed(seconds);
        if (seconds >= MAX_RECORDING_SECONDS) {
          stopRecording();
        }
      }, 1000);
    } catch {
      setErrorMessage('Microphone inaccessible. Vérifiez les permissions.');
      setStatus('idle');
    }
  };

  if (!supported) return null;

  return (
    <div className="flex items-center gap-2">
      {status === 'idle' && (
        <button
          type="button"
          onClick={startRecording}
          className="p-1.5 text-journal-400 hover:text-journal-900 hover:bg-journal-50 rounded transition-colors"
          title="Enregistrer un vocal"
        >
          <Mic size={18} />
        </button>
      )}
      {status === 'recording' && (
        <button
          type="button"
          onClick={stopRecording}
          className="p-1.5 flex items-center gap-1.5 text-journal-accent hover:bg-journal-50 rounded transition-colors"
          title="Arrêter l'enregistrement"
        >
          <Square size={16} className="fill-current" />
          <span className="text-xs tabular-nums">{MAX_RECORDING_SECONDS - elapsed}s</span>
        </button>
      )}
      {status === 'transcribing' && (
        <span className="flex items-center gap-1.5 text-journal-400" title="Transcription en cours">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-xs">Transcription…</span>
        </span>
      )}
      {status === 'processing' && (
        <Loader2 size={18} className="animate-spin text-journal-400" title="Enregistrement de l'audio" />
      )}
      {audioValue && status === 'idle' && (
        <>
          <audio controls src={audioValue} className="h-8 max-w-[140px]" />
          <button
            type="button"
            onClick={() => onAudioChange(null)}
            className="p-1.5 text-journal-300 hover:text-journal-accent hover:bg-journal-50 rounded transition-colors"
            title="Supprimer l'enregistrement"
          >
            <Trash2 size={16} />
          </button>
        </>
      )}
      {status === 'idle' && !transcriptionSupported && (
        <span className="text-xs text-journal-300 italic">
          Transcription indisponible sur ce navigateur, l'audio reste enregistré.
        </span>
      )}
      {errorMessage && (
        <span className="text-xs text-journal-accent">{errorMessage}</span>
      )}
    </div>
  );
}
