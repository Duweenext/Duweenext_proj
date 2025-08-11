import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ButtonModalL from '@/component-v2/Buttons/ButtonModalL';

interface ManualAddBoardModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (boardId: string) => void;
}

const ManualAddBoardModal: React.FC<ManualAddBoardModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [boardId, setBoardId] = useState('');

  const handleSubmit = () => {
    if (boardId.trim()) {
      onSubmit(boardId.trim());
      setBoardId(''); // Reset input after submit
    }
  };

  const handleClose = () => {
    setBoardId(''); // Reset input when closing
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
            <TextInput
              style={styles.textInput}
              placeholder="Enter board ID"
              placeholderTextColor="#9ca3af"
              value={boardId}
              onChangeText={setBoardId}
              autoCapitalize="none"
              autoCorrect={false}
            />
            
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
    fontSize: 20,
    fontWeight: '600',
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
    fontSize: 16,
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
