# Questory Design Reference Board

**Status:** Living research document — inspiration and principles, not a copy-paste library  
**Related:** [`questory-design-dna.md`](./questory-design-dna.md) · [`questory-source-usage-policy.md`](./questory-source-usage-policy.md) · [`questory-reference-shortlist.md`](./questory-reference-shortlist.md)

---

## A. Purpose

This board organizes external design sources into a **practical research workflow** for Questory UI work.

### What this board is for

- Collecting **named references** before redesign prompts
- Extracting **principles** (layout, hierarchy, motion, texture, typography) — not pixels
- Translating web/mobile inspiration into **React Native / Expo SDK 56** patterns
- Separating **global Questory DNA (70–75%)** from **universe skins (25–30%)**
- Avoiding generic “premium dark dashboard” drift

### What this board is NOT for

- Direct copying of Mobbin, Dribbble, Awwwards, or studio brand work
- Pasting Tailwind/shadcn code into production
- Adding external image URLs to the app bundle
- Replacing [`questory-design-dna.md`](./questory-design-dna.md) with random trends

### Implementation rule

Every reference must be **translated**:

| Web / design tool | Questory / React Native equivalent |
|-------------------|-------------------------------------|
| div / section | `View` |
| span / p | `Text` |
| button / a | `Pressable` |
| CSS grid/flex | Flexbox (`flexDirection`, `gap`, `flex`) |
| CSS animation | `react-native-reanimated`, `expo-linear-gradient`, Lottie (if licensed) |
| Canvas / WebGL | `@shopify/react-native-skia` (future, when justified) |
| Tailwind tokens | `questory-theme.ts`, `universe-skins.ts` |

Final production UI must still follow **Questory Design DNA** and pass [`ui-visual-qa.md`](./ui-visual-qa.md).

---

## B. Source categories

Raw source pool classified into eight practical groups. Sources may appear in more than one group.

### Master index (raw pool → category)

