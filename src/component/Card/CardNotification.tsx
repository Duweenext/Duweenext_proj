// component-v2/Card/CardNotification.tsx
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
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
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
}) => {
  const [noteModal, setNoteModal] = useState(false);

  const handleResolve = () => {
    if (onResolve) setNoteModal(true);
  };

  const handleSaveNote = async (newNote: string) => {
    if (onResolve) onResolve(newNote);
    setNoteModal(false);
  };

  const renderRightActions = () => (
    <TouchableOpacity
      style={{
        backgroundColor: "#9ca3af",
        justifyContent: "center",
        alignItems: "center",
        width: 100,
        height: "100%",
      }}
      onPress={onArchive}
    >
      <Text style={{ color: "white", fontWeight: "600" }}>Archive</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={[styles.card, style]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {icon}
            <Text style={styles.title}>{title}</Text>
          </View>

          <View style={styles.headerRight}>
            {rightAccessory}
            {!!time && <Text style={styles.time}>{time}</Text>}
            {onDelete && (
              <TouchableOpacity
                accessibilityLabel="Delete notification"
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                onPress={onDelete}
                style={styles.deleteBtn}
              >
                <Trash2 size={18} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.headline}>{headline}</Text>
        <View style={{ gap: 16 }}>
          <Text style={styles.message}>{message}</Text>

          {note ? (
            <ButtonCard
              text="View Note"
              onPress={() => setNoteModal(true)}
              filledColor="#FFFFFF"
              textColor="#000000"
            />
          ) : (
            onResolve && !note && (
              <ButtonCard
                text="Resolve"
                onPress={handleResolve}
                filledColor="#FFFFFF"
                textColor="#000000"
              />
            )
          )}
        </View>
        <View style={{ alignItems: 'flex-start', flexDirection: 'row', gap: 8, alignSelf: 'flex-end' }}>
          <Icon source={require('@/assets/icons/user.png')} size={20} color='#FFFFFF' />
          <Text style={{ color: '#FFFFFF', fontFamily: themeStyle.fontFamily.medium }}>
            {resolvedBy}
          </Text>
        </View>

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
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: {
    marginLeft: 8,
    fontSize: parseInt(themeStyle.fontSize['header-2'], 10),
    fontFamily: themeStyle.fontFamily.semibold,
    color: '#FFFFFF',
  },
  time: {
    fontSize: parseInt(themeStyle.fontSize.description, 10),
    fontFamily: themeStyle.fontFamily.regular,
    color: '#FFFFFF',
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
    color: '#FFFFFF',
    lineHeight: 22,
  },
});
