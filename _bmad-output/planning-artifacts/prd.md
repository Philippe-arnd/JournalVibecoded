---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-07-projecttype', 'step-08-scoping', 'step-09-functional', 'step-10-nfr', 'step-11-complete']
inputDocuments:
  - '/home/dmin/dev/journal/_bmad-output/planning-artifacts/product-brief-dev-2026-01-14.md'
  - '/home/dmin/dev/journal/_bmad-output/analysis/brainstorming-session-2026-01-14.md'
briefCount: 1
brainstormingCount: 1
researchCount: 0
projectDocsCount: 0
workflowType: 'prd'
classification:
  projectType: 'web_app'
  domain: 'general'
  complexity: 'low'
  projectContext: 'greenfield'
---

# Product Requirements Document - journal

**Author:** Phil
**Date:** 2026-01-17

## Success Criteria

### User Success

**Aha Moment - Pattern Recognition (Week 2 Target)**
- Users experience their first meaningful pattern insight by beginning of Week 2
- AI surfaces similar past entries that resonate with the user
- This is when users realize the app has memory and intelligence, not just storage

**Habit Formation Success**
- Daily Active Usage during morning routine
- Daily Completion Rate for all 4 sections (professional, personal, learning, gratitude)
- Streak Length - consecutive days of journaling activity
- Return Frequency within 24 hours for next entry

**Value Realization Moment (Week 2 Target)**
- User continues logging in daily beyond novelty phase
- User searches historical entries to find past insights
- User completes entries in under 5 minutes (respecting time constraint)

### Business Success

**Phase 1: Personal Use + Small Circle (Months 0-3)**
- 15-20 active users after 3 months from personal network
- Top-tier retention rates: >70% of users still active at Day 7, >30-40% at Day 30
- Professional quality standard maintained ("do it right")
- Voice feature interest signals (at least 1-2 users clicking "Upgrade for Voice")

**Phase 2: Sustainable Small-Scale Operation (Months 3-12)**
- Top 10-20% of industry retention rates for habit-forming apps
- High percentage of registered users actively journaling daily/weekly
- Small group of users choosing this over Journey/Day One

### Technical Success

- PWA performs reliably across devices (mobile, desktop)
- Auto-save functionality works seamlessly
- Supabase backend handles data persistence without issues
- AI response latency <3 seconds
- Entry save success rate >99.9%

### Measurable Outcomes

**3 Months:**
- 15-20 engaged users from personal network
- Users experiencing Week 2 aha moments consistently
- Clear signal about voice coaching demand

**12 Months:**
- Proven habit-forming product with exceptional retention
- Premium feature validated (or deprioritized) based on real usage
- Users consistently choosing this over Journey/Day One alternatives

## Product Scope

### MVP - Minimum Viable Product

**1. Guided 4-Section Journaling Framework**
- Sequential flow: Professional recap, Personal recap, Learning reflections, Gratitude
- Question-driven prompts guide users
- Sub-5-minute completion target
- All four sections must be completed for daily entry to count

**2. Write-First User Experience**
- Open app → immediately begin writing
- First-time users see brief onboarding
- Returning users land directly in today's entry if incomplete
- Simple, modern interface with warm tones (Notion-inspired)

**3. Progressive AI Coaching System**
- Day 1-2: Simple observations and encouragement
- Entry Progress Threshold: Visual progress bar "X/7 entries completed"
- Post-7 Entries: Pattern recognition, similar past entry references with excerpts
- Core AI Principle: Something intelligent after EVERY entry, scaling in depth

**4. Habit Formation Mechanics**
- Daily Streak Visualization (Duolingo-style)
- Completion badges for milestones (7-day, 30-day, 90-day)
- Progress tracking toward 7-entry threshold

**5. Vertical Timeline Browsing**
- Simple chronological scroll through past entries
- Date headers separate entries
- Tap/click to expand and read full historical entry

**6. Premium Feature Interest Validation**
- "Upgrade for Voice Entries" button visible in UI
- Tracks clicks/interest signals without building full feature

**7. Technical Foundation**
- PWA Architecture (mobile, desktop, installable)
- Supabase Backend
- Data persistence and reliable entry storage
- Auto-save with online sync
- AI Integration (Claude API for coaching and pattern recognition)

**8. Clean, Modern Visual Identity**
- Notion-inspired aesthetic: approachable, professional, uncluttered
- Warm, positive tones
- Creates welcoming environment for daily reflection

### Growth Features (Post-MVP)

**Enhanced Intelligence & Context (Months 3-6)**
- "On This Day" memories showing entries from prior years
- Yesterday's entry context displayed before starting today
- Similar past entries automatically surfaced in timeline view
- Search functionality with AI-powered semantic search
- Brain dump space for unstructured journaling

