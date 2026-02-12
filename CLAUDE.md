# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Journal App** - A full-stack personal journaling application using the B-MAD methodology. The app features a guided 4-section entry flow (Professional, Personal, Learning, Gratitude) with AI-powered coaching and pattern recognition. Built with React 19, Node.js/Express, PostgreSQL, and Anthropic Claude API.

**B-MAD Artifacts**: All planning, architecture, and design documents are in `_bmad-output/` directory.

## Repository Structure

```
.
├── client/              # React 19 frontend (Vite + Tailwind)
├── server/              # Node.js backend (Express + Better Auth + Drizzle ORM)
├── scripts/             # Infrastructure validation (Deployment scripts)
├── _bmad-output/        # B-MAD artifacts (PRD, Architecture, UX Design, Epics)
├── docker-compose.yml   # Local development environment
└── package.json         # Root workspace configuration
```

## Common Commands

### Root Level
```bash
npm install                    # Install all dependencies (client + server + root)
npm run test:all              # Run all tests (infrastructure + server)
npm run test:server           # Run server tests only
npm run test:infra            # Run infrastructure validation script
npm run lint:client           # Lint client code
```

### Client (`client/`)
```bash
npm run dev                   # Start Vite dev server (http://localhost:5173)
npm run build                 # Build for production
npm run preview              # Preview production build locally
npm run lint                 # Run ESLint
```

### Server (`server/`)
```bash
npm run dev                  # Start Express dev server with tsx watch
npm run build                # Compile TypeScript to dist/
npm start                    # Run compiled server
npm test                     # Run Vitest test suite
npm run db:migrate           # Run Drizzle migrations
npm run db:rls               # Apply Row-Level Security policies to database
npm run db:generate          # Generate migration files from schema changes
npm run seed:user            # Create test user in database
npm run test:rls             # Test RLS policies
```

### Docker
```bash
docker-compose up -d --build     # Start full stack (server + client + postgres)
docker-compose down              # Stop all services
docker-compose logs -f           # View logs from all services
```

## Setup Instructions

1. **Install dependencies**: `npm install` (installs client, server, and root deps)

2. **Configure environment variables**: Create `.env` in root directory:
   ```
   DATABASE_URL=postgresql://app_user:password@localhost:5432/journal
   DATABASE_ADMIN_URL=postgresql://postgres:password@localhost:5432/journal
   BETTER_AUTH_SECRET=your-secret-key
   ANTHROPIC_API_KEY=your-api-key
   ```

3. **Start Docker environment**: `docker-compose up -d --build`
   - PostgreSQL runs on localhost:5432
   - Server runs on localhost:3000
   - Client dev server runs on localhost:5173

4. **Apply database migrations and RLS**:
   ```bash
   npm run --prefix server db:migrate
   npm run --prefix server db:rls
   ```

5. **Seed test data** (optional): `npm run --prefix server seed:user`

6. **Access the app**: Visit http://localhost:5173

## Architecture

### Application Flow
1. **Frontend** - React router in `client/src/App.jsx` manages: LoginView → HomeView ↔ EntryCreationView
2. **Backend** - Express server with Better Auth and RLS-protected database queries
3. **Database** - PostgreSQL with Row-Level Security policies enforcing data isolation

### Key Patterns

**Frontend Architecture**
- **React Context** for auth state (useAuth hook from AuthContext)
- **View-based components** for full-page flows (LoginView, HomeView, EntryCreationView)
- **Service layer** in `src/services/` abstracts all API calls to backend
- **Card-stack UI** for 4-section entry creation with Framer Motion animations

**Backend Architecture**
- **Better Auth** for authentication (email/password signup/signin)
- **Drizzle ORM** for type-safe database queries
- **Row-Level Security (RLS)** on PostgreSQL tables enforces user data isolation
- **Express middleware** for CORS, error handling, and auth verification

**Database Design**
- **user_profiles** - User metadata (streaks, entry count, onboarding status)
- **entries** - Journal entries with 4 text sections + metadata
  - Unique constraint on `(user_id, entry_date)` - one entry per day max
  - Auto-saves use upsert pattern via `saveEntry()` service
  - RLS policies: Users can only read/write their own entries

