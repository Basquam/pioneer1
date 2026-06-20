# Questory Design DNA Spec

**Version:** 1.0  
**Status:** Official design strategy — implementation reference for all future UI passes  
**Target platform:** Mobile-first React Native (Expo SDK 56), 390–430px viewport  
**Scope:** Visual identity, universe skins, component rules, layout rules, anti-patterns, implementation order

**Reference research:** [`questory-reference-board.md`](./questory-reference-board.md) · [`questory-source-usage-policy.md`](./questory-source-usage-policy.md) · [`questory-reference-shortlist.md`](./questory-reference-shortlist.md)

---

## Executive summary

Questory is a **story-driven productivity / anti-procrastination mobile app** disguised as a premium narrative mission system. It should feel like opening a **Story Console** — a cinematic chapter dashboard and mobile RPG companion — not a dark admin dashboard with RPG labels pasted on top.

**Core ratio:**

| Layer | Share | What it controls |
|-------|-------|------------------|
| **Global Questory DNA** | 70–75% | Layout, hierarchy, typography system, navigation, card grammar, motion language, density |
| **Universe skin** | 25–30% | Atmosphere, surface treatment, labels, motifs, accent colors, texture, hero art direction |

The UX and information architecture stay recognizable across universes. The **atmosphere shifts**; the **product grammar does not**.

**Code anchors (existing, do not reinvent):**

- Global tokens: `src/theme/questory-theme.ts`
- Universe skins: `src/theme/universe-skins.ts`
- Typography: `src/theme/typography.ts` (`QuestoryTypography`, `GameFonts`)
- Layout constants: `src/constants/layout.ts` (`GameLayout`)
- Shared UI: `src/components/ui/*`
- Screen-specific RPG components: `src/components/rpg/*`

---

## 1. Global Questory DNA

### 1.1 Product identity

Questory is a **premium mobile story console** — a narrative mission system where productivity quests live inside a world-switching story engine.

**Style influences (translated for mobile):**

| Influence | Mobile UI translation |
|-----------|----------------------|
| Experimental editorial | Asymmetric hero blocks, strong section breaks, one dominant visual per screen |
| Swiss / Neue Grafik | Grid discipline, clear alignment, restrained ornament, typographic hierarchy |
| Bento / bento box | Modular sections with distinct visual weight — not identical stacked panels |
| Monospaced | Metadata, stats, status codes, timestamps — never body copy |
| Infographic | Progress as narrative readout, not raw numbers alone |
| Embossed / debossed | Tactile CTAs, stamp badges, inset surfaces — subtle depth, not flat boxes |
| Floating node | Mascot portraits, threat meters, reward badges as anchored objects |
| Architectural split | Hero vs. body vs. action zones with clear horizontal/vertical breaks |
| Controlled deconstructed typography | Display titles may break lines dramatically; labels stay tight and readable |

### 1.2 Global visual traits

- **Dark premium base** — `#050308` deep background, elevated panels at `rgba(16–22, 12–16, 20–28, 0.94–0.96)`
- **Large hero surfaces** — every major screen has one dominant visual anchor (poster, dossier, route map)
- **Clear story hierarchy** — chapter > saga > universe > player meta, never inverted
- **Strong mobile-first composition** — design for 390–430px width; desktop web is not the target
- **Fewer but stronger cards** — 3–5 meaningful modules per viewport, not 8 thin strips
- **Bento-like modular sections** — varied card sizes and weights within a grid
- **Editorial section titles** — eyebrow + title pairs (`QuestorySectionHeader`, `SectionLabel`)
- **Tactile mission cards** — filled surfaces, accent rails, not 1px bordered rectangles
- **Readable monospaced metadata** — stats, codes, timestamps in UI/mono at 10–12px
- **Progress as narrative** — "3 bounties cleared · 2 left" not just `60%`
- **Mascot messages as in-world transmissions** — directive rail, portrait, filled surface
- **Strong bottom navigation identity** — raised bar, active pill, universe accent
- **Premium screenshots** — every tab should be screenshot-ready at mobile width

### 1.3 Layout principles

