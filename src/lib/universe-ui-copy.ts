import { useMemo } from 'react';

import { useGame } from '@/hooks/use-game';
import type { ChapterStatus } from '@/lib/chapter-progress';
import type { Universe } from '@/types/narrative';

export type UniverseUiCopy = {
  questBoardEyebrow: string;
  questBoardTitle: string;
  reputationLabel: string;
  templateQuestLabel: string;
  templateQuestClearedLabel: string;
  userQuestClearedLabel: string;
  userQuestsLabel: string;
  chapterTemplatesLabel: string;
  chapterTemplatesClearedTitle: string;
  questsBoardHint: string;
  addQuestSubtitle: (chapterTitle?: string) => string;
  addQuestSheetTitle: string;
  addQuestSheetEyebrow: string;
  hqTitle: (locationName: string) => string;
  hqReturnLabel: string;
  openQuestBoardLabel: string;
  goToQuestBoardLabel: string;
  goToQuestBoardHint: string;
  mapEyebrow: (universeName: string) => string;
  mapTitle: string;
  mapProgressHint: (cleared: number, total: number, locationName: string) => string;
  mapEmptyMessage: string;
  mapReclaimedTitle: string;
  mapReclaimedMessage: (sagaTitle: string) => string;
  mapLegend: string;
  worldMapQuickLink: string;
  storyTitle: string;
  sectorsClearedLabel: (cleared: number, total: number) => string;
  activeSectorLine: (title: string) => string;
  sagaSectorsLabel: string;
  sectorIntroLabel: (order: number, title: string) => string;
  sectorEyebrow: (order: number) => string;
  beginSectorLabel: string;
  beginSectorHint: string;
  villainStatLabel: string;
  villainInfluenceLabel: (villainName: string) => string;
  antagonistTauntBadge: string;
  antagonistReactionBadge: string;
  allyReactionBadge: string;
  chapterCompleteStamp: string;
  continueHintNext: string;
  continueHintHome: string;
  stayInSagaHint: string;
  stayInSagaHintHome: string;
  templateQuestCompleteMessage: string;
  userQuestCompleteMessage: string;
  viewQuestBoardLabel: string;
  viewQuestBoardHint: string;
  todaySectorLabel: string;
  todaySectorLine: (order: number, title: string) => string;
  operationsLeftLabel: string;
  realTaskLabel: string;
  sagaQuestLabel: string;
  sagaCompleteMessage: (sagaTitle: string) => string;
  activeSectorProgressSub: (order: number) => string;
  sectorUnavailableSub: string;
  operativeFileEyebrow: string;
  tabHq: string;
  tabBoard: string;
  tabMap: string;
  coreProgressionLabel: string;
  addQuestTriggerBanner: string;
  addQuestTriggerSub: string;
  addQuestAccessibilityLabel: string;
  addQuestTypeLabel: string;
  addQuestCreateLabel: string;
  addQuestCreateHint: string;
  noActiveChapterTitle: string;
  hudMissionsLabel: string;
  questCompleteFallbackLine: string;
  addQuestConfirmOverLimitHint: string;
  addQuestFocusHintUnder: string;
  addQuestFocusHintOver: string;
  newQuestAddedStamp: string;
  addAnotherQuestLabel: string;
  addAnotherQuestHint: string;
  personalOpsLeftLabel: string;
  focusQuestLabel: string;
  focusQuestsHeaderLabel: string;
  focusQuestSlotsHint: (remaining: number) => string;
  focusQuestFullHint: string;
  focusQuestOverHint: string;
  yourQuestLabel: string;
  noActiveChapterBriefing: string;
  noQuestsYetTitle: string;
  noQuestsYetMessage: string;
  addQuestButtonLabel: string;
  chapterTemplatesClearedContinueMessage: string;
  noActiveChapterEmptyMessage: string;
  restoreDefaultSagaLabel: string;
  sectorRef: (order: number, title: string) => string;
  lockedSectorMessage: string;
  lockedSectorCardMessage: string;
  territoryStatusLabel: (status: ChapterStatus) => string;
  villainLabel: string;
  villainMeterStatus: (level: 'high' | 'mid' | 'low') => string;
  weeklyRecapQuietHint: string;
  weeklyRecapSectorsLabel: string;
  sagaProgressMeta: (completed: number, total: number, activeTitle?: string) => string;
  sagaSwitcherEmptyMessage: string;
  sagaCompleteTitle: string;
  noChaptersTitle: string;
  noChaptersMessage: string;
  hqChapterEyebrow: (sagaTitle: string, order?: number) => string;
  viewStoryTrailLabel: string;
  unlockRewardsEmptyMessage: string;
};

