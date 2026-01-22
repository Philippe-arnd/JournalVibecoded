# <img src="public/favicon.svg" width="40" height="40" alt="Journal Logo" style="vertical-align: bottom;" /> Daily Journaling PWA with AI Coaching

A daily journaling Progressive Web App featuring a guided 4-section flow (Professional, Personal, Learning, Gratitude) and AI-powered coaching and pattern recognition.

**Current Status:** Prototype Phase (Mock Data)

## Features

### ✅ Implemented (Prototype)
-   **Guided Entry Flow**: Interactive 4-section wizard (Professional, Personal, Learning, Gratitude).
-   **Entry Landing Logic**: Smart routing based on today's entry status (New, Resume, Completed).
-   **Mock AI Coaching**: Simulated personalized feedback and pattern recognition display.
-   **Habit Tracking UI**: Visual streak tracking and milestone badges.
-   **Auto-Save Simulation**: Debounced auto-save indicators with local storage persistence.
-   **Design System**: Custom Notion-inspired Tailwind theme with reusable components (Cards, Buttons, Progress Indicators).
-   **Mobile First**: Fully responsive layout optimized for touch interaction.

### 🚧 Planned (Backend Integration)
-   **Supabase Integration**: Real authentication and database persistence.
-   **Live AI**: Real-time feedback generation using Anthropic Claude API.
-   **Timeline**: Full historical browsing with infinite scroll.

## Tech Stack

-   **Frontend**: React 18, Vite, Tailwind CSS
-   **Backend**: Supabase (Auth & Database)
-   **AI**: Anthropic Claude API

## Getting Started

1.  **Clone the repository**

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run development server**
    The prototype currently uses mock data, so no environment variables are strictly required to run the UI.
    ```bash
    npm run dev
    ```

4.  **(Optional) Future Environment Setup**
    When the backend integration is ready, create a `.env.local` file:
    ```
    VITE_SUPABASE_URL=your_url
    VITE_SUPABASE_ANON_KEY=your_key
    VITE_ANTHROPIC_API_KEY=your_key
    ```
