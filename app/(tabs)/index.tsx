import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const pdfFiles = [
  {
    id: "1",
    name: "All PDF Reader",
    date: "2023/05/31",
    time: "11:37",
    size: "37.08KB",
    isFavorite: false,
    updatedDate: "2023/05/31",
  },
  {
    id: "2",
    name: "How to optimize images in...",
    date: "2023/05/31",
    time: "11:37",
    size: "37.08KB",
    isFavorite: false,
    updatedDate: "2023/05/31",
  },
  {
    id: "3",
    name: "All PDF Reader",
    date: "2023/05/31",
    time: "11:37",
    size: "37.08KB",
    isFavorite: false,
    updatedDate: "2023/05/31",
  },
  {
    id: "4",
    name: "All PDF Reader",
    date: "2023/05/31",
    time: "11:37",
    size: "37.08KB",
    isFavorite: false,
    updatedDate: "2023/05/31",
  },
  {
    id: "5",
    name: "All PDF Reader",
    date: "2023/05/31",
    time: "11:37",
    size: "37.08KB",
    isFavorite: false,
    updatedDate: "2023/05/31",
  },
  {
    id: "6",
    name: "All PDF Reader",
    date: "2023/05/31",
    time: "11:37",
    size: "37.08KB",
    isFavorite: false,
    updatedDate: "2023/05/31",
  },
  {
    id: "7",
    name: "All PDF Reader",
    date: "2023/05/31",
    time: "11:37",
    size: "37.08KB",
    isFavorite: false,
    updatedDate: "2023/05/31",
  },
];

export default function Index() {
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const menuOptions = [
    { id: "1", label: "Open file", icon: "document-text-outline" },
    { id: "2", label: "Email", icon: "mail-outline" },
    { id: "3", label: "Share A Copy", icon: "share-social-outline" },
    { id: "4", label: "Delete", icon: "trash-outline" },
  ];

  const handleOpenMenu = (file: any) => {
    setSelectedFile(file);
    setShowModal(true);
  };

  return (
    <View className="w-full h-full">
      {/* Header */}
      <View className="bg-primary px-4 pt-14 pb-8 rounded-b-2xl">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-white text-2xl font-bold">All PDF Reader</Text>
          <View className="flex-row items-center gap-4">
            <Ionicons name="notifications-outline" size={24} color="white" />
            <Ionicons name="search-outline" size={24} color="white" />
            <Ionicons name="menu" size={24} color="white" />
          </View>
        </View>
      </View>

      {/* PDF List */}
      <FlatList
        style={{ paddingHorizontal: 16, paddingTop: 16 }}
        data={pdfFiles}
        keyExtractor={(item) => item.id}
        className="flex-1"
        renderItem={({ item }) => (
          <View className="flex-row items-center px-4 py-3 border border-spacing-10 border-gray-300 rounded-lg mb-3">
            {/* PDF Icon */}
            <View className="w-10 h-10 bg-primary rounded-lg items-center justify-center mr-3">
              <Ionicons name="document-text" size={20} color="white" />
            </View>

            {/* File Info */}
            <View className="flex-1">
              <Text className="text-gray-900 font-medium text-base mb-1">
                {item.name}
              </Text>
              <Text className="text-gray-400 text-xs">
                {item.date} | {item.time} | {item.size}
              </Text>
            </View>

            {/* Star Icon */}
            <TouchableOpacity className="mr-3">
              <Ionicons
                name={item.isFavorite ? "star" : "star-outline"}
                size={22}
                color={item.isFavorite ? "#FCD34D" : "#9CA3AF"}
              />
            </TouchableOpacity>

            {/* Menu Icon */}
            <TouchableOpacity onPress={() => handleOpenMenu(item)}>
              <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* FAB Button */}
      <Pressable className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg">
        <Ionicons name="add" size={28} color="white" />
      </Pressable>

      {/* Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setShowModal(false)}
        >
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
                    onPress={() => {
                      setShowModal(false);
                    }}
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
    </View>
  );
}