const DUST_AND_IRON_UI: Omit<
  UniverseUiCopy,
  | 'hqTitle'
  | 'mapEyebrow'
  | 'addQuestSubtitle'
  | 'mapProgressHint'
  | 'mapReclaimedMessage'
  | 'sagaCompleteMessage'
  | 'activeSectorProgressSub'
  | 'sectorsClearedLabel'
  | 'sectorIntroLabel'
  | 'sectorEyebrow'
  | 'activeSectorLine'
  | 'villainInfluenceLabel'
  | 'todaySectorLine'
  | 'sectorRef'
  | 'territoryStatusLabel'
  | 'villainMeterStatus'
  | 'sagaProgressMeta'
  | 'hqChapterEyebrow'
  | 'focusQuestSlotsHint'
> = {
  questBoardEyebrow: 'QUEST BOARD',
  questBoardTitle: 'ACTIVE MISSIONS',
  reputationLabel: 'REPUTATION',
  templateQuestLabel: 'BOUNTY',
  templateQuestClearedLabel: 'BOUNTY CLEARED',
  userQuestClearedLabel: 'QUEST CLEARED',
  userQuestsLabel: 'YOUR QUESTS',
  chapterTemplatesLabel: 'CHAPTER BOUNTIES',
  chapterTemplatesClearedTitle: 'Chapter bounties cleared.',
  questsBoardHint: 'Complete bounties and quests to advance the chapter. Tap to mark done.',
  addQuestSheetTitle: 'Add Quest',
  addQuestSheetEyebrow: 'NEW QUEST',
  hqReturnLabel: 'RETURN TO HQ',
  openQuestBoardLabel: 'OPEN QUEST BOARD ›',
  goToQuestBoardLabel: 'GO TO QUEST BOARD',
  goToQuestBoardHint: 'VIEW BOUNTIES & QUESTS',
  mapTitle: 'FRONTIER PROGRESS',
  mapEmptyMessage: 'No territory data for this saga yet.',
  mapReclaimedTitle: 'Territory reclaimed.',
  mapLegend: 'RECLAIMED — chapter cleared · ACTIVE — current front · THREAT — locked territory',
  worldMapQuickLink: 'WORLD MAP',
  storyTitle: 'CHAPTER PROGRESS',
  sagaSectorsLabel: 'SAGA CHAPTERS',
  beginSectorLabel: 'BEGIN CHAPTER',
  beginSectorHint: 'VIEW CHAPTER BOUNTIES',
  villainStatLabel: 'VILLAIN',
  antagonistTauntBadge: 'VILLAIN TAUNT',
  antagonistReactionBadge: 'VILLAIN REACTION',
  allyReactionBadge: 'ALLY RESPONSE',
  chapterCompleteStamp: 'CHAPTER COMPLETE',
  continueHintNext: 'RIDE INTO THE NEXT CHAPTER',
  continueHintHome: 'RETURN TO DUSTFALL',
  stayInSagaHint: 'RIDE INTO THE NEXT CHAPTER',
  stayInSagaHintHome: 'RETURN TO HQ AND KEEP YOUR POST',
  templateQuestCompleteMessage: 'This bounty advanced the chapter.',
  userQuestCompleteMessage: 'Your quest moved the story forward.',
  viewQuestBoardLabel: 'VIEW ON QUEST BOARD',
  viewQuestBoardHint: 'SEE YOUR QUEST',
  todaySectorLabel: "TODAY'S CHAPTER",
  operationsLeftLabel: 'BOUNTIES LEFT',
  realTaskLabel: 'REAL TASK',
  sagaQuestLabel: 'SAGA QUEST',
  sectorUnavailableSub: 'Chapter unavailable',
  operativeFileEyebrow: 'OPERATIVE FILE',
  tabHq: 'HQ',
  tabBoard: 'BOARD',
  tabMap: 'MAP',
  coreProgressionLabel: 'REPUTATION',
  addQuestTriggerBanner: '+ ADD QUEST',
  addQuestTriggerSub: 'Turn a real task into a quest',
  addQuestAccessibilityLabel: 'Add Quest',
  addQuestTypeLabel: 'QUEST TYPE',
  addQuestCreateLabel: 'CREATE QUEST',
  addQuestCreateHint: 'Add to the Quest Board',
  noActiveChapterTitle: 'No active chapter.',
  hudMissionsLabel: 'MISSIONS',
  questCompleteFallbackLine: 'The frontier remembers what you accomplished.',
  addQuestConfirmOverLimitHint: "Add beyond today's Focus Quests",
  addQuestFocusHintUnder: 'First three quests today become Focus Quests on the board.',
  addQuestFocusHintOver: 'You can still add more — they just won’t be marked as Focus Quests.',
  newQuestAddedStamp: 'NEW QUEST ADDED',
  addAnotherQuestLabel: 'ADD ANOTHER QUEST',
  addAnotherQuestHint: 'ADD ANOTHER QUEST TODAY',
  personalOpsLeftLabel: 'QUESTS LEFT',
  focusQuestLabel: 'FOCUS QUEST',
  focusQuestsHeaderLabel: 'FOCUS QUESTS',
  focusQuestFullHint: 'Focus Quests full — extra quests still count toward progress.',
  focusQuestOverHint: "Beyond today's Focus Quests — the story still moves forward.",
  yourQuestLabel: 'YOUR QUEST',
  noActiveChapterBriefing: 'No active chapter',
  noQuestsYetTitle: 'No quests yet.',
  noQuestsYetMessage: "Turn a real task into a quest for today's chapter.",
  addQuestButtonLabel: 'ADD QUEST',
  chapterTemplatesClearedContinueMessage: 'Continue the saga from HQ.',
  noActiveChapterEmptyMessage:
    'This saga has no active chapter right now. Restore the default saga to pick up where the trail begins.',
  restoreDefaultSagaLabel: 'Restore Default Saga',
  lockedSectorMessage: 'Complete previous chapters to unlock.',
  lockedSectorCardMessage: 'Complete previous chapters to unlock this trail.',
  villainLabel: 'VILLAIN',
  weeklyRecapQuietHint:
    'No quests or bounties cleared yet this week — the frontier waits for your first move.',
  weeklyRecapSectorsLabel: 'CHAPTERS',
  sagaSwitcherEmptyMessage: 'Complete the Vulture Gang saga to unlock more sagas across Dustfall.',
  sagaCompleteTitle: 'Saga complete.',
  noChaptersTitle: 'No chapters available.',
  noChaptersMessage:
    "doesn't have playable chapters yet. Switch to an unlocked saga or restore the default saga.",
  viewStoryTrailLabel: 'VIEW STORY TRAIL',
  unlockRewardsEmptyMessage: 'Complete chapters to earn badges, titles, and story unlocks.',
};