### Database Schema

**Key Tables:**
- `user_profiles` - User metadata and tracking
- `entries` - Journal entries with 4 sections (professional_recap, personal_recap, learning_reflections, gratitude)
- `sessions` - Better Auth session management
- `accounts` - Better Auth account linking

**Critical Fields on entries:**
- `entry_date` (DATE) - ISO format `YYYY-MM-DD`, defaults to TODAY()
- `completed` (BOOLEAN) - True when all 4 sections filled
- `created_at`, `updated_at` (TIMESTAMP) - Auto-managed by database
- `user_id` (UUID) - Foreign key, enforced by RLS

### Client Services Layer

**authService.js**
- `signUp(email, password)` - Create new user account
- `signIn(email, password)` - Authenticate user
- `signOut()` - Clear session
- `getCurrentUser()` - Fetch authenticated user

**entryService.js**
- `getEntries()` - Fetch all entries for current user (ordered by date desc)
- `getTodayEntry()` - Get or check for today's entry
- `saveEntry(entryData)` - Upsert entry (creates or updates based on entry_date)
- `deleteEntry(id)` - Delete entry by ID

### Server API Endpoints

**Authentication** (Better Auth)
- `POST /api/auth/sign-up` - Create account
- `POST /api/auth/sign-in` - Login
- `POST /api/auth/sign-out` - Logout

**Entry Operations** (RLS-protected)
- `GET /api/entries` - List user's entries
- `GET /api/entries/:id` - Get specific entry
- `POST /api/entries` - Create or update entry (upsert)
- `DELETE /api/entries/:id` - Delete entry

## Development Guidelines

### Creating Features

1. **Database changes**:
   - Modify schema in `server/src/db/schema.ts`
   - Run `npm run --prefix server db:generate` to create migration
   - Run `npm run --prefix server db:migrate` to apply
   - If new tables: Add RLS policies in `server/src/scripts/apply-rls-prod.ts`

2. **Backend changes**:
   - Add endpoints to `server/src/server.ts` or create new route files
   - Wrap queries with `RLS()` helper to include `user_id` context
   - Test with RLS policies enabled: `npm run --prefix server test:rls`

3. **Frontend changes**:
   - Add service functions in `client/src/services/` first
   - Create components in `client/src/components/` or `views/`
   - Use `useAuth()` hook to access current user
   - Import services and call them from components

### Date Handling

Always use ISO date format `YYYY-MM-DD` for `entry_date`:
```javascript
const today = new Date().toISOString().split('T')[0];
```

### Auto-Save Pattern

Entry creation uses optimistic auto-save:
- Save triggers on section navigation (not on every keystroke)
- Uses `entryService.saveEntry()` with upsert logic
- Shows loading spinner during save
- No explicit "Save" button needed

### RLS (Row-Level Security) Policy

All user data is protected by RLS:
- Tables have `user_id` column with foreign key to `user` table
- `ENABLE RLS` on all user-owned tables
- Policies: Users SELECT/UPDATE/DELETE only rows where `user_id = auth.uid()`
- Admin account (DATABASE_ADMIN_URL) bypasses RLS for migrations
- Test RLS: `npm run --prefix server test:rls`

### Testing

**Multi-layered Testing Strategy**:

```bash
npm run test:all              # Run infrastructure validation + server tests
npm run test:infra            # Infrastructure validation (validates deployment standards)
npm run --prefix server test  # Run Vitest suite (server only)
npm run --prefix server test:rls  # Test Row-Level Security policies
```

**Infrastructure Validation** (`scripts/validate-deployment.ts`):
- Verifies `docker-compose.yml` has no fixed host ports
- Checks that `docker-compose.override.yml` exists and is git-ignored
- Validates Service Worker correctly bypasses `/api` routes
- Ensures `.env.example` keys are consistent

