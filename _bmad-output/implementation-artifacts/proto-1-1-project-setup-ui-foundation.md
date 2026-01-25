# Story: Project Setup & UI Foundation (Prototype)

**Story ID:** proto-1-1-project-setup-ui-foundation
**Epic:** Prototype Phase - Interactive UI/UX Validation
**Status:** done
**Type:** Foundation
**Estimate:** 2-3 hours

---

## User Story

As a developer,
I want to set up the React + Vite + Tailwind project foundation with mock data structure,
So that I can build an interactive prototype to test UX flows before implementing backend.

---

## Context

This is the **first story of the prototype phase**. We're building an interactive front-end prototype to validate UX before investing in backend complexity. This story focuses on:
- Setting up the modern React development environment
- Configuring Tailwind with Notion-inspired design system
- Creating mock data structure for testing
- NO backend dependencies (no Supabase, no API integration)

---

## Acceptance Criteria

### AC1: React + Vite Project Initialized

**Given** I am starting the project
**When** I run the initialization commands
**Then** A Vite + React project is created with:
- ✅ React 18.x installed
- ✅ Vite 5.x as build tool
- ✅ TypeScript configured (optional but recommended)
- ✅ ESLint configured for code quality
- ✅ Development server runs on `npm run dev`

**Commands:**
```bash
npm create vite@latest journal-prototype -- --template react
cd journal-prototype
npm install
npm run dev
```

---

### AC2: Tailwind CSS Configured with Notion-Inspired Design System

**Given** The React project is initialized
**When** I configure Tailwind CSS
**Then** Tailwind is installed and configured with:

**Installation:**
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Notion-inspired warm palette
        cream: '#FBF9F6',
        'warm-dark': '#37352F',
        'warm-gray': '#787774',
        'calm-blue': '#2EAADC',
        'teal-green': '#0F7B6C',
        'warm-yellow': '#FFB224',
        'coral-red': '#E03E3E',
        'warm-light-gray': '#E9E7E4',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      spacing: {
        // 8px base unit system
        '18': '4.5rem', // 72px
      },
    },
  },
  plugins: [],
}
```

**src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Notion-inspired base styles */
@layer base {
  body {
    @apply bg-cream text-warm-dark;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  h1 {
    @apply text-4xl font-bold;
  }

  h2 {
    @apply text-2xl font-semibold;
  }

  p {
    @apply leading-relaxed;
  }
}
```

**And** Inter font is loaded via Google Fonts in `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

### AC3: Project Structure Created

**Given** The base project is set up
**When** I organize the codebase
**Then** The following folder structure exists:

```
journal-prototype/
├── src/
│   ├── components/         # React components
│   │   ├── entry/          # Entry creation components
│   │   ├── timeline/       # Timeline components
│   │   ├── shared/         # Shared UI components
│   │   └── layouts/        # Layout components
│   ├── mocks/              # Mock data for prototype
│   │   ├── mockEntries.js
│   │   ├── mockUser.js
│   │   └── mockAIResponses.js
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

**Action:** Create all directories:
```bash
mkdir -p src/{components/{entry,timeline,shared,layouts},mocks,hooks,utils}
```

---

### AC4: Mock Data Structure Created

**Given** The project structure exists
**When** I create mock data files
**Then** Mock data is available for prototype testing:

**src/mocks/mockUser.js:**
```javascript
export const mockUser = {
  id: 'mock-user-1',
  email: 'phil@example.com',
  name: 'Phil',
  onboarded: true,
  total_entries: 8,
  current_streak: 5,
  longest_streak: 7,
  last_entry_date: '2026-01-16',
  created_at: '2026-01-09'
};
```

