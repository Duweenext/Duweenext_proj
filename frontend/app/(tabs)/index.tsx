import BarChartExample from "@/components/BarChartExample";
import LineChartExample from "@/components/LineChartExample";
import { DropDown } from "@/components/menu";
import PieChartExample from "@/components/PieChartExample";
import TabBox from "@/components/TabBox";
import { icons } from "@/constants/icons";
import { router, useRouter } from "expo-router";
import React, { useState } from "react";
import {ScrollView, Text,View } from "react-native";

const InfoSection = ({ time, harvest, waterchange }: { time: string, harvest: number, waterchange: number }) => {
  return (
    <>
      <View className="flex justify-between items-start p-5 w-full h-[30%] bg-[#1A736A] rounded-xl">
        <Text className="text-xl font-semibold text-white text-center">Current Progress</Text>
        <Text className="text-base text-white text-center">Estimated harvest time: {time}</Text>
      </View>
      <View className="flex justify-between items-start p-5 w-full h-[30%] bg-[#1A736A] rounded-xl">
        <Text className="text-xl font-semibold text-white text-center">Current Progress</Text>
        <View className="flex-row justify-between items-center w-full">
          <Text className="text-base text-white text-center">Harvest: {harvest}</Text>
          <Text className="text-base text-white text-center">Water Change: {waterchange}</Text>
        </View>
      </View>
    </>
  );
}
//router.push('/imageprocess')
//router.push('/assistant')
export default function Index() {
  const [selectedGraph, setSelectedGraph] = useState('Line graph');

  const handleGraphSelect = (value: string) => {
    setSelectedGraph(value);
  };

  return (
    <ScrollView>
      <View className="flex-1 justify-start items-start px-5 gap-6">
        <View className="flex-row justify-between items-center gap-3">
          <TabBox title="Sensor" icon={icons.sensor} onNav={() => router.push({
            pathname: '/(tabs)/sensor/[id]',
            params: { id: 2 },
          })} />
          <TabBox title="Check pond health" icon={icons.camera} onNav={() => null} />
          <TabBox title="Assistance" icon={icons.assistant} onNav={() => null} />
        </View>
        <View className="bg-[#1A736A] w-full h-[0.25%] opacity-20" />
        {/* <InfoSection time="15 April 2025 (Saturday)" harvest={1} waterchange={2} /> */}
        <View className="flex-row justify-between items-center w-full">
          <Text className="text-xl text-black font-bold text-start">Activity Overview</Text>
          <DropDown
            options={['Line graph', 'Bar graph', 'Pie graph']}
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
  select: string
}

const Graphsection = ({ select }: Graphtype) => {

  switch (select) {
    case 'Line graph': {
      return (
        <View className="flex w-auto">
          <LineChartExample />
        </View>
      );
    }
    case 'Bar graph': {
      return (
        <View className="flex w-auto">
          <BarChartExample />
        </View>
      );
    }
    case 'Pie graph': {
      return (
        <View className="flex w-auto">
          <PieChartExample />
        </View>
      );
    }
  }
}
