// component-v2/Modals/ModalViewNote.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { theme as themeStyle } from '@/theme';

interface ModalViewNoteProps {
  visible: boolean;
  onClose: () => void;
  note: string;
}

const ModalViewNote: React.FC<ModalViewNoteProps> = ({ visible, onClose, note }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Note</Text>
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>{note}</Text>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: themeStyle.colors.white,
    borderRadius: parseInt(themeStyle.borderRadius.lg, 10),
    padding: 20,
    width: '100%',
    maxWidth: 360,
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
    fontSize: 18,
    fontFamily: themeStyle.fontFamily.semibold,
    marginBottom: 12,
    color: '#111827',
  },
  noteBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  noteText: {
    fontSize: 14,
    fontFamily: themeStyle.fontFamily.regular,
    color: '#374151',
    lineHeight: 20,
  },
  closeBtn: {
    backgroundColor: themeStyle.colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 10,
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: themeStyle.fontFamily.medium,
  },
});

export default ModalViewNote;