**src/mocks/mockEntries.js:**
```javascript
export const mockEntries = [
  {
    id: 'entry-1',
    user_id: 'mock-user-1',
    entry_date: '2026-01-16',
    professional_recap: 'Completed the PRD and architecture for the journaling app. Feeling energized about the clear direction.',
    personal_recap: 'Morning run was great. Weather was perfect. Spent evening with family playing board games.',
    learning_reflections: 'Learned about PWA architecture and how to structure React apps for offline-first design.',
    gratitude: 'Grateful for clear thinking this morning and supportive family time in the evening.',
    ai_feedback: 'I noticed you mentioned feeling energized about the clear direction - that momentum is powerful! Keep riding that wave.',
    ai_cited_entries: null,
    completed: true,
    created_at: '2026-01-16T07:30:00Z'
  },
  {
    id: 'entry-2',
    user_id: 'mock-user-1',
    entry_date: '2026-01-15',
    professional_recap: 'Had a productive brainstorming session. Defined the core features for MVP.',
    personal_recap: 'Started Miracle Morning routine. Reading "Atomic Habits" - great insights on habit formation.',
    learning_reflections: 'Learning about habit formation psychology. The concept of "identity-based habits" is fascinating.',
    gratitude: 'Grateful for the opportunity to build something meaningful and for my morning routine.',
    ai_feedback: 'You mentioned productive brainstorming and defining core features - setting clear goals is a powerful first step!',
    ai_cited_entries: null,
    completed: true,
    created_at: '2026-01-15T07:15:00Z'
  },
  // Add 6 more entries to reach 8 total (for testing 7+ pattern recognition)
  {
    id: 'entry-3',
    user_id: 'mock-user-1',
    entry_date: '2026-01-14',
    professional_recap: 'Team meeting went well. Everyone aligned on project vision.',
    personal_recap: 'Evening walk in the park. Beautiful sunset.',
    learning_reflections: 'Listened to podcast about focus and deep work.',
    gratitude: 'Grateful for team alignment and peaceful evening.',
    ai_feedback: 'Team alignment is crucial - great work building consensus!',
    ai_cited_entries: null,
    completed: true,
    created_at: '2026-01-14T07:00:00Z'
  }
  // ... add 5 more entries with variety in content
];

// Helper to get entries by date range
export const getEntriesByDateRange = (startDate, endDate) => {
  return mockEntries.filter(entry => {
    const entryDate = new Date(entry.entry_date);
    return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
  });
};

// Helper to get today's entry
export const getTodaysEntry = () => {
  const today = new Date().toISOString().split('T')[0];
  return mockEntries.find(entry => entry.entry_date === today);
};
```

**src/mocks/mockAIResponses.js:**
```javascript
// Mock AI responses for different scenarios
export const mockAIResponses = {
  // Days 1-2: Simple encouragement
  earlyDays: [
    "Great start! I noticed you mentioned {topic} - that's a powerful reflection.",
    "You're building a meaningful habit. Keep going!",
    "I can see you're committed to this practice. That's the first step to real growth."
  ],

  // Day 7+: Pattern recognition
  patternRecognition: [
    {
      insight: "You've mentioned feeling energized about project clarity three times this week.",
      citedEntries: [
        {
          date: '2026-01-16',
          excerpt: 'Feeling energized about the clear direction.',
          entry_id: 'entry-1'
        },
        {
          date: '2026-01-14',
          excerpt: 'Everyone aligned on project vision.',
          entry_id: 'entry-3'
        }
      ],
      advice: "This pattern shows you thrive with clear direction. Consider starting each week by defining clear goals."
    }
  ]
};

// Function to generate mock AI response based on entry count
export const generateMockAIResponse = (entryCount, currentEntry) => {
  if (entryCount < 7) {
    // Return simple encouragement
    const responses = mockAIResponses.earlyDays;
    return responses[Math.floor(Math.random() * responses.length)];
  } else {
    // Return pattern recognition
    const pattern = mockAIResponses.patternRecognition[0];
    return `${pattern.insight}\n\nLooking back at your entry on ${pattern.citedEntries[0].date}: "${pattern.citedEntries[0].excerpt}"\n\n${pattern.advice}`;
  }
};
```

---

### AC5: Basic Routing Setup (React Router)

**Given** The project is configured
**When** I set up routing
**Then** React Router is installed and configured for main views:

**Installation:**
```bash
npm install react-router-dom
```

