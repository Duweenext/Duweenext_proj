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
import TextFieldModal from '@/src/component/TextFields/TextFieldModal/TextFieldModal';
import ButtonModalL from '@/src/component/Buttons/ButtonModalL';
import { z } from "zod";

interface ConnectionPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  loading?: boolean;
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

export const connectionPasswordSchema = z.object({
  connectionPassword: z.string().trim().min(1, "Connection password is required"),
});

export type ConnectionPasswordForm = z.infer<typeof connectionPasswordSchema>;

const ConnectionPasswordModal: React.FC<ConnectionPasswordModalProps> = ({
  visible,
  onClose,
  onSubmit,
  loading = false,
}) => {

  const [password, setPassword] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);

  const onSubmitForm = (data: { connectionPassword: string }) => {
    const res = connectionPasswordSchema.safeParse(data);
    if (!res.success) {
      setError(res.error.issues[0]?.message ?? 'Invalid input');
      return;
    }
    setError(null);
    onSubmit(data.connectionPassword);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Connection Password</Text>
            {!loading && <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close dialog"
            >
              <Ionicons name="close" size={22} color="#ffffff" />
            </TouchableOpacity>}
          </View>

          <View style={styles.content}>
            <View>
              <Text style={styles.label}>Connection password</Text>
              <TextFieldModal
                type="password"
                onChangeText={setPassword}
                value={password}
                placeholder="Enter connection password"
                borderColor={theme.colors.black}
                secureToggle={true}
              />
            </View>
            {error && <Text style={styles.error}>{error}</Text>}
            <View style={styles.buttonContainer}>
              <ButtonModalL
                text={'Connect'}
                textColor={theme.colors.white}
                filledColor={theme.colors.black}
                size='L'
                onPress={() => onSubmitForm({ connectionPassword: password })}
                marginBottom={0}
                loading={loading}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    backgroundColor: '#2c5f54',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  title: {
    fontSize: theme.fontSize.header2,
    fontFamily: theme.fontFamily.bold,
    color: 'white',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
    gap: 20,
  },
  boardIdContainer: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  boardIdLabel: {
    fontSize: theme.fontSize.description,
    fontFamily: theme.fontFamily.medium,
    color: COLORS.label,
  },
  boardIdText: {
    fontSize: theme.fontSize.description,
    fontFamily: theme.fontFamily.bold,
    color: COLORS.headerText,
  },
  label: {
    fontSize: theme.fontSize.description,
    fontFamily: theme.fontFamily.medium,
    color: COLORS.label,
    marginBottom: 8,
  },
  error: {
    fontSize: theme.fontSize.small,
    fontFamily: theme.fontFamily.regular,
    color: COLORS.error,
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
});

export default ConnectionPasswordModal;