**Voice Recording Premium Tier (Months 6-12)**
- Record audio responses to guided 4-section prompts
- Automatic transcription (Whisper API or similar)
- User edits/refines transcribed text before saving
- Premium tier ≤$5/month to cover infrastructure costs

### Vision (Future)

**Quantified Self Integration (Year 2+)**
- Connect with fitness trackers (Oura Ring, Whoop)
- Correlate journal sentiment with sleep quality, activity levels
- Personal dashboard showing growth over time
- Export capabilities for personal data analysis

**Sustainable Growth (Year 2+)**
- Optional anonymous pattern sharing
- Opt-in accountability partners
- Customization options (modify 4 sections, custom themes)
- Platform expansion (native apps if PWA limitations encountered)

## User Journeys

### Journey 1: Alex's Daily Morning Flow (Primary Success Path)

Alex opens the app at 6:15 AM during her Miracle Morning routine. The write-first UX immediately presents today's entry with the first guided question: "What did you accomplish professionally yesterday?" She types a quick recap of her marketing campaign launch, then moves through personal activities (evening run, dinner with friends), learning (podcast about delegation), and gratitude (supportive team). The 4-section flow takes 4 minutes. After completing, the AI coach responds: "I noticed you mentioned feeling energized about the campaign launch—that momentum is powerful!" Alex sees her 12-day streak and the progress bar showing "12/7 entries—deeper insights unlocked!" She closes the app feeling accomplished and ready for her workout.

### Journey 2: Marcus Recovers from Missed Days (Edge Case / Recovery)

Marcus missed 3 days of journaling due to a work crisis. He opens the app feeling guilty about his broken streak. Instead of shame, the app shows: "Welcome back! Your last entry was Thursday. Let's capture today's reflection." The write-first UX doesn't punish—it just invites him to continue. He completes today's entry quickly. The AI coach says: "You mentioned similar work stress on Jan 5th: 'Felt overwhelmed by delegation challenges...' You navigated that successfully—you've got this." Marcus realizes the app's memory helps him see his own resilience patterns. His streak resets to 1, but he's motivated to rebuild because the AI coaching provides real value beyond gamification.

### Journey 3: Phil Validates MVP with Personal Use (Secondary User / Creator)

Phil uses the app daily for 2 weeks to validate the experience before sharing with his personal network. He tests edge cases: skipping days intentionally, writing very short vs. detailed entries, using it on mobile during commute vs. desktop at home. On Day 14, the AI surfaces a pattern: "You mentioned 'morning energy' in 8 of your last 10 entries—mornings seem to be your peak creative time." Phil realizes the pattern recognition actually works and isn't just generic AI fluff. He shares the app link with 5 close friends who follow Miracle Morning routines, confident it solves a real problem. The professional quality standard he insisted on ("do it right") is validated through his own daily use.

## Technical Requirements

### PWA Architecture

**Platform Support:**
- Modern browsers: Chrome, Safari, Firefox, Edge (latest 2 versions)
- Mobile: iOS Safari 14+, Android Chrome 90+
- Desktop: Windows, macOS, Linux (via browser)

**PWA Capabilities:**
- Installable to home screen (mobile and desktop)
- Service Worker for installability (no offline caching for MVP)
- App manifest for native-like experience
- Responsive design (mobile-first, scales to desktop)
- Auto-save functionality with 500ms debounce

**Authentication & Security:**
- Supabase Auth for user authentication
- Email/password login (social auth deferred to post-MVP)
- Session management with secure token storage
- All data encrypted in transit (HTTPS) and at rest (Supabase encryption)

**Data Persistence:**
- Supabase PostgreSQL for persistent cloud storage
- Auto-save strategy: Debounced writes (500ms) to cloud database
- Optimistic UI updates for responsive feel
- Conflict resolution: Last-write-wins (single-user app simplifies this)

**AI Integration:**
- Claude API (Anthropic) for coaching responses and pattern recognition
- API key management via environment variables
- Rate limiting consideration for free tier validation
- Response caching strategy to minimize API costs during MVP

**Performance Targets:**
- Initial page load: <2 seconds on 3G
- Entry save (online): <500ms
- AI response: <3 seconds (as defined in success criteria)
- Timeline scroll: 60fps smooth scrolling

## Functional Requirements

### FR-ENTRY: Entry Creation & Management

**FR-ENTRY-01:** User can create a new daily journal entry through a guided 4-section flow (Professional, Personal, Learning, Gratitude)

**FR-ENTRY-02:** User can answer question-driven prompts within each of the 4 sections to eliminate blank page paralysis

**FR-ENTRY-03:** User can complete a full 4-section entry in under 5 minutes

**FR-ENTRY-04:** User can save entry progress online and sync automatically

**FR-ENTRY-05:** User can see completion status for each of the 4 sections (completed vs incomplete)

**FR-ENTRY-06:** User can only mark daily entry as "complete" after all 4 sections are filled

**FR-ENTRY-07:** User can write entries using mobile (touch) or desktop (keyboard) interfaces seamlessly

