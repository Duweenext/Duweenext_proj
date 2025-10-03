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
  const { t} = useTranslation();

  const { boards, refetchBoards} = useBoard();
  const { user } = useAuth();

  return (
    <PullToRefreshScreen >
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 100 }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginVertical: 24,
          gap: 12,
        }}>
          <TabBox
            title={t("Sensor")}
            icon={icons.sensor}
            onNav={() => router.push("/(tabs)/(screens)/sensor")}
            image_width={45}
            image_height={45}
          />
          <TabBox
            title={t("Check Pond Health")}
            icon={icons.camera}
            onNav={() => router.push("/(tabs)/(screens)/check-pond-health")}
            image_height={35}
            image_width={35}
          />
          <TabBox
            title={t("Notification History")}
            icon={icons.assistant}
            onNav={() => router.push("/(tabs)/(screens)/notification_history")}
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
              {t("Activity Overview")}
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
