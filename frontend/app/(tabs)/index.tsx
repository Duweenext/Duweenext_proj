import React, { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import LineChartExample from "@/components/LineChartExample";
import TabBox from "@/components/TabBox";
import { icons } from "@/constants/icons";



export default function Index() {

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 100 }}>
        
        {/* Header */}
        <View style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#1f2937',
            textAlign: 'center',
          }}>
            Homepage
          </Text>
        </View>

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
            onNav={() => router.push("/(screens)/camera")}
          />
          <TabBox 
            title="Notification History" 
            icon={icons.assistant} 
            onNav={() => router.push("/(screens)/notification_setting")} 
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



          {/* Chart */}
          {/* <View style={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            padding: 24,
            minHeight: 120,
            
          }}> */}
          {/* Alert Items */}
          
            {/* <LineChartExample /> */}
          {/* </View> */}
        </View>

      </View>
    </ScrollView>
  );
}