1. **One hero, one scroll** — Hero or primary mission block appears within the first 40% of viewport height.
2. **Compact top identity** — Universe/saga/chapter/player meta in a thin bar, not a full-screen header frame.
3. **Vertical rhythm** — Use `GameLayout.screenContentGap` (14px) between modules; 20–24px before major section breaks.
4. **Horizontal padding** — `GameLayout.screenPaddingHorizontal` (20px); hero may bleed edge-to-edge inside padded scroll.
5. **Bento weighting** — Largest card = current mission; medium = progress/threat; small = metadata tiles.
6. **Bottom safe zone** — Tab screens must respect `useTabBarScrollInset()`; CTAs never hidden under nav.
7. **No five-in-a-row** — Never stack five same-width bordered panels vertically without visual differentiation.

### 1.4 Information hierarchy

| Priority | Content | Treatment |
|----------|---------|-----------|
| P0 | Current chapter / active mission | Hero poster, 24–28px display title, primary CTA |
| P1 | What to do next | Guide transmission, UP NEXT quest, primary action tile |
| P2 | Progress state | Bounty count, threat level, chapter trail position |
| P3 | Context | Universe, saga, level, reputation |
| P4 | Utility | Settings, notifications, dev tools |

### 1.5 Typography rules

**Font roles** (from `GameFonts`):

| Role | Font | Usage |
|------|------|-------|
| Display | Playfair Display | Chapter titles, cinematic moments, hero headlines |
| UI | Barlow Condensed | Section titles, labels, CTAs, stats |
| UI Semi | Barlow Condensed SemiBold | Body copy, quest descriptions |
| Flavor | Playfair Display Italic | In-world quotes, chapter summaries |

**Rules:**

- **Display** — max 3 lines in heroes; 24–28px on mobile
- **Section eyebrow** — `QuestoryTypography.sectionEyebrow`: 10px, letter-spacing 3, uppercase sparingly (1 per section max)
- **Body** — 13px minimum for readable copy; 11px only for secondary/meta
- **Monospaced metadata** — level, rep, threat %, protocol codes: UI font with increased letter-spacing, never smaller than 10px
- **Do not** use western/cyber decorative fonts anywhere

### 1.6 Card rules

**Global card grammar:**

- **Filled surfaces** over outlined boxes — background color + soft shadow, border optional and subtle
- **Accent rail or strip** — left rail (4px D&I, 2px NeuroNet) or top highlight on elevated cards
- **One accent per card** — primary accent OR danger OR success, not all three
- **Radius** — 14–16px for mission cards; 8–12px for compact tiles; 4px for stamps/badges
- **Skew** — D&I only: `-2deg` on dossier cards; NeuroNet: no skew
- **Glow** — universe `glowColor` at ≤22% opacity; only on primary/hero elements

**Card variants** (`QuestoryCardVariant`):

| Variant | Use |
|---------|-----|
| `default` | General content |
| `elevated` | Primary mission, active chapter |
| `dossier` | D&I mission files, bounty slips |
| `terminal` | NeuroNet protocol packets |
| `danger` | High threat, breach risk |
| `success` | Cleared, reclaimed, completed |

### 1.7 CTA rules

- **One primary CTA per screen zone** — filled button with universe accent background
- **Primary label** — action verb: "Go to Quest Board", "Continue Story", "Claim Reward"
- **Secondary hint** — 10px caption below primary label inside the button
- **Minimum tap target** — 44px height, 16px horizontal padding minimum
- **GlowButton** — onboarding and chapter moments only; HQ/Quest Board use filled `Pressable` CTAs
- **Disabled state** — reduce opacity to 0.5; do not remove the button

### 1.8 Navigation rules

- **GameTabBar** — raised dark bar, active tab gets universe accent pill + icon emphasis
- **QuestBoardTabBar** — chapter vs. custom quest filter; must feel like board sections, not generic tabs
- **No hamburger-first** — primary destinations always in bottom nav
- **Back affordance** — chapter intro/complete use clear continue/tap targets, not invisible gestures

### 1.9 Progress visualization rules

- **QuestoryProgressBar** — narrative label + meta line; bar fill uses universe accent
- **Threat/villain** — compact card with large stat number + meter; red only above threshold (65%)
- **Chapter trail** — node/route metaphor on Story screen; locked/active/completed states visually distinct
- **Never** show raw percentage alone without narrative context

