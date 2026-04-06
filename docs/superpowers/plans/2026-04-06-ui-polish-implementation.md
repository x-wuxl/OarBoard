# OarBoard UI Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the existing OarBoard dashboard so the current five-section experience feels more premium, quieter, and more cohesive without changing data behavior or page structure.

**Architecture:** Keep the current component boundaries and analytics logic intact. Concentrate polish work into the shared page atmosphere (`app/globals.css`) plus the four section components that own the visible surfaces. Touch shared motion/ring components only if section-level polish clearly requires cross-component consistency.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, Framer Motion, Recharts, Vitest, TypeScript

---

## File Structure

### Existing files to modify
- `app/globals.css` — global background atmosphere, shared material feel, cross-page contrast balance, shared token-level adjustments
- `src/components/poster-hero.tsx` — Hero shell hierarchy, primary vs secondary card emphasis, Time Machine banner refinement
- `src/components/macro-overview.tsx` — Macro shell polish, left asset-card hierarchy, right panel tab shell, heatmap/fitness visual balance
- `src/components/voyage-section.tsx` — route path emphasis, marker treatment, metric cards, route-tag hierarchy
- `src/components/dashboard-section.tsx` — history-row precision, DNA strip treatment, detail-panel material polish, milestone ledger presentation
- `src/components/fitness-rings.tsx` — optional shared ring refinement only if Hero polish cannot stay local
- `src/components/animated-metrics.tsx` — optional shared motion tuning only if section polish reveals obvious cross-page timing inconsistency

### Existing files to verify only
- `docs/superpowers/specs/2026-04-06-ui-polish-design.md` — approved design intent and acceptance cues
- `src/lib/oarboard/__tests__/*.test.ts` — regression safety; no logic changes expected
- `src/lib/moke/__tests__/*.test.ts` — regression safety; no logic changes expected

### No new product files expected
This polish pass should not create new runtime feature files. If a new file seems necessary, stop and verify that the need comes from a truly shared styling concern rather than convenience.

---

## Cross-Page Visual Checklist

Use this checklist throughout implementation, not only at the end:
- background is darker and more recessive than section shells
- section shells feel heavier than their inner cards
- Level 1 / 2 / 3 hierarchy is legible across Hero, Macro, Voyage, Dashboard
- broad ambient glow is reduced; accent glow is selective
- labels are quieter and more consistent across sections
- motion feels calmer, with no new decorative loops outside approved accents

This checklist should be reviewed after Task 1 and again after Task 6.

---

### Task 1: Establish the global material and token system

**Files:**
- Modify: `app/globals.css`
- Verify: `src/components/poster-hero.tsx`, `src/components/macro-overview.tsx`, `src/components/voyage-section.tsx`, `src/components/dashboard-section.tsx`

- [ ] **Step 1: Read the approved spec and extract the shared visual tokens**

Read: `docs/superpowers/specs/2026-04-06-ui-polish-design.md`

Extract and keep in view while implementing:
- radius family
- border hierarchy
- shadow hierarchy
- label treatment
- background vs shell contrast
- motion bounds
- glow redistribution rules

- [ ] **Step 2: Read the current global stylesheet carefully**

Read: `app/globals.css`

Locate:
- root background variables
- page background gradients
- ring-related shared styles
- any reusable shadow / glow patterns already present

- [ ] **Step 3: Implement minimal global polish changes**

Update `app/globals.css` to do only the following:
- deepen the page background by one visual step
- reduce the dominance of the top cyan and lower rose atmospheric blur
- establish only the minimum shared token-like adjustments needed across multiple sections
- keep ring styling intact unless it clearly clashes with the new material balance

Do **not** create a parallel styling system if existing Tailwind class patterns remain sufficient.

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: Review the page manually against the cross-page checklist**

Confirm at this point:
- background has receded
- shells now have a stronger chance to lead visually
- no logic or structure changed

- [ ] **Step 6: Commit**

```bash
git add app/globals.css
git commit -m "style: refine global dashboard material system"
```

---

### Task 2: Reconcile shared hierarchy before section polish

**Files:**
- Modify: `src/components/poster-hero.tsx`
- Modify: `src/components/macro-overview.tsx`
- Modify: `src/components/voyage-section.tsx`
- Modify: `src/components/dashboard-section.tsx`
- Optional modify: `src/components/fitness-rings.tsx`
- Optional modify: `src/components/animated-metrics.tsx`

