# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **Assignment Calculator** web application built with React, TypeScript, Vite, and Tailwind CSS. It helps students plan and visualize assignment milestones by generating study plans from assignment due dates. The app allows users to add assignments, generate work schedules, and export them as ICS/PDF files.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (includes API proxy to http://127.0.0.1:5000)
npm run dev

# Type-check and build for production
npm run build

# Lint the codebase
npm run lint

# Preview production build
npm run preview
```

## Architecture Overview

### Component Hierarchy

The application follows a nested provider pattern:
```
StrictMode
  └─ QueryClientProvider (TanStack Query for API calls)
      └─ NotificationProvider (Toast notifications)
          └─ ModalProvider (Modal dialog management)
              └─ App
```

### Key Architectural Patterns

**State Management:**
- Calendar assignments are managed locally in `Calendar.tsx` using `useState` with a `Record<string, AssignmentCalendar[]>` structure keyed by unit code
- Backend plan data is fetched via TanStack Query hooks (see `src/hooks/usePlan.ts`)
- Modal state is managed through React Context in `ModalProvider.tsx`
- Notification/toast state is managed through React Context in `NotificationProvider.tsx`

**Calendar System:**
- The app has dual visualization modes: Visual Calendar (grid-based) and Text Calendar (list-based)
- Assignment data structure bridges between local state (`AssignmentCalendar`) and backend API (`Plan`/`Assignment`)
- Semester dates are hardcoded in `CalendarTypes.ts` (sem1, sem2) for UWA 2025
- Each unit code gets a random color on first assignment addition; subsequent assignments for that unit inherit the color

**iCalendar Integration:**
- Uses `ical.js` library for parsing/generating ICS files
- Custom metadata is stored as `X-WR-*` properties (e.g., `X-WR-CALNAME`, `X-WR-COLOR`, `X-WR-ASSIGNMENTTYPE`, `X-WR-UNITCODE`)
- Import/export functions are in `CalendarTypes.ts:132-277`

### Core Module Structure

**`src/components/calendar/`** - Calendar visualization and management
- `Calendar.tsx` - Main container managing assignment state and CRUD operations
- `CalendarTypes.ts` - All TypeScript interfaces, ICS import/export, semester definitions
- `VisualCalendar.tsx` - Grid-based visual representation
- `TextCalendar.tsx` - List-based textual representation
- `PriorityQueue.tsx` - Assignment list display with edit/delete actions
- `CalendarOptions.tsx` - Toggle between visual/text modes
- `SemesterSelector.tsx` - Select semester for calendar view

**`src/services/plan.ts`** - Backend API client
- RESTful service functions for creating plans, generating milestones, exporting ICS/PDF
- API calls proxy through `/api` which rewrites to backend at `http://127.0.0.1:5000` (see `vite.config.ts:11-18`)

**`src/providers/`** - Context providers
- `ModalProvider.tsx` - Manages modal stack with animations (HeadlessUI)
- `NotificationProvider.tsx` - Toast notification system
- `client.ts` and `hooks.ts` - TanStack Query configuration

**`src/components/testdata.ts`** - Predefined assignment types
- Contains 5 assignment templates: Essay, Lab Report, Reflective Writing, Group Project, Presentation
- Each has a breakdown of milestones with percentage allocations and instructions
- Used when users create new assignments from templates

### Styling Approach

- **Tailwind CSS v4.1** with custom theme tokens in `index.css@37-51`
- Custom UWA brand colors: `--color-uwaBlue`, `--color-uwaGold`, `--color-uwaGrey`
- Background uses radial gradients with fixed attachment
- Custom font: Plus Jakarta Sans loaded from `/public/PlusJakartaSans.ttf`
- Reusable card style: `.surface-card` class for consistent surfaces
- Modal styling uses glassmorphic effects (`bg-white/90 backdrop-blur`)

## Backend Integration Notes

The frontend expects a backend API at `http://127.0.0.1:5000` with these endpoints:
- `POST /plan` - Create new plan
- `GET /plan/:planId` - Fetch plan
- `PUT /plan/:planId` - Update plan
- `DELETE /plan/:planId` - Delete plan
- `POST /plan/:planId/assignments` - Add assignment to plan
- `GET /plan/:planId/generate` - Generate milestones for plan
- `GET /export/:planId.ics` - Export plan as ICS
- `GET /export/:planId.pdf` - Export plan as PDF

All API calls use snake_case for request/response fields (e.g., `due_date`, `plan_id`).

## Type System Notes

- Assignment color is limited to predefined Tailwind color names (see `calendarColors` in `CalendarTypes.ts:304`)
- Dates are stored as JavaScript `Date` objects internally, but transmitted as ISO strings (`ISODate` type) to the backend
- The `AssignmentCalendar` interface is the primary data structure for calendar items
- `Assignment` (from `CalendarTypes.ts:60`) is used for templates and differs from `Assignment` in `plan.ts:23`

## Important Conventions

- Unit codes are used as keys for grouping assignments (e.g., "CITS3200")
- Semester dates are hardcoded for UWA 2025 (update `sem1`/`sem2` in `CalendarTypes.ts:298-299` for future years)
- Modal IDs are generated using `crypto.randomUUID()` with fallback to `Math.random()`
- Assignment events are distributed evenly across the assignment duration by default (see `mapEvents` in `CalendarTypes.ts:96-119`)
