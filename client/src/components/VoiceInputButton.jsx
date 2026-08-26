import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, Square, Loader2, Play, Pause, RotateCcw } from 'lucide-react';
import { transcribeAudio } from '../services/transcriptionService';
import { getTranscriptionLanguage } from '../utils/transcriptionLanguage';

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

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

export default function VoiceInputButton({ audioValue, onAudioChange, onTranscript }) {
  const [status, setStatus] = useState('idle'); // idle | recording | processing | transcribing
  const [elapsed, setElapsed] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  // Guards the async tail of onstop: the card can be swiped away while a
  // transcription is still in flight.
  const mountedRef = useRef(true);

  const supported = isRecordingSupported();
  const busy = status === 'processing' || status === 'transcribing';

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

  // A new recording invalidates the player's position and duration.
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [audioValue]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const startRecording = async () => {
    setErrorMessage(null);
    if (audioRef.current) audioRef.current.pause();
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
          const text = await transcribeAudio(blob, getTranscriptionLanguage());
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

  const togglePlayback = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => setErrorMessage('Lecture impossible.'));
    else el.pause();
  };

  // MediaRecorder blobs carry no duration header, so browsers report Infinity until
  // the element has seeked past the end. Force that seek, then rewind.
  const handleLoadedMetadata = () => {
    const el = audioRef.current;
    if (!el) return;
    if (Number.isFinite(el.duration)) {
      setDuration(el.duration);
      return;
    }
    const onTimeUpdate = () => {
      el.removeEventListener('timeupdate', onTimeUpdate);
      if (Number.isFinite(el.duration)) setDuration(el.duration);
      el.currentTime = 0;
    };
    el.addEventListener('timeupdate', onTimeUpdate);
    el.currentTime = 1e101;
  };

  const handleSeek = (event) => {
    const el = audioRef.current;
    const value = Number(event.target.value);
    if (el && Number.isFinite(value)) {
      el.currentTime = value;
      setCurrentTime(value);
    }
  };

  if (!supported) return null;

  // Every interactive element is sized for a thumb (>=44px) rather than a cursor:
  // on mobile the mic is the primary way into a card, not a secondary affordance.
  // A 4px native track is fine with a mouse and unusable with a thumb, so the input
  // keeps a tall touch area while the visible track stays thin.
  const scrubberClasses = `flex-1 min-w-0 h-11 bg-transparent appearance-none cursor-pointer
    touch-manipulation disabled:cursor-not-allowed
    [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full
    [&::-webkit-slider-runnable-track]:bg-journal-200
    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4
    [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:-mt-[5px]
    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-journal-500
    [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full
    [&::-moz-range-track]:bg-journal-200
    [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:border-0
    [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-journal-500`;

  const micButton = (
    <button
      type="button"
      onClick={startRecording}
      aria-label="Enregistrer un vocal"
      title="Enregistrer un vocal"
      className="flex items-center justify-center min-h-[44px] min-w-[44px]
        rounded-lg text-journal-500 hover:text-journal-900 hover:bg-journal-50
        active:scale-95 transition-all touch-manipulation"
    >
      <Mic size={18} />
    </button>
  );

  // Idle with nothing to show sits inline at the end of the toolbar, discreet like the
  // format buttons. Every other state — including an error worth reading — needs a full
  // row, claimed via basis-full since the toolbar is flex-wrap. Transcription language
  // lives in Settings: it is a set-once preference, not a per-recording decision.
  const compact = status === 'idle' && !audioValue && !errorMessage;

  return (
    <div className={compact
      ? 'ml-auto flex items-center'
      : 'basis-full w-full flex flex-col gap-1.5 mt-2'}>
      {status === 'idle' && !audioValue && (
        compact ? micButton : <div className="flex justify-end">{micButton}</div>
      )}

      {status === 'recording' && (
        <div className="w-full flex items-center gap-3 min-h-[48px] px-3 rounded-2xl
          bg-journal-accent/10 border border-journal-accent/30">
          <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full
              bg-journal-accent opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-journal-accent" />
          </span>
          <span className="text-sm font-semibold text-journal-900 tabular-nums shrink-0">
            {formatTime(elapsed)}
          </span>
          {/* Fills as the 60s cap approaches, so the limit is visible before it hits. */}
          <div className="flex-1 min-w-0 h-1.5 rounded-full bg-journal-accent/25 overflow-hidden">
            <div
              className="h-full bg-journal-accent transition-[width] duration-1000 ease-linear"
              style={{ width: `${(elapsed / MAX_RECORDING_SECONDS) * 100}%` }}
            />
          </div>
          <button
            type="button"
            onClick={stopRecording}
            aria-label="Arrêter l'enregistrement"
            className="shrink-0 flex items-center justify-center h-11 w-11 rounded-full
              bg-journal-accent text-white hover:opacity-90 active:scale-95 transition-all
              touch-manipulation"
          >
            <Square size={15} className="fill-current" />
          </button>
        </div>
      )}

      {busy && (
        <div className="w-full flex items-center gap-2.5 min-h-[48px] px-4 rounded-2xl
          bg-journal-100 border border-journal-200">
          <Loader2 size={17} className="animate-spin text-journal-500 shrink-0" />
          <span className="text-sm font-semibold text-journal-800">
            {status === 'processing' ? 'Enregistrement…' : 'Transcription…'}
          </span>
        </div>
      )}

      {status === 'idle' && audioValue && (
        <div className="w-full flex items-center gap-1.5 min-h-[48px] px-2 rounded-2xl
          bg-journal-100 border border-journal-200">
          <button
            type="button"
            onClick={togglePlayback}
            aria-label={isPlaying ? 'Mettre en pause' : 'Écouter'}
            className="shrink-0 flex items-center justify-center h-11 w-11 rounded-full
              bg-journal-500 text-white hover:bg-journal-800 active:scale-95
              transition-all touch-manipulation"
          >
            {isPlaying
              ? <Pause size={15} className="fill-current" />
              : <Play size={15} className="fill-current translate-x-[1px]" />}
          </button>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            onChange={handleSeek}
            disabled={!duration}
            aria-label="Position de lecture"
            className={scrubberClasses}
          />
          <span className="shrink-0 text-xs font-semibold text-journal-800 tabular-nums">
            {formatTime(currentTime)}&nbsp;/&nbsp;{formatTime(duration)}
          </span>
          {/* Re-recording replaces the take; there is deliberately no delete action. */}
          <button
            type="button"
            onClick={startRecording}
            aria-label="Réenregistrer"
            title="Réenregistrer"
            className="shrink-0 flex items-center justify-center h-11 w-11 rounded-full
              text-journal-500 hover:text-journal-900 hover:bg-journal-200
              active:scale-95 transition-all touch-manipulation"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      )}

      {audioValue && (
        <audio
          ref={audioRef}
          src={audioValue}
          preload="metadata"
          className="hidden"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={(event) => setCurrentTime(event.target.currentTime)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => { setIsPlaying(false); setCurrentTime(0); }}
        />
      )}

      {errorMessage && (
        <span className="text-xs text-journal-accent leading-snug px-1">{errorMessage}</span>
      )}
    </div>
  );
}
