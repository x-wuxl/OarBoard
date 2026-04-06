# OarBoard UI Polish Design

## Goal

Refine the newly expanded OarBoard dashboard so it feels more premium and product-finished without changing structure, feature scope, or data behavior.

Chosen direction:
- **Primary**: Material Luxury
- **Secondary accent**: Dark Futurism Lite
- **Optimization target**: high-end visual quality over stronger spectacle or denser information

## Non-Goals

This polish pass will not:
- change section order
- move the newly added features to different locations
- modify the analytics logic for Time Machine, Milestones, Fitness-Fatigue, Voyage, or DNA
- add new features, dialogs, or extra charts
- increase visual noise or push the product toward cyberpunk styling

## Desired Outcome

The page should feel like the same product, but more mature and more expensive:
- the Hero reads like a premium cover card
- Macro Overview reads like a professional metrics console
- Voyage reads like a restrained narrative interlude
- Dashboard reads like a precise analysis surface rather than a dense utility panel

In this spec, “more premium / more expensive” means:
- fewer simultaneously bright surfaces on screen
- clearer separation between primary shells and secondary cards
- quieter small text, stronger numeric anchors
- more consistent radius, border, and shadow treatment
- glow limited to a few intentional accents instead of being broadly distributed

The improvement should register as “this feels like a finished product,” not “a lot more things were added.”

## Scope Boundary

### Allowed changes
- spacing adjustments inside existing sections
- changes to border opacity, background opacity, inner shadows, and highlight intensity
- changes to typography hierarchy, label treatment, and card emphasis
- modest size adjustments inside existing cards if they do not change information architecture
- motion tuning for existing transitions and hover states
- minor markup adjustments inside existing components if required to support visual refinement

### Not allowed in this pass
- reordering sections
- moving features to different areas of the page
- introducing new feature states, dialogs, or navigation
- changing data contracts or analysis logic
- turning a section into a meaningfully different layout pattern

A refinement is out of scope if it alters where information lives, changes scan order, or forces the user to learn a new interaction model.

## Visual Hierarchy Map

### Level 1 — primary shells
These should feel heaviest and most materially defined:
- outer Hero container
- outer Macro Overview container
- outer Voyage container
- outer Dashboard left and right shells

### Level 2 — interior cards / stages
These should feel contained and readable, but clearly subordinate to Level 1:
- Hero main support cards (`500m 配速`, `今日距离`)
- Hero secondary metric cards
- Macro 2x2 metric cards
- Macro right-side heatmap / fitness panel body
- Voyage metric summary cards
- Dashboard detail metric mini-cards
- Dashboard chart stage
- Dashboard milestone row surfaces

### Level 3 — metadata and auxiliary surfaces
These should be the quietest elements on screen:
- Time Machine label line and deltas
- section labels and legends
- heatmap month labels and legend row
- dashboard rhythm labels
- Voyage route tags
- small status labels and helper text

Implementation should preserve this hierarchy consistently across the page.

## System Tokens And Ownership

### Radius targets
Use these as the default radius family unless an existing local shape strongly depends on a nearby value:
- Level 1 shells: `2rem - 2.2rem`
- Level 2 cards: `1.2rem - 1.6rem`
- Level 3 pills / tags / compact surfaces: `0.6rem - 1rem`

### Border targets
- Level 1 shell borders: approximately `white/8 - white/10`
- Level 2 cards: approximately `white/5 - white/6`
- Level 3 surfaces: approximately `white/4 - white/5`
- selected accents may exceed these only for truly active states

### Shadow targets
- Level 1 shells: outer depth + subtle inner highlight
- Level 2 cards: primarily inner depth, limited outer lift
- Level 3 surfaces: minimal outer depth, mostly contrast by opacity and typography

### Label treatment
Apply consistently across sections:
- uppercase or tracking-expanded small labels stay in the `0.68rem - 0.75rem` range
- labels stay in zinc-muted territory and do not compete with numerics
- helper text stays quieter than labels

### Background vs card contrast
Implementation target:
- page background sits at least one contrast step darker than current section shells
- section shells feel denser than the page background
- inner cards remain readable without becoming brighter than the shells in aggregate

### Motion specificity
- entrance animations: roughly `0.55s - 0.8s`
- micro hover transitions: roughly `0.18s - 0.3s`
- repeating accent motion: only on Voyage marker and already-emphasized accent elements
- no new looping motion in non-accent areas
- prefer one consistent easing family per section
- avoid stagger unless the section is visually sparse enough to support it

### Styling ownership
Use these ownership rules to avoid scope drift:
- `app/globals.css`: global background, shared material tokens, cross-page atmosphere, ring-related shared refinement
- per-component files: hierarchy, spacing, local card treatment, local hover behavior, section-specific accent rules
- shared components like `animated-metrics.tsx` and `fitness-rings.tsx`: only when needed for motion/material consistency across multiple sections

## Design Principles

### 1. Background retreats, cards lead
The page background should become quieter and deeper. Existing cyan and rose atmospheric blur should remain present but recede behind the interface. The visual center of gravity should move from ambient glow to card surfaces.

### 2. Fewer active highlights, higher precision
Glow should not disappear, but it should become scarce and deliberate. Strong light treatment should be limited to:
- current selection
- Voyage progress path and marker
- TSB status signal
- selected DNA emphasis
- positive / negative comparison accents in Time Machine

### 3. Typography feels curated
Large numbers remain the hero elements, but supporting labels and metadata become lighter, quieter, and more precisely spaced. The visual goal is closer to exhibit labeling than commodity dashboard chrome.

### 4. Motion feels expensive, not energetic
Animations become calmer and more material-like by reducing overlap, reducing unnecessary hover brightness, and keeping animated emphasis on meaningful state changes only.

