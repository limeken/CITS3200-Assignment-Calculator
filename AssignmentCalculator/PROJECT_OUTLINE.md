# Assignment Calculator Frontend Outline

## Purpose & High-Level Flow
- React + TypeScript single-page app that helps students plan assignment work against semester timelines.
- Bootstrapped by Vite (`src/main.tsx`) and renders `App`, which composes a university-branded banner plus a `Calendar` workspace.
- The calendar workspace lets users create/import assignments, toggle between a heatmap-style visual calendar and a textual breakdown, and track upcoming deadlines via a priority queue.
- Data about assignment templates, semesters, and generated plans is normally fetched from a Flask backend; the UI gracefully degrades to offline caches when the API is unavailable.

## Core Stack & Tooling
- **React 19 + Vite** (`package.json`, `vite.config.ts`) for fast dev server and build tooling.
- **TypeScript** everywhere; `tsconfig.*` files define app and tooling targets.
- **TanStack React Query** (`@tanstack/react-query`) manages all remote data fetching, caching, and cache invalidation.
- **Tailwind CSS v4** (`src/index.css`) provides design tokens and utilities; shared class clusters live in `src/styles/styles.ts`.
- **Headless UI + Heroicons** power accessible dialogs, popovers, listboxes, and iconography.
- **date-fns** handles all date arithmetic (e.g., priorities, semester spans).
- **ical.js** powers ICS import/export support for assignments.
- Custom HTTP helper (`src/utils/http.ts`) wraps `fetch` with timeouts, retries, credential handling, and blob downloads.

## Application Shell
- `src/main.tsx` wires global providers around the app:
  - `QueryClientProvider` exposes a single `QueryClient` for React Query.
  - `NotificationProvider` manages toast-like transient messages.
  - `ModalProvider` centralises dialog portals so any component can open modals without prop drilling (explicitly justified in file comments).
- `src/App.tsx` renders the fixed university banner, the main content area, an instructions modal trigger, and the calendar workspace.

## Calendar & Planner Subsystem
- `src/components/calendar/Calendar.tsx` is the stateful hub. It stores assignments grouped by unit code, tracks the newest addition, toggles visual/text modes, and wires child components.
  - Adds assignments either via manual entry (`SubmissionButton`) or ICS import; colour assignment is consistent per unit by normalising to palette or random pick.
  - `removeAssignment`/`updateAssignment` keep state synchronised across children.
- **Assignment data model** (`src/components/calendar/CalendarTypes.ts`):
  - Defines semester helpers, assignment templates, calendar entries (`AssignmentCalendar`), ICS parsing/export routines, colour palette helpers, and validation placeholders.
  - `importCalendar` reads uploaded `.ics` files, preserving metadata like colour, unit code, and per-event timing.
  - `exportAssignmentCalendar` and `downloadIcs` support direct ICS export without hitting the backend.
- **Visual calendar view** (`VisualCalendar.tsx`):
  - Renders a responsive heatmap of the semester with week labels and assignment rows/columns, using Tailwind utility classes and manual grid maths.
  - Uses Headless UI `Popover` to preview milestone names when hovering boxes and supports small-screen rotation into a column layout.
- **Text calendar view** (`TextCalendar.tsx`):
  - Tabbed UI (Headless UI `TabGroup`) showing units on the left and assignments on the right.
  - Pulls assignment templates from `useAssignmentTypeLibrary`, mapping template milestones into step-by-step instructions and resources.
- **Priority queue** (`PriorityQueue.tsx`):
  - Maintains a sorted list of assignments by soonest due date (simple insertion sort).
  - Highlights urgency thresholds (5/14 day window) and exposes quick edit via modal reopening.
- **Options & semesters** (`CalendarOptions.tsx`):
  - Opens a modal to select the active semester; pulls live semesters via `useSemesters` with fallback to hardcoded dates when offline.
  - Provides a UI toggle between visual and text representations.

## Assignment Entry & Modals
- `src/components/Submission.tsx` implements the multi-step assignment form.
  - Handles creation, editing, deletion, and ICS import flow (via `FileInput` and `importCalendar`).
  - Validates required fields, maps assignment templates (`useAssignmentTypeLibrary`), and writes toast notifications on success/failure.
  - Provides separate button layouts for desktop (inline buttons) and mobile (floating action buttons).
- `src/components/AssignmentModal.tsx` shows assignment milestones in a carousel.
- `src/components/Instructions.tsx` defines an info dialog with consistent styling.
- `src/components/DevExportTest.tsx` offers a developer-only widget to exercise backend plan APIs and download PDF/ICS exports for smoke testing.

## Data Fetching Layer
- **Services (`src/services/`)**: thin wrappers around backend endpoints for assignment types, plan management, and semesters, all using the shared HTTP client.
  - `plan.ts` exposes CRUD operations, milestone generation, and file export helpers.
  - `assignmentTypes.ts` and `semesters.ts` expose list/detail/create/delete operations keyed to REST contracts.
- **Generated cache**:
  - `npm run build-cache` executes `../scripts/build_assignment_cache.py` (in backend repo) to regenerate `public/cache.ts` and `src/generated/cache.ts` containing a static snapshot of assignment templates.
  - Frontend falls back to this cache if live API data is stale or unavailable (`useAssignmentTypeLibrary`).
- **Hooks (`src/providers/*.ts`, `src/hooks/usePlan.ts`)**:
  - React Query hooks wrap service calls, set appropriate `staleTime`, and invalidate caches on mutations.
  - `useAssignmentTypeLibrary` merges generated cache with live metadata timestamps, preferring fresher backend data.
  - `usePlan` bundles the happy-path workflow of creating a plan, generating milestones, and triggering exports.

