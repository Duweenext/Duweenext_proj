import React from 'react';
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
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { theme } from '@/theme';
import TextFieldModal from '@/src/component/TextFields/TextFieldModal';
import ButtonModalL from '@/src/component/Buttons/ButtonModalL';

const connectionPasswordSchema = z.object({
  connectionPassword: z.string().min(1, ''),
  boardModelName: z.string().optional(),
});

interface ConnectionPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  submitting?: boolean;
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

const ConnectionPasswordModal: React.FC<ConnectionPasswordModalProps> = ({
  visible,
  onClose,
  onSubmit,
  submitting = false,
}) => {

  const [password, setPassword] = React.useState<string>("");

  const closeAndReset = () => {
    onClose();
  };

  const onSubmitForm = (data: { connectionPassword: string }) => {
    onSubmit(data.connectionPassword);
    // closeAndReset();
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
            <Text style={styles.title}>Connection Password</Text>
            <TouchableOpacity
              onPress={closeAndReset}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close dialog"
            >
              <Ionicons name="close" size={22} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View>
              <Text style={styles.label}>Connection password</Text>
                  <TextFieldModal
                    mode="password-old"
                    onChangeText={setPassword}
                    value={password}
                    placeholder="Enter connection password"
                    borderColor={theme.colors.black}
                    secureToggle={true}
                  />
            </View>
            <View style={styles.buttonContainer}>
              <ButtonModalL
                text={submitting ? 'Connecting...' : 'Connect'}
                textColor={theme.colors.white}
                filledColor={theme.colors.black}
                size='L'
                onPress={() => onSubmitForm({ connectionPassword: password })}
                marginBottom={0}
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
