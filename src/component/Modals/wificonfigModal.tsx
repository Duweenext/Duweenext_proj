// WifiConfigModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import TextFieldModal from '../TextFields/TextFieldModal/TextFieldModal';
import ButtonModalL from '../Buttons/ButtonModalL';
import { WifiConfig } from '@/src/interfaces/wifi';
import { z } from "zod";
import { useTranslation } from 'react-i18next';

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
    return true;
  }

  const closeAndReset = () => {
    onClose();
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
            {/* SSID */}
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
              {errors?.wifiPassword && <Text style={styles.error}>{errors.wifiPassword}</Text>}

            </View>
            <View>
              {!isBoardIdExists && <View>
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
              </View>}
              <Text style={[styles.label, { marginTop: 12 }]}>{t("Board name")}</Text>
              <View style={styles.inputWrap}>

                <TextFieldModal
                  onChangeText={setBoardModelName}
                  value={boardModelName}
                  placeholder={t("Enter Board Model Name")}
                  borderColor={theme.colors.black}
                />
              </View>
            </View>
            {errors?.boardModelName && <Text style={styles.error}>{errors.boardModelName}</Text>}
            {/* Submit */}
            <View style={{ justifyContent: 'center', flexDirection: 'row', padding: 5 }}>
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
    // shadow
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
  input: {
    height: 54,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 44, // space for eye icon
    fontSize: 16,
    color: '#0b0b0b',
    // soft shadow
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  eyeBtn: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submit: {
    marginTop: 18,
    alignSelf: 'center',
    backgroundColor: COLORS.button,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 18,
    minWidth: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  error: {
    color: COLORS.error,
    marginTop: 4,
    marginBottom: 6,
    fontSize: 12,
  },
});

export default WifiConfigModal;
