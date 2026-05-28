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

const NEURONET_PATTERNS: CategoryVariationPatterns = {
  cleaning: (ctx) =>
    triple(
      {
        titlePattern: `${ctx.chapterTitle} — Purge ${ctx.territoryName}: {Task}`,
        descriptionPattern: `{Article} {task} scrubs cluttered nodes before {villain} {stakes}. Static hides corrupted packets.`,
        tags: ['cleaning', 'preparation'],
      },
      {
        titlePattern: `Sanitize ${ctx.territoryName} — {Task}`,
        descriptionPattern: `{Article} {task} keeps your neural signature clean across ${ctx.locationName}.`,
        tags: ['cleaning', 'preparation'],
      },
      {
        titlePattern: `Scrub Before the Crawlers Arrive — {Task}`,
        descriptionPattern: `{Article} {task} must finish before {villain} {stakes}. Clutter at ${ctx.territoryName} is a compliance flag.`,
        tags: ['cleaning'],
      },
    ),
  fitness: (ctx) =>
    triple(
      {
        titlePattern: `${ctx.chapterTitle} Warm-Up — {Task}`,
        descriptionPattern: `{Article} {task} keeps reflexes sharp before {villain} {stakes}. A sluggish operator broadcasts location.`,
        tags: ['training'],
      },
      {
        titlePattern: `Train for ${ctx.territoryName} — {Task}`,
        descriptionPattern: `{Article} {task} builds the pace ${ctx.locationName} needs during ${ctx.chapterTitle}.`,
        tags: ['training', 'preparation'],
      },
      {
        titlePattern: `Outrun the Sector Scan — {Task}`,
        descriptionPattern: `{Article} {task} must land before {villain} {stakes}. Ministry drones don't wait for hesitation.`,
        tags: ['training'],
      },
    ),
  study: (ctx) =>
    triple(
      {
        titlePattern: `Decode ${ctx.territoryName} — {Task}`,
        descriptionPattern: `{Article} {task} turns surveillance patterns into keys before {villain} {stakes}. Knowledge is encryption.`,
        tags: ['investigation'],
      },
      {
        titlePattern: `Map ${ctx.chapterTitle} Routes — {Task}`,
        descriptionPattern: `{Article} {task} closes blind spots across ${ctx.locationName} while ${ctx.territoryName} stays hot.`,
        tags: ['investigation', 'preparation'],
      },
      {
        titlePattern: `Crack the Mirror Code — {Task}`,
        descriptionPattern: `{Article} {task} must resolve before {villain} {stakes}. Every unread signature propagates through the grid.`,
        tags: ['investigation'],
      },
    ),
  work: (ctx) =>
    triple(
      {
        titlePattern: `${ctx.chapterTitle} ${ctx.questTerm} — {Task}`,
        descriptionPattern: `{Article} {task} keeps access ledgers honest before {villain} {stakes}. Delay is a ping they read like confession.`,
        tags: ['preparation'],
      },
      {
        titlePattern: `Execute at ${ctx.territoryName} — {Task}`,
        descriptionPattern: `{Article} {task} is discipline encoded in ${ctx.locationName}'s compliance grid.`,
        tags: ['preparation'],
      },
      {
        titlePattern: `Hold Signal Integrity — {Task}`,
        descriptionPattern: `{Article} {task} must finish before {villain} {stakes}. One sloppy block and the tower edits your profile.`,
        tags: ['preparation'],
      },
    ),
  health: (ctx) =>
    triple(
      {
        titlePattern: `Recovery at ${ctx.territoryName} — {Task}`,
        descriptionPattern: `{Article} {task} keeps your mind intact before {villain} {stakes}. A fragmented operator is easy to mirror.`,
        tags: ['recovery'],
      },
      {
        titlePattern: `Re-sync Before the Next Sector — {Task}`,
        descriptionPattern: `{Article} {task} restores focus ${ctx.locationName} needs during ${ctx.chapterTitle}.`,
        tags: ['recovery', 'preparation'],
      },
      {
        titlePattern: `Recover Before Lock-In — {Task}`,
        descriptionPattern: `{Article} {task} cannot wait — {villain} {stakes} and fatigue shows in every audit gap.`,
        tags: ['recovery'],
      },
    ),
  social: (ctx) =>
    triple(
      {
        titlePattern: `Ping ${ctx.territoryName} Network — {Task}`,
        descriptionPattern: `{Article} {task} encrypts hope before {villain} {stakes}. Fear spreads through open channels.`,
        tags: ['outreach'],
      },
      {
        titlePattern: `Signal the ${ctx.chapterTitle} Crew — {Task}`,
        descriptionPattern: `{Article} {task} reminds ${ctx.locationName} that operators still answer each other.`,
        tags: ['outreach', 'preparation'],
      },
      {
        titlePattern: `Warn Before Blackout — {Task}`,
        descriptionPattern: `{Article} {task} must send before {villain} {stakes}. Silence is a compliance win for the enemy.`,
        tags: ['outreach'],
      },
    ),
  creative: (ctx) =>
    triple(
      {
        titlePattern: `${ctx.chapterTitle} Manifest — {Task}`,
        descriptionPattern: `{Article} {task} shapes the operators who follow your route before {villain} {stakes}.`,
        tags: ['craft'],
      },
      {
        titlePattern: `Craft a ${ctx.territoryName} Broadside — {Task}`,
        descriptionPattern: `{Article} {task} turns resolve into something ${ctx.locationName} can route without a trace.`,
        tags: ['craft', 'preparation'],
      },
      {
        titlePattern: `Publish Before the Mirror Edits — {Task}`,
        descriptionPattern: `{Article} {task} must land before {villain} {stakes}. Words are the last uncorrupted packet.`,
        tags: ['craft'],
      },
    ),
  errand: (ctx) =>
    triple(
      {
        titlePattern: `${ctx.territoryName} Supply Run — {Task}`,
        descriptionPattern: `{Article} {task} keeps spoof chips and power cells stocked before {villain} {stakes}.`,
        tags: ['delivery'],
      },
      {
        titlePattern: `Run the ${ctx.chapterTitle} Errand — {Task}`,
        descriptionPattern: `{Article} {task} is the small chore that keeps ${ctx.locationName} from stalling under siege.`,
        tags: ['delivery', 'preparation'],
      },
      {
        titlePattern: `Race the Sector Before Lockdown — {Task}`,
        descriptionPattern: `{Article} {task} must finish before {villain} {stakes}. Every delay feeds the mirror.`,
        tags: ['delivery'],
      },
    ),
};

export const createNeuroNetVariations = createUniverseVariationBuilder(NEURONET_PATTERNS);