## Glow Rules

Glow is not removed globally, but it must be redistributed.

### Keep / strengthen slightly
- selected dashboard row edge
- Voyage progress path and marker
- TSB status indicator
- selected / emphasized DNA state
- positive / negative comparison accents in Time Machine

### Reduce noticeably
- broad ambient page blur dominance
- hover brightening on non-primary cards
- any section where glow competes with readability of numeric content

### Do not add
- new large-area neon fog
- multi-color competing highlights inside the same small region
- constant pulsing outside explicitly highlighted accent elements

A useful test: if removing glow from a component makes it look cleaner rather than weaker, that component should not have glow.

## Section-by-Section Design

## PosterHero

### Intent
Turn Hero into a premium poster-like opening frame.

### Changes
- Refine the ring area so it feels cleaner and less surrounded by competing glow.
- Increase visual priority of the two main supporting cards: `500m 配速` and `今日距离`.
- Reduce the perceived loudness of the four secondary metric cards.
- Rework the Time Machine banner into a luxury annotation rather than a notification strip.

### Specific polish
- outer Hero container gets deeper material contrast and cleaner edge definition
- main metric cards receive slightly stronger surface separation than secondary cards
- secondary cards rely more on spacing and typography than contrast
- Time Machine gains thinner dividers, softer labels, and more elegant delta emphasis

### Pass / fail cue
The two primary support cards must stand out more clearly than the four secondary cards without adding new chrome.

## MacroOverview

### Intent
Make the overview read as a high-end analytics console.

### Left 2x2 asset cards
- stronger number-first composition
- icons visually recede slightly
- the training count / streak card becomes a clearly intentional dual-layer card rather than a card with extra lines appended
- longest streak remains visibly secondary to current streak

### Right panel shell
- Tab control feels more like a mode switch than a generic segmented control
- heatmap controls become lighter and more edge-aligned
- Fitness state area reads like an instrument panel with restrained authority

### Heatmap mode
- improve breathing room around labels and legend
- reduce minor contrast clutter around cells
- preserve existing grid logic while improving perceived precision

### Fitness state mode
- chart surface becomes deeper and cleaner
- CTL / ATL hierarchy becomes clearer
- TSB indicator reads like a premium state readout rather than a generic status line

### Pass / fail cue
The right panel must feel calmer and more deliberate than the left metric grid, not equally loud.

## VoyageSection

### Intent
Make Voyage the one place where restrained futurism is allowed to show.

### Changes
- completed route path becomes smoother and more materially emphasized than the unfinished path
- unfinished path recedes further into the background
- progress marker becomes more like a navigation beacon than a generic dot
- route metadata becomes more editorial and less widget-like
- route tags gain clearer distinction between completed / current / locked states

### Visual tone
This section should feel quietly memorable, not flashy. It is the most appropriate place for subtle cinematic glow.

### Pass / fail cue
The path and marker may be the most atmospheric element on the page, but route tags and metadata must remain quiet.

## DashboardSection

### Intent
Turn the densest part of the page into the most professional-looking part.

### History list
- tighten alignment across columns
- refine selected state so emphasis is thinner and more precise
- make DNA strips feel like visual fingerprints rather than utility bars
- reduce label clutter and improve rhythm label presentation

### Detail panel
- unify metric mini-cards into a cleaner family
- deepen the chart stage so data floats above it more clearly
- turn the milestones timeline into a ledger-like achievement surface instead of a generic list

### Pass / fail cue
The selected row must feel more precise, and the right detail area must feel less crowded than before even though it contains the same information.

## Time Machine / Milestones / DNA Integration

These three additions must feel integrated into the product language, not like newly attached utility widgets.

Pass / fail cue:
- Time Machine reads like a premium annotation
- Milestones read like a ledger
- DNA reads like a fingerprint texture, not a debug strip

## Global System Adjustments

### Material
- reduce broad glow fog
- increase depth through inner shadows and cleaner borders
- make outer containers feel heavier than inner cards

### Hover system
Replace “brighter on hover” with “surface response on hover” wherever possible.

### Background ownership
Put cross-page atmospheric tuning in `app/globals.css`; keep local card hierarchy and emphasis rules inside the owning component.

## Files Most Likely To Change

- `app/globals.css`
- `src/components/poster-hero.tsx`
- `src/components/macro-overview.tsx`
- `src/components/voyage-section.tsx`
- `src/components/dashboard-section.tsx`
- supporting shared files only when needed for cross-section consistency: `src/components/animated-metrics.tsx`, `src/components/fitness-rings.tsx`

## Implementation Strategy

### What to prioritize
1. global material system
2. Hero and Macro Overview
3. Voyage refinement
4. Dashboard refinement

### What to avoid
- structural rewrites
- logic edits
- new components beyond what the polish strictly needs
- adding more decorative effects than are removed or tightened

## Validation Criteria

The polish pass is successful if:
- the background feels darker and more recessive than the card layer
- the main Hero support cards visibly outrank the four smaller Hero cards
- Macro’s right panel reads as a more controlled instrument surface than before
- Voyage remains the most atmospheric section, but is not the brightest overall section
- Dashboard history rows feel more aligned and less noisy than before
- milestones read as a designed ledger, not a generic list of rows
- small labels across sections feel quieter and more consistent than before
- the page still unmistakably reads as OarBoard rather than a new visual system

## Summary

This is a focused premium-finish pass. The product structure remains intact. The win comes from restraint, hierarchy, and precision: darker background recession, cleaner card materials, quieter labels, more selective glow, and more intentional motion.

Implementation should prefer subtraction and calibration over addition. If a visual change adds energy but reduces clarity or material hierarchy, it is the wrong direction.

## Review Status

This spec is intended to be implementation-ready once it passes reviewer approval and user review.