### 1.10 Mascot transmission rules

Mascots (Sasha, Marcus) deliver **in-world directives**, not tooltip cards.

- **Large portrait** — 88×112px minimum in HQ/guide moments; half-body assets from `resolveMascotImageSource`
- **Directive label** — `SASHA DIRECTIVE` / `MARCUS NOTE` in accent eyebrow
- **Filled gradient surface** — dark base + universe accent rail (4px left)
- **Action button** — only when `actionLabel` exists in guide copy; preserves analytics (`trackMascotTipSeen`)
- **Preference respect** — off/sasha/marcus/minimal modes unchanged
- **Never** paste a small mascot thumbnail on a generic bordered card

### 1.11 Motion principles (spec only — not implemented here)

See Section 7.

### 1.12 Density and spacing

| Context | Density |
|---------|---------|
| HQ hero zone | Spacious — 16px internal padding, 220px+ poster height |
| Compact stats row | Tight — 14px padding, side-by-side on ≥360px |
| Action grid | Medium — 88px min tile height, 10px gap |
| Quest list | Medium-dense — quest cards stack with 10–12px gap |
| Profile/settings | Calm — grouped sections, 16–20px between groups |

---

## 2. Global anti-patterns

**Do not build these. If a screen looks like this, the pass failed.**

| Anti-pattern | Why it fails |
|--------------|--------------|
| Old stacked-card dashboard | Reads as admin UI, not story console |
| Five similar bordered panels in a row | No hierarchy, no hero, no bento weight |
| Huge empty black rectangles | Wasted viewport, feels unfinished |
| Too many thin 1px borders | Debug/terminal aesthetic |
| Tiny uppercase labels everywhere | Visual noise, no editorial rhythm |
| Weak hero section | First impression fails; app looks generic |
| Technical terminal look outside NeuroNet | Breaks D&I warmth; confuses product identity |
| Generic dark admin UI | Could be any productivity app |
| Random glows with no hierarchy | Cheap "vibe-coded" feel |
| All cards same size and weight | No bento, no story focus |
| Mascot card pasted-on | Breaks immersion |
| Quest cards like normal to-do items | Breaks RPG/productivity fusion |
| Story screen like settings page | Flat list ≠ campaign progression |
| Full western UI everywhere | Novelty, not premium |
| Full cyberpunk UI everywhere | Cold, unreadable, generic |
| Wrapping old layout in QuestoryCard | Layout unchanged = pass failed |
| Adding borders/glows only | Polish pass ≠ redesign |
| Desktop-first layout | Mobile screenshots must look premium |

---

## 3. Dust & Iron universe skin

**Id:** `dust-and-iron`  
**Skin label:** Mission Dossier  
**Card variant:** `dossier`  
**Accent primary:** `#f4a261` (warm brass)  
**Accent secondary:** `#e85d04` (burnt orange)  
**Skew:** `-2deg` on dossier surfaces

### 3.1 Mood

Bounty dossier · frontier operation board · brass-stamped mission file · dusty adventure pulp poster · reclaimed territory ledger.

**Style influences:** ink stamp, acid western, adventure pulp, blueprint, newstalgia, grainy print, halftone, ink bleed, embossed/debossed, vintage adventure poster energy.

**Illustrative mood reference (not literal copy):** Norman Rockwell / J. C. Leyendecker / Dean Cornwell — warm human adventure, not cartoon cowboy.

### 3.2 Color palette direction

| Role | Direction |
|------|-----------|
| Base | Deep charcoal-brown `#1a0f0c` – `#2a1810` |
| Surface | Warm dark parchment `rgba(42, 24, 16, 0.95)` |
| Accent | Brass `#f4a261`, stamp orange `#e85d04` |
| Text primary | Bone `#f5f0e6` |
| Text secondary | Dust fog `#c8c0b8` |
| Danger | Rust red — reuse global `#e85d5d` |
| Success | Reclaimed green `#6bbf8a` |

### 3.3 Surface treatment

