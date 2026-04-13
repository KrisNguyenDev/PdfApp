import { usePdf } from "@/contexts/PdfContext";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import * as Print from "expo-print";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ScanDocument() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [pdfFileName, setPdfFileName] = useState("");
  const [isReady, setIsReady] = useState(false);
  const { refreshPdfFiles } = usePdf();

  const getDefaultFileName = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB").replace(/\//g, "");
    return `Scan ${dateStr}`;
  };

  const openCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera permissions to scan documents.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ],
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets) {
      setCapturedImage(result.assets[0].uri);
    } else {
      // User cancelled, go back
      router.back();
    }
  }, []);

  useEffect(() => {
    // Small delay to ensure screen is mounted before opening camera
    const timer = setTimeout(() => {
      setIsReady(true);
      openCamera();
    }, 500);

    return () => clearTimeout(timer);
  }, [openCamera]);

  const retakePhoto = () => {
    setCapturedImage(null);
    setShowNameModal(false);
    openCamera();
  };

  const convertToPdf = async (fileName: string) => {
    if (!capturedImage) return;

    setShowNameModal(false);
    setIsConverting(true);

    try {
      console.log("=== Starting PDF conversion from scan ===");
      console.log("File name:", fileName);
      console.log("Image URI:", capturedImage);

      // Convert image to base64
      const base64 = await FileSystem.readAsStringAsync(capturedImage, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Detect image type
      const mimeType =
        capturedImage.toLowerCase().endsWith(".jpg") ||
        capturedImage.toLowerCase().endsWith(".jpeg")
          ? "image/jpeg"
          : "image/png";

      const dataUri = `data:${mimeType};base64,${base64}`;

      // Create HTML with the image
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              html, body { 
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
              }
            </style>
          </head>
          <body>
            <div style="width: 100%; height: 100vh; display: flex; align-items: center; justify-content: center; background: white;">
              <img src="${dataUri}" style="max-width: 95%; max-height: 95%; object-fit: contain;" />
            </div>
          </body>
        </html>
      `;

      console.log("Calling Print.printToFileAsync...");

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      console.log("PDF created at temp location:", uri);

      // Use custom file name
      const sanitizedFileName = fileName.replace(/\.pdf$/i, "");
      const finalFileName = `${sanitizedFileName}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${finalFileName}`;

      await FileSystem.moveAsync({
        from: uri,
        to: fileUri,
      });

      console.log("PDF moved to:", fileUri);

      // Check file size
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists && "size" in fileInfo) {
        console.log("PDF file size:", fileInfo.size, "bytes");
      }

      await refreshPdfFiles();

      console.log("=== PDF conversion completed ===");

      Alert.alert("Success", "Document scanned and saved as PDF!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("=== Error creating PDF ===");
      console.error("Error:", error);
      Alert.alert("Error", "Failed to create PDF. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleShowNameModal = () => {
    setPdfFileName(getDefaultFileName());
    setShowNameModal(true);
  };

  const handleSavePdf = () => {
    if (!pdfFileName.trim()) {
      Alert.alert("Error", "Please enter a file name");
      return;
    }
    convertToPdf(pdfFileName);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-primary px-4 pt-14 pb-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-semibold">
              All PDF Reader
            </Text>
          </View>
          {capturedImage && (
            <TouchableOpacity onPress={handleShowNameModal}>
              <Ionicons name="checkmark" size={28} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Preview */}
      {capturedImage ? (
        <View className="flex-1">
          <View className="flex-1 items-center justify-center bg-gray-100">
            <Image
              source={{ uri: capturedImage }}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>

          {/* Bottom Actions */}
          <View className="px-4 pb-8 pt-4 border-t border-gray-200">
            <View className="flex-row justify-center items-center gap-4">
              <TouchableOpacity
                onPress={retakePhoto}
                className="items-center justify-center"
              >
                <View className="w-14 h-14 bg-gray-100 rounded-full items-center justify-center">
                  <Ionicons name="camera-outline" size={28} color="#B91C1C" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShowNameModal}
                className="bg-primary flex-1 py-4 rounded-xl items-center"
              >
                <Text className="text-white text-base font-semibold">
                  Convert to PDF
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#B91C1C" />
          <Text className="text-gray-500 mt-4">
            {isReady ? "Opening camera..." : "Loading..."}
          </Text>
          {isReady && (
            <TouchableOpacity
              onPress={openCamera}
              className="mt-6 bg-primary px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold">Open Camera</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Loading Overlay */}
      {isConverting && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center">
          <View className="bg-white rounded-2xl p-6 items-center min-w-[200px]">
            <ActivityIndicator size="large" color="#B91C1C" />
            <Text className="text-gray-700 mt-4 text-base">
              Converting to PDF...
            </Text>
          </View>
        </View>
      )}

      {/* Name Modal */}
      <Modal
        visible={showNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNameModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setShowNameModal(false)}
        >
          <View className="flex-1 justify-center items-center px-6">
            <Pressable
              className="bg-white rounded-2xl w-full max-w-md"
              onPress={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <View className="bg-primary px-5 py-4 rounded-t-2xl flex-row items-center justify-between">
                <TouchableOpacity onPress={() => setShowNameModal(false)}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-semibold flex-1 text-center">
                  Convert to PDF
                </Text>
                <TouchableOpacity onPress={handleSavePdf}>
                  <Text className="text-white text-base font-semibold">
                    Save
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Input */}
              <View className="px-5 py-6">
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900"
                  placeholder="Enter PDF file name"
                  value={pdfFileName}
                  onChangeText={setPdfFileName}
                  autoFocus
                  selectTextOnFocus
                />
              </View>

              {/* Save Button */}
              <View className="px-5 pb-5">
                <TouchableOpacity
                  onPress={handleSavePdf}
                  className="bg-primary py-4 rounded-xl items-center"
                >
                  <Text className="text-white text-base font-semibold">
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
