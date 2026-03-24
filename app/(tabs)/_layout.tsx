import home from "@/assets/icons/home.png";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Image, View } from "react-native";

const TabIcon = ({ icon, focused }: { icon?: any; focused: boolean }) => {
  return (
    <View className="flex flex-row w-full justify-center items-center h-full">
      <Image source={icon} className="size-5" />
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
            <TabIcon icon={home} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="recent"
        options={{
          title: "Recent",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="search-outline"
              size={24}
              color={focused ? "blue" : ""}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorite"
        options={{
          title: "Favorite",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="bookmark-outline"
              size={24}
              color={focused ? "blue" : ""}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          title: "Setting",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="person-outline"
              size={24}
              color={focused ? "blue" : ""}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