**src/App.jsx:**
```jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { mockUser } from './mocks/mockUser';

// Placeholder components (will be built in subsequent stories)
import EntryView from './components/entry/EntryView';
import TimelineView from './components/timeline/TimelineView';
import OnboardingOverlay from './components/shared/OnboardingOverlay';

function App() {
  // For prototype: always use mockUser
  const user = mockUser;
  const needsOnboarding = !user.onboarded;

  return (
    <Router>
      {needsOnboarding && <OnboardingOverlay />}

      <Routes>
        <Route path="/" element={<EntryView />} />
        <Route path="/timeline" element={<TimelineView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
```

**Action:** Create placeholder components:
```bash
touch src/components/entry/EntryView.jsx
touch src/components/timeline/TimelineView.jsx
touch src/components/shared/OnboardingOverlay.jsx
```

**src/components/entry/EntryView.jsx (placeholder):**
```jsx
export default function EntryView() {
  return (
    <div className="min-h-screen bg-cream p-4">
      <h1 className="text-warm-dark">Entry View - Coming Soon</h1>
      <p className="text-warm-gray">Prototype foundation ready!</p>
    </div>
  );
}
```

---

### AC6: Development Environment Verified

**Given** All setup is complete
**When** I run `npm run dev`
**Then** The development server starts and:
- ✅ App loads in browser at `http://localhost:5173`
- ✅ Tailwind styles are applied (cream background, Inter font)
- ✅ Hot module replacement (HMR) works
- ✅ No console errors
- ✅ Mock data imports successfully
- ✅ Routing works (can navigate between views)

---

## Technical Notes

### Dependencies to Install
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "vite": "^5.0.8"
  }
}
```

### Prototype Strategy
- **No backend**: Use localStorage for persistence simulation
- **Mock AI**: Pre-written responses, no API calls
- **Mock Auth**: Always logged in as mockUser
- **Focus**: UI/UX validation, interactions, animations, responsive design

### Next Stories
After this foundation is complete:
1. **proto-1-6-design-system-visual-foundation**: Build shared UI components (buttons, cards, etc.)
2. **proto-2-1-entry-landing-mock-data**: Entry creation landing with mock data check
3. **proto-2-2-2-5-four-section-flow**: Complete 4-section guided entry flow

---

## Definition of Done

- [x] Vite + React project runs successfully
- [x] Tailwind configured with Notion-inspired colors
- [x] Inter font loaded and displaying
- [x] Project structure created (components/, mocks/, hooks/, utils/)
- [x] Mock data files created and importable
- [x] React Router configured with placeholder views
- [x] Development server runs without errors
- [x] Hot reload works
- [x] Code committed to git with clear commit message
- [x] README.md updated with setup instructions

---

## Implementation Commands

```bash
# 1. Create project
npm create vite@latest journal-prototype -- --template react
cd journal-prototype

# 2. Install dependencies
npm install
npm install react-router-dom
npm install -D tailwindcss postcss autoprefixer

# 3. Initialize Tailwind
npx tailwindcss init -p

# 4. Create folder structure
mkdir -p src/{components/{entry,timeline,shared,layouts},mocks,hooks,utils}

# 5. Create mock data files
touch src/mocks/{mockUser.js,mockEntries.js,mockAIResponses.js}

# 6. Create placeholder components
touch src/components/entry/EntryView.jsx
touch src/components/timeline/TimelineView.jsx
touch src/components/shared/OnboardingOverlay.jsx

