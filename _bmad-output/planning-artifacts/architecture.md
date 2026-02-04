---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - '/home/dmin/dev/journal/_bmad-output/planning-artifacts/prd.md'
  - '/home/dmin/dev/journal/_bmad-output/planning-artifacts/ux-design-specification.md'
  - '/home/dmin/dev/journal/_bmad-output/planning-artifacts/product-brief-dev-2026-01-14.md'
workflowType: 'architecture'
project_name: 'journal'
user_name: 'Phil'
date: '2026-01-17'
fastTracked: true
---

# Architecture Decision Document - journal

**Architect:** Phil + Claude
**Date:** 2026-01-17
**Project:** Daily Journaling PWA with AI Coaching

---

## Architecture Diagrams

Visual representations of the system architecture are available in the diagrams folder:

1. **System Architecture** - `/diagrams/system-architecture.excalidraw`
   - React PWA → Supabase → Claude API flow
   - Standard hosting infrastructure

2. **Database ERD** - `/diagrams/database-erd.excalidraw`
   - Table relationships (user_profiles, entries, milestones)
   - Row Level Security policies

3. **Component Hierarchy** - `/diagrams/component-hierarchy.excalidraw`
   - React component tree structure
   - Context providers and custom hooks

4. **Entry Creation Data Flow** - `/diagrams/entry-creation-dataflow.excalidraw`
   - Step-by-step sequence from user input to AI feedback
   - Performance targets and timing

---

## Executive Summary

This architecture document defines the technical implementation for journal, a PWA-based journaling application with guided 4-section entry flow and progressive AI coaching. The architecture prioritizes:

1. **Speed** - Sub-5-minute entry completion, <3-second AI responses
2. **Simplicity** - Minimal tech stack (React + Tailwind + Supabase + Claude API)
3. **Reliability** - >99.9% entry save success rate
4. **Mobile-First** - PWA with responsive design (320px-1920px+)

**Key Architectural Decisions:**
- Online-only architecture (no offline complexity for MVP)
- Supabase for auth, database, and real-time subscriptions
- Claude API for AI coaching and pattern recognition
- React with functional components and hooks for state management
- Tailwind CSS for Notion-inspired styling
- Auto-save pattern with optimistic UI

---

## Technology Stack

### Frontend

**Framework: React 18+**
- Functional components with hooks
- No complex state management library needed (Context API sufficient)
- Fast Refresh for development
- Production build optimization via Vite

**Styling: Tailwind CSS 3+**
- Utility-first CSS for Notion-inspired design
- Custom color palette configuration
- Responsive breakpoints: mobile (320px+), tablet (768px+), desktop (1024px+)
- JIT (Just-In-Time) mode for optimal bundle size

**Build Tool: Vite**
- Fast development server with HMR
- Optimized production builds
- PWA plugin for manifest and service worker generation
- Environment variable management

**PWA Configuration:**
- Service Worker for installability (no offline caching for MVP)
- Web App Manifest for home screen installation
- Meta tags for mobile browser optimization

### Backend

**Database & Auth: Supabase**
- PostgreSQL database for entry storage
- Supabase Auth for email/password authentication
- Row Level Security (RLS) for user data isolation
- Real-time subscriptions for streak/progress updates (future)

**AI Integration: Claude API (Anthropic)**
- Claude 3.5 Sonnet for AI coaching responses
- Pattern recognition via semantic search over past entries
- Server-side API calls (via Supabase Edge Functions or Next.js API routes if needed)
- Rate limiting and response caching to manage costs

### Hosting & Deployment

**Hosting: Netlify (recommended) or other static hosting providers**
- Automatic deployments from git
- Edge function support for AI API calls
- Global CDN for fast static asset delivery
- Custom domain support

**Database Hosting: Supabase Cloud**
- Managed PostgreSQL instance
- Automatic backups
- Connection pooling
- Free tier sufficient for MVP (500MB database, 50K monthly active users)

---

## Database Schema

### Tables

**users (managed by Supabase Auth)**
```sql
-- Supabase auth.users table (managed automatically)
-- We reference auth.users.id as foreign key in our tables
```

