import type { ImageSourcePropType } from 'react-native';

import { DUST_AND_IRON_MEDIA_ASSETS } from '@/constants/narrative-media/dust-and-iron';
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
};

const UNIVERSE_MOOD_BY_ID: Record<string, string> = {
  'dust-and-iron': 'dust-and-iron.mood',
};

const SAGA_BANNER_BY_ID: Record<string, string> = {
  'vulture-gang': 'dust-and-iron.saga.vulture-gang-banner',
  'iron-railway-company': 'dust-and-iron.saga.iron-railway-company-banner',
  'honest-businessman': 'dust-and-iron.saga.honest-businessman-banner',
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
};

const CHARACTER_NEUTRAL_PORTRAIT_BY_ID: Record<string, string> = {
  'ada-mercer': 'dust-and-iron.character.ada-mercer-neutral',
  'elias-crow': 'dust-and-iron.character.elias-crow-neutral',
  'station-master-briggs': 'dust-and-iron.character.station-master-briggs-neutral',
  'silas-vane': 'dust-and-iron.character.silas-vane-neutral',
  'victor-crane': 'dust-and-iron.character.victor-crane-neutral',
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
};

const VILLAIN_TAUNT_BADGES = new Set(['TAUNT', 'VILLAIN']);
const CONFRONTATION_BADGES = new Set(['SHOWDOWN']);
const ENCOURAGEMENT_BADGES = new Set(['ORDERS', 'FINALE', 'LAST RUN', 'STAND FAST']);
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
      if (characterId === 'ada-mercer' || characterId === 'station-master-briggs') {
        return 'approving';
      }
      return 'neutral';
    case 'questMissed':
    case 'chapterFailure':
    case 'setback':
      if (characterId === 'ada-mercer') return 'worried';
      if (characterId === 'station-master-briggs') return 'concerned';
      return 'neutral';
    case 'villainTaunt':
    case 'lockedTeaser':
      if (characterId === 'elias-crow' || characterId === 'victor-crane') return 'taunting';
      return 'neutral';
    case 'confrontation':
      if (characterId === 'elias-crow' || characterId === 'silas-vane') return 'angry';
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
