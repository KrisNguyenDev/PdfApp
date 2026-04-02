import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    type: "image",
    image: require("@/assets/images/1.png"),
  },
  {
    id: "2",
    type: "image",
    image: require("@/assets/images/2.png"),
  },
  {
    id: "3",
    type: "image",
    image: require("@/assets/images/3.png"),
  },
  {
    id: "4",
    type: "image",
    image: require("@/assets/images/4.png"),
  },
  {
    id: "5",
    type: "permission",
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [storagePermission, setStoragePermission] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSkip = () => {
    onComplete();
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleRequestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    setCameraPermission(status === "granted");
  };

  const handleRequestStoragePermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    setStoragePermission(status === "granted");
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item }: any) => {
    if (item.type === "permission") {
      return (
        <View style={{ width, height }} className="flex-1 bg-white">
          {/* Header */}
          <View className="px-6 pt-14 pb-4 flex-row items-center justify-between">
            <Text className="text-gray-900 text-xl font-semibold">
              Grant Permission
            </Text>
            <TouchableOpacity onPress={handleNext}>
              <Text className="text-primary text-base font-semibold">Next</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View className="flex-1 items-center justify-center px-8">
            {/* Illustration */}
            <View className="w-48 h-48 items-center justify-center mb-8">
              <View className="w-32 h-32 bg-blue-100 rounded-full items-center justify-center">
                <Ionicons name="camera" size={64} color="#3B82F6" />
              </View>
              <View className="absolute top-0 right-8 w-8 h-8 bg-red-400 rounded-full" />
              <View className="absolute bottom-4 left-4 w-6 h-6 bg-yellow-400 rounded-full" />
              <View className="absolute top-8 right-0 w-10 h-10">
                <Ionicons name="star" size={24} color="#EF4444" />
              </View>
              <View className="absolute bottom-0 left-8 w-10 h-10">
                <Ionicons name="star" size={24} color="#EF4444" />
              </View>
            </View>

            <Text className="text-gray-600 text-center mb-12 px-4">
              PDF requires permission to use the device&apos;s.
            </Text>

            {/* Permission Switches */}
            <View className="w-full mb-8">
              <View className="flex-row items-center justify-between bg-gray-50 px-5 py-4 rounded-xl mb-4">
                <Text className="text-gray-900 text-base">Camera</Text>
                <Switch
                  value={cameraPermission}
                  onValueChange={(value) => {
                    if (value) {
                      handleRequestCameraPermission();
                    } else {
                      setCameraPermission(false);
                    }
                  }}
                  trackColor={{ false: "#D1D5DB", true: "#B91C1C" }}
                  thumbColor="white"
                />
              </View>

              <View className="flex-row items-center justify-between bg-gray-50 px-5 py-4 rounded-xl">
                <Text className="text-gray-900 text-base">Storage</Text>
                <Switch
                  value={storagePermission}
                  onValueChange={(value) => {
                    if (value) {
                      handleRequestStoragePermission();
                    } else {
                      setStoragePermission(false);
                    }
                  }}
                  trackColor={{ false: "#D1D5DB", true: "#B91C1C" }}
                  thumbColor="white"
                />
              </View>
            </View>
          </View>

          {/* Skip Button */}
          <View className="px-6 pb-8">
            <TouchableOpacity
              onPress={handleSkip}
              className="bg-primary py-4 rounded-xl items-center"
            >
              <Text className="text-white text-base font-semibold">Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Regular image slide
    return (
      <View style={{ width, height }} className="flex-1">
        {/* Full Screen Image Only */}
        <Image
          source={item.image}
          style={{ width: width, height: height }}
          resizeMode="cover"
        />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      {/* Pagination Dots - Hide on permission screen */}
      {currentIndex < slides.length - 1 && (
        <View className="absolute bottom-24 left-0 right-0 flex-row justify-center items-center bg-white py-2">
          {slides.slice(0, -1).map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full mx-1 ${
                index === currentIndex ? "w-8 bg-primary" : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </View>
      )}

      {/* Bottom Buttons - Hide on permission screen */}
      {currentIndex < slides.length - 1 && (
        <View className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-3 bg-white border-t border-gray-100">
          <View className="flex-row justify-between items-center">
            <TouchableOpacity onPress={handleSkip} className="py-3 px-4">
              <Text className="text-gray-600 text-base font-medium">Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNext} className="py-3 px-4">
              <Text className="text-primary text-base font-semibold">
                Next
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
