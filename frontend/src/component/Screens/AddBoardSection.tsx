import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WifiConfigModal from '../Modals/wificonfigModal';
import { useBoard } from '@/src/api/hooks/useBoard';
import { useBle } from '@/src/ble/useBle.native';
import { WifiConfig } from '@/src/interfaces/wifi';
import AddBoardModal from '../Modals/AddBoardModal';
import BleConfigModal from '../Modals/bleModal';
import ManualAddBoardModal from '../Modals/ManualAddBoardModal';

interface AddBoardSectionProps {
  onSelectBLE?: () => void;
  onManualSubmit?: (boardId: string) => void;
}

const AddBoardSection: React.FC<AddBoardSectionProps> = ({
  onSelectBLE,
  onManualSubmit
}) => {
  const [isBoardExist, setIsBoardExist] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<"manual" | "ble" | "option" | "wifi-config" | "">("");
  const { 
    loading, 
    verifyBoardInformation, 
    setConnectionPassword, 
  } = useBoard();
  
  // State for the LOGICAL Board ID (from characteristic)
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  // FIX: Add state for the PHYSICAL MAC Address (from scan)
  const [selectedMacAddress, setSelectedMacAddress] = useState<string>("");

  const [wifiSubmitting, setWifiSubmitting] = useState(false);

  const { provisionWifi } = useBle();

  const handleAddBoard = () => setModalVisible("option");
  const handleCloseModal = () => setModalVisible("");
  const handleManualSelect = () => setModalVisible("manual");
  const handleBLESelect = () => setModalVisible("ble");
  const handleManualSubmit = (boardId: string) => onManualSubmit?.(boardId);
  const onSelectDevice = (boardId: string) => { /* Can be used to refresh list */ };
  const handleWifiConfigModal = () => setModalVisible("wifi-config");

  // FIX: Update handler to accept both the logical ID and the MAC address
  const handleConnectBoard = async (boardId: string, macAddress: string) => {
    setSelectedBoardId(boardId);
    setSelectedMacAddress(macAddress); // Store the MAC address
    try {
      const res = await verifyBoardInformation(boardId);
      setIsBoardExist(!!res); 
      handleWifiConfigModal();
    } catch (error) {
      console.error("Board verification failed with an unexpected error:", error);
      Alert.alert("Error", "An unexpected error occurred while verifying the board.");
    }
  }

  const handleWifiSubmit = async (values: WifiConfig) => {
    // FIX: Use the stored MAC address for provisioning, not the logical ID
    if (!selectedMacAddress) return;
    setWifiSubmitting(true);
    try {
      await provisionWifi(selectedMacAddress, {
        ssid: values.ssid,
        wifiPassword: values.wifiPassword,
      });

      await setConnectionPassword({ 
        connectionPassword: values.connectionPassword, 
        selectedBoardId: selectedBoardId // API still needs the logical ID
      });

      setModalVisible("");
      onSelectDevice?.(selectedBoardId);
    } catch (err) {
      console.warn("Provisioning/Pairing failed:", err);
      Alert.alert("Provisioning Failed", "Could not complete the setup process. Please try again.");
    } finally {
      setWifiSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Add Board</Text>
        <TouchableOpacity>
          <Ionicons name="help-circle-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAddBoard} activeOpacity={0.8}>
        <Ionicons name="add" size={32} color="#000" />
      </TouchableOpacity>

      <AddBoardModal
        visible={modalVisible === "option"}
        onClose={handleCloseModal}
        onSelectManual={handleManualSelect}
        onSelectBLE={handleBLESelect}
      />

      <BleConfigModal
        visible={modalVisible === "ble"}
        wifiModalVisible={modalVisible === "wifi-config"}
        onClose={handleCloseModal}
        onSelectDevice={onSelectDevice}
        handleConnectBoard={handleConnectBoard}
        loading={loading}
      />

      <ManualAddBoardModal
        visible={modalVisible === "manual"}
        onClose={handleCloseModal}
        onSubmit={handleManualSubmit}
      />

      <WifiConfigModal
        visible={modalVisible === "wifi-config"}
        onClose={handleCloseModal}
        onSubmit={handleWifiSubmit}
        boardId={selectedBoardId}
        submitting={wifiSubmitting}
        isBoardIdExists={isBoardExist}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
  },
  addButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
});

export default AddBoardSection;
