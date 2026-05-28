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
  questsBoardHint: 'Tap to complete bounties and quests. Advance the chapter.',
  addQuestSheetTitle: 'Add Quest',
  addQuestSheetEyebrow: 'NEW QUEST',
  hqReturnLabel: 'RETURN TO HQ',
  openQuestBoardLabel: 'OPEN QUEST BOARD ›',
  goToQuestBoardLabel: 'GO TO QUEST BOARD',
  goToQuestBoardHint: 'VIEW BOUNTIES & QUESTS',
  mapTitle: 'FRONTIER PROGRESS',
  mapEmptyMessage: 'No territory data for this saga yet.',
  mapReclaimedTitle: 'Territory reclaimed.',
  mapLegend: 'RECLAIMED · cleared · ACTIVE · current · THREAT · locked',
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
  templateQuestCompleteMessage: 'This bounty moved the chapter forward.',
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
  addQuestConfirmOverLimitHint: 'ADD BEYOND FOCUS QUESTS',
  addQuestFocusHintUnder: 'First three quests today become Focus Quests.',
  addQuestFocusHintOver: 'You can add more — they won\'t be Focus Quests.',
  newQuestAddedStamp: 'NEW QUEST ADDED',
  addAnotherQuestLabel: 'ADD ANOTHER QUEST',
  addAnotherQuestHint: 'ADD ONE MORE TODAY',
  personalOpsLeftLabel: 'QUESTS LEFT',
  focusQuestLabel: 'FOCUS QUEST',
  focusQuestsHeaderLabel: 'FOCUS QUESTS',
  focusQuestFullHint: 'Focus slots full. Extra quests still count.',
  focusQuestOverHint: 'Beyond today\'s Focus — the story still moves.',
  yourQuestLabel: 'YOUR QUEST',
  noActiveChapterBriefing: 'No active chapter',
  noQuestsYetTitle: 'No quests yet.',
  noQuestsYetMessage: 'Add a real task as a quest for today\'s chapter.',
  addQuestButtonLabel: 'ADD QUEST',
  chapterTemplatesClearedContinueMessage: 'Continue from HQ.',
  noActiveChapterEmptyMessage:
    'No active chapter. Restore the default saga to rejoin the trail.',
  restoreDefaultSagaLabel: 'Restore Default Saga',
  lockedSectorMessage: 'Clear earlier chapters to unlock.',
  lockedSectorCardMessage: 'Clear earlier chapters to unlock this trail.',
  villainLabel: 'VILLAIN',
  weeklyRecapQuietHint: 'Quiet week on the frontier. Make your first move.',
  weeklyRecapSectorsLabel: 'CHAPTERS',
  sagaSwitcherEmptyMessage: 'Finish Vulture Gang to unlock more sagas in Dustfall.',
  sagaCompleteTitle: 'Saga complete.',
  noChaptersTitle: 'No chapters yet.',
  noChaptersMessage: 'has no playable chapters yet. Switch saga or restore the default.',
  viewStoryTrailLabel: 'VIEW STORY TRAIL',
  unlockRewardsEmptyMessage: 'Clear chapters to earn badges, titles, and story unlocks.',
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
  questsBoardHint: 'Tap to complete operations. Stabilize the sector.',
  addQuestSheetTitle: 'Add Operation',
  addQuestSheetEyebrow: 'NEW OPERATION',
  hqReturnLabel: 'RETURN TO SAFEHOUSE',
  openQuestBoardLabel: 'OPEN OPERATIONS BOARD ›',
  goToQuestBoardLabel: 'GO TO OPERATIONS BOARD',
  goToQuestBoardHint: 'VIEW SECTOR OPERATIONS',
  mapTitle: 'SIGNAL INTEGRITY',
  mapEmptyMessage: 'No district node data for this saga yet.',
  mapReclaimedTitle: 'Grid stabilized.',
  mapLegend: 'STABILIZED · cleared · ROUTING · active · LOCKED · sealed',
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
  addQuestConfirmOverLimitHint: 'ADD BEYOND FOCUS OPERATIONS',
  addQuestFocusHintUnder: 'First three operations today become Focus Operations.',
  addQuestFocusHintOver: 'You can add more — they won\'t be Focus Operations.',
  newQuestAddedStamp: 'NEW OPERATION ADDED',
  addAnotherQuestLabel: 'ADD ANOTHER OPERATION',
  addAnotherQuestHint: 'ADD ONE MORE TODAY',
  personalOpsLeftLabel: 'PERSONAL OPS LEFT',
  focusQuestLabel: 'FOCUS OPERATION',
  focusQuestsHeaderLabel: 'FOCUS OPERATIONS',
  focusQuestFullHint: 'Focus slots full. Extra operations still count.',
  focusQuestOverHint: 'Beyond today\'s Focus — the signal still moves.',
  yourQuestLabel: 'YOUR OPERATION',
  noActiveChapterBriefing: 'No active sector',
  noQuestsYetTitle: 'No operations yet.',
  noQuestsYetMessage: 'Add a real task as an operation for today\'s sector.',
  addQuestButtonLabel: 'ADD OPERATION',
  chapterTemplatesClearedContinueMessage: 'Continue from Safehouse Node.',
  noActiveChapterEmptyMessage:
    'No active sector. Restore the default saga to rejoin the signal.',
  restoreDefaultSagaLabel: 'Restore Default Saga',
  lockedSectorMessage: 'Clear earlier sectors to unlock.',
  lockedSectorCardMessage: 'Clear earlier sectors to unlock this node.',
  villainLabel: 'ANTAGONIST',
  weeklyRecapQuietHint: 'Quiet week on the grid. Send your first signal.',
  weeklyRecapSectorsLabel: 'SECTORS',
  sagaSwitcherEmptyMessage: 'Finish Ghost Protocol to unlock more sagas in the Spire.',
  sagaCompleteTitle: 'Saga complete.',
  noChaptersTitle: 'No sectors yet.',
  noChaptersMessage: 'has no playable sectors yet. Switch saga or restore the default.',
  viewStoryTrailLabel: 'VIEW SECTOR TRAIL',
  unlockRewardsEmptyMessage: 'Clear sectors to earn badges, titles, and story unlocks.',
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
  questsBoardHint: 'Tap to complete leads. Advance the case.',
  addQuestSheetTitle: 'Add Lead',
  addQuestSheetEyebrow: 'NEW LEAD',
  hqReturnLabel: 'RETURN TO OFFICE',
  openQuestBoardLabel: 'OPEN CASE BOARD ›',
  goToQuestBoardLabel: 'GO TO CASE BOARD',
  goToQuestBoardHint: 'VIEW CASE LEADS',
  mapTitle: 'CASE INTEGRITY',
  mapEmptyMessage: 'No case board data for this saga yet.',
  mapReclaimedTitle: 'Case advanced.',
  mapLegend: 'SOLVED · advanced · ACTIVE · open · COLD · sealed',
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
  addQuestConfirmOverLimitHint: 'ADD BEYOND FOCUS LEADS',
  addQuestFocusHintUnder: 'First three leads today become Focus Leads.',
  addQuestFocusHintOver: 'You can add more — they won\'t be Focus Leads.',
  newQuestAddedStamp: 'NEW LEAD ADDED',
  addAnotherQuestLabel: 'ADD ANOTHER LEAD',
  addAnotherQuestHint: 'ADD ONE MORE TODAY',
  personalOpsLeftLabel: 'PERSONAL LEADS LEFT',
  focusQuestLabel: 'FOCUS LEAD',
  focusQuestsHeaderLabel: 'FOCUS LEADS',
  focusQuestFullHint: 'Focus slots full. Extra leads still count.',
  focusQuestOverHint: 'Beyond today\'s Focus — the case still moves.',
  yourQuestLabel: 'YOUR LEAD',
  noActiveChapterBriefing: 'No active case',
  noQuestsYetTitle: 'No leads yet.',
  noQuestsYetMessage: 'Add a real task as a lead for today\'s case.',
  addQuestButtonLabel: 'ADD LEAD',
  chapterTemplatesClearedContinueMessage: 'Continue from the office.',
  noActiveChapterEmptyMessage:
    'No active case. Restore the default saga to reopen the file.',
  restoreDefaultSagaLabel: 'Restore Default Saga',
  lockedSectorMessage: 'Clear earlier cases to unlock.',
  lockedSectorCardMessage: 'Clear earlier cases to unlock this location.',
  villainLabel: 'ANTAGONIST',
  weeklyRecapQuietHint: 'Quiet week in Grayhaven. Take your first lead.',
  weeklyRecapSectorsLabel: 'CASES',
  sagaSwitcherEmptyMessage: 'Finish Hollow Syndicate to unlock more sagas in Grayhaven.',
  sagaCompleteTitle: 'Saga complete.',
  noChaptersTitle: 'No cases yet.',
  noChaptersMessage: 'has no playable cases yet. Switch saga or restore the default.',
  viewStoryTrailLabel: 'VIEW CASE TRAIL',
  unlockRewardsEmptyMessage: 'Clear cases to earn badges, titles, and story unlocks.',
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
      `${cleared}/${total} territories reclaimed. Your discipline shapes ${locationName}.`,
    mapReclaimedMessage: (sagaTitle) =>
      `Every territory on ${sagaTitle} is yours. Collect rewards or ride a new trail.`,
    sagaCompleteMessage: (sagaTitle) =>
      `You cleared every chapter of ${sagaTitle}. The trail pauses here — pick your next saga.`,
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
      `${remaining} Focus Quest ${remaining === 1 ? 'slot' : 'slots'} left today`,
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
      `${cleared}/${total} nodes stabilized. Your signal shapes ${locationName}.`,
    mapReclaimedMessage: (sagaTitle) =>
      `Every node on ${sagaTitle} runs clean. Collect rewards or route a new saga.`,
    sagaCompleteMessage: (sagaTitle) =>
      `You stabilized every sector of ${sagaTitle}. The grid holds — pick your next saga.`,
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
      `${remaining} Focus Operation ${remaining === 1 ? 'slot' : 'slots'} left today`,
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
      `${cleared}/${total} locations solved. Your case integrity shapes ${locationName}.`,
    mapReclaimedMessage: (sagaTitle) =>
      `Every location on ${sagaTitle} is closed. Collect rewards or open a new case.`,
    sagaCompleteMessage: (sagaTitle) =>
      `You advanced every case of ${sagaTitle}. The file closes — pick your next saga.`,
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
      `${remaining} Focus Lead ${remaining === 1 ? 'slot' : 'slots'} left today`,
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
