import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WifiConfigModal from '../Modals/wificonfigModal';
import { useBoard } from '@/src/api/hooks/useBoard';
import { useBle } from '@/src/ble/useBle.native';
import { WifiConfig } from '@/src/interfaces/wifi';
import AddBoardModal from '../Modals/AddBoardModal';
import BleConfigModal from '../Modals/bleModal';
import ManualAddBoardModal from '../Modals/ManualAddBoardModal';
import ConnectionPasswordModal from '@/src/component/Modals/ConnectionPasswordModal';
import { useAuth } from '@/src/auth/context/auth_context';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { BoardRelationship } from '@/src/interfaces/board';

interface AddBoardSectionProps {
  onSelectBLE?: () => void;
  onManualSubmit?: (boardId: string) => void;
  reprovisionBoardId: string;
  onFlowComplete: () => void;
}

const AddBoardSection: React.FC<AddBoardSectionProps> = ({
  reprovisionBoardId,
  onFlowComplete,
}) => {
  const { t } = useTranslation();
  const [isBoardExist, setIsBoardExist] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<"manual" | "ble" | "option" | "wifi-config" | "connect-password" | "">("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [pastBoard, setPastBoard] = useState<BoardRelationship[]>([]);
  const {
    verifyBoardInformation,
    createBoardRelationship,
    refetchBoards,
    verifyConnectionPassword,
    pastAddedBoardId,
    getPastAddedBoardId,
  } = useBoard();

  const [mode, setMode] = useState<'add' | 'reprovision'>(
    reprovisionBoardId ? 'reprovision' : 'add'
  );

  useEffect(() => {
    const fetchPastAddedBoard = async () => {
      const pastBoard = await getPastAddedBoardId();
      if (pastBoard) {
        console.log("Fetched past added board:", pastBoard);
        setPastBoard(pastBoard);
      }
    };

    fetchPastAddedBoard();
  }, []);

  React.useEffect(() => {
    if (reprovisionBoardId && mode === 'reprovision') {
      setSelectedBoardId(reprovisionBoardId);
      setIsBoardExist(true);
      setModalVisible('ble'); 
    }
  }, [reprovisionBoardId, mode]);


  const { user } = useAuth();

  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  const [selectedMacAddress, setSelectedMacAddress] = useState<string>("");

  const [wifiInfo, setWifiInfo] = useState<WifiConfig>();

  const { provisionWifi } = useBle();
  const [isProvisioning, setIsProvisioning] = useState<boolean>(false);

  const handleAddBoard = () => setModalVisible("option");
  const handleCloseModal = () => {
    setModalVisible("");
    if (mode === 'reprovision') {
      onFlowComplete?.();
    }
  };
  const handleManualSelect = () => setModalVisible("manual");
  const handleBLESelect = () => setModalVisible("ble");
  const onSelectDevice = (boardId: string) => { };
  const handleWifiConfigModal = () => setModalVisible("wifi-config");
  const handleConnectedPasswordModal = () => setModalVisible("connect-password");

  const handleConnectionPasswordSubmit = async (password: string) => {
    console.log("Submitting connection password and creating board relationship...", user?.id);
    setSubmitting(false);
    if (user?.id)
      await createBoardRelationship({
        board_id: selectedBoardId,
        con_method: "manual",
        con_password: password,
        user_id: user.id,
      }).then(() => {
        setSubmitting(false);
      });

    setModalVisible("");
  }

  const handlePasswordSubmit = (password: string) => {
    if (isProvisioning) {
      verifyConPasswordAndSubmit(password);
    } else {
      handleConnectionPasswordSubmit(password);
    }
  };

  const handleManualConnect = async (boardId: string) => {
    setSelectedBoardId(boardId);
    setSelectedMacAddress("");
    try {
      const result = await verifyBoardInformation(boardId);
      if (!result) {
        Toast.show({
          type: "errorToast",
          text1: "Board not found",
          text2: "This board ID does not exist.",
        });
        return;
      }
      setIsBoardExist(true);
      handleConnectedPasswordModal();
    } catch (error) {
      console.error("Board verification failed with an unexpected error:", error);
      Alert.alert("Error", "An unexpected error occurred while verifying the board.");
    }
  };

  const handleConnectBoard = async (boardId: string, macAddress: string) => {
    setSubmitting(true);
    setSelectedBoardId(boardId);
    setSelectedMacAddress(macAddress);
    setIsProvisioning(true);
    try {
      const res = await verifyBoardInformation(boardId);
      if (res) {
        Toast.show({
          type: "successToast",
          text1: "Board found",
          text2: "This board ID exists.",
        });
      }
      setIsBoardExist(!!res);
      handleWifiConfigModal();
    } catch (error) {
      console.error("Board verification failed with an unexpected error:", error);
      Alert.alert("Error", "An unexpected error occurred while verifying the board.");
    } finally {
      setSubmitting(false);
      setIsProvisioning(false);
    }
  }

  const handleChangeBoardWifiCredentials = (values: WifiConfig) => {
    setWifiInfo(values);
    setModalVisible("connect-password");
    setIsProvisioning(true);
  };

  const verifyConPasswordAndSubmit = async (password: string) => {
    console.log("Verifying connection password and submitting WiFi credentials...");
    setSubmitting(true);
    if (!wifiInfo) {
      Alert.alert("Error", "WiFi information is missing. Please try again.");
      return;
    }

    if (isBoardExist && user?.id) {
      try {
        console.log("Verifying connection password...");
        console.log("Selected Board ID: " + selectedBoardId);
        console.log("Connection Password: " + password);
        await verifyConnectionPassword(selectedBoardId, password);
        await handleWifiSubmit({ ...wifiInfo, connectionPassword: password });
        await createBoardRelationship({
          board_id: selectedBoardId,
          con_method: "bluetooth",
          con_password: password,
          user_id: user?.id!,
          mac_address: selectedMacAddress
        });
        console.log("Connection password verified and WiFi submitted successfully.");
      } catch (error) {
        console.error("Connection password verification failed:", error);
        Alert.alert("Error", "Connection password is incorrect. Please try again.");
      }
    } else {
      await handleWifiSubmit({ ...wifiInfo, connectionPassword: password });
    }
    setSubmitting(false);
    setModalVisible("");
  }

  const handleWifiSubmit = async (values: WifiConfig) => {
    console.log("Hello : " + selectedMacAddress)
    console.log("Selected Board ID: " + selectedBoardId)
    console.log("WiFi Credentials: ", { ssid: values.ssid, wifiPassword: values.wifiPassword })
    setIsProvisioning(true);

    if (!selectedMacAddress) {
      console.error("No MAC address selected!");
      Alert.alert("Error", "No device selected. Please select a device first.");
      return;
    }

    try {
      console.log("Starting WiFi provisioning...");
      await provisionWifi(selectedMacAddress, {
        ssid: values.ssid,
        wifiPassword: values.wifiPassword,
      });
      console.log("WiFi provisioning completed successfully!");
      console.log("WiFi provisioning completed successfully!");

      await refetchBoards();

      if (user?.id) {
        console.log("Creating board relationship...", values);
        await createBoardRelationship({
          board_id: selectedBoardId,
          con_method: "bluetooth",
          con_password: values.connectionPassword,
          user_id: user.id,
          board_name: values.boardModelName,
          mac_address: selectedMacAddress
        });
        console.log("Board relationship created successfully!");
      }

      setModalVisible("");
      onSelectDevice?.(selectedBoardId);
    } catch (err) {
      console.error("Provisioning/Pairing failed:", err);
      Alert.alert("Provisioning Failed", `Could not complete the setup process: ${(err as Error)?.message || String(err)}`);
    } finally {
      setIsProvisioning(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{t("Add Board")}</Text>
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
        loading={submitting}
      />

      <ManualAddBoardModal
        visible={modalVisible === "manual"}
        onClose={handleCloseModal}
        onSubmit={handleManualConnect}
        pastBoards={pastBoard}
      />

      <WifiConfigModal
        visible={modalVisible === "wifi-config"}
        onClose={handleCloseModal}
        onSubmit={isBoardExist ? handleChangeBoardWifiCredentials : handleWifiSubmit}
        boardId={selectedBoardId}
        isBoardIdExists={isBoardExist}
      />

      <ConnectionPasswordModal
        visible={modalVisible === "connect-password"}
        onClose={handleCloseModal}
        onSubmit={handlePasswordSubmit}
      // loading={submitting}
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