- Warm filled panels, not cold black
- Subtle paper grain overlay (future asset) at ≤8% opacity
- Top highlight line on dossier cards (simulated light on paper edge)
- Left accent rail 4px brass
- Optional `-2deg` skew on hero/dossier cards — never on body text containers

### 3.4 Component skin behaviors

| Component | D&I behavior |
|-----------|--------------|
| Hero card | Large poster art, gradient fade to warm body, **BOUNTY DOSSIER** badge, brass CTA on dark text |
| Chapter card | Territory node on route; **RECLAIMED** / **ACTIVE BOUNTY** stamps |
| Quest card | Bounty slip inset inside dark frame; brass left rail for chapter bounties |
| Status pill | Stamp-style: **WANTED**, **HIGH NOON**, **SHERIFF FILE** |
| Progress bar | Brass fill on dark track; label "X/Y bounties cleared" |
| Mascot frame | Warm vignette, brass rail, **SASHA DIRECTIVE** / **MARCUS NOTE** |
| Background | Subtle radial warm glow top-right; no full parchment wash |

### 3.5 Labels and motifs

`ACTIVE BOUNTY` · `RECLAIMED` · `WANTED` · `HIGH NOON` · `SHERIFF FILE` · `RAILWAY PASS` · `BOUNTY DOSSIER` · `TERRITORY STATUS`

### 3.6 D&I anti-patterns

- Childish cowboy theme (hats, saloon doors, emoji guns)
- Full parchment background on every screen
- Overuse of brown — keep 70% global dark base
- Illegible western display fonts
- Cheap saloon UI (wood textures everywhere)
- Making the whole app a novelty western game

---

## 4. NeuroNet universe skin

**Id:** `neuronet`  
**Skin label:** Neon Tactical Terminal  
**Card variant:** `terminal`  
**Accent primary:** `#22d3ee` (cyan)  
**Accent secondary:** `#d946ef` (violet)  
**Skew:** none

### 4.1 Mood

Tactical protocol interface · cyber mission packet · signal breach console · neon intelligence grid · corrupted corporate network.

**Style influences:** tech-noir, bio-punk, signalwave, ASCII, heatmap, urban void, new liquid, pixelscape, controlled cyberdelia, monospaced.

### 4.2 Color palette direction

| Role | Direction |
|------|-----------|
| Base | Deep void `#050308` – `#0a1628` |
| Surface | Cold panel `rgba(8, 14, 32, 0.95)` |
| Accent | Cyan `#22d3ee`, violet `#d946ef` |
| Text primary | Ice white `#f5f0e6` |
| Text secondary | Cool fog `#9a93a8` |
| Danger | Breach red `#e85d5d` |
| Success | Signal green `#6bbf8a` |

### 4.3 Surface treatment

- Cold filled panels with cyan/violet edge glow at low opacity
- 2px accent rail (not 4px — sharper, more protocol)
- Optional subtle scanline overlay (future asset) at ≤6% opacity
- No skew — precision grid alignment
- Monospaced metadata for protocol codes

### 4.4 Component skin behaviors

| Component | NeuroNet behavior |
|-----------|-------------------|
| Hero card | Mission packet art, gradient to void body, **OPERATION LIVE** / **PROTOCOL PACKET** badge, cyan CTA |
| Chapter card | Network node; **NODE CLEARED** / **SIGNAL LOCKED** states |
| Quest card | Protocol packet tile; cyan rail for system quests |
| Status pill | **BREACH RISK**, **GHOST TRACE**, **SYSTEM ROUTING** |
| Progress bar | Cyan fill; label "X/Y nodes cleared" |
| Mascot frame | Dark void gradient, cyan rail, directive labels |
| Background | Cyan radial glow top-right, violet undertone bottom-left |

### 4.5 Labels and motifs

`ACTIVE PROTOCOL` · `SIGNAL LOCKED` · `NODE CLEARED` · `BREACH RISK` · `GHOST TRACE` · `SYSTEM ROUTING` · `NETWORK STATUS` · `PROTOCOL PACKET`

### 4.6 NeuroNet anti-patterns

