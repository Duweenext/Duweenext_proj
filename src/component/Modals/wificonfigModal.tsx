import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  PermissionsAndroid, 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import TextFieldModal from '../TextFields/TextFieldModal/TextFieldModal';
import ButtonModalL from '../Buttons/ButtonModalL';
import { WifiConfig } from '@/src/interfaces/wifi';
import { z } from "zod";
import { useTranslation } from 'react-i18next';
import WifiManager from 'react-native-wifi-reborn'; // --- ADDED ---

// ... (Your type definitions: WifiFormData, WifiConfigModalProps, COLORS, wifiSchema, WifiForm, mapZodErrors) ...
// --- NO CHANGES NEEDED to your types or Zod schema ---

export type WifiFormData = {
  ssid: string;
  wifiPassword: string;
  connectionPassword: string;
  boardModelName: string;
};

interface WifiConfigModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: WifiConfig) => void;
  boardId: string;
  isBoardIdExists?: boolean;
}

const COLORS = {
  overlay: theme.colors.overlayBackground,
  cardBg: '#ffffff',
  headerText: '#0b3a35',
  border: '#111111',
  placeholder: '#C7C7C7',
  label: '#6b7280',
  button: '#000000',
  error: '#ef4444',
};

export const wifiSchema = z.object({
  ssid: z.string().trim()
    .min(1, "Wi-Fi name is required")
    .max(32, "Max 32 characters")
    .regex(/^[A-Za-z0-9 ._-]+$/, "Use letters, numbers, space, dot, hyphen, underscore"),
  wifiPassword: z.string().min(1, "At least 1 character"),
  connectionPassword: z.string().optional(),     // conditional rule added in superRefine
  boardModelName: z.string().trim().min(1, "Board name is required"),
  isExist: z.boolean(),
}).superRefine((val, ctx) => {
  if (!val.isExist && (!val.connectionPassword || val.connectionPassword.trim() === "")) {
    ctx.addIssue({ path: ["connectionPassword"], code: z.ZodIssueCode.custom, message: "Connection password is required" });
  }
});

export type WifiForm = z.infer<typeof wifiSchema>;

const mapZodErrors = (issues: z.ZodIssue[]) => {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const key = String(i.path[0] ?? "form");
    if (!out[key]) out[key] = i.message; 
  }
  return out;
};


// --- ADDED: Function to request Android permissions ---
const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    return true; // iOS doesn't require this specific permission for scanning
  }
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission Required',
        message: 'This app needs to access your location to scan for Wi-Fi networks.',
        buttonPositive: 'OK',
        buttonNegative: 'Cancel',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Location permission granted');
      return true;
    } else {
      console.log('Location permission denied');
      return false;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
};