const NEURONET_UI: Omit<
  UniverseUiCopy,
  | 'hqTitle'
  | 'mapEyebrow'
  | 'addQuestSubtitle'
  | 'mapProgressHint'
  | 'mapReclaimedMessage'
  | 'sagaCompleteMessage'
  | 'activeSectorProgressSub'
  | 'sectorsClearedLabel'
  | 'sectorIntroLabel'
  | 'sectorEyebrow'
  | 'activeSectorLine'
  | 'villainInfluenceLabel'
  | 'todaySectorLine'
  | 'sectorRef'
  | 'territoryStatusLabel'
  | 'villainMeterStatus'
  | 'sagaProgressMeta'
  | 'hqChapterEyebrow'
  | 'focusQuestSlotsHint'
> = {
  questBoardEyebrow: 'OPERATIONS BOARD',
  questBoardTitle: 'ACTIVE OPERATIONS',
  reputationLabel: 'NETWORK STANDING',
  templateQuestLabel: 'OPERATION',
  templateQuestClearedLabel: 'OPERATION CLEARED',
  userQuestClearedLabel: 'OPERATION CLEARED',
  userQuestsLabel: 'YOUR OPERATIONS',
  chapterTemplatesLabel: 'SECTOR OPERATIONS',
  chapterTemplatesClearedTitle: 'Sector operations complete.',
  questsBoardHint: 'Complete operations to stabilize the sector. Tap to mark done.',
  addQuestSheetTitle: 'Add Operation',
  addQuestSheetEyebrow: 'NEW OPERATION',
  hqReturnLabel: 'RETURN TO SAFEHOUSE',
  openQuestBoardLabel: 'OPEN OPERATIONS BOARD ›',
  goToQuestBoardLabel: 'GO TO OPERATIONS BOARD',
  goToQuestBoardHint: 'VIEW SECTOR OPERATIONS',
  mapTitle: 'SIGNAL INTEGRITY',
  mapEmptyMessage: 'No district node data for this saga yet.',
  mapReclaimedTitle: 'Grid stabilized.',
  mapLegend: 'STABILIZED — sector cleared · ROUTING — active node · LOCKED — sealed district',
  worldMapQuickLink: 'DISTRICT NODES',
  storyTitle: 'SECTOR PROGRESS',
  sagaSectorsLabel: 'SAGA SECTORS',
  beginSectorLabel: 'BEGIN SECTOR',
  beginSectorHint: 'VIEW SECTOR OPERATIONS',
  villainStatLabel: 'SURVEILLANCE',
  antagonistTauntBadge: 'MINISTRY INTRUSION',
  antagonistReactionBadge: 'ANTAGONIST SIGNAL',
  allyReactionBadge: 'ALLY UPLINK',
  chapterCompleteStamp: 'SECTOR STABILIZED',
  continueHintNext: 'ADVANCE TO NEXT SECTOR',
  continueHintHome: 'RETURN TO NEON SPIRE',
  stayInSagaHint: 'ADVANCE TO NEXT SECTOR',
  stayInSagaHintHome: 'RETURN TO SAFEHOUSE NODE',
  templateQuestCompleteMessage: 'This operation stabilized the sector.',
  userQuestCompleteMessage: 'Your operation moved the signal forward.',
  viewQuestBoardLabel: 'VIEW ON OPERATIONS BOARD',
  viewQuestBoardHint: 'SEE YOUR OPERATION',
  todaySectorLabel: "TODAY'S SECTOR",
  operationsLeftLabel: 'OPERATIONS LEFT',
  realTaskLabel: 'REAL TASK',
  sagaQuestLabel: 'SAGA OPERATION',
  sectorUnavailableSub: 'Sector unavailable',
  operativeFileEyebrow: 'RUNNER FILE',
  tabHq: 'NODE',
  tabBoard: 'OPS',
  tabMap: 'GRID',
  coreProgressionLabel: 'NETWORK STANDING',
  addQuestTriggerBanner: '+ ADD OPERATION',
  addQuestTriggerSub: 'Turn a real task into an operation',
  addQuestAccessibilityLabel: 'Add Operation',
  addQuestTypeLabel: 'OPERATION TYPE',
  addQuestCreateLabel: 'CREATE OPERATION',
  addQuestCreateHint: 'Add to the Operations Board',
  noActiveChapterTitle: 'No active sector.',
  hudMissionsLabel: 'OPERATIONS',
  questCompleteFallbackLine: 'The grid records what you accomplished.',
  addQuestConfirmOverLimitHint: "Add beyond today's Focus Operations",
  addQuestFocusHintUnder: 'First three operations today become Focus Operations on the board.',
  addQuestFocusHintOver: 'You can still add more — they just won’t be marked as Focus Operations.',
  newQuestAddedStamp: 'NEW OPERATION ADDED',
  addAnotherQuestLabel: 'ADD ANOTHER OPERATION',
  addAnotherQuestHint: 'ADD ANOTHER OPERATION TODAY',
  personalOpsLeftLabel: 'PERSONAL OPS LEFT',
  focusQuestLabel: 'FOCUS OPERATION',
  focusQuestsHeaderLabel: 'FOCUS OPERATIONS',
  focusQuestFullHint: 'Focus Operations full — extra operations still count toward progress.',
  focusQuestOverHint: "Beyond today's Focus Operations — the signal still moves forward.",
  yourQuestLabel: 'YOUR OPERATION',
  noActiveChapterBriefing: 'No active sector',
  noQuestsYetTitle: 'No operations yet.',
  noQuestsYetMessage: "Turn a real task into an operation for today's sector.",
  addQuestButtonLabel: 'ADD OPERATION',
  chapterTemplatesClearedContinueMessage: 'Continue the saga from Safehouse Node.',
  noActiveChapterEmptyMessage:
    'This saga has no active sector right now. Restore the default saga to pick up where the signal begins.',
  restoreDefaultSagaLabel: 'Restore Default Saga',
  lockedSectorMessage: 'Complete previous sectors to unlock.',
  lockedSectorCardMessage: 'Complete previous sectors to unlock this node.',
  villainLabel: 'ANTAGONIST',
  weeklyRecapQuietHint:
    'No operations cleared yet this week — the grid waits for your first signal.',
  weeklyRecapSectorsLabel: 'SECTORS',
  sagaSwitcherEmptyMessage:
    'Complete Ghost Protocol to unlock more sagas across the Neon Spire network.',
  sagaCompleteTitle: 'Saga complete.',
  noChaptersTitle: 'No sectors available.',
  noChaptersMessage:
    "doesn't have playable sectors yet. Switch to an unlocked saga or restore the default saga.",
  viewStoryTrailLabel: 'VIEW SECTOR TRAIL',
  unlockRewardsEmptyMessage: 'Complete sectors to earn badges, titles, and story unlocks.',
};

