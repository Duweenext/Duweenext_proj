import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AddBoardModal from '@/src/component/Modals/AddBoardModal';
import ManualAddBoardModal from '@/component-v2/Modals/ManualAddBoardModal';
import BleConfigModal from '@/src/component/Modals/bleModal';
import WifiConfigModal from '@/src/component/Modals/wificonfigModal';
import { useBoard } from '@/src/api/hooks/useBoard';
import { useBle } from '@/src/ble/useBle.native';
import { WifiConfig } from '@/src/interfaces/wifi';
import { useAuth } from '@/src/auth/context/auth_context';
import ConnectionPasswordModal from '../Modals/ConnectionPasswordModal';

interface AddBoardSectionProps {
  onSelectBLE?: () => void;
  onManualSubmit?: (boardId: string) => void;
}

const AddBoardSection: React.FC<AddBoardSectionProps> = ({
  onSelectBLE,
  onManualSubmit
}) => {
  const [isBoardExist, setIsBoardExist] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<"manual" | "ble" | "option" | "wifi-config" | "connect-password" | "">("");
  const {
    loading,
    verifyBoardInformation,
    createBoardRelationship,
  } = useBoard();
  
  // State for the LOGICAL Board ID (from characteristic)
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  // FIX: Add state for the PHYSICAL MAC Address (from scan)
  const [selectedMacAddress, setSelectedMacAddress] = useState<string>("");

  const [wifiSubmitting, setWifiSubmitting] = useState(false);

  const { provisionWifi } = useBle();
  // const {user} = useAuth()

  const handleAddBoard = () => setModalVisible("option");
  const handleCloseModal = () => setModalVisible("");
  const handleManualSelect = () => setModalVisible("manual");
  const handleBLESelect = () => setModalVisible("ble");
  const handleConnectedPasswordModal = () => setModalVisible("connect-password");
  const handleManualConnect = async (boardId: string) => {
    setSelectedBoardId(boardId);
    setSelectedMacAddress(""); // No MAC address for manual entry
    try {
      // const res = await verifyBoardInformation(boardId);
      setIsBoardExist(true); 
      handleConnectedPasswordModal();
      console.log("Manual board ID submitted:", boardId);
    } catch (error) {
      console.error("Board verification failed with an unexpected error:", error);
      Alert.alert("Error", "An unexpected error occurred while verifying the board.");
    }
  };

  const handleManualSubmit = async (password: string) => {
    await createBoardRelationship({ 
            board_id: selectedBoardId, 
            con_method: "manual",
            con_password: password,
            user_id: 10, 
        });
  }
  
  const onSelectDevice = (boardId: string) => {  };
  const handleWifiConfigModal = () => setModalVisible("wifi-config");

  const handleConnectBoard = async (boardId: string, macAddress?: string) => {
    setSelectedBoardId(boardId);
    setSelectedMacAddress(macAddress || "");
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
    if (!selectedMacAddress || !selectedBoardId) return; 
    setWifiSubmitting(true);
    
    try {
        console.log("Attempting to provision Wi-Fi...");
        await provisionWifi(selectedMacAddress, {
            ssid: values.ssid,
            wifiPassword: values.wifiPassword,
        });

        console.log("Provisioning successful. Creating board relationship...");
        await createBoardRelationship({ 
            board_id: selectedBoardId, 
            board_name: values.boardModelName, 
            con_method: "bluetooth",
            con_password: values.connectionPassword,
            user_id: 2, 
        });

        Alert.alert("Success!", "Board has been configured and registered.");
        setModalVisible("");
        onSelectDevice?.(selectedBoardId);

    } catch (err) {
        console.warn("Provisioning/Pairing failed:", err);
        let errorMessage = "Could not complete the setup process.";
        if (err && typeof err === "object" && "message" in err && typeof (err as any).message === "string") {
            errorMessage = (err as any).message;
        }
        Alert.alert("Setup Failed", errorMessage);
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
        onSubmit={handleManualConnect}
      />

      <WifiConfigModal
        visible={modalVisible === "wifi-config"}
        onClose={handleCloseModal}
        onSubmit={handleWifiSubmit}
        boardId={selectedBoardId}
        submitting={wifiSubmitting}
        isBoardIdExists={isBoardExist}
      />

      <ConnectionPasswordModal
        visible={modalVisible === "connect-password"}
        onClose={handleCloseModal}
        onSubmit={handleManualSubmit}
        boardId={selectedBoardId}
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
