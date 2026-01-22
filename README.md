# <img src="journal-app/public/favicon.svg" width="40" height="40" alt="Journal Logo" style="vertical-align: bottom;" /> Journal App (Vibe Coding Project)

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
    -   **Current Phase**: Prototype Phase (Interactive UI/UX Validation). See `journal-app/` for source code.

## 📂 Project Artifacts

The `_bmad-output/` folder contains comprehensive documentation for the project:

-   `analysis/`: Initial brainstorming and research.
-   `planning-artifacts/`: PRD, Architecture, UX Specs, and Diagrams (Excalidraw).
-   `implementation-artifacts/`: Prototype stories and sprint status.

## 🚀 Tech Stack

-   **Frontend**: React 18, Vite, Tailwind CSS
-   **Backend**: Supabase (Auth & Database)
-   **AI**: Anthropic Claude API
-   **Tools**: VS Code, GitHub

## 🛠 Setup

To run the application locally:

1.  Clone the repo.
2.  Navigate to the app directory:
    ```bash
    cd journal-app
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```