const WifiConfigModal: React.FC<WifiConfigModalProps> = ({
  visible,
  onClose,
  onSubmit,
  boardId,
  isBoardIdExists = true,
}) => {
  const {t} = useTranslation();
  const [errors, setErrors] = useState<Record<string, string>>();
  const [wifiName, setWifiName] = useState<string>('');
  const [wifiPassword, setWifiPassword] = useState<string>('');
  const [connectionPassword, setConnectionPassword] = useState<string>('');
  const [boardModelName, setBoardModelName] = useState<string>('');

  const [openSection, setOpenSection] = useState<'find' | 'manual'>('find');
  const [nearbyWifis, setNearbyWifis] = useState<string[]>([]);
  const [isFetchingWifis, setIsFetchingWifis] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadNearbyWifis = async () => {
    setIsFetchingWifis(true);
    setFetchError(null);
    setNearbyWifis([]);

    // 1. Request Permission
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setFetchError(t("Location permission is required to scan for Wi-Fi."));
      setIsFetchingWifis(false);
      return;
    }

    // 2. Scan for Wi-Fi
    try {
      const wifiArray = await WifiManager.reScanAndLoadWifiList();
      const ssids = wifiArray
        .map(wifi => wifi.SSID)
        .filter((ssid): ssid is string => ssid != null && ssid.length > 0); // Type guard to filter null/empty

      const uniqueSSIDs = Array.from(new Set(ssids));
      setNearbyWifis(uniqueSSIDs);
      
      if (uniqueSSIDs.length === 0) {
        setFetchError(t("No Wi-Fi networks found."));
      }

    } catch (error: any) {
      console.error("Failed to fetch Wi-Fi:", error);
      if (error.message.includes("location service is not enabled")) {
        setFetchError(t("Please turn on your device's Location services."));
      } else {
        setFetchError(t("Failed to scan for Wi-Fi. Please try again."));
      }
    } finally {
      setIsFetchingWifis(false);
    }
  };

  useEffect(() => {
    if (visible && openSection === 'find') {
      loadNearbyWifis();
    }
  }, [visible, openSection]);

  const handleWifiSelect = (ssid: string) => {
    setWifiName(ssid);       
    setOpenSection('manual'); 
    setErrors(undefined);   
  };

  const validateInput = () => {
    const form = {
      ssid: wifiName,
      wifiPassword,
      connectionPassword,
      boardModelName,
      isExist: isBoardIdExists,
    };

    const res = wifiSchema.safeParse(form);
    if (!res.success) {
      setErrors(mapZodErrors(res.error.issues));
      return false;
    }
    setErrors(undefined); 
    return true;
  }

  const closeAndReset = () => {
    onClose();
    setWifiName('');
    setWifiPassword('');
    setConnectionPassword('');
    setBoardModelName('');
    setErrors(undefined);
    setOpenSection('find');
    setNearbyWifis([]);
    setFetchError(null);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={closeAndReset}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t("Wifi configuration")}</Text>
            <TouchableOpacity
              onPress={closeAndReset}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close dialog"
            >
              <Ionicons name="close" size={22} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Board id (small helper text) */}
          <Text style={styles.boardId}>{t("Board ID")}: {boardId}</Text>

          {/* Form */}
          <View style={styles.body}>

            {/* --- Section 1: Find your Wi-Fi --- */}
            {/* --- Section 1: Find your Wi-Fi --- */}
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => setOpenSection(openSection === 'find' ? 'manual' : 'find')}
              activeOpacity={0.7} // Keep the opacity feedback
            >
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>{t('Find your Wi-Fi')}</Text>
                {/* --- ADDED REFRESH BUTTON --- */}
                <TouchableOpacity
                  onPress={() => {
                    // Only refresh if the section is already open
                    if (openSection === 'find') {
                      loadNearbyWifis();
                    }
                  }}
                  style={styles.refreshButton}
                  disabled={isFetchingWifis} // Disable button while loading
                >
                  <Ionicons 
                    name="refresh" 
                    size={20} 
                    color={isFetchingWifis ? '#999' : COLORS.headerText} // Gray out icon when loading
                  />
                </TouchableOpacity>
              </View>
              <Ionicons name={openSection === 'find' ? "chevron-up" : "chevron-down"} size={20} color={COLORS.headerText} />
            </TouchableOpacity>

            {openSection === 'find' && (
              <View style={styles.sectionContent}>
                {isFetchingWifis ? (
                  <View style={styles.wifiListContainer}>
                    <ActivityIndicator size="large" color={COLORS.button} />
                    <Text style={styles.wifiListStatus}>{t("Scanning for networks...")}</Text>
                  </View>
                ) : fetchError ? (
                  <View style={styles.wifiListContainer}>
                    {/* UPDATED: Show error message inline */}
                    <Text style={[styles.error, { marginBottom: 0, textAlign: 'center' }]}>{fetchError}</Text>
                  </View>
                ) : (
                  <FlatList
                    data={nearbyWifis}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={styles.wifiItem} onPress={() => handleWifiSelect(item)}>
                        <Ionicons name="wifi" size={20} color="#333" />
                        <Text style={styles.wifiItemText}>{item}</Text>

                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                      <View style={styles.wifiListContainer}>
                        <Text style={styles.wifiListStatus}>{t("No Wi-Fi networks found.")}</Text>
                      </View>
                    }
                    style={styles.wifiList}
                  />
                )}
              </View>
            )}

            {/* --- Section 2: Input Manually --- */}
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => setOpenSection(openSection === 'manual' ? 'find' : 'manual')}
            >
              <Text style={styles.sectionTitle}>{t('Input your Wi-Fi manually')}</Text>
              <Ionicons name={openSection === 'manual' ? "chevron-up" : "chevron-down"} size={20} color={COLORS.headerText} />
            </TouchableOpacity>

            {openSection === 'manual' && (
              <View style={styles.sectionContent}>
                {/* --- Your existing form --- */}
                <Text style={styles.label}>{t("Wifi name")}</Text>
                <View style={styles.inputWrap}>
                  <TextFieldModal
                    onChangeText={setWifiName}
                    value={wifiName}
                    placeholder={t("Enter wifi name")}
                    borderColor={theme.colors.black}
                    inputKind='ssid'
                    type='text'
                  />
                </View>
                {errors?.ssid && <Text style={styles.error}>{errors.ssid}</Text>}

                {/* Wifi password */}
                <Text style={[styles.label, { marginTop: 12 }]}>{t("Wifi password")}</Text>
                <View style={styles.inputWrap}>
                  <TextFieldModal
                    onChangeText={setWifiPassword}
                    value={wifiPassword}
                    placeholder={t("Enter Wifi password")}
                    borderColor={theme.colors.black}
                    type='password'
                  />
                </View>
                {errors?.wifiPassword && <Text style={styles.error}>{errors.wifiPassword}</Text>}
                
                {/* Connection Password (Conditional) */}
                {!isBoardIdExists && (
                  <>
                    <Text style={[styles.label, { marginTop: 12 }]}>{t("Connection password")}</Text>
                    <View style={styles.inputWrap}>
                      <TextFieldModal
                        onChangeText={setConnectionPassword}
                        value={connectionPassword}
                        placeholder={t("Enter Connection password")}
                        borderColor={theme.colors.black}
                        type='password'
                      />
                    </View>
                    {errors?.connectionPassword && <Text style={styles.error}>{errors.connectionPassword}</Text>}
                  </>
                )}
                
                {/* Board Name */}
                <Text style={[styles.label, { marginTop: 12 }]}>{t("Board name")}</Text>
                <View style={styles.inputWrap}>
                  <TextFieldModal
                    onChangeText={setBoardModelName}
                    value={boardModelName}
                    placeholder={t("Enter Board Model Name")}
                    borderColor={theme.colors.black}
                  />
                </View>
                {errors?.boardModelName && <Text style={styles.error}>{errors.boardModelName}</Text>}
              </View>
            )}
            
            {/* --- Submit button --- */}
            <View style={{ justifyContent: 'center', flexDirection: 'row', padding: 5, marginTop: 16 }}>
              <ButtonModalL
                text={t('Submit')}
                textColor={theme.colors.white}
                filledColor={theme.colors.black}
                size='L'
                onPress={() => {
                  if (validateInput()) {
                    onSubmit({
                      ssid: wifiName.trim(),
                      connectionPassword: connectionPassword.trim(),
                      wifiPassword: wifiPassword.trim(),
                      boardModelName: boardModelName.trim(),
                      isExist: isBoardIdExists,
                    });
                  } else {
                    setOpenSection('manual');
                  }
                }}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // ... (all your existing styles: overlay, card, header, etc.)
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '94%',
    maxWidth: 520,
    backgroundColor: COLORS.cardBg,
    borderRadius: 22,
    overflow: 'hidden',
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.headerText,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    top: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.headerText,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  boardId: {
    marginTop: 4,
    marginBottom: 4,
    paddingHorizontal: 18,
    color: '#1f2937',
    fontSize: 13,
  },
  body: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  label: {
    color: COLORS.label,
    fontSize: theme.fontSize.description,
    fontFamily: theme.fontFamily.regular,
    marginBottom: 6,
  },
  inputWrap: {
    position: 'relative',
  },
  error: {
    color: COLORS.error,
    marginTop: 4,
    marginBottom: 6,
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.headerText,
  },
  sectionContent: {
    paddingVertical: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshButton: {
    padding: 2, 
  },
  wifiList: {
    maxHeight: 180, // Makes the list scrollable
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
  },
  wifiListContainer: {
    minHeight: 120, // Give it a minimum height
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 10, // Add padding for error messages
  },
  wifiListStatus: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  wifiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  wifiItemText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
});

export default WifiConfigModal;