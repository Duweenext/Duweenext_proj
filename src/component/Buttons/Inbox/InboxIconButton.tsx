// /component/Buttons/Inbox/InboxIconButton.tsx
import React from 'react';
import { TouchableOpacity, View, Image, Text, StyleSheet } from 'react-native';
import { themeStyle } from '@/src/theme';

interface InboxIconButtonProps {
  unreadCount?: number;
  onPress: () => void;
}

const InboxIconButton: React.FC<InboxIconButtonProps> = ({ unreadCount = 0, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.container}>
    <Image
      source={require('@/assets/icons/bell.png')}
      style={styles.icon}
      resizeMode="contain"
    />

    {unreadCount > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { position: 'relative', padding: 4 },
  icon: { width: 26, height: 26, tintColor: themeStyle.colors.white },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: themeStyle.colors.fail,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
});

export default InboxIconButton;