# 7. Start development server
npm run dev
```

---

## Success Criteria

✅ **You know you're done when:**
1. Browser shows "Entry View - Coming Soon" with cream background
2. Inter font is rendering correctly
3. Console has no errors
4. You can edit code and see changes instantly (HMR)
5. Mock data can be imported: `import { mockUser } from './mocks/mockUser'`
6. Routes work: Navigate to `/timeline` shows timeline placeholder

---

**Ready to start building the interactive prototype!** 🎨🚀

---

## Dev Agent Record

### Implementation Plan

**Approach:** Created React + Vite project foundation with Tailwind CSS and mock data architecture for prototype phase.

**Key Technical Decisions:**
1. **Tailwind CSS v3.4** - Used v3.4 instead of v4 for stability and compatibility with PostCSS plugin architecture
2. **Mock Data Layer** - Created comprehensive mock data (8 entries, user profile, AI responses) to simulate full app behavior
3. **Component Structure** - Organized by feature (entry/, timeline/, shared/, layouts/) for scalability
4. **Routing** - Implemented React Router with placeholder views for early navigation testing

**Challenges Resolved:**
- Initially installed Tailwind CSS v4 which has incompatible PostCSS plugin architecture
- Resolved by downgrading to v3.4.0 which uses the traditional `tailwindcss` PostCSS plugin
- Verified fix with successful production build

### Completion Notes

✅ **All Acceptance Criteria Met:**
- AC1: React + Vite project initialized and running
- AC2: Tailwind CSS configured with Notion-inspired design system (8 custom colors, Inter font, 8px spacing)
- AC3: Project structure created (components/, mocks/, hooks/, utils/ directories)
- AC4: Mock data files created (mockUser.js, mockEntries.js with 8 entries, mockAIResponses.js)
- AC5: React Router configured with 3 routes (/, /timeline, fallback redirect)
- AC6: Development environment verified (dev server runs, HMR works, production build succeeds)

**Verification:**
- Production build completes successfully (45 modules, 229KB JS bundle)
- Mock data imports tested and functional (mockUser has 9 fields)
- README created with comprehensive setup instructions
- Git commit created with clear message and co-author attribution

**Foundation Ready:**
The prototype foundation is complete and ready for UI component development in subsequent stories. All placeholder views render with Notion-inspired styling.

---

## File List

**Created Files:**
- `journal-prototype/.gitignore` - Vite default gitignore
- `journal-prototype/README.md` - Setup instructions and project documentation
- `journal-prototype/package.json` - Dependencies (React 18, React Router 6, Tailwind 3.4)
- `journal-prototype/package-lock.json` - Dependency lock file
- `journal-prototype/vite.config.js` - Vite configuration
- `journal-prototype/eslint.config.js` - ESLint configuration
- `journal-prototype/tailwind.config.js` - Tailwind with Notion colors
- `journal-prototype/postcss.config.js` - PostCSS with Tailwind + Autoprefixer
- `journal-prototype/index.html` - HTML template with Inter font links
- `journal-prototype/src/main.jsx` - React entry point
- `journal-prototype/src/App.jsx` - Router configuration
- `journal-prototype/src/App.css` - App styles (minimal)
- `journal-prototype/src/index.css` - Global Tailwind styles
- `journal-prototype/src/components/entry/EntryView.jsx` - Placeholder entry view
- `journal-prototype/src/components/timeline/TimelineView.jsx` - Placeholder timeline view
- `journal-prototype/src/components/shared/OnboardingOverlay.jsx` - Placeholder onboarding
- `journal-prototype/src/mocks/mockUser.js` - Mock user profile data
- `journal-prototype/src/mocks/mockEntries.js` - Mock journal entries (8 samples)
- `journal-prototype/src/mocks/mockAIResponses.js` - Mock AI feedback generation
- `journal-prototype/public/vite.svg` - Vite logo asset
- `journal-prototype/src/assets/react.svg` - React logo asset

**Directories Created:**
- `journal-prototype/src/components/entry/`
- `journal-prototype/src/components/timeline/`
- `journal-prototype/src/components/shared/`
- `journal-prototype/src/components/layouts/`
- `journal-prototype/src/mocks/`
- `journal-prototype/src/hooks/`
- `journal-prototype/src/utils/`

---

## Change Log

- **2026-01-17**: Prototype foundation implemented and committed (commit: 03c50ee)
  - Created React + Vite project with Tailwind CSS 3.4
  - Configured Notion-inspired design system
  - Implemented mock data layer with 8 sample entries
  - Set up React Router with placeholder views
  - Verified dev server and production build
  - Added comprehensive README with setup instructions

---

## Status

**Current Status:** done

**Date Completed:** 2026-01-17

**Next Story:** proto-1-6-design-system-visual-foundation
