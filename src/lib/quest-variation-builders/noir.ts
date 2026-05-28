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

const NOIR_PATTERNS: CategoryVariationPatterns = {
  cleaning: (ctx) =>
    triple(
      {
        titlePattern: `${ctx.chapterTitle} — Clear ${ctx.territoryName}: {Task}`,
        descriptionPattern: `{Article} {task} clears the scene before {villain} {stakes}. Ash and clutter hide redacted truth.`,
        tags: ['cleaning', 'preparation'],
      },
      {
        titlePattern: `Prepare ${ctx.territoryName} — {Task}`,
        descriptionPattern: `{Article} {task} keeps your case notes legible while ${ctx.locationName} watches ${ctx.chapterTitle}.`,
        tags: ['cleaning', 'preparation'],
      },
      {
        titlePattern: `Scrub Before the Watchers Arrive — {Task}`,
        descriptionPattern: `{Article} {task} must finish before {villain} {stakes}. Every smear at ${ctx.territoryName} becomes another sealed page.`,
        tags: ['cleaning'],
      },
    ),
  fitness: (ctx) =>
    triple(
      {
        titlePattern: `${ctx.chapterTitle} Warm-Up — {Task}`,
        descriptionPattern: `{Article} {task} keeps your legs honest before {villain} {stakes}. A sluggish investigator broadcasts location.`,
        tags: ['training'],
      },
      {
        titlePattern: `Train for ${ctx.territoryName} — {Task}`,
        descriptionPattern: `{Article} {task} builds the stamina ${ctx.locationName} needs when every shadow has a tail.`,
        tags: ['training', 'preparation'],
      },
      {
        titlePattern: `Sprint Before Last Call — {Task}`,
        descriptionPattern: `{Article} {task} must land before {villain} {stakes}. Tail cars and bouncers don't wait for hesitation.`,
        tags: ['training'],
      },
    ),
  study: (ctx) =>
    triple(
      {
        titlePattern: `Decode ${ctx.territoryName} — {Task}`,
        descriptionPattern: `{Article} {task} turns patterns into ${ctx.questTerm.toLowerCase()}s before {villain} {stakes}. Knowledge is your subpoena key.`,
        tags: ['investigation'],
      },
      {
        titlePattern: `Cross-Reference ${ctx.chapterTitle} — {Task}`,
        descriptionPattern: `{Article} {task} closes blind spots across ${ctx.locationName} while ${ctx.territoryName} stays hot.`,
        tags: ['investigation', 'preparation'],
      },
      {
        titlePattern: `Crack the Redaction Code — {Task}`,
        descriptionPattern: `{Article} {task} must resolve before {villain} {stakes}. The index is already being rewritten.`,
        tags: ['investigation'],
      },
    ),
  work: (ctx) =>
    triple(
      {
        titlePattern: `${ctx.chapterTitle} ${ctx.questTerm} — {Task}`,
        descriptionPattern: `{Article} {task} keeps testimony honest before {villain} {stakes}. Case files decide who gets heard.`,
        tags: ['preparation'],
      },
      {
        titlePattern: `Execute at ${ctx.territoryName} — {Task}`,
        descriptionPattern: `{Article} {task} is discipline filed in ${ctx.locationName}'s ${ctx.mapTerm.toLowerCase()}.`,
        tags: ['preparation'],
      },
      {
        titlePattern: `Hold Case Integrity — {Task}`,
        descriptionPattern: `{Article} {task} must finish before {villain} {stakes}. One sloppy ${ctx.questTerm.toLowerCase()} and the truth gets burned.`,
        tags: ['preparation'],
      },
    ),
  health: (ctx) =>
    triple(
      {
        titlePattern: `Recovery at ${ctx.territoryName} — {Task}`,
        descriptionPattern: `{Article} {task} keeps you sharp before {villain} {stakes}. An exhausted investigator is easy to discredit.`,
        tags: ['recovery'],
      },
      {
        titlePattern: `Restore Before the Next Interview — {Task}`,
        descriptionPattern: `{Article} {task} steadies the focus ${ctx.locationName} needs during ${ctx.chapterTitle}.`,
        tags: ['recovery', 'preparation'],
      },
      {
        titlePattern: `Recover Before the Archive Closes — {Task}`,
        descriptionPattern: `{Article} {task} cannot wait — {villain} {stakes} and fatigue shows in every testimony.`,
        tags: ['recovery'],
      },
    ),
  social: (ctx) =>
    triple(
      {
        titlePattern: `Ping the Witness Network — {Task}`,
        descriptionPattern: `{Article} {task} files hope before {villain} {stakes}. Fear spreads through open channels.`,
        tags: ['outreach'],
      },
      {
        titlePattern: `Signal ${ctx.territoryName} — {Task}`,
        descriptionPattern: `{Article} {task} reminds ${ctx.locationName} that someone still answers after midnight.`,
        tags: ['outreach', 'preparation'],
      },
      {
        titlePattern: `Warn Before Redaction — {Task}`,
        descriptionPattern: `{Article} {task} must send before {villain} {stakes}. Silence is a win for the enemy.`,
        tags: ['outreach'],
      },
    ),
  creative: (ctx) =>
    triple(
      {
        titlePattern: `${ctx.chapterTitle} Summary — {Task}`,
        descriptionPattern: `{Article} {task} shapes the investigators who follow your trail before {villain} {stakes}.`,
        tags: ['craft'],
      },
      {
        titlePattern: `Craft a ${ctx.territoryName} Broadside — {Task}`,
        descriptionPattern: `{Article} {task} turns resolve into something ${ctx.locationName} can read between the rain.`,
        tags: ['craft', 'preparation'],
      },
      {
        titlePattern: `Publish Before the Ledger Burns — {Task}`,
        descriptionPattern: `{Article} {task} must land before {villain} {stakes}. Words are the last uncensored witness.`,
        tags: ['craft'],
      },
    ),
  errand: (ctx) =>
    triple(
      {
        titlePattern: `${ctx.territoryName} Evidence Run — {Task}`,
        descriptionPattern: `{Article} {task} keeps sealed envelopes ready before {villain} {stakes}.`,
        tags: ['delivery'],
      },
      {
        titlePattern: `Run the ${ctx.chapterTitle} Errand — {Task}`,
        descriptionPattern: `{Article} {task} is the small chore that keeps ${ctx.locationName} from losing the trail.`,
        tags: ['delivery', 'preparation'],
      },
      {
        titlePattern: `Race Before Lockdown — {Task}`,
        descriptionPattern: `{Article} {task} must finish before {villain} {stakes}. Every delay feeds the enemy's ledger.`,
        tags: ['delivery'],
      },
    ),
};

export const createNoirVariations = createUniverseVariationBuilder(NOIR_PATTERNS);