- [ ] **Step 1: Read each section component for hierarchy ownership**

Read:
- `src/components/poster-hero.tsx`
- `src/components/macro-overview.tsx`
- `src/components/voyage-section.tsx`
- `src/components/dashboard-section.tsx`

Map where each file currently defines:
- Level 1 shell treatment
- Level 2 card treatment
- Level 3 label / tag treatment
- local hover and motion behavior

- [ ] **Step 2: Decide local vs shared ownership for any remaining inconsistencies**

Rules:
- if the issue is page-wide atmosphere or shared token behavior, keep it in `app/globals.css`
- if the issue is section hierarchy or layout emphasis, keep it local to the section component
- touch `fitness-rings.tsx` only if Hero ring polish cannot remain local
- touch `animated-metrics.tsx` only if multiple sections obviously need calmer shared motion behavior

- [ ] **Step 3: Make only the smallest cross-section consistency fixes now**

Implement only the cross-section consistency items that must be aligned before per-section polish:
- label quietness
- border hierarchy consistency
- shell vs inner-card contrast consistency
- hover brightness restraint

Do **not** do full per-section polish yet.

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: Perform a quick manual visual check**

Confirm:
- all four sections feel like they belong to one product family
- no section is obviously louder than intended before detailed polish starts

- [ ] **Step 6: Commit**

```bash
git add src/components/poster-hero.tsx src/components/macro-overview.tsx src/components/voyage-section.tsx src/components/dashboard-section.tsx src/components/fitness-rings.tsx src/components/animated-metrics.tsx
git commit -m "style: align shared UI hierarchy across sections"
```

Omit untouched files from the `git add` command.

---

### Task 3: Polish PosterHero hierarchy

**Files:**
- Modify: `src/components/poster-hero.tsx`
- Optional modify: `src/components/fitness-rings.tsx`

- [ ] **Step 1: Read the Hero-related spec cues**

Read the `PosterHero` and `Time Machine / Milestones / DNA Integration` sections in:
- `docs/superpowers/specs/2026-04-06-ui-polish-design.md`

- [ ] **Step 2: Implement minimal Hero shell polish**

Update `src/components/poster-hero.tsx` to:
- make the outer shell slightly denser and cleaner at the edge
- strengthen only the two primary support cards
- soften only the four secondary cards through calmer labels, lower contrast, or spacing
- refine the Time Machine surface so it feels lighter, thinner, and more editorial

Update `src/components/fitness-rings.tsx` only if needed to reduce local visual competition around the ring core.

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Perform manual Hero review**

Confirm:
- `500m 配速` and `今日距离` outrank the four secondary cards
- Time Machine reads like a premium annotation instead of a notification strip
- ring treatment does not overpower the surrounding cards

- [ ] **Step 5: Commit**

```bash
git add src/components/poster-hero.tsx src/components/fitness-rings.tsx
git commit -m "style: elevate hero card hierarchy"
```

Omit untouched files from the `git add` command.

---

### Task 4: Polish MacroOverview shell and instrument feel

**Files:**
- Modify: `src/components/macro-overview.tsx`

- [ ] **Step 1: Read the MacroOverview spec cues**

Read the `MacroOverview` section in:
- `docs/superpowers/specs/2026-04-06-ui-polish-design.md`

- [ ] **Step 2: Implement minimal Macro polish**

Update `src/components/macro-overview.tsx` to:
- improve number-first emphasis in the left grid
- quiet icon treatment slightly
- make the count/streak card feel purpose-built
- make the right panel tabs and shell more controlled and premium
- reduce excess contrast around heatmap labels and legend
- make the TSB status row read like an instrument surface, not a generic footer row

Do not change heatmap or fitness data logic.

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Perform manual Macro review**

Confirm:
- the right panel feels calmer and more deliberate than the left metric grid
- the count/streak card feels intentionally dual-layered
- heatmap and fitness states share one shell language

- [ ] **Step 5: Commit**

```bash
git add src/components/macro-overview.tsx
git commit -m "style: refine macro overview instrument panel"
```

---

### Task 5: Polish VoyageSection atmosphere

**Files:**
- Modify: `src/components/voyage-section.tsx`

