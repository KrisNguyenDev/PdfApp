import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

export default function ImageSelection() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

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

  const handleConvertToPdf = () => {
    if (selectedImages.length === 0) {
      Alert.alert("No Images", "Please select at least one image to convert.");
      return;
    }
    // TODO: Implement PDF conversion logic
    Alert.alert("Success", `Converting ${selectedImages.length} images to PDF...`);
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
          <TouchableOpacity onPress={handleConvertToPdf}>
            <Ionicons name="checkmark" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Image Grid */}
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

      {/* Bottom Actions */}
      <View className="px-4 pb-8 pt-4 border-t border-gray-200">
        <View className="flex-row justify-center items-center gap-4">
          {/* Pick from Gallery */}
          <TouchableOpacity
            onPress={pickImages}
            className="items-center justify-center"
          >
            <View className="w-14 h-14 bg-gray-100 rounded-full items-center justify-center">
              <Ionicons name="images-outline" size={28} color="#B91C1C" />
            </View>
          </TouchableOpacity>

          {/* Take Photo */}
          <TouchableOpacity
            onPress={takePhoto}
            className="items-center justify-center"
          >
            <View className="w-14 h-14 bg-gray-100 rounded-full items-center justify-center">
              <Ionicons name="camera-outline" size={28} color="#B91C1C" />
            </View>
          </TouchableOpacity>

          {/* Convert to PDF Button */}
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
      </View>
    </View>
  );
}
