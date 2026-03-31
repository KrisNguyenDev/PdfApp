import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Modal, Pressable, Text, TouchableOpacity, View, Alert } from "react-native";
import { usePdf } from "@/contexts/PdfContext";
import * as Sharing from "expo-sharing";

interface FileMenuModalProps {
  visible: boolean;
  onClose: () => void;
  selectedFile: {
    id: string;
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
  const { deletePdfFile } = usePdf();

  const handleMenuAction = async (optionId: string) => {
    if (optionId === "1" && selectedFile?.uri) {
      onClose();
      router.push({
        pathname: "/pdf-viewer",
        params: {
          uri: encodeURIComponent(selectedFile.uri),
          name: selectedFile.name,
        },
      });
    } else if (optionId === "2") {
      onClose();
      // TODO: Implement email functionality
    } else if (optionId === "3" && selectedFile?.uri) {
      // Share A Copy functionality
      try {
        const isAvailable = await Sharing.isAvailableAsync();
        
        if (!isAvailable) {
          onClose();
          Alert.alert("Error", "Sharing is not available on this device");
          return;
        }

        await Sharing.shareAsync(selectedFile.uri, {
          mimeType: "application/pdf",
          dialogTitle: `Share ${selectedFile.name}`,
          UTI: "com.adobe.pdf",
        });
        
        onClose();
      } catch (error) {
        console.error("Error sharing PDF:", error);
        onClose();
        Alert.alert("Error", "Failed to share PDF. Please try again.");
      }
    } else if (optionId === "4" && selectedFile) {
      // Delete functionality - show confirmation first
      Alert.alert(
        "Delete PDF",
        `Are you sure you want to delete "${selectedFile.name}"?`,
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => onClose(),
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              onClose();
              try {
                await deletePdfFile(selectedFile.id, selectedFile.uri);
                Alert.alert("Success", "PDF deleted successfully");
              } catch (error) {
                console.error("Error deleting PDF:", error);
                Alert.alert("Error", "Failed to delete PDF. Please try again.");
              }
            },
          },
        ]
      );
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
