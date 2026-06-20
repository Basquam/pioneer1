# Questory Radical Style Lab

Dev-only visual exploration for experimental mobile UI directions. **Not connected to production screens or GameContext.**

**Route:** `/design-lab/style` (requires `SHOW_INTERNAL_TOOLS` / dev build)

**Also:** Profile → Dev Tools → **OPEN RADICAL STYLE LAB**

---

## Purpose

Previous UI passes produced dark panels, serif titles, thin borders, and mild glows — still too close to a basic dashboard. This lab explores **radical** directions to discover a stronger Questory visual identity.

Some variants are intentionally too much. That is acceptable.

**Final product guidance:** Combine **70–75% global system** from one variant with **25–30% universe skin** from others. See also [`questory-design-dna.md`](./questory-design-dna.md).

---

## How to use the lab

1. Open `/design-lab/style`
2. Use **VIEW: Single** to focus one direction, or **Compare All** to scroll all 10 prototypes
3. Screenshot at **390–430px** mobile width
4. Read each variant’s **Design DNA** notes (strongest use, risk, Questory use)
5. Record judgments in [`ui-visual-qa.md`](./ui-visual-qa.md) Style Lab checklist

---

## Variants

| # | ID | Name | Style influences |
|---|-----|------|------------------|
| 1 | `riso-pulp` | Riso Pulp Quest Poster | Riso poster, halftone, acid western, ink stamp, two-color print |
| 2 | `blueprint` | Blueprint Mission Board | Blueprint grid, floating nodes, swiss/micrographic, infographic |
| 3 | `brutalist` | Brutalist Billboard Quest UI | Brutalism, deconstructed type, stickers, maximalism |
| 4 | `sketchbook` | Sketchbook Collage RPG Journal | Collage, scrapbook, hand-drawn, analog |
| 5 | `techwear` | Techwear Signal Console | Techwear, signalwave, heatmap, tech-noir, monospaced |
| 6 | `neo-psychedelic` | Neo Psychedelic Story Engine | Neo psychedelic, liquid shapes, surrealism, cyberdelia |
| 7 | `pixel-grid` | Pixel Grid Relic UI | Pixelscape, retro grid, VHS/y2k nod |
| 8 | `mythic-atlas` | Mythic Editorial Atlas | Editorial atlas, magic realism, collectible narrative |
| 9 | `micrographic` | Micrographic Mission System | Neue grafik, swiss grid, dense metadata, negative space |
| 10 | `factory-pomo` | Factory Pomo Operations Board | Industrial labels, factory pomo, embossed console |

---

## Per-variant assessment

### 1 — Riso Pulp Quest Poster
- **Good for:** Dust & Iron chapter drops, bounty posters, event screens
- **Risk:** Zine/underground feel vs premium app
- **Questory use:** Universe skin hero + stamp CTAs

### 2 — Blueprint Mission Board
- **Good for:** Story map, saga planning, mission diagrams
- **Risk:** Wireframe/dev-tool reading
- **Questory use:** Global structure for progress/node screens

### 3 — Brutalist Billboard Quest UI
- **Good for:** Onboarding impact, chapter intros, marketing
- **Risk:** Too loud for daily utility
- **Questory use:** Chapter beats, sticker quest states

### 4 — Sketchbook Collage RPG Journal
- **Good for:** Personal quests, mascot moments, reflection
- **Risk:** Crafty/juvenile if overdone
- **Questory use:** Mascot transmission + user quest surfaces

### 5 — Techwear Signal Console
- **Good for:** NeuroNet HQ, threat/protocol screens
- **Risk:** Generic tactical cyber
- **Questory use:** NeuroNet universe skin (25–30%)

### 6 — Neo Psychedelic Story Engine
- **Good for:** Chapter transitions, surreal beats, rewards
- **Risk:** Unreadable chaos; not for settings
- **Questory use:** Cinematic moments only

### 7 — Pixel Grid Relic UI
- **Good for:** Inventory, rewards, achievement grids
- **Risk:** Retro game clone; accessibility
- **Questory use:** Reward modules; optional accent