- Everything neon — accents on key elements only
- Unreadable cyan-on-cyan text
- Excessive terminal/debug look (blinking cursors, ASCII art walls)
- Too much glitch/distortion
- Generic cyberpunk dashboard (matrix rain, random hex dumps)
- Replacing story warmth with cold UI on emotional moments (chapter complete still needs reward warmth)

---

## 5. Global screen composition rules

### 5.1 HQ — Story Console (daily home)

**Role:** Strongest daily home screen. The app's screenshot hero.

**Required structure:**

```
┌─────────────────────────────┐
│ Compact identity bar        │  QUESTORY · LVL/REP · universe/saga/chapter chips
├─────────────────────────────┤
│                             │
│   MISSION HERO (dominant)   │  220px+ poster, chapter title, badge, progress, primary CTA
│                             │
├──────────────┬──────────────┤
│ Threat card  │ Bounty card  │  Compact side-by-side (stack on narrow)
├─────────────────────────────┤
│ Guide transmission          │  Large portrait, directive label, filled surface
├──────────────┬──────────────┤
│ Action tile  │ Action tile  │  2×2 grid: Quest Board (primary), Story, Add, Profile
│ Action tile  │ Action tile  │
├─────────────────────────────┤
│ UP NEXT (secondary)         │  1–2 quest cards below console
└─────────────────────────────┘
```

**Reference implementation:** `HqStoryConsole`, `HqMissionHero`, `HqCompactStatsRow`, `HqGuideTransmission`, `HqActionGrid`

**Must not:** Use old command header + horizontal threat monitor + stacked briefing panels.

### 5.2 Quest Board — Bounty / quest board

**Role:** Real quest/bounty board, not a filtered to-do list.

**Required structure:**

- Strong board header with chapter context
- `QuestBoardTabBar` — chapter bounties vs. user quests (visually distinct sections)
- Quest cards with clear bounty vs. personal distinction
- Completed / active / new state hierarchy
- Category/status pills (`QuestoryStatusPill`, `QuestoryMissionPill`)
- Universe-specific quest card surfaces (dossier slip vs. protocol packet)

**Must not:** Flat checklist rows, identical cards for all quest types.

### 5.3 Story — Campaign progression

**Role:** Saga dossier and chapter route/map.

**Required structure:**

- Campaign dossier header (saga title, progress summary)
- Chapter route/trail with node metaphor
- Active mission emphasis (scale, glow, badge)
- Locked / completed / reclaimed / protocol states clearly differentiated
- Reward and unlock visual hierarchy

**Must not:** Settings-style flat list, equal-weight chapter rows.

### 5.4 Onboarding — Entering the mission system

**Role:** Strong first impression; entering a world, not signing up for an app.

**Required structure:**

- Welcome hero with cinematic title
- Mascot as guide (transmission framing, not decoration)
- Universe/world cards as portals/dossiers (`ThemeCard`)
- Minimal steps, maximum visual impact per step
- `GlowButton` for primary continue actions

**Must not:** Form-wizard layout, tiny mascot in corner, generic dark cards.

### 5.5 Profile / Settings — Calm utility

**Role:** Progress and preferences without visual competition with HQ/Story.

**Required structure:**

- Compact grouped panels
- Privacy/notification/analytics explanations in readable body copy
- Less visual intensity — no hero poster, no threat monitors
- Universe accent as subtle rail only

**Must not:** Developer settings page aesthetic, raw toggle lists without context.

### 5.6 Chapter Intro — Cinematic story beat

**Required structure:**

- Title hierarchy (eyebrow → chapter title → summary)
- Dialogue framing with universe skin
- Clear tap/continue affordance
- Mascot optional, not dominant over chapter content

### 5.7 Chapter Complete — Reward moment

**Required structure:**

- Strong cleared/completed stamp (universe-specific: **RECLAIMED** / **NODE CLEARED**)
- Reward reveal (XP, reputation)
- Summary readout
- CTA to continue story or return to HQ
- Sound/analytics behavior unchanged — visual only

---

## 6. Component mapping

For each component: **role**, **global feel**, **D&I skin**, **NeuroNet skin**, **what not to do**.

