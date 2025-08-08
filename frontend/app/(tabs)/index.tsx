import { BarChartExample } from "@/components/BarChartExample";
import LineChartExample from "@/components/LineChartExample";
import { DropDown } from "@/components/menu";
import { PieChartExample } from "@/components/PieChartExample";
import TabBox from "@/components/TabBox";
import { icons } from "@/constants/icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";

const InfoSection = ({
  time,
  harvest,
  waterchange,
}: {
  time: string;
  harvest: number;
  waterchange: number;
}) => {
  return (
    <>
      <View
        style={{
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: 20,
          width: "100%",
          height: "30%",
          backgroundColor: "#1A736A",
          borderRadius: 12,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "600",
            color: "#FFFFFF",
            textAlign: "center",
          }}
        >
          Current Progress
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: "#FFFFFF",
            textAlign: "center",
          }}
        >
          Estimated harvest time: {time}
        </Text>
      </View>
      <View
        style={{
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: 20,
          width: "100%",
          height: "30%",
          backgroundColor: "#1A736A",
          borderRadius: 12,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "600",
            color: "#FFFFFF",
            textAlign: "center",
          }}
        >
          Current Progress
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: "#FFFFFF",
              textAlign: "center",
            }}
          >
            Harvest: {harvest}
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#FFFFFF",
              textAlign: "center",
            }}
          >
            Water Change: {waterchange}
          </Text>
        </View>
      </View>
    </>
  );
};

export default function Index() {
  const [selectedGraph, setSelectedGraph] = useState("Line graph");

  const handleGraphSelect = (value: string) => {
    setSelectedGraph(value);
  };

  return (
    <ScrollView>
      <View
        style={{
          flex: 1,
          justifyContent: "flex-start",
          alignItems: "flex-start",
          paddingHorizontal: 20,
          gap: 24,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <TabBox
            title="Sensor"
            icon={icons.sensor}
            onNav={() =>
              router.push({
                pathname: "/(tabs)/sensor/[id]",
                params: { id: 2 },
              })
            }
          />
          <TabBox
            title="Check pond health"
            icon={icons.camera}
            onNav={() => null}
          />
          <TabBox title="Assistance" icon={icons.assistant} onNav={() => null} />
        </View>

        <View
          style={{
            backgroundColor: "#1A736A",
            width: "100%",
            height: 1,
            opacity: 0.2,
          }}
        />

        {/* <InfoSection time="15 April 2025 (Saturday)" harvest={1} waterchange={2} /> */}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              color: "#000000",
              fontWeight: "bold",
              textAlign: "left",
            }}
          >
            Activity Overview
          </Text>
          <DropDown
            options={["Line graph", "Bar graph", "Pie graph"]}
            selected={selectedGraph}
            onSelect={handleGraphSelect}
            buttonText="Select Graph"
          />
        </View>

        <Graphsection select={selectedGraph} />
      </View>
    </ScrollView>
  );
}

interface Graphtype {
  select: string;
}

const Graphsection = ({ select }: Graphtype) => {
  switch (select) {
    case "Line graph": {
      return (
        <View style={{ flex: 1, width: "auto" }}>
          <LineChartExample />
        </View>
      );
    }
    case "Bar graph": {
      return (
        <View style={{ flex: 1, width: "auto" }}>
          <BarChartExample />
        </View>
      );
    }
    case "Pie graph": {
      return (
        <View style={{ flex: 1, width: "auto" }}>
          <PieChartExample />
        </View>
      );
    }
    default:
      return null;
  }
};
