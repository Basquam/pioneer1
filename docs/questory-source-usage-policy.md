# Questory Source Usage Policy

**Purpose:** Practical rules for using external design sources when researching or implementing Questory UI.  
**Related:** [`questory-reference-board.md`](./questory-reference-board.md) · [`questory-design-dna.md`](./questory-design-dna.md)

---

## Allowed

| Practice | Detail |
|----------|--------|
| **Public inspiration** | Browse Mobbin, Dribbble, Awwwards, Behance, galleries for ideas |
| **Extract principles** | Layout, spacing, hierarchy, motion timing, texture *feeling*, typographic contrast |
| **Open-source components** | Use only when license explicitly permits (MIT, Apache, etc.) and code is adapted for RN |
| **Generated assets** | Only when usage rights are clear (own generation, licensed export, commissioned work) |
| **Internal moodboards** | Screenshots stored in docs/design research — not shipped in app bundle |
| **Translate web → RN** | Reimplement patterns with `View`, `Text`, `Pressable`, Reanimated, Skia |
| **Document before build** | Log references in reference board with intake template |
| **Dev labs** | HQ Design Lab / Radical Style Lab for static prototypes |
| **Fontshare / licensed fonts** | Ship only with verified license via Expo/Google Fonts or documented Fontshare terms |
| **Lottie** | Use LottieFiles assets with appropriate license (free/commercial as required) |

---

## Not allowed / avoid

| Practice | Why |
|----------|-----|
| **Copy proprietary screens** | Mobbin/Dribbble/Awwwards layouts are someone else's work |
| **External images in production** | No hotlinked Unsplash, scraped gallery, or reference-site assets in `assets/` |
| **Copy studio brand identities** | Pentagram, Amo, etc. — inspiration for craft, not logo/type/color theft |
| **Paid UI kits without license** | shadcn is MIT; many Dribbble kits are not |
| **Unknown code snippets** | No paste from v0/21st/Cursor without license review |
| **Assume Tailwind → RN** | shadcn, Cult UI, Watermelon UI do not run in React Native as-is |
| **Unlicensed fonts** | WhatFont discovery ≠ right to ship |
| **Scrape websites** | No automated harvesting of reference sites |
| **Copy competitor apps** | Mobile refs inform UX patterns, not clone UI |
| **Marketing mockups as prod** | Gamma/Shots/Krea outputs stay in store materials unless asset rights confirmed |

---

## Implementation notes

### React Native translation

1. **Layout** — Flexbox first; no CSS grid. Use explicit widths for bento at 390px.
2. **Typography** — `QuestoryTypography` + `GameFonts`; do not add random web fonts without token update.
3. **Color** — Map Coolors/Khroma explorations to `questory-theme.ts` / `universe-skins.ts`.
4. **Motion** — Prefer `react-native-reanimated` (already in stack). Skia for custom draws. Lottie for authored loops.
5. **Components** — v0/shadcn output is a **sketch**; rewrite as `QuestoryCard`, screen-specific RPG components.
6. **Images** — Production uses **local bundled** narrative + mascot assets only unless new art is commissioned.

### Process requirements

1. Reference must appear in [`questory-reference-board.md`](./questory-reference-board.md) with decision field.
2. Production redesign Cursor prompts must **cite approved references** (see [`cursor-prompts/reference-driven-ui-redesign.md`](./cursor-prompts/reference-driven-ui-redesign.md)).
3. Changes must pass [`ui-visual-qa.md`](./ui-visual-qa.md) including reference-backed validation.
4. When in doubt, treat reference as **inspiration only** and document what was extracted.

### Legal posture (non-legal advice)

This project is not legal counsel. When shipping:

- Prefer **your own** art, licensed stock, or openly licensed resources
- Keep **screenshots** in docs/repo for internal research
- Do **not** ship third-party UI pixel copies
- Review **Lottie**, **font**, and **AI-generated** asset terms before release

---

## Quick decision tree

```
Is this a screenshot from someone else's app/site?
├── YES → Inspiration only. Extract principles. Log in reference board.
└── NO → Is it code from the internet?
    ├── YES → Check license. If not OSS-compatible → do not ship.
    └── NO → Is it an asset (font/image/Lottie)?
        ├── YES → Verify license → add to assets with attribution if required.
        └── NO → Proceed with Design DNA + QA checklist.
```

---

## Roles

| Artifact | Owner action |
|----------|--------------|
| New reference found | Add intake template to reference board |
| Style Lab variant | Note reference category + tags |
| Production redesign | Cite references in prompt; no unlisted influences |
| Store/marketing | Shots.so/Gamma/Remotion OK for external promo with rights check |

---

*Policy version 1.0 — documentation only; no production code changes.*
