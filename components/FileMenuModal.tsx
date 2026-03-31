import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

interface FileMenuModalProps {
  visible: boolean;
  onClose: () => void;
  selectedFile: {
    name: string;
    uri?: string;
  } | null;
}

const menuOptions = [
  { id: "1", label: "Open file", icon: "document-text-outline" },
  { id: "2", label: "Email", icon: "mail-outline" },
  { id: "3", label: "Share A Copy", icon: "share-social-outline" },
  { id: "4", label: "Delete", icon: "trash-outline" },
];

export default function FileMenuModal({
  visible,
  onClose,
  selectedFile,
}: FileMenuModalProps) {
  const handleMenuAction = (optionId: string) => {
    onClose();
    
    if (optionId === "1" && selectedFile?.uri) {
      router.push({
        pathname: "/pdf-viewer",
        params: {
          uri: encodeURIComponent(selectedFile.uri),
          name: selectedFile.name,
        },
      });
    } else if (optionId === "2") {
      // TODO: Implement email functionality
    } else if (optionId === "3") {
      // TODO: Implement share functionality
    } else if (optionId === "4") {
      // TODO: Implement delete functionality
    }
  };

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
            className="bg-white rounded-2xl w-full max-w-md"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View className="flex-row items-center px-5 py-4 border-b border-gray-200">
              <View className="w-10 h-10 bg-primary rounded-lg items-center justify-center mr-3">
                <Ionicons name="document-text" size={20} color="white" />
              </View>
              <Text className="flex-1 text-gray-900 font-medium text-base">
                {selectedFile?.name || ""}
              </Text>
            </View>

            {/* Menu Options */}
            <View className="py-2">
              {menuOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => handleMenuAction(option.id)}
                  className="flex-row items-center px-5 py-4"
                >
                  <View className="w-7 mr-4">
                    <Ionicons
                      name={option.icon as any}
                      size={24}
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
