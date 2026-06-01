import type { FeatureDiscoveryKey } from '@/lib/feature-discovery';
import type { NextBestActionType } from '@/lib/next-best-action';
import type { QuestLoadLevel } from '@/lib/quest-load';
import type {
  AppMascotId,
  DailyAwarenessBlocker,
  MascotPreference,
  PlayerProgress,
} from '@/types/narrative';

export type MascotCoachContext =
  | { kind: 'onboarding-structure' }
  | { kind: 'onboarding-first-quest' }
  | { kind: 'awareness'; blocker: DailyAwarenessBlocker }
  | { kind: 'coach-tip'; tipId: string }
  | { kind: 'next-best-action'; actionType: NextBestActionType }
  | { kind: 'quest-load'; loadLevel: QuestLoadLevel }
  | { kind: 'minimum-viable-day' }
  | {
      kind: 'empty';
      variant: 'quest-board' | 'inbox' | 'no-completed' | 'no-suite-stats' | 'focus-empty';
    }
  | { kind: 'feature'; feature: FeatureDiscoveryKey };

export type MascotCoachDisplayMode = 'full' | 'minimal' | 'fallback';

export type MascotCoachDisplay = {
  mode: MascotCoachDisplayMode;
  mascotId?: AppMascotId;
  name?: string;
  role?: string;
  message: string;
};

const DEFAULT_MASCOT_PREFERENCE: MascotPreference = 'both';

const SASHA_FEATURES = new Set<FeatureDiscoveryKey>([
  'frictionReview',
  'questReadiness',
  'questChain',
  'recurringQuest',
  'tomorrowSetup',
  'weeklyReview',
  'systemsInsight',
  'coachTips',
  'riskLevel',
]);

const MARCUS_FEATURES = new Set<FeatureDiscoveryKey>([
  'starterMove',
  'prepStep',
  'rewardRitual',
  'focusMode',
  'identityVotes',
]);

const SASHA_AWARENESS = new Set<DailyAwarenessBlocker>([
  'too-many-tasks',
  'unclear-priorities',
  'messy-environment',
  'ready',
]);

const MARCUS_AWARENESS = new Set<DailyAwarenessBlocker>(['low-energy', 'emotional-resistance']);

const SASHA_NBA = new Set<NextBestActionType>([
  'review-stale',
  'convert-inbox',
  'add-quest',
  'advance-story',
  'daily-shutdown',
  'weekly-review',
  'monthly-review',
  'open-quest-board',
]);

const MARCUS_NBA = new Set<NextBestActionType>([
  'recovery-quest',
  'daily-awareness',
  'activate-minimum-day',
  'do-one-small-quest',
  'locked-focus',
  'continue-started',
]);

const SASHA_COACH_TIPS = new Set([
  'high-risk-no-starter',
  'low-readiness',
  'quest-needs-review',
  'board-overloaded',
  'stale-routines',
  'tomorrow-setup-ready',
]);

const MARCUS_COACH_TIPS = new Set(['low-energy-minimum-day', 'no-quest-completed-today']);

const FALLBACK_MESSAGES: Record<string, string> = {
  'onboarding-structure': 'Quests, focus, and story progress work as separate layers.',
  'onboarding-first-quest': 'One small quest is enough to begin.',
  'awareness:low-energy': 'Start with a small recovery quest.',
  'awareness:too-many-tasks': "Lock today's focus around one to three quests.",
  'awareness:unclear-priorities': 'Pick one focus quest before adding more.',
  'awareness:messy-environment': 'Add a prep step before starting.',
  'awareness:emotional-resistance': 'Use Focus Mode and begin with the starter move.',
  'awareness:ready': 'Choose one quest and begin.',
  'coach-tip:high-risk-no-starter': 'High-risk quests are easier when the first move is tiny.',
  'coach-tip:low-readiness': 'A plan, prep step, or starter move can reduce friction.',
  'coach-tip:quest-needs-review': 'Carry it, shrink it, snooze it, or archive it.',
  'coach-tip:board-overloaded': 'A smaller board is easier to act on.',
  'coach-tip:low-energy-minimum-day': 'Minimum Viable Day can keep momentum without pressure.',
  'coach-tip:stale-routines': 'Pause, shrink, or redesign routines that no longer help.',
  'coach-tip:no-quest-completed-today': 'One completed quest counts.',
  'coach-tip:tomorrow-setup-ready': 'Use the setup you created yesterday.',
  'quest-load:light': 'Room for one more quest if it helps.',
  'quest-load:balanced': 'A steady load — protect focus before adding more.',
  'quest-load:heavy': 'Consider trimming before adding more.',
  'quest-load:overloaded': 'Lighten the board before taking on more.',
  'minimum-viable-day': 'Low-energy days still count when you return with one small action.',
  'empty:quest-board': 'Add a quest when you are ready — one clear move is enough.',
  'empty:inbox': 'Capture tasks here, then turn one into a quest.',
  'empty:no-completed': 'Completed quests will show up here.',
  'empty:no-suite-stats': 'Complete quests with a suite selected to build mastery.',
  'empty:focus-empty': 'Add a quest or pin one as focus to build today’s window.',
};

