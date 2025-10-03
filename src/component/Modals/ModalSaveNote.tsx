import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { theme as themeStyle } from '@/theme';

interface ModalSaveNoteProps {
  visible: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
  initialNote?: string;
}

const ModalSaveNote: React.FC<ModalSaveNoteProps> = ({
  visible,
  onClose,
  onSave,
  initialNote = '',
}) => {
  const [note, setNote] = useState(initialNote);

  const handleSave = () => {
    onSave(note.trim());
    setNote('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Resolve Notification</Text>
          <Text style={styles.subtitle}>
            Add a note before resolving this notification
          </Text>

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Enter your note here..."
            placeholderTextColor="#9ca3af"
            multiline
            style={styles.textInput}
          />

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancel]}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={[styles.button, styles.save]}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ModalSaveNote;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: themeStyle.colors.white,
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
  },
  title: {
    fontSize: parseInt(themeStyle.fontSize['header-2'], 10),
    fontFamily: themeStyle.fontFamily.semibold,
    marginBottom: 4,
    color: themeStyle.colors.black,
  },
  subtitle: {
    fontSize: parseInt(themeStyle.fontSize.description, 10),
    fontFamily: themeStyle.fontFamily.regular,
    marginBottom: 12,
    color: '#4b5563',
  },
  textInput: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 16,
    color: themeStyle.colors.black,
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  button: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  cancel: { backgroundColor: '#f3f4f6' },
  cancelText: { color: '#111827', fontFamily: themeStyle.fontFamily.medium },
  save: { backgroundColor: themeStyle.colors.primary },
  saveText: { color: '#fff', fontFamily: themeStyle.fontFamily.semibold },
});
