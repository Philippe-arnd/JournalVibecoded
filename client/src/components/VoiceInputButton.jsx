import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, Square, Loader2, Trash2 } from 'lucide-react';
import { transcribeAudio } from '../services/transcriptionService';

// Recording is capped at 60s client-side to keep audio payloads small
// (stored as encrypted base64 alongside the entry text, see entryService.js)
// and to bound the work handed to the transcription service.
const MAX_RECORDING_SECONDS = 60;
const AUDIO_MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];

const isRecordingSupported = () =>
  typeof window !== 'undefined' &&
  !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) &&
  typeof window.MediaRecorder !== 'undefined';

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
  const [status, setStatus] = useState('idle'); // idle | recording | processing | transcribing
  const [elapsed, setElapsed] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  // Guards the async tail of onstop: the component can be unmounted (card swiped
  // away) while a transcription is still in flight.
  const mountedRef = useRef(true);

  const supported = isRecordingSupported();

  const releaseResources = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      releaseResources();
    };
  }, [releaseResources]);

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
        releaseResources();

        // Persist the audio before transcribing: the recording is the part the user
        // can't reproduce, and transcription is the step that may fail or time out.
        setStatus('processing');
        try {
          onAudioChange(await blobToBase64(blob));
        } catch {
          if (mountedRef.current) {
            setErrorMessage("Impossible d'enregistrer l'audio.");
            setStatus('idle');
            setElapsed(0);
          }
          return;
        }

        setStatus('transcribing');
        try {
          const text = await transcribeAudio(blob);
          if (!mountedRef.current) return;
          if (text) {
            onTranscript(text);
          } else {
            setErrorMessage("Aucune parole n'a été reconnue, l'audio a été conservé.");
          }
        } catch (error) {
          if (mountedRef.current) setErrorMessage(error.message);
        } finally {
          if (mountedRef.current) {
            setStatus('idle');
            setElapsed(0);
          }
        }
      };

      recorder.start();
      setStatus('recording');

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
      {status === 'processing' && (
        <Loader2 size={18} className="animate-spin text-journal-400" title="Enregistrement de l'audio" />
      )}
      {status === 'transcribing' && (
        <span className="flex items-center gap-1.5 text-journal-400" title="Transcription en cours">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-xs">Transcription…</span>
        </span>
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
      {errorMessage && (
        <span className="text-xs text-journal-accent">{errorMessage}</span>
      )}
    </div>
  );
}
