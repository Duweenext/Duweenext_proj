import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { theme as themeStyle } from '@/theme';
import { Trash2 } from 'lucide-react-native';
import ButtonCard from '../Buttons/ButtonCard';
import ModalSaveNote from '../Modals/ModalSaveNote';
import ModalViewNote from '../Modals/ViewNoteModal';
import { Swipeable } from 'react-native-gesture-handler'; // Corrected import
import { Icon } from 'react-native-paper';

interface NotificationCardProps {
  icon?: React.ReactNode;
  title: string;
  headline: string;
  message: string;
  time: string;
  style?: ViewStyle;
  note?: string;
  onDelete?: () => void;
  onResolve?: (note?: string) => void;
  onArchive?: () => void;
  rightAccessory?: React.ReactNode;
  resolvedBy?: string;
  messageType?: string;
  archived?: boolean;
}

export const CardNotification: React.FC<NotificationCardProps> = ({
  icon,
  title,
  headline,
  message,
  time,
  style,
  note,
  onDelete,
  onResolve,
  onArchive,
  rightAccessory,
  resolvedBy,
  // --- ADDED: Destructure new props ---
  messageType,
  archived = false, // Default to false
}) => {
  const [noteModal, setNoteModal] = useState(false);

  const handleResolve = () => {
    if (onResolve) setNoteModal(true);
  };

  const handleSaveNote = async (newNote: string) => {
    if (onResolve) onResolve(newNote);
    setNoteModal(false);
  };
  
  // --- CHANGED: Swipe-to-archive is now disabled if already archived ---
  const renderRightActions = !archived ? () => (
    <TouchableOpacity
      style={styles.archiveAction}
      onPress={onArchive}
    >
      <Text style={styles.archiveActionText}>Archive</Text>
    </TouchableOpacity>
  ) : undefined;


  // --- CHANGED: Conditional styling based on the 'archived' prop ---
  const cardStyle = [styles.card, archived && styles.archivedCard, style];
  const textStyle = archived ? styles.archivedText : styles.defaultText;
  const titleStyle = archived ? styles.archivedText : styles.defaultTitle;
  const timeStyle = archived ? styles.archivedText : styles.defaultText;
  const iconColor = archived ? '#333333' : '#FFFFFF';

  const CardContent = (
    <View style={cardStyle}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {icon}
          {/* --- CHANGED: Title is now truncated if too long --- */}
          <Text style={[styles.title, titleStyle]} numberOfLines={1} ellipsizeMode='tail'>
            {title}
          </Text>
        </View>

        <View style={styles.headerRight}>
          {rightAccessory}
          {!!time && <Text style={[styles.time, timeStyle]}>{time}</Text>}
          {onDelete && (
            <TouchableOpacity
              accessibilityLabel="Delete notification"
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              onPress={onDelete}
              style={styles.deleteBtn}
            >
              <Trash2 size={18} color={iconColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.headline}>{headline}</Text>
      <View style={{ gap: 16 }}>
        <Text style={[styles.message, textStyle]}>{message}</Text>

        {/* --- CHANGED: The logic for showing Resolve/View Note buttons --- */}
        {note ? (
          <ButtonCard
            text="View Note"
            onPress={() => setNoteModal(true)}
            filledColor={archived ? themeStyle.colors.primary : "#FFFFFF"}
            textColor={archived ? '#FFFFFF' : '#000000'}
          />
        ) : (
          // --- Hides "Resolve" button for 'Request' type or if no onResolve function exists ---
          onResolve && messageType !== 'Request' && (
            <ButtonCard
              text="Resolve"
              onPress={handleResolve}
              filledColor="#FFFFFF"
              textColor="#000000"
            />
          )
        )}
      </View>
      
      {/* --- ADDED: Conditionally render the resolved by section --- */}
      {resolvedBy && (
         <View style={styles.resolvedByContainer}>
          <Icon source={require('@/assets/icons/user.png')} size={20} color={iconColor} />
          <Text style={[{fontFamily: themeStyle.fontFamily.medium }, textStyle]}>
            {resolvedBy}
          </Text>
        </View>
      )}


      {/* Modal */}
      {!note && onResolve && (
        <ModalSaveNote
          visible={noteModal}
          onClose={() => setNoteModal(false)}
          initialNote={note}
          onSave={handleSaveNote}
        />
      )}

      {note && <ModalViewNote
        visible={noteModal}
        onClose={() => setNoteModal(false)}
        note={note}
      />}
    </View>
  );

  return (
    <Swipeable renderRightActions={renderRightActions} enabled={!archived}>
      {CardContent}
    </Swipeable>
  );
};


const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: themeStyle.colors.primary,
    borderRadius: parseInt(themeStyle.borderRadius.lg, 10),
    padding: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },
  // --- ADDED: Style for archived cards ---
  archivedCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB', // A light grey border
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  // --- CHANGED: Allow left header to shrink for long titles ---
  headerLeft: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center',
    marginRight: 8, // Add space between left and right side
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: {
    marginLeft: 8,
    fontSize: parseInt(themeStyle.fontSize['header-2'], 10),
    fontFamily: themeStyle.fontFamily.semibold,
  },
  time: {
    fontSize: parseInt(themeStyle.fontSize.description, 10),
    fontFamily: themeStyle.fontFamily.regular,
  },
  // --- ADDED: Default and Archived text styles ---
  defaultText: {
    color: '#FFFFFF',
  },
  defaultTitle: {
    color: '#FFFFFF',
  },
  archivedText: {
    color: '#1F2937', // A dark grey for text on white background
  },
  deleteBtn: { marginLeft: 8 },
  headline: {
    fontSize: parseInt(themeStyle.fontSize.description, 10),
    fontFamily: themeStyle.fontFamily.medium,
    color: themeStyle.colors.warning,
    marginBottom: 4,
  },
  message: {
    fontSize: parseInt(themeStyle.fontSize.description, 10),
    fontFamily: themeStyle.fontFamily.regular,
    lineHeight: 22,
  },
  resolvedByContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'flex-end',
    marginTop: 12,
  },
  archiveAction: {
    backgroundColor: "#9ca3af",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: "100%",
    borderRadius: parseInt(themeStyle.borderRadius.lg, 10),
  },
  archiveActionText: {
    color: "white",
    fontWeight: "600"
  }
});