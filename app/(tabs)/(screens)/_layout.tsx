import React from 'react';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { theme } from '@/theme';
import TopBar from '@/src/component/NavBar/TopBar';
import { useTitle } from '@/src/utlis/useTitle';

export default function ScreensLayout() {
  // Use the hook inside the layout component
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: theme.colors.black },
      }}

    >
      <Stack.Screen
        name="sensor"
        options={{
          header: () => <TopBar title={t('screens.sensor')} />,
        }}
      />
      <Stack.Screen
        name="check-pond-health"
        options={{
          header: () => <TopBar title={t('screens.checkPondHealth')} />,
        }}
      />
      <Stack.Screen
        name="notification_history"
        options={{
          header: () => <TopBar title={t('screens.notificationHistory')} />,
        }}
      />
      <Stack.Screen
        name="help-supports"
        options={{
          header: () => <TopBar title={t('screens.help')} />,
        }}
      />
      <Stack.Screen
        name="manage-notifications"
        options={{
          header: () => <TopBar title={t('screens.manageNotifications')} />,
        }}
      />
      <Stack.Screen
        name="profile_setting/_profileSettingEmail"
        options={{
          header: () => <TopBar title={t('screens.profile')} />,
        }}
      />
      <Stack.Screen
        name="profile_setting/index"
        options={{
          header: () => <TopBar title={t('screens.profile')} />,
        }}
      />
      <Stack.Screen
        name="privacy-policy"
        options={{
          header: () => <TopBar title={t('screens.privacy')} />,
        }}
      />
      <Stack.Screen
        name="terms-conditions"
        options={{
          header: () => <TopBar title={t('screens.terms')} />,
        }}
      />
      {/* Add other screens from this group here if they need titles */}
    </Stack>
  );
}