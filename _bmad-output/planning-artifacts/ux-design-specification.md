---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
inputDocuments:
  - '/home/dmin/dev/journal/_bmad-output/planning-artifacts/prd.md'
  - '/home/dmin/dev/journal/_bmad-output/planning-artifacts/product-brief-dev-2026-01-14.md'
workflowType: 'ux-design'
fastTracked: true
completedRetroactively: [4, 5, 9]
---

# UX Design Specification - journal

**UX Designer:** Sally
**Date:** 2026-01-17

---

## Input Documents

This specification is informed by:
- Product Requirements Document (PRD)
- Product Brief

---

## Executive Summary

### Project Vision

journal is a PWA-based daily journaling application designed to make personal reflection an effortless habit. The core innovation is a guided 4-section framework (Professional, Personal, Learning, Gratitude) that eliminates blank page paralysis through question-driven prompts. The app features progressive AI coaching that evolves from simple encouragement to pattern recognition, creating a "Week 2 aha moment" when users realize the app has memory and intelligence, not just storage. The UX philosophy is "write-first" - users open the app and immediately start writing with zero navigation friction, completing their daily entry in under 5 minutes.

### Target Users

**Primary Persona: Alex (28, Marketing Manager)**
- Uses app during Miracle Morning routine (6-7 AM)
- Needs sub-5-minute completion to fit into structured morning
- Values momentum, streak tracking, and feeling accomplished
- Mobile-first user during commute and morning routine

**Secondary Persona: Marcus (35, Software Engineer)**
- Struggles with guilt from missed days and broken streaks
- Needs graceful recovery experience (not shame-based)
- Values AI memory showing personal resilience patterns
- Uses both mobile and desktop contexts

**Power User: Phil (Creator)**
- Tests edge cases and validates quality
- Will share with personal network of 15-20 Miracle Morning followers
- Expects professional-grade experience ("do it right")
- Validates through own daily use before distribution

### Key Design Challenges

1. **Sub-5-Minute Constraint** - Every interaction must be ruthlessly optimized for speed. No extra clicks, no navigation friction, no decision fatigue. The entire 4-section flow must feel effortless and fast.

2. **Progressive Complexity Management** - Day 1 users need simplicity and encouragement without overwhelm. Day 14+ users need depth, pattern insights, and historical context. The same interface must elegantly serve both experience levels.

3. **Mobile-First Touch Optimization** - Primary use case is mobile during morning routines. Keyboard entry must be frictionless, progress indicators must be visible without scrolling, and AI coaching responses must be readable and inspiring on small screens.

### Design Opportunities

1. **Emotional Design for Habit Formation** - Combining Notion-inspired warm minimalism with streak mechanics and AI encouragement creates a powerful positive feedback loop. Exceptional UX in this area directly drives 70%+ Day 7 retention targets.

2. **Progressive Value Disclosure** - Show the 7-entry progress bar prominently, tease pattern recognition capabilities early, then deliver the "aha moment" exactly when promised (Week 2). Build anticipation and curiosity through intentional UX choreography.

3. **Zero-to-Writing Speed as Competitive Advantage** - If we achieve "open app → start typing in <1 second" with no cognitive load, we create an unbeatable advantage over Journey, Day One, and generic journal apps. This is the UX superpower that wins users.

---

## Core User Experience

### Defining Experience

The core experience of journal centers on a single, daily ritual: completing a guided 4-section entry (Professional, Personal, Learning, Gratitude) in under 5 minutes. Users open the app and immediately begin writing - no navigation, no decisions, no blank page anxiety. Question-driven prompts guide them sequentially through each section, eliminating choice paralysis while unlocking reflective depth quickly.

The experience is designed for mobile-first morning routines (6-7 AM during Miracle Morning practice) but scales seamlessly to desktop contexts. The entire flow optimizes for speed without feeling rushed - users should feel accomplished and reflective, not exhausted.

### Platform Strategy

