import {
  getLoyalCharacterIdsForSaga,
  getSagaEndingVariants,
} from '@/data/narrative/saga-ending-variants';
import { getTraitForCategory, IDENTITY_TRAIT_META } from '@/lib/identity-votes';
import { isHighRiskQuest } from '@/lib/quest-risk';
import type {
  IdentityTraitKey,
  PlayerProgress,
  QuestSuiteId,
  RelationshipTier,
  ResolvedSagaEnding,
  Saga,
  SagaEndingConditionType,
  SagaEndingRecord,
  SagaEndingVariant,
  TaskCategory,
} from '@/types/narrative';

export type SagaEndingResolveContext = {
  progress: PlayerProgress;
  sagaId: string;
  saga: Saga;
  universeId: string;
};

export type SagaEndingMetrics = {
  categoryCounts: Partial<Record<TaskCategory, number>>;
  suiteCounts: Partial<Record<QuestSuiteId, number>>;
  identityVotesInSaga: Partial<Record<IdentityTraitKey, number>>;
  reputation: number;
  characterTiers: Record<string, RelationshipTier>;
  recoveryDaysInSaga: number;
  mvdRecoveryDays: number;
  highRiskCompletions: number;
  focusCompletions: number;
  totalCompletionsInSaga: number;
};

const RELIABLE_CATEGORIES = new Set<TaskCategory>(['work', 'errand']);
const ORGANIZED_CATEGORIES = new Set<TaskCategory>(['cleaning']);
const RESILIENT_CATEGORIES = new Set<TaskCategory>(['fitness', 'health']);

const RELIABLE_SUITES = new Set<QuestSuiteId>(['business', 'errand']);
const ORGANIZED_SUITES = new Set<QuestSuiteId>(['home']);
const RESILIENT_SUITES = new Set<QuestSuiteId>(['gym', 'wellness']);

const TRAIT_LABEL_TO_KEY = Object.fromEntries(
  (Object.keys(IDENTITY_TRAIT_META) as IdentityTraitKey[]).map((key) => [
    IDENTITY_TRAIT_META[key].label.toLowerCase(),
    key,
  ]),
) as Record<string, IdentityTraitKey>;

const HIGH_TIER: RelationshipTier[] = ['trusted', 'bonded'];

function incrementRecord<T extends string>(
  record: Partial<Record<T, number>>,
  key: T,
): Partial<Record<T, number>> {
  return { ...record, [key]: (record[key] ?? 0) + 1 };
}

function traitKeyFromEvidenceLabel(label: string | undefined): IdentityTraitKey | null {
  if (!label) return null;
  return TRAIT_LABEL_TO_KEY[label.trim().toLowerCase()] ?? null;
}

function sumCategories(
  counts: Partial<Record<TaskCategory, number>>,
  categories: Set<TaskCategory>,
): number {
  return [...categories].reduce((sum, category) => sum + (counts[category] ?? 0), 0);
}

function sumSuites(
  counts: Partial<Record<QuestSuiteId, number>>,
  suites: Set<QuestSuiteId>,
): number {
  return [...suites].reduce((sum, suiteId) => sum + (counts[suiteId] ?? 0), 0);
}

function getTopSagaTrait(
  votes: Partial<Record<IdentityTraitKey, number>>,
  candidates: IdentityTraitKey[],
): IdentityTraitKey | null {
  let top: IdentityTraitKey | null = null;
  let topCount = 0;

  for (const key of candidates) {
    const count = votes[key] ?? 0;
    if (count > topCount) {
      top = key;
      topCount = count;
    }
  }

  return topCount > 0 ? top : null;
}

