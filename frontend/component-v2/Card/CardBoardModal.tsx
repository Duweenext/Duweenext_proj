import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import ButtonCard from "../Buttons/ButtonCard";
import { theme } from "@/theme";

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
  console.log("CardBoardModal rendering:", { name, uuid });
  
  return (
    <View style={styles.container}>
      <View style={styles.infoSection}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.uuid}>UUID: {uuid}</Text>
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
    elevation: 2, // Android shadow
    paddingVertical: 12, // py-3
    paddingHorizontal: 16, // px-4
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
    marginBottom: 8,
  },
  buttonWrapper: {
    marginTop: 16, // mt-4
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
