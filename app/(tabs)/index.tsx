import React, { useEffect } from "react";
import { PermissionsAndroid, Platform, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { icons } from "@/src/constants/icons";
import { useTranslation } from "react-i18next";
import TabBox from "@/src/component/TabBox";
import SummaryChart from "@/src/component/Chart/HomepageChart";
import { useBoard } from "@/src/api/hooks/useBoard";
import { useAuth } from "@/src/auth/context/auth_context";
import PullToRefreshScreen from "@/src/component/Screens/PullToRefresh";
import WifiManager from "react-native-wifi-reborn";

export default function Index() {
  const { t, i18n } = useTranslation();

   const getWifiLists = async () => {
    try {
      if (Platform.OS !== 'android') {
        console.log("WiFi scanning only available on Android");
        return;
      }

      console.log("Requesting location permission...");
      
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission Required',
          message: 'This app needs location permission to scan WiFi networks',
          buttonNegative: 'Cancel',
          buttonPositive: 'Allow',
        },
      );

      console.log("Permission result:", granted);

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Permission granted, loading WiFi list...");

        const wifiList = await Promise.race([
          WifiManager.loadWifiList(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('WiFi scan timeout')), 10000)
          )
        ]);

        console.log("WiFi List fetched successfully:", wifiList);

      } else {
        console.log("Location permission denied, cannot scan WiFi");
      }
    } catch (error) {
      console.error("Error in getWifiLists:", error);
      
      // Check if WifiManager is available
      if (!WifiManager) {
        console.error("WifiManager is null - library not properly configured");
      }
    }
  };

  useEffect(() => {
    getWifiLists();
  }, [])

  const changeLanguage = () => {
    if (i18n.language === 'en') {
      i18n.changeLanguage('th');
    } else {
      i18n.changeLanguage('en');
    }
  }
  const { boards, loading , refetchBoards} = useBoard();
  const { user } = useAuth();

  return (
    <PullToRefreshScreen onRefresh={async () => {
      if (user?.id) {
        await refetchBoards();
        // getWifiLists();
      }
    }}>
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 100 }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginVertical: 24,
          gap: 12,
        }}>
          <TabBox
            title="Sensor"
            icon={icons.sensor}
            onNav={() => router.push("/(tabs)/(screens)/sensor")}
            image_width={45}
            image_height={45}
          />
          <TabBox
            title="Check Pond Health"
            icon={icons.camera}
            onNav={() => router.push("/(tabs)/(screens)/check-pond-health")}
            image_height={35}
            image_width={35}
          />
          <TabBox
            title="Notification History"
            icon={icons.assistant}
            onNav={() => router.push("/(tabs)/(screens)/notification_setting")}
            image_height={50}
            image_width={50}
          />
        </View>

          <View style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 15,
            marginBottom: 20,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#000',
            }}>
              Activity Overview
            </Text>
            <View style={{ overflow: 'hidden' }}>
              {boards && boards.length > 0 && (
                <SummaryChart boardId={boards[0].board_id} />
              )}
            </View>
          </View>

        </View>
      </ScrollView>
    </PullToRefreshScreen>
  );
}
