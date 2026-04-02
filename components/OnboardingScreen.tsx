import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    image: require("@/assets/images/1.png"),
    title: "Read PDF Files",
    description: "Manage and read all your PDF File with ease",
  },
  {
    id: "2",
    image: require("@/assets/images/2.png"),
    title: "Read Office Files",
    description: "Not just PDF, read and manage Word, Excel, PPT",
  },
  {
    id: "3",
    image: require("@/assets/images/3.png"),
    title: "Create PDF Files",
    description: "Create PDF files from the camera or photos available on the device",
  },
  {
    id: "4",
    image: require("@/assets/images/4.png"),
    title: "Sign",
    description: "Add your Sign to PDF file",
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleFinish = () => {
    onComplete();
  };

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
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item }: any) => (
    <View style={{ width, height }} className="flex-1">
      {/* Full Screen Image Only */}
      <Image
        source={item.image}
        style={{ width: width, height: height }}
        resizeMode="cover"
      />
    </View>
  );

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

      {/* Pagination Dots */}
      <View className="absolute bottom-24 left-0 right-0 flex-row justify-center items-center bg-white py-2">
        {slides.map((_, index) => (
          <View
            key={index}
            className={`h-2 rounded-full mx-1 ${
              index === currentIndex ? "w-8 bg-primary" : "w-2 bg-gray-300"
            }`}
          />
        ))}
      </View>

      {/* Bottom Buttons */}
      <View className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-3 bg-white border-t border-gray-100">
        {currentIndex < slides.length - 1 ? (
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
        ) : (
          <TouchableOpacity
            onPress={handleFinish}
            className="bg-primary py-3.5 rounded-xl items-center"
          >
            <Text className="text-white text-base font-semibold">
              Get Started
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
