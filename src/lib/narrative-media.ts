import type { ImageSourcePropType } from 'react-native';

import { DUST_AND_IRON_MEDIA_ASSETS } from '@/constants/narrative-media/dust-and-iron';
import { NEURONET_MEDIA_ASSETS } from '@/constants/narrative-media/neuronet';
import type {
  Chapter,
  ChapterReward,
  CharacterPortraitContext,
  CharacterPortraitExpression,
  DialogueBeat,
  NarrativeCharacter,
  Saga,
  Universe,
} from '@/types/narrative';

const ALL_MEDIA_ASSETS: Record<string, ImageSourcePropType> = {
  ...DUST_AND_IRON_MEDIA_ASSETS,
  ...NEURONET_MEDIA_ASSETS,
};

const UNIVERSE_MOOD_BY_ID: Record<string, string> = {
  'dust-and-iron': 'dust-and-iron.mood',
  neuronet: 'neuronet.mood',
};

const SAGA_BANNER_BY_ID: Record<string, string> = {
  'vulture-gang': 'dust-and-iron.saga.vulture-gang-banner',
  'iron-railway-company': 'dust-and-iron.saga.iron-railway-company-banner',
  'honest-businessman': 'dust-and-iron.saga.honest-businessman-banner',
  'ghost-protocol': 'neuronet.saga.ghost-protocol-banner',
  'zenith-corporation': 'neuronet.saga.zenith-corporation-banner',
  'neon-delivery': 'neuronet.saga.neon-delivery-banner',
};

const SAGA_DETAIL_BY_ID: Record<string, string> = {
  'iron-railway-company': 'dust-and-iron.saga.iron-railway-office',
  'honest-businessman': 'dust-and-iron.saga.honest-businessman-office',
};

const CHAPTER_SCENE_BY_ID: Record<string, string> = {
  'first-warning': 'dust-and-iron.chapter.01-dustfall-gate',
  'smoke-at-dawn': 'dust-and-iron.chapter.02-burnt-warehouse',
  'broken-wagon': 'dust-and-iron.chapter.03-broken-wagon-trail',
  'night-ambush': 'dust-and-iron.chapter.04-ambush-canyon',
  'high-noon': 'dust-and-iron.chapter.05-high-noon-square',
  'first-shipment': 'dust-and-iron.chapter.iron-railway.01-railyard-gate',
  'delayed-cargo': 'dust-and-iron.chapter.iron-railway.02-cargo-hold-six',
  'broken-tracks': 'dust-and-iron.chapter.iron-railway.03-broken-tracks-pass',
  'freight-war': 'dust-and-iron.chapter.iron-railway.04-freight-war-junction',
  'golden-route': 'dust-and-iron.chapter.iron-railway.05-golden-route-terminal',
  'signal-leak': 'neuronet.chapter.ghost-protocol.01-signal-leak',
  'blackline-drop': 'neuronet.chapter.ghost-protocol.02-blackline-drop',
  'memory-shard': 'neuronet.chapter.ghost-protocol.03-memory-shard',
  'ghost-sector': 'neuronet.chapter.ghost-protocol.04-ghost-sector',
  'cains-mirror': 'neuronet.chapter.ghost-protocol.05-cains-mirror',
  'first-login': 'neuronet.chapter.zenith-corporation.01-first-login',
  'metrics-review': 'neuronet.chapter.zenith-corporation.02-metrics-review',
  'compliance-floor': 'neuronet.chapter.zenith-corporation.03-compliance-floor',
  'productivity-purge': 'neuronet.chapter.zenith-corporation.04-productivity-purge',
  'the-helix-report': 'neuronet.chapter.zenith-corporation.05-the-helix-report',
  'first-route': 'neuronet.chapter.neon-delivery.01-first-route',
  'rainline-package': 'neuronet.chapter.neon-delivery.02-rainline-package',
  'stolen-coordinates': 'neuronet.chapter.neon-delivery.03-stolen-coordinates',
  'jackal-run': 'neuronet.chapter.neon-delivery.04-jackal-run',
  'final-delivery': 'neuronet.chapter.neon-delivery.05-final-delivery',
};