**user_profiles**
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  onboarded BOOLEAN DEFAULT FALSE,
  total_entries INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_entry_date DATE,

  -- Metadata
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);
```

**entries**
```sql
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,

  -- 4 Section Content
  professional_recap TEXT,
  personal_recap TEXT,
  learning_reflections TEXT,
  gratitude TEXT,

  -- AI Feedback
  ai_feedback TEXT,
  ai_cited_entries JSONB, -- Array of {entry_id, excerpt, date}

  -- Metadata
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, entry_date)
);

-- Indexes
CREATE INDEX entries_user_date_idx ON entries(user_id, entry_date DESC);
CREATE INDEX entries_user_completed_idx ON entries(user_id, completed);

-- RLS Policies
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entries"
  ON entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries"
  ON entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON entries FOR UPDATE
  USING (auth.uid() = user_id);
```

**milestones**
```sql
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_type VARCHAR(50) NOT NULL, -- 'streak_7', 'streak_30', 'streak_90', 'entries_7'
  achieved_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, milestone_type)
);

-- RLS Policies
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own milestones"
  ON milestones FOR SELECT
  USING (auth.uid() = user_id);
```

### Database Functions

**update_user_stats() Trigger**
```sql
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total_entries, current_streak, last_entry_date
  -- Called after INSERT or UPDATE on entries table
  -- Calculates streak based on consecutive entry_date values

  UPDATE user_profiles
  SET
    total_entries = (SELECT COUNT(*) FROM entries WHERE user_id = NEW.user_id AND completed = TRUE),
    last_entry_date = NEW.entry_date,
    current_streak = calculate_streak(NEW.user_id),
    longest_streak = GREATEST(longest_streak, calculate_streak(NEW.user_id)),
    updated_at = NOW()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_stats_trigger
  AFTER INSERT OR UPDATE ON entries
  FOR EACH ROW
  WHEN (NEW.completed = TRUE)
  EXECUTE FUNCTION update_user_stats();
```

---

## Application Architecture

### Component Structure

```
src/
├── components/
│   ├── entry/
│   │   ├── EntrySection.jsx          # Single section with prompt + textarea
│   │   ├── ProgressIndicator.jsx     # "Section X of 4" display
│   │   ├── CompleteButton.jsx        # Primary CTA to complete entry
│   │   └── SectionPrompt.jsx         # Question prompt component
│   ├── feedback/
│   │   ├── AIFeedbackCard.jsx        # Main AI response display
│   │   ├── CitedEntryExcerpt.jsx     # Past entry citation component
│   │   ├── StreakBadge.jsx           # Streak display with animation
│   │   └── EntryProgressBar.jsx      # "X/7 entries" progress
│   ├── timeline/
│   │   ├── TimelineEntryCard.jsx     # Expandable entry card
│   │   ├── TimelineView.jsx          # Main timeline screen
│   │   └── FloatingActionButton.jsx  # "Write Today" FAB
│   ├── onboarding/
│   │   └── OnboardingOverlay.jsx     # First-time user intro
│   └── common/
│       ├── AutoSaveIndicator.jsx     # "Saved" indicator
│       └── Navigation.jsx            # Bottom tab bar (mobile) / sidebar (desktop)
├── views/
│   ├── EntryCreationView.jsx         # Main entry creation screen
│   ├── AIFeedbackView.jsx            # Post-completion feedback screen
│   └── TimelineView.jsx              # Historical entries browser
├── hooks/
│   ├── useAutoSave.js                # Debounced auto-save hook
│   ├── useEntry.js                   # Current entry state management
│   ├── useUserProfile.js             # User stats (streak, total entries)
│   └── useAIFeedback.js              # AI response fetching
├── services/
│   ├── supabase.js                   # Supabase client initialization
│   ├── entryService.js               # Entry CRUD operations
│   ├── aiService.js                  # Claude API integration
│   └── authService.js                # Authentication helpers
├── contexts/
│   ├── AuthContext.jsx               # User authentication state
│   └── EntryContext.jsx              # Current entry editing state
├── utils/
│   ├── dateUtils.js                  # Date formatting helpers
│   ├── streakCalculator.js           # Streak calculation logic
│   └── constants.js                  # Section prompts, config values
├── App.jsx                           # Root component with routing
└── main.jsx                          # Entry point
```

### State Management Strategy

**No Redux/MobX needed** - Use React Context + hooks for simplicity

**AuthContext:**
- Current user session
- Login/logout functions
- Loading state

**EntryContext:**
- Current entry being edited
- Section completion status
- Auto-save status

**Local Component State:**
- UI interactions (expanded cards, modal visibility)
- Form field values (textarea content)

**Server State (via React Query or SWR - optional):**
- Fetched entries (timeline)
- User profile stats
- Caching and background refetching

---

## Data Flow Patterns

### Entry Creation Flow

1. **User opens app**
   - App checks auth state (AuthContext)
   - If authenticated → Fetch or create today's entry
   - If not authenticated → Redirect to login

2. **Load/Create Today's Entry**
   ```javascript
   // EntryCreationView.jsx
   const { data: entry, error } = useEntry(todayDate);
   // If entry exists and incomplete → Resume
   // If entry exists and complete → Show yesterday's feedback + "Start Today"
   // If no entry → Create draft entry in database
   ```

3. **User types in Section 1**
   - `onChange` → Update local state immediately (optimistic UI)
   - Trigger debounced auto-save (500ms delay)
   - Auto-save calls `entryService.updateEntry()`
   - Show "Saved" indicator on success

4. **User taps [Next Section]**
   - Smooth transition animation
   - Auto-focus next section textarea
   - Progress indicator updates (2/4)

5. **User completes Section 4 → taps [Complete Entry]**
   - Mark entry as `completed: true`
   - Save to database
   - Trigger AI feedback generation

6. **AI Feedback Generation**
   ```javascript
   // aiService.js
   async function generateAIFeedback(entry, userProfile) {
     // If user has <7 entries → Simple encouragement
     // If user has 7+ entries → Pattern recognition query

     const response = await fetch('/api/ai-feedback', {
       method: 'POST',
       body: JSON.stringify({
         entry,
         totalEntries: userProfile.total_entries,
         pastEntries: userProfile.total_entries >= 7 ? await fetchRecentEntries() : []
       })
     });

     return response.json(); // { feedback, citedEntries }
   }
   ```

7. **Display AI Feedback**
   - Transition to AIFeedbackView
   - Animate feedback text (typewriter effect)
   - Show streak badge
   - Show progress bar (if <7 entries)

### Auto-Save Pattern

**Implementation via useAutoSave hook:**
```javascript
// hooks/useAutoSave.js
import { useEffect, useRef } from 'react';
import { debounce } from 'lodash';

export function useAutoSave(data, onSave) {
  const debouncedSave = useRef(
    debounce(async (data) => {
      try {
        await onSave(data);
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    }, 500)
  ).current;

  useEffect(() => {
    if (data) {
      debouncedSave(data);
    }
  }, [data, debouncedSave]);
}

// Usage in EntrySection.jsx
const [sectionContent, setSectionContent] = useState(entry.professional_recap || '');

useAutoSave(
  { id: entry.id, professional_recap: sectionContent },
  entryService.updateEntry
);
```

**Optimistic UI:**
- Update UI immediately on user input
- Assume save succeeds
- Show error toast only if save fails
- Provide [Retry] action on failure

---

## AI Integration Architecture

### Pattern Recognition Strategy

**For users with <7 entries:**
- Simple encouragement based on keywords
- No pattern matching (insufficient data)

**For users with 7+ entries:**
- Semantic similarity search over past entries
- Extract key themes from today's entry
- Query past entries for similar content
- Return top 1-2 matches with excerpts

### AI API Flow

**Option 1: Client-Side API Call (Simpler for MVP)**
```javascript
// aiService.js
async function generateFeedback(entry, pastEntries) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: buildPrompt(entry, pastEntries)
      }]
    })
  });

  return response.json();
}
```

**Option 2: Server-Side via Supabase Edge Function (More Secure)**
- API key never exposed to client
- Better for production
- Slightly more complex setup

**Prompt Engineering:**
```javascript
function buildPrompt(entry, pastEntries) {
  if (pastEntries.length < 7) {
    return `User just completed their journal entry. Provide brief, warm encouragement (2-3 sentences).

Entry:
- Professional: ${entry.professional_recap}
- Personal: ${entry.personal_recap}
- Learning: ${entry.learning_reflections}
- Gratitude: ${entry.gratitude}`;
  }

  return `User completed today's journal entry. Analyze for patterns and provide personalized feedback (3-4 sentences).

Today's Entry:
- Professional: ${entry.professional_recap}
- Personal: ${entry.personal_recap}
- Learning: ${entry.learning_reflections}
- Gratitude: ${entry.gratitude}

Past Entries (for pattern recognition):
${pastEntries.map(e => `[${e.date}] ${e.professional_recap} | ${e.personal_recap}`).join('\n')}

If you notice similar themes/emotions/situations in past entries, cite them with date and brief excerpt.`;
}
```

### Response Caching Strategy

**Cache AI responses to reduce API costs:**
```javascript
// Cache key: hash(entry content + user_id + entry_count)
// Cache duration: 24 hours (feedback won't change for same entry)