**Server Testing** (Vitest + Supertest):
- Scope: Route protection (401 Unauthorized), health checks, API integrity
- Location: `server/src/__tests__/`
- Framework: Vitest + Supertest for HTTP testing

All tests must pass before merging to main.

### Security & Performance Testing

**Automated Security & Performance Workflow** (`.github/workflows/security-performance.yml`):

The repository includes a fast, parallel security and performance checking workflow that runs on every PR. Total execution time: **60-75 seconds**.

**Workflow Jobs** (run in parallel):

1. **🔍 Secret Detection (Gitleaks)** - 5-10s
   - Scans git history for exposed API keys, passwords, and credentials
   - Blocks PR on failure
   - Configuration: `.gitleaksignore`

2. **🛡️ SAST Security Scan (Semgrep)** - 20-30s
   - Static Application Security Testing for vulnerabilities
   - Scans TypeScript/JavaScript/React/Node.js code
   - Blocks PR on high/critical severity issues
   - Configuration: `.semgrep.yml` (custom rules), `.semgrepignore`

3. **📦 Bundle Size Analysis** - 60-75s
   - Monitors client bundle size for performance regressions
   - Warns on >10% increase (does not block)
   - Baselines: JS: 543 KB, CSS: 43 KB (uncompressed)

**Local Testing Commands**:

```bash
# Test secret detection locally
docker run -v $(pwd):/path zricethezav/gitleaks:latest detect --source=/path

# Test SAST security scanning locally
docker run --rm -v $(pwd):/src semgrep/semgrep semgrep --config=auto /src

# Check bundle size locally
cd client && npm run build
find dist/assets -name "*.js" -exec du -ch {} + | grep total
find dist/assets -name "*.css" -exec du -ch {} + | grep total
```

**Custom Security Rules** (`.semgrep.yml`):
- Weak encryption key detection
- RLS bypass risk detection (direct DB queries without RLS() wrapper)
- Missing authentication middleware
- Hardcoded secrets
- Insecure cookie configuration
- SQL injection risks
- XSS vulnerabilities
- Missing input validation
- Insecure random generation
- Unencrypted sensitive data storage

