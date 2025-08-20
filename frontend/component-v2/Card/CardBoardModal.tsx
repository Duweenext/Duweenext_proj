import * as React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import ButtonCard from "../Buttons/ButtonCard";
import { theme } from "@/theme";

interface DeviceCardProps {
  name: string;
  uuid: string;
  onConnect: () => void;
  isConnecting?: boolean;
  isConnected?: boolean; // Prop to indicate connection status
  className?: string; 
}

export const CardBoardModal: React.FC<DeviceCardProps> = ({
  name,
  uuid,
  onConnect,
  isConnecting = false,
  isConnected = false, // Destructure with a default value
}) => {
  
  return (
    <View style={styles.container}>
      <View style={styles.infoSection}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.uuid}>UUID: {uuid}</Text>
      </View>
      <View style={styles.buttonWrapper}>
        {isConnecting ? (
          // If connecting, show a loading spinner
          <ActivityIndicator color={theme.colors.black} />
        ) : isConnected ? (
          // If already connected, show a Disconnect button
          <ButtonCard
            text="Disconnect"
            filledColor="#e53e3e" // A red color for the disconnect action
            textColor="white"
            onPress={onConnect} // The parent component's handler will determine the action
            round={10}
          />
        ) : (
          // Otherwise, show the connect button
          <ButtonCard
            text="Connect"
            filledColor={theme.colors.black}
            textColor="white"
            onPress={onConnect}
            round={10}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 5,
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
    flexDirection: 'row', // Align items in a row
    justifyContent: 'space-between', // Space out info and button
    alignItems: 'center', // Center items vertically
  },
  infoSection: {
    flexDirection: "column",
    justifyContent: 'center', // Center text vertically
    flex: 1, // Allow info section to take available space
  },
  name: {
    fontSize: theme.fontSize.header2,
    fontFamily: theme.fontFamily.semibold,
    color: "black",
  },
  uuid: {
    fontSize: theme.fontSize.data_text,
    fontFamily: theme.fontFamily.regular,
    color: "black",
  },
  buttonWrapper: {
    justifyContent: "center",
    alignItems: 'center',
    minWidth: 80, // Give the button wrapper a fixed width
  },
});