async function getCachedOrGenerateFeedback(entry, userProfile) {
  const cacheKey = hashEntry(entry);
  const cached = await cache.get(cacheKey);

  if (cached) return cached;

  const feedback = await generateFeedback(entry, userProfile);
  await cache.set(cacheKey, feedback, { ttl: 86400 });

  return feedback;
}
```

---

## Authentication Flow

### Supabase Auth Integration

**Sign Up:**
```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password'
});

// After signup → Create user_profile record
await supabase.from('user_profiles').insert({
  id: data.user.id,
  onboarded: false
});
```

**Login:**
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password'
});
```

**Session Management:**
```javascript
// App.jsx - Root component
useEffect(() => {
  // Get initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
  });

  // Listen for auth changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
  });

  return () => subscription.unsubscribe();
}, []);
```

**Protected Routes:**
```javascript
function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!session) return <Navigate to="/login" />;

  return children;
}
```

---

## Performance Optimizations

### Initial Load Performance

**Code Splitting:**
- Lazy load timeline view (only when accessed)
- Lazy load onboarding (only for first-time users)
- Entry creation view loaded immediately (critical path)

```javascript
const TimelineView = lazy(() => import('./views/TimelineView'));
const OnboardingOverlay = lazy(() => import('./components/onboarding/OnboardingOverlay'));
```

**Asset Optimization:**
- Tailwind CSS purging (remove unused styles)
- Vite bundle optimization (tree shaking)
- No large dependencies (React + Tailwind + Supabase client ~150KB gzipped)

**Target Performance:**
- Initial load (3G): <2 seconds ✅
- Entry save (online): <500ms ✅
- AI feedback: <3 seconds ✅

### Runtime Performance

**Auto-Save Debouncing:**
- 500ms delay prevents excessive database writes
- Optimistic UI keeps interface responsive

**Timeline Infinite Scroll:**
- Load 20 entries initially
- Load next 20 when user scrolls to bottom
- Virtualization not needed for MVP (small dataset)

**React Optimization:**
- `useMemo` for expensive calculations (streak calculation)
- `useCallback` for event handlers passed to children
- Avoid unnecessary re-renders with proper dependency arrays

---

## Security Considerations

### Row Level Security (RLS)

**Supabase RLS policies ensure:**
- Users can only read/write their own entries
- No cross-user data leakage
- Database-level security (not just API)

### API Key Protection

**Claude API Key:**
- Stored in environment variables (`.env.local`)
- Never committed to git (in `.gitignore`)
- For production: Use server-side API calls via Edge Functions

**Supabase Keys:**
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` are safe to expose (protected by RLS)
- Backend service role key kept secret

### Input Validation

**Client-Side:**
- Minimum character requirements (>10 chars per section)
- Maximum length limits (prevent abuse)
- XSS protection via React's default escaping

**Database-Side:**
- PostgreSQL constraints on entry_date (must be valid date)
- Foreign key constraints (user_id must exist)

---

## Deployment Strategy

### Environment Variables

**Development (.env.local):**
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_ANTHROPIC_API_KEY=sk-ant-api03-xxx
```

**Production (Hosting Environment Variables):**
- Same variables set in hosting dashboard
- Encrypted and injected at build time

### Build Process

**Vite Build:**
```bash
npm run build
# Output: dist/ folder with optimized static assets
```

**Hosting Deployment:**
- Connect GitHub repository
- Automatic deployments on push to `main`
- Preview deployments for pull requests
- Environment variables configured in hosting dashboard

