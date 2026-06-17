import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useModalBottomInset } from '@/hooks/use-scroll-insets';
import {
  buildProgressBackupFilename,
  copyTextToClipboard,
  downloadProgressBackupJson,
  getAppVersionLabel,
  serializeProgressBackup,
  validateProgressBackupJson,
} from '@/lib/progress-backup';
import { reportStorageError } from '@/lib/crash/questory-crash';
import { restorePlayerProgress } from '@/lib/player-progress-storage';

const IMPORT_CONFIRM_TITLE = 'Replace Current Save?';
const IMPORT_CONFIRM_MESSAGE =
  'This replaces your current save on this device with the imported backup.\n\n' +
  'You will lose any progress made since that backup:\n' +
  '• XP, level, and standing\n' +
  '• Completed chapters and quests\n' +
  '• Personal quests and relationships\n' +
  '• Unlocked rewards\n\n' +
  'Your current save will be overwritten. This cannot be undone.';

type ProgressBackupPanelProps = {
  /** When true, omit outer section chrome — used inside ProfileSection. */
  embedded?: boolean;
};

export function ProgressBackupPanel({ embedded = false }: ProgressBackupPanelProps) {
  const { activeUniverse, playerProgress, importProgress } = useGame();
  const { palette } = activeUniverse;
  const modalBottomInset = useModalBottomInset(32);

  const [exportJson, setExportJson] = useState<string | null>(null);
  const [exportVisible, setExportVisible] = useState(false);
  const [importVisible, setImportVisible] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const clearStatusLater = (message: string) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleExport = async () => {
    const json = serializeProgressBackup(restorePlayerProgress(playerProgress));
    setExportJson(json);

    if (Platform.OS === 'web') {
      const downloaded = downloadProgressBackupJson(json, buildProgressBackupFilename());
      if (downloaded) {
        clearStatusLater('Backup downloaded.');
        return;
      }
    } else {
      setExportVisible(true);
      try {
        await Share.share({
          message: json,
          title: 'Questory Progress Backup',
        });
        clearStatusLater('Backup shared. Copy from the modal if needed.');
      } catch {
        clearStatusLater('Copy the backup JSON from the modal.');
      }
      return;
    }

    setExportVisible(true);
  };

  const handleCopyExport = async () => {
    if (!exportJson) return;

    const copied = await copyTextToClipboard(exportJson);
    if (copied) {
      void Haptics.selectionAsync();
      clearStatusLater('Backup copied.');
      return;
    }

    clearStatusLater('Select the JSON below and copy manually.');
  };

  const closeExportModal = () => {
    setExportVisible(false);
    setExportJson(null);
  };

  const closeImportModal = () => {
    setImportVisible(false);
    setImportJson('');
    setImportError(null);
  };

  const confirmImport = async (json: string) => {
    const result = validateProgressBackupJson(json);
    if (!result.ok) {
      setImportError(result.error);
      return;
    }

    try {
      await importProgress(result.playerProgress);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      closeImportModal();
      clearStatusLater(
        `Save restored · schema v${result.playerProgress.schemaVersion} · backup ${result.backup.appVersionLabel} (${result.backup.exportedAt.slice(0, 10)}).`,
      );
    } catch (err) {
      reportStorageError(err, { action: 'import_backup' });
      setImportError('Could not restore this backup. Please try again.');
    }
  };

  const requestImport = () => {
    const result = validateProgressBackupJson(importJson);
    if (!result.ok) {
      setImportError(result.error);
      return;
    }

    setImportError(null);

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`${IMPORT_CONFIRM_TITLE}\n\n${IMPORT_CONFIRM_MESSAGE}`);
      if (confirmed) void confirmImport(importJson);
      return;
    }

    Alert.alert(IMPORT_CONFIRM_TITLE, IMPORT_CONFIRM_MESSAGE, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Replace Save',
        style: 'destructive',
        onPress: () => void confirmImport(importJson),
      },
    ]);
  };

  const panelContent = (
    <>
      {!embedded ? (
        <Text style={[styles.sectionLabel, { color: palette.gold }]}>BACKUP</Text>
      ) : null}
      <Text style={[styles.sectionHint, { color: palette.fog }]}>
        Local backup only — this device, no cloud sync.
      </Text>
      <Text style={[styles.versionHint, { color: palette.fog }]}>
        App {getAppVersionLabel()} · save schema v{playerProgress.schemaVersion}
      </Text>

      <Pressable
        onPress={() => void handleExport()}
        style={[styles.toolButton, { borderColor: palette.gold, backgroundColor: palette.ink }]}>
        <Text style={[styles.toolLabel, { color: palette.bone }]}>EXPORT PROGRESS</Text>
        <Text style={[styles.toolHint, { color: palette.fog }]}>
          {Platform.OS === 'web'
            ? 'Download a JSON file of your current save.'
            : 'Share or copy a JSON file of your current save.'}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => setImportVisible(true)}
        style={[styles.toolButton, { borderColor: palette.panelBorder, backgroundColor: palette.ink }]}>
        <Text style={[styles.toolLabel, { color: palette.bone }]}>IMPORT PROGRESS</Text>
        <Text style={[styles.toolHint, { color: palette.fog }]}>
          Paste a backup JSON to replace this save. You will be asked to confirm.
        </Text>
      </Pressable>

      {statusMessage ? (
        <Text style={[styles.statusMessage, { color: palette.accent }]}>{statusMessage}</Text>
      ) : null}
    </>
  );

  return (
    <>
      {embedded ? (
        panelContent
      ) : (
        <View
          style={[
            styles.panel,
            { backgroundColor: palette.panel, borderColor: palette.panelBorder },
          ]}>
          {panelContent}
        </View>
      )}

      <Modal visible={exportVisible} transparent animationType="fade" onRequestClose={closeExportModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.backdrop}>
          <Pressable style={styles.dismissArea} onPress={closeExportModal} />
          <View
            style={[
              styles.sheet,
              { backgroundColor: palette.night, borderColor: palette.panelBorder, maxHeight: GameLayout.modalMaxHeight },
            ]}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[styles.sheetScroll, { paddingBottom: modalBottomInset }]}>
              <Text style={[styles.sheetTitle, { color: palette.bone }]}>EXPORT BACKUP</Text>
              <Text style={[styles.sheetHint, { color: palette.fog }]}>
                Copy this JSON or share it somewhere safe.
              </Text>
              <TextInput
                multiline
                editable={false}
                selectTextOnFocus
                value={exportJson ?? ''}
                style={[
                  styles.jsonInput,
                  {
                    color: palette.bone,
                    borderColor: palette.panelBorder,
                    backgroundColor: palette.panel,
                  },
                ]}
              />
              <View style={styles.sheetActions}>
                <Pressable
                  onPress={() => void handleCopyExport()}
                  style={[styles.actionButton, { borderColor: palette.gold, backgroundColor: palette.panel }]}>
                  <Text style={[styles.actionLabel, { color: palette.bone }]}>COPY JSON</Text>
                </Pressable>
                <Pressable
                  onPress={closeExportModal}
                  style={[styles.actionButton, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
                  <Text style={[styles.actionLabel, { color: palette.fog }]}>CLOSE</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={importVisible} transparent animationType="slide" onRequestClose={closeImportModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.backdrop}>
          <Pressable style={styles.dismissArea} onPress={closeImportModal} />
          <View
            style={[
              styles.sheet,
              { backgroundColor: palette.night, borderColor: palette.panelBorder, maxHeight: GameLayout.modalMaxHeight },
            ]}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[styles.sheetScroll, { paddingBottom: modalBottomInset }]}>
              <Text style={[styles.sheetTitle, { color: palette.bone }]}>IMPORT BACKUP</Text>
              <Text style={[styles.sheetHint, { color: palette.fog }]}>
                Paste your backup JSON below. Import replaces this save after you confirm.
              </Text>
              <TextInput
                multiline
                value={importJson}
                onChangeText={(text) => {
                  setImportJson(text);
                  if (importError) setImportError(null);
                }}
                placeholder="Paste backup JSON..."
                placeholderTextColor={palette.fog}
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                  styles.jsonInput,
                  {
                    color: palette.bone,
                    borderColor: importError ? palette.primary : palette.panelBorder,
                    backgroundColor: palette.panel,
                  },
                ]}
              />
              {importError ? (
                <Text style={[styles.errorText, { color: palette.primary }]}>{importError}</Text>
              ) : null}
              <View style={styles.sheetActions}>
                <Pressable
                  onPress={requestImport}
                  style={[styles.actionButton, { borderColor: palette.gold, backgroundColor: palette.panel }]}>
                  <Text style={[styles.actionLabel, { color: palette.bone }]}>REPLACE SAVE</Text>
                </Pressable>
                <Pressable
                  onPress={closeImportModal}
                  style={[styles.actionButton, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
                  <Text style={[styles.actionLabel, { color: palette.fog }]}>CANCEL</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    padding: GameLayout.panelPadding,
    gap: 10,
    transform: [{ skewX: '-2deg' }],
  },
  sectionLabel: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 3 },
  sectionHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.5,
    lineHeight: 15,
  },
  versionHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 4,
  },
  toolButton: {
    borderWidth: 1,
    padding: 12,
    gap: 4,
    transform: [{ skewX: '-3deg' }],
  },
  toolLabel: { fontFamily: GameFonts.ui, fontSize: 12, letterSpacing: 2 },
  toolHint: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 0.5, lineHeight: 13 },
  statusMessage: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.5,
    lineHeight: 14,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  dismissArea: { flex: 1 },
  sheet: {
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: 16,
    transform: [{ skewX: '-2deg' }],
  },
  sheetScroll: {
    paddingHorizontal: GameLayout.panelPadding,
    gap: 12,
  },
  sheetTitle: { fontFamily: GameFonts.ui, fontSize: 14, letterSpacing: 2 },
  sheetHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.5,
    lineHeight: 15,
  },
  jsonInput: {
    minHeight: 180,
    maxHeight: 320,
    borderWidth: 1,
    padding: 12,
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    lineHeight: 16,
    textAlignVertical: 'top',
  },
  sheetActions: { flexDirection: 'row', gap: 10 },
  actionButton: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    transform: [{ skewX: '-3deg' }],
  },
  actionLabel: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 1.5 },
  errorText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.4,
    lineHeight: 14,
  },
});
