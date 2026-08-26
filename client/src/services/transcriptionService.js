const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Maps the API's failure modes to something the user can act on. The audio is
// always kept locally, so every message says so.
const ERROR_BY_STATUS = {
  401: "Session expirée, reconnecte-toi pour transcrire. L'audio a été conservé.",
  413: "Enregistrement trop volumineux pour être transcrit. L'audio a été conservé.",
  429: "Trop de transcriptions demandées, réessaie dans une minute. L'audio a été conservé.",
  504: "La transcription a pris trop de temps. L'audio a été conservé.",
};

export async function transcribeAudio(blob) {
  const response = await fetch(`${VITE_API_URL}/api/transcribe`, {
    method: 'POST',
    // Raw audio body rather than multipart: no base64 inflation, no extra
    // dependency server-side. The server reads the codec from this header.
    headers: { 'Content-Type': blob.type || 'audio/webm' },
    body: blob,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(
      ERROR_BY_STATUS[response.status]
        || "La transcription est indisponible pour le moment. L'audio a été conservé."
    );
  }

  const { text } = await response.json();
  return (text || '').trim();
}
