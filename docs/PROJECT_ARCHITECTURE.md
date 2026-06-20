# NestHaul Project Architecture

NestHaul is a Next.js move-in planning app. The current product helps a user create a first-apartment setup plan, browse static starter picks, save listings, track checklist status, and store a logged-in user's plan through Supabase.

## Tech Stack

- Next.js App Router with React client components.
- TypeScript for application code and tests.
- Supabase Auth for sign up, login, logout, and browser session detection.
- Supabase Postgres for logged-in plan persistence.
- Browser `sessionStorage` for anonymous in-session plans.
- Vitest and React Testing Library for unit/component coverage.
- ESLint and `next build` for static verification.

## Routes

- `/`: main NestHaul app shell.
- `/login`: auth page initialized to login mode.
- `/signup`: auth page initialized to signup mode.

The login and signup routes now render the same auth form with a two-option mode switch, so users can toggle between login and signup on the same page.

## Main Runtime Flow

`src/components/NestHaulApp.tsx` is the central client-side orchestrator.

It owns:

- app stage: landing, onboarding, or app
- active page: Dashboard, Explore, or Profile
- profile data
- generated checklist
- saved listings
- loading/saving state
- persistence errors
- whether a remote plan exists for the logged-in user

Current default behavior:

- The app starts directly in the main app stage.
- The default active page is Explore.
- The default profile has planned spend/budget initialized to `0`.
- Anonymous users do not keep old `localStorage` state. Anonymous state is saved only in `sessionStorage`.
- Logged-in users load and save through Supabase.

## Pages And Components

### Navigation

`src/components/AppNav.tsx`

- Shows Dashboard, Explore, and Profile navigation.
- Shows login/signup links when logged out.
- Shows the current user email and logout button when logged in.

### Explore

`src/components/ExplorePage.tsx`

- Reads static starter picks from `src/lib/explore.ts`.
- Groups items by category into horizontal carousels.
- Each item can be saved into the user's listing list.
- Saved Explore items render as disabled `Saved` buttons.

Important limitation: Explore items are static starter data, not researched live recommendations.

### Dashboard

`src/components/DashboardPage.tsx`

- Combines the dashboard summary, saved listings, and checklist manager.
- Removed the previous research notes section.
- Saved listings have an `X` remove button.

`src/components/SavedListings.tsx`

- Lets users manually add listings.
- Lets users remove saved listings.
- Runs recommendation labels through `src/lib/recommendations.ts`.
- Current recommendation labels are local deterministic assessments based on saved listing data, checklist item, budget, and spend. They are not externally researched recommendations.

### Profile

`src/components/ProfilePage.tsx`

- Lets users edit profile/onboarding fields.
- The location prompt is "Where are you moving to?"
- Saving profile updates checklist statuses for owned items.

### Auth

`src/components/AuthForm.tsx`

- Handles login and signup against Supabase Auth.
- Validates email shape client-side before calling Supabase.
- Requires passwords to be at least 6 characters.
- On successful login, routes back to `/`.
- On signup, shows a success message; Supabase confirmation settings may still require the user to confirm email before login.

`src/lib/useAuth.ts`

- Creates the browser Supabase client.
- Reads the current session with `auth.getSession()`.
- Subscribes to `auth.onAuthStateChange()`.
- Exposes `userId`, `userEmail`, loading state, and logout.

## State And Persistence

### Anonymous State

`src/lib/storage.ts`

- `sessionStorage` key: `nesthaul-session-plan`
- Used when there is no logged-in user.
- Cleared after a successful migration to Supabase.

Old user-specific `localStorage` support still exists for migration, but anonymous users should not continue from previous saved settings.

### Supabase State

`src/lib/supabase.ts`

- Creates a browser Supabase client from:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Treats placeholder values as unconfigured.

`src/lib/supabase-persistence.ts`

- Loads a full saved plan from Supabase.
- Saves a full saved plan to Supabase.
- Migrates an existing local/session plan into Supabase after login.
- Formats missing-table errors into a clearer setup message.

Save behavior:

1. `NestHaulApp` waits until auth and initial plan loading complete.
2. If logged out, it saves the current plan to `sessionStorage`.
3. If logged in, it calls `savePlanToSupabase()`.
4. `savePlanToSupabase()` upserts `move_plans`, replaces checklist rows, replaces saved listings, and replaces Explore-saved item rows.

Known caveat: the UI can optimistically show an Explore item as `Saved` before a remote save has been proven durable. A background save failure should show a persistence error banner, but manual testing still reports that saves are not reliably surviving login/reload.

## Supabase Database

Migration:

`supabase/migrations/202606200001_supabase_persistence.sql`

Tables:

- `public.move_plans`
- `public.checklist_items`
- `public.saved_listings`
- `public.explore_saved_items`

Security model:

- Row level security is enabled on all app tables.
- Policies allow authenticated users to select, insert, update, and delete only rows where `auth.uid() = user_id`.
- The migration grants schema/table access to the `authenticated` role, while RLS still limits which rows are visible or mutable.

The migration was applied through the Supabase dashboard SQL editor because the Supabase CLI is not currently installed/configured in the repo.

## Tests

Current test coverage includes:

- budget calculations
- checklist generation
- recommendation assessment
- local/session storage helpers
- Supabase client configuration
- Supabase persistence mapping and replacement behavior
- Supabase migration schema checks
- auth form behavior
- app navigation
- onboarding/profile behavior
- saved listings behavior
- top-level app auth/persistence flow

Useful commands:

```bash
npm test
npm run lint
npm run build
```

Most recent verification after the Supabase grant patch:

- `npm test`: 12 test files, 40 tests passing
- `npm run lint`: passing
- `npm run build`: passing

## Known Issues

- Saving still does not work reliably in the user's manual app flow. The database schema exists and grants were applied, but saved items can still disappear after login/reload for the user. This needs debugging with the exact browser console/network error and Supabase row state.
- The app has optimistic UI for save actions. The button changing to `Saved` does not by itself prove Supabase persistence succeeded.
- Explore content is static starter data, not live researched product/listing data.
- Recommendation labels are deterministic local assessments, not researched purchase recommendations.
- Supabase setup is manual through the dashboard SQL editor right now. The repo does not yet have Supabase CLI config or a repeatable CLI migration workflow.
- There are local uncommitted changes related to Supabase error handling, schema grants, and tests.

## Good Next Debugging Steps

1. Reproduce the save failure while logged in.
2. Capture the visible persistence error banner, browser console errors, and network response from Supabase.
3. Check Supabase table rows for the logged-in user's `auth.uid()`.
4. Verify whether `savePlanToSupabase()` is failing on `move_plans`, `checklist_items`, `saved_listings`, or `explore_saved_items`.
5. Add a durable UI signal after remote save succeeds, rather than relying only on optimistic button state.
6. Consider changing save behavior so Explore save waits for Supabase success before disabling the button for logged-in users.
