# Daily Journaling PWA with AI Coaching

A daily journaling Progressive Web App featuring a guided 4-section flow (Professional, Personal, Learning, Gratitude) and AI-powered coaching and pattern recognition.

## Features

- **Guided Entry Flow**: Professional, Personal, Learning, and Gratitude sections.
- **AI Coaching**: Personalized feedback and pattern recognition using Claude API.
- **Habit Tracking**: Streak tracking and milestone badges.
- **Timeline**: Browse past entries in a chronological timeline.
- **PWA**: Installable on mobile and desktop.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (Auth & Database)
- **AI**: Anthropic Claude API

## Getting Started

1.  **Clone the repository**

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up environment variables**
    Create a `.env.local` file with your Supabase and Anthropic API keys:
    ```
    VITE_SUPABASE_URL=your_url
    VITE_SUPABASE_ANON_KEY=your_key
    VITE_ANTHROPIC_API_KEY=your_key
    ```

4.  **Run development server**
    ```bash
    npm run dev
    ```