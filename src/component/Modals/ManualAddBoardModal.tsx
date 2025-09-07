import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import TextFieldModal from '../TextFields/TextFieldModal/TextFieldModal';
import ButtonModalL from '../Buttons/ButtonModalL';
import z from 'zod';

interface ManualAddBoardModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (boardId: string) => void;
}

export const boardIdSchema = z.object({
  boardId: z.string().trim()
    .min(1, "Board ID is required")
    .max(32, "Max 32 characters")
    .regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, hyphen, underscore"),
})

export type BoardIdForm = z.infer<typeof boardIdSchema>;

const ManualAddBoardModal: React.FC<ManualAddBoardModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [boardId, setBoardId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const res = boardIdSchema.safeParse({ boardId });
    if (!res.success) {
      setError(res.error.issues[0]?.message ?? 'Invalid input');
      return;
    }
    onSubmit(boardId.trim());
    setBoardId('');
    onClose();
    setError(null);
  };

  const handleClose = () => {
    setBoardId('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add board</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.description}>
              Locates the board ID on the right side of the board.
            </Text>

            {/* Board ID Input */}
            <View>
              <TextFieldModal
                value={boardId}
                onChangeText={setBoardId}
                placeholder="Enter board ID"
                textColor={theme.colors.black}
                borderColor={theme.colors.black}
              />

              {error && <Text style={{ color: theme.colors.fail, marginTop: 4, fontSize: 12 }}>{error}</Text>}
            </View>
            {/* Submit Button */}
            <View style={styles.buttonContainer}>
              <ButtonModalL
                text="Submit"
                filledColor="#000000"
                textColor="white"
                onPress={handleSubmit}
                marginBottom={0}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#2c5f54',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSize.header2,
    fontFamily: theme.fontFamily.bold,
    color: 'white',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
    gap: 20,
  },
  description: {
    fontSize: theme.fontSize.description,
    fontFamily: theme.fontFamily.regular,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#ffffff',
  },
  buttonContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
});

export default ManualAddBoardModal;
