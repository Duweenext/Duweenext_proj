import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList, // --- ADDED ---
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import TextFieldModal from '../TextFields/TextFieldModal/TextFieldModal';
import ButtonModalL from '../Buttons/ButtonModalL';
import z from 'zod';
import { useTranslation } from 'react-i18next';

// --- ADDED: Minimal type based on your log ---
interface BoardRelationship {
  board_id: string;
  updated_at: string;
  // Add other fields if needed, but these are the minimum
}

interface ManualAddBoardModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (boardId: string) => void;
  pastBoards?: BoardRelationship[]; // --- ADDED PROP ---
}

export const boardIdSchema = z.object({
  boardId: z.string().trim()
    .min(1, "Board ID is required")
    .max(32, "Max 32 characters")
    .regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, hyphen, underscore"),
});

export type BoardIdForm = z.infer<typeof boardIdSchema>;

// --- ADDED: Date formatting helper ---
const formatReadableDate = (isoString: string) => {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    // Format: "Oct 22, 2025, 4:08 PM"
    return date.toLocaleString(undefined, { // Uses user's default locale
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    return 'Invalid Date';
  }
};

const ManualAddBoardModal: React.FC<ManualAddBoardModalProps> = ({
  visible,
  onClose,
  onSubmit,
  pastBoards = [], // --- ADDED PROP (with default) ---
}) => {
  const {t} = useTranslation();
  const [boardId, setBoardId] = useState('');
  const [error, setError] = useState<string | null>(null);

  console.log("Rendering ManualAddBoardModal with pastBoards:", pastBoards);

  const handleSubmit = () => {
    const res = boardIdSchema.safeParse({ boardId });
    if (!res.success) {
      setError(res.error.issues[0]?.message ?? 'Invalid input');
      return;
    }
    onSubmit(boardId.trim());
    setBoardId('');
    setError(null);
    onClose(); // --- MOVED: Only close on successful submit ---
  };

  const handleClose = () => {
    setBoardId('');
    setError(null); // --- ADDED: Clear error on close ---
    onClose();
  };

  // --- ADDED: Handler for list item press ---
  const handleBoardSelect = (selectedId: string) => {
    setBoardId(selectedId);
    setError(null); // Clear any errors
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t("Add Board")}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.description}>
              {t("Locates the board ID on the right side of the board.")}
            </Text>

            {/* --- ADDED: Past Boards List --- */}
            {pastBoards && pastBoards.length > 0 && (
              <View style={styles.listContainer}>
                <Text style={styles.listHeader}>{t("Recently Added")}</Text>
                <FlatList
                  data={pastBoards}
                  keyExtractor={(item) => item.board_id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.listItem}
                      onPress={() => handleBoardSelect(item.board_id)}
                    >
                      <Text style={styles.listItemTextLeft}>{item.board_id}</Text>
                      <Text style={styles.listItemTextRight}>
                        {formatReadableDate(item.updated_at)}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
            {/* --- END OF ADDED LIST --- */}

            {/* Board ID Input */}
            <View>
              <TextFieldModal
                value={boardId}
                onChangeText={setBoardId}
                placeholder={t("Enter board ID")}
                textColor={theme.colors.black}
                borderColor={theme.colors.black}
              />
              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>
            
            {/* Submit Button */}
            <View style={styles.buttonContainer}>
              <ButtonModalL
                text={t("Submit")}
                filledColor="#000000"
                textColor="white"
                onPress={handleSubmit}
                marginBottom={0}
              />
            </View>
          </View>
        </View>
      </View>
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
  modalContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#2c5f54',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSize.header2,
    fontFamily: theme.fontFamily.bold,
    color: 'white',
  },
  closeButton: {
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
  description: {
    fontSize: theme.fontSize.description,
    fontFamily: theme.fontFamily.regular,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  // --- ADDED STYLES ---
  listContainer: {
    maxHeight: 150, // Make the list scrollable if it's too long
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  listHeader: {
    fontSize: 14,
    fontFamily: theme.fontFamily.medium,
    color: '#333',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemTextLeft: {
    fontSize: 14,
    fontFamily: theme.fontFamily.bold,
    color: '#111',
    flex: 1, // Allow text to wrap
  },
  listItemTextRight: {
    fontSize: 12,
    fontFamily: theme.fontFamily.regular,
    color: '#6b7280',
    marginLeft: 8,
    textAlign: 'right',
  },
  errorText: {
    color: theme.colors.fail,
    marginTop: 4,
    fontSize: 12,
  },
  // --- END OF ADDED STYLES ---
  buttonContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
});

export default ManualAddBoardModal;