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
  getAppVersion,
  serializeProgressBackup,
  validateProgressBackupJson,
} from '@/lib/progress-backup';

const IMPORT_CONFIRM_MESSAGE =
  'This will replace your current local save with the imported backup:\n\n' +
  '• XP, level, and reputation\n' +
  '• Completed quests and chapters\n' +
  '• User-created quests\n' +
  '• Character relationships\n' +
  '• Unlocked rewards\n\n' +
  'Your current progress will be overwritten.';

export function ProgressBackupPanel() {
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
    const json = serializeProgressBackup(playerProgress);
    setExportJson(json);

    if (Platform.OS === 'web') {
      const downloaded = downloadProgressBackupJson(json, buildProgressBackupFilename());
      if (downloaded) {
        clearStatusLater('Progress backup downloaded.');
        return;
      }
    } else {
      setExportVisible(true);
      try {
        await Share.share({
          message: json,
          title: 'Pioneer Progress Backup',
        });
        clearStatusLater('Backup shared. Copy from the modal if needed.');
      } catch {
        clearStatusLater('Copy the backup JSON from the modal below.');
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
      clearStatusLater('Backup JSON copied to clipboard.');
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

    await importProgress(result.playerProgress);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    closeImportModal();
    clearStatusLater(
      `Progress imported from backup v${result.backup.appVersion} (${result.backup.exportedAt.slice(0, 10)}).`,
    );
  };

  const requestImport = () => {
    const result = validateProgressBackupJson(importJson);
    if (!result.ok) {
      setImportError(result.error);
      return;
    }

    setImportError(null);

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Import Progress\n\n${IMPORT_CONFIRM_MESSAGE}`);
      if (confirmed) void confirmImport(importJson);
      return;
    }

    Alert.alert('Import Progress', IMPORT_CONFIRM_MESSAGE, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Import',
        style: 'destructive',
        onPress: () => void confirmImport(importJson),
      },
    ]);
  };

  return (
    <>
      <View
        style={[
          styles.panel,
          { backgroundColor: palette.panel, borderColor: palette.panelBorder },
        ]}>
        <Text style={[styles.sectionLabel, { color: palette.gold }]}>BACKUP</Text>
        <Text style={[styles.sectionHint, { color: palette.fog }]}>
          Experimental local backup. Exports and imports save data on this device only — no cloud,
          no account sync.
        </Text>
        <Text style={[styles.versionHint, { color: palette.fog }]}>
          App version {getAppVersion()}
        </Text>

        <Pressable
          onPress={() => void handleExport()}
          style={[styles.toolButton, { borderColor: palette.gold, backgroundColor: palette.ink }]}>
          <Text style={[styles.toolLabel, { color: palette.bone }]}>EXPORT PROGRESS</Text>
          <Text style={[styles.toolHint, { color: palette.fog }]}>
            {Platform.OS === 'web'
              ? 'Download a JSON backup file with your current save.'
              : 'Share or copy a JSON backup of your current save.'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setImportVisible(true)}
          style={[styles.toolButton, { borderColor: palette.panelBorder, backgroundColor: palette.ink }]}>
          <Text style={[styles.toolLabel, { color: palette.bone }]}>IMPORT PROGRESS</Text>
          <Text style={[styles.toolHint, { color: palette.fog }]}>
            Paste a previously exported JSON backup to replace this save.
          </Text>
        </Pressable>

        {statusMessage ? (
          <Text style={[styles.statusMessage, { color: palette.accent }]}>{statusMessage}</Text>
        ) : null}
      </View>

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
              <Text style={[styles.sheetTitle, { color: palette.bone }]}>EXPORT BACKUP JSON</Text>
              <Text style={[styles.sheetHint, { color: palette.fog }]}>
                Copy this JSON or use your platform share sheet to store it safely.
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
              <Text style={[styles.sheetTitle, { color: palette.bone }]}>IMPORT BACKUP JSON</Text>
              <Text style={[styles.sheetHint, { color: palette.fog }]}>
                Paste an exported backup below. Import replaces your current local progress after
                confirmation.
              </Text>
              <TextInput
                multiline
                value={importJson}
                onChangeText={(text) => {
                  setImportJson(text);
                  if (importError) setImportError(null);
                }}
                placeholder="Paste backup JSON here..."
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
                  <Text style={[styles.actionLabel, { color: palette.bone }]}>IMPORT PROGRESS</Text>
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
