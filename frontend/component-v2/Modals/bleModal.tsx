// components/BleConfigModal.tsx
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CardBoardModal } from "@/component-v2/Card/CardBoardModal";
import { theme } from "@/theme";
import { useBoard } from "@/src/api/useBoard";
import LoadingSpinner from "../Others/LoadingIndicator";
import { useBle } from "@/src/ble/useBle";
import WifiConfigModal from "./wificonfigModal";

type BleConfigModalProp = {
  visible: boolean;
  onClose: () => void;
  onSelectDevice: (boardId: string) => void;
};

type DeviceRow = {
  id: string;
  name: string | null;
  rssi?: number | null;
};

const BleConfigModal = ({
  visible,
  onClose,
  onSelectDevice,
}: BleConfigModalProp) => {
  const { loading, verifyBoardInformation } = useBoard();
  const { isScanning, devices, startScan, stopScan, connect } = useBle();

  // ---- Wifi Config modal state ----
  const [wifiModalVisible, setWifiModalVisible] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  const [wifiSubmitting, setWifiSubmitting] = useState(false);

  // Start scanning on open; stop on close/unmount
  useEffect(() => {
    if (visible && !wifiModalVisible) startScan();
    return () => stopScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Flatten + sort by signal then name
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

  const handleConnectBoard = useCallback(
    async (boardId: string) => {
      try {
        // 1) Connect via BLE first (optional depending on your flow)
        await connect(boardId);
      } catch (err) {
        console.warn("BLE connect failed:", err);
      }

      try {
        // 2) Verify with backend. Treat any truthy response as "verified"
        const res = await verifyBoardInformation(
          // adjust casting if your API expects numeric board IDs
          boardId as unknown as number
        );

        // If verified, show Wifi config modal
        if (res) {
          setSelectedBoardId(boardId);
          setWifiModalVisible(true);
          onClose();
        } else {
          // Not verified → still propagate selection (or show error/toast)
          onSelectDevice?.(boardId);
        }

        console.log("verifyBoardInformation response:", res);
      } catch (e) {
        console.warn("verifyBoardInformation failed:", e);
        // Fallback behavior if verify fails
        onSelectDevice?.(boardId);
      }
    },
    [connect, onSelectDevice, verifyBoardInformation]
  );

  // Submit from WifiConfigModal
  const handleWifiSubmit = useCallback(
    async (values: { ssid: string; wifiPassword: string; connectionPassword: string }) => {
      if (!selectedBoardId) return;
      setWifiSubmitting(true);
      try {
        // TODO: Send credentials to the device (BLE write or API call)
        // await sendWifiCreds(selectedBoardId, values)

        // You can close both modals or just the WiFi one:
        setWifiModalVisible(false);
        onSelectDevice?.(selectedBoardId);
      } catch (err) {
        console.warn("Sending WiFi credentials failed:", err);
      } finally {
        setWifiSubmitting(false);
      }
    },
    [onSelectDevice, selectedBoardId]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<DeviceRow>) => (
      <View style={styles.card_container}>
        <CardBoardModal
          onConnect={() => handleConnectBoard(item.id)}
          name={item.name || "Unknown"}
          uuid={item.id}
        />
      </View>
    ),
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

      {/* Wifi Config Modal (opens after verify success) */}
      <WifiConfigModal
        visible={wifiModalVisible}
        onClose={() => setWifiModalVisible(false)}
        onSubmit={handleWifiSubmit}
        boardId={selectedBoardId}
        submitting={wifiSubmitting}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
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
