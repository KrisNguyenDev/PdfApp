import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
}

const SettingItem = ({
  icon,
  title,
  subtitle,
  onPress,
  showArrow = true,
}: SettingItemProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-5 py-4 bg-white border-b border-gray-100"
    >
      <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4">
        <Ionicons name={icon} size={22} color="#B91C1C" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 text-base font-medium">{title}</Text>
        {subtitle && (
          <Text className="text-gray-500 text-sm mt-1">{subtitle}</Text>
        )}
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );
};

export default function Setting() {
  const handleShare = () => {
    Alert.alert(
      "Share App",
      "Share this app with your friends and family!",
      [
        {
          text: "Copy Link",
          onPress: () => {
            // In production, you would copy the actual app store link
            Alert.alert("Success", "App link copied to clipboard!");
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
    );
  };

  const handleRate = () => {
    Alert.alert(
      "Rate App",
      "Thank you for your support! Please rate us on the app store.",
      [
        {
          text: "Rate Now",
          onPress: () => {
            // In production, this would open the app store
            Alert.alert("Thanks!", "This will open the app store in production.");
          },
        },
        {
          text: "Later",
          style: "cancel",
        },
      ],
    );
  };

  const handlePrivacyPolicy = async () => {
    try {
      // Replace with your actual privacy policy URL
      const privacyUrl = "https://yourwebsite.com/privacy-policy";

      await WebBrowser.openBrowserAsync(privacyUrl, {
        toolbarColor: "#B91C1C",
        controlsColor: "#FFFFFF",
      });
    } catch (error) {
      console.error("Error opening privacy policy:", error);
      Alert.alert("Error", "Failed to open privacy policy");
    }
  };

  const handleAbout = () => {
    Alert.alert(
      "About PDF Reader",
      "Version 1.0.0\n\nA powerful PDF reader and document scanner app.\n\n© 2026 All rights reserved.",
      [{ text: "OK" }],
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary px-4 pt-14 pb-4">
        <Text className="text-white text-2xl font-bold">Settings</Text>
      </View>

      <ScrollView className="flex-1">
        {/* App Section */}
        <View className="mt-6">
          <Text className="text-gray-500 text-xs font-semibold uppercase px-5 mb-2">
            App
          </Text>
          <View className="bg-white">
            <SettingItem
              icon="share-social-outline"
              title="Share App"
              subtitle="Share with friends and family"
              onPress={handleShare}
            />
            <SettingItem
              icon="star-outline"
              title="Rate App"
              subtitle="Rate us on the store"
              onPress={handleRate}
            />
          </View>
        </View>

        {/* Legal Section */}
        <View className="mt-6">
          <Text className="text-gray-500 text-xs font-semibold uppercase px-5 mb-2">
            Legal
          </Text>
          <View className="bg-white">
            <SettingItem
              icon="shield-checkmark-outline"
              title="Privacy Policy"
              subtitle="Read our privacy policy"
              onPress={handlePrivacyPolicy}
            />
          </View>
        </View>

        {/* About Section */}
        <View className="mt-6 mb-8">
          <Text className="text-gray-500 text-xs font-semibold uppercase px-5 mb-2">
            About
          </Text>
          <View className="bg-white">
            <SettingItem
              icon="information-circle-outline"
              title="About"
              subtitle="App version and info"
              onPress={handleAbout}
            />
          </View>
        </View>

        {/* App Info */}
        <View className="items-center py-6">
          <Text className="text-gray-400 text-sm">PDF Reader</Text>
          <Text className="text-gray-400 text-xs mt-1">Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}