const NEON_ASHES_UI: Omit<
  UniverseUiCopy,
  | 'hqTitle'
  | 'mapEyebrow'
  | 'addQuestSubtitle'
  | 'mapProgressHint'
  | 'mapReclaimedMessage'
  | 'sagaCompleteMessage'
  | 'activeSectorProgressSub'
  | 'sectorsClearedLabel'
  | 'sectorIntroLabel'
  | 'sectorEyebrow'
  | 'activeSectorLine'
  | 'villainInfluenceLabel'
  | 'todaySectorLine'
  | 'sectorRef'
  | 'territoryStatusLabel'
  | 'villainMeterStatus'
  | 'sagaProgressMeta'
  | 'hqChapterEyebrow'
  | 'focusQuestSlotsHint'
> = {
  questBoardEyebrow: 'CASE BOARD',
  questBoardTitle: 'ACTIVE LEADS',
  reputationLabel: 'DETECTIVE STANDING',
  templateQuestLabel: 'LEAD',
  templateQuestClearedLabel: 'LEAD CLOSED',
  userQuestClearedLabel: 'LEAD CLOSED',
  userQuestsLabel: 'YOUR LEADS',
  chapterTemplatesLabel: 'CASE LEADS',
  chapterTemplatesClearedTitle: 'Case leads cleared.',
  questsBoardHint: 'Complete leads to advance the case. Tap to mark done.',
  addQuestSheetTitle: 'Add Lead',
  addQuestSheetEyebrow: 'NEW LEAD',
  hqReturnLabel: 'RETURN TO OFFICE',
  openQuestBoardLabel: 'OPEN CASE BOARD ›',
  goToQuestBoardLabel: 'GO TO CASE BOARD',
  goToQuestBoardHint: 'VIEW CASE LEADS',
  mapTitle: 'CASE INTEGRITY',
  mapEmptyMessage: 'No case board data for this saga yet.',
  mapReclaimedTitle: 'Case advanced.',
  mapLegend: 'SOLVED — case advanced · ACTIVE — open lead · COLD — sealed location',
  worldMapQuickLink: 'CASE BOARD',
  storyTitle: 'CASE PROGRESS',
  sagaSectorsLabel: 'SAGA CASES',
  beginSectorLabel: 'BEGIN CASE',
  beginSectorHint: 'VIEW CASE LEADS',
  villainStatLabel: 'INFLUENCE',
  antagonistTauntBadge: 'SYNDICATE PRESSURE',
  antagonistReactionBadge: 'ANTAGONIST SIGNAL',
  allyReactionBadge: 'ALLY REPORT',
  chapterCompleteStamp: 'CASE ADVANCED',
  continueHintNext: 'ADVANCE TO NEXT CASE',
  continueHintHome: 'RETURN TO GRAYHAVEN',
  stayInSagaHint: 'ADVANCE TO NEXT CASE',
  stayInSagaHintHome: 'RETURN TO THE OFFICE',
  templateQuestCompleteMessage: 'This lead advanced the case.',
  userQuestCompleteMessage: 'Your lead moved the investigation forward.',
  viewQuestBoardLabel: 'VIEW ON CASE BOARD',
  viewQuestBoardHint: 'SEE YOUR LEAD',
  todaySectorLabel: "TODAY'S CASE",
  operationsLeftLabel: 'LEADS LEFT',
  realTaskLabel: 'REAL TASK',
  sagaQuestLabel: 'SAGA LEAD',
  sectorUnavailableSub: 'Case unavailable',
  operativeFileEyebrow: 'DETECTIVE FILE',
  tabHq: 'OFFICE',
  tabBoard: 'LEADS',
  tabMap: 'BOARD',
  coreProgressionLabel: 'DETECTIVE STANDING',
  addQuestTriggerBanner: '+ ADD LEAD',
  addQuestTriggerSub: 'Turn a real task into a lead',
  addQuestAccessibilityLabel: 'Add Lead',
  addQuestTypeLabel: 'LEAD TYPE',
  addQuestCreateLabel: 'CREATE LEAD',
  addQuestCreateHint: 'Add to the Case Board',
  noActiveChapterTitle: 'No active case.',
  hudMissionsLabel: 'LEADS',
  questCompleteFallbackLine: 'Grayhaven remembers what you accomplished.',
  addQuestConfirmOverLimitHint: "Add beyond today's Focus Leads",
  addQuestFocusHintUnder: 'First three leads today become Focus Leads on the board.',
  addQuestFocusHintOver: 'You can still add more — they just won’t be marked as Focus Leads.',
  newQuestAddedStamp: 'NEW LEAD ADDED',
  addAnotherQuestLabel: 'ADD ANOTHER LEAD',
  addAnotherQuestHint: 'ADD ANOTHER LEAD TODAY',
  personalOpsLeftLabel: 'PERSONAL LEADS LEFT',
  focusQuestLabel: 'FOCUS LEAD',
  focusQuestsHeaderLabel: 'FOCUS LEADS',
  focusQuestFullHint: 'Focus Leads full — extra leads still count toward progress.',
  focusQuestOverHint: "Beyond today's Focus Leads — the case still moves forward.",
  yourQuestLabel: 'YOUR LEAD',
  noActiveChapterBriefing: 'No active case',
  noQuestsYetTitle: 'No leads yet.',
  noQuestsYetMessage: "Turn a real task into a lead for today's case.",
  addQuestButtonLabel: 'ADD LEAD',
  chapterTemplatesClearedContinueMessage: 'Continue the saga from the office.',
  noActiveChapterEmptyMessage:
    'This saga has no active case right now. Restore the default saga to pick up where the file begins.',
  restoreDefaultSagaLabel: 'Restore Default Saga',
  lockedSectorMessage: 'Complete previous cases to unlock.',
  lockedSectorCardMessage: 'Complete previous cases to unlock this location.',
  villainLabel: 'ANTAGONIST',
  weeklyRecapQuietHint:
    'No leads cleared yet this week — Grayhaven waits for your first move.',
  weeklyRecapSectorsLabel: 'CASES',
  sagaSwitcherEmptyMessage:
    'Complete Hollow Syndicate to unlock more sagas across Grayhaven.',
  sagaCompleteTitle: 'Saga complete.',
  noChaptersTitle: 'No cases available.',
  noChaptersMessage:
    "doesn't have playable cases yet. Switch to an unlocked saga or restore the default saga.",
  viewStoryTrailLabel: 'VIEW CASE TRAIL',
  unlockRewardsEmptyMessage: 'Complete cases to earn badges, titles, and story unlocks.',
};

