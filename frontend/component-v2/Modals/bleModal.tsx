import React, {
  useEffect,
  useMemo,
  useCallback,
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CardBoardModal } from "@/component-v2/Card/CardBoardModal";
import { theme } from "@/theme";
import LoadingSpinner from "../Others/LoadingIndicator";
import { useBle } from "@/src/ble/useBle.native";
import { convertBleDeviceId } from "@/src/utils/bleUtils";

type BleConfigModalProp = {
  visible: boolean;
  wifiModalVisible: boolean;
  onClose: () => void;
  onSelectDevice: (boardId: string) => void;
  handleConnectBoard: (boardId: string) => void;
  loading?: boolean;
};

type DeviceRow = {
  id: string;                  // MAC (Android) or UUID (iOS surrogate)
  name: string | null;
  rssi?: number | null;
  isConnectable?: boolean;     // expose from your BLE lib if available
  serviceUuids?: string[];     // from advertisement
  manufacturerId?: number;     // optional
};

const BleConfigModal = ({
  visible,
  wifiModalVisible,
  onClose,
  onSelectDevice,
  handleConnectBoard,
  loading = false,
}: BleConfigModalProp) => {
  
  const { isScanning, devices, startScan, stopScan, connect } = useBle();

  useEffect(() => {
    if (visible && !wifiModalVisible) {
      console.log('Starting BLE scan...');
      startScan();
    }
    return () => stopScan();
  }, [visible]);

  // Debug: Log devices when they change
  useEffect(() => {
    console.log('BLE devices found:', Object.keys(devices).length);
    Object.values(devices).forEach((device: any) => {
      const normalizedId = convertBleDeviceId(device.id);
      console.log('Device:', {
        name: device.name,
        originalId: device.id,
        normalizedId: normalizedId,
        rssi: device.rssi
      });
    });
  }, [devices]);

  const data: DeviceRow[] = useMemo(() => {
    const arr = Object.values(devices) as DeviceRow[];
    return arr.sort((a, b) => {
      const rssiA = a.rssi ?? -9999;
      const rssiB = b.rssi ?? -9999;
      if (rssiA !== rssiB) return rssiB - rssiA;
      const nameA = (a.name ?? "").toLowerCase();
      const nameB = (b.name ?? "").toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [devices]);


  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<DeviceRow>) => {
      // Convert the BLE device ID to the expected format
      const normalizedId = convertBleDeviceId(item.id);
      
      return (
        <View style={styles.card_container}>
          <CardBoardModal
            onConnect={() => handleConnectBoard(normalizedId)} // Use normalized ID
            name={item.name || "Unknown"}
            uuid={item.id} // Keep original for display
          />
        </View>
      );
    },
    [handleConnectBoard]
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      hardwareAccelerated
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Add board with me</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityRole="button">
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {loading ? (
              <View style={styles.loading_indicator_container}>
                <LoadingSpinner size="large" color={theme.colors.primary} message="Verify board Id" />
              </View>
            ) : (
              <View style={styles.listSection}>
                <Text style={styles.subtitle}>
                  Choose the board that has the same UUID as yours
                </Text>

                <FlatList
                  style={styles.list}
                  contentContainerStyle={styles.listContent}
                  data={data}
                  keyExtractor={(item) => item.id}
                  renderItem={renderItem}
                  ListEmptyComponent={
                    <Text style={styles.empty}>
                      {isScanning ? "Scanning for devices…" : "No devices found yet"}
                    </Text>
                  }
                  keyboardShouldPersistTaps="handled"
                  initialNumToRender={8}
                  windowSize={5}
                  removeClippedSubviews={Platform.OS === "android"}
                />
              </View>
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
    backgroundColor: theme.colors.overlayBackground,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '94%',
    maxWidth: 560,
    maxHeight: '82%',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
  },
  header: {
    backgroundColor: '#2c5f54',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: theme.fontSize.header1,
    fontFamily: theme.fontFamily.semibold,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
    flexGrow: 1,
  },
  listSection: {
    flexGrow: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  list: {
    // give the list a height budget so it actually lays out within the modal
    maxHeight: 440,
  },
  listContent: {
    paddingBottom: 12,
  },
  loading_indicator_container: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card_container: {
    marginBottom: 12,
  },
  empty: {
    textAlign: 'center',
    color: '#6b7280',
    paddingVertical: 20,
  },
});

export default BleConfigModal;