const MASCOT_LINES: Record<AppMascotId, Record<string, string>> = {
  sasha: {
    'onboarding-structure': 'Quests, focus, and story are separate layers. Start with one clear move.',
    'awareness:too-many-tasks': 'Let’s reduce today’s load.',
    'awareness:unclear-priorities': 'Pick one focus quest. Not ten.',
    'awareness:messy-environment': 'Make the next move visible before you start.',
    'awareness:ready': 'Choose one quest. Protect focus before adding more.',
    'coach-tip:high-risk-no-starter': 'This task is too vague. Make the next move visible.',
    'coach-tip:low-readiness': 'Make the next move visible — plan, prep, or starter.',
    'coach-tip:quest-needs-review': 'Let’s reduce today’s load. Decide on this quest first.',
    'coach-tip:board-overloaded': 'Pick one focus quest. Not ten.',
    'coach-tip:stale-routines': 'Prune what no longer helps. Keep the system lean.',
    'coach-tip:tomorrow-setup-ready': 'You already prepared — use that lane first.',
    'quest-load:heavy': 'Trim before you add. A lighter board is easier to act on.',
    'quest-load:overloaded': 'Let’s reduce today’s load.',
    'quest-load:balanced': 'Steady load — protect focus before adding more.',
    'empty:inbox': 'Capture here. Turn one item into a visible next move.',
    'feature:frictionReview': 'When a quest stalls, review friction — not willpower.',
    'feature:questReadiness': 'Readiness shows what might make starting easier.',
    'feature:questChain': 'Split big work into linked steps you can see.',
    'feature:recurringQuest': 'Routines work best when they stay small and visible.',
    'feature:tomorrowSetup': 'Prime tomorrow with one prepared first move.',
    'feature:weeklyReview': 'Review patterns — adjust the system, not yourself.',
    'feature:systemsInsight': 'Patterns across quests reveal what to simplify.',
    'feature:coachTips': 'Tips appear when a tool might help — dismiss anytime.',
    'feature:riskLevel': 'Match quest size to your capacity today.',
    'nba:review-stale': 'Decide on stalled quests before adding more.',
    'nba:convert-inbox': 'Turn one captured task into a visible quest.',
    'nba:add-quest': 'Add one quest with a clear first move.',
    'nba:advance-story': 'Story waits — pick one executable quest first.',
    'nba:daily-shutdown': 'Close the day with one small setup for tomorrow.',
    'nba:weekly-review': 'Review the week without judgment — adjust the load.',
    'nba:monthly-review': 'Zoom out. Keep what worked. Release what didn’t.',
    'nba:open-quest-board': 'Review the board before adding more.',
  },
  marcus: {
    'onboarding-first-quest': 'One small quest counts. Start the first move.',
    'awareness:low-energy': 'One small quest counts.',
    'awareness:emotional-resistance': 'You don’t need a perfect day. Start the first move.',
    'coach-tip:low-energy-minimum-day': 'You don’t need a perfect day. One small quest is enough.',
    'coach-tip:no-quest-completed-today': 'Start the first move. The story can wait for perfection.',
    'minimum-viable-day': 'You don’t need a perfect day. One small quest counts.',
    'empty:quest-board': 'One small quest counts. Add one when you are ready.',
    'empty:no-completed': 'Your first cleared quest will show up here.',
    'empty:no-suite-stats': 'Complete one quest with a suite — mastery builds from there.',
    'empty:focus-empty': 'Pin one quest as focus. The first move is enough.',
    'feature:starterMove': 'A tiny first move makes starting easier.',
    'feature:prepStep': 'A small prep step reduces friction when you return.',
    'feature:rewardRitual': 'A brief reward ritual can close the loop gently.',
    'feature:focusMode': 'Focus mode gives one quest a clear starting lane.',
    'feature:identityVotes': 'Each completion is a vote for who you are becoming.',
    'nba:recovery-quest': 'Welcome back. One small quest counts.',
    'nba:daily-awareness': 'Name what might slow you down — then pick one move.',
    'nba:activate-minimum-day': 'You don’t need a perfect day. One small quest is enough.',
    'nba:do-one-small-quest': 'One small quest counts.',
    'nba:locked-focus': 'Start the first move on your locked focus.',
    'nba:continue-started': 'You already started — one push finishes the move.',
  },
};