| Source | Primary category | Notes |
|--------|------------------|-------|
| Mobbin | Mobile UI | App flow screenshots |
| Screenlane | Mobile UI | Mobile patterns |
| Refero / Refero Styles | Mobile UI | UI pattern library |
| Dribbble | Mobile UI / Art direction | Filter for mobile; beware non-shippable concepts |
| Behance | Mobile UI / Art direction | Case studies, brand + product |
| Savee | Mobile UI / Art direction | Moodboards |
| Cosmos | Mobile UI / Art direction | Visual collections |
| Are.na | Mobile UI / Art direction | Research boards |
| Collected.li | Mobile UI / Art direction | Curated sites |
| Milanote | Mobile UI / AI tools | Moodboard organization |
| Notion | AI tools | Reference doc storage |
| Maze | Mobile UI | UX testing (research phase) |
| Seesaw | Mobile UI | App comparisons |
| Design Arena | Art direction | Site comparisons |
| Awwwards | Art direction | Hero, typography, atmosphere |
| Godly.website | Art direction | Premium web craft |
| Site of Sites | Art direction | Curated web |
| Unmatched Style | Art direction | Editorial web |
| Design Spells | Art direction | UI craft breakdowns |
| Before.click | Art direction | Transitions, first impressions |
| The Brand Identity | Typography / Brand | Brand systems |
| Pentagram | Typography / Brand | Brand craft (inspiration only) |
| Eye on Design | Art direction | Editorial design culture |
| Colossal | Art direction | Visual culture |
| Magazine B | Art direction | Editorial layout |
| The Drum | Art direction | Brand/marketing craft |
| BX Museum | Texture / Archive | Graphic history |
| Amo.co | Art direction | Minimal product brand |
| Oddlymade (Webflow) | Art direction | Experimental layout |
| Warhol (Webflow) | Texture / Archive | Pop/poster energy |
| Emil Kowalski | Art direction / Motion | Interaction craft |
| Impeccable Design | Art direction | UI quality bar |
| v0.dev / V0 | Component | Generate ideas; rewrite for RN |
| shadcn/ui | Component | Patterns only — not RN |
| 21st.dev | Component | Block ideas |
| Cult UI | Component | Component ideas |
| Skipper UI | Component | Component ideas |
| Watermelon UI | Component | Component ideas |
| Componentry | Component | UI blocks |
| Uiverse | Component | CSS micro-components → translate |
| React Bits | Component | React patterns → translate |
| Hyperframes | Component | Frame/layout ideas |
| Layers.to | Component | Design layers community |
| Skill.ui | Component | UI patterns |
| Awesome-designs.md | Component | Curated list |
| Cursor Directory | Component / AI | Cursor-related UI resources |
| Footer Design | Component | Footer patterns (web; adapt sparingly) |
| CTA Gallery | Component | CTA patterns |
| Reanimated | Motion | Core RN animation |
| Skia | Motion / 3D | GPU graphics in RN |
| LottieFiles | Motion | JSON animations (license check) |
| Jitter | Motion | Motion design export |
| SVGator | Motion | SVG animation |
| Typeface Animator | Motion | Type motion (marketing) |
| Framer Motion | Motion | Web motion → principles only |
| Framer | Motion / AI | Prototyping |
| MotionSites.ai | Motion | Site motion refs |
| Remotion | Motion | Video/promo composition |
| Logomotion.design | Motion | Logo motion |
| Animista | Motion | CSS keyframes → timing ideas |
| Swishy | Motion | Motion presets |
| Efecto.app | Motion | Effects |
| Fontshare | Typography | Free fonts (license in app) |
| Fonts in Use | Typography | Pairing in context |
| Fontjoy | Typography | Pairing generator |
| WhatFont | Typography | Identification tool |
| Font Share | Typography | Same as Fontshare |
| Khroma | Typography / Color | AI color/type |
| Realtime Colors | Color | Live palettes |
| Coolors | Color | Palette generator |
| UI Colors | Color | Semantic color UI |
| Tokens Studio | Typography / Color | Design tokens workflow |
| Branding Style Guidelines | Typography / Brand | Guideline refs |
| Logo Archive | Typography / Brand / Texture | Logo history |
| The Branding Journal | Typography / Brand | Brand case studies |
| Genpire / Brand-generator | AI tools | Brand exploration |
| Rave-zines | Texture / Archive | Zine layout, print |
| Midwest rave fliers | Texture / Archive | Poster/flier energy |
| Fine Art History Collection | Texture / Archive | Art reference |
| David Ramsey Map Collection | Texture / Archive | Maps, atlas, routes |
| Manuals | Texture / Archive | Technical manual aesthetic |
| Figma | AI tools | Mockups, handoff |
| superdesign.dev | AI tools | AI UI generation |
| designMD.ai | AI tools | Design docs |
| Rork.com | AI tools | App prototyping |
| Omma.ai | AI tools | Design AI |
| Krea.ai | AI tools | Image generation (not prod assets without rights) |
| Gamma | AI tools | Deck/landing mockups |
| Shots.so | AI tools | Mockup frames |
| UI/UX Pro Max | AI tools | UI generation |
| 10x.app | AI tools | Product/design tool |
| Genpire | AI tools | Brand gen |
| Suvee | AI tools | (Verify current product — prototyping) |
| Textlab / Javi tools | AI tools | Typography experiments |
| Clova | AI tools | (Classify when used — AI/design assist) |
| Tripo | 3D | 3D generation |
| Autosprite | 3D | Sprite/3D assets |
| Three.js | 3D | Web 3D — not core UI |
| Meshgradient | 3D / Texture | Gradient meshes → abstract panels |
| Haikei | 3D / Texture | SVG/blob backgrounds |
| Fishbowl | Typography / AI | (Verify — font/tool research) |
| Toolfolio.io | AI tools | Tool directory |
| Adfolio.design | Art direction | Ad/design refs |
| Aktif265 | Typography | (Verify — type foundry/resource) |
| Open Design | Typography / Brand | Open design resources |
| LVMH Inside | Brand | Luxury brand craft (inspiration only) |
| Mayda.co | Art direction | Studio/site ref |
| Unsplash | Art direction | **Not for in-app production images** without license |
| Fish bowl | — | See Fishbowl |
| taste skill | AI tools | Cursor skill — taste evaluation |
| impeccable design | Art direction | Quality reference |
| Reanimated | Motion | Already listed |
| design arena | Art direction | Design Arena |
| realtime colors | Color | Realtime Colors |

---

### 1. Mobile UI / App Flow Research

**Sources:** Mobbin, Screenlane, Refero, Dribbble (mobile), Behance (app cases), Savee, Cosmos, Are.na, Collected.li, Milanote, Maze, Seesaw, Design Arena (app comparisons)

**Purpose:**

- Onboarding flow and first-run hierarchy
- Home / HQ screen composition (not dashboard clones)
- Quest board / list / task UX
- Progress visualization and empty states
- Bottom navigation and tab patterns
- Settings/profile grouping