## Styling & Assets
- Tailwind theme tokens declared in `src/index.css` provide UWA-specific colours, typography, and shared card styles.
- `src/styles/styles.ts` centralises frequently reused class combinations (pill buttons, floating action button base, section layout).
- `public/PlusJakartaSans.ttf` supplies the custom font referenced in global CSS.
- `public/cache.ts` mirrors the generated assignment cache for direct hosting fallback.

## Supporting Infrastructure
- `src/providers/ModalProvider.tsx` implements a lightweight modal stack using Headless UI transitions, ensuring modals are rendered above everything else and can be closed programmatically.
- `src/providers/NotificationProvider.tsx` manages toast lifecycles (auto-dismiss, manual dismiss, success/error styling) using React state plus `setTimeout` clean-up.
- `src/providers/client.ts` re-exports the newer HTTP helper for backward compatibility.
- `eslint.config.js`, `tsconfig*.json`, and `vite.config.ts` keep lint/build/test tooling aligned.

## Complexity & Design Assessment
- The app’s breadth (visual calendar, text instructions, ICS import/export, offline caches, modal/toast infrastructure) justifies a moderate level of complexity. Most abstractions map cleanly to features and reduce duplication.
- **Justifiable design choices**:
  - Global providers for modals and notifications prevent prop drilling and allow any component to trigger UI overlays—critical for cross-cutting concerns like `Submission` and `CalendarOptions` modals.
  - React Query hooks encapsulate data fetching logic, cache invalidation, and fallback behaviour, yielding simpler components and consistent API handling.
  - `CalendarTypes.ts` centralises assignment-related data transformations (ICS import/export, colour palette, event mapping), avoiding repeated logic across components.
  - Maintaining both visual and textual calendar views caters to different accessibility and preference needs, hence the shared state and toggle.
  - Generated assignment-type cache ensures the front end still works when the backend (or network) is unavailable, which materially improves resilience for students.
- **Areas that could be simplified** (not necessarily blockers):
  - `VisualCalendar.tsx` is large and manually manages layouts for horizontal/vertical modes; extracting subcomponents or using CSS grid utilities could trim imperative logic.
  - `CalendarTypes.ts` mixes type declarations, helper functions, constants, and TODOs; splitting into separate files (types vs. ICS utilities vs. colour helpers) would improve cohesion.
  - Priority queue reimplements insertion sort; for small arrays it’s fine, but using `Array.prototype.sort` when state changes would be simpler.
  - Some Tailwind class string generation (e.g., dynamic `bg-${color}-200`) bypasses Tailwind’s safety list; consider using `clsx` with predeclared maps (similar to `BG100/BG300`).

Overall the codebase is feature-rich but purposeful: each subsystem corresponds to a visible capability (scheduling UI, instructions, file import/export, backend synchronisation). The sophistication stems from user experience goals rather than unnecessary abstraction.

## Stack Summary Checklist
- Frontend: React 19, React Query, Headless UI, Tailwind, Heroicons, date-fns, ical.js, clsx.
- Build/dev: Vite, TypeScript, ESLint, Tailwind plugin.
- Data flow: HTTP client → services → React Query hooks → UI components, with offline cache fallback.
- State: Local React state for UI specifics, global context providers for modals/notifications, React Query for remote data.
- Assets: Generated assignment cache, UWA branding assets, optional developer tools (`DevExportTest`).

## Backend Contract Sanity Check
- Verified Flask routes under `app/routes`:
  - `/types`, `/types/<id>`, `/types/metadata` endpoints align with frontend service expectations (`getAssignmentTypes`, `getAssignmentType`, CRUD, metadata timestamp). Validation enforces icon allow-list that matches `getAssignmentIcon` mapping.
  - `/semesters` routes fully support list/detail/create/delete, matching `semesters.ts` services and `CalendarOptions` fallback logic.
  - `/plan` currently exposes `POST /plan` and `GET|POST /plan/<id>/generate`, plus `/export/<id>.{pdf,ics}`; frontend services also define `getPlan`, `updatePlan`, `deletePlan`, and `addAssignment`, which are **not implemented** backend-side. These should be treated as future API work or the frontend helpers should be trimmed to avoid dead code.
- Cache workflow confirmed: `scripts/build_assignment_cache.py` calls `app.services.type_store` to normalise assignment types, writes synced copies to `public/cache.ts` and `src/generated/cache.ts`, and updates `_metadata.json` so `/types/metadata` can signal freshness.
- Recommendation for backend sync: communicate the missing plan endpoints to decide whether to implement them or remove the frontend stubs; ensure `/plan` responses include consistent fields (`plan_id`, `start_date`, assignments with `due_date`) as consumed by `usePlan` and export routes.

## Refactor Priority Shortlist
1. **Split `VisualCalendar.tsx` into focused components** (layout orchestration, assignment rows/columns, responsive variants). Reduces 300+ line file and clarifies responsibilities; target before major feature additions.
2. **Modularise `CalendarTypes.ts`** by extracting ICS utilities and colour helpers into `src/utils/` to improve discoverability and allow reuse by submission/import logic.
3. **Replace custom insertion sort in `PriorityQueue.tsx`** with `Array.prototype.sort` on derived state (or a stable sorted `useMemo`) to simplify logic and remove mutable array shuffling.
4. **Constrain Tailwind colour classes** by expanding the existing `BG100/BG300` maps for all usages (e.g., `TextCalendar` dynamic class names) to keep build-time purging reliable.
5. **Audit unused plan service functions** after backend decision—either wire up the missing Flask routes or strip the dead exports to avoid misleading API surface area.
