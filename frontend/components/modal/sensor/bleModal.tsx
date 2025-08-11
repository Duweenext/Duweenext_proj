import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const mockBoards = [
  { id: '11203484', name: 'Esp32', status: 'Available' },
  { id: '41503474', name: 'Esp32', status: 'Available' },
  { id: '99047583', name: 'Esp32', status: 'Available' },
];

const BleConfigModal = ({
  visible,
  onClose,
  onSelectDevice,
}: {
  visible: boolean;
  onClose: () => void;
  onSelectDevice: (boardId: string) => void;
}) => {
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

  const handleDeviceSelect = (boardId: string) => {
    setSelectedDevices(prev => 
      prev.includes(boardId) 
        ? prev.filter(id => id !== boardId)
        : [...prev, boardId]
    );
  };

  const handleSubmit = () => {
    selectedDevices.forEach(deviceId => onSelectDevice(deviceId));
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} statusBarTranslucent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add board</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.subtitle}>choose the board that have the same UUID as yours</Text>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
              {mockBoards.map((board) => (
                <View key={board.id} style={styles.deviceCard}>
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>{board.name}</Text>
                    <Text style={styles.deviceUuid}>UUID: {board.id}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleDeviceSelect(board.id)} 
                    style={[
                      styles.connectButton,
                      selectedDevices.includes(board.id) && styles.connectedButton
                    ]}
                  >
                    <Text style={[
                      styles.connectButtonText,
                      selectedDevices.includes(board.id) && styles.connectedButtonText
                    ]}>
                      {selectedDevices.includes(board.id) ? 'Selected' : 'Connect'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            {/* Submit Button */}
            <TouchableOpacity 
              onPress={handleSubmit} 
              style={[
                styles.submitButton,
                selectedDevices.length === 0 && styles.submitButtonDisabled
              ]}
              disabled={selectedDevices.length === 0}
            >
              <Text style={[
                styles.submitButtonText,
                selectedDevices.length === 0 && styles.submitButtonTextDisabled
              ]}>
                Submit
              </Text>
            </TouchableOpacity>
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
    maxHeight: '80%',
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
    flex: 1,
    textAlign: 'center',
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
    padding: 20,
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'left',
  },
  scrollContainer: {
    flex: 1,
    marginBottom: 20,
  },
  deviceCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000000',
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  deviceUuid: {
    fontSize: 14,
    color: '#6b7280',
  },
  connectButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  connectedButton: {
    backgroundColor: '#2c5f54',
  },
  connectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  connectedButtonText: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: '#6b7280',
  },
});

export default BleConfigModal;
