import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system/legacy";
import { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import { usePdf } from "@/contexts/PdfContext";

export default function ImageSelection() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const { refreshPdfFiles } = usePdf();

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera roll permissions to select images."
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
        "Sorry, we need camera permissions to take photos."
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

  const handleConvertToPdf = async () => {
    debugger
    if (selectedImages.length === 0) {
      Alert.alert("No Images", "Please select at least one image to convert.");
      return;
    }

    setIsConverting(true);

    try {
      debugger
      console.log("=== Starting PDF conversion ===");
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
          const mimeType = uri.toLowerCase().endsWith('.jpg') || uri.toLowerCase().endsWith('.jpeg') 
            ? 'image/jpeg' 
            : 'image/png';
          console.log(`MIME type for image ${index + 1}:`, mimeType);
          
          return `data:${mimeType};base64,${base64}`;
        })
      );

      console.log("All images converted to base64");

      // Tạo HTML với base64 images
      const imagesHtml = imagesBase64
        .map(
          (dataUri, index) => `
        <div style="page-break-after: ${index < imagesBase64.length - 1 ? 'always' : 'auto'}; padding: 20px; text-align: center;">
          <img src="${dataUri}" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" />
        </div>
      `
        )
        .join("");

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: Arial, sans-serif;
                background: white;
              }
              img {
                max-width: 100%;
                height: auto;
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

      const timestamp = new Date().getTime();
      const fileName = `PDF_${timestamp}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

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
        ]
      );
    } catch (error) {
      console.error("=== Error creating PDF ===");
      console.error("Error:", error);
      Alert.alert("Error", "Failed to create PDF. Please try again.");
    } finally {
      setIsConverting(false);
    }
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
          <TouchableOpacity onPress={handleConvertToPdf}>
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
              onPress={handleConvertToPdf}
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
    </View>
  );
}