export function buildSagaEndingMetrics(
  progress: PlayerProgress,
  sagaId: string,
): SagaEndingMetrics {
  let categoryCounts: Partial<Record<TaskCategory, number>> = {};
  let suiteCounts: Partial<Record<QuestSuiteId, number>> = {};
  let identityVotesInSaga: Partial<Record<IdentityTraitKey, number>> = {};
  let highRiskCompletions = 0;
  let focusCompletions = 0;
  let totalCompletionsInSaga = 0;

  for (const event of progress.evidenceLog ?? []) {
    if (event.sagaId !== sagaId) continue;

    totalCompletionsInSaga += 1;
    categoryCounts = incrementRecord(categoryCounts, event.category);

    const traitKey = traitKeyFromEvidenceLabel(event.identityTraitGained);
    if (traitKey) {
      identityVotesInSaga = incrementRecord(identityVotesInSaga, traitKey);
    }
  }

  for (const quest of progress.userQuests ?? []) {
    if (!quest.isCompleted || quest.sourceSagaId !== sagaId) continue;

    totalCompletionsInSaga += 1;
    categoryCounts = incrementRecord(categoryCounts, quest.category);

    if (quest.suiteId) {
      suiteCounts = incrementRecord(suiteCounts, quest.suiteId);
    }

    identityVotesInSaga = incrementRecord(
      identityVotesInSaga,
      getTraitForCategory(quest.category),
    );

    if (isHighRiskQuest(quest.riskLevel)) {
      highRiskCompletions += 1;
    }

    if (quest.focusPinned || quest.focusStartedAt) {
      focusCompletions += 1;
    }
  }

  const templateCompleted = progress.completedQuestIdsBySagaId[sagaId]?.length ?? 0;
  totalCompletionsInSaga = Math.max(totalCompletionsInSaga, templateCompleted);

  const characterTiers: Record<string, RelationshipTier> = {
    ...(progress.relationshipByCharacter ?? {}),
  };

  const sagaEvidenceDates = new Set(
    (progress.evidenceLog ?? [])
      .filter((event) => event.sagaId === sagaId)
      .map((event) => event.date),
  );

  const recoveryDaysInSaga = (progress.recoveryQuestCompletedDates ?? []).filter((date) =>
    sagaEvidenceDates.has(date),
  ).length;

  let mvdRecoveryDays = 0;
  for (const [date] of Object.entries(progress.minimumViableDayByDate ?? {})) {
    const activity = progress.activityByDate?.[date];
    const completedOnDay = (activity?.questsCompleted ?? 0) > 0;
    const sagaActivityOnDay = (progress.evidenceLog ?? []).some(
      (event) => event.sagaId === sagaId && event.date === date,
    );
    if (completedOnDay && sagaActivityOnDay) {
      mvdRecoveryDays += 1;
    }
  }

  return {
    categoryCounts,
    suiteCounts,
    identityVotesInSaga,
    reputation: progress.reputation ?? 0,
    characterTiers,
    recoveryDaysInSaga,
    mvdRecoveryDays,
    highRiskCompletions,
    focusCompletions,
    totalCompletionsInSaga,
  };
}

function matchesCondition(
  conditionType: SagaEndingConditionType,
  metrics: SagaEndingMetrics,
  sagaId: string,
): boolean {
  switch (conditionType) {
    case 'default':
      return true;
    case 'reliable': {
      const categoryScore = sumCategories(metrics.categoryCounts, RELIABLE_CATEGORIES);
      const suiteScore = sumSuites(metrics.suiteCounts, RELIABLE_SUITES);
      const topTrait = getTopSagaTrait(metrics.identityVotesInSaga, ['reliable', 'organized', 'resilient']);
      return categoryScore >= 3 || suiteScore >= 3 || topTrait === 'reliable';
    }
    case 'organized': {
      const categoryScore = sumCategories(metrics.categoryCounts, ORGANIZED_CATEGORIES);
      const suiteScore = sumSuites(metrics.suiteCounts, ORGANIZED_SUITES);
      const topTrait = getTopSagaTrait(metrics.identityVotesInSaga, ['reliable', 'organized', 'resilient']);
      return categoryScore >= 3 || suiteScore >= 3 || topTrait === 'organized';
    }
    case 'resilient': {
      const categoryScore = sumCategories(metrics.categoryCounts, RESILIENT_CATEGORIES);
      const suiteScore = sumSuites(metrics.suiteCounts, RESILIENT_SUITES);
      const topTrait = getTopSagaTrait(metrics.identityVotesInSaga, ['reliable', 'organized', 'resilient']);
      return categoryScore >= 3 || suiteScore >= 3 || topTrait === 'resilient';
    }
    case 'loyal': {
      const loyalIds = getLoyalCharacterIdsForSaga(sagaId);
      return loyalIds.some((characterId) => {
        const tier = metrics.characterTiers[characterId];
        return tier ? HIGH_TIER.includes(tier) : false;
      });
    }
    case 'high-noon':
      return (
        metrics.reputation >= 20 &&
        metrics.highRiskCompletions >= 2 &&
        metrics.focusCompletions >= 2
      );
    case 'recovery':
      return metrics.recoveryDaysInSaga >= 1 || metrics.mvdRecoveryDays >= 1;
    default:
      return false;
  }
}

