import type { Chapter } from '@/types/narrative';

export function sumChapterTemplateRewards(chapter: Chapter): { xp: number; reputation: number } {
  return chapter.questTemplates.reduce(
    (totals, template) => ({
      xp: totals.xp + template.xpReward,
      reputation: totals.reputation + template.reputationImpact,
    }),
    { xp: 0, reputation: 0 },
  );
}
