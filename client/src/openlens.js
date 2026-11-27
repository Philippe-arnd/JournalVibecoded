// OpenLens product analytics (https://openlens.philapps.com): which features
// are used, by whom, and what makes users come back. Wired per OpenLens's
// docs/agents/wire.md.
// Config is baked in at build time (see Dockerfile): VITE_OPENLENS_HOST and
// VITE_OPENLENS_KEY (a public, write-only capture key). Without them this is a
// no-op (dev, tests, forks).
// Privacy: the whole app is under data-openlens-mask (index.html), because
// Journal renders DECRYPTED entries: replays show no text, clicks send no text.
// Input values are never captured by the SDK.
/* global __APP_RELEASE__ */
const env = import.meta.env
const host = (env.VITE_OPENLENS_HOST || '').replace(/\/$/, '')
const key = env.VITE_OPENLENS_KEY
let pending = []

// The API lives on another origin (VITE_API_URL): listing it lets the SDK add
// the x-openlens-session header to API calls, so a server error links to the
// session and its replay. The server's CORS allows that header.
function apiOrigins() {
  try {
    return env.VITE_API_URL ? [new URL(env.VITE_API_URL, window.location.origin).origin] : []
  } catch {
    return []
  }
}

export function initOpenLens() {
  if (!host || !key || document.getElementById('openlens-sdk')) return
  const s = document.createElement('script')
  s.id = 'openlens-sdk'
  s.src = `${host}/c.js`
  s.async = true
  // No data-key: c.js then waits for this init, which adds traceOrigins.
  s.onload = () => {
    window.openlens.init({ host, key, release: __APP_RELEASE__, traceOrigins: apiOrigins() })
    const calls = pending
    pending = []
    calls.forEach((f) => f(window.openlens))
  }
  document.head.appendChild(s)
}

function withLens(f) {
  if (!host || !key) return
  if (window.openlens) f(window.openlens)
  else pending.push(f)
}

// Journal has no user roles: every account is a plain user, so the role is a
// constant. If roles are ever added, send the real field here and map it in
// openlens.features.yaml.
export const lensIdentify = (user) => user && withLens((o) => o.identify(user.id, { role: 'user' }))
export const lensReset = () => withLens((o) => o.reset())
export const lensTrack = (event, props) => withLens((o) => o.track(event, props))
