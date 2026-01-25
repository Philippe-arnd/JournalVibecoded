# Story: Entry Landing with Mock Data (Prototype)

**Story ID:** proto-2-1-entry-landing-mock-data
**Epic:** Prototype Phase - Interactive UI/UX Validation
**Status:** done
**Type:** Feature
**Estimate:** 2-3 hours
**Depends On:** proto-1-6-design-system-visual-foundation ✅

---

## User Story

As a returning user with no entry today,
I want to land directly in the entry creation screen with cursor ready,
So that I can start writing immediately without navigation friction.

---

## Context

**Foundation Complete:**
✅ proto-1-1: React + Vite + Tailwind + mock data established
✅ proto-1-6: Shared UI components (Button, TextArea, ProgressIndicator, etc.)

**This Story's Purpose:**
Build the entry landing experience that checks for today's entry status and provides the right screen:
- No entry today → Start new entry (Section 1, auto-focused)
- Incomplete entry → Resume at last incomplete section
- Completed entry → Show AI feedback + "Start Today" button

**Prototype Approach:**
- Use mock data from `mockEntries.js` and localStorage
- No backend API calls (simulate with mock functions)
- Focus on UX flow and component integration

---

## Acceptance Criteria

### AC1: Landing Logic - No Entry Today

**Given** I am a logged-in user (mockUser)
**And** No entry exists for today's date in mock data
**When** I navigate to `/` (home route)
**Then** The app displays:
- ProgressIndicator showing "Section 1 of 4"
- Section prompt: "What did you accomplish professionally yesterday?"
- TextArea component with auto-focus enabled
- Character count display
- "Next Section" button (initially disabled until 10+ characters typed)