function dustTerritoryStatusLabel(status: ChapterStatus): string {
  switch (status) {
    case 'completed':
      return 'RECLAIMED';
    case 'active':
      return 'ACTIVE FRONT';
    case 'locked':
      return 'THREATENED';
  }
}

function neuroTerritoryStatusLabel(status: ChapterStatus): string {
  switch (status) {
    case 'completed':
      return 'STABILIZED';
    case 'active':
      return 'ROUTING';
    case 'locked':
      return 'LOCKED';
  }
}

function noirTerritoryStatusLabel(status: ChapterStatus): string {
  switch (status) {
    case 'completed':
      return 'SOLVED';
    case 'active':
      return 'ACTIVE';
    case 'locked':
      return 'COLD';
  }
}

function buildDustAndIronCopy(universe: Universe): UniverseUiCopy {
  return {
    ...DUST_AND_IRON_UI,
    chapterCompleteStamp: universe.terminology.chapterCompleteTerm.toUpperCase(),
    hqTitle: (locationName) => `${locationName} HQ`,
    mapEyebrow: (universeName) => `${universeName.toUpperCase()} · TERRITORY MAP`,
    addQuestSubtitle: (chapterTitle) =>
      chapterTitle
        ? `Turn a real task into a quest for ${chapterTitle}.`
        : 'Turn a real task into a frontier quest.',
    mapProgressHint: (cleared, total, locationName) =>
      `${cleared}/${total} territories reclaimed. Your discipline reshapes ${locationName}.`,
    mapReclaimedMessage: (sagaTitle) =>
      `Every frontier on the ${sagaTitle} map flies your colors. Collect your spoils or ride a new trail.`,
    sagaCompleteMessage: (sagaTitle) =>
      `You rode every chapter of ${sagaTitle}. The trail ends here — for now. Choose your next saga.`,
    activeSectorProgressSub: (order) => `Ch. ${order} progress`,
    todaySectorLine: (order, title) => `Ch. ${order} — ${title}`,
    sectorsClearedLabel: (cleared, total) => `${cleared}/${total} CHAPTERS CLEARED`,
    sectorIntroLabel: (order, title) => `CHAPTER ${order} · ${title.toUpperCase()}`,
    sectorEyebrow: (order) => `CHAPTER ${order}`,
    activeSectorLine: (title) => `Now riding through: ${title}`,
    villainInfluenceLabel: (villainName) => `${villainName} · INFLUENCE`,
    continueHintHome: `RETURN TO ${universe.locationName.toUpperCase()}`,
    sectorRef: (order, title) => `Chapter ${order} · ${title}`,
    focusQuestSlotsHint: (remaining) =>
      `${remaining} Focus Quest ${remaining === 1 ? 'slot' : 'slots'} left today.`,
    territoryStatusLabel: dustTerritoryStatusLabel,
    villainMeterStatus: (level) =>
      level === 'high' ? 'CRITICAL THREAT' : level === 'mid' ? 'HOLDING GROUND' : 'RETREATING',
    sagaProgressMeta: (completed, total, activeTitle) =>
      `${completed}/${total} chapters cleared${activeTitle ? ` · riding ${activeTitle}` : ''}`,
    hqChapterEyebrow: (sagaTitle, order) =>
      order ? `${sagaTitle.toUpperCase()} · CH ${order}` : sagaTitle.toUpperCase(),
  };
}

