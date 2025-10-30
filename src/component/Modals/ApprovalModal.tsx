import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Import the icon library

interface ApprovalModalProps {
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
   * @default 'Approve'
   */
  approveText?: string;
  /**
   * The text to display on the rejection/cancel button.
   * @default 'Reject'
   */
  rejectText?: string;
  /**
   * Function to be called when the approve button is pressed.
   */
  onApprove: () => void;
  /**
   * Function to be called when the reject button is pressed.
   * This is also called when the user dismisses the modal (e.g., tapping outside or the close button).
   */
  onReject: () => void;
  onClose: () => void; // Optional close handler
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  visible,
  title,
  message,
  approveText = 'Approve',
  rejectText = 'Reject',
  onApprove,
  onReject,
  onClose
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onReject} // Handles the Android back button
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {/* --- ADDED CLOSE BUTTON --- */}
          <TouchableOpacity style={styles.closeButton} onPress={() => onClose()}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={() => onReject}
            >
              <Text style={[styles.buttonText, styles.rejectButtonText]}>{rejectText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.approveButton]}
              onPress={onApprove}
            >
              <Text style={[styles.buttonText, styles.approveButtonText]}>{approveText}</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent background
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    paddingTop: 48, // Added padding to make space for the close button
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
  // --- STYLE FOR THE NEW CLOSE BUTTON ---
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4, // Makes it easier to tap
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
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 2,
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  approveButton: {
    backgroundColor: '#1A736A', // Using a familiar theme color
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  rejectButtonText: {
    color: '#495057',
  },
  approveButtonText: {
    color: 'white',
  },
});

export default ApprovalModal;

