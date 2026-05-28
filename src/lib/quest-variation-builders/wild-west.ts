import { createUniverseVariationBuilder } from '@/lib/quest-variation-builders/shared';
import type {
  CategoryVariationPatterns,
  ChapterVariationContext,
  VariationPatternDef,
} from '@/lib/quest-variation-builders/types';

function triple(
  calm: Omit<VariationPatternDef, 'suffix' | 'intensity'>,
  normal: Omit<VariationPatternDef, 'suffix' | 'intensity'>,
  urgent: Omit<VariationPatternDef, 'suffix' | 'intensity'>,
): VariationPatternDef[] {
  return [
    { suffix: 'calm', intensity: 'calm', ...calm },
    { suffix: 'normal', intensity: 'normal', ...normal },
    { suffix: 'urgent', intensity: 'urgent', ...urgent },
  ];
}

const WILD_WEST_PATTERNS: CategoryVariationPatterns = {
  cleaning: (ctx) =>
    triple(
      {
        titlePattern: `${ctx.chapterTitle} — Clear ${ctx.territoryName}: {Task}`,
        descriptionPattern: `{Article} {task} steadies ${ctx.territoryName} before {villain} {stakes}. Dust and debris hide trouble in plain sight.`,
        tags: ['cleaning', 'preparation'],
      },
      {
        titlePattern: `Prepare ${ctx.territoryName} — {Task}`,
        descriptionPattern: `{Article} {task} keeps ${ctx.locationName} orderly while ${ctx.chapterTitle} tests the frontier.`,
        tags: ['cleaning', 'preparation'],
      },
      {
        titlePattern: `Scrub Before Sundown — {Task}`,
        descriptionPattern: `{Article} {task} must finish before {villain} {stakes}. Every mess at ${ctx.territoryName} reads as weakness.`,
        tags: ['cleaning'],
      },
    ),
  fitness: (ctx) =>
    triple(
      {
        titlePattern: `${ctx.chapterTitle} Drill — {Task}`,
        descriptionPattern: `{Article} {task} keeps your legs honest before {villain} {stakes}. A tired hand loses the frontier.`,
        tags: ['training'],
      },
      {
        titlePattern: `Train for ${ctx.territoryName} — {Task}`,
        descriptionPattern: `{Article} {task} builds the stamina ${ctx.locationName} needs during ${ctx.chapterTitle}.`,
        tags: ['training', 'preparation'],
      },
      {
        titlePattern: `Sprint Before ${ctx.villainName} Moves — {Task}`,
        descriptionPattern: `{Article} {task} is your answer to {villain} {stakes}. Outriders flee fast — your legs decide the chase.`,
        tags: ['training'],
      },
    ),
  study: (ctx) =>
    triple(
      {
        titlePattern: `Read the ${ctx.territoryName} Ledger — {Task}`,
        descriptionPattern: `{Article} {task} turns clues into routes before {villain} {stakes}. Knowledge is your trigger finger.`,
        tags: ['investigation'],
      },
      {
        titlePattern: `Map ${ctx.chapterTitle} — {Task}`,
        descriptionPattern: `{Article} {task} closes blind spots across ${ctx.locationName} while ${ctx.territoryName} stays hot.`,
        tags: ['investigation', 'preparation'],
      },
      {
        titlePattern: `Decode Before Sundown — {Task}`,
        descriptionPattern: `{Article} {task} must land before {villain} {stakes}. Every unread page is an ambush route left open.`,
        tags: ['investigation'],
      },
    ),
  work: (ctx) =>
    triple(
      {
        titlePattern: `${ctx.chapterTitle} Dispatch — {Task}`,
        descriptionPattern: `{Article} {task} keeps the books honest before {villain} {stakes}. Delay is a telegram to the enemy.`,
        tags: ['preparation'],
      },
      {
        titlePattern: `Execute at ${ctx.territoryName} — {Task}`,
        descriptionPattern: `{Article} {task} is discipline made visible across ${ctx.locationName}.`,
        tags: ['preparation'],
      },
      {
        titlePattern: `Hold the Line — {Task}`,
        descriptionPattern: `{Article} {task} must finish before {villain} {stakes}. One neglected duty and the town reads weakness.`,
        tags: ['preparation'],
      },
    ),
  health: (ctx) =>
    triple(
      {
        titlePattern: `Recovery at ${ctx.territoryName} — {Task}`,
        descriptionPattern: `{Article} {task} keeps you standing before {villain} {stakes}. A wounded hand is easy prey.`,
        tags: ['recovery'],
      },
      {
        titlePattern: `Restore Before the Next Patrol — {Task}`,
        descriptionPattern: `{Article} {task} steadies the body ${ctx.locationName} trusts during ${ctx.chapterTitle}.`,
        tags: ['recovery', 'preparation'],
      },
      {
        titlePattern: `Recover Before the Raid — {Task}`,
        descriptionPattern: `{Article} {task} cannot wait — {villain} {stakes} and exhaustion shows in every missed detail.`,
        tags: ['recovery'],
      },
    ),
  social: (ctx) =>
    triple(
      {
        titlePattern: `Rally ${ctx.territoryName} — {Task}`,
        descriptionPattern: `{Article} {task} steadies voices before {villain} {stakes}. Fear spreads unless someone speaks up.`,
        tags: ['outreach'],
      },
      {
        titlePattern: `Word Across ${ctx.locationName} — {Task}`,
        descriptionPattern: `{Article} {task} reminds the frontier that order still has a face during ${ctx.chapterTitle}.`,
        tags: ['outreach', 'preparation'],
      },
      {
        titlePattern: `Call Allies Before Sundown — {Task}`,
        descriptionPattern: `{Article} {task} must send before {villain} {stakes}. Silence is permission for the enemy.`,
        tags: ['outreach'],
      },
    ),
  creative: (ctx) =>
    triple(
      {
        titlePattern: `${ctx.chapterTitle} Chronicle — {Task}`,
        descriptionPattern: `{Article} {task} shapes courage before {villain} {stakes}. Your words outlast a single shot.`,
        tags: ['craft'],
      },
      {
        titlePattern: `Craft a ${ctx.territoryName} Broadside — {Task}`,
        descriptionPattern: `{Article} {task} turns resolve into something ${ctx.locationName} can see from the trail.`,
        tags: ['craft', 'preparation'],
      },
      {
        titlePattern: `Ink the Warning — {Task}`,
        descriptionPattern: `{Article} {task} must publish before {villain} {stakes}. Hope needs a headline tonight.`,
        tags: ['craft'],
      },
    ),
  errand: (ctx) =>
    triple(
      {
        titlePattern: `${ctx.territoryName} Supply Run — {Task}`,
        descriptionPattern: `{Article} {task} keeps shelves and saddles ready before {villain} {stakes}.`,
        tags: ['delivery'],
      },
      {
        titlePattern: `Run the ${ctx.chapterTitle} Errand — {Task}`,
        descriptionPattern: `{Article} {task} is the small chore that keeps ${ctx.locationName} from breaking under pressure.`,
        tags: ['delivery', 'preparation'],
      },
      {
        titlePattern: `Race Before the Bell — {Task}`,
        descriptionPattern: `{Article} {task} must finish before {villain} {stakes}. Every delay feeds the enemy's story.`,
        tags: ['delivery'],
      },
    ),
};

export const createWildWestVariations = createUniverseVariationBuilder(WILD_WEST_PATTERNS);
