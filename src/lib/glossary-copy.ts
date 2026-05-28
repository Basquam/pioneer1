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
      ? `${ui.reputationLabel} is your trust in the Spire. The map calls the same thing Signal Integrity. Both rise when you finish work.`
      : universe.id === 'neon-ashes'
        ? `${ui.reputationLabel} is Grayhaven's trust in you. The case board calls the same thing Case Integrity. Steady work keeps the file open.`
        : `${ui.reputationLabel} is your standing in Dustfall. Finish quests and chapters to earn it. Stall, and villains gain ground.`;

  const questBody =
    universe.id === 'neuronet'
      ? `Tasks on your Operations Board. Story ${storyTaskLabel}s advance a sector; personal operations come from real tasks you add.`
      : universe.id === 'neon-ashes'
        ? `Tasks on your Case Board. Story ${storyTaskLabel}s advance a case; personal leads come from real tasks you add.`
        : `Tasks on your Quest Board. Story bounties advance a chapter; personal quests come from real tasks you add.`;

  const focusBody = `Your first three personal ${personalTaskLabel}s each day become ${ui.focusQuestsHeaderLabel.toLowerCase()}. You can add more anytime — extras still count.`;

  return [
    {
      term: 'Universe',
      body: `A themed world with its own story and vocabulary. Pioneer has three: Dust & Iron, NeuroNet, and Neon Ashes. You're in ${universe.name} — ${universe.tagline}.`,
    },
    {
      term: 'Saga',
      body: `One full campaign inside a universe. Each saga has several ${chaptersPlural}, its own cast, and an ending.`,
    },
    {
      term: 'Chapter',
      body: `One ${chapters} in a saga — story, tasks, and a map location. Clear it to unlock the next. NeuroNet says sector; Neon Ashes says case.`,
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
      body: 'Badges, titles, and unlocks from clearing chapters. Some open new sagas or universes.',
    },
    {
      term: 'Relationships',
      body: 'Bond with allies and rivals in the active saga. Completing tasks shifts affinity over time.',
    },
    {
      term: 'Daily Streak',
      body: `Days in a row you've opened Pioneer. Miss a day and it resets to 1 — never to zero. Here: ${streak.label.toLowerCase()}.`,
    },
  ];
}