const REWARD_IMAGE_BY_ID: Record<string, string> = {
  'first-warning-badge': 'dust-and-iron.reward.first-dustfall-patrol',
  'smoke-at-dawn-title': 'dust-and-iron.reward.smoke-watcher',
  'broken-wagon-cosmetic': 'dust-and-iron.reward.railway-bandana',
  'night-ambush-badge': 'dust-and-iron.reward.ambush-survivor',
  'high-noon-story-unlock': 'dust-and-iron.reward.iron-railway-unlock',
  'first-shipment-badge': 'dust-and-iron.reward.iron-railway.railyard-access-pass',
  'delayed-cargo-title': 'dust-and-iron.reward.iron-railway.cargo-ledger-seal',
  'broken-tracks-cosmetic': 'dust-and-iron.reward.iron-railway.track-repair-kit',
  'freight-war-badge': 'dust-and-iron.reward.iron-railway.route-marshal-badge',
  'golden-route-title': 'dust-and-iron.reward.iron-railway.golden-route-charter',
  'honest-businessman-story-unlock': 'dust-and-iron.reward.honest-businessman.silver-contract',
  'signal-carrier-badge': 'neuronet.reward.signal-carrier-badge',
  'blackline-runner-title': 'neuronet.reward.blackline-runner-title',
  'ghost-patch-cosmetic': 'neuronet.reward.ghost-patch-cosmetic',
  'sector-phantom-badge': 'neuronet.reward.sector-phantom-badge',
  'zenith-corporation-story-unlock': 'neuronet.reward.zenith-corporation-story-unlock',
  'first-login-badge': 'neuronet.reward.first-login-badge',
  'metric-analyst-title': 'neuronet.reward.metric-analyst-title',
  'chrome-access-card-cosmetic': 'neuronet.reward.chrome-access-card-cosmetic',
  'compliance-breaker-badge': 'neuronet.reward.compliance-breaker-badge',
  'neon-delivery-story-unlock': 'neuronet.reward.neon-delivery-story-unlock',
  'first-route-cleared-badge': 'neuronet.reward.first-route-cleared-badge',
  'rainline-courier-title': 'neuronet.reward.rainline-courier-title',
  'neon-rider-patch-cosmetic': 'neuronet.reward.neon-rider-patch-cosmetic',
  'jackal-survivor-badge': 'neuronet.reward.jackal-survivor-badge',
  'final-runner-title': 'neuronet.reward.final-runner-title',
};

const CHARACTER_NEUTRAL_PORTRAIT_BY_ID: Record<string, string> = {
  'ada-mercer': 'dust-and-iron.character.ada-mercer-neutral',
  'elias-crow': 'dust-and-iron.character.elias-crow-neutral',
  'station-master-briggs': 'dust-and-iron.character.station-master-briggs-neutral',
  'silas-vane': 'dust-and-iron.character.silas-vane-neutral',
  'victor-crane': 'dust-and-iron.character.victor-crane-neutral',
  'lyra-voss': 'neuronet.character.lyra-voss-neutral',
  'director-cain': 'neuronet.character.director-cain-neutral',
  'mira-kade': 'neuronet.character.mira-kade-neutral',
  'executive-helix': 'neuronet.character.executive-helix-neutral',
  'juno-vale': 'neuronet.character.juno-vale-neutral',
  'razor-jackal': 'neuronet.character.razor-jackal-neutral',
};