**Workflow Behavior**:
- **Blocks PRs** on: Exposed secrets, critical security vulnerabilities
- **Warns (doesn't block)** on: Bundle size >10% increase, low-severity findings
- Results posted as consolidated PR comment
- Updates existing comment on subsequent pushes

**Updating Bundle Size Baselines**:

If bundle size legitimately increases (e.g., new dependencies):
1. Document reason in PR description
2. Update baselines in workflow file: `.github/workflows/security-performance.yml`
3. Search for `JS_BASELINE` and `CSS_BASELINE` variables
4. Adjust values to new baseline (uncompressed KB)

**Branch Protection**:

The following checks are required before merging to main:
- ✅ 🔍 Secret Detection (required)
- ✅ 🛡️ SAST Security Scan (required)
- 📦 Bundle Size Analysis (optional, warn-only)

### Styling System

**Frontend Styling** (Tailwind CSS 4.0)
- Custom color palette: `journal-50`, `journal-200`, `journal-500`, `journal-900`, `journal-accent`
- Fonts: Inter (body), Fraunces (headings)
- Framer Motion for animations (card stack transitions, swipe gestures)

### Environment Variables

**Root `.env`**:
```
DATABASE_URL=postgresql://app_user:password@localhost:5432/journal
DATABASE_ADMIN_URL=postgresql://postgres:password@localhost:5432/journal
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
ANTHROPIC_API_KEY=sk-...
RESEND_API_KEY=re_...
```

**Client `.env.local`** (for direct client testing):
```
VITE_API_URL=http://localhost:3000/api
```

**Important**: Always use `http://localhost:5173` (not `127.0.0.1`) for local development to avoid cookie/origin mismatch errors with Better Auth.

## Build Tools

- **Frontend**: Vite with @vitejs/plugin-react (using rolldown-vite for faster builds)
- **Backend**: TypeScript compiled to CommonJS
- **Database**: Drizzle ORM with PostgreSQL driver
- **Auth**: Better Auth (self-hosted, not Supabase in current version)
- **Encryption**: CryptoJS (AES-256) for journal entries at rest
- **Email**: Resend for verification and password resets

## Deployment

**Production Environment**: Self-hosted VPS using Coolify with automatic GitHub webhook integration.

**Domain Strategy**:
- **Production**:
  - Client: `https://journal.philapps.com`
  - API: `https://api.journal.philapps.com`
- **Preview (PR-based)**:
  - Template: `https://{{pr_id}}.journal.philapps.com`
  - API Template: `https://api-{{pr_id}}.journal.philapps.com`
  - Requires wildcard DNS (`*.journal`) pointing to VPS IP

**Critical Deployment Rules**:
1. **Port Mapping**: Never use fixed host port mappings (e.g., `3000:3000`) in `docker-compose.yml`. Coolify manages routing internally. Use `docker-compose.override.yml` (git-ignored) for local development only.
2. **HTTPS Enforcement**: All FQDNs in Coolify must start with `https://`. Better Auth requires HTTPS for secure session cookies.
3. **Proxy Trust**: Express is configured with `app.set('trust proxy', true)` to correctly detect HTTPS behind Coolify's reverse proxy.
4. **Service Worker**: `sw.js` bypasses all `/api` routes. Intercepting API calls breaks authentication, especially during SSL certificate updates.

**Deployment Workflow**:
- Push to `main` branch triggers GitHub webhook
- Webhook automatically deploys to VPS via Coolify
- Coolify handles containerization, build, and service restart
- Environment variables on VPS managed through Coolify dashboard

**Before Merging to Main**:
- Ensure all tests pass: `npm run test:all`
- Run infrastructure validation: `npm run test:infra` (validates docker-compose.yml compliance)
- Test RLS policies: `npm run --prefix server test:rls`
- Code is automatically deployed to production on merge

## Code Quality Standards

- **Linting**: Must pass `npm run lint`. ESLint is configured to allow `motion` prefixes and handle Service Worker globals.
- **Testing**: All changes must pass `npm run test:all` before being merged.
- **Type Checking**: Server-side logic must adhere to TypeScript strict mode.
- **Commit Messages**: Every commit must include a short descriptive summary with bullet-point changelog explaining the "What/Why".

## Development Agent Mandate

Before proposing changes or merging code:
1. Proactively check for linting errors: `npm run lint:client`
2. Run full test suite: `npm run test:all`
3. Run local security checks if modifying sensitive areas (auth, encryption, database):
   - Secret detection: `docker run -v $(pwd):/path zricethezav/gitleaks:latest detect --source=/path`
   - SAST scan: `docker run --rm -v $(pwd):/src semgrep/semgrep semgrep --config=auto /src`
4. Verify Docker deployment impact and `docker-compose.yml` compliance
5. Ensure `.env.example` remains updated with any new variables
6. Maintain `app.set('trust proxy', true)` and Service Worker API bypass in any infrastructure changes
7. Check bundle size impact if adding new client dependencies: `cd client && npm run build`

## Important Notes

- **One entry per day**: Database constraint prevents duplicate entries for same user/date
- **RLS is enforced**: Without proper RLS, authentication is worthless; always verify RLS policies are applied
- **Docker is recommended**: Local setup is complex; use Docker for consistent environment with automatic seeding
- **Admin URL for migrations**: `DATABASE_ADMIN_URL` (superuser) needed for schema changes; `DATABASE_URL` (restricted) used by app
- **B-MAD artifacts**: Before making major changes, review the PRD and Architecture in `_bmad-output/planning-artifacts/`
- **Production is automatic**: Merging to main automatically deploys; always test thoroughly before pushing
- **Never modify docker-compose.yml port mappings**: Port mappings break Coolify routing. Use `docker-compose.override.yml` for local development only
- **Origin consistency matters**: Use `http://localhost:5173` to avoid Better Auth cookie/origin issues
- **Seeding is automatic**: The `seed:user` script runs on container start, recreating the test user for consistent credentials