**And** The screen has:
- No top navigation or menu (full-screen focus)
- Cream background (#FBF9F6)
- Max content width 800px (centered)

---

### AC2: Landing Logic - Resume Incomplete Entry

**Given** An incomplete entry exists for today in mock data
**And** The entry has completed sections 1 and 2
**When** I open the app
**Then** The app displays:
- ProgressIndicator showing "Section 3 of 4"
- Section 3 prompt: "What did you learn or realize today?"
- TextArea pre-filled with existing content (if any)
- Sections 1 and 2 content preserved and accessible
- Auto-focus in current section's textarea

---

### AC3: Landing Logic - Entry Already Complete

**Given** Today's entry is already completed
**When** I open the app
**Then** The app displays:
- Yesterday's AI feedback in a Card component
- Badge showing streak (e.g., "🔥 5-day streak")
- Button: "Start Today's Entry" (primary variant)
- Entry date and timestamp

**When** I click "Start Today's Entry"
**Then** The app navigates to Section 1 for a new entry

---

### AC4: Mock Data Integration

**Given** The app uses mock data for prototype
**When** Entry landing logic runs
**Then** It uses these helper functions:

**Check Today's Entry:**
```javascript
const getTodaysEntry = () => {
  const today = new Date().toISOString().split('T')[0];
  return mockEntries.find(entry => entry.entry_date === today);
};
```

**Get Entry Status:**
```javascript
const getEntryStatus = (entry) => {
  if (!entry) return 'no-entry';
  if (entry.completed) return 'completed';
  return 'incomplete';
};
```

**Determine Current Section:**
```javascript
const getCurrentSection = (entry) => {
  if (!entry.professional_recap || entry.professional_recap.length < 10) return 1;
  if (!entry.personal_recap || entry.personal_recap.length < 10) return 2;
  if (!entry.learning_reflections || entry.learning_reflections.length < 10) return 3;
  if (!entry.gratitude || entry.gratitude.length < 10) return 4;
  return 'complete';
};
```

---

### AC5: Component Integration

**Given** Shared components are available from proto-1-6
**When** Building the entry landing view
**Then** It uses:
- `<ProgressIndicator current={section} total={4} />` - At top, sticky
- `<TextArea autoFocus={true} />` - For entry input
- `<Button variant="primary" />` - For "Next Section"
- `<Card />` - For completed entry display
- `<Badge variant="success" />` - For streak display

---

## Tasks / Subtasks

- [ ] **Task 1**: Create mock data helper utilities (AC4)
  - [ ] Create `/src/utils/entryHelpers.js`
  - [ ] Implement `getTodaysEntry()`
  - [ ] Implement `getEntryStatus(entry)`
  - [ ] Implement `getCurrentSection(entry)`
  - [ ] Write unit tests for helpers

- [ ] **Task 2**: Build EntryLandingView component (AC1, AC2, AC3)
  - [ ] Update `/src/components/entry/EntryView.jsx`
  - [ ] Add entry status detection logic
  - [ ] Implement three conditional renders (no-entry, incomplete, completed)
  - [ ] Integrate ProgressIndicator component
  - [ ] Integrate TextArea with auto-focus
  - [ ] Add section prompt text

- [ ] **Task 3**: Implement "No Entry Today" screen (AC1)
  - [ ] Display Section 1 prompt
  - [ ] Auto-focus TextArea on mount
  - [ ] Show character count
  - [ ] Add "Next Section" button (disabled until 10+ chars)
  - [ ] Apply full-screen focus styling

- [ ] **Task 4**: Implement "Resume Incomplete" screen (AC2)
  - [ ] Load existing entry data
  - [ ] Determine current incomplete section
  - [ ] Pre-fill textarea with existing content
  - [ ] Update ProgressIndicator to show current section
  - [ ] Preserve completed sections' data

- [ ] **Task 5**: Implement "Entry Complete" screen (AC3)
  - [ ] Display yesterday's AI feedback in Card
  - [ ] Show current streak Badge
  - [ ] Add "Start Today's Entry" Button
  - [ ] Handle button click to start new entry

- [ ] **Task 6**: Testing and validation
  - [ ] Test all three landing states (no-entry, incomplete, completed)
  - [ ] Verify auto-focus works
  - [ ] Test character count updates
  - [ ] Verify button enable/disable logic
  - [ ] Test on mobile (320px) and desktop (1920px)
  - [ ] Run production build

---

## Dev Notes

### 🎨 Section Prompts (From Epics)

**Section 1 (Professional):**
"What did you accomplish professionally yesterday?"

**Section 2 (Personal):**
"What happened in your personal life yesterday?"

**Section 3 (Learning):**
"What did you learn or realize today?"

**Section 4 (Gratitude):**
"What are you grateful for today?"

---

### 🏗️ Component Structure

```
EntryView.jsx (Refactor from placeholder)
├── Check today's entry status
├── Render based on status:
│   ├── No Entry → EntryCreationScreen
│   │   ├── ProgressIndicator
│   │   ├── Section prompt (h2)
│   │   ├── TextArea (autoFocus)
│   │   └── Button (Next Section)
│   ├── Incomplete → ResumeEntryScreen
│   │   ├── ProgressIndicator (current section)
│   │   ├── Section prompt
│   │   ├── TextArea (pre-filled)
│   │   └── Button (Next Section)
│   └── Completed → EntryCompleteScreen
│       ├── Card (AI feedback)
│       ├── Badge (streak)
│       └── Button (Start Today)
```

---

### 💾 Mock Data Approach

**For Prototype:**
- Read from `mockEntries.js` for demonstration
- Simulate "today's date" logic
- For incomplete entry demo, add a mock incomplete entry to `mockEntries.js`
- For completed entry demo, ensure mockUser.last_entry_date = yesterday

**Entry State Management:**
- Use React useState for current entry data
- Use localStorage to persist entry drafts (optional for prototype)
- No API calls - all mock data operations

---

### 🧪 Testing Strategy

**Manual Tests:**
1. Fresh load (no today entry) → Should show Section 1
2. Incomplete entry (sections 1-2 done) → Should show Section 3
3. Complete entry → Should show AI feedback + "Start Today" button
4. Auto-focus works on mount
5. Character counter updates as typing
6. Button enables after 10 characters

**Unit Tests:**
- entryHelpers.js functions
- EntryView conditional rendering logic

---

### 📚 References

- [Epics.md - Story 2.1](_bmad-output/planning-artifacts/epics.md#story-21)
- [UX Design Spec](_bmad-output/planning-artifacts/ux-design-specification.md)
- [mockEntries.js](journal-prototype/src/mocks/mockEntries.js)
- [Shared Components](journal-prototype/src/components/shared/)

---

## Definition of Done

- [x] entryHelpers.js created with helper functions
- [x] EntryView.jsx refactored with landing logic
- [x] "No Entry Today" screen implemented with auto-focus
- [x] "Resume Incomplete" screen implemented
- [x] "Entry Complete" screen implemented with AI feedback
- [x] All three states tested manually
- [x] Character count displays correctly
- [x] Button enable/disable logic works
- [x] Responsive on mobile and desktop
- [x] Production build succeeds
- [x] Code committed with clear message

---

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Implementation Plan

**Approach:** Built entry landing controller logic with three conditional states based on today's entry status.

**Implementation Strategy:**
1. Created entryHelpers.js utility module with 6 helper functions for entry status detection
2. Completely refactored EntryView.jsx from placeholder to full landing controller
3. Implemented three distinct UI states (no-entry, incomplete, completed) with conditional rendering
4. Integrated shared components from proto-1-6 (ProgressIndicator, TextArea, Button, Card, Badge)
5. Added auto-focus logic using useEffect + ref forwarding from TextArea component
6. Fixed curly quote syntax error in mockEntries.js that was breaking build

**Key Technical Decisions:**
- **useState for Entry State**: Manage entry, status, section, and content in local state
- **useEffect for Initial Load**: Load today's entry on mount and determine status
- **Conditional Rendering**: Three distinct returns based on entryStatus (loading, completed, entry-creation)
- **Character Validation**: Disable button until 10+ characters (trim whitespace)
- **Mock Data Integration**: Use helper functions to simulate backend logic without API calls

### Completion Notes

✅ **Three Landing States Implemented:**

**1. No Entry Today (Fresh Start)**
- ProgressIndicator shows "Section 1 of 4"
- Section 1 prompt displayed
- TextArea with auto-focus enabled
- Character counter with helper text ("Type at least X more")
- "Next Section" button disabled until 10+ characters

**2. Resume Incomplete Entry**
- Detects current incomplete section (1-4)
- Pre-fills textarea with existing content
- ProgressIndicator updates to current section
- Preserves completed sections' data in state
- Helper text: "Continue where you left off..."

**3. Entry Completed Today**
- Shows "Today's Entry Complete! ✅" heading
- Displays streak Badge (e.g., "🔥 5-day streak")
- Yesterday's AI feedback in Card component
- "Start Today's Entry" button to begin new entry
- "View Timeline" text button for navigation

**Verification:**
- Production build successful: 56 modules, 244KB bundle (8KB larger than proto-1-6)
- Auto-focus works on TextArea mount
- Character counter updates in real-time
- Button enable/disable logic correct (10 character threshold)
- All three states render correctly with mock data
- Responsive layout (max-width 800px, centered)

**Bug Fixed:**
- Curly apostrophe (') in mockEntries.js line 101 → straight apostrophe (')
- Build error: "Expected ',', got 'ident'" → resolved

**Testing:**
- Created 5 unit tests for entryHelpers.js functions
- Tests verify: getEntryStatus, getCurrentSection, getSectionPrompt logic
- All helper functions work correctly with mock data

**Ready for Next Story:**
proto-2-2-2-5 will implement the full 4-section flow navigation with "Next Section" button functionality.

### File List

**Created Files:**
- `journal-prototype/src/utils/entryHelpers.js` - Entry status helper functions (6 functions)
- `journal-prototype/src/utils/__tests__/entryHelpers.test.js` - Unit tests for helpers

**Modified Files:**
- `journal-prototype/src/components/entry/EntryView.jsx` - Complete refactor with landing logic
- `journal-prototype/src/mocks/mockEntries.js` - Fixed curly apostrophe syntax error

---

## Change Log

- **2026-01-17**: Entry landing implemented and committed (commit: bab5031)
  - Created entryHelpers.js with 6 utility functions
  - Refactored EntryView.jsx with three conditional states
  - Implemented no-entry, incomplete, and completed landing screens
  - Added auto-focus TextArea integration
  - Added character counter and button enable/disable logic
  - Integrated shared components (ProgressIndicator, Card, Badge, Button)
  - Fixed mockEntries.js curly quote bug
  - Verified production build (56 modules, 244KB)
  - Created unit tests for helper functions

---

## Status

**Current Status:** done
**Next Story:** proto-2-2-2-5-four-section-flow
**Date Completed:** 2026-01-17
