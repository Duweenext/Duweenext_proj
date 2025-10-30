import React, { useEffect } from "react";
import { View, Text, Image, Dimensions } from "react-native";
import { Tabs, useRouter } from "expo-router";
import TopBar from "@/src/component/NavBar/TopBar";
import { icons } from "@/src/constants/icons";
import { themeStyle } from "@/src/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// ... (getResponsiveSize and constants are unchanged) ...
const getResponsiveSize = (size: number) => {
  const scale = screenWidth / 320;
  const newSize = size * scale;
  return Math.max(newSize, size * 0.9);
};
const responsiveMinWidth = Math.min(screenWidth * 0.8, 160);
const responsivePadding = getResponsiveSize(1);
const responsiveMarginTop = getResponsiveSize(14);
const responsiveTabBarMargin = Math.max(screenWidth * 0.05, 20);
const responsiveTabBarMarginBottom = Math.max(screenHeight * 0.018, 1);
const TAB_BAR_HEIGHT = 80;


// --- TabIcon component is unchanged ---
function TabIcon({
  focused,
  icon,
  title,
}: {
  focused: boolean;
  icon: any;
  title: string;
}) {
  return (
    <View
      style={{
        minWidth: responsiveMinWidth,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        paddingVertical: responsivePadding,
        marginTop: responsiveMarginTop,
      }}
    >
      <Image
        source={icon}
        style={{
          width: 28,
          height: 28,
          tintColor: focused ? themeStyle.colors.primary : "#A8B5DB",
        }}
        resizeMode="contain"
      />
      <Text
        style={{
          color: "#000",
          fontSize: 14,
          fontWeight: focused ? "700" : "400",
          marginTop: 4,
        }}
      >
        {title} {/* Title is passed in already translated */}
      </Text>
      {focused && (
        <View
          style={{
            width: "50%",
            height: 4, // Added height for visibility
            backgroundColor: themeStyle.colors.primary,
            borderRadius: 15, // Might want smaller radius for a line
            marginTop: 2, // Added margin
          }}
        />
      )}
    </View>
  );
}


export default function Layout() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveBackgroundColor: "transparent",
        tabBarInactiveBackgroundColor: "transparent",
        tabBarItemStyle: {
          backgroundColor: "transparent",
          borderRadius: 0,
          margin: 0,
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
        },
        tabBarStyle: {
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          borderRadius: 15,
          marginHorizontal: responsiveTabBarMargin,
          marginBottom: responsiveTabBarMarginBottom,
          paddingTop: 10,
          height: TAB_BAR_HEIGHT,
          position: "absolute",
          overflow: "hidden",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        sceneStyle: {
          backgroundColor: "black", // Assuming outer background is black
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "", // Keep empty as TopBar handles title
          headerShown: true,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.home} title={t("tabs.home")} />
          ),
          header: () => <TopBar title={t("tabs.header.home")} showBackButton={false} showInbox/>, // --- TRANSLATED ---
        }}
      />
      <Tabs.Screen
        name="education"
        options={{
          title: "",
          headerShown: true,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.educate} title={t("tabs.education")} />
          ),
          header: () => <TopBar title={t("tabs.header.education")} showInbox/>, // --- TRANSLATED ---
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          title: "",
          headerShown: true,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.setting} title={t("tabs.setting")} />
          ),
          header: () => <TopBar title={t("tabs.header.setting")} showInbox/>, // --- TRANSLATED ---
        }}
      />
      {/* Hidden group for stack screens */}
      <Tabs.Screen
        name="(screens)"
        options={{
          title: "",
          headerShown: false,
          href: null, // Keep hidden
          tabBarIcon: ({ focused }) => (
            // Use a translated title even if hidden
            <TabIcon focused={focused} icon={icons.educate} title={t("tabs.screens")} />
          ),
        }}
      />
    </Tabs>
  );
}