### FR-AI: AI Coaching & Pattern Recognition

**FR-AI-01:** User receives AI-generated coaching response immediately after completing each daily entry

**FR-AI-02:** User receives simple observational feedback from AI during Days 1-2 (e.g., "I noticed you mentioned feeling energized")

**FR-AI-03:** User sees visual progress bar showing "X/7 entries completed" until reaching 7-entry threshold

**FR-AI-04:** User receives pattern recognition insights from AI after completing 7+ entries (e.g., "You experienced similar stress 2 weeks ago")

**FR-AI-05:** User sees excerpts from similar past entries when AI identifies patterns

**FR-AI-06:** User receives AI coaching that scales in depth based on accumulated entry count

**FR-AI-07:** System delivers AI responses within 3 seconds of entry completion

### FR-HABIT: Habit Formation & Engagement

**FR-HABIT-01:** User can see current daily streak count prominently displayed

**FR-HABIT-02:** User receives visual streak indicator (Duolingo-style) showing consecutive days journaled

**FR-HABIT-03:** User earns completion badges for milestone streaks (7-day, 30-day, 90-day)

**FR-HABIT-04:** User sees progress tracking toward 7-entry threshold for unlocking deeper AI insights

**FR-HABIT-05:** User can view streak history and see when streaks were broken/rebuilt

### FR-TIMELINE: Timeline & History

**FR-TIMELINE-01:** User can browse past entries in a vertical chronological timeline

**FR-TIMELINE-02:** User sees date headers separating each entry in the timeline

**FR-TIMELINE-03:** User can tap/click to expand and read full historical entry content

**FR-TIMELINE-04:** User can scroll through timeline at 60fps smooth scrolling performance

### FR-TECH: Technical Foundation & Infrastructure

**FR-TECH-01:** User can install app to home screen on mobile and desktop devices

**FR-TECH-02:** User can write entries online with automatic sync to cloud database

**FR-TECH-03:** User can authenticate using email/password via Supabase Auth

**FR-TECH-04:** User data is encrypted in transit (HTTPS) and at rest (Supabase encryption)

**FR-TECH-05:** User can access app on modern browsers (Chrome, Safari, Firefox, Edge - latest 2 versions)

**FR-TECH-06:** System saves entry drafts automatically using auto-save with 500ms debounce

**FR-TECH-07:** System achieves entry save success rate >99.9%

**FR-TECH-08:** System loads initial page in <2 seconds on 3G connection

### FR-UX: User Experience & Interface

**FR-UX-01:** User lands directly in write-first interface when opening app with incomplete entry

**FR-UX-02:** First-time user sees brief onboarding explaining the 4-section framework

**FR-UX-03:** User experiences Notion-inspired aesthetic (clean, modern, minimalist with warm tones)

**FR-UX-04:** User sees "Upgrade for Voice Entries" button in UI for premium feature interest validation

**FR-UX-05:** System tracks clicks on "Upgrade for Voice Entries" button without building full voice feature

**FR-UX-06:** User completes entries on mobile-first responsive design that scales to desktop

## Non-Functional Requirements

### NFR-PERFORMANCE: Performance & Responsiveness

**NFR-PERF-01:** AI coaching responses must complete within 3 seconds of entry submission

**NFR-PERF-02:** Entry saves (online) must complete within 500ms

**NFR-PERF-03:** Timeline scrolling must maintain 60fps for smooth user experience

**NFR-PERF-04:** Initial page load must complete within 2 seconds on 3G connection

### NFR-RELIABILITY: Reliability & Data Integrity

**NFR-REL-01:** Entry save success rate must exceed 99.9%

**NFR-REL-02:** PWA must function reliably across modern browsers (Chrome, Safari, Firefox, Edge)

**NFR-REL-03:** System must handle concurrent writes gracefully (single-user simplifies conflict resolution)

### NFR-SECURITY: Security & Privacy

**NFR-SEC-01:** All user data must be encrypted in transit using HTTPS

**NFR-SEC-02:** All user data must be encrypted at rest via Supabase encryption

**NFR-SEC-03:** Authentication must use secure session management via Supabase Auth

**NFR-SEC-04:** AI API keys must be managed via environment variables (never exposed client-side)

### NFR-USABILITY: Usability & Accessibility

**NFR-USE-01:** Entry completion flow must be achievable in under 5 minutes for 90%+ of users

**NFR-USE-02:** Interface must be fully responsive from 320px (mobile) to 1920px+ (desktop)

**NFR-USE-03:** App must meet WCAG 2.1 Level AA accessibility standards for core journaling flow

**NFR-USE-04:** Onboarding must be completable in under 2 minutes for first-time users

---

## PRD Complete

This Product Requirements Document defines the complete scope, requirements, and technical specifications for the journal PWA. Next steps: UX Design, Architecture, and Epics & Stories breakdown.