function buildNeuroNetCopy(universe: Universe): UniverseUiCopy {
  return {
    ...NEURONET_UI,
    chapterCompleteStamp: universe.terminology.chapterCompleteTerm.toUpperCase(),
    hqTitle: (locationName) => `${locationName} · Safehouse Node`,
    mapEyebrow: (universeName) => `${universeName.toUpperCase()} · ${universe.terminology.mapTerm.toUpperCase()}`,
    addQuestSubtitle: (chapterTitle) =>
      chapterTitle
        ? `Turn a real task into an operation for ${chapterTitle}.`
        : 'Turn a real task into a Neon Spire operation.',
    mapProgressHint: (cleared, total, locationName) =>
      `${cleared}/${total} district nodes stabilized. Your signal integrity reshapes ${locationName}.`,
    mapReclaimedMessage: (sagaTitle) =>
      `Every district node on ${sagaTitle} runs clean. Collect your rewards or route a new saga.`,
    sagaCompleteMessage: (sagaTitle) =>
      `You stabilized every sector of ${sagaTitle}. The grid holds — for now. Choose your next saga.`,
    activeSectorProgressSub: (order) => `Sector ${order} progress`,
    todaySectorLine: (order, title) => `Sector ${order} — ${title}`,
    sectorsClearedLabel: (cleared, total) => `${cleared}/${total} SECTORS STABILIZED`,
    sectorIntroLabel: (order, title) => `SECTOR ${order} · ${title.toUpperCase()}`,
    sectorEyebrow: (order) => `SECTOR ${order}`,
    activeSectorLine: (title) => `Now routing through: ${title}`,
    villainInfluenceLabel: (villainName) => `${villainName} · SURVEILLANCE`,
    continueHintHome: `RETURN TO ${universe.locationName.toUpperCase()}`,
    sectorRef: (order, title) => `Sector ${order} · ${title}`,
    focusQuestSlotsHint: (remaining) =>
      `${remaining} Focus Operation ${remaining === 1 ? 'slot' : 'slots'} left today.`,
    territoryStatusLabel: neuroTerritoryStatusLabel,
    villainMeterStatus: (level) =>
      level === 'high' ? 'CRITICAL OVERLOAD' : level === 'mid' ? 'SIGNAL CONTESTED' : 'SIGNAL FADING',
    sagaProgressMeta: (completed, total, activeTitle) =>
      `${completed}/${total} sectors stabilized${activeTitle ? ` · routing ${activeTitle}` : ''}`,
    hqChapterEyebrow: (sagaTitle, order) =>
      order ? `${sagaTitle.toUpperCase()} · SECTOR ${order}` : sagaTitle.toUpperCase(),
  };
}

