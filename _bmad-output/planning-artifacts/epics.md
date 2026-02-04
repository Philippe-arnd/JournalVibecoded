---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - '/home/dmin/dev/journal/_bmad-output/planning-artifacts/prd.md'
  - '/home/dmin/dev/journal/_bmad-output/planning-artifacts/architecture.md'
  - '/home/dmin/dev/journal/_bmad-output/planning-artifacts/ux-design-specification.md'
  - '/home/dmin/dev/journal/_bmad-output/planning-artifacts/product-brief-dev-2026-01-14.md'
workflowType: 'epics-and-stories'
fastTracked: true
---

# journal - Epic Breakdown

**Product:** Daily Journaling PWA with AI Coaching
**Author:** Phil + Claude
**Date:** 2026-01-17

## Overview

This document provides the complete epic and story breakdown for journal, decomposing the requirements from the PRD, UX Design, and Architecture into implementation-ready stories. All stories are organized by user value and sized for single developer completion.

---

## Requirements Inventory

### Functional Requirements (from PRD)

**FR-ENTRY: Entry Creation & Management**
- FR-ENTRY-01: User can create a new daily journal entry through a guided 4-section flow (Professional, Personal, Learning, Gratitude)
- FR-ENTRY-02: User can answer question-driven prompts within each of the 4 sections to eliminate blank page paralysis
- FR-ENTRY-03: User can complete a full 4-section entry in under 5 minutes
- FR-ENTRY-04: User can save entry progress online with automatic sync to cloud database
- FR-ENTRY-05: User can see completion status for each of the 4 sections (completed vs incomplete)
- FR-ENTRY-06: User can only mark daily entry as "complete" after all 4 sections are filled
- FR-ENTRY-07: User can write entries using mobile (touch) or desktop (keyboard) interfaces seamlessly

**FR-AI: AI Coaching & Pattern Recognition**
- FR-AI-01: User receives AI-generated coaching response immediately after completing each daily entry
- FR-AI-02: User receives simple observational feedback from AI during Days 1-2 (e.g., "I noticed you mentioned feeling energized")
- FR-AI-03: User sees visual progress bar showing "X/7 entries completed" until reaching 7-entry threshold
- FR-AI-04: User receives pattern recognition insights from AI after completing 7+ entries (e.g., "You experienced similar stress 2 weeks ago")
- FR-AI-05: User sees excerpts from similar past entries when AI identifies patterns
- FR-AI-06: User receives AI coaching that scales in depth based on accumulated entry count
- FR-AI-07: System delivers AI responses within 3 seconds of entry completion

**FR-HABIT: Habit Formation & Engagement**
- FR-HABIT-01: User can see current daily streak count prominently displayed
- FR-HABIT-02: User receives visual streak indicator (Duolingo-style) showing consecutive days journaled
- FR-HABIT-03: User earns completion badges for milestone streaks (7-day, 30-day, 90-day)
- FR-HABIT-04: User sees progress tracking toward 7-entry threshold for unlocking deeper AI insights
- FR-HABIT-05: User can view streak history and see when streaks were broken/rebuilt

**FR-TIMELINE: Timeline & History**
- FR-TIMELINE-01: User can browse past entries in a vertical chronological timeline
- FR-TIMELINE-02: User sees date headers separating each entry in the timeline
- FR-TIMELINE-03: User can tap/click to expand and read full historical entry content
- FR-TIMELINE-04: User can scroll through timeline at 60fps smooth scrolling performance

**FR-TECH: Technical Foundation & Infrastructure**
- FR-TECH-01: User can install app to home screen on mobile and desktop devices
- FR-TECH-02: User can write entries online with automatic sync to cloud database
- FR-TECH-03: User can authenticate using email/password via Supabase Auth
- FR-TECH-04: User data is encrypted in transit (HTTPS) and at rest (Supabase encryption)
- FR-TECH-05: User can access app on modern browsers (Chrome, Safari, Firefox, Edge - latest 2 versions)
- FR-TECH-06: System saves entry drafts automatically (auto-save)
- FR-TECH-07: System achieves entry save success rate >99.9%
- FR-TECH-08: System loads initial page in <2 seconds on 3G connection

**FR-UX: User Experience & Interface**
- FR-UX-01: User lands directly in write-first interface when opening app with incomplete entry
- FR-UX-02: First-time user sees brief onboarding explaining the 4-section framework
- FR-UX-03: User experiences Notion-inspired aesthetic (clean, modern, minimalist with warm tones)
- FR-UX-04: User sees "Upgrade for Voice Entries" button in UI for premium feature interest validation
- FR-UX-05: System tracks clicks on "Upgrade for Voice Entries" button without building full voice feature
- FR-UX-06: User completes entries on mobile-first responsive design that scales to desktop

### Non-Functional Requirements (from PRD)

**NFR-PERFORMANCE: Performance & Responsiveness**
- NFR-PERF-01: AI coaching responses must complete within 3 seconds of entry submission
- NFR-PERF-02: Entry saves (online) must complete within 500ms
- NFR-PERF-03: Timeline scrolling must maintain 60fps for smooth user experience
- NFR-PERF-04: Initial page load must complete within 2 seconds on 3G connection

**NFR-RELIABILITY: Reliability & Data Integrity**
- NFR-REL-01: Entry save success rate must exceed 99.9%
- NFR-REL-02: PWA must function reliably across modern browsers (Chrome, Safari, Firefox, Edge)
- NFR-REL-03: System must handle concurrent writes gracefully (single-user simplifies conflict resolution)

**NFR-SECURITY: Security & Privacy**
- NFR-SEC-01: All user data must be encrypted in transit using HTTPS
- NFR-SEC-02: All user data must be encrypted at rest via Supabase encryption
- NFR-SEC-03: Authentication must use secure session management via Supabase Auth
- NFR-SEC-04: AI API keys must be managed via environment variables (never exposed client-side)

**NFR-USABILITY: Usability & Accessibility**
- NFR-USE-01: Entry completion flow must be achievable in under 5 minutes for 90%+ of users
- NFR-USE-02: Interface must be fully responsive from 320px (mobile) to 1920px+ (desktop)
- NFR-USE-03: App must meet WCAG 2.1 Level AA accessibility standards for core journaling flow
- NFR-USE-04: Onboarding must be completable in under 2 minutes for first-time users

### Additional Requirements

**From Architecture:**
- Database schema with Row Level Security (RLS) policies for user data isolation
- React 18 + Tailwind CSS + Vite build toolchain
- Supabase PostgreSQL for data persistence with auto-generated types
- Claude API integration via server-side calls (Anthropic API)
- PWA manifest and service worker for installability (no offline storage for MVP)
- Cloud deployment with environment variable management
- Auto-save pattern with 500ms debounce and optimistic UI
- Component architecture: EntrySection, AIFeedbackCard, StreakBadge, TimelineEntryCard, etc.
- Database triggers for auto-updating user stats (streak calculation)