### QuestoryScreen
| | |
|---|---|
| **Role** | Root screen shell with cinematic background, safe area, optional atmosphere |
| **Global** | Dark deep base, universe radial glow, vignette |
| **D&I** | Warm top-right glow |
| **NeuroNet** | Cyan top-right, violet bottom undertone |
| **Avoid** | Plain `#000` background, no atmosphere on main tabs |

### QuestoryCard
| | |
|---|---|
| **Role** | Universal filled surface wrapper with accent strip and optional glow |
| **Global** | Filled surface, soft shadow, one accent rail |
| **D&I** | `dossier` variant, -2deg skew, 4px brass rail, warm surface |
| **NeuroNet** | `terminal` variant, no skew, 2px cyan rail, cold surface |
| **Avoid** | Thin 1px box with no fill; wrapping old layout without changing composition |

### QuestorySectionHeader
| | |
|---|---|
| **Role** | Editorial section break — eyebrow + title |
| **Global** | Eyebrow 10px spaced caps, title 16px UI |
| **D&I** | Brass eyebrow |
| **NeuroNet** | Cyan eyebrow |
| **Avoid** | Orphan uppercase labels on every child element |

### QuestoryProgressBar
| | |
|---|---|
| **Role** | Narrative progress readout |
| **Global** | Label + meta + bar; universe accent fill |
| **D&I** | Brass fill, "bounties cleared" language |
| **NeuroNet** | Cyan fill, "nodes cleared" language |
| **Avoid** | Raw percentage without context |

### QuestoryStatusPill
| | |
|---|---|
| **Role** | Compact status badge on cards and list items |
| **Global** | Small filled pill, 10px caps |
| **D&I** | Stamp colors: WANTED, RECLAIMED |
| **NeuroNet** | Protocol colors: SIGNAL LOCKED, BREACH RISK |
| **Avoid** | Generic "Active" / "Done" labels |

### QuestoryMissionPill
| | |
|---|---|
| **Role** | Quest category/type indicator |
| **Global** | Distinct from status pill — category, not state |
| **D&I** | Bounty type, territory tags |
| **NeuroNet** | Protocol type, node class |
| **Avoid** | Same visual as status pill |

### GlowButton
| | |
|---|---|
| **Role** | Premium primary CTA for onboarding and cinematic moments |
| **Global** | Layered border, sheen, universe accent |
| **D&I** | Brass glow |
| **NeuroNet** | Cyan glow |
| **Avoid** | Using on every screen; overuse dilutes premium feel |

### MascotGuideCard / HqGuideTransmission
| | |
|---|---|
| **Role** | In-world mascot directive delivery |
| **Global** | Large portrait, filled gradient, accent rail, directive label |
| **D&I** | Warm frame, brass rail |
| **NeuroNet** | Void frame, cyan rail |
| **Avoid** | Small thumbnail on generic card; pasted-on tooltip look |

### GameTabBar
| | |
|---|---|
| **Role** | Primary app navigation |
| **Global** | Raised dark bar, active pill, universe accent on active tab |
| **D&I** | Brass active indicator |
| **NeuroNet** | Cyan active indicator |
| **Avoid** | Default React Navigation tab styling |

### QuestBoardTabBar
| | |
|---|---|
| **Role** | Quest board section filter (chapter vs. custom) |
| **Global** | Board section feel, not generic tabs |
| **D&I** | "Chapter Bounties" / "Personal" dossier sections |
| **NeuroNet** | "Protocol" / "Custom" packet sections |
| **Avoid** | Identical pill tabs with no board metaphor |

### QuestCard
| | |
|---|---|
| **Role** | Individual quest/bounty item |
| **Global** | Tactile mission card — filled, accent rail, status pill, clear complete/active states |
| **D&I** | Bounty slip inside premium dark frame; brass rail for template quests |
| **NeuroNet** | Protocol packet tile; cyan rail for template quests |
| **Avoid** | Plain to-do checkbox row; identical styling for bounty vs. personal |

### ChapterCard
| | |
|---|---|
| **Role** | Story trail node — locked/active/completed chapter |
| **Global** | Node on route; state drives scale and accent |
| **D&I** | Territory node, RECLAIMED stamp when complete |
| **NeuroNet** | Network node, NODE CLEARED when complete |
| **Avoid** | Flat list row equal to all chapters |

