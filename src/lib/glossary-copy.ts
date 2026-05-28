import { getStreakFlavor } from '@/lib/daily-streak';
import type { UniverseUiCopy } from '@/lib/universe-ui-copy';
import type { Universe } from '@/types/narrative';

export type GlossaryEntry = {
  term: string;
  body: string;
};

function chapterLabel(universeId: string): string {
  if (universeId === 'neuronet') return 'sector';
  if (universeId === 'neon-ashes') return 'case';
  return 'chapter';
}

function chapterLabelPlural(universeId: string): string {
  if (universeId === 'neuronet') return 'sectors';
  if (universeId === 'neon-ashes') return 'cases';
  return 'chapters';
}

export function getGlossaryEntries(universe: Universe, ui: UniverseUiCopy, sagaId: string): GlossaryEntry[] {
  const streak = getStreakFlavor(sagaId, universe.id);
  const chapters = chapterLabel(universe.id);
  const chaptersPlural = chapterLabelPlural(universe.id);
  const storyTaskLabel = ui.templateQuestLabel.toLowerCase();
  const personalTaskLabel =
    universe.id === 'neuronet'
      ? 'operation'
      : universe.id === 'neon-ashes'
        ? 'lead'
        : 'quest';

  const progressionBody =
    universe.id === 'neuronet'
      ? `${ui.reputationLabel} tracks how much trust you've earned in the Neon Spire. The map screen calls the same idea Signal Integrity — both rise when you finish work and fall when you stall.`
      : universe.id === 'neon-ashes'
        ? `${ui.reputationLabel} tracks how much Grayhaven trusts your detective work. The case board uses Case Integrity for the same idea — steady work keeps the file open.`
        : `${ui.reputationLabel} is your standing in Dustfall. Finish quests and chapters to earn it; letting work pile up lets villains gain ground.`;

  const questBody =
    universe.id === 'neuronet'
      ? `Tasks on your Operations Board. Story ${storyTaskLabel}s advance a sector; personal operations come from real tasks you add. Other universes call these quests or leads.`
      : universe.id === 'neon-ashes'
        ? `Tasks on your Case Board. Story ${storyTaskLabel}s advance a case; personal leads come from real tasks you add. Other universes call these quests or operations.`
        : `Tasks on your Quest Board. Story bounties advance a chapter; personal quests come from real tasks you add. NeuroNet calls them operations; Neon Ashes calls them leads.`;

  const focusBody = `Your first three personal ${personalTaskLabel}s each day become ${ui.focusQuestsHeaderLabel.toLowerCase()} — marked on the board for extra clarity. You can add more anytime; extras still count toward progress.`;

  return [
    {
      term: 'Universe',
      body: `A themed world with its own story, characters, and vocabulary. Pioneer has three: Dust & Iron (frontier), NeuroNet (cyberpunk), and Neon Ashes (noir). You're in ${universe.name} — ${universe.tagline}.`,
    },
    {
      term: 'Saga',
      body: `One full story campaign inside a universe. Each saga has several ${chaptersPlural}, its own allies, villain, and ending. Finish or switch sagas from the story trail when you've unlocked them.`,
    },
    {
      term: 'Chapter',
      body: `One ${chapters.slice(0, 1).toUpperCase()}${chapters.slice(1)} in a saga — a stretch of story with its own tasks and map location. Clear its tasks to advance and unlock the next ${chapters}. NeuroNet uses "sector"; Neon Ashes uses "case".`,
    },
    {
      term: 'Quest / Operation / Lead',
      body: questBody,
    },
    {
      term: ui.focusQuestLabel,
      body: focusBody,
    },
    {
      term: `${ui.reputationLabel} / ${universe.coreProgressionName}`,
      body: progressionBody,
    },
    {
      term: 'Rewards',
      body: 'Badges, titles, and story unlocks earned by clearing chapters. Some rewards open new sagas or entire universes. See Rewards / Unlocks on your profile.',
    },
    {
      term: 'Relationships',
      body: 'Your bond with allies and rivals in the active saga. Completing tasks shifts affinity over time — check character cards under Relationships on your profile.',
    },
    {
      term: 'Daily Streak',
      body: `Consecutive days you've opened Pioneer. Missing a day gently resets to 1 — it never drops to zero. In ${universe.name} this reads as ${streak.label.toLowerCase()}: ${streak.encouragement}`,
    },
  ];
}