function buildNeonAshesCopy(universe: Universe): UniverseUiCopy {
  return {
    ...NEON_ASHES_UI,
    chapterCompleteStamp: universe.terminology.chapterCompleteTerm.toUpperCase(),
    hqTitle: (locationName) => `${locationName} · Detective Office`,
    mapEyebrow: (universeName) => `${universeName.toUpperCase()} · ${universe.terminology.mapTerm.toUpperCase()}`,
    addQuestSubtitle: (chapterTitle) =>
      chapterTitle
        ? `Turn a real task into a lead for ${chapterTitle}.`
        : 'Turn a real task into a Grayhaven lead.',
    mapProgressHint: (cleared, total, locationName) =>
      `${cleared}/${total} locations solved. Your Case Integrity reshapes ${locationName}.`,
    mapReclaimedMessage: (sagaTitle) =>
      `Every location on ${sagaTitle} runs clean. Collect your rewards or open a new case.`,
    sagaCompleteMessage: (sagaTitle) =>
      `You advanced every case of ${sagaTitle}. The file closes — for now. Choose your next saga.`,
    activeSectorProgressSub: (order) => `Case ${order} progress`,
    todaySectorLine: (order, title) => `Case ${order} — ${title}`,
    sectorsClearedLabel: (cleared, total) => `${cleared}/${total} CASES ADVANCED`,
    sectorIntroLabel: (order, title) => `CASE ${order} · ${title.toUpperCase()}`,
    sectorEyebrow: (order) => `CASE ${order}`,
    activeSectorLine: (title) => `Now investigating: ${title}`,
    villainInfluenceLabel: (villainName) => `${villainName} · INFLUENCE`,
    continueHintHome: `RETURN TO ${universe.locationName.toUpperCase()}`,
    sectorRef: (order, title) => `Case ${order} · ${title}`,
    focusQuestSlotsHint: (remaining) =>
      `${remaining} Focus Lead ${remaining === 1 ? 'slot' : 'slots'} left today.`,
    territoryStatusLabel: noirTerritoryStatusLabel,
    villainMeterStatus: (level) =>
      level === 'high' ? 'CRITICAL PRESSURE' : level === 'mid' ? 'CASE CONTESTED' : 'INFLUENCE FADING',
    sagaProgressMeta: (completed, total, activeTitle) =>
      `${completed}/${total} cases advanced${activeTitle ? ` · investigating ${activeTitle}` : ''}`,
    hqChapterEyebrow: (sagaTitle, order) =>
      order ? `${sagaTitle.toUpperCase()} · CASE ${order}` : sagaTitle.toUpperCase(),
  };
}

