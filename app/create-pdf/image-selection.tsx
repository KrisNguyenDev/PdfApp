import { usePdf } from "@/contexts/PdfContext";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import * as Print from "expo-print";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ImageSelection() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [pdfFileName, setPdfFileName] = useState("");
  const { refreshPdfFiles } = usePdf();

  const getDefaultFileName = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB").replace(/\//g, "");
    return `PDF ${dateStr}`;
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera roll permissions to select images.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => asset.uri);
      setSelectedImages([...selectedImages, ...newImages]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera permissions to take photos.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      setSelectedImages([...selectedImages, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
  };

  const handleShowNameModal = () => {
    if (selectedImages.length === 0) {
      Alert.alert("No Images", "Please select at least one image to convert.");
      return;
    }
    setPdfFileName(getDefaultFileName());
    setShowNameModal(true);
  };

  const convertToPdf = async (fileName: string) => {
    setShowNameModal(false);
    setIsConverting(true);

    try {
      console.log("=== Starting PDF conversion ===");
      console.log("File name:", fileName);
      console.log("Number of images:", selectedImages.length);
      console.log("Image URIs:", selectedImages);

      // Convert tất cả ảnh thành base64 với auto-detect mime type
      const imagesBase64 = await Promise.all(
        selectedImages.map(async (uri, index) => {
          console.log(`Converting image ${index + 1}:`, uri);
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          console.log(`Base64 length for image ${index + 1}:`, base64.length);

          // Detect image type từ URI hoặc default là PNG
          const mimeType =
            uri.toLowerCase().endsWith(".jpg") ||
            uri.toLowerCase().endsWith(".jpeg")
              ? "image/jpeg"
              : "image/png";
          console.log(`MIME type for image ${index + 1}:`, mimeType);

          return `data:${mimeType};base64,${base64}`;
        }),
      );

      console.log("All images converted to base64");

      // Tạo HTML với base64 images - fixed height approach
      const imagesHtml = imagesBase64
        .map(
          (dataUri, index) => `
        <div style="width: 100%; height: 100vh; display: flex; align-items: center; justify-content: center; background: white;">
          <img src="${dataUri}" style="max-width: 95%; max-height: 95%; object-fit: contain;" />
        </div>
      `,
        )
        .join("");

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
            ${imagesHtml}
          </body>
        </html>
      `;

      console.log("HTML generated, length:", html.length);
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

      Alert.alert(
        "Success",
        `Created PDF with ${selectedImages.length} images!`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      console.error("=== Error creating PDF ===");
      console.error("Error:", error);
      Alert.alert("Error", "Failed to create PDF. Please try again.");
    } finally {
      setIsConverting(false);
    }
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
          <TouchableOpacity onPress={handleShowNameModal}>
            <Ionicons name="checkmark" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {selectedImages.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="images-outline" size={80} color="#9CA3AF" />
            <Text className="text-gray-400 text-base mt-4">
              No images selected
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              Tap the buttons below to add images
            </Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap">
            {selectedImages.map((uri, index) => (
              <View
                key={index}
                className="w-[32%] aspect-square m-[0.5%] relative"
              >
                <Image
                  source={{ uri }}
                  className="w-full h-full rounded-lg"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => removeImage(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-primary rounded-full items-center justify-center"
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View className="px-4 pb-8 pt-4 border-t border-gray-200">
        {isConverting ? (
          <View className="py-4 items-center">
            <ActivityIndicator size="large" color="#B91C1C" />
            <Text className="text-gray-600 mt-2">Creating PDF...</Text>
          </View>
        ) : (
          <View className="flex-row justify-center items-center gap-4">
            <TouchableOpacity
              onPress={pickImages}
              className="items-center justify-center"
            >
              <View className="w-14 h-14 bg-gray-100 rounded-full items-center justify-center">
                <Ionicons name="images-outline" size={28} color="#B91C1C" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={takePhoto}
              className="items-center justify-center"
            >
              <View className="w-14 h-14 bg-gray-100 rounded-full items-center justify-center">
                <Ionicons name="camera-outline" size={28} color="#B91C1C" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShowNameModal}
              disabled={selectedImages.length === 0}
              className={`${
                selectedImages.length === 0 ? "bg-gray-300" : "bg-primary"
              } flex-1 py-4 rounded-xl items-center`}
            >
              <Text className="text-white text-base font-semibold">
                Convert to PDF
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

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
                  Covert to PDF
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
