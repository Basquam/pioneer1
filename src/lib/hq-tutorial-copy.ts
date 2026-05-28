import type { UniverseUiCopy } from '@/lib/universe-ui-copy';

export type HqTutorialStep = {
  number: string;
  title: string;
  body: string;
};

export function getHqTutorialCopy(
  ui: UniverseUiCopy,
  locationName: string,
): {
  eyebrow: string;
  title: string;
  intro: string;
  steps: HqTutorialStep[];
  addQuestLabel: string;
  laterLabel: string;
} {
  const personalTask =
    ui.addQuestButtonLabel.replace(/^ADD /i, '').toLowerCase();
  const storyTasks = ui.chapterTemplatesLabel.toLowerCase();
  const boardName = ui.questBoardEyebrow.toLowerCase();

  return {
    eyebrow: `${locationName.toUpperCase()} · FIRST VISIT`,
    title: 'THREE MOVES TO START',
    intro: 'HQ is your home base. Here is the loop that drives every saga.',
    steps: [
      {
        number: '01',
        title: "Check today's briefing",
        body: `Read the briefing panel for your streak, ${ui.reputationLabel.toLowerCase()}, and what is left in ${ui.todaySectorLabel.toLowerCase()}.`,
      },
      {
        number: '02',
        title: `Add a real-life ${personalTask}`,
        body: `Turn something you already need to do into a ${personalTask}. Your first three each day become ${ui.focusQuestsHeaderLabel.toLowerCase()}.`,
      },
      {
        number: '03',
        title: `Complete ${storyTasks} to advance`,
        body: `Clear story ${ui.templateQuestLabel.toLowerCase()}s on the ${boardName} to push the chapter forward and unlock the next beat.`,
      },
    ],
    addQuestLabel: `ADD YOUR FIRST ${personalTask.toUpperCase()}`,
    laterLabel: 'MAYBE LATER',
  };
}
