import OnboardingScreen from "@/components/OnboardingScreen";
import { PdfProvider } from "@/contexts/PdfContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import "./global.css";

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem(
        "@has_seen_onboarding",
      );
      // FORCE SHOW ONBOARDING FOR TESTING - Remove this line after testing
      setShowOnboarding(hasSeenOnboarding !== "true"); // Change to: hasSeenOnboarding !== "true"
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setShowOnboarding(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem("@has_seen_onboarding", "true");
      setShowOnboarding(false);
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  if (isLoading) {
    return null;
  }

  if (showOnboarding) {
    return (
      <PdfProvider>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </PdfProvider>
    );
  }

  return (
    <PdfProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="create-pdf/image-selection"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="pdf-viewer" options={{ headerShown: false }} />
        <Stack.Screen
          name="create-pdf/scan-document"
          options={{ headerShown: false }}
        />
      </Stack>
    </PdfProvider>
  );
}
