import React, {
  useEffect,
  useMemo,
  useCallback,
  useState,
} from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ListRenderItemInfo,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CardBoardModal } from "@/component-v2/Card/CardBoardModal";
import { theme } from "@/theme";
import LoadingSpinner from "../Others/LoadingIndicator";
import { useBle } from "@/src/ble/useBle.native";

type BleConfigModalProp = {
  visible: boolean;
  wifiModalVisible: boolean;
  onClose: () => void;
  onSelectDevice: (boardId: string) => void;
  // This prop expects a function that receives both the logical ID and the MAC address
  handleConnectBoard: (boardId: string, macAddress: string) => void;
  loading?: boolean;
};

type DeviceRow = {
  id: string; // This is the MAC Address on Android
  name: string | null;
  rssi?: number | null;
};

const BleConfigModal: React.FC<BleConfigModalProp> = ({
  visible,
  wifiModalVisible,
  onClose,
  handleConnectBoard,
  loading = false,
}) => {
  
  const { isScanning, devices, startScan, stopScan, connectAndReadBoardId } = useBle();
  const [connectingDeviceId, setConnectingDeviceId] = useState<string | null>(null);

  useEffect(() => {
    if (visible && !wifiModalVisible) {
      startScan();
    } else {
      stopScan();
    }
    if (!visible) {
      setConnectingDeviceId(null);
    }
    return () => stopScan();
  }, [visible, wifiModalVisible]);

  const data: DeviceRow[] = useMemo(() => {
    const arr = Object.values(devices) as DeviceRow[];
    return arr.sort((a, b) => (b.rssi ?? -999) - (a.rssi ?? -999));
  }, [devices]);

  const onDeviceSelected = useCallback(async (macAddress: string) => {
    setConnectingDeviceId(macAddress);
    try {
      // The hook uses the macAddress to connect and read the logical ID
      const boardIdFromChar = await connectAndReadBoardId(macAddress);
      
      if (boardIdFromChar) {
        // Pass both the logical ID (boardIdFromChar) and the physical MAC address back
        handleConnectBoard(boardIdFromChar, macAddress);
      } else {
        Alert.alert("Error", "Could not read the Board ID from the device. Please try again.");
      }
    } catch (error) {
      Alert.alert("Connection Failed", "An unexpected error occurred.");
    } finally {
      setConnectingDeviceId(null);
    }
  }, [connectAndReadBoardId, handleConnectBoard]);


  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<DeviceRow>) => (
      <View style={styles.card_container}>
        <CardBoardModal
          onConnect={() => onDeviceSelected(item.id)}
          name={item.name || "Unknown"}
          uuid={item.id} // The card displays the MAC address (item.id)
          isConnecting={connectingDeviceId === item.id}
        />
      </View>
    ),
    [onDeviceSelected, connectingDeviceId]
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Board</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            {loading ? (
              <LoadingSpinner message="Verifying Board ID..." />
            ) : (
              <>
                <Text style={styles.subtitle}>Select your device from the list below.</Text>
                <FlatList
                  data={data}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.id}
                  ListEmptyComponent={<Text style={styles.empty}>{isScanning ? "Scanning..." : "No devices found."}</Text>}
                />
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        overflow: 'hidden',
    },
    header: {
        backgroundColor: '#2c5f54',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 16,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 16,
        textAlign: 'center',
    },
    card_container: {
        marginBottom: 12,
    },
    empty: {
        textAlign: 'center',
        color: '#6b7280',
        paddingVertical: 40,
        fontSize: 16,
    },
});

export default BleConfigModal;