### 8 — Mythic Editorial Atlas
- **Good for:** Story screen, saga dossier, warm editorial HQ
- **Risk:** Generic fantasy book app
- **Questory use:** Global story/atlas + narrative tone

### 9 — Micrographic Mission System
- **Good for:** Global Questory system, metadata HUD
- **Risk:** Sterile museum poster; tiny text
- **Questory use:** Strong **global DNA** candidate

### 10 — Factory Pomo Operations Board
- **Good for:** Industrial/future universes, ops screens
- **Risk:** Enterprise dashboard dullness
- **Questory use:** Future universe skin or ops sub-screens

---

## How to judge variants

Ask for each prototype:

1. Is it **memorable** in a screenshot?
2. Does it **avoid the old dark dashboard** look?
3. Could it support **multi-universe skins** (global + dialect)?
4. Does it have **Play Store screenshot** potential?
5. Could it become **global DNA** (70–75%) or **universe skin only** (25–30%)?
6. Which **motifs to borrow** vs **avoid**?

Do **not** promote any variant to production until it clearly beats current HQ in Compare All mode.

The chosen direction may combine **Editorial/Micrographic structure** + **Pulp/NeuroNet skin details**.

---

## Assets

Static sample data in `src/lib/design-lab/style-lab-sample-data.ts`.

Local bundled images used where safe:
- Dust & Iron chapter: `02-burnt-warehouse`
- NeuroNet chapter: `ghost-protocol/02-blackline-drop`
- Sasha / Marcus half portraits via `resolveMascotImageSource`

No external URLs. Abstract shapes (dots, grids, blobs, stickers) used for print/texture simulation.

---

## Files

| Path | Role |
|------|------|
| `src/app/design-lab/style.tsx` | Dev-only route |
| `src/components/design-lab/style-lab.tsx` | Orchestrator, Single/Compare All |
| `src/components/design-lab/style-lab-frame.tsx` | Variant frame + DNA notes |
| `src/components/design-lab/style-variant-*.tsx` | 10 prototypes |
| `src/lib/design-lab/style-lab-sample-data.ts` | Static data + variant metadata |

Production HQ, Quest Board, Story, Profile, and onboarding are **not modified** by this lab.

---

## How external references should influence the Style Lab

The Style Lab is for **radical exploration**, not random variant generation. New variants should be driven by **approved references**, not abstract style words alone.

### Rules

1. **Add references first** — Log sources in [`questory-reference-board.md`](./questory-reference-board.md) using the intake template before creating new Style Lab variants.
2. **Do not generate endless random variants** — Each new prototype must justify its existence with named research.
3. **Follow usage policy** — [`questory-source-usage-policy.md`](./questory-source-usage-policy.md) (inspiration only; no pixel copy; no prod assets from galleries).

### Required metadata for each new Style Lab variant

When adding variant `N+1`, document in `style-lab-sample-data.ts` (or reference board log):

| Field | Example |
|-------|---------|
| **Reference source category** | Texture / Archive, Mobile UI, Motion |
| **Style tags** | riso, halftone, stamp, blueprint |
| **Questory screen target** | HQ, Story, Chapter Complete |
| **Role** | Global system OR universe skin OR marketing-only |
| **Risks** | Too western, unreadable, dashboard drift |
| **Named references** | Link to intake entries (e.g. "Midwest flier #3", "Mobbin ref #1") |

### Workflow

```
Collect ref (shortlist) → Log in reference board → Evaluate checklist
    → Prototype in Style Lab (dev) → Compare All screenshot review
    → Update Design DNA if promoted → Production prompt with cursor template
```

Existing 10 variants were exploratory anchors. **Future variants** should cite which of the [first 20 references](./questory-reference-shortlist.md) they implement or react against.

See also: [`cursor-prompts/reference-driven-ui-redesign.md`](./cursor-prompts/reference-driven-ui-redesign.md)
