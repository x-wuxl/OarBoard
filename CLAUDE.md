# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Summary

OarBoard is a personal rowing dashboard built on Next.js 16 (App Router) that visualizes Mok Fitness (摩刻健身) workout data. It is a single-page, read-only dashboard with an Apple Fitness-inspired dark glassmorphism aesthetic. The project language context is bilingual (Chinese docs, English code).

## Commands

```bash
npm run dev          # Start dev server (Turbopack) at localhost:3000
npm run build        # Production build
npm run typecheck    # TypeScript strict check (tsc --noEmit)
npm run test         # Run all unit tests (vitest)
```

No linter or formatter is configured. TypeScript strict mode is the primary code quality gate.

## Environment Variables

Copy `.env.example` to `.env.local`. Required vars: `MOKE_ACCOUNT_ID`, `MOKE_AUTHORIZATION`, `MOKE_BASE_URL`. When `MOKE_AUTHORIZATION` is absent, the app automatically falls back to mock data from `src/lib/moke/mock-data.ts`.

## Architecture

### Data Flow (top-down, server-first)

1. **`app/page.tsx`** — the only RSC that fetches data. Marked `force-dynamic`. All downstream components receive data as props.
2. **`src/lib/moke/`** — API gateway layer. The only code that touches the external Mok Fitness API. Includes `MokeClient`, type definitions, formatters, proxy helpers, and a file-system cache layer (`.cache/moke/<accountId>/`).
3. **`src/lib/oarboard/`** — pure view-model transforms (no I/O). Converts raw API data into typed UI props for each section: `poster-data.ts`, `dashboard-data.ts`, `calendar-data.ts`, `rings.ts`.
4. **`src/components/`** — UI components. Server components where possible; `'use client'` only for interactive parts (animations, hover, selection state).
5. **`app/api/moke/[...path]/route.ts`** — catch-all API proxy forwarding requests to the upstream Mok Fitness API.

### Key Boundaries

- Data fetching and transformation happens exclusively on the server. Never fetch or clean data in client components.
- `src/lib/moke/` handles all external API interaction; `src/lib/oarboard/` is purely functional transforms.
- Client state is local `useState` only (selected workout, pagination page, heatmap mode, trend filter). No external state library.

### Styling & Animation

- Tailwind CSS v4 via `@tailwindcss/postcss`. Dark glassmorphism aesthetic throughout.
- Framer Motion for all numeric/progress animations and layout transitions. Always use `AnimatedNumber` / `AnimatedProgressBar` for data display — never render raw values statically.
- Recharts for the dual Y-axis glow area chart in the dashboard detail panel.

## Testing

All tests are pure unit tests in Vitest (node environment). Test files live in `__tests__/` directories alongside their modules:
- `src/lib/moke/__tests__/` — formatters, service transforms, proxy helpers, mock data
- `src/lib/oarboard/__tests__/` — calendar, dashboard, poster, rings transforms

No component or E2E tests exist.

## Critical Warnings

- **Do NOT restore deleted components** `lifetime-stats.tsx` or `calendar-first-section.tsx`. Their logic has been rewritten into `macro-overview.tsx` and `trend-section.tsx`.
- **`calendar-data.ts` is fragile** — it contains complex date arithmetic for week boundaries and year heatmaps. Test thoroughly after any changes.
- The file-system cache (`.cache/moke/`) has no TTL. It never expires unless manually deleted. This is a known limitation.
- The cache does not persist on Vercel between deployments.
- `sumMileage` from the API is in kilometers (not meters). Conversions multiply by 1000 before calling `formatDistanceKm`.