export function resolveSagaEndingVariant(context: SagaEndingResolveContext): ResolvedSagaEnding | null {
  const variants = getSagaEndingVariants(context.sagaId);
  if (variants.length === 0) return null;

  const metrics = buildSagaEndingMetrics(context.progress, context.sagaId);

  const matched = variants
    .filter((variant) => matchesCondition(variant.conditionType, metrics, context.sagaId))
    .sort((left, right) => right.priority - left.priority);

  const winner = matched[0] ?? variants.find((variant) => variant.conditionType === 'default');
  if (!winner) return null;

  return toResolvedSagaEnding(winner);
}

export function toResolvedSagaEnding(variant: SagaEndingVariant): ResolvedSagaEnding {
  return {
    endingVariantId: variant.id,
    label: variant.label,
    title: variant.title,
    summary: variant.summary,
    dialogueOverride: variant.dialogueOverride,
    rewardFlavorLine: variant.rewardFlavorLine,
    universeFlavorLine: variant.universeFlavorLine,
  };
}

export function isSagaFinaleChapter(saga: Saga, chapterOrder: number): boolean {
  if (saga.chapters.length === 0) return false;
  const maxOrder = Math.max(...saga.chapters.map((chapter) => chapter.order));
  return chapterOrder >= maxOrder;
}

export function getSagaEndingRecord(
  progress: Pick<PlayerProgress, 'sagaEndingsBySagaId'>,
  sagaId: string,
): SagaEndingRecord | null {
  return progress.sagaEndingsBySagaId?.[sagaId] ?? null;
}

export function recordSagaEnding(
  progress: PlayerProgress,
  sagaId: string,
  ending: ResolvedSagaEnding,
  earnedAt: string = new Date().toISOString(),
): PlayerProgress {
  if (progress.sagaEndingsBySagaId?.[sagaId]) return progress;

  return {
    ...progress,
    sagaEndingsBySagaId: {
      ...(progress.sagaEndingsBySagaId ?? {}),
      [sagaId]: {
        endingVariantId: ending.endingVariantId,
        earnedAt,
        title: ending.title,
        summary: ending.summary,
        label: ending.label,
      },
    },
  };
}

export function sanitizeSagaEndingsBySagaId(raw: unknown): PlayerProgress['sagaEndingsBySagaId'] {
  if (!raw || typeof raw !== 'object') return {};

  const result: PlayerProgress['sagaEndingsBySagaId'] = {};

  for (const [sagaId, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof sagaId !== 'string' || sagaId.length === 0) continue;
    if (!value || typeof value !== 'object') continue;

    const entry = value as Record<string, unknown>;
    if (typeof entry.endingVariantId !== 'string' || entry.endingVariantId.length === 0) continue;
    if (typeof entry.title !== 'string' || entry.title.length === 0) continue;
    if (typeof entry.summary !== 'string' || entry.summary.length === 0) continue;

    const earnedAt =
      typeof entry.earnedAt === 'string' && entry.earnedAt.length > 0
        ? entry.earnedAt
        : new Date().toISOString();

    result[sagaId] = {
      endingVariantId: entry.endingVariantId,
      earnedAt,
      title: entry.title,
      summary: entry.summary,
      label: typeof entry.label === 'string' ? entry.label : undefined,
    };
  }

  return result;
}

export function listSagaEndingRecordsForUniverse(
  progress: PlayerProgress,
  universe: { sagas: Saga[] },
): Array<{ sagaId: string; sagaTitle: string; record: SagaEndingRecord }> {
  return universe.sagas
    .map((saga) => {
      const record = getSagaEndingRecord(progress, saga.id);
      if (!record) return null;
      return { sagaId: saga.id, sagaTitle: saga.title, record };
    })
    .filter((entry): entry is { sagaId: string; sagaTitle: string; record: SagaEndingRecord } => entry !== null);
}
