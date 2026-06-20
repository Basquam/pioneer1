import { type Href, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StyleLabFrame } from '@/components/design-lab/style-lab-frame';
import { StyleVariantBlueprint } from '@/components/design-lab/style-variant-blueprint';
import { StyleVariantBrutalist } from '@/components/design-lab/style-variant-brutalist';
import { StyleVariantFactoryPomo } from '@/components/design-lab/style-variant-factory-pomo';
import { StyleVariantMicrographic } from '@/components/design-lab/style-variant-micrographic';
import { StyleVariantMythicAtlas } from '@/components/design-lab/style-variant-mythic-atlas';
import { StyleVariantNeoPsychedelic } from '@/components/design-lab/style-variant-neo-psychedelic';
import { StyleVariantPixelGrid } from '@/components/design-lab/style-variant-pixel-grid';
import { StyleVariantRisoPulp } from '@/components/design-lab/style-variant-riso-pulp';
import { StyleVariantSketchbook } from '@/components/design-lab/style-variant-sketchbook';
import { StyleVariantTechwear } from '@/components/design-lab/style-variant-techwear';
import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import {
  STYLE_LAB_INTRO,
  STYLE_LAB_VARIANTS,
  type StyleLabVariantId,
  type StyleLabViewMode,
} from '@/lib/design-lab/style-lab-sample-data';
import { QuestoryTheme } from '@/theme/questory-theme';

function renderStyleVariant(id: StyleLabVariantId) {
  switch (id) {
    case 'riso-pulp':
      return <StyleVariantRisoPulp />;
    case 'blueprint':
      return <StyleVariantBlueprint />;
    case 'brutalist':
      return <StyleVariantBrutalist />;
    case 'sketchbook':
      return <StyleVariantSketchbook />;
    case 'techwear':
      return <StyleVariantTechwear />;
    case 'neo-psychedelic':
      return <StyleVariantNeoPsychedelic />;
    case 'pixel-grid':
      return <StyleVariantPixelGrid />;
    case 'mythic-atlas':
      return <StyleVariantMythicAtlas />;
    case 'micrographic':
      return <StyleVariantMicrographic />;
    case 'factory-pomo':
      return <StyleVariantFactoryPomo />;
  }
}

const VIEW_MODES: { id: StyleLabViewMode; label: string }[] = [
  { id: 'single', label: 'Single' },
  { id: 'compare', label: 'Compare All' },
];

export function StyleLab() {
  const [viewMode, setViewMode] = useState<StyleLabViewMode>('single');
  const [activeVariant, setActiveVariant] = useState<StyleLabVariantId>('riso-pulp');

  const activeMeta = STYLE_LAB_VARIANTS.find((v) => v.id === activeVariant)!;

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
          <Text style={styles.bannerTitle}>Radical Style Lab</Text>
          <Text style={styles.bannerNote}>Visual prototype only. Not connected to live progress.</Text>
          <Text style={styles.intro}>{STYLE_LAB_INTRO}</Text>
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
              {STYLE_LAB_VARIANTS.map((variant) => {
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
            </ScrollView>
            <StyleLabFrame meta={activeMeta}>{renderStyleVariant(activeVariant)}</StyleLabFrame>
          </>
        ) : (
          STYLE_LAB_VARIANTS.map((meta, index) => (
            <StyleLabFrame key={meta.id} meta={meta} compareMode={index < STYLE_LAB_VARIANTS.length - 1}>
              {renderStyleVariant(meta.id)}
            </StyleLabFrame>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export function openStyleLab() {
  router.push('/design-lab/style' as Href);
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: QuestoryTheme.colors.background.deep },
  scroll: { flex: 1 },
  content: { paddingHorizontal: GameLayout.screenPaddingHorizontal, paddingBottom: 48, gap: 14 },
  topBar: { paddingTop: 4 },
  back: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 2, color: QuestoryTheme.colors.text.muted },
  banner: { gap: 8 },
  bannerTitle: { fontFamily: GameFonts.display, fontSize: 28, color: QuestoryTheme.colors.text.primary },
  bannerNote: { fontFamily: GameFonts.uiSemi, fontSize: 12, lineHeight: 18, color: QuestoryTheme.colors.text.muted },
  intro: { fontFamily: GameFonts.uiSemi, fontSize: 12, lineHeight: 18, color: QuestoryTheme.colors.text.secondary },
  modeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  modeLabel: { fontFamily: GameFonts.ui, fontSize: 9, letterSpacing: 2, color: QuestoryTheme.colors.text.muted },
  modeChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)', minHeight: 36, justifyContent: 'center',
  },
  modeChipActive: { backgroundColor: 'rgba(255,255,255,0.14)' },
  modeChipText: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 1, color: QuestoryTheme.colors.text.secondary },
  modeChipTextActive: { color: QuestoryTheme.colors.text.primary },
  chipScroll: { gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)', marginRight: 4,
  },
  chipActive: { backgroundColor: `${QuestoryTheme.colors.accent.gold}44` },
  chipText: { fontFamily: GameFonts.ui, fontSize: 10, letterSpacing: 1, color: QuestoryTheme.colors.text.secondary },
  chipTextActive: { color: QuestoryTheme.colors.text.primary },
});
