import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, Square, Loader2, Play, Pause, RotateCcw, ChevronDown } from 'lucide-react';
import { transcribeAudio } from '../services/transcriptionService';

// Recording is capped at 60s client-side to keep audio payloads small
// (stored as encrypted base64 alongside the entry text, see entryService.js)
// and to bound the work handed to the transcription service.
const MAX_RECORDING_SECONDS = 60;
const AUDIO_MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];

// Kept in sync with SUPPORTED_LANGUAGES in server/src/routes/transcribe.ts.
// 'auto' is offered but never the default: whisper detects from the first 30s
// window only, and code-switching (French notes peppered with English tech terms)
// flips it easily.
const LANGUAGES = [
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'it', label: 'Italiano', short: 'IT' },
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'de', label: 'Deutsch', short: 'DE' },
  { code: 'auto', label: 'Détection auto', short: 'AUTO' },
];
const LANGUAGE_STORAGE_KEY = 'journal.transcription.language';

const isRecordingSupported = () =>
  typeof window !== 'undefined' &&
  !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) &&
  typeof window.MediaRecorder !== 'undefined';

function resolveInitialLanguage() {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && LANGUAGES.some((entry) => entry.code === stored)) return stored;
  } catch {
    // Storage can throw in private mode; fall through to the browser default.
  }
  const browser = (navigator.language || '').slice(0, 2).toLowerCase();
  return LANGUAGES.some((entry) => entry.code === browser) ? browser : 'fr';
}

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
  const [language, setLanguage] = useState(resolveInitialLanguage);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const languageRef = useRef(language);
  // Guards the async tail of onstop: the card can be swiped away while a
  // transcription is still in flight.
  const mountedRef = useRef(true);

  const supported = isRecordingSupported();
  const busy = status === 'processing' || status === 'transcribing';

  useEffect(() => {
    languageRef.current = language;
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Preference just won't persist; not worth surfacing.
    }
  }, [language]);

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
          const text = await transcribeAudio(blob, languageRef.current);
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
  const languageRow = (
    <div className="flex items-center justify-end gap-2">
      <span className="text-xs text-journal-800">Langue</span>
      <div className="relative shrink-0">
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          aria-label="Langue de transcription"
          // text-base (16px) is deliberate: Safari iOS auto-zooms the page when a
          // form control smaller than that takes focus.
          className="appearance-none bg-journal-100 text-journal-800 text-base font-semibold
            rounded-full pl-4 pr-9 min-h-[44px] border border-journal-200 cursor-pointer
            hover:border-journal-500 focus:outline-none focus:ring-2 focus:ring-journal-500/40
            transition-colors touch-manipulation"
        >
          {LANGUAGES.map((entry) => (
            <option key={entry.code} value={entry.code}>{entry.short}</option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-journal-500 pointer-events-none"
        />
      </div>
    </div>
  );

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

  return (
    <div className="w-full flex flex-col gap-2">
      {status === 'idle' && !audioValue && (
        <button
          type="button"
          onClick={startRecording}
          className="w-full flex items-center justify-center gap-2 min-h-[48px] px-4
            rounded-2xl bg-journal-500 text-white text-sm font-semibold shadow-sm
            hover:bg-journal-800 active:scale-[0.98] transition-all touch-manipulation"
        >
          <Mic size={18} />
          Enregistrer un vocal
        </button>
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
        <>
          <div className="w-full flex items-center gap-2 min-h-[48px] px-2 rounded-2xl
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
            <span className="shrink-0 pr-1 text-xs font-semibold text-journal-800 tabular-nums">
              {formatTime(currentTime)}&nbsp;/&nbsp;{formatTime(duration)}
            </span>
          </div>

          {/* Re-recording replaces the take; there is deliberately no delete action. */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center gap-2 min-h-[44px] px-3 rounded-full
                text-sm font-semibold text-journal-500 hover:text-journal-900
                hover:bg-journal-100 active:scale-95 transition-all touch-manipulation"
            >
              <RotateCcw size={16} />
              Réenregistrer
            </button>
            {languageRow}
          </div>
        </>
      )}

      {status === 'idle' && !audioValue && languageRow}

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
        <span className="text-xs text-journal-accent leading-snug">{errorMessage}</span>
      )}
    </div>
  );
}
