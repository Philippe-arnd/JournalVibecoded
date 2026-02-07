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

### Infrastructure
- **Containerization**: Docker Compose
- **Deployment**: Coolify (Self-hosted on VPS)
- **Environment**: Multi-application VPS environment sharing host resources

---

## 🛠 Development & Local Testing

### Local Setup
The application must be launched via Docker Compose to ensure environment parity:
```bash
docker-compose up -d --build
```

### Critical Constraints
1.  **Port Mapping**: Internally, services use standard ports (`3000` for API, `5432` for DB). **Do not use fixed host port mapping** that could conflict with other applications on the production VPS or Coolify's internal routing.
2.  **Origin Consistency**: Always access the application via `http://localhost:5173`. Accessing via `127.0.0.1` will cause session cookie mismatches between the client and the `baseURL` configured in Better Auth.
3.  **Automated Seeding**: A test user is automatically created and verified on every server startup via the `seed:user` script triggered in the `Dockerfile`.

---

## 💎 Quality & Performance Standards

### Code Quality
- **Linting**: All frontend code must pass `npm run lint` (ESLint).
- **Type Checking**: Server-side logic must adhere to TypeScript standards defined in `tsconfig.json`.
- **Modularity**: Logic should be separated into Services (data), Hooks (state), and Views (UI).

### Performance
- **Build Optimization**: Vite build should target modern browsers with appropriate chunk splitting for large libraries.
- **Docker Efficiency**: Use multi-stage builds (`alpine` images) to minimize production footprint.
- **Health Checks**: Every service in `docker-compose.yml` must have a functional health check (`curl` or `pg_isready`).

### Security
- **Data Privacy**: Sensitive journal fields (professional recap, personal recap, learning, gratitude) must be encrypted before being stored in the database.
- **Auth**: Enforce email verification for all accounts.

---

## 📜 Workflow & Commit Convention

### Commit Messages
To maintain a clear project history, **every commit message must include a changelog** detailing the specific changes made.

**Format:**
```
Short descriptive summary of the change

- Bullet point 1: What was changed and why.
- Bullet point 2: Implementation detail.
- Bullet point 3: Verification step performed.
```

### Agent Mandate
When modifying the codebase, the agent must proactively:
1.  Check for linting errors.
2.  Verify the impact on the Docker deployment.
3.  Ensure environment variables are updated in `.env.example`.