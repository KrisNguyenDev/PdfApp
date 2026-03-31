import { Stack } from "expo-router";
import "./global.css";
import { PdfProvider } from "@/contexts/PdfContext";

export default function RootLayout() {
  return (
    <PdfProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="create-pdf/image-selection"
          options={{ headerShown: false }}
        />
      </Stack>
    </PdfProvider>
  );
}
