# Reference-Driven UI Redesign — Cursor Prompt Template

Copy this template into Cursor when starting a **production** UI redesign pass.  
Do not use for Style Lab / HQ Design Lab experiments (those use static fake data).

**Prerequisites:**

- [`questory-design-dna.md`](../questory-design-dna.md) read
- Approved references logged in [`questory-reference-board.md`](../questory-reference-board.md)
- [`questory-source-usage-policy.md`](../questory-source-usage-policy.md) understood

---

## Prompt template

```markdown
Implement [SCREEN NAME] redesign using approved design references.

## Context
Questory — story-driven productivity mobile app.
React Native · Expo SDK 56 · Expo Router · TypeScript · local-first · no backend.

## Screen to redesign
[HQ | Quest Board | Story | Onboarding | Chapter Complete | Profile | Rewards | other: ___]

## Approved references (cite intake entries from questory-reference-board.md)
1. [Reference name] — Category: [___] — Decision: Use / Universe-only
   - What we borrow: [layout / hero / motion / type / texture]
   - What we do NOT borrow: [___]
2. [Reference name] — ...

## Style tags
[e.g. bento, riso, blueprint, micrographic, techwear, editorial, stamp, protocol]

## Design DNA role
- Global system (70–75%): [principles from references]
- Universe skin (25–30%): [Dust & Iron | NeuroNet | N/A]
- Style Lab variant alignment (if any): [variant id from questory-style-lab.md]

## What to borrow (principles only)
- Layout:
- Typography:
- Color/surface:
- Motion (spec only if not implementing):
- Components:

## What NOT to borrow
- [e.g. thin bordered dashboard, web Tailwind markup, external images, competitor clone]

## React Native constraints
- Use View, Text, Pressable, existing theme (`questory-theme`, `universe-skins`, `QuestoryTypography`)
- Mobile-first 390–430px width
- No new dependencies unless explicitly approved
- No external image URLs in production
- Translate web patterns — do not paste shadcn/v0 DOM code
- Reanimated/Skia only if already in project scope for this task

## Production safety constraints
- Do NOT change: gameplay, progression, story content, analytics, notifications, crash, audio, navigation routes, data shapes
- Do NOT modify unrelated screens
- Preserve all existing actions, analytics hooks, and state wiring
- Run `npx tsc --noEmit` after changes

## Visual anti-patterns (must avoid)
- Old stacked dark dashboard
- Five identical bordered panels
- Generic premium dark admin UI
- Wrapping old layout in QuestoryCard without recomposing
- Borders/glows-only polish pass

## Completion criteria
- [ ] Screen looks obviously different from previous version at 390px
- [ ] One dominant visual anchor (hero/poster/map/type moment)
- [ ] References cited above are visible in principles (not pixel copy)
- [ ] Follows questory-design-dna.md global/skin ratio
- [ ] ui-visual-qa.md checklists pass for this screen
- [ ] reference-backed UI validation checklist pass
- [ ] TypeScript clean

## Deliverables
- List files created/modified
- Which references influenced which decisions
- What was intentionally not touched
- TypeScript result
```

---

## Example (HQ — filled partially)

```markdown
Implement HQ golden screen redesign using approved design references.

Screen to redesign: HQ

Approved references:
1. Mobbin — [App X home hero-first] — Mobile UI — Use
   - Borrow: hero-first hierarchy, compact metadata strip
   - Do NOT: their exact colors or card stack
2. Micrographic Style Lab variant — Component — Use (global structure)
   - Borrow: infographic progress strip, underline CTA
   - Do NOT: full sterility; add world flavor via D&I skin

Style tags: bento, micrographic, story-console, editorial

Design DNA role:
- Global 75%: micrographic structure + mobile hero-first
- Universe skin 25%: pulp stamp labels for D&I; protocol labels for NeuroNet

[... rest of template ...]
```

---

## When NOT to use this template

- Documentation-only tasks
- Style Lab / HQ Design Lab new variants (use style lab section in questory-style-lab.md)
- Bug fixes with no visual intent change
- Token tweaks with no layout change

---

*Template v1.0*