**PWA Architecture (Cross-Platform)**
- Progressive Web App for unified experience across mobile and desktop
- Mobile-first responsive design (320px to 1920px+)
- Installable to home screen on iOS and Android
- No offline functionality required for MVP (online-only)
- No device-specific capabilities needed

**Browser Support**
- Chrome, Safari, Firefox, Edge (latest 2 versions)
- iOS Safari 14+, Android Chrome 90+

**Input Methods**
- Primary: Touch-based mobile (thumb-typing during commute/morning)
- Secondary: Desktop keyboard (home office evening reflections)
- Interface must feel natural for both without compromise

### Effortless Interactions

**Zero-Friction Entry Start**
Users open the app and find their cursor already in the first text field for today's entry. No "New Entry" button, no navigation menu, no decisions - just immediate writing.

**Sequential Flow Guidance**
Users never wonder "what's next?" The app guides them through all 4 sections in order with clear progress indication (Section 1 of 4, Section 2 of 4, etc.).

**Auto-Save as You Type**
No manual save button exists. Entries persist automatically as users write, eliminating the cognitive load of "did I save?"

**Instant AI Feedback Delivery**
After completing the final section, AI-generated feedback appears within 3 seconds without requiring extra clicks or navigation. The feedback is the natural conclusion of the entry ritual.

### Critical Success Moments

**1. Entry Completion → AI Feedback (THE MOMENT)**
User finishes the 4th section (Gratitude) and taps "Complete Entry" → AI feedback appears instantly. This is THE make-or-break UX moment. The AI response must feel personal, intelligent, and valuable. This is when users feel heard, understood, and motivated to return tomorrow. If this feels generic, slow, or buried, we lose the user.

**AI Feedback Types:**
- **Days 1-2:** Simple observations and encouragement ("I noticed you mentioned feeling energized about the campaign launch—that momentum is powerful!")
- **Days 7+:** Pattern recognition with citations from past entries ("You mentioned similar work stress on Jan 5th: 'Felt overwhelmed by delegation challenges...' You navigated that successfully—you've got this.")
- **Ongoing:** Advice, insights about growth themes, resilience patterns

**2. First Entry Success**
New user completes all 4 sections in under 5 minutes on Day 1, feels accomplished (not exhausted), and receives encouraging AI response that makes them want to return tomorrow.

**3. Week 2 "Aha Moment"**
After 7+ entries, AI surfaces a meaningful pattern with citation from past entry. User realizes the app has memory and intelligence, not just storage. This is when retention transforms from novelty to genuine value.

**4. Streak Milestone Reinforcement**
User sees "7-day streak!" badge after completing entry, reinforced by AI acknowledging the achievement: "You've journaled 7 days straight—that's when patterns start emerging!"

### Experience Principles

**1. Write-First, Navigate Never**
Users should start writing within 1 second of opening the app. Navigation is invisible until after entry completion. The app assumes users want to write today's entry—because they do.

**2. Sequential Clarity Over Choice Paralysis**
Guide users through the 4 sections in fixed order. No decisions, no blank pages, just prompts and progress. Structure creates freedom for reflection.

**3. AI Feedback as Reward Loop**
Every entry ends with intelligent, personalized feedback delivered immediately. This is the dopamine hit that drives habit formation and 70%+ Day 7 retention. The AI response is not a "nice to have"—it's the product's core value proposition.

**4. Speed Without Sacrifice**
Sub-5-minute completion is non-negotiable, but users should feel reflective (not rushed). Question prompts unlock depth quickly without requiring essay-length responses.

**5. Progressive Intelligence**
Day 1 users get encouragement. Day 14 users get pattern insights with past entry citations. Same interface, scaling value. The UX must elegantly serve both experience levels without overwhelming beginners.

---

## Desired Emotional Response

### Primary Emotional Goals

**Accomplished & Energized**
Users should close the app feeling like they've achieved something meaningful in under 5 minutes. The completion of all 4 sections creates a sense of momentum and productivity that carries into their day. This isn't exhaustion—it's energizing clarity.