export function getUniverseUiCopy(universe: Universe): UniverseUiCopy {
  if (universe.id === 'neuronet') {
    return buildNeuroNetCopy(universe);
  }
  if (universe.id === 'neon-ashes') {
    return buildNeonAshesCopy(universe);
  }
  return buildDustAndIronCopy(universe);
}

export function useUniverseUiCopy(): UniverseUiCopy {
  const { activeUniverse } = useGame();
  return useMemo(() => getUniverseUiCopy(activeUniverse), [activeUniverse]);
}

export function getUniverseTabMeta(universeId: string): Record<string, { label: string; icon: string }> {
  if (universeId === 'neuronet') {
    return {
      hq: { label: 'NODE', icon: '◈' },
      quests: { label: 'OPS', icon: '⬡' },
      story: { label: 'STORY', icon: '📡' },
      map: { label: 'GRID', icon: '◎' },
      profile: { label: 'PROFILE', icon: '★' },
    };
  }

  if (universeId === 'neon-ashes') {
    return {
      hq: { label: 'OFFICE', icon: '◆' },
      quests: { label: 'LEADS', icon: '▪' },
      story: { label: 'CASES', icon: '📁' },
      map: { label: 'BOARD', icon: '◎' },
      profile: { label: 'PROFILE', icon: '★' },
    };
  }

  return {
    hq: { label: 'HQ', icon: '⌂' },
    quests: { label: 'BOARD', icon: '⚔' },
    story: { label: 'STORY', icon: '📜' },
    map: { label: 'MAP', icon: '◎' },
    profile: { label: 'PROFILE', icon: '★' },
  };
}
