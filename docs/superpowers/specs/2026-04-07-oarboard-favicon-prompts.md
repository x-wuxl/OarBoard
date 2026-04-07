# OarBoard Favicon Prompt Pack for Google Nano Banana 2

Date: 2026-04-07

This file contains prompt variants adapted for Google Nano Banana 2 to explore five favicon directions for OarBoard.

## Model usage notes

Nano Banana 2 generally works better with:
- natural language prompts instead of parameter-heavy prompt syntax
- explicit instructions like "icon only", "no text", and "simple background"
- strong constraints around silhouette, geometry, and cleanliness
- iterative refinement after the first generation instead of trying to force everything in one prompt

Use these prompts to explore directions, then refine the strongest result toward a cleaner SVG-ready logo.

---

## Global base instruction

Append or prepend this instruction to any of the prompts below if needed:

```text
Create a square icon-only image for a favicon concept. Use a very simple dark background. Show one centered symbol only. No text, no wordmark, no mockup scene, no product UI, no extra objects. The symbol should be bold, minimal, clean, geometric, and easy to recognize at very small size.
```

---

## 1) Halo O

### Main prompt
```text
Create a premium favicon concept for a data product called OarBoard. The icon should be a minimalist geometric letter O. It should feel elegant, restrained, luxurious, and suitable for a high-end dark analytics product. Use a dark obsidian or charcoal background and a soft champagne gold symbol. The O should have a refined silhouette with a very subtle opening or asymmetrical cut to suggest motion and intelligence, but keep it extremely simple. Show only one centered icon. Make it bold, clean, and readable at favicon size.
```

### Negative prompt
```text
No text, no wordmark, no realistic objects, no rowing boat, no paddle illustration, no neon colors, no rainbow gradient, no glowing sci-fi effects, no clutter, no thin lines, no extra decoration, no mockup presentation.
```

### Refinement follow-up
```text
Make the icon more minimal and more premium. Reduce all small details. Strengthen the outer silhouette. Keep the O thicker and cleaner so it reads clearly at 16px.
```

---

## 2) Oar Halo

### Main prompt
```text
Create a distinctive favicon concept for OarBoard as a custom brand symbol. Combine a geometric letter O with a very simplified rowing paddle into one unified emblem. The paddle should be abstract, short, rounded, and elegant, not realistic. The icon should feel premium, memorable, refined, and suitable for a high-end dashboard product. Use a dark graphite background and a muted warm gold symbol. Keep the composition centered, bold, and simple enough to work as a favicon.
```

### Negative prompt
```text
No realistic paddle, no rowing boat, no athlete, no sports team logo style, no water splash, no fitness app aesthetic, no text, no badge clutter, no tiny details, no bright neon glow, no complex background.
```

### Refinement follow-up
```text
Simplify the paddle and merge it more naturally into the O. Make the icon feel more luxurious and less sporty. Increase negative space and make the silhouette clearer at small size.
```

---

## 3) Data Orbit

### Main prompt
```text
Create a futuristic premium favicon concept for OarBoard. Design one abstract symbol inspired by the letter O, a clean orbit path, and data flow. The icon should feel like a precision analytics operating system: intelligent, premium, slightly futuristic, and very clean. Use a midnight blue-black background and a cool silver-blue symbol, with only a very subtle sense of glow if needed. Keep the icon minimal: one ring, one trajectory line, and at most one small node. Show one centered symbol only.
```

### Negative prompt
```text
No cyberpunk clutter, no dense HUD interface, no multiple rings, no game UI, no spaceship aesthetic, no rainbow neon, no text, no wireframe complexity, no busy background, no tiny technical details.
```

### Refinement follow-up
```text
Reduce the sci-fi feel and make the icon more premium and controlled. Keep only one dominant ring and one clean orbit line. Remove extra effects and improve small-size readability.
```

---

## 4) OB Seal

### Main prompt
```text
Create a premium monogram favicon concept for OarBoard using the letters O and B. Design a bold geometric OB symbol that feels refined, modern, luxury-tech, and suitable for a high-end data product. The O should act as the outer structure, and the B should appear through negative space or minimal internal cuts. Use a dark black or charcoal background and a soft metallic gold or ivory symbol. Keep the icon centered, clean, geometric, and readable as a favicon.
```

### Negative prompt
```text
No vintage crest decoration, no heraldic style, no serif wordmark, no ornamental frame, no thin engraved lines, no corporate generic logo, no text, no complex monogram flourishes, no detailed background.
```

### Refinement follow-up
```text
Make the monogram simpler and bolder. Reduce decorative feeling. Strengthen the negative space so the shape feels clean and premium at small size.
```

---

## 5) Stroke Current

### Main prompt
```text
Create a refined favicon concept for OarBoard using an abstract symbol made from two or three bold strokes only. The symbol should combine a partial O curve with a second directional stroke that could suggest either a rowing gesture or a data trajectory. It should feel dynamic but controlled, intelligent, premium, and modern. Use a dark carbon background and a muted warm gold main stroke, with an optional subtle cool blue accent. Show only one centered icon, with a clean silhouette that works at favicon size.
```

### Negative prompt
```text
No speed lines, no racing logo, no heartbeat icon, no literal chart icon, no athlete illustration, no neon overload, no text, no glossy over-rendering, no thin details, no complex motion effects.
```

### Refinement follow-up
```text
Reduce the number of strokes and make the icon cleaner. Keep the sense of motion but remove anything that feels sporty or noisy. Make the silhouette stronger and more elegant.
```

---

## Unified refinement commands

Use these short follow-up instructions after a first generation when you want to push the result in a better direction.

### Make it more favicon-ready
```text
Make the icon simpler, bolder, and easier to recognize at 16x16. Remove small details and keep one strong silhouette.
```

### Make it more premium
```text
Make it feel more luxurious, restrained, and high-end. Reduce playfulness and remove anything that feels cheap or sporty.
```

### Make it more minimal
```text
Reduce the design to the fewest possible geometric elements. Improve negative space and remove all unnecessary detail.
```

### Make it more brandable
```text
Make the symbol more distinctive and ownable as a long-term brand mark. Keep it simple but memorable.
```

### Make it less futuristic
```text
Reduce the sci-fi feeling. Keep the icon clean, dark, premium, and modern without obvious tech effects.
```

### Make it less sporty
```text
Remove athletic or fitness-app cues. Keep only a subtle hint of rowing motion, not a literal sports identity.
```

---

## Best prompts to try first in Nano Banana 2

1. Oar Halo
2. Halo O
3. OB Seal

These three are the best starting points because they are more likely to produce a stable, brandable, favicon-friendly shape.

---

## Suggested workflow

1. Run one main prompt at a time.
2. Pick the strongest image, not the most detailed one.
3. Use one refinement follow-up only.
4. Repeat until the symbol becomes simpler and more recognizable.
5. Once you have a strong direction, redraw it as SVG for final use.
