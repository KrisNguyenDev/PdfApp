import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Image, Text, View } from "react-native";

const TabIcon = ({
  tabName,
  icon,
  focused,
}: {
  tabName?: string;
  icon?: any;
  focused: boolean;
}) => {
  return (
    <View className="flex flex-row w-full justify-center items-center h-full">
      <Image source={icon} tintColor="#151312" className="size-5" />
      <Text className="text-base font-semibold">{tabName}</Text>
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
            <Ionicons
              name="home-outline"
              size={24}
              color={focused ? "blue" : ""}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
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
        name="saved"
        options={{
          title: "Saved",
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
        name="profile"
        options={{
          title: "Profile",
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