### SagaCard
| | |
|---|---|
| **Role** | Saga selection / preview in storylines |
| **Global** | Dossier preview with banner art when available |
| **D&I** | Pulp poster mini-preview |
| **NeuroNet** | Protocol packet preview |
| **Avoid** | Text-only row with no visual anchor |

### ThemeCard
| | |
|---|---|
| **Role** | Universe/world portal on onboarding |
| **Global** | Portal card — large visual, title, enter affordance |
| **D&I** | Warm dossier portal, dust glow |
| **NeuroNet** | Neon portal, signal grid hint |
| **Avoid** | Small radio-button list item |

### HQ-specific (Story Console)
| Component | Role |
|-----------|------|
| `HqStoryConsole` | HQ orchestrator — identity + hero + stats + guide + actions |
| `HqMissionHero` | Dominant poster hero with CTA |
| `HqCompactStatsRow` | Side-by-side threat + bounty cards |
| `HqGuideTransmission` | HQ mascot directive |
| `HqActionGrid` | 2×2 mobile action tiles |
| `resolveHqHeroVisual()` | Typed hero asset resolver in `src/lib/hq-visual-assets.ts` |

---

## 7. Motion and interaction DNA

**Not implemented in this spec — rules for future passes.**

### 7.1 Principles

- **Purposeful** — motion confirms story beat or state change
- **Restrained** — no animation for decoration
- **Story-linked** — motion vocabulary matches universe and mascot

### 7.2 Motion vocabulary

| Context | Motion language | Duration |
|---------|-----------------|----------|
| Sasha guide | Sharp, decisive, fast slide-in | 120ms (`QuestoryTheme.motion.fast`) |
| Marcus guide | Soft, reassuring, smooth fade-up | 250ms (`QuestoryTheme.motion.normal`) |
| D&I interactions | Stamp impact, paper slide, dust settle | 120–250ms |
| NeuroNet interactions | Scan line, route draw, signal pulse, lock | 120–250ms |
| Chapter complete | Impact stamp, reward reveal scale | 250–500ms |
| Quest complete | Short reward confirmation flash | 120ms |
| Screen transitions | Standard Expo Router — no custom slow fades | — |
| Tab switch | Selection haptic + subtle highlight | instant |

### 7.3 Motion anti-patterns

- Random bouncing elements
- Excessive spring physics
- Slow transitions (>500ms) blocking task flow
- Neon pulsing on idle elements
- Animation that delays quest completion tap

---

## 8. Asset strategy

### 8.1 Current problem

Cards and borders alone do not create premium feel. **Visual anchors** — hero art, mascot portraits, chapter scenes — must carry weight.

### 8.2 Usage rules

| Rule | Detail |
|------|--------|
| HQ hero | Meaningful mission visual required — chapter scene → saga banner → universe mood → abstract gradient |
| Chapter/world art | Large anchor (≥200px height), not tiny thumbnail |
| Mascot portraits | ≥88px width in guide/transmission moments |
| Fallback | Abstract gradient panel with universe icon — never empty black |
| No external URLs | Local bundled assets only |
| No dynamic require | Typed static maps (`hq-visual-assets.ts`, `narrative-media.ts`) |
| Asset resolution order | chapter scene → saga banner → universe mood → abstract |

### 8.3 Minimum visual asset needs before Play Store screenshots

| Asset | Status | Priority |
|-------|--------|----------|
| HQ hero panel — Dust & Iron | Use chapter/saga/mood from `narrative-media.ts`; verify at 390px | P0 |
| HQ hero panel — NeuroNet | Same resolver; verify cyan/violet overlay reads | P0 |
| Quest-created SFX | Verify in sound system | P1 |
| Notification cue SFX | Verify in sound system | P1 |
| Mascot tip SFX | Verify in sound system | P1 |
| D&I paper grain overlay (subtle) | Future asset | P2 |
| NeuroNet scanline overlay (subtle) | Future asset | P2 |
| Chapter/story promotional screenshots | Capture after Phase 1–3 complete | P2 |
| Onboarding universe portal art | Per-universe mood images | P1 |

**Do not generate new assets inside UI implementation tasks unless the task explicitly includes asset creation.**

