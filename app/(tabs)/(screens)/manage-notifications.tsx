import React, { useEffect, useState } from 'react';
import { View, Text, Switch, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, themeStyle } from '@/theme';
import { useNotification } from '@/src/api/hooks/useNotification';
import { t } from 'i18next';

const SOUND_OPTIONS = ['Default', 'Chime', 'Ripple', 'Wave'] as const;
type SoundName = typeof SOUND_OPTIONS[number];

const ManageNotifications: React.FC = () => {
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [alertSoundEnabled, setAlertSoundEnabled] = useState(false);
  const [sound, setSound] = useState<SoundName>('Default');
  const [soundOpen, setSoundOpen] = useState(false);

  const {notificationSetting, updateNotificationSetting} = useNotification();

  const setAlertEnableSetting = async () => {
    await updateNotificationSetting({ notificationAlert: !notifEnabled, notificationSound: alertSoundEnabled });
    setNotifEnabled((v) => !v);
  }

  const setAlertSoundEnableSetting = async () => {
    await updateNotificationSetting({ notificationAlert: notifEnabled, notificationSound: !alertSoundEnabled });
    setAlertSoundEnabled((v) => !v);
  }

  useEffect(() => {
    if (notificationSetting) {
      setNotifEnabled(notificationSetting.notification_alert);
      setAlertSoundEnabled(notificationSetting.notification_sound);
    }
  }, [notificationSetting]);

  const label = {
    fontSize: themeStyle.fontSize.description,
    fontFamily: themeStyle.fontFamily.medium,
    color: themeStyle.colors.black,
  };

  return (
    <>

      <View style={{ paddingTop: 16, gap: 12, alignItems: 'center' }}>
        {/* Enable Notifications */}
        <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            width: '90%',
            alignSelf: 'center' as const,
            backgroundColor: '#FFFFFF',
            borderRadius: 10,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: theme.colors['background1'],
            ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 2,
            },
            android: { elevation: 1 },
            }),
         }}>
          <Text style={label}>{t("noti_setting.enable_notifications")}</Text>
          <Switch
            value={notifEnabled}
            onValueChange={setAlertEnableSetting}
            trackColor={{ false: '#CFCFCF', true: '#B6E1DC' }}
            thumbColor={notifEnabled ? '#1A736A' : '#f4f3f4'}
          />
        </View>

        {/* Enable Alert Sound */}
        <View
          style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            opacity: notifEnabled ? 1 : 0.5,
            width: '90%',
            alignSelf: 'center' as const,
            backgroundColor: '#FFFFFF',
            borderRadius: 10,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: theme.colors['background1'],
            ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 2,
            },
            android: { elevation: 1 },
            }),
         } }
        >
          <Text style={label}>{t("noti_setting.enable_alert_sound")}</Text>
          <Switch
            value={alertSoundEnabled}
            onValueChange={setAlertSoundEnableSetting}
            disabled={!notifEnabled}
            trackColor={{ false: '#CFCFCF', true: '#B6E1DC' }}
            thumbColor={alertSoundEnabled ? '#1A736A' : '#f4f3f4'}
          />
        </View>

        {/* Alert Sound Picker */}
        <View style={{ 
            position: 'relative',
            width: '90%',
            alignSelf: 'center' as const,
            backgroundColor: '#FFFFFF',
            borderRadius: 10,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: theme.colors['background1'],
            ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 2,
            },
            android: { elevation: 1 },
            }),
     }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={label}>{t("noti_setting.alert_sound")}</Text>

            <Pressable
              onPress={() => setSoundOpen((v) => !v)}
              disabled={!notifEnabled || !alertSoundEnabled}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 12,
                height: 40,
                borderWidth: 1,
                borderColor: '#CFCFCF',
                borderRadius: 10,
                minWidth: 160,
                backgroundColor: themeStyle.colors.white,
                opacity: !notifEnabled || !alertSoundEnabled ? 0.5 : 1,
              }}
            >
              <Text style={{ fontSize: 16, fontFamily: theme.fontFamily.regular, color: '#000' }}>{t(`noti_setting.sounds.${sound.toLowerCase()}`)}</Text>
              <Ionicons name="chevron-down" size={20} color="#7A7A7A" />
            </Pressable>
          </View>

          {soundOpen && (
            <View
              style={{
                position: 'absolute',
                right: 16,
                top: 64,
                backgroundColor: '#fff',
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#E6E6E6',
                overflow: 'hidden',
                minWidth: 200,
                ...Platform.select({
                  ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 4,
                  },
                  android: { elevation: 3 },
                }),
              }}
            >
              {SOUND_OPTIONS.map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => {
                    setSound(opt);
                    setSoundOpen(false);
                  }}
                  style={{ paddingHorizontal: 14, paddingVertical: 12 }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#000',
                      fontFamily: opt === sound ? theme.fontFamily.medium : theme.fontFamily.regular,
                    }}
                  >
                    {t(`noti_setting.sounds.${opt.toLowerCase()}`)}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>

    </>
  );
};

export default ManageNotifications;
