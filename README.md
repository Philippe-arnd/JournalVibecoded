# <img src="client/public/favicon.svg" width="40" height="40" alt="Journal Logo" style="vertical-align: bottom;" /> Journal App (Vibe Coding Project)

[![PR Validation](https://github.com/Philippe-arnd/JournalVibecoded/actions/workflows/pr-validation.yml/badge.svg)](https://github.com/Philippe-arnd/JournalVibecoded/actions/workflows/pr-validation.yml)
[![Docker Validation](https://github.com/Philippe-arnd/JournalVibecoded/actions/workflows/docker-validation.yml/badge.svg)](https://github.com/Philippe-arnd/JournalVibecoded/actions/workflows/docker-validation.yml)
[![Dependency Review](https://github.com/Philippe-arnd/JournalVibecoded/actions/workflows/dependency-review.yml/badge.svg)](https://github.com/Philippe-arnd/JournalVibecoded/actions/workflows/dependency-review.yml)

A personal journaling application built using the B-MAD method, designed to make daily reflection an effortless habit through a guided 4-section flow and AI-powered coaching.

## 🏗 Method: B-MAD

This project follows the **B-MAD** (Brainstorming, Model, Architecting, Developing) methodology. All artifacts are stored in the `_bmad-output/` directory.

-   **B**rainstorming:
    -   [Brainstorming Session](_bmad-output/analysis/brainstorming-session-2026-01-14.md) - *Analysis of PWA-based journaling with guided flow.*
-   **M**odel:
    -   [Product Brief](_bmad-output/planning-artifacts/product-brief-dev-2026-01-14.md) - *Core vision, user personas, and success metrics.*
    -   [Product Requirements Document (PRD)](_bmad-output/planning-artifacts/prd.md) - *Detailed product requirements.*
-   **A**rchitecting:
    -   [Architecture](_bmad-output/planning-artifacts/architecture.md) - *Technical stack, database schema, and component hierarchy.*
    -   [UX Design Specification](_bmad-output/planning-artifacts/ux-design-specification.md) - *Design system, user journeys, and interaction patterns.*
    -   [Epics & Stories](_bmad-output/planning-artifacts/epics.md) - *Breakdown of implementation tasks.*
-   **D**eveloping:
    -   [Sprint Status](_bmad-output/implementation-artifacts/sprint-status.yaml) - *Current tracking of implementation progress.*
    -   **Current Phase**: Implementation (Full-stack Integration). Source code in `client/` and `server/`.

## 📂 Project Artifacts

The `_bmad-output/` folder contains comprehensive documentation for the project:

-   `analysis/`: Initial brainstorming and research.
-   `planning-artifacts/`: PRD, Architecture, UX Specs, and Diagrams (Excalidraw).
-   `implementation-artifacts/`: Prototype stories and sprint status.

## 🚀 Tech Stack

-   **Frontend**: React 19, Vite, Tailwind CSS 4.0, Framer Motion
-   **Backend**: Node.js (Express), Better Auth, Drizzle ORM
-   **Database**: PostgreSQL 17
-   **AI**: Anthropic Claude API
-   **Tools**: Docker, Vitest, VS Code

## 🛠 Setup



To run the application locally:



1.  Clone the repo.

2.  Install root dependencies:

    ```bash

    npm install

    ```

3.  Configure your `.env` file (see `.env.example`). **Important**: Use two database variables:

    -   `DATABASE_URL`: For the restricted application user (subject to RLS).

    -   `DATABASE_ADMIN_URL`: For the superuser (migrations and admin tasks).

4.  Create a `docker-compose.override.yml` for local port mapping:

    ```yaml

    services:

      server:

        ports: ["3000:3000"]

      client:

        ports: ["5173:80"]

    ```

5.  Launch the environment:

    ```bash

    docker-compose up -d --build

    ```

6.  Apply RLS policies and migrations:

    ```bash

    npm run --prefix server db:migrate

    npm run --prefix server db:rls

    ```

7.  Run tests:

    ```bash

    npm run test:all

    ```



Access the app at [http://localhost:5173](http://localhost:5173).