**Questory screens:** HQ, Quest Board, Onboarding, Profile, Add Quest sheet

**Extract:** Information hierarchy, tap targets, scroll behavior, section rhythm — not exact pixels.

---

### 2. Art Direction / Web Inspiration

**Sources:** Awwwards, Godly.website, Site of Sites, Unmatched Style, Design Spells, Before.click, The Brand Identity, Pentagram, Eye on Design, Colossal, Magazine B, The Drum, BX Museum, Amo.co, Oddlymade, Warhol Webflow, Emil Kowalski, Impeccable Design, Adfolio.design, Mayda.co, Design Arena

**Purpose:**

- Hero composition and poster feeling
- Typography contrast (display vs utility)
- Texture, grain, editorial layout
- Premium brand atmosphere
- Play Store / marketing frame tone

**Questory screens:** Onboarding, HQ hero, Story, chapter intro/complete, marketing

**Extract:** Layout courage, type scale, negative space — translate to 390–430px mobile.

---

### 3. Component / UI Block Inspiration

**Sources:** v0.dev, shadcn/ui, 21st.dev, Cult UI, Skipper UI, Watermelon UI, Componentry, Uiverse, React Bits, Hyperframes, Layers.to, Skill.ui, Awesome-designs.md, Cursor Directory, Footer Design, CTA Gallery

**Important:** Most are **web / Tailwind / React DOM**. Do not paste into React Native.

**Purpose:**

- Card, button, tab, loader, nav patterns
- Hero modules and bento blocks
- Status pills, progress modules

**Questory translation:**

- Rebuild with `View`, `Text`, `Pressable`, `QuestoryCard` patterns
- Map spacing to `GameLayout` and `QuestoryTheme`
- Use Reanimated for hover/press analogs

---

### 4. Motion / Animation / Interaction

**Sources:** Reanimated, Skia, LottieFiles, Jitter, SVGator, Typeface Animator, Framer Motion, Framer, MotionSites.ai, Remotion, Logomotion.design, Animista, Swishy, Efecto.app

**Purpose:**

- Chapter complete stamp reveal
- Bounty cleared confirmation
- NeuroNet scan / signal lock
- Reward reveal, mascot transmission entrance
- CTA press feedback
- Play Store promo video (Remotion — out of app)

**Questory constraint:** Motion must not delay task completion. Spec in Design DNA first; implement in focused passes.

---

### 5. Typography / Brand / Color System

**Sources:** Fontshare, Fonts in Use, Fontjoy, WhatFont, Khroma, Realtime Colors, Coolors, UI Colors, Tokens Studio, Branding Style Guidelines, Logo Archive, The Branding Journal, The Brand Identity, Open Design, Aktif265

**Purpose:**

- Display + UI font pairing (Questory: Playfair + Barlow today)
- Monospaced metadata styling
- Dust & Iron stamp typography
- NeuroNet protocol typography
- Global token system alignment with Figma/Tokens Studio workflow

**Production note:** Only ship fonts/assets with clear licenses (Expo Google Fonts, Fontshare license terms).

---

### 6. Texture / Poster / Archive References

**Sources:** Rave-zines, Midwest rave fliers, Fine Art History Collection, David Ramsey Map Collection, Manuals, Logo Archive, Warhol, BX Museum, Meshgradient, Haikei

**Purpose:**

- Riso pulp, ink stamp, halftone simulation
- Blueprint / map / atlas routes (Story, NeuroNet grid)
- Field report / manual aesthetic (Dust & Iron)
- Poster layouts for chapter drops

**Implementation:** RN-safe shapes, local bundled textures only — no scraped archive images in prod.

---

### 7. AI / Generation / Prototyping Tools

**Sources:** Figma, Framer, Rork, superdesign.dev, designMD.ai, Genpire, Omma, Krea.ai, Gamma, Shots.so, Brand-generator, UI/UX Pro Max, 10x.app, Suvee, Textlab/Javi tools, Clova, Milanote, Notion, Toolfolio.io

**Purpose:**

- Rapid mockups and variants (feeds HQ/Style Lab — not prod)
- Landing / store screenshot compositions
- Brand exploration decks
- Documenting decisions in this reference board

**Rule:** Generated assets need **rights clarity** before any production use.

---

### 8. 3D / Spatial / Experimental

**Sources:** Three.js, Tripo, Autosprite, Meshgradient, Haikei, Skia (shared with Motion)