**From UX Design:**
- Notion-inspired color palette (warm neutrals, cream backgrounds #FBF9F6)
- Inter font family with generous line height (1.5)
- 8px spacing system with generous padding (32-48px between sections)
- Sequential flow pattern (no back button, forward momentum only)
- Auto-focus cursor on text fields
- Typewriter effect for AI feedback delivery (200ms delay between words)
- Smooth animations (300-400ms easing, fade/slide/scale)
- Graceful streak recovery messaging ("Welcome back!" not "You broke your streak!")
- Progress indicator "Section X of 4" always visible during entry creation
- Mobile touch targets minimum 48px x 48px
- Keyboard shortcuts for desktop (Enter = next section, Cmd+Enter = complete)

---

## FR Coverage Map

### Epic 1: Authentication & Initial Setup
- FR-TECH-03: Email/password authentication
- FR-TECH-04: Data encryption (in transit and at rest)
- FR-TECH-05: Browser compatibility
- FR-TECH-01: PWA installability
- FR-UX-03: Notion-inspired aesthetic foundation
- NFR-SEC-01, NFR-SEC-02, NFR-SEC-03: Security requirements

### Epic 2: Guided Entry Creation Flow
- FR-ENTRY-01: 4-section guided flow
- FR-ENTRY-02: Question-driven prompts
- FR-ENTRY-03: Sub-5-minute completion
- FR-ENTRY-04: Save progress online with automatic sync (Story 2.6)
- FR-ENTRY-05: Section completion status
- FR-ENTRY-06: All 4 sections required for completion
- FR-ENTRY-07: Mobile + desktop interfaces
- FR-TECH-02: Write entries online with automatic sync (Story 2.6)
- FR-TECH-06: Auto-save functionality (Story 2.6)
- FR-TECH-07: >99.9% save success rate
- FR-TECH-08: <2s initial load
- FR-UX-01: Write-first landing experience
- NFR-PERF-02, NFR-PERF-04: Performance targets
- NFR-USE-01: <5-minute completion for 90%+ users
- NFR-USE-02: Responsive 320px-1920px+

### Epic 3: AI Coaching & Feedback System
- FR-AI-01: AI response after entry completion
- FR-AI-02: Simple observational feedback (Days 1-2)
- FR-AI-03: Progress bar "X/7 entries"
- FR-AI-04: Pattern recognition (7+ entries)
- FR-AI-05: Cited entry excerpts
- FR-AI-06: Progressive AI depth scaling
- FR-AI-07: <3s AI response time
- NFR-PERF-01: AI response within 3 seconds
- NFR-SEC-04: API key security

### Epic 4: Habit Formation & Streak Tracking
- FR-HABIT-01: Current streak count display
- FR-HABIT-02: Duolingo-style streak indicator
- FR-HABIT-03: Milestone badges (7-day, 30-day, 90-day)
- FR-HABIT-04: 7-entry threshold progress
- FR-HABIT-05: Streak history viewing

### Epic 5: Timeline & Historical Entry Browsing
- FR-TIMELINE-01: Vertical chronological timeline
- FR-TIMELINE-02: Date headers
- FR-TIMELINE-03: Expandable entry cards
- FR-TIMELINE-04: 60fps smooth scrolling
- NFR-PERF-03: 60fps timeline scrolling

### Epic 6: Onboarding & Premium Feature Validation
- FR-UX-02: First-time user onboarding
- FR-UX-04: "Upgrade for Voice" button
- FR-UX-05: Track premium feature interest
- NFR-USE-04: <2-minute onboarding completion

---

## Epic List

### Epic 1: Authentication & Initial Setup
Users can register, log in, and access a secure, beautiful journaling environment with PWA capabilities. This epic establishes the technical foundation for all subsequent features.
**FRs covered:** FR-TECH-01, FR-TECH-03, FR-TECH-04, FR-TECH-05, FR-UX-03

### Epic 2: Guided Entry Creation Flow
Users can create daily journal entries through a guided 4-section framework (Professional, Personal, Learning, Gratitude) with auto-save and mobile/desktop support. This is the core journaling experience.
**FRs covered:** FR-ENTRY-01 through FR-ENTRY-07, FR-TECH-06, FR-TECH-07, FR-TECH-08, FR-UX-01

### Epic 3: AI Coaching & Feedback System
Users receive intelligent, personalized AI coaching after completing entries, with progressive depth that scales from simple encouragement (Days 1-2) to pattern recognition with cited excerpts (7+ entries).
**FRs covered:** FR-AI-01 through FR-AI-07

### Epic 4: Habit Formation & Streak Tracking
Users can track daily streaks, earn milestone badges, and visualize progress toward the 7-entry threshold that unlocks deeper AI insights. This creates habit-forming engagement.
**FRs covered:** FR-HABIT-01 through FR-HABIT-05

### Epic 5: Timeline & Historical Entry Browsing
Users can browse past entries in a smooth, vertical timeline with expandable entry cards to rediscover insights and track personal growth over time.
**FRs covered:** FR-TIMELINE-01 through FR-TIMELINE-04

### Epic 6: Onboarding & Premium Feature Validation
First-time users receive a brief, non-patronizing onboarding experience, and all users can signal interest in future voice recording premium features without disrupting the MVP flow.
**FRs covered:** FR-UX-02, FR-UX-04, FR-UX-05

---

## Epic 1: Authentication & Initial Setup

**Goal:** Users can register, log in, and access a secure, beautiful journaling environment with PWA capabilities.

### Story 1.1: Project Setup & Tech Stack Initialization

As a developer,
I want to initialize the project with React + Vite + Tailwind + Supabase,
So that the technical foundation is ready for feature development.

**Acceptance Criteria:**

**Given** I am starting the project from scratch
**When** I run the project setup commands
**Then** The following must be configured and working:
- Vite project initialized with React 18
- Tailwind CSS installed and configured with Notion-inspired color palette
- Supabase client library installed and initialized
- Environment variables configured (.env.local with VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_ANTHROPIC_API_KEY)
- PWA plugin installed (vite-plugin-pwa)
- Basic app structure: src/components/, src/services/, src/hooks/, src/contexts/, src/views/
- Development server runs on localhost with hot reload
- Tailwind custom colors configured: #FBF9F6 (cream), #37352F (text primary), #2EAADC (accent blue)

**And** The project builds successfully for production
**And** Initial README.md documents setup steps

**Technical Notes:**
- Use Vite 5.x for fast dev experience
- Tailwind config extends default with custom spacing (8px base unit)
- Inter font loaded from Google Fonts or system fallback

---

### Story 1.2: User Registration with Email/Password

As a new user,
I want to register for an account using email and password,
So that I can securely access my personal journal.

**Acceptance Criteria:**

**Given** I am on the registration page
**When** I enter a valid email (user@example.com) and password (min 8 chars)
**And** I click "Sign Up"
**Then** A user account is created in Supabase Auth
**And** A corresponding user_profiles record is created with:
- id matching the auth.users.id
- onboarded = false
- total_entries = 0
- current_streak = 0

**And** I am automatically logged in after successful registration
**And** I am redirected to the onboarding screen (handled in Epic 6)

**And** If email already exists:
- Error message displays: "An account with this email already exists"
- User is not logged in

**And** If password is too weak (< 8 chars):
- Error message displays: "Password must be at least 8 characters"
- Form does not submit

**Technical Notes:**
- Use Supabase Auth `signUp()` method
- **Create user_profiles table** (first story that needs it):
  - id: UUID (PK, FK → auth.users)
  - created_at: TIMESTAMPTZ
  - onboarded: BOOLEAN (default false)
  - total_entries: INTEGER (default 0)
  - current_streak: INTEGER (default 0)
  - longest_streak: INTEGER (default 0)
  - last_entry_date: DATE
  - updated_at: TIMESTAMPTZ
- Enable RLS policy: "Users can only SELECT/UPDATE their own profile"
- Create user_profiles record via database trigger or Edge Function after auth.users insert
- Store session in localStorage for persistence
- Email verification deferred to post-MVP

---

### Story 1.3: User Login with Email/Password

As a returning user,
I want to log in with my email and password,
So that I can access my existing journal entries.

**Acceptance Criteria:**

**Given** I have an existing account
**When** I navigate to the login page
**And** I enter my email and password
**And** I click "Log In"
**Then** I am authenticated via Supabase Auth
**And** My session is stored securely
**And** I am redirected to:
- Onboarding screen if user_profiles.onboarded = false
- Today's entry creation screen if no entry exists for today
- AI feedback screen if today's entry is already completed

**And** If email/password combination is invalid:
- Error message displays: "Invalid email or password"
- User remains on login page

**And** If user has no internet connection:
- Error message displays: "Unable to connect. Please check your internet connection."

**Technical Notes:**
- Use Supabase Auth `signInWithPassword()` method
- Check user_profiles.onboarded status after login to determine redirect
- Session persists across browser refreshes (localStorage)
- "Remember me" checkbox stores refresh token

---

### Story 1.4: Session Management & Protected Routes

As a logged-in user,
I want my session to persist across browser refreshes and page navigation,
So that I don't have to log in repeatedly during active use.

**Acceptance Criteria:**

**Given** I am logged in
**When** I refresh the page or close/reopen the browser
**Then** My session is restored from localStorage
**And** I remain authenticated without needing to log in again

**And** If my session expires (default 7 days):
- I am redirected to the login page
- Message displays: "Your session expired. Please log in again."

**And** Protected routes (entry creation, timeline, settings) are accessible only when authenticated:
- Unauthenticated users are redirected to login page
- After login, users are redirected back to originally requested page

**And** Public routes (login, signup, password reset) redirect to app if already authenticated

**Technical Notes:**
- Use Supabase `onAuthStateChange()` listener
- Create `ProtectedRoute` component wrapper
- Store `redirectTo` param for post-login navigation
- Session stored in localStorage by Supabase client

---

### Story 1.5: PWA Manifest & Installability

As a mobile user,
I want to install the journal app to my home screen,
So that it feels like a native app with quick access.

**Acceptance Criteria:**

**Given** I am using a supported browser (Chrome, Safari, Edge)
**When** I visit the journal app
**Then** The browser prompts me to "Add to Home Screen" or "Install App"

**And** The app manifest includes:
- name: "Journal"
- short_name: "Journal"
- description: "Daily journaling with AI coaching"
- theme_color: #FBF9F6 (cream background)
- background_color: #FBF9F6
- display: "standalone" (hides browser UI)
- icons: 192x192 and 512x512 PNG images

**And** After installation:
- App opens in standalone mode (no browser address bar)
- App icon appears on home screen/app drawer
- App opens quickly (<2 seconds initial load)

**And** Service worker is registered for installability (no offline caching for MVP)

**Technical Notes:**
- Use vite-plugin-pwa to generate manifest and service worker
- Create app icons using Figma or similar (warm cream background, simple "J" logo)
- Test on iOS Safari (add to home screen) and Android Chrome (install banner)
- Service worker strategy: "networkOnly" (no offline mode for MVP)

---

### Story 1.6: Notion-Inspired Visual Foundation

As a user,
I want the app to have a clean, warm, minimalist aesthetic,
So that journaling feels inviting and calm (not clinical or stressful).

**Acceptance Criteria:**

**Given** I am viewing any screen in the app
**Then** The visual design follows Notion-inspired principles:

**Color Palette:**
- Background: #FBF9F6 (warm cream, not stark white)
- Text Primary: #37352F (warm dark gray)
- Text Secondary: #787774 (medium gray)
- Accent Interactive: #2EAADC (calm blue)
- Success: #0F7B6C (teal green)
- Warning: #FFB224 (warm yellow)
- Error: #E03E3E (coral red)

**Typography:**
- Font: Inter (with system fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)
- H1: 32px/2rem, bold
- H2: 24px/1.5rem, semi-bold
- Body: 16px/1rem, regular, line-height 1.5
- Body Small: 14px/0.875rem
- Caption: 12px/0.75rem

**Spacing:**
- Base unit: 8px
- Section padding: 32-48px for generous breathing room
- Component gap: 16-24px between major elements

**Visual Style:**
- Border radius: 8-12px for approachable feel
- Shadows: Subtle (0-2px) for depth without heaviness
- Transitions: 300-400ms ease-in-out for smoothness

**And** Max content width is 800px on desktop (centered)
**And** All text meets WCAG 2.1 AA contrast ratios:
- Text Primary (#37352F) on cream: 11.7:1 (AAA)
- Text Secondary (#787774) on cream: 4.8:1 (AA)

**Technical Notes:**
- Configure Tailwind theme with custom colors and spacing
- Load Inter font via Google Fonts or system fallback
- Create reusable color variables in CSS/Tailwind config
- Test visual design on mobile (320px) and desktop (1920px+)

---

## Epic 2: Guided Entry Creation Flow

**Goal:** Users can create daily journal entries through a guided 4-section framework with auto-save and mobile/desktop support.

### Story 2.1: Entry Creation Landing Experience

As a returning user with no entry today,
I want to land directly in the entry creation screen with cursor ready,
So that I can start writing immediately without navigation friction.

**Acceptance Criteria:**

**Given** I am logged in and have completed onboarding
**And** No entry exists for today's date
**When** I open the app or navigate to the home route
**Then** The EntryCreationView loads immediately
**And** The screen displays:
- Progress indicator "Section 1 of 4" at the top
- Section prompt: "What did you accomplish professionally yesterday?"
- Text area with cursor auto-focused (ready to type)
- Character count (optional, non-intrusive)
- No visible navigation menu (full-screen focus mode)

**And** If an incomplete entry exists for today:
- App loads the existing entry and resumes at the first incomplete section
- Previous sections' content is preserved and editable
- Progress indicator shows current position (e.g., "Section 3 of 4")

**And** If today's entry is already completed:
- App shows yesterday's AI feedback + "Start Today's Entry" button
- Clicking button creates new entry for today and lands in Section 1

**Technical Notes:**
- **Create entries table** (first story that needs it):
  - id: UUID (PK)
  - user_id: UUID (FK → auth.users)
  - entry_date: DATE
  - professional_recap: TEXT
  - personal_recap: TEXT
  - learning_reflections: TEXT
  - gratitude: TEXT
  - ai_feedback: TEXT
  - ai_cited_entries: JSONB
  - completed: BOOLEAN (default false)
  - created_at: TIMESTAMPTZ
  - updated_at: TIMESTAMPTZ
  - UNIQUE constraint on (user_id, entry_date)
- Enable RLS policy: "Users can only SELECT/INSERT/UPDATE their own entries"
- Create indexes: (user_id, entry_date DESC), (user_id, completed)
- Check database for entry with entry_date = today and user_id = current_user
- If entry exists but not completed, load entry data into form state
- Auto-focus implemented via `useRef` + `useEffect` on mount
- Desktop: max-width 800px centered, Mobile: full-width with padding

---

### Story 2.2: Section 1 - Professional Recap Entry

As a user,
I want to answer the professional recap prompt for today's entry,
So that I can reflect on yesterday's work accomplishments.

**Acceptance Criteria:**

**Given** I am on Section 1 (Professional Recap)
**When** The section loads
**Then** I see:
- Prompt text: "What did you accomplish professionally yesterday?"
- Helper text (subtle): "Think about work wins, meetings, projects, or challenges"
- Multi-line text area (minimum 120px height)
- Character count indicator (bottom right, subtle)

**And** As I type:
- Text is stored in local component state immediately
- Auto-save triggers after 500ms of inactivity (debounced)
- Auto-save indicator shows "Saving..." then "Saved" (1-second fade)
- If save fails, persistent error banner shows: "Unable to save. [Retry]"

**And** After typing at least 10 characters:
- [Next Section] button appears (fades in smoothly)
- Button is prominent (primary color #2EAADC)
- Button is positioned at bottom of text area (thumb-friendly on mobile)

**And** When I click [Next Section]:
- Entry data is saved to database (professional_recap field)
- Smooth transition animation (slide left, 300ms)
- Section 2 loads with cursor auto-focused
- Progress indicator updates to "Section 2 of 4"

**And** If I refresh the page mid-entry:
- My progress is preserved (auto-saved content loads)
- I resume at the section I was working on

**Technical Notes:**
- Use `useAutoSave` hook with 500ms debounce
- Optimistic UI: assume save succeeds, show error only if fails
- PATCH /entries/:id with { professional_recap: text }
- Minimum character count (10) prevents accidental next clicks
- Text area: placeholder="Start typing...", resize="vertical"

---

### Story 2.3: Section 2 - Personal Recap Entry

As a user,
I want to answer the personal recap prompt,
So that I can reflect on yesterday's personal activities and relationships.

**Acceptance Criteria:**

**Given** I am on Section 2 (Personal Recap)
**When** The section loads
**Then** I see:
- Prompt text: "What did you do with your personal time yesterday?"
- Helper text: "Time with family/friends, hobbies, exercise, self-care"
- Multi-line text area (same design as Section 1)
- Progress indicator: "Section 2 of 4"

**And** The same auto-save behavior as Section 1:
- 500ms debounce
- "Saving..." → "Saved" indicator
- Error handling with [Retry] option

**And** After typing at least 10 characters:
- [Next Section] button appears

**And** When I click [Next Section]:
- Entry saved to database (personal_recap field)
- Transition to Section 3
- Progress indicator updates to "Section 3 of 4"

**Technical Notes:**
- Reuse EntrySection component with props:
  - sectionNumber={2}
  - sectionTitle="Personal Recap"
  - promptText="What did you do with your personal time yesterday?"
  - helperText="Time with family/friends, hobbies, exercise, self-care"
  - fieldName="personal_recap"

---

### Story 2.4: Section 3 - Learning Reflections Entry

As a user,
I want to answer the learning reflections prompt,
So that I can capture insights from podcasts, books, conversations, or experiences.

**Acceptance Criteria:**

**Given** I am on Section 3 (Learning Reflections)
**When** The section loads
**Then** I see:
- Prompt text: "What did you learn recently?"
- Helper text: "From podcasts, books, conversations, or experiences"
- Multi-line text area (same design pattern)
- Progress indicator: "Section 3 of 4"

**And** Same auto-save and validation behavior as previous sections

**And** When I click [Next Section]:
- Entry saved to database (learning_reflections field)
- Transition to Section 4 (final section)
- Progress indicator updates to "Section 4 of 4"

**Technical Notes:**
- Reuse EntrySection component with learning_reflections field
- Consistent UX across all 4 sections (same spacing, fonts, animations)

---

### Story 2.5: Section 4 - Gratitude Entry

As a user,
I want to answer the gratitude prompt,
So that I can practice daily gratitude and positive mindset.

**Acceptance Criteria:**

**Given** I am on Section 4 (Gratitude - final section)
**When** The section loads
**Then** I see:
- Prompt text: "What are you grateful for today?"
- Helper text: "Big or small, personal or professional"
- Multi-line text area
- Progress indicator: "Section 4 of 4" (completion indicator)

**And** Same auto-save behavior as previous sections

**And** After typing at least 10 characters:
- [Complete Entry] button appears (instead of "Next Section")
- Button is larger and more prominent (primary action)
- Button text: "Complete Entry & Get Feedback"

**And** When I click [Complete Entry]:
- Entry saved to database with completed = TRUE
- User profile stats updated via database trigger (total_entries, streak)
- Loading state appears: "Generating your AI feedback..." (max 3 seconds)
- Transition to AIFeedbackView (Epic 3)

**And** If AI feedback takes longer than 3 seconds:
- Progress spinner continues
- After 10 seconds, timeout message: "Taking longer than usual... still working"

**Technical Notes:**
- PATCH /entries/:id with { gratitude: text, completed: true }
- **Create database trigger `update_user_stats()`** (first story that needs it):
  - Fires after INSERT/UPDATE on entries when completed = TRUE
  - Updates user_profiles.total_entries count
  - Updates user_profiles.current_streak based on consecutive entry_date values
  - Updates user_profiles.longest_streak if current exceeds it
  - Updates user_profiles.last_entry_date
  - Streak calculation logic handles gaps in dates (last_entry_date = entry_date - 1 day → increment, else reset to 1)
- Call AI feedback API endpoint after marking completed
- Show spinner with "Generating feedback..." message during API call
- Button styling: larger padding, bold text, accent color

---

### Story 2.6: Entry Section Auto-Save Functionality

As a user,
I want my entry content to save automatically as I type,
So that I never lose my work due to browser crashes or accidental navigation.

**Acceptance Criteria:**

**Given** I am typing in any entry section
**When** I pause typing for 500ms
**Then** The content is automatically saved to the database
**And** A subtle "Saving..." indicator appears (top-right of text area)
**And** After successful save, indicator changes to "Saved" (1-second display, then fades)

**And** If the save fails (network error, server error):
- Indicator changes to "Save failed" (red text, persistent)
- Retry button appears next to the error message
- Content remains in local state (not lost)

**And** When I click [Retry]:
- Save is attempted again
- If successful, indicator shows "Saved"
- If fails again, error persists with [Retry] option

**And** The auto-save behavior:
- Debounces on 500ms delay (prevents excessive API calls)
- Uses optimistic UI (assumes success, shows error only if fails)
- Saves the specific section field being edited (not full entry)
- Does NOT trigger on initial mount (only on user input)

**Technical Notes:**
- Implement `useAutoSave` custom hook with lodash debounce (500ms)
- API: PATCH /entries/:id with only the changed field
- Store entry_id in state after initial creation
- Use `useState` for save status: 'idle' | 'saving' | 'saved' | 'error'
- Show AutoSaveIndicator component conditionally based on status

---

### Story 2.7: Mobile-First Responsive Entry Creation

As a mobile user,
I want the entry creation experience optimized for touch input,
So that journaling during my morning commute is fast and comfortable.

**Acceptance Criteria:**

**Given** I am using the app on mobile (320px-767px width)
**When** I view the entry creation screen
**Then** The layout is optimized for mobile:
- Full-screen mode (no persistent navigation)
- Progress indicator stays at top (fixed position, no scrolling away)
- Prompt text is large enough to read without zooming (16px minimum)
- Text area is thumb-friendly size (minimum 120px height)
- [Next Section] / [Complete Entry] buttons are at least 48px x 48px (iOS/Android touch target guidelines)
- Generous padding around touch elements (16px minimum)

**And** Keyboard behavior:
- iOS Safari: Keyboard dismisses on scroll
- Soft keyboard doesn't obscure the text area
- Text area scrolls into view when focused (prevents hiding behind keyboard)

**And** Transitions:
- Section transitions animate smoothly even on slower mobile devices
- No janky animations (<60fps causes discomfort)

**And** When I rotate device:
- Layout adjusts smoothly (portrait ↔ landscape)
- Text content and cursor position are preserved

**Technical Notes:**
- Use CSS: `min-height: 120px` for text areas
- Touch targets: `min-width: 48px; min-height: 48px`
- Use `viewport-fit=cover` meta tag for iOS notch handling
- Test on real devices (iPhone SE 320px width, Pixel 7)
- Use CSS `scroll-padding-top` to prevent keyboard obscuring inputs

---

### Story 2.8: Desktop Keyboard Shortcuts

As a desktop user,
I want keyboard shortcuts for navigation,
So that I can complete my entry quickly without reaching for the mouse.

**Acceptance Criteria:**

**Given** I am using the app on desktop (1024px+ width)
**When** I press keyboard shortcuts
**Then** The following actions occur:

**Enter key (in text area):**
- Moves to next section if current section has >10 characters
- If on Section 4, does NOT complete entry (prevents accidental submission)

**Cmd+Enter (Mac) or Ctrl+Enter (Windows):**
- Completes entry from any section (if all 4 sections have content)
- If any section is empty, shows error toast: "Please complete all 4 sections"

**Tab key:**
- Moves focus to [Next Section] / [Complete Entry] button
- Normal tab order throughout the page

**Escape key:**
- Blurs current text area (removes focus)
- Does NOT navigate away (entry remains open)

**And** Keyboard shortcuts are documented in a help tooltip (? icon in corner)

**And** Shortcuts work consistently across all 4 sections

**Technical Notes:**
- Use `onKeyDown` event listener on text areas
- Check `event.metaKey || event.ctrlKey` for Cmd/Ctrl
- Prevent default behavior for Enter if moving to next section
- Add aria-label attributes for accessibility

---

## Epic 3: AI Coaching & Feedback System

**Goal:** Users receive intelligent, personalized AI coaching after completing entries, with progressive depth scaling from simple encouragement to pattern recognition.

### Story 3.1: AI Feedback API Integration

As a developer,
I want to integrate the Claude API for generating AI coaching responses,
So that users receive personalized feedback after completing entries.

**Acceptance Criteria:**

**Given** A user has completed a journal entry (all 4 sections filled)
**When** The system calls the AI feedback generation function
**Then** A request is sent to Claude API with:
- Model: "claude-3-5-sonnet-20241022"
- Max tokens: 300
- System message defining AI coach persona
- User message containing the 4 entry sections + context

**And** The prompt structure varies based on user's total_entries:

**If total_entries < 7 (Days 1-6):**
- Prompt focuses on simple observational encouragement
- No pattern recognition requested
- Example prompt: "User completed their journal entry. Provide brief, warm encouragement (2-3 sentences). Entry: [sections]"

**If total_entries >= 7 (Day 7+):**
- Prompt includes past entries for pattern recognition
- Request to cite specific past entry excerpts with dates
- Example prompt: "User completed today's entry. Analyze for patterns with their past entries. If you find similar themes/emotions, cite the past entry with date and excerpt. Today: [sections]. Past entries: [last 10 entries with dates]"

**And** AI response is stored in the database:
- entries.ai_feedback = response text
- entries.ai_cited_entries = JSONB array of {entry_id, excerpt, date} if citations exist

**And** If API call fails:
- Retry once after 2-second delay
- If still fails, store generic fallback: "Great work on completing your entry today!"
- Log error for monitoring

**And** Response time is <3 seconds (90th percentile)

**Technical Notes:**
- Create `aiService.js` with `generateFeedback(entry, userProfile)` function
- Store API key in environment variable (VITE_ANTHROPIC_API_KEY)
- Use fetch() or Anthropic SDK for API calls
- Implement exponential backoff for retries
- Cache responses for 24 hours (same entry won't change)

---

### Story 3.2: Simple Encouragement Feedback (Days 1-6)

As a new user (Days 1-6),
I want to receive warm, encouraging AI feedback after my entry,
So that I feel motivated to continue journaling.

**Acceptance Criteria:**

**Given** I have completed 1-6 total entries
**When** I complete today's entry and click [Complete Entry]
**Then** The AIFeedbackView loads with:
- Animated appearance (fade + slide up, 400ms)
- AI feedback text with simple encouragement
- Feedback references specific content from my entry
- Feedback is 2-4 sentences long

**And** Example feedback formats:
- "I noticed you mentioned feeling energized about the campaign launch—that momentum is powerful! Your focus on the team collaboration shows strong leadership. Keep building on this energy."
- "Great work completing your entry today! You highlighted learning from that podcast about delegation—applying those insights could be valuable. Your gratitude for your supportive team really comes through."

**And** Feedback appears with typewriter effect:
- Text types out word by word
- 200ms delay between words
- Smooth, not jarring

**And** After feedback displays:
- StreakBadge component shows current streak (e.g., "3-day streak 🔥")
- EntryProgressBar component shows progress: "3/7 entries completed - 4 more to unlock deeper insights"
- [View Timeline] button (secondary)
- [Done] button (primary - dismisses and returns to home)

**Technical Notes:**
- AI prompt emphasizes: "Be specific, reference actual content, avoid generic praise"
- Typewriter effect via CSS animation or JS interval
- Load AIFeedbackView after API response returns (<3s target)
- User profile total_entries checked to determine prompt template

---

### Story 3.3: Pattern Recognition Feedback (Day 7+)

As a returning user (Day 7+),
I want to receive pattern recognition insights from AI,
So that I can discover recurring themes and growth in my journaling journey.

**Acceptance Criteria:**

**Given** I have completed 7+ total entries
**When** I complete today's entry
**Then** The AI feedback includes pattern recognition with cited past entries:
- Main feedback text (3-4 sentences analyzing patterns)
- At least 1 cited past entry with date and excerpt

**And** Example feedback format:
"You mentioned work stress today. I noticed something similar on Jan 5th: 'Felt overwhelmed by delegation challenges but pushed through.' You navigated that successfully—you've got this. Your consistent gratitude for your team suggests they're a key resilience factor."

**And** Cited entries are visually distinct:
- Displayed in a CitedEntryExcerpt component
- Light background (#F5F5F5), subtle border
- Shows: Date (e.g., "Jan 5, 2026"), excerpt text (1-2 sentences), [View Full Entry] link

**And** When I click [View Full Entry] on a citation:
- Timeline opens with that specific entry expanded
- User can read full context of past entry

**And** If no clear patterns are detected:
- AI provides thoughtful encouragement without forcing fake patterns
- Avoids generic "I don't see patterns yet" messages

**And** Pattern recognition focuses on:
- Similar emotions or themes (stress, energy, accomplishment)
- Recurring challenges or wins
- Growth indicators (handling similar situations better)
- Consistent gratitude topics

**Technical Notes:**
- Query last 10 entries for pattern matching (performance consideration)
- AI prompt includes past entries: `[${date}] Professional: ${prof}, Personal: ${pers}`
- Parse AI response for citation format: `[Date: Jan 5] "excerpt"`
- Store cited_entries as JSONB: `[{entry_id, excerpt, date}]`
- CitedEntryExcerpt component links to timeline with entry_id param

---

### Story 3.4: AI Feedback Delivery Performance

As a user,
I want AI feedback to appear quickly (within 3 seconds),
So that I don't lose momentum after completing my entry.

**Acceptance Criteria:**

**Given** I click [Complete Entry]
**When** The AI feedback generation begins
**Then** The following performance targets are met:

**Loading Experience:**
- Spinner appears immediately (<100ms)
- Message displays: "Generating your feedback..."
- Spinner animates smoothly (not janky)

**API Response Time:**
- 90th percentile: <3 seconds
- 95th percentile: <5 seconds
- If >10 seconds, show message: "Taking longer than usual... still working"

**Perceived Performance:**
- Typewriter effect begins as soon as first sentence is received (streaming if possible)
- If streaming not available, show spinner until full response received
- Smooth transition from loading → feedback display (no jarring pop-in)

**And** If API fails after timeout:
- Show fallback message: "Great work on completing your entry today!"
- Log error for monitoring (Sentry or similar)
- User can still proceed (entry is saved, feedback just failed)

**And** Response caching:
- If user navigates away and back to feedback screen, cached response loads instantly
- Cache key: entry_id + user_id
- Cache duration: 24 hours (feedback won't change for same entry)

**Technical Notes:**
- Use Promise.race() for timeout handling (10s max)
- Monitor API latency with performance.now() timestamps
- Consider Claude API streaming for faster perceived performance
- Cache responses in localStorage or React Query cache
- Pre-fetch user's last 10 entries before API call (reduce latency)

---

### Story 3.5: Entry Progress Bar (Pre-7 Entries)

As a new user (Days 1-6),
I want to see my progress toward the 7-entry threshold,
So that I know when deeper AI insights will unlock.

**Acceptance Criteria:**

**Given** I have completed 1-6 total entries
**When** The AI feedback screen displays
**Then** The EntryProgressBar component shows:
- Visual progress bar (filled based on entry count)
- Text: "3/7 entries completed - 4 more to unlock deeper insights"
- Progress bar fills from left to right (0% → 100%)
- Color: Accent blue (#2EAADC) for filled portion, light gray (#E9E7E4) for unfilled

**And** Progress bar is prominently placed:
- Below AI feedback text
- Above streak badge
- Visible without scrolling on mobile

**And** After reaching 7 entries:
- Progress bar is hidden (no longer needed)
- Replaced with celebration message: "Pattern recognition unlocked! 🎉"

**And** Visual design:
- Height: 8px
- Border radius: 4px (smooth rounded ends)
- Animation: Progress fills smoothly when component mounts (300ms ease)

**Technical Notes:**
- Component props: `entryCount`, `threshold` (default 7)
- Calculate percentage: `(entryCount / threshold) * 100`
- Use CSS width transition for smooth animation
- Hide component when `entryCount >= threshold`
- Celebration message fades in when threshold reached (first time only)

---

### Story 3.6: Streak Badge Display

As a user,
I want to see my current daily streak after completing an entry,
So that I can feel accomplished and motivated to maintain my habit.

**Acceptance Criteria:**

**Given** I have completed an entry
**When** The AI feedback screen displays
**Then** The StreakBadge component shows:
- Current streak count (e.g., "8")
- Fire emoji 🔥 (Duolingo-style)
- Format: "8-day streak 🔥"
- Prominent display below AI feedback and progress bar

**And** If streak count = 0 (first entry or broken streak):
- Shows: "Starting fresh: 1-day streak 🎯"
- Uses target emoji instead of fire emoji (positive framing)

**And** If a milestone was just achieved (7, 30, 90 days):
- Animated celebration appears (confetti effect + badge pulse)
- Message: "You achieved a 7-day streak! 🏆"
- Animation lasts 2 seconds, then settles to normal display

**And** Visual design:
- Background: Light warm color (#FFF8E1)
- Border: 1px solid warm amber (#FFB224)
- Border radius: 8px
- Padding: 12px 16px
- Font: Semi-bold, 16px

**And** Streak calculation:
- Increments if last_entry_date = yesterday
- Resets to 1 if last_entry_date < yesterday (gap detected)
- Database trigger handles calculation automatically

**Technical Notes:**
- Component props: `streakCount`, `milestoneReached` (boolean), `milestoneType` (7/30/90)
- Use Framer Motion or CSS animation for confetti effect
- Read current_streak from user_profiles table
- Milestone detection: Check if previous streak < milestone && current >= milestone
- Store milestone achievement in milestones table (prevent duplicate celebrations)

---

## Epic 4: Habit Formation & Streak Tracking

**Goal:** Users can track daily streaks, earn milestone badges, and visualize progress toward habit formation goals.

### Story 4.1: Milestone Badge Achievement

As a user,
I want to earn badges when I reach streak milestones,
So that I feel rewarded for building a consistent journaling habit.

**Acceptance Criteria:**

**Given** I am on a daily journaling streak
**When** I complete an entry that reaches a milestone (7-day, 30-day, or 90-day)
**Then** A milestone record is created in the milestones table:
- user_id: my user ID
- milestone_type: 'streak_7', 'streak_30', or 'streak_90'
- achieved_at: current timestamp
- UNIQUE constraint prevents duplicate milestone records

**And** A celebration animation appears on the AI feedback screen:
- Confetti effect (colorful particles fall from top)
- Badge image appears (7-day = bronze, 30-day = silver, 90-day = gold)
- Message: "You achieved a 7-day streak! 🏆"
- Animation duration: 2 seconds

**And** After animation:
- Streak badge displays normally with fire emoji
- Milestone is recorded (won't celebrate again if streak continues)

**And** If I break my streak and rebuild to the same milestone:
- Milestone does NOT celebrate again (already achieved)
- Only celebrates new, higher milestones

**And** Milestone thresholds:
- 7-day streak = "Commitment" badge
- 30-day streak = "Dedication" badge
- 90-day streak = "Mastery" badge

**Technical Notes:**
- **Create milestones table** (first story that needs it):
  - id: UUID (PK)
  - user_id: UUID (FK → auth.users)
  - milestone_type: VARCHAR(50) - values: 'streak_7', 'streak_30', 'streak_90', 'entries_7'
  - achieved_at: TIMESTAMPTZ
  - UNIQUE constraint on (user_id, milestone_type)
- Enable RLS policy: "Users can only SELECT their own milestones"
- Check if milestone exists before inserting: `SELECT * FROM milestones WHERE user_id = ? AND milestone_type = ?`
- If not exists, INSERT and trigger celebration
- Use CSS animation or Framer Motion for confetti
- Badge images: SVG icons with bronze/silver/gold colors
- Celebration component: `MilestoneCelebration({milestoneType, onComplete})`

---

### Story 4.2: Graceful Streak Recovery

As a user who missed days,
I want to return to journaling without feeling guilty or punished,
So that I can rebuild my habit gracefully.

**Acceptance Criteria:**

**Given** I haven't journaled in 3+ days (streak is broken)
**When** I open the app
**Then** I see a welcoming message (not shame-based):
- "Welcome back! Your last entry was Thursday. Let's capture today's reflection."
- NO messages like "You broke your 30-day streak!" or "Streak lost!"

**And** The streak counter shows:
- "Streak reset: 0 days" (before completing today's entry)
- After completing today: "Starting fresh: 1-day streak 🎯"

**And** AI feedback focuses on resilience patterns:
- If I had similar gaps in the past, AI cites my recovery
- Example: "Welcome back! You mentioned similar work stress on Jan 5th: 'Felt overwhelmed...' You navigated that successfully—you've got this."

**And** My longest_streak is preserved:
- Database still shows my best streak ever
- I can view streak history to see past achievements

**And** No negative emotional framing:
- Avoid words like "failed," "lost," "broke" in UI
- Use positive framing: "starting fresh," "new beginning," "resilience"

**Technical Notes:**
- Detect gap: last_entry_date < today - 1 day
- Show welcome message in EntryCreationView header
- AI prompt includes: "User returning after gap - focus on resilience, not guilt"
- Streak history stored but not prominently displayed after reset

---

### Story 4.3: Streak History Viewing

As a user,
I want to view my streak history and achievements,
So that I can see my progress and feel proud of past milestones.

**Acceptance Criteria:**

**Given** I am logged in
**When** I navigate to the Profile/Stats screen (future secondary nav)
**Then** I see:
- Current streak: "8-day streak 🔥"
- Longest streak: "45-day streak 🏆" (all-time best)
- Total entries completed: "67"
- Milestones achieved:
  - ✅ 7-day streak (achieved Jan 14, 2026)
  - ✅ 30-day streak (achieved Feb 5, 2026)
  - 🔒 90-day streak (not yet achieved)

**And** Streak history graph (optional visual):
- Line chart showing streak over time
- X-axis: Dates, Y-axis: Streak count
- Gaps visible where streak reset

**And** Milestone badges displayed:
- Bronze badge (7-day) with date achieved
- Silver badge (30-day) with date achieved
- Grayed-out gold badge (90-day) as goal

**And** If I haven't achieved any milestones yet:
- Shows upcoming milestones as goals
- "Your next milestone: 7-day streak (4 more days!)"

**Technical Notes:**
- Query user_profiles for current_streak, longest_streak, total_entries
- Query milestones table for all achieved milestones
- Optional: Query entries table for historical streak calculation (expensive)
- Chart library: Recharts or Chart.js
- This story may be deferred to post-MVP if not in scope

---

## Epic 5: Timeline & Historical Entry Browsing

**Goal:** Users can browse past entries in a smooth, vertical timeline to rediscover insights and track personal growth.

### Story 5.1: Timeline View with Collapsed Entry Cards

As a user,
I want to browse my past journal entries in a timeline,
So that I can reflect on my journey and find past insights.

**Acceptance Criteria:**

**Given** I have completed multiple journal entries
**When** I navigate to the Timeline screen
**Then** I see a vertical list of all my past entries:
- Reverse chronological order (newest first)
- Each entry displayed as a collapsed card
- Date header above each entry (e.g., "Today", "Yesterday", "Jan 15, 2026")

**And** Collapsed entry card displays:
- Date (prominent, top of card)
- Preview: First 2 lines from professional_recap section (truncated with "...")
- AI feedback summary (if available): First sentence only
- Card background: Light warm color (#FAFAFA)
- Border: Subtle 1px #E9E7E4
- Border radius: 8px

**And** Date header formatting:
- "Today" if entry_date = today
- "Yesterday" if entry_date = yesterday
- "Mon, Jan 15" for dates within last 7 days
- "Jan 15, 2026" for older dates

**And** Infinite scroll behavior:
- Load 20 entries initially
- When user scrolls near bottom (80% down), load next 20 entries
- Smooth loading with skeleton placeholders (no jarring jumps)

**And** If no entries exist:
- Empty state message: "No entries yet. Start journaling to see your timeline!"
- [Write Today's Entry] button

**Technical Notes:**
- Query: `SELECT * FROM entries WHERE user_id = ? AND completed = TRUE ORDER BY entry_date DESC LIMIT 20 OFFSET ?`
- Use Intersection Observer for infinite scroll detection
- TimelineEntryCard component with collapsed state by default
- Skeleton loading: Shimmer effect while fetching next page

---

### Story 5.2: Expandable Entry Cards

As a user,
I want to expand entry cards to read full content,
So that I can rediscover what I wrote on specific days.

**Acceptance Criteria:**

**Given** I am viewing the Timeline
**When** I tap/click on a collapsed entry card
**Then** The card expands smoothly (300ms slide-down animation)
**And** Expanded card displays:
- Date header (remains visible)
- All 4 sections with headers:
  - "Professional Recap" + full text
  - "Personal Recap" + full text
  - "Learning Reflections" + full text
  - "Gratitude" + full text
- AI feedback (if available):
  - "Coach's Feedback" header
  - Full AI feedback text
  - Cited entries (if applicable) with excerpts
- [Close] button at bottom (or tap card again to collapse)

**And** When I expand a card:
- Other cards automatically collapse (only one expanded at a time)
- Smooth scroll to bring expanded card into view
- Card height adjusts to content (no fixed height)

**And** When I tap [Close] or tap the card again:
- Card collapses smoothly (300ms slide-up animation)
- Timeline returns to overview state

**And** Expanded card styling:
- White background (#FFFFFF) to differentiate from collapsed
- Increased padding (24px vs 16px)
- Section dividers (1px light gray lines between sections)

**Technical Notes:**
- Use React state for expanded card ID
- CSS max-height transition for smooth expand/collapse
- Auto-collapse other cards: Set expanded_id state (only one active)
- Scroll into view: `element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })`
- Long content handling: Expanded cards can exceed viewport height (scrollable)

---

### Story 5.3: Timeline Smooth Scrolling Performance

As a user,
I want the timeline to scroll smoothly without lag,
So that browsing my entries feels fast and responsive.

**Acceptance Criteria:**

**Given** I am scrolling through the Timeline
**When** I scroll up or down (touch or mouse)
**Then** Scrolling maintains 60fps performance:
- No janky animations or stuttering
- Smooth scroll on both mobile and desktop
- Content renders quickly as I scroll

**And** Infinite scroll loading:
- New entries load seamlessly (no scroll position jump)
- Skeleton placeholders appear during loading
- Once loaded, skeletons replaced with actual cards (smooth transition)

**And** Performance optimizations:
- Entry cards use React.memo to prevent unnecessary re-renders
- Long lists virtualized if performance degrades (>100 entries)
- Images (if added later) lazy-load as cards enter viewport

**And** Timeline responds immediately:
- Tap to expand: <100ms response time
- Scroll input: No noticeable delay (<16ms frame time)

**Technical Notes:**
- Use `React.memo()` for TimelineEntryCard component
- Measure scroll performance with Chrome DevTools Performance tab
- Target: 60fps (16.67ms per frame)
- Consider react-window or react-virtualized if >100 entries cause lag
- Use `will-change: transform` CSS for smooth animations
- Avoid heavy computations during scroll (debounce if needed)

---

### Story 5.4: Floating "Write Today" Button

As a user,
I want quick access to create today's entry from the Timeline,
So that I don't need to navigate back to start journaling.

**Acceptance Criteria:**

**Given** I am viewing the Timeline
**When** The screen loads
**Then** A FloatingActionButton (FAB) is visible:
- Position: Bottom-right corner (mobile), top-right corner (desktop)
- Label: "Write Today" with pencil icon ✏️
- Color: Accent blue (#2EAADC)
- Size: 56px diameter (mobile), 48px height (desktop pill button)
- Always visible (doesn't hide on scroll)

**And** When I tap/click the FAB:
- Navigate to EntryCreationView
- If today's entry doesn't exist, create new entry
- If today's entry exists but incomplete, resume editing
- If today's entry is completed, show message: "Today's entry is already complete! Come back tomorrow."

**And** FAB styling:
- Drop shadow for elevation (0 4px 8px rgba(0,0,0,0.2))
- Ripple effect on tap (Material Design pattern)
- Icon + text on desktop, icon only on mobile (if space constrained)

**And** Accessibility:
- aria-label: "Write today's journal entry"
- Keyboard accessible (Tab to focus, Enter to activate)
- Focus ring visible (2px accent color outline)

**Technical Notes:**
- Position: `position: fixed; bottom: 16px; right: 16px` (mobile)
- Desktop: `position: fixed; top: 80px; right: 24px` (below header)
- Use button element (not div) for accessibility
- z-index: 1000 (above timeline cards)
- Ripple effect: CSS animation or Framer Motion

---

## Epic 6: Onboarding & Premium Feature Validation

**Goal:** First-time users receive brief onboarding, and all users can signal interest in future premium features.

### Story 6.1: First-Time User Onboarding Overlay

As a first-time user,
I want a brief introduction to the app,
So that I understand the 4-section framework without being overwhelmed.

**Acceptance Criteria:**

**Given** I have just registered and logged in
**And** user_profiles.onboarded = false
**When** I land in the app
**Then** An onboarding overlay appears:
- Semi-transparent dark background (dims app behind it)
- Centered modal with onboarding content
- Can't dismiss accidentally (no click-outside-to-close)

**And** Onboarding content (single screen, not multi-step):
- Heading: "Welcome to Your Journaling Journey! 🎯"
- Brief explanation (3-4 sentences):
  - "We'll guide you through 4 quick sections each day:"
  - "Professional, Personal, Learning, and Gratitude"
  - "Takes under 5 minutes. After 7 entries, you'll unlock AI pattern recognition."
- [Start Writing] button (prominent, primary color)

**And** When I click [Start Writing]:
- Onboarding overlay fades out (300ms)
- user_profiles.onboarded = TRUE in database
- EntryCreationView appears with cursor in Section 1
- I never see onboarding again (unless I create new account)

**And** If I refresh page during first entry:
- Onboarding does NOT appear again (onboarded = TRUE persists)

**And** Onboarding completion time:
- Target: <30 seconds to read and click [Start Writing]
- No multi-step wizard (single screen only)

**Technical Notes:**
- Check onboarded status on login: `SELECT onboarded FROM user_profiles WHERE id = ?`
- If onboarded = false, render OnboardingOverlay component
- Update onboarded: `UPDATE user_profiles SET onboarded = TRUE WHERE id = ?`
- Modal styling: Flexbox center, max-width 400px, padding 32px
- Animation: Fade in on mount, fade out on dismiss (CSS transitions)

---

### Story 6.2: "Upgrade for Voice" Premium Feature Teaser

As a user,
I want to see a teaser for the future voice recording feature,
So that the product team can gauge interest before building it.

**Acceptance Criteria:**

**Given** I am viewing the AI feedback screen after completing an entry
**When** The screen displays
**Then** A subtle "Upgrade for Voice Entries" button is visible:
- Position: Below AI feedback and streak badge
- Style: Secondary button (outline, not filled)
- Text: "✨ Upgrade for Voice Entries"
- Color: Warm amber (#D9730D) outline

**And** When I click the button:
- Modal opens with message:
  - "Voice Entries Coming Soon! 🎤"
  - "Record your journal entries with voice and we'll transcribe them for you."
  - "Interested? We'll notify you when it's ready."
  - [Yes, I'm Interested] button (primary)
  - [Maybe Later] button (text link)

**And** When I click [Yes, I'm Interested]:
- A click event is tracked (analytics or database)
- Database: INSERT INTO feature_interest (user_id, feature_name, clicked_at) VALUES (?, 'voice_entries', NOW())
- Modal closes with message: "Thanks! We'll let you know when voice entries are ready. 🎉"
- Button changes to: "Voice Interest Recorded ✓" (disabled state)

**And** When I click [Maybe Later]:
- Modal closes (no tracking)
- Button remains visible for future clicks

**And** Button placement:
- Not intrusive (below primary content)
- Visible but not distracting
- Consistent placement across all feedback screens

**Technical Notes:**
- Create feature_interest table: (id, user_id, feature_name, clicked_at, UNIQUE(user_id, feature_name))
- Track clicks without building full voice feature
- Use Mixpanel or PostHog for analytics (optional)
- Button shows only once per user (after first click, shows "Recorded" state)
- Modal component: VoiceFeatureModal({onInterest, onDismiss})

---

### Story 6.3: Feature Interest Analytics Tracking

As a product owner,
I want to track how many users click "Upgrade for Voice Entries",
So that I can prioritize building the premium voice feature based on demand.

**Acceptance Criteria:**

**Given** The "Upgrade for Voice Entries" button is live
**When** A user clicks the button and confirms interest
**Then** A feature interest record is created:
- user_id: user who clicked
- feature_name: 'voice_entries'
- clicked_at: timestamp of click
- UNIQUE constraint prevents duplicate records per user

**And** I can query the database to see:
- Total unique users who showed interest
- Percentage of total users (interest_count / total_users)
- Click rate over time (trend analysis)

**And** Analytics dashboard (optional future enhancement) shows:
- "Voice Feature Interest: 47 users (23%)"
- Graph of interest over time
- Breakdown by user cohort (Day 1-7 vs Day 7+ users)

**And** Email notification (optional):
- If interest exceeds threshold (e.g., 50 users), send email to product team
- Subject: "Voice Feature Interest Threshold Reached"

**Technical Notes:**
- SQL query: `SELECT COUNT(DISTINCT user_id) FROM feature_interest WHERE feature_name = 'voice_entries'`
- Percentage: `(interest_count / (SELECT COUNT(*) FROM user_profiles)) * 100`
- Use Mixpanel, PostHog, or custom analytics table
- Prevent duplicate tracking: UNIQUE constraint on (user_id, feature_name)
- Export data to CSV for analysis if no dashboard exists

---

## Validation Checklist

### Requirements Coverage Validation

✅ **All 31 Functional Requirements Covered**
- FR-ENTRY (1-7): Epic 2 Stories 2.1-2.8
- FR-AI (1-7): Epic 3 Stories 3.1-3.6
- FR-HABIT (1-5): Epic 4 Stories 4.1-4.4
- FR-TIMELINE (1-4): Epic 5 Stories 5.1-5.4
- FR-TECH (1-8): Epic 1 Stories 1.1-1.7, Epic 2 Stories 2.6-2.7
- FR-UX (1-6): Epic 1 Story 1.7, Epic 2 Stories 2.1-2.2, Epic 6 Stories 6.1-6.3

✅ **All 17 Non-Functional Requirements Addressed**
- NFR-PERF (1-4): Epic 2 Story 2.6, Epic 3 Story 3.4, Epic 5 Story 5.3
- NFR-REL (1-3): Epic 1 Story 1.2, Epic 2 Story 2.6
- NFR-SEC (1-4): Epic 1 Stories 1.2-1.5, Epic 3 Story 3.1
- NFR-USE (1-4): Epic 2 Stories 2.1-2.8, Epic 6 Story 6.1

✅ **Architecture Requirements Implemented**
- Database schema with RLS: Epic 1 Story 1.2
- React + Tailwind + Vite: Epic 1 Story 1.1
- Supabase integration: Epic 1 Stories 1.3-1.5
- Claude API integration: Epic 3 Story 3.1
- PWA manifest: Epic 1 Story 1.6
- Auto-save pattern: Epic 2 Story 2.6
- Component architecture: All epics (EntrySection, AIFeedbackCard, etc.)

✅ **UX Design Requirements Implemented**
- Notion-inspired aesthetic: Epic 1 Story 1.7
- Sequential flow (no back button): Epic 2 Stories 2.2-2.5
- Auto-focus cursor: Epic 2 Story 2.1
- Typewriter effect for AI: Epic 3 Story 3.2
- Graceful streak recovery: Epic 4 Story 4.3
- Progress indicators: Epic 2 (all stories), Epic 3 Story 3.5
- Mobile touch targets (48px): Epic 2 Story 2.7
- Keyboard shortcuts: Epic 2 Story 2.8

### Story Quality Validation

✅ **All Stories Are:**
- User-value focused (not technical tasks)
- Sized for single dev agent completion
- Have clear acceptance criteria with Given/When/Then format
- Reference specific FRs/NFRs being fulfilled
- Independently completable in sequence (no future dependencies)

✅ **Database/Entity Creation:**
- Tables created in Epic 1 Story 1.2 (only tables needed immediately)
- No "create all tables upfront" anti-pattern
- Each story creates/modifies only what it needs

✅ **Epic Independence:**
- Epic 1: Standalone authentication + foundation (enables Epic 2)
- Epic 2: Standalone entry creation (uses Epic 1, enables Epic 3)
- Epic 3: Standalone AI feedback (uses Epic 1+2, enables Epic 4)
- Epic 4: Standalone streaks (uses Epic 1, enhances Epic 2+3)
- Epic 5: Standalone timeline (uses Epic 1+2, reads completed entries)
- Epic 6: Standalone onboarding + validation (uses Epic 1, enhances all)

### Implementation Readiness

✅ **Ready for Development:**
- All acceptance criteria are testable
- Technical notes provide implementation guidance
- Component names specified (EntrySection, AIFeedbackCard, etc.)
- API contracts defined (Supabase queries, Claude API calls)
- Database schema complete with RLS policies
- Performance targets specified (<3s AI, 60fps scrolling, etc.)

✅ **Total Story Count: 22 implementation-ready stories**
- Epic 1: 6 stories
- Epic 2: 8 stories
- Epic 3: 6 stories
- Epic 4: 3 stories (Story 4.3 may be deferred post-MVP)
- Epic 5: 4 stories
- Epic 6: 3 stories

---

## Epic & Story Breakdown Complete

This document provides implementation-ready epics and stories for the journal PWA. All 31 functional requirements, 17 non-functional requirements, and additional architecture/UX requirements are covered across 6 epics and 24 stories.

**Next Step:** Implementation Readiness Check, then Sprint Planning.

---
