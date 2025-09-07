// DeleteConfirmModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import LoadingSpinner from '../Others/LoadingIndicator';

type Props = {
  visible: boolean;
  onConfirm: () => void;              // handle delete
  onCancel: () => void;               // close/cancel
  title?: string;                     // default: "Delete item?"
  message?: string;                   // default: "This action cannot be undone."
  loading?: boolean;                  // disable buttons + show spinner while deleting
};

const DeleteConfirmModal: React.FC<Props> = ({
  visible,
  onConfirm,
  onCancel,
  title = 'Delete item?',
  message = 'This action cannot be undone.',
  loading = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel} // Android back button
    >
      <View style={styles.overlay}>
        <View style={styles.card}>

          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.btn, styles.btnGhost]}
              onPress={onCancel}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={[styles.btnText, styles.btnGhostText]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnDanger, loading && styles.btnDisabled]}
              onPress={onConfirm}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Delete"
            >
              {loading ? (
                <LoadingSpinner message='Deleting...' size='small' />
              ) : (
                <Text style={[styles.btnText, styles.btnDangerText]}>Delete</Text>
              )}
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

export default DeleteConfirmModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 6 },
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    color: '#111',
  },
  message: {
    fontSize: 14,
    color: '#444',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  btn: {
    minWidth: 100,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { fontSize: 15 },
  btnGhost: { backgroundColor: '#EFEFEF' },
  btnGhostText: { color: '#111' },
  btnDanger: { backgroundColor: '#DC2626' },
  btnDangerText: { color: '#fff', fontWeight: '700' },
  btnDisabled: { opacity: 0.7 },
});