const CHARACTER_EXPRESSION_ASSETS: Record<string, Partial<Record<CharacterPortraitExpression, string>>> = {
  'ada-mercer': {
    neutral: 'dust-and-iron.character.ada-mercer-neutral',
    approving: 'dust-and-iron.character.ada-mercer-approving',
    worried: 'dust-and-iron.character.ada-mercer-worried',
  },
  'elias-crow': {
    neutral: 'dust-and-iron.character.elias-crow-neutral',
    taunting: 'dust-and-iron.character.elias-crow-taunting',
    angry: 'dust-and-iron.character.elias-crow-angry',
  },
  'station-master-briggs': {
    neutral: 'dust-and-iron.character.station-master-briggs-neutral',
    approving: 'dust-and-iron.character.station-master-briggs-approving',
    concerned: 'dust-and-iron.character.station-master-briggs-concerned',
  },
  'silas-vane': {
    neutral: 'dust-and-iron.character.silas-vane-neutral',
    angry: 'dust-and-iron.character.silas-vane-angry',
  },
  'victor-crane': {
    neutral: 'dust-and-iron.character.victor-crane-neutral',
    taunting: 'dust-and-iron.character.victor-crane-smirk',
  },
  'lyra-voss': {
    neutral: 'neuronet.character.lyra-voss-neutral',
    approving: 'neuronet.character.lyra-voss-approving',
    worried: 'neuronet.character.lyra-voss-worried',
  },
  'director-cain': {
    neutral: 'neuronet.character.director-cain-neutral',
    taunting: 'neuronet.character.director-cain-taunting',
    angry: 'neuronet.character.director-cain-angry',
  },
  'mira-kade': {
    neutral: 'neuronet.character.mira-kade-neutral',
    approving: 'neuronet.character.mira-kade-approving',
    worried: 'neuronet.character.mira-kade-worried',
  },
  'executive-helix': {
    neutral: 'neuronet.character.executive-helix-neutral',
    taunting: 'neuronet.character.executive-helix-taunting',
    angry: 'neuronet.character.executive-helix-angry',
  },
  'juno-vale': {
    neutral: 'neuronet.character.juno-vale-neutral',
    approving: 'neuronet.character.juno-vale-approving',
    worried: 'neuronet.character.juno-vale-worried',
  },
  'razor-jackal': {
    neutral: 'neuronet.character.razor-jackal-neutral',
    taunting: 'neuronet.character.razor-jackal-taunting',
    angry: 'neuronet.character.razor-jackal-angry',
  },
};

const VILLAIN_TAUNT_BADGES = new Set(['TAUNT', 'VILLAIN']);
const CONFRONTATION_BADGES = new Set(['SHOWDOWN']);
const ENCOURAGEMENT_BADGES = new Set(['ORDERS', 'FINALE', 'LAST RUN', 'STAND FAST', 'EXTRACTION']);
const SETBACK_BADGES = new Set(['FIELD REPORT', 'MIDNIGHT', 'WHISPER', 'LOGISTICS']);

function resolveNarrativeMediaAsset(key: string | undefined): ImageSourcePropType | null {
  if (!key) return null;
  return ALL_MEDIA_ASSETS[key] ?? null;
}

function getNeutralPortraitAssetKey(character: NarrativeCharacter): string | undefined {
  return (
    character.media?.portraitExpressions?.neutral ??
    character.media?.portraitImageKey ??
    CHARACTER_NEUTRAL_PORTRAIT_BY_ID[character.id]
  );
}

function getExpressionPortraitAssetKey(
  character: NarrativeCharacter,
  expression: CharacterPortraitExpression,
): string | undefined {
  return (
    character.media?.portraitExpressions?.[expression] ??
    CHARACTER_EXPRESSION_ASSETS[character.id]?.[expression]
  );
}

export function portraitContextToExpression(
  characterId: string,
  context: CharacterPortraitContext,
): CharacterPortraitExpression {
  switch (context) {
    case 'questComplete':
    case 'chapterSuccess':
    case 'encouragement':
      if (
        characterId === 'ada-mercer' ||
        characterId === 'station-master-briggs' ||
        characterId === 'lyra-voss' ||
        characterId === 'mira-kade' ||
        characterId === 'juno-vale'
      ) {
        return 'approving';
      }
      return 'neutral';
    case 'questMissed':
    case 'chapterFailure':
    case 'setback':
      if (
        characterId === 'ada-mercer' ||
        characterId === 'lyra-voss' ||
        characterId === 'mira-kade' ||
        characterId === 'juno-vale'
      ) {
        return 'worried';
      }
      if (characterId === 'station-master-briggs') return 'concerned';
      return 'neutral';
    case 'villainTaunt':
    case 'lockedTeaser':
      if (
        characterId === 'elias-crow' ||
        characterId === 'victor-crane' ||
        characterId === 'director-cain' ||
        characterId === 'executive-helix' ||
        characterId === 'razor-jackal'
      ) {
        return 'taunting';
      }
      return 'neutral';
    case 'confrontation':
      if (
        characterId === 'elias-crow' ||
        characterId === 'silas-vane' ||
        characterId === 'director-cain' ||
        characterId === 'executive-helix' ||
        characterId === 'razor-jackal'
      ) {
        return 'angry';
      }
      return 'neutral';
    default:
      return 'neutral';
  }
}

