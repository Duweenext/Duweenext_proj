import TabBox from "@/components/TabBox";
import { icons } from "@/constants/icons";
import { useRouter } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

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
//router.push('/sensor')
//router.push('/imageprocess')
//router.push('/assistant')
export default function Index() {
  const router = useRouter();

  return (
    <ScrollView>
      <View className="flex-1 justify-start items-start p-5 gap-6">
        <View className="flex-row justify-between items-center gap-3">
          <TabBox title="Sensor" icon={icons.sensor} onNav={() => null} />
          <TabBox title="Check pond health" icon={icons.camera} onNav={() => null} />
          <TabBox title="Assistance" icon={icons.assistant} onNav={() => null} />
        </View>
        <View className="bg-[#1A736A] w-full h-[0.75%] opacity-20" />
        <InfoSection time="15 April 2025 (Saturday)" harvest={1} waterchange={2} />
        <Text className="text-xl text-black font-bold text-start">Summary</Text>
      </View>
    </ScrollView>
  );
}
