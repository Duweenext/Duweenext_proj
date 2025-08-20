// WifiConfigModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { theme } from '@/theme';
import TextFieldModal from '../TextFields/TextFieldModal';
import ButtonAddBoard from '../Buttons/ButtonAddBoard';
import ButtonModalXL from '../Buttons/ButtonModalXL';
import ButtonModalL from '../Buttons/ButtonModalL';

const wifiSchema = z.object({
  ssid: z.string().min(1, 'Wifi name (SSID) is required'),
  wifiPassword: z.string().min(8, 'Wifi password must be at least 8 characters'),
  connectionPassword: z.string().min(1, 'Connection password is required'),
});

export type WifiFormData = z.infer<typeof wifiSchema>;

interface WifiConfigModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: WifiFormData) => void;
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

const ConnectionPasswordModal: React.FC<WifiConfigModalProps> = ({
  visible,
  onClose,
  onSubmit,
  boardId,
  isBoardIdExists = true,
}) => {
  const { control, handleSubmit, formState: { errors, isValid }, reset } =
    useForm<WifiFormData>({
      resolver: zodResolver(wifiSchema),
      mode: 'onChange',
      defaultValues: { ssid: '', wifiPassword: '', connectionPassword: '' },
    });

  const [showWifi, setShowWifi] = useState(false);
  const [showConn, setShowConn] = useState(false);

  const closeAndReset = () => {
    reset();
    setShowWifi(false);
    setShowConn(false);
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
            <Text style={styles.title}>Wifi configuration</Text>
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
          <Text style={styles.boardId}>Board ID: {boardId}</Text>

          {/* Form */}
          <View style={styles.body}>
            {/* SSID */}
            <Text style={styles.label}>Wifi name</Text>
            <View style={styles.inputWrap}>
              <Controller
                control={control}
                name="ssid"
                render={({ field: { onChange, value } }) => (
                  <TextFieldModal
                    onChangeText={onChange}
                    value={value}
                    placeholder="Enter wifi name"
                    borderColor={theme.colors.black}
                  />
                )}
              />
            </View>
            {errors.ssid && <Text style={styles.error}>{errors.ssid.message}</Text>}

            {/* Wifi password */}
            <Text style={[styles.label, { marginTop: 12 }]}>Wifi password</Text>
            <View style={styles.inputWrap}>
              <Controller
                control={control}
                name="wifiPassword"
                render={({ field: { onChange, value } }) => (
                  <TextFieldModal
                    onChangeText={onChange}
                    value={value}
                    placeholder="Enter Wifi password"
                    borderColor={theme.colors.black}
                  />
                )}
              />
              <TouchableOpacity
                onPress={() => setShowWifi((s) => !s)}
                style={styles.eyeBtn}
                accessibilityRole="button"
                accessibilityLabel={showWifi ? 'Hide Wifi password' : 'Show Wifi password'}
              >
                <Ionicons name={showWifi ? 'eye-off' : 'eye'} size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {errors.wifiPassword && <Text style={styles.error}>{errors.wifiPassword.message}</Text>}

            {/* Connection password */}
            <Text style={[styles.label, { marginTop: 12 }]}>Connection password</Text>
            <View style={styles.inputWrap}>
              <Controller
                control={control}
                name="connectionPassword"
                render={({ field: { onChange, value } }) => (
                  <TextFieldModal
                    onChangeText={onChange}
                    value={value}
                    placeholder="Enter Wifi password"
                    borderColor={theme.colors.black}
                  />
                )}
              />
              <TouchableOpacity
                onPress={() => setShowConn((s) => !s)}
                style={styles.eyeBtn}
                accessibilityRole="button"
                accessibilityLabel={showConn ? 'Hide Connection password' : 'Show Connection password'}
              >
                <Ionicons name={showConn ? 'eye-off' : 'eye'} size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {errors.connectionPassword && (
              <Text style={styles.error}>{errors.connectionPassword.message}</Text>
            )}

            {/* Submit */}
            <View style={{justifyContent: 'center', flexDirection: 'row', padding: 5}}>
              <ButtonModalL
                text='Submit'
                textColor={theme.colors.white}
                filledColor={theme.colors.black}
                size='L'
                onPress={handleSubmit(onSubmit)}
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

export default ConnectionPasswordModal;
