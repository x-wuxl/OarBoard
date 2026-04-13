# Dashboard Trend Comparison Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add week/month/year comparison trends to the Stage Focus metric cards, using the approved lightweight inline trend row plus a low-contrast background trend-curve arrow.

**Architecture:** Extend the trend card view-model to include comparison metadata, compute current-vs-previous period summaries in `app/page.tsx`, and render the approved visual treatment in `src/components/trend-section.tsx`. Keep logic server-side, keep the client component presentation-focused, and verify behavior with TDD at the transform and component levels.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Framer Motion, Vitest

---

## File Structure

### Files to modify

- `app/page.tsx`
  - Compute previous week, previous month, and previous year summaries from existing workout records
  - Pass comparison labels and previous-period totals into trend-card builders
- `src/lib/oarboard/calendar-data.ts`
  - Extend `TrendCardView`
  - Add comparison-state calculation helpers
  - Build trend metadata for each metric card
- `src/lib/oarboard/__tests__/calendar-data.test.ts`
  - Add failing tests for comparison-state generation and edge cases
- `src/components/trend-section.tsx`
  - Render inline trend row and background trend curve arrow
  - Preserve current card layout and motion style
- `src/components/__tests__/trend-section.test.ts`
  - Add component rendering tests for trend copy and state rendering

### Files to leave untouched unless strictly necessary

- `src/components/dashboard-section.tsx`
  - Already has unrelated local modifications; do not revert or mix into this feature
- `src/components/__tests__/dashboard-section.test.ts`
  - Already exists for unrelated work; do not rewrite for this feature

---

### Task 1: Extend trend-card data model with comparison metadata

**Files:**
- Modify: `src/lib/oarboard/calendar-data.ts`
- Test: `src/lib/oarboard/__tests__/calendar-data.test.ts`

- [ ] **Step 1: Write the failing tests for comparison metadata**

Add tests that prove:
- `buildTrendCards` can receive current totals, previous totals, and a comparison label
- positive deltas produce `+x.x%`
- zero / near-zero deltas produce `持平`
- missing previous totals produce `暂无环比`
- previous-period zero with positive current values produces `新增`

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `npm test -- src/lib/oarboard/__tests__/calendar-data.test.ts`

Expected:
- FAIL because `buildTrendCards` does not yet expose comparison metadata

- [ ] **Step 3: Implement the minimal comparison-state model**

In `src/lib/oarboard/calendar-data.ts`:
- extend `TrendCardView` with fields for:
  - `comparisonLabel`
  - `trendDisplay`
  - `trendState`
  - optional tooltip/support values for current and previous raw metrics
- add minimal helpers to calculate trend percent text per metric
- keep threshold logic simple and centralized

- [ ] **Step 4: Run the targeted test to verify it passes**

Run: `npm test -- src/lib/oarboard/__tests__/calendar-data.test.ts`

Expected:
- PASS

- [ ] **Step 5: Refactor for clarity**

If duplication exists across metrics:
- extract one helper for trend classification
- extract one helper for metric-specific raw value picking

- [ ] **Step 6: Re-run the targeted test after refactor**

Run: `npm test -- src/lib/oarboard/__tests__/calendar-data.test.ts`

Expected:
- PASS

---

### Task 2: Compute previous-period totals in the page data pipeline

**Files:**
- Modify: `app/page.tsx`
- Test: `src/lib/oarboard/__tests__/calendar-data.test.ts` (existing logic coverage remains the guard)

- [ ] **Step 1: Add date-range helpers for previous week/month/year**

Implement focused helpers in `app/page.tsx` for:
- previous week date range
- previous month identifier
- previous year identifier

- [ ] **Step 2: Wire current and previous summaries into `buildTrendCards` calls**

Update:
- `weekCards`
- `monthCards`
- `yearCards`

Each call should pass:
- current totals
- previous-period totals (or `null` if missing)
- comparison label (`vs 上周` / `vs 上月` / `vs 上年`)

- [ ] **Step 3: Run the transform test suite**

Run: `npm test -- src/lib/oarboard/__tests__/calendar-data.test.ts`

Expected:
- PASS, proving integration still satisfies the view-model contract

---

### Task 3: Render the approved trend UI in the metric cards

**Files:**
- Modify: `src/components/trend-section.tsx`
- Test: `src/components/__tests__/trend-section.test.ts`

- [ ] **Step 1: Write the failing component tests**

Add tests that prove:
- trend row renders `+8.2% vs 上周` for up state
- `持平` renders without a comparison suffix
- `暂无环比` renders for missing data
- background arrow wrapper changes by trend state

- [ ] **Step 2: Run the targeted component test to verify it fails**

Run: `npm test -- src/components/__tests__/trend-section.test.ts`

Expected:
- FAIL because the component currently renders only the main value

- [ ] **Step 3: Implement the minimal UI**

In `src/components/trend-section.tsx`:
- keep the title and number hierarchy intact
- add a single-line trend row beneath the main value
- add a background SVG trend arrow in the lower-right
- map states to subdued colors and low-opacity lines
- preserve existing period-switch behavior

- [ ] **Step 4: Run the component test to verify it passes**

Run: `npm test -- src/components/__tests__/trend-section.test.ts`

Expected:
- PASS

- [ ] **Step 5: Refine spacing and motion**

Tune:
- card padding / spacing
- trend-row typography
- arrow placement and opacity
- period-switch fade behavior

- [ ] **Step 6: Re-run the component test after refinement**

Run: `npm test -- src/components/__tests__/trend-section.test.ts`

Expected:
- PASS

---

### Task 4: Verify the full feature and repository health

**Files:**
- Verify: `src/lib/oarboard/__tests__/calendar-data.test.ts`
- Verify: `src/components/__tests__/trend-section.test.ts`
- Verify: project type system via `tsc`

- [ ] **Step 1: Run both targeted tests together**

Run: `npm test -- src/lib/oarboard/__tests__/calendar-data.test.ts src/components/__tests__/trend-section.test.ts`

Expected:
- PASS

- [ ] **Step 2: Run full typecheck**

Run: `npm run typecheck`

Expected:
- PASS

- [ ] **Step 3: If fast enough, run the full test suite**

Run: `npm test`

Expected:
- PASS

- [ ] **Step 4: Commit the implementation**

```bash
git add app/page.tsx src/lib/oarboard/calendar-data.ts src/lib/oarboard/__tests__/calendar-data.test.ts src/components/trend-section.tsx src/components/__tests__/trend-section.test.ts docs/superpowers/plans/2026-04-13-dashboard-trend-comparison-implementation.md
git commit -m "feat: add trend comparisons to stage focus cards"
```

---

## Execution Mode

User preference overrides the normal handoff gate for this session:
- proceed directly after planning
- do not pause to ask for execution mode

Therefore this plan will be executed inline in the current session.