export function sanitizeMascotPreference(raw: unknown): MascotPreference {
  if (raw === 'both' || raw === 'sasha' || raw === 'marcus' || raw === 'minimal' || raw === 'off') {
    return raw;
  }
  return DEFAULT_MASCOT_PREFERENCE;
}

export function getMascotPreference(
  progress: Pick<PlayerProgress, 'mascotPreference'>,
): MascotPreference {
  return sanitizeMascotPreference(progress.mascotPreference);
}

function contextKey(context: MascotCoachContext): string {
  switch (context.kind) {
    case 'onboarding-structure':
      return 'onboarding-structure';
    case 'onboarding-first-quest':
      return 'onboarding-first-quest';
    case 'awareness':
      return `awareness:${context.blocker}`;
    case 'coach-tip':
      return `coach-tip:${context.tipId}`;
    case 'next-best-action':
      return `nba:${context.actionType}`;
    case 'quest-load':
      return `quest-load:${context.loadLevel}`;
    case 'minimum-viable-day':
      return 'minimum-viable-day';
    case 'empty':
      return `empty:${context.variant}`;
    case 'feature':
      return `feature:${context.feature}`;
    default:
      return 'unknown';
  }
}

function getFallbackMessage(context: MascotCoachContext): string {
  const key = contextKey(context);
  return FALLBACK_MESSAGES[key] ?? 'One clear move is enough for today.';
}

function getIdealMascotForContext(context: MascotCoachContext): AppMascotId | null {
  switch (context.kind) {
    case 'onboarding-structure':
      return 'sasha';
    case 'onboarding-first-quest':
      return 'marcus';
    case 'awareness':
      if (SASHA_AWARENESS.has(context.blocker)) return 'sasha';
      if (MARCUS_AWARENESS.has(context.blocker)) return 'marcus';
      return null;
    case 'coach-tip':
      if (SASHA_COACH_TIPS.has(context.tipId)) return 'sasha';
      if (MARCUS_COACH_TIPS.has(context.tipId)) return 'marcus';
      return null;
    case 'next-best-action':
      if (SASHA_NBA.has(context.actionType)) return 'sasha';
      if (MARCUS_NBA.has(context.actionType)) return 'marcus';
      return null;
    case 'quest-load':
      return context.loadLevel === 'heavy' || context.loadLevel === 'overloaded' ? 'sasha' : null;
    case 'minimum-viable-day':
      return 'marcus';
    case 'empty':
      if (context.variant === 'inbox') return 'sasha';
      return 'marcus';
    case 'feature':
      if (SASHA_FEATURES.has(context.feature)) return 'sasha';
      if (MARCUS_FEATURES.has(context.feature)) return 'marcus';
      return null;
    default:
      return null;
  }
}

function resolveActiveMascot(
  context: MascotCoachContext,
  preference: MascotPreference,
): AppMascotId | null {
  const ideal = getIdealMascotForContext(context);
  if (!ideal) return null;

  if (preference === 'off') return null;
  if (preference === 'sasha') return ideal === 'sasha' ? 'sasha' : null;
  if (preference === 'marcus') return ideal === 'marcus' ? 'marcus' : null;
  return ideal;
}

function getMascotLine(mascotId: AppMascotId, key: string, fallback: string): string {
  return MASCOT_LINES[mascotId][key] ?? fallback;
}

export function getMascotCoachDisplay(
  context: MascotCoachContext,
  preference: MascotPreference = DEFAULT_MASCOT_PREFERENCE,
  messageOverride?: string,
): MascotCoachDisplay {
  const fallback = messageOverride ?? getFallbackMessage(context);
  const key = contextKey(context);
  const mascotId = resolveActiveMascot(context, preference);

  if (preference === 'off' || !mascotId) {
    return { mode: 'fallback', message: fallback };
  }

  const message = getMascotLine(mascotId, key, fallback);

  if (preference === 'minimal') {
    return {
      mode: 'minimal',
      mascotId,
      name: mascotId === 'sasha' ? 'Sasha' : 'Marcus',
      message,
    };
  }

  return {
    mode: 'full',
    mascotId,
    name: mascotId === 'sasha' ? 'Sasha' : 'Marcus',
    role: mascotId === 'sasha' ? 'Planning Coach' : 'Momentum Coach',
    message,
  };
}

export function shouldShowMascotCard(display: MascotCoachDisplay): boolean {
  return display.mode === 'full';
}
