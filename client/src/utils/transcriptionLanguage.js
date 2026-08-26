// Kept in sync with SUPPORTED_LANGUAGES in server/src/routes/transcribe.ts.
// 'auto' is offered but never the default: whisper detects from the first 30s
// window only, and code-switching (French notes peppered with English tech terms)
// flips it easily.
export const TRANSCRIPTION_LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'it', label: 'Italiano' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'auto', label: 'Detect automatically' },
];

const STORAGE_KEY = 'journal.transcription.language';

// Read at record time rather than cached in component state, so changing the
// preference in Settings takes effect on the next recording without any plumbing
// between the modal and the cards.
export function getTranscriptionLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && TRANSCRIPTION_LANGUAGES.some((entry) => entry.code === stored)) return stored;
  } catch {
    // Storage throws in private mode; fall through to the browser default.
  }
  const browser = (navigator.language || '').slice(0, 2).toLowerCase();
  return TRANSCRIPTION_LANGUAGES.some((entry) => entry.code === browser) ? browser : 'fr';
}

export function setTranscriptionLanguage(code) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Preference just won't persist; not worth surfacing.
  }
}