- [ ] **Step 1: Read the VoyageSection spec cues**

Read the `VoyageSection` section in:
- `docs/superpowers/specs/2026-04-06-ui-polish-design.md`

- [ ] **Step 2: Implement minimal Voyage polish**

Update `src/components/voyage-section.tsx` to:
- strengthen the completed path subtly
- recess the unfinished path further
- refine the marker to feel more like a beacon than a default dot
- tighten route metadata typography
- make completed/current/locked tag states more legible without making tags loud

Do not add maps, tooltips, or new interactions.

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Perform manual Voyage review**

Confirm:
- Voyage is the most atmospheric section
- it is not the brightest section overall
- route tags and metadata remain visually quiet

- [ ] **Step 5: Commit**

```bash
git add src/components/voyage-section.tsx
git commit -m "style: polish voyage section atmosphere"
```

---

### Task 6: Polish Dashboard precision and milestone ledger feel

**Files:**
- Modify: `src/components/dashboard-section.tsx`
- Optional modify: `src/components/animated-metrics.tsx`

- [ ] **Step 1: Read the Dashboard-related spec cues**

Read the `DashboardSection` and `Time Machine / Milestones / DNA Integration` sections in:
- `docs/superpowers/specs/2026-04-06-ui-polish-design.md`

- [ ] **Step 2: Implement minimal Dashboard polish**

Update `src/components/dashboard-section.tsx` to:
- tighten row alignment and visual rhythm
- make selected-state emphasis more precise
- reduce DNA label noise and improve strip material feel
- deepen the chart stage modestly
- reframe milestone rows as a cleaner ledger surface

Update `src/components/animated-metrics.tsx` only if multiple sections clearly need calmer shared motion behavior.

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Perform manual Dashboard review**

Confirm:
- history rows feel more aligned and less noisy
- DNA reads like a fingerprint texture, not a debug strip
- milestones read like a ledger, not a generic list
- the right detail area feels less crowded with the same information

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard-section.tsx src/components/animated-metrics.tsx
git commit -m "style: refine dashboard precision surfaces"
```

Omit untouched files from the `git add` command.

---

### Task 7: Run full regression and visual verification

**Files:**
- Verify: `app/globals.css`
- Verify: `src/components/poster-hero.tsx`
- Verify: `src/components/macro-overview.tsx`
- Verify: `src/components/voyage-section.tsx`
- Verify: `src/components/dashboard-section.tsx`
- Verify: `src/components/fitness-rings.tsx`
- Verify: `src/components/animated-metrics.tsx`
- Test: `src/lib/oarboard/__tests__/*.test.ts`
- Test: `src/lib/moke/__tests__/*.test.ts`

- [ ] **Step 1: Run TypeScript verification**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 2: Run all library tests**

Run: `npx vitest run src/lib/oarboard/__tests__/*.test.ts src/lib/moke/__tests__/*.test.ts`
Expected: PASS, all existing tests green

- [ ] **Step 3: Run the app for visual inspection**

Run: `npm run dev`
Expected: local dev server starts successfully

- [ ] **Step 4: Perform section-by-section visual review against the spec**

Check each section explicitly:
- **Hero**: main support cards outrank secondary cards; Time Machine reads like an annotation
- **Macro**: right panel feels calmer than the left grid; TSB row reads like an instrument
- **Voyage**: path/marker are atmospheric; tags stay quiet
- **Dashboard**: selected row is precise; DNA feels like texture; milestones feel like a ledger
- **Global**: labels are quieter and more consistent; background is darker and more recessive than shells

- [ ] **Step 5: Make only the smallest final corrections if one specific acceptance cue fails**

If any cue above clearly fails, fix only that issue. Do not expand scope.

- [ ] **Step 6: Re-run verification after final correction**

Run:
- `npm run typecheck`
- `npx vitest run src/lib/oarboard/__tests__/*.test.ts src/lib/moke/__tests__/*.test.ts`

Expected: both PASS

- [ ] **Step 7: Commit**

```bash
git add app/globals.css src/components/poster-hero.tsx src/components/macro-overview.tsx src/components/voyage-section.tsx src/components/dashboard-section.tsx src/components/fitness-rings.tsx src/components/animated-metrics.tsx
git commit -m "style: complete premium UI polish pass"
```

Omit unchanged files from the final `git add` command.
