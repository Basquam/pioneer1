/** Hand-written routine title rotations for common repeated tasks — no AI. */
export type RoutineTitleCatalogEntry = {
  /** Normalized match keys (lowercase, trimmed). */
  matchKeys: string[];
  titlesByUniverse: Record<string, string[]>;
  freshAnglesByUniverse?: Record<string, string[]>;
};

export const ROUTINE_TITLE_CATALOG: RoutineTitleCatalogEntry[] = [
  {
    matchKeys: ['drink water', 'drink more water', 'hydrate', 'hydration'],
    titlesByUniverse: {
      'dust-and-iron': [
        'Refill the canteen before patrol.',
        'Take water before the dust takes you.',
        'A deputy who lasts keeps the canteen full.',
      ],
      neuronet: [
        'Stabilize your hydration protocol.',
        'Flush the system before signal drift.',
        'Keep the body online; the network follows.',
      ],
      'neon-ashes': [
        'Take water before the case dries you out.',
        'A clear head catches details.',
        'Hydrate before the next lead goes cold.',
      ],
    },
    freshAnglesByUniverse: {
      'dust-and-iron': ['Same trail, new day — the canteen still matters.'],
      neuronet: ['Routine maintenance keeps the signal clean.'],
      'neon-ashes': ['Every return to the habit sharpens the eye.'],
    },
  },
];

export function normalizeRoutineTitleKey(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function findRoutineTitleCatalogEntry(originalTitle: string): RoutineTitleCatalogEntry | null {
  const normalized = normalizeRoutineTitleKey(originalTitle);
  return (
    ROUTINE_TITLE_CATALOG.find((entry) =>
      entry.matchKeys.some(
        (key) => normalized === key || normalized.includes(key) || key.includes(normalized),
      ),
    ) ?? null
  );
}
