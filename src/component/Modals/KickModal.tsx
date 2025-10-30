import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ConfirmationModalProps {
  /**
   * Controls whether the modal is visible or not.
   */
  visible: boolean;
  /**
   * The main title of the modal.
   */
  title: string;
  /**
   * The descriptive message or question inside the modal.
   */
  message: string;
  /**
   * The text to display on the main confirmation button.
   * @default 'Confirm'
   */
  confirmText?: string;
  /**
   * Optional custom styles for the confirmation button, e.g., to make it red for a destructive action.
   */
  confirmButtonStyle?: StyleProp<ViewStyle>;
  confirmButtonTextStyle?: StyleProp<TextStyle>;
  onConfirm: () => void;
  onClose: () => void;
}

const KickConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  confirmButtonStyle,
  confirmButtonTextStyle,
  onConfirm,
  onClose,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose} // Handles the Android back button
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton, confirmButtonStyle]}
              onPress={onConfirm}
            >
              <Text style={[styles.buttonText, styles.confirmButtonText, confirmButtonTextStyle]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    paddingTop: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxWidth: 400,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Center the single button
    width: '100%',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '60%', // Give the button a decent width
  },
  confirmButton: {
    backgroundColor: '#D9534F', // A common color for destructive actions
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmButtonText: {
    color: 'white',
  },
});

export default KickConfirmationModal;
