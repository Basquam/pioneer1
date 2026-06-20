import { QuestoryStatusPill } from '@/components/ui/questory-status-pill';

export type MissionStatusKind = 'locked' | 'active' | 'completed';

type QuestoryMissionPillProps = {
  status: MissionStatusKind;
  /** Override stamp text — e.g. RECLAIMED, STABILIZED, ROUTING */
  label?: string;
  universeId?: string;
};

const DEFAULT_LABELS: Record<MissionStatusKind, string> = {
  locked: 'LOCKED',
  active: 'ACTIVE',
  completed: 'RECLAIMED',
};

const STATUS_TONES = {
  locked: 'muted',
  active: 'accent',
  completed: 'success',
} as const;

export function QuestoryMissionPill({ status, label, universeId }: QuestoryMissionPillProps) {
  return (
    <QuestoryStatusPill
      label={label ?? DEFAULT_LABELS[status]}
      tone={STATUS_TONES[status]}
      universeId={universeId}
    />
  );
}
