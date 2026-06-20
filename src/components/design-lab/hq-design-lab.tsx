import { type Href, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HqLabVariantFrame } from '@/components/design-lab/hq-lab-variant-frame';
import { HqVariantEditorialConsole } from '@/components/design-lab/hq-variant-editorial-console';
import { HqVariantNeonetProtocol } from '@/components/design-lab/hq-variant-neonet-protocol';
import { HqVariantPulpDossier } from '@/components/design-lab/hq-variant-pulp-dossier';
import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import {
  HQ_LAB_RECOMMENDATION,
  HQ_LAB_VARIANTS,
  type HqLabVariantId,
  type HqLabViewMode,
} from '@/lib/design-lab/hq-lab-sample-data';
import { QuestoryTheme } from '@/theme/questory-theme';

function renderVariant(id: HqLabVariantId) {
  switch (id) {
    case 'editorial':
      return <HqVariantEditorialConsole />;
    case 'pulp':
      return <HqVariantPulpDossier />;
    case 'neuronet':
      return <HqVariantNeonetProtocol />;
  }
}

const VIEW_MODES: { id: HqLabViewMode; label: string }[] = [
  { id: 'single', label: 'Single' },
  { id: 'compare', label: 'Compare All' },
];

export function HqDesignLab() {
  const [viewMode, setViewMode] = useState<HqLabViewMode>('single');
  const [activeVariant, setActiveVariant] = useState<HqLabVariantId>('editorial');

  const activeMeta = HQ_LAB_VARIANTS.find((v) => v.id === activeVariant)!;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={styles.back}>← BACK</Text>
          </Pressable>
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>HQ Design Lab</Text>
          <Text style={styles.bannerNote}>
            Design Lab — visual prototype only. Not connected to live progress.
          </Text>
          <Text style={styles.recommendation}>{HQ_LAB_RECOMMENDATION}</Text>
        </View>

        <View style={styles.modeRow}>
          <Text style={styles.modeLabel}>VIEW</Text>
          {VIEW_MODES.map((mode) => {
            const active = viewMode === mode.id;
            return (
              <Pressable
                key={mode.id}
                onPress={() => setViewMode(mode.id)}
                style={[styles.modeChip, active && styles.modeChipActive]}>
                <Text style={[styles.modeChipText, active && styles.modeChipTextActive]}>{mode.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {viewMode === 'single' ? (
          <>
            <View style={styles.chipRow}>
              {HQ_LAB_VARIANTS.map((variant) => {
                const active = activeVariant === variant.id;
                return (
                  <Pressable
                    key={variant.id}
                    onPress={() => setActiveVariant(variant.id)}
                    style={[styles.chip, active && styles.chipActive]}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{variant.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <HqLabVariantFrame meta={activeMeta}>{renderVariant(activeVariant)}</HqLabVariantFrame>
          </>
        ) : (
          HQ_LAB_VARIANTS.map((meta, index) => (
            <HqLabVariantFrame key={meta.id} meta={meta} compareMode={index < HQ_LAB_VARIANTS.length - 1}>
              {renderVariant(meta.id)}
            </HqLabVariantFrame>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/** Dev-only entry from Profile dev tools. */
export function openHqDesignLab() {
  router.push('/design-lab/hq' as Href);
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: QuestoryTheme.colors.background.deep,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: GameLayout.screenPaddingHorizontal,
    paddingBottom: 40,
    gap: 16,
  },
  topBar: { paddingTop: 4 },
  back: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 2,
    color: QuestoryTheme.colors.text.muted,
  },
  banner: { gap: 8, paddingVertical: 4 },
  bannerTitle: {
    fontFamily: GameFonts.display,
    fontSize: 28,
    color: QuestoryTheme.colors.text.primary,
    letterSpacing: 1,
  },
  bannerNote: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 12,
    lineHeight: 18,
    color: QuestoryTheme.colors.text.muted,
  },
  recommendation: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 12,
    lineHeight: 18,
    color: QuestoryTheme.colors.text.secondary,
    paddingTop: 4,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  modeLabel: {
    fontFamily: GameFonts.ui,
    fontSize: 9,
    letterSpacing: 2,
    color: QuestoryTheme.colors.text.muted,
  },
  modeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    minHeight: 36,
    justifyContent: 'center',
  },
  modeChipActive: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  modeChipText: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 1.2,
    color: QuestoryTheme.colors.text.secondary,
  },
  modeChipTextActive: {
    color: QuestoryTheme.colors.text.primary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    minHeight: 40,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: `${QuestoryTheme.colors.accent.gold}44`,
  },
  chipText: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 1.5,
    color: QuestoryTheme.colors.text.secondary,
  },
  chipTextActive: {
    color: QuestoryTheme.colors.text.primary,
  },
});
