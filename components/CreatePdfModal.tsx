import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

interface CreatePdfModalProps {
  visible: boolean;
  onClose: () => void;
}

const createOptions = [
  { id: "1", label: "Image to PDF", icon: "image-outline" },
  { id: "2", label: "Scan Document", icon: "camera-outline" },
];

export default function CreatePdfModal({
  visible,
  onClose,
}: CreatePdfModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/50" onPress={onClose}>
        <View className="flex-1 justify-center items-center px-6">
          <Pressable
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View className="bg-primary px-5 py-4 flex-row items-center">
              <TouchableOpacity onPress={onClose} className="mr-4">
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <Text className="text-white text-xl font-semibold">
                Create PDF
              </Text>
            </View>

            {/* Create Options */}
            <View className="py-2">
              {createOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => {
                    onClose();
                    if (option.id === "1") {
                      // Image to PDF
                      router.push("/create-pdf/image-selection");
                    } else if (option.id === "2") {
                      // Scan Document - TODO: Implement later
                    }
                  }}
                  className="flex-row items-center px-5 py-4 border-b border-gray-100"
                >
                  <View className="w-8 mr-4">
                    <Ionicons
                      name={option.icon as any}
                      size={28}
                      color="#B91C1C"
                    />
                  </View>
                  <Text className="text-gray-900 text-base">
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
