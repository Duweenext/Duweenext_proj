import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import ButtonCard from "../Buttons/ButtonCard";
import { theme } from "@/theme";
import { getDisplayMacAddress, convertBleDeviceId } from "@/src/utils/bleUtils";

interface DeviceCardProps {
  name: string;
  uuid: string;
  onConnect: () => void;
  className?: string; // Not used for RN styling, but kept for prop compatibility
}

export const CardBoardModal: React.FC<DeviceCardProps> = ({
  name,
  uuid,
  onConnect,
}) => {
  // Convert UUID for display and comparison
  const displayUuid = getDisplayMacAddress(uuid);
  const normalizedUuid = convertBleDeviceId(uuid);
  
  console.log("CardBoardModal rendering:", { 
    name, 
    originalUuid: uuid,
    displayUuid,
    normalizedUuid
  });
  
  return (
    <View style={styles.container}>
      <View style={styles.infoSection}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.uuid}>UUID: {displayUuid}</Text>
        <Text style={styles.normalizedUuid}>ID: {normalizedUuid}</Text>
      </View>
      <View style={styles.buttonWrapper}>
        <ButtonCard
          text="Connect"
          filledColor={theme.colors.black}
          textColor="white"
          onPress={onConnect}
          round={10}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 5, // 0.5rem
    borderWidth: 1,
    borderColor: "black",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    width: "100%",
    minHeight: 80,
  },
  infoSection: {
    flexDirection: "column",
    marginBottom: 8,
  },
  name: {
    fontSize: theme.fontSize.header2, // text-lg
    fontFamily: theme.fontFamily.semibold,
    color: "black",
  },
  uuid: {
    fontSize: theme.fontSize.data_text, // text-sm
    fontFamily: theme.fontFamily.regular,
    color: "black",
    marginBottom: 4,
  },
  normalizedUuid: {
    fontSize: theme.fontSize.data_text, // text-sm
    fontFamily: theme.fontFamily.regular,
    color: "#666",
    marginBottom: 8,
  },
  buttonWrapper: {
    marginTop: 16, // mt-4
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
