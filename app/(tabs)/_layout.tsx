import ClockSvg from "@/assets/icons/clock.svg";
import HomeSvg from "@/assets/icons/home.svg";
import MagicStarSvg from "@/assets/icons/magic-star.svg";
import SettingSvg from "@/assets/icons/setting.svg";
import { Tabs } from "expo-router";
import { View } from "react-native";

const TabIcon = ({ icon: Icon, focused }: { icon?: any; focused: boolean }) => {
  return (
    <View className="flex flex-row w-full justify-center items-center h-full">
      {Icon && <Icon width={20} height={20} />}
    </View>
  );
};

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {},
        tabBarItemStyle: {},
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={HomeSvg} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="recent"
        options={{
          title: "Recent",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={ClockSvg} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorite"
        options={{
          title: "Favorite",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={MagicStarSvg} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          title: "Setting",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={SettingSvg} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