---

## 9. Implementation strategy

**Rule:** Redesign one screen group deeply per phase. Do not lightly touch the whole app.

| Phase | Screen group | Goal | Status |
|-------|--------------|------|--------|
| **1** | HQ Story Console | Dominant hero, compact stats, guide transmission, action grid | In progress — `HqStoryConsole` wired |
| **2** | Quest Board | Bounty board metaphor, distinct quest card surfaces | Not started |
| **3** | Story / saga map | Chapter route, dossier header, state hierarchy | Not started |
| **4** | Onboarding | Portal cards, welcome hero, mascot guide | Partial — needs DNA pass |
| **5** | Profile / settings | Calm grouped panels, styled utility | Not started |
| **6** | Chapter intro / complete | Cinematic beat + reward stamp moment | Not started |

### Phase acceptance criteria (all phases)

- [ ] Screen looks obviously different from previous version at 390px
- [ ] One dominant visual anchor present
- [ ] Follows global DNA + universe skin ratio
- [ ] No old stacked dashboard layout
- [ ] Gameplay, progression, analytics, notifications, crash, audio unchanged
- [ ] `npx tsc --noEmit` passes

---

## 10. How Cursor should implement future UI prompts

**Read this section before any UI redesign task.**

### 10.1 Mandatory behavior

1. **Read this spec first** — `docs/questory-design-dna.md`
2. **Do not preserve old visual layout** if the task says redesign
3. **Do not only add borders/glows** — that is a polish pass, not a redesign
4. **Do not only wrap old panels in QuestoryCard** — replace visual composition
5. **Do not keep five identical stacked panels** — use bento weighting
6. **Create screen-specific components** when shared components force old layout
7. **Replace visual composition while preserving logic** — data, navigation, analytics hooks stay
8. **Prioritize mobile 390–430px** — take screenshots mentally at that width
9. **If visual difference is small, the task is incomplete** — iterate before reporting done

### 10.2 Task scoping

- One screen group per task (HQ, Quest Board, Story, etc.)
- Do not touch unrelated screens
- Do not change gameplay, progression, story content, analytics, notifications, crash, or audio
- Do not add dependencies
- Run `npx tsc --noEmit` after changes

### 10.3 File organization pattern

```
src/components/rpg/{screen}-{component}.tsx   — screen-specific visuals
src/components/ui/questory-*.tsx              — shared DNA components
src/lib/{screen}-visual-assets.ts           — typed asset resolvers
src/theme/questory-theme.ts                 — global tokens only
src/theme/universe-skins.ts                 — universe dialect only
```

### 10.4 Redesign vs. polish decision tree

```
Does the task say "redesign" or "from scratch"?
├── YES → Replace layout composition. New screen-specific components OK.
│         Old wrapper components may be abandoned (not deleted if used elsewhere).
└── NO  → Token/component improvements only. Do not restructure layout.
```

---

## 11. Visual QA reference

See `docs/ui-visual-qa.md` for screen-specific checklists.

**Universal DNA checklist (every screen):**

- [ ] Follows global Questory DNA (70–75%)
- [ ] Universe skin changes surface/labels/motifs without changing UX (25–30%)
- [ ] Clear visual anchor present (hero, art, or strong typographic moment)
- [ ] Mobile-first at 390–430px
- [ ] Avoids old stacked dashboard layout
- [ ] Avoids generic dark admin UI

---

## 12. Appendix — token quick reference

```typescript
// Background depth
QuestoryTheme.colors.background.deep      // #050308
QuestoryTheme.colors.background.elevated  // #12101a

// Spacing
GameLayout.screenPaddingHorizontal        // 20
GameLayout.screenContentGap               // 14

// Universe accents
getUniverseSkin('dust-and-iron').accentPrimary   // #f4a261
getUniverseSkin('neuronet').accentPrimary        // #22d3ee

// Card variants
'dossier'  → Dust & Iron
'terminal' → NeuroNet
'default'  → Global fallback
```

---

*This document is the source of truth for Questory visual identity. Implementation passes must reference it. When in doubt, prioritize mobile screenshot quality and story-console feel over architectural purity.*