**Purpose:**

- Future reward objects, 3D mascots, abstract universe panels
- Background meshes for hero fallbacks
- **Not core daily UI** until proven worth dependency/complexity cost

---

## C. Questory usage map

| Screen | Primary reference categories | Style Lab / DNA anchors | Intensity |
|--------|------------------------------|-------------------------|-----------|
| **HQ** | Mobile UI flow, Micrographic, Mythic Atlas, Component (translated) | Editorial, Micrographic variants | Medium — daily driver |
| **Quest Board** | Mobile UI flow, Component, Riso/Sketchbook (D&I), Techwear (NeuroNet) | Riso Pulp, Techwear | Medium |
| **Story / Map** | David Ramsey maps, Blueprint, Mythic Atlas, Network routing | Blueprint, Mythic Atlas | Medium–high visual |
| **Onboarding** | Awwwards/Godly/Brand Identity, Brutalist impact, Riso poster | Brutalist, Riso, Mythic | High first impression |
| **Chapter Complete** | Riso poster, Motion (Lottie/Reanimated), stamp refs | Riso Pulp + motion category | High moment |
| **Profile** | Mobile settings patterns, Micrographic/Bento | Micrographic | Low intensity |
| **Inventory / Rewards** | Pixel grid, collectible UI, embossed refs, Component | Pixel Grid, Factory Pomo | Medium |

**Universe split:**

- **Dust & Iron:** Texture/Archive, Riso, Midwest fliers, Manuals, warm brand refs
- **NeuroNet:** Techwear, Blueprint nodes, Motion signal refs, cool type/color systems

---

## D. Reference intake template

Copy-paste for each new reference entry in this doc or Notion/Milanote:

```markdown
### Reference: [Name]

**URL / screenshot:** [link or path to saved screenshot in repo/docs/references/]
**Category:** [Mobile UI | Art Direction | Component | Motion | Typography | Texture | AI | 3D]
**Style tags:** [e.g. riso, bento, swiss, protocol, stamp, editorial]

**What we like:**
- 

**What we do NOT want:**
- 

**Questory screen:** [HQ | Quest Board | Story | Onboarding | Chapter Complete | Profile | Rewards]
**Questory universe:** [Global | Dust & Iron | NeuroNet | Marketing only]

**Implementation translation:**
- React Native equivalent: [View layout / Reanimated / Skia / Lottie / local asset]
- Assets needed: [new art | none | abstract shapes only]
- Motion needed: [yes/no — describe]

**Risk:** [readability | legal | too web | too loud | dashboard drift]
**Decision:** [ ] Use  [ ] Avoid  [ ] Maybe  [ ] Universe-only  [ ] Marketing-only
**Approved by:** [name/date]
```

---

## E. Reference evaluation checklist

Before approving a reference for a production redesign prompt:

- [ ] Does this help Questory **avoid the old dark dashboard** look?
- [ ] Is it **mobile-first** (or clearly adaptable to 390–430px)?
- [ ] Can it be **translated to React Native** without unsafe deps?
- [ ] Does it require **assets we do not have**? If yes, plan local/abstract fallback.
- [ ] Is it **legal to use** as inspiration only? (See usage policy.)
- [ ] Is it **global DNA** or **universe skin**?
- [ ] Is it **daily UI** or **high-impact moment only**?
- [ ] Does it improve **Play Store screenshot** potential?
- [ ] Does it preserve **readability** and accessibility?
- [ ] Is it documented in this board with the intake template?
- [ ] Does it align with [`questory-design-dna.md`](./questory-design-dna.md)?

---

## Workflow summary

1. **Collect** — Save screenshot/link; log intake template
2. **Classify** — Assign category + Questory screen + global vs skin
3. **Evaluate** — Checklist + usage policy
4. **Experiment** — HQ Design Lab / Radical Style Lab (dev only)
5. **Specify** — Update Design DNA or screen-specific spec
6. **Implement** — Reference-driven Cursor prompt ([template](./cursor-prompts/reference-driven-ui-redesign.md))
7. **Validate** — [`ui-visual-qa.md`](./ui-visual-qa.md) reference-backed checklist

---

*Add approved references below as they are collected.*

## Approved references log

<!-- Add entries using the intake template. Example:

### Reference: [Mobbin — habit app home with hero card]
...
-->

*No entries yet — start with [`questory-reference-shortlist.md`](./questory-reference-shortlist.md).*