export function inferPortraitContextFromDialogueBeat(
  beat: DialogueBeat,
  character: NarrativeCharacter,
): CharacterPortraitContext {
  const badge = beat.badge?.toUpperCase() ?? '';

  if (character.isVillain) {
    if (CONFRONTATION_BADGES.has(badge)) return 'confrontation';
    if (character.id === 'director-cain') {
      if (badge === 'MINISTRY') return 'villainTaunt';
      if (badge === 'CHAPTER IV') return 'confrontation';
    }
    if (character.id === 'executive-helix') {
      if (badge === 'ZENITH') return 'villainTaunt';
      if (badge === 'SECTOR IV') return 'confrontation';
    }
    if (character.id === 'razor-jackal') {
      if (badge === 'SYNDICATE') return 'villainTaunt';
      if (badge === 'SECTOR IV') return 'confrontation';
    }
    if (character.id === 'elias-crow') {
      if (VILLAIN_TAUNT_BADGES.has(badge)) return 'villainTaunt';
      if (badge === 'CHAPTER IV') return 'villainTaunt';
    }
    if (character.id === 'silas-vane' && badge === 'CHAPTER IV') return 'confrontation';
    if (character.id === 'victor-crane' && VILLAIN_TAUNT_BADGES.has(badge)) return 'villainTaunt';
    return 'default';
  }

  if (SETBACK_BADGES.has(badge)) {
    if (character.id === 'station-master-briggs') return 'setback';
    if (character.id === 'ada-mercer' && badge === 'FIELD REPORT') return 'setback';
    if (character.id === 'lyra-voss' || character.id === 'mira-kade' || character.id === 'juno-vale') {
      return 'setback';
    }
  }

  if (ENCOURAGEMENT_BADGES.has(badge)) return 'encouragement';

  return 'default';
}

export function resolveCharacterPortrait(
  character: NarrativeCharacter,
  context: CharacterPortraitContext = 'default',
): ImageSourcePropType | null {
  const expression = portraitContextToExpression(character.id, context);
  const expressionKey = getExpressionPortraitAssetKey(character, expression);
  const resolvedExpression = resolveNarrativeMediaAsset(expressionKey);
  if (resolvedExpression) return resolvedExpression;

  const neutralKey = getNeutralPortraitAssetKey(character);
  return resolveNarrativeMediaAsset(neutralKey);
}

export function getUniverseMoodImage(universe: Universe): ImageSourcePropType | null {
  return resolveNarrativeMediaAsset(universe.media?.moodImageKey ?? UNIVERSE_MOOD_BY_ID[universe.id]);
}

export function getSagaBannerImage(saga: Saga): ImageSourcePropType | null {
  return resolveNarrativeMediaAsset(saga.media?.bannerImageKey ?? SAGA_BANNER_BY_ID[saga.id]);
}

export function getSagaDetailImage(saga: Saga): ImageSourcePropType | null {
  return resolveNarrativeMediaAsset(saga.media?.detailImageKey ?? SAGA_DETAIL_BY_ID[saga.id]);
}

export function getChapterSceneImage(chapter: Chapter): ImageSourcePropType | null {
  return resolveNarrativeMediaAsset(chapter.media?.sceneImageKey ?? CHAPTER_SCENE_BY_ID[chapter.id]);
}

export function getChapterSceneImageById(chapterId: string): ImageSourcePropType | null {
  return resolveNarrativeMediaAsset(CHAPTER_SCENE_BY_ID[chapterId]);
}

export function getChapterRewardImage(reward: ChapterReward): ImageSourcePropType | null {
  return resolveNarrativeMediaAsset(reward.media?.rewardImageKey ?? REWARD_IMAGE_BY_ID[reward.id]);
}

export function getChapterRewardImageById(rewardId: string): ImageSourcePropType | null {
  return resolveNarrativeMediaAsset(REWARD_IMAGE_BY_ID[rewardId]);
}

/** @deprecated Prefer resolveCharacterPortrait with an explicit context. */
export function getCharacterPortraitImage(character: NarrativeCharacter): ImageSourcePropType | null {
  return resolveCharacterPortrait(character, 'default');
}

export function portraitContextFromDialogueBadge(badge?: string): CharacterPortraitContext {
  const normalized = badge?.toUpperCase() ?? '';
  if (normalized === 'VICTORY' || normalized === 'AFTERMATH') return 'chapterSuccess';
  return 'default';
}

export function findCharacterBySpeakerName(
  saga: Saga,
  speakerName: string,
): NarrativeCharacter | undefined {
  const normalized = speakerName.trim().toLowerCase();
  return saga.characters.find((character) => character.name.toLowerCase() === normalized);
}
