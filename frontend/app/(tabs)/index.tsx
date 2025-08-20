import React, { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, StatusBar } from "react-native";
import { router } from "expo-router";
import LineChartExample from "@/components/LineChartExample";
import TabBox from "@/components/TabBox";
import { icons } from "@/constants/icons";
import { useTranslation } from "react-i18next";

export default function Index() {
  const {t, i18n} = useTranslation();

  const changeLanguage = () => {
    if(i18n.language === 'en')
    {
      i18n.changeLanguage('th');
    } else {
      i18n.changeLanguage('en');
    }
  }

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 100 }}>
        
        {/* Navigation Cards */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 24,
          gap: 12,
        }}>
          <TabBox
            title="Sensor"
            icon={icons.sensor}
            onNav={() => router.push("/(screens)/sensor")}
          />
          <TabBox
            title="Check Pond Health"
            icon={icons.camera}
            onNav={() => router.push("/(screens)/check-pond-health")}
          />
          <TabBox 
            title="Notification History" 
            icon={icons.assistant} 
            onNav={() => router.push("/(screens)/notification-history")} 
          />
        </View>

        {/* Activity Overview */}
        <View style={{
          backgroundColor: '#1f2937',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#ffffff',
            marginBottom: 16,
          }}>
            Activity Overview
          </Text>
        </View>

      </View>
    </ScrollView>
  );
}
