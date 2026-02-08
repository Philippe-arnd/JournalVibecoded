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
1.  **Port Mapping**: **Never use fixed host port mappings** (e.g., `3000:3000`) in `docker-compose.yml`. Coolify manages routing internally. For local development, use `docker-compose.override.yml` (git-ignored) to map ports.
2.  **HTTPS Enforcement**: All FQDNs in Coolify must start with `https://`. Better Auth requires HTTPS to set secure session cookies.
3.  **Proxy Trust**: The Express server is configured with `app.set('trust proxy', true)` to correctly detect HTTPS behind Coolify's reverse proxy.
4.  **Service Worker**: The `sw.js` is configured to **bypass all `/api` routes**. Intercepting API calls can break authentication, especially during SSL certificate updates or origin mismatches.

---

## 🧪 Testing & Validation

The project uses a multi-layered testing strategy to prevent regressions.

### 1. Infrastructure Validation
A custom script (`scripts/validate-deployment.ts`) ensures deployment standards are met:
- Verifies `docker-compose.yml` has no fixed ports.
- Checks that `docker-compose.override.yml` exists and is git-ignored.
- Validates that the Service Worker correctly bypasses `/api`.
- Ensures `.env.example` keys are consistent.

### 2. API & Auth Testing (Server)
- **Framework**: Vitest + Supertest.
- **Scope**: Verifies route protection (401 Unauthorized), health checks, and API integrity.
- **Location**: `server/src/__tests__/`.

### 3. Execution
All tests can be run from the root directory:
```bash
npm run test:all # Runs infra validation + server tests
```

---

## 🛠 Local Testing & Development

### Local Setup
Run via Docker Compose for environment parity. Ensure `docker-compose.override.yml` is present for port mapping (5173 for client, 3000 for server):
```bash
docker-compose up -d --build
```

### Constraints
- **Origin Consistency**: Always use `http://localhost:5173`. Avoid `127.0.0.1` to prevent cookie/origin mismatch errors with Better Auth.
- **Automated Seeding**: The `seed:user` script runs automatically on container start. It **deletes and recreates** the test user to ensure credentials always match the `.env` variables.

---

## 💎 Quality & Performance Standards

### Code Quality
- **Linting**: Must pass `npm run lint`. ESLint is configured to allow `motion` prefixes and handle Service Worker globals.
- **Testing**: All changes must pass `npm run test:all` before being merged.
- **Type Checking**: Server-side logic must adhere to TypeScript standards.
- **Seeding Robustness**: The `seed:user` script is idempotent and error-tolerant.

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
1.  Proactively check for linting errors (`npm run lint:client`).
2.  Run full test suite (`npm run test:all`) before proposing major changes.
3.  Verify Docker deployment impact and `docker-compose.yml` compliance.
4.  Ensure `.env.example` remains updated.
5.  Maintain `app.set('trust proxy', true)` and `sw.js` API bypass.