### Database Migrations

**Supabase Migration Process:**
```bash
# Create migration
supabase migration new create_tables

# Edit SQL in supabase/migrations/xxx_create_tables.sql
# Apply migration locally
supabase db push

# Apply to production (via Supabase dashboard or CLI)
```

---

## Testing Strategy

### Unit Testing (Jest + React Testing Library)

**Component Tests:**
- `EntrySection.jsx` - Auto-save triggers correctly
- `AIFeedbackCard.jsx` - Renders feedback and citations
- `StreakBadge.jsx` - Displays correct streak count

**Service Tests:**
- `entryService.js` - CRUD operations work correctly
- `streakCalculator.js` - Streak logic handles edge cases (missed days, leap year)

### Integration Testing (Playwright)

**Critical User Flows:**
1. First-time user completes entry and sees encouragement
2. Returning user (Day 8+) sees pattern recognition
3. Auto-save recovers from network errors
4. Timeline browsing works on mobile and desktop

### Manual Testing Checklist

- [ ] Entry creation on mobile (iOS Safari, Android Chrome)
- [ ] Entry creation on desktop (Chrome, Firefox, Safari)
- [ ] Auto-save indicator appears and disappears correctly
- [ ] AI feedback appears within 3 seconds
- [ ] Streak count updates correctly after entry completion
- [ ] Timeline scrolling is smooth (60fps)
- [ ] PWA installs to home screen on mobile
- [ ] Navigation appears only after entry completion

---

## Monitoring & Analytics

### Error Tracking

**Sentry Integration (recommended):**
- Track JavaScript errors in production
- Monitor API failures (Supabase, Claude API)
- Alert on critical errors (auth failures, save failures)

### Usage Analytics

**Minimal Analytics for MVP:**
- Entry completion rate (% of started entries that get completed)
- AI feedback response time (p50, p95, p99)
- Streak milestone achievements (7-day, 30-day counts)
- "Upgrade for Voice" button clicks (premium feature validation)

**PostHog or Mixpanel:**
- Privacy-focused
- Custom event tracking
- Funnel analysis (signup → first entry → 7-day retention)

### Performance Monitoring

**Hosting Analytics (built-in):**
- Core Web Vitals (LCP, FID, CLS)
- Server response times
- Geographic distribution of users

---

## Future Architecture Considerations

### Post-MVP Enhancements

**Voice Recording Feature (Premium):**
- Integrate Whisper API for transcription
- Store audio files in Supabase Storage
- Add `audio_url` column to entries table
- Premium tier subscription via Stripe

**Search Functionality:**
- Full-text search via PostgreSQL `tsvector`
- Semantic search via vector embeddings (pgvector extension)
- Search across all 4 sections + AI feedback

**Brain Dump Feature:**
- New `brain_dumps` table (separate from daily entries)
- Unstructured journaling anytime
- Tagged categories (optional)

**Quantified Self Integration:**
- OAuth integration with Oura Ring, Whoop
- `health_metrics` table for daily stats
- Correlate journal sentiment with sleep/activity

### Scalability Considerations

**Current architecture supports:**
- 100-500 active users without changes
- 1000+ users with minor optimizations (caching, CDN)

**If scaling beyond 1000 users:**
- Add Redis for session caching
- Implement rate limiting (per-user API quotas)
- Optimize AI prompts (reduce token count)
- Consider serverless architecture for AI calls

---

## Architecture Complete

This architecture document provides implementation-ready technical specifications for the journal PWA. Key decisions:

✅ **Tech Stack** - React + Tailwind + Supabase + Claude API
✅ **Database Schema** - 3 tables (user_profiles, entries, milestones) with RLS
✅ **Component Structure** - 15+ components organized by feature
✅ **State Management** - Context API + hooks (no Redux complexity)
✅ **Data Flow** - Auto-save with optimistic UI, AI feedback post-completion
✅ **AI Integration** - Pattern recognition after 7 entries, response caching
✅ **Authentication** - Supabase Auth with email/password
✅ **Performance** - Code splitting, debounced auto-save, <3s AI responses
✅ **Security** - RLS policies, API key protection, input validation
✅ **Deployment** - Cloud hosting, environment variables, CI/CD

**Next Step:** Break down into Epics & Stories for implementation.

---
