import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  GestureResponderEvent,
  StyleSheet, // --- ADDED StyleSheet ---
} from 'react-native';
import { useRouter } from 'expo-router';
import { themeStyle } from '@/src/theme';
import { useTitle } from '@/src/utlis/useTitle'; // Assuming this hook provides a default title
import { useInboxStore } from '@/src/component/Buttons/Inbox/_inboxState'; // Assuming this gives unread count
import { useTranslation } from 'react-i18next'; // --- ADDED ---

interface TopBarProps {
  title?: string;
  textColor?: string;
  onBack?: (event: GestureResponderEvent) => void;
  showBackButton?: boolean;
  showInbox?: boolean;
  onInboxPress?: (event: GestureResponderEvent) => void;
}

const TopBar: React.FC<TopBarProps> = ({
  title: topbar_title,
  textColor = themeStyle.colors.white,
  showBackButton = true,
  showInbox = false, // Default is false, as per your original code
  onInboxPress,
}) => {
  const router = useRouter();
  const titleFromHook = useTitle(); // Get title from hook if prop not provided
  const { unreadCount } = useInboxStore();
  const { t } = useTranslation(); // --- ADDED ---

  // Use prop title if available, otherwise fallback to hook title
  const displayTitle = topbar_title ?? titleFromHook;

  const handleInboxPress = () => {
    if (onInboxPress) onInboxPress({} as GestureResponderEvent);
    else router.push('/(tabs)/(screens)/inbox'); // Corrected path assuming it's within (screens)
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* LEFT: Back button or Spacer */}
        {showBackButton ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.button}>
            <Image
              source={require('@/assets/icons/back-arrowhead.png')}
              style={styles.icon}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} /> // keep spacing consistent
        )}

        {/* CENTER: Title */}
        <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
          {displayTitle} {/* Display the determined title */}
        </Text>
      </View>
    </View>
  );
};

// --- ADDED StyleSheet ---
const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 82, // Consider using dynamic height based on safe area insets if needed
    backgroundColor: themeStyle.colors.primary,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    paddingVertical: 14,
    paddingHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    justifyContent: 'flex-end', // Align content towards the bottom
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4, // Adjust as needed for alignment
  },
  button: {
    padding: 8, // Add padding for easier tapping
    position: 'relative', // Needed for badge positioning
    minWidth: 44, // Ensure minimum tap area
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 28, // Slightly smaller icon
    height: 28,
    tintColor: themeStyle.colors.white,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1, // Allow title to take up space
    textAlign: 'center',
    marginHorizontal: 8, // Add margin so buttons don't overlap long titles
  },
  spacer: {
    width: 44, // Match minimum button width
    height: 44,
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: themeStyle.colors.fail, // Or your notification color
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: themeStyle.colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default TopBar;