**Understood & Validated**
The AI feedback moment should make users feel heard and seen. When the AI acknowledges specific themes from their entry ("I noticed you mentioned feeling energized about the campaign..."), users experience validation. At Week 2+, pattern recognition creates profound realization: "This app actually remembers and understands my journey."

**Calm & Reflective**
Despite the speed constraint (<5 minutes), users should never feel rushed or anxious. The Notion-inspired warm minimalism, generous whitespace, and guided prompts create a calm container for reflection. This is a peaceful morning ritual, not a stressful task.

### Emotional Journey Mapping

**First Discovery (Onboarding):**
- **Feeling:** Curious but skeptical - "Will this actually be different from other journal apps?"
- **Design Response:** Brief, non-patronizing onboarding. Immediately demonstrate value by starting the writing experience, not explaining features.

**First Entry Completion:**
- **Feeling:** Surprised delight - "That was actually easy and felt good"
- **Design Response:** AI feedback that's warm and encouraging (not generic). Visible progress toward 7-entry threshold creates anticipation.

**Days 2-6 (Habit Formation):**
- **Feeling:** Building confidence and momentum - "I'm doing this!"
- **Design Response:** Streak visualization reinforces consistency. Each entry feels faster due to familiarity.

**Week 2 "Aha Moment" (After 7 Entries):**
- **Feeling:** Profound realization - "This app knows me. It's not just storage—it's intelligent."
- **Design Response:** AI surfaces pattern with cited past entry excerpt. User sees their own growth and recurring themes.

**Returning After Missed Days:**
- **Feeling:** Relief, not guilt - "I can come back without shame"
- **Design Response:** Welcoming "Welcome back!" message (never "You broke your streak!"). AI focuses on resilience patterns, not punishment.

**Timeline Browsing:**
- **Feeling:** Nostalgic curiosity and self-discovery - "Look how much I've grown"
- **Design Response:** Easy scrolling, expandable entries, past AI insights preserved. Users rediscover their own wisdom.

### Micro-Emotions

**Confidence over Confusion:**
- Sequential flow eliminates "What do I write?" anxiety
- Question prompts provide structure without constraint
- Progress indicator shows clear path to completion

**Trust over Skepticism:**
- Auto-save removes "Did I lose my work?" fear
- AI citations prove intelligence (not just generic responses)
- Consistent UX builds reliability expectations

**Accomplishment over Frustration:**
- <5-minute completion target respected
- Every entry ends with AI feedback (never empty void)
- Visible streak counter reinforces habit success

**Delight over Satisfaction:**
- Week 2 pattern recognition exceeds expectations
- Typewriter effect on AI feedback feels personal
- Milestone celebrations (7-day, 30-day) create joy moments

**Calm over Anxiety:**
- Warm color palette reduces stress
- Generous whitespace prevents overwhelm
- No navigation decisions during entry (full focus)

**Belonging over Isolation:**
- AI feedback creates conversational relationship
- Past entry citations show "your story matters"
- Gratitude section fosters positive mindset

### Design Implications

**If we want users to feel ACCOMPLISHED:**
- Show completion progress (Section X of 4)
- Celebrate entry completion with AI feedback immediately
- Display streak count prominently after feedback
- Use affirmative language ("Great work!" not "Entry saved")

**If we want users to feel UNDERSTOOD:**
- AI feedback must reference specific content from entry
- Pattern recognition must cite exact excerpts with dates
- Avoid generic responses ("You wrote about work today" ✗ → "I noticed you mentioned feeling energized about the campaign launch" ✓)

