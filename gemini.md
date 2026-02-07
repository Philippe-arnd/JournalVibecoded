# ♊ Journal App - Gemini CLI Context

This document serves as the primary context for the Gemini CLI agent, defining the technical architecture, development standards, and operational procedures for the Journal application.

## 🚀 Tech Stack

### Frontend (client/)
- **Framework**: React 19 (JavaScript/JSX)
- **Build Tool**: Vite (Rolldown-powered)
- **Styling**: Tailwind CSS 4.0, Framer Motion for animations
- **Auth Client**: Better Auth (React plugin)
- **Encryption**: CryptoJS (AES-256) for journal entries

### Backend (server/)
- **Runtime**: Node.js (Express)
- **Language**: TypeScript (TSX for execution)
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL 17 (Alpine)
- **Authentication**: Better Auth (Drizzle adapter)
- **Email**: Resend (for verification and password resets)

---

## 🛠 Infrastructure & Deployment (Coolify)

The application is deployed on a self-hosted VPS using Coolify, sharing resources with other applications.

### 🌐 Domain Strategy
- **Production**:
    - Client: `https://journal.philapps.com`
    - API: `https://api.journal.philapps.com`
- **Preview (PR-based)**:
    - Template: `https://{{pr_id}}.journal.philapps.com`
    - API Template: `https://api-{{pr_id}}.journal.philapps.com`
    - *Requires Wildcard DNS (`*.journal`) pointing to the VPS IP.*

### ⚠️ Critical Deployment Rules
1.  **Port Mapping**: **Never use fixed host port mappings** (e.g., `3000:3000`) in `docker-compose.yml`. Coolify manages routing internally. Using fixed ports will cause `port already allocated` errors on the shared VPS.
2.  **HTTPS Enforcement**: All FQDNs in Coolify must start with `https://`. Better Auth requires HTTPS to set secure session cookies.
3.  **Proxy Trust**: The Express server is configured with `app.set('trust proxy', true)` to correctly detect HTTPS behind Coolify's reverse proxy.
4.  **Service Worker**: The `sw.js` is configured to **bypass all `/api` routes**. Intercepting API calls can break authentication, especially during SSL certificate updates or origin mismatches.

### 🔑 Environment Variables Management
Variables must be set in the Coolify UI (Production and Preview tabs).

| Variable | Requirement | Purpose |
| :--- | :--- | :--- |
| `VITE_API_URL` | **Build Variable** | Essential for Vite to bake the correct API endpoint into static assets. |
| `VITE_ENCRYPTION_KEY`| **Build Variable** | Required for client-side encryption logic. |
| `BETTER_AUTH_URL` | Runtime Variable | Must match the API domain exactly. |
| `CLIENT_URL` | Runtime Variable | Used for CORS and trusted origins in `auth.ts`. |

---

## 🛠 Local Testing & Development

### Local Setup
Run via Docker Compose for environment parity:
```bash
docker-compose up -d --build
```

### Constraints
- **Origin Consistency**: Always use `http://localhost:5173`. Avoid `127.0.0.1` to prevent cookie/origin mismatch errors with Better Auth.
- **Automated Seeding**: The `seed:user` script runs automatically on container start. It **deletes and recreates** the test user (`test@philapps.com`) to ensure credentials always match the `.env` variables.

---

## 💎 Quality & Performance Standards

### Code Quality
- **Linting**: Must pass `npm run lint`. ESLint is configured to allow `motion` prefixes and handle Service Worker globals.
- **Type Checking**: Server-side logic must adhere to TypeScript standards.
- **Seeding Robustness**: The `seed:user` script is idempotent and error-tolerant; it will not block server startup if external services (like Resend) are unavailable.

---

## 📜 Workflow & Commit Convention

### Commit Messages
Every commit must include a bullet-point changelog.

**Format:**
```
Short descriptive summary

- Bullet point 1: What/Why.
- Bullet point 2: Implementation detail.
- Bullet point 3: Verification step.
```

### Agent Mandate
1.  Proactively check for linting errors.
2.  Verify Docker deployment impact.
3.  Ensure `.env.example` remains updated.
4.  Maintain `app.set('trust proxy', true)` and `sw.js` API bypass.
