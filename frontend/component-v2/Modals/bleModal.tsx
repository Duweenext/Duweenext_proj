import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CardBoardModal } from '@/component-v2/Card/CardBoardModal';
import { theme } from '@/theme';
import { useBoard } from '@/src/api/useBoard';
import LoadingSpinner from '../Others/LoadingIndicator';



type BleConfigModalProp = {
  visible: boolean;
  onClose: () => void;
  onSelectDevice: (boardId: string) => void;
}

const BleConfigModal = ({
  visible,
  onClose,
  onSelectDevice,
}: BleConfigModalProp) => {
  // const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const { loading, verifyBoardInformation } = useBoard();

  const handleConnectBoard = async (boardId: number) => {
    const res = await verifyBoardInformation(boardId);
    console.log("Response from backend verification : " + res)
  }

  const mockBoards = [
    { id: '11203484', name: 'Esp32', status: 'Available' },
    { id: '41503474', name: 'Esp32', status: 'Available' },
    { id: '99047583', name: 'Esp32', status: 'Available' },
  ];

  // console.log(loading)
  // console.log("BleConfigModal - Loading:", loading);
  // console.log("BleConfigModal - Visible:", visible);
  // console.log("BleConfigModal - Mock boards count:", mockBoards.length);

  return (
    <Modal visible={visible} animationType="fade" transparent={true} statusBarTranslucent={true}>

      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Add board with me</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>

            {loading ?
              <View style={styles.loading_indicator_container}>
                <LoadingSpinner size="large" color={theme.colors.primary} message='Verify board Id' />
              </View>

              : (
                <View>
                  <Text style={styles.subtitle}>choose the board that have the same UUID as yours</Text>

                  <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    {mockBoards.map((board) => (
                      <View key={board.id} style={styles.card_container}>
                        <CardBoardModal
                          onConnect={() => handleConnectBoard(Number(board.id))}
                          name={board.name}
                          uuid={board.id}
                        />
                      </View>
                    ))}
                  </ScrollView>
                </View>)}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  loading_indicator_container: {
    paddingVertical: 40,
  },
  card_container: {
    flexDirection: 'column',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
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
    fontSize: theme.fontSize.header1,
    fontFamily: theme.fontFamily.semibold,
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
    maxHeight: 300,
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
