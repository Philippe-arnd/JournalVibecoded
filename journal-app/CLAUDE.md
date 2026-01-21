# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based daily journaling PWA with guided 4-section entry flow. The app uses Supabase for authentication and data persistence, with a focus on speed (sub-5-minute entry completion) and mobile-first design.

## Common Commands

### Development
```bash
npm run dev          # Start Vite dev server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint on all files
```

### Environment Setup
Create a `.env` file with:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Architecture

### Application Flow
1. **Authentication** - AuthContext (`src/contexts/AuthContext.jsx`) wraps the app, providing `useAuth()` hook
2. **Main App Router** - `App.jsx` manages view state: `LoginView` → `HomeView` ↔ `EntryCreationView`
3. **Data Layer** - Services in `src/services/` handle all Supabase interactions

### Key Patterns

**View-Based Architecture**
- `LoginView` - Email/password authentication
- `HomeView` - Timeline of entries with streak display
- `EntryCreationView` - 4-section card stack with swipe/navigation

**State Management**
- React Context for auth state (no Redux/Zustand needed)
- Local component state for UI interactions
- Supabase queries directly from components via service layer

**Entry Creation Flow**
The app uses a card-stack UI with 4 sections:
1. Professional Recap (`professional_recap`)
2. Personal Recap (`personal_recap`)
3. Learning Reflections (`learning_reflections`)
4. Gratitude (`gratitude`)

Database fields map to section IDs. Each section auto-saves on navigation using `entryService.saveEntry()`.

### Directory Structure

```
src/
├── components/      # Reusable components (Logo, DailyInsights)
├── contexts/        # React contexts (AuthContext)
├── data/           # Static data and mock data
├── hooks/          # Custom hooks (useAutoSave)
├── lib/            # External service configs (supabase client)
├── services/       # API abstraction layer (authService, entryService)
├── views/          # Full-page view components
├── App.jsx         # Main app router and state
└── main.jsx        # Entry point with AuthProvider
```

### Database Schema

**Tables:**
- `user_profiles` - User metadata (streaks, total_entries, onboarded flag)
- `entries` - Journal entries with 4 sections + metadata
  - Unique constraint on `(user_id, entry_date)` - one entry per day
  - Auto-saves use upsert pattern with this constraint

**Key Fields on entries:**
- `entry_date` (DATE) - ISO date string, defaults to today
- `completed` (BOOLEAN) - True when user completes all sections
- `professional_recap`, `personal_recap`, `learning_reflections`, `gratitude` (TEXT)

### Services Layer

**authService.js**
- `signUp(email, password)` - Create new user
- `signIn(email, password)` - Authenticate user
- `signOut()` - Clear session
- `getUserProfile(userId)` - Fetch user_profiles row

**entryService.js**
- `getEntries()` - Fetch all entries for current user (ordered by date desc)
- `getTodayEntry()` - Get or check for today's entry
- `saveEntry(entryData)` - Upsert entry (creates or updates based on date)
- `deleteEntry(id)` - Delete entry by ID

### Styling System

**Tailwind Configuration** (`tailwind.config.js`)
Custom color palette under `journal.*`:
- `journal-50` - Warm off-white background (#FDFBF7)
- `journal-200` - Soft teal borders
- `journal-500` - Primary teal
- `journal-900` - Deep teal text
- `journal-accent` - Warm terracotta for CTAs (#E07A5F)

**Fonts:**
- `font-sans` - Inter for body text
- `font-serif` - Fraunces for headings

### Animation

Uses Framer Motion for:
- Card stack transitions in EntryCreationView
- Swipe gestures (left/right navigation)
- Page transitions

Key animation pattern: Cards enter/exit with spring physics, rotation, and opacity changes.

## Development Guidelines

### Creating New Features
1. Check if Supabase RLS policies exist for new tables
2. Create service functions in `src/services/` before component logic
3. Use `useAuth()` hook to access current user
4. Follow the view-based pattern for full-page components

### Auto-Save Pattern
Entry creation uses optimistic auto-save:
- Save triggers on navigation between sections
- Uses `entryService.saveEntry()` with upsert logic
- Shows spinner in header during save
- No explicit "Save" button needed

### Handling Dates
Always use ISO date format (`YYYY-MM-DD`) for `entry_date`. Convert Date objects:
```javascript
const today = new Date().toISOString().split('T')[0]
```

### Supabase Client Usage
Import from `src/lib/supabase.js`:
```javascript
import { supabase } from '../lib/supabase'
```

Use service layer when possible. For direct queries:
```javascript
const { data, error } = await supabase
  .from('entries')
  .select('*')
  .eq('user_id', user.id)
```

### Testing Authentication
- User state from `useAuth()` hook is null when logged out
- Check `authLoading` before rendering to avoid flash of wrong content
- Supabase session persists in localStorage automatically

## Build Tool Notes

This project uses `rolldown-vite` (npm override of vite) for faster builds with Rolldown bundler. Configuration in `vite.config.js` is minimal - standard Vite + React plugin setup.