**If we want users to feel CALM:**
- Remove all non-essential UI during entry creation
- Use warm neutrals (#FBF9F6 cream, not stark white)
- Generous padding (24px-32px between sections)
- Soft animations (300-400ms easing, never jarring)

**If we want users to feel CONFIDENT:**
- Auto-focus cursor in first section (no "Where do I click?" moment)
- Auto-save indicator confirms safety
- Clear "Next Section" button (no ambiguity)
- Progress bar shows "6 more to unlock insights" (transparency builds trust)

**If we want users to feel DELIGHTED:**
- Typewriter effect on AI feedback (personal, not instant dump)
- Celebrate 7-day milestone with animation + confetti
- Surprise with pattern recognition at Week 2 (under-promise, over-deliver)
- Micro-interactions: buttons scale on tap, smooth transitions

### Emotional Design Principles

**1. Speed Without Stress**
Every UX decision must optimize for <5-minute completion while maintaining calm, reflective atmosphere. Speed comes from removing friction, not from rushing the user.

**2. Intelligence Over Features**
Users should feel the app is smart (pattern recognition, memory) rather than feature-rich. One intelligent insight beats ten mediocre features.

**3. Warmth Over Sterility**
The app should feel like a supportive friend, not a clinical tool. Warm color palette, encouraging AI tone, and graceful recovery from missed days all support this.

**4. Clarity Over Cleverness**
No clever UI tricks that create confusion. Sequential flow, clear prompts, obvious next actions. Users should never wonder "What do I do now?"

**5. Growth Over Guilt**
Focus on progress and patterns, never on punishment or shame. Broken streaks reset gracefully. Missed days become opportunities for resilience insights.

---

## Design Inspiration & References

### Primary Inspiration: Notion

**What We're Borrowing:**
- Clean, uncluttered interface with generous whitespace
- Warm neutral color palette (cream backgrounds, soft grays)
- Inter font family for readability and modernity
- Minimalist aesthetic that doesn't feel cold
- Focus on content over chrome
- Approachable yet professional tone

**What We're NOT Borrowing:**
- Complex nested structures or database views
- Extensive feature set and customization options
- Notion's learning curve (we must be instantly usable)

### Secondary References

**Duolingo (Habit Formation):**
- Streak visualization with fire emoji
- Milestone celebrations (7-day, 30-day badges)
- Daily commitment mechanic without punishment
- Progressive unlock system (our 7-entry threshold)

**Linear (Speed & Polish):**
- Keyboard shortcuts for power users
- Smooth animations (300-400ms easing)
- Attention to micro-interactions
- Fast, responsive interface (<100ms feedback)

**Headspace (Calm & Warmth):**
- Warm color palette for mindfulness
- Encouraging, non-judgmental tone
- Simple, focused user flows
- Celebration of small wins

### Visual Style Direction

**Color Psychology:**
- Warm neutrals create calm, welcoming atmosphere
- Cream backgrounds (#FBF9F6) softer than stark white
- Accent colors used sparingly for meaning (success = teal, warning = amber, error = coral)
- Avoid cold blues; prefer warm blues (#2EAADC) if needed

**Typography Approach:**
- Inter: Modern sans-serif with excellent readability
- Generous line height (1.5) for comfortable reading
- Clear hierarchy (32px H1, 24px H2, 16px body)
- Avoid excessive font weights (regular and semi-bold sufficient)

**Spacing & Layout:**
- 8px base unit for consistent rhythm
- Generous section padding (32-48px)
- Max content width 800px (desktop) for readability
- Mobile-first breakpoints (320px, 768px, 1024px)

**Interaction Design:**
- Subtle animations (fade, slide, scale)
- Haptic feedback on mobile (button taps, completions)
- Loading states that feel fast (<3s for AI, spinner + progress)
- Micro-interactions that delight without distracting

### Anti-Patterns to Avoid

**❌ Blank Page Syndrome:**
Never show empty state without guidance. Always provide prompts or context.

**❌ Notification Spam:**
No push notifications for MVP. No guilt-inducing "You haven't journaled today!" messages.

**❌ Overwhelming Customization:**
Resist urge to add themes, custom prompts, section reordering. Simplicity is the feature.

**❌ Generic AI Responses:**
Never "You did great today!" without context. Always reference specific content.

**❌ Shame-Based Motivation:**
No "You broke your 30-day streak!" messaging. Focus on recovery and resilience.

---

## Design System Foundation

### Color Palette (Notion-Inspired)

**Primary Colors:**
- Background: #FFFFFF (white) / #FAFAFA (off-white for subtle depth)
- Text Primary: #37352F (warm dark gray)
- Text Secondary: #787774 (medium gray)
- Accent/Interactive: #2EAADC (calm blue) or #D9730D (warm amber)

**Feedback & Status:**
- Success/Positive: #0F7B6C (teal green)
- Warning/Progress: #FFB224 (warm yellow)
- Error: #E03E3E (coral red)
- Neutral: #E3E2E0 (light warm gray)

**Warm Tone Overlays:**
- Subtle warm backgrounds: #FBF9F6 (cream)
- Section dividers: #E9E7E4 (warm light gray)

### Typography

**Font Family:**
- Primary: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
- Alternative: System UI stack for performance

**Type Scale:**
- Heading 1: 32px / 2rem (bold, tight leading)
- Heading 2: 24px / 1.5rem (semi-bold)
- Heading 3: 18px / 1.125rem (semi-bold)
- Body: 16px / 1rem (regular, 1.5 line height)
- Body Small: 14px / 0.875rem (regular)
- Caption: 12px / 0.75rem (medium)

### Spacing System

**Base Unit: 8px**
- xs: 4px (0.25rem)
- sm: 8px (0.5rem)
- md: 16px (1rem)
- lg: 24px (1.5rem)
- xl: 32px (2rem)
- 2xl: 48px (3rem)
- 3xl: 64px (4rem)

**Generous breathing room** - Notion-inspired whitespace for calm, uncluttered feel

### Visual Principles

1. **Minimalist Clarity** - Remove all non-essential UI elements; focus on content
2. **Warm Neutrals** - Use cream/warm gray backgrounds instead of stark white
3. **Soft Corners** - Border radius 8px-12px for approachable feel
4. **Subtle Shadows** - Minimal elevation (0-2px) for depth without heaviness
5. **Purposeful Color** - Use accent colors sparingly for CTAs and feedback only

---

## Information Architecture

### Screen Hierarchy

**Primary Screens (MVP):**
1. **Entry Creation** (Default landing) - Write today's entry
2. **AI Feedback** (Post-completion) - View coaching response
3. **Timeline** - Browse historical entries
4. **Onboarding** (First-time users only) - Brief intro to 4-section flow

**Secondary/Future:**
- Profile/Settings
- Search (post-MVP)
- Brain Dump (post-MVP)

### Navigation Structure

**Minimal Navigation Philosophy:**
- **No persistent navigation bar** during entry creation
- Navigation appears **only after entry completion**
- Bottom tab bar (mobile) or minimal sidebar (desktop) with 2 tabs:
  - **Today** (entry creation) - primary
  - **Timeline** (history browsing) - secondary

**Navigation States:**
1. **During Entry Creation** - Full screen, no nav visible, just progress indicator
2. **After Entry Completion** - Show AI feedback + nav to Timeline
3. **Timeline View** - Nav visible with "Write Today" CTA prominent

### Content Organization

**Entry Creation Flow:**
- Section 1: Professional Recap
- Section 2: Personal Recap
- Section 3: Learning Reflections
- Section 4: Gratitude
- Completion: AI Feedback Display

**Timeline Organization:**
- Reverse chronological (newest first)
- Date headers (Today, Yesterday, Jan 15, Jan 14...)
- Collapsed entry cards (expand to read full content)
- Infinite scroll

---

## User Journey Maps

### Journey 1: First-Time User - Entry Creation

**Goal:** Complete first entry in <5 minutes, receive encouraging AI feedback

1. **Open App** → Brief onboarding overlay (15 seconds)
   - "Welcome! Let's create your first entry. We'll guide you through 4 quick sections."
   - [Start Writing] button

2. **Section 1: Professional** → Cursor auto-focused in text field
   - Prompt: "What did you accomplish professionally yesterday?"
   - Progress: 1/4 visible at top
   - User types 2-3 sentences
   - [Next Section] button appears

3. **Section 2: Personal** → Smooth transition, cursor auto-focused
   - Prompt: "What did you do with your personal time yesterday?"
   - Progress: 2/4
   - User types response
   - [Next Section]

4. **Section 3: Learning** → Same pattern
   - Prompt: "What did you learn recently? (podcast, book, conversation)"
   - Progress: 3/4
   - User types response
   - [Next Section]

5. **Section 4: Gratitude** → Final section
   - Prompt: "What are you grateful for today?"
   - Progress: 4/4
   - User types response
   - [Complete Entry] button (primary, prominent)

6. **AI Feedback Display** → Immediate transition (<3 seconds)
   - Animated appearance of AI response
   - Encouraging message: "Great start! I noticed you mentioned feeling energized about your team—that's powerful momentum."
   - Streak indicator: "1-day streak 🎯"
   - Progress bar: "1/7 entries - 6 more to unlock deeper insights"
   - [View Timeline] and [Done] buttons

**Success Metrics:** Entry completed, user feels accomplished, understands next step

---

### Journey 2: Returning User - Daily Entry (Day 8+)

**Goal:** Complete entry quickly, receive pattern-recognition feedback

1. **Open App** → Lands directly in Section 1 (no onboarding)
   - If entry incomplete for today: Resume where left off
   - If entry complete: Show yesterday's AI feedback + [Start Today's Entry]

2. **Entry Flow** → Same 4-section sequence (familiar, fast)
   - User completes in 3.5 minutes (faster due to familiarity)
   - Minimal friction, muscle memory established

3. **AI Feedback with Pattern Recognition** → The "Aha Moment"
   - "You mentioned work stress today. I noticed something similar on Jan 5th:"
   - **[Cited Excerpt]:** "Felt overwhelmed by delegation challenges..."
   - "You navigated that successfully—you've got this."
   - Streak indicator: "8-day streak 🔥"
   - [View Similar Entries] option appears

**Success Metrics:** User experiences pattern recognition, feels understood, retention increases

---

### Journey 3: Timeline Browsing - Finding Past Insights

**Goal:** Browse historical entries, discover patterns

1. **From AI Feedback Screen** → Tap [View Timeline]

2. **Timeline View** → Reverse chronological scroll
   - Today (completed, shows AI feedback summary)
   - Yesterday (tap to expand)
   - Jan 15 (tap to expand)
   - Smooth infinite scroll

3. **Expand Entry** → Tap card to read full content
   - Shows all 4 sections
   - Shows AI feedback received on that day
   - [Close] to collapse

4. **Return to Writing** → Prominent [Write Today] floating button always visible

**Success Metrics:** User discovers past insights, validates journaling value

---

### Journey 4: Recovery Flow - Returning After Missed Days (Marcus Scenario)

**Goal:** Graceful re-entry without shame

1. **Open App After 3 Days** → Lands in Section 1
   - Subtle message: "Welcome back! Your last entry was Thursday. Let's capture today's reflection."
   - No broken streak guilt, no penalties
   - Streak counter shows: "Streak reset: 0 days"

2. **Complete Today's Entry** → Normal flow

3. **AI Feedback - Recovery Encouragement**
   - "Welcome back! You mentioned similar work stress on Jan 5th: 'Felt overwhelmed...' You navigated that successfully—you've got this."
   - Focus on resilience pattern, not guilt
   - "Starting fresh: 1-day streak"

**Success Metrics:** User doesn't feel punished, returns to habit building

---

## Component Strategy

### Core Components (MVP)

**1. EntrySection Component**
- Props: `sectionNumber`, `sectionTitle`, `promptText`, `value`, `onChange`, `onNext`
- Features:
  - Auto-focus on mount
  - Character count (optional, non-intrusive)
  - Auto-save indicator (subtle)
  - Progress indicator (X/4)
  - Next button (enabled when >10 characters typed)

**2. SectionPrompt Component**
- Props: `promptText`, `sectionTitle`
- Features:
  - Question text display
  - Optional helper text
  - Warm, encouraging tone

**3. ProgressIndicator Component**
- Props: `currentSection`, `totalSections`
- Features:
  - Visual progress bar or step indicator
  - "Section X of 4" text
  - Completion percentage

**4. AIFeedbackCard Component**
- Props: `feedbackText`, `citedEntries`, `streakCount`, `entryCount`
- Features:
  - Animated appearance (fade in + slide up)
  - Feedback text with formatting support
  - Cited entry excerpts (if Day 7+)
  - [View Similar Entries] link (if citations exist)
  - Warm, encouraging visual design

**5. StreakBadge Component**
- Props: `streakCount`, `milestoneReached`
- Features:
  - Animated milestone celebration (7-day, 30-day, 90-day)
  - Visual streak indicator (fire emoji, number)
  - Progress toward next milestone

**6. EntryProgressBar Component**
- Props: `entryCount`, `threshold` (default: 7)
- Features:
  - "X/7 entries completed"
  - Visual progress bar
  - Message: "6 more to unlock deeper insights" (if <7)
  - Hidden after threshold reached

**7. TimelineEntryCard Component**
- Props: `entry`, `date`, `aiSummary`, `expanded`, `onToggle`
- Features:
  - Collapsed state: Date, first 2 lines preview
  - Expanded state: Full 4 sections + AI feedback
  - Smooth expand/collapse animation
  - Warm card design with subtle shadow

**8. FloatingActionButton Component**
- Props: `label`, `icon`, `onClick`, `primary`
- Features:
  - Fixed position (bottom-right mobile, top-right desktop)
  - Primary CTA: "Write Today"
  - Accessible, touch-friendly (56px minimum)

### Component Hierarchy

```
App
├── OnboardingFlow (first-time only)
│   └── OnboardingOverlay
├── EntryCreationView
│   ├── ProgressIndicator
│   ├── EntrySection (x4)
│   │   ├── SectionPrompt
│   │   └── TextArea (auto-save)
│   └── CompleteButton
├── AIFeedbackView
│   ├── AIFeedbackCard
│   │   └── CitedEntryExcerpt (conditional)
│   ├── StreakBadge
│   ├── EntryProgressBar (if <7 entries)
│   └── NavigationActions
└── TimelineView
    ├── FloatingActionButton ("Write Today")
    └── TimelineEntryCard (infinite scroll)
        └── EntryContent (expandable)
```

---

## UX Interaction Patterns

### 1. Sequential Flow Pattern

**Problem:** Users need guidance through 4 sections without feeling constrained

**Solution:**
- Linear progression (Section 1 → 2 → 3 → 4)
- [Next Section] button only appears when section has content (>10 chars)
- No "Previous" button (prevent back-and-forth indecision)
- Allow editing within current section, but forward momentum emphasized
- Visual progress indicator always visible

**Interaction:**
- User types → [Next Section] fades in
- Tap [Next] → Smooth transition (slide left), next section auto-focused
- Keyboard users: Enter key moves to next section

---

### 2. Auto-Save Pattern

**Problem:** Users need confidence their writing is saved without manual action

**Solution:**
- Save on every keystroke (debounced 500ms)
- Subtle "Saved" indicator (fades in/out, non-intrusive)
- No manual save button exists
- Optimistic UI: Assume save succeeds, show error toast only if fails

**Interaction:**
- User types → Auto-save triggered after 500ms pause
- "Saved" indicator appears briefly (1 second), then fades
- If save fails → Persistent error banner with [Retry]

---

### 3. Progress Disclosure Pattern

**Problem:** Day 1 users need to understand the 7-entry threshold without overwhelm

**Solution:**
- Show EntryProgressBar component prominently after AI feedback
- "1/7 entries completed - 6 more to unlock deeper insights"
- Visual progress bar fills gradually
- After 7 entries: Replace with "Pattern recognition unlocked!" celebration
- Then hide component (no longer needed)

**Interaction:**
- Days 1-6: Progress bar visible after AI feedback
- Day 7: Animated celebration (confetti + message)
- Day 8+: Component hidden, focus on streaks instead

---

### 4. AI Feedback Delivery Pattern

**Problem:** AI feedback is the core value prop; must feel immediate and personal

**Solution:**
- User taps [Complete Entry] → Loading state (max 3 seconds)
- AI feedback animates in (fade + slide up)
- Text appears with typewriter effect (fast, not slow)
- Cited entries highlighted in warm accent color
- [View Similar Entries] appears as secondary action

**Interaction:**
- [Complete Entry] tap → Button shows spinner
- Screen transitions to AIFeedbackView
- Feedback text types out (200ms delay between words)
- Cited excerpts fade in after main text
- Streak badge animates in last

---

### 5. Timeline Expansion Pattern

**Problem:** Users need to browse entries quickly without overwhelming UI

**Solution:**
- Default: Collapsed cards (date + 2-line preview)
- Tap card → Smooth expand animation (300ms)
- Expanded: Full 4 sections + AI feedback visible
- Tap again (or tap [Close]) → Collapse
- Only one card expanded at a time (others collapse automatically)

**Interaction:**
- Scroll timeline → See collapsed cards
- Tap card → Expands with slide-down animation
- Tap different card → Previous collapses, new expands
- Smooth, non-jarring transitions

---

### 6. Graceful Streak Recovery Pattern

**Problem:** Users returning after missed days shouldn't feel guilt/shame (Marcus scenario)

**Solution:**
- No "You broke your streak!" messaging
- Neutral welcome: "Welcome back! Your last entry was [day]."
- After entry completion: "Starting fresh: 1-day streak"
- AI feedback focuses on resilience patterns, not punishment
- Streak history retained (not erased), but not emphasized

**Interaction:**
- User returns after gap → Gentle welcome, no guilt
- Complete entry → New streak begins
- AI highlights past similar situations (resilience framing)

---

## Responsive & Accessibility

### Responsive Breakpoints

- **Mobile:** 320px - 767px (primary design target)
- **Tablet:** 768px - 1023px (same layout as mobile, more spacing)
- **Desktop:** 1024px+ (centered content, max-width 800px)

### Mobile-First Optimizations

- Touch targets: Minimum 44px x 44px (iOS) / 48px x 48px (Android)
- Thumb-friendly [Next Section] and [Complete Entry] buttons (bottom 1/3 of screen)
- Generous text field height (minimum 120px) for comfortable typing
- Progress indicator visible without scrolling
- Keyboard dismiss on scroll (mobile behavior)

### Desktop Enhancements

- Keyboard shortcuts: Enter to move to next section, Cmd+Enter to complete
- Wider text areas for comfortable typing
- Sidebar navigation visible (not hidden like mobile)
- Hover states for interactive elements

### Accessibility (WCAG 2.1 Level AA)

**Color Contrast:**
- Text primary (#37352F) on white: 11.7:1 (AAA)
- Text secondary (#787774) on white: 4.8:1 (AA)
- Accent blue (#2EAADC) on white: 3.4:1 (Large text only)

**Keyboard Navigation:**
- All interactive elements focusable
- Visible focus indicators (2px outline, accent color)
- Tab order follows visual flow (Section 1 → 2 → 3 → 4 → Complete)
- Escape key dismisses modals/overlays

**Screen Reader Support:**
- Semantic HTML (section, article, button, nav)
- ARIA labels for progress indicators: "Section 2 of 4"
- ARIA live regions for auto-save feedback: "Entry saved"
- Alt text for streak badges: "8-day streak achieved"

**Focus Management:**
- Auto-focus on text field when section loads (announced to screen readers)
- Focus trapped in modals/onboarding overlays
- Focus returns to trigger element when modal closes

---

## Design Specification Complete

This UX Design Specification provides the foundation for technical architecture and implementation. Key deliverables:

✅ Design system foundation (colors, typography, spacing)
✅ Information architecture and navigation structure
✅ Complete user journey maps (4 critical flows)
✅ Component strategy with hierarchy
✅ UX interaction patterns (6 core patterns)
✅ Responsive and accessibility specifications

**Next Step:** Architecture design can now proceed with clear UX requirements.

---
