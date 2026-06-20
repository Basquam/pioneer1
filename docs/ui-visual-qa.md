# Questory UI Visual QA Checklist

**Design DNA reference:** See [`docs/questory-design-dna.md`](./questory-design-dna.md) for the official visual identity, universe skins, component rules, and implementation strategy.

**Reference board:** See [`docs/questory-reference-board.md`](./questory-reference-board.md) for approved external inspiration and research workflow.

## Reference-backed UI validation

Apply before promoting any reference-influenced design to production:

- [ ] **This UI direction has named references** logged in `questory-reference-board.md`
- [ ] **References used as inspiration**, not pixel copying (see `questory-source-usage-policy.md`)
- [ ] **Direction mapped to a specific screen** (HQ, Quest Board, Story, etc.)
- [ ] **Direction mapped to global DNA or universe skin** (70–75% / 25–30%)
- [ ] **Avoids generic premium dark UI** / old dashboard composition
- [ ] **Improves screenshot value** at 390–430px mobile width
- [ ] **Buildable in React Native** without unsafe dependencies or external prod images

## Universal DNA checklist (every screen)

Apply this before any screen-specific checklist:

- [ ] **Follows global Questory DNA** (70–75%: layout, hierarchy, typography, bento modules)
- [ ] **Universe skin is applied correctly** (25–30%: surface, labels, motifs — UX unchanged)
- [ ] **Clear visual anchor** (hero art, poster, route map, or strong typographic moment)
- [ ] **Mobile-first at 390–430px** (readable, generous tap targets, bottom nav safe)
- [ ] **Avoids old stacked dashboard layout** (no five identical thin bordered panels)
- [ ] **Avoids generic dark admin UI** (not a productivity app with RPG labels)

## Style Lab Review (Radical)

Use the Radical Style Lab (`/design-lab/style`, dev tools only) for experimental UI direction discovery. See [`docs/questory-style-lab.md`](./questory-style-lab.md).

- [ ] **Which variant is most memorable?**
- [ ] **Which variant avoids the old dashboard look?**
- [ ] **Which variant best supports multi-universe skins?**
- [ ] **Which variant has strongest Play Store screenshot potential?**
- [ ] **Which variant could become global DNA?**
- [ ] **Which variant works only as a universe skin?**
- [ ] **Which visual motifs should be borrowed?**
- [ ] **Which should be avoided?**

## Design Lab Review (HQ)

Use the HQ Design Lab (`/design-lab/hq`, dev tools only) to compare radical prototypes before merging into production HQ.

**Before promoting any variant to production:**

- [ ] **Use Compare All mode** to screenshot all three variants in one scroll
- [ ] **Do not promote any variant** until it clearly beats the current production HQ
- [ ] **Final direction may combine** Editorial structure + Pulp/NeuroNet skin details (70–75% global / 25–30% universe)

- [ ] **Which variant feels most like Questory?**
- [ ] **Which variant avoids the old dashboard look?**
- [ ] **Which variant has the strongest hero?**
- [ ] **Which variant would make good Play Store screenshots?**
- [ ] **Which elements should be merged into the real HQ?**
- [ ] **Which visual motifs should be avoided?**

## HQ Golden Screen Validation

Official golden screen checklist — validate against [`docs/questory-design-dna.md`](./questory-design-dna.md) Phase 1.

- [ ] **HQ no longer uses the old stacked dashboard composition** (no command header, threat monitor strip, briefing stack)
- [ ] **HQ has one dominant mission hero** (252px poster block, largest element above fold)
- [ ] **Mission hero uses large visual art or abstract universe panel** (chapter/saga/mood image or `HqAbstractPoster`)
- [ ] **Sasha/Marcus transmission feels integrated** (100×128 portrait, directive rail, filled gradient surface)
- [ ] **Threat/progress modules are compact** (side-by-side bento cards with accent rails, not horizontal strip)
- [ ] **Action grid feels mobile-native** (2×2 filled tiles, icon box + label, primary rail accent)
- [ ] **Dust & Iron skin is visibly dossier/brass/pulp** (warm surfaces, ACTIVE BOUNTY / BOUNTY DOSSIER labels, subtle skew)
- [ ] **NeuroNet skin is visibly protocol/cyan/violet** (signal grid abstract, NETWORK STATUS / PROTOCOL PACKET labels)
- [ ] **Screen is judged at 390–430px mobile width** (hero readable, 44px+ tap targets, tab bar safe)
- [ ] **If the screen still looks like the old HQ with new borders, the task is incomplete**

## Story Console HQ Screen

Reference screen for the mobile-first Story Console redesign — verify this first before rolling style to other tabs.

- [ ] **HQ no longer looks like stacked debug panels** (no thin bordered dashboard strips)
- [ ] **Mission hero is the dominant visual element** (large poster block near top of screen)
- [ ] **Chapter/world art is visible and meaningful** (not a tiny thumbnail)
- [ ] **Threat is compact, not a giant horizontal strip** (side-by-side or stacked compact cards)
- [ ] **Character guide feels integrated** (SASHA DIRECTIVE / MARCUS NOTE transmission with large portrait)
- [ ] **Action tiles feel like mobile app controls** (2×2 filled tiles with icon, label, sublabel)
- [ ] **Dust & Iron feels warm/brass/dossier** (poster hero, brass accents, bounty dossier tone)
- [ ] **NeuroNet feels cyan/violet/protocol** (neon mission packet, protocol accents)
- [ ] **390–430px mobile viewport looks premium** (hero readable, tap targets generous, bottom nav safe)
- [ ] **Desktop web width is not the design target** (mobile-first layout is correct)

## Golden HQ Screen (legacy — superseded by Story Console)

Previous golden HQ pass — superseded by Story Console above.

- [ ] ~~HQ looks dramatically different~~ → use Story Console checklist
- [ ] ~~One dominant hero mission card~~ → use Story Console checklist

## Core screens

- [ ] **HQ** looks like a premium Story Console (identity bar, mission hero, transmission, action grid — see HQ Golden Screen Validation)
- [ ] **Quest Board** looks like a quest/bounty board (command panel header, mission filter tabs, distinct bounty vs personal quest cards)
- [ ] **Story** looks like campaign/saga progression (campaign dossier header, progress dossier, premium chapter trail)
- [ ] **Onboarding** looks premium on first launch (hero card, command briefing mascot, portal universe cards)

## Universe skins

- [ ] **Dust & Iron** uses warm/brass dossier skin (skewed cards, brass accents, bounty language)
- [ ] **NeuroNet** uses cyan/violet terminal skin (terminal cards, protocol accents, cooler glow)

## Global system

- [ ] **Bottom navigation** does not look default (raised dark bar, active pill, universe accent)
- [ ] **Cards** no longer look flat/basic (layered borders, accent strips, top highlight, glow)
- [ ] **Screen backgrounds** feel darker and cinematic (radial glow, command rail, vignette)
- [ ] **Primary CTAs** feel premium (GlowButton layered border + sheen)
- [ ] **Secondary CTAs** are quieter but readable

## Readability & safety

- [ ] Text remains readable on small Android screens
- [ ] No mascot/image overflow on onboarding or HQ
- [ ] Web preview still works

## Behavior unchanged

- [ ] No gameplay/progression behavior changed
- [ ] No analytics/notifications/crash/audio behavior changed
- [ ] No story/content copy changed
