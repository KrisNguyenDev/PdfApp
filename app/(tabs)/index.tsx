import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import FileMenuModal from "@/components/FileMenuModal";
import CreatePdfModal from "@/components/CreatePdfModal";

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);

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
      <Pressable
        onPress={() => setShowCreateModal(true)}
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg"
      >
        <Ionicons name="add" size={28} color="white" />
      </Pressable>

      {/* File Menu Modal */}
      <FileMenuModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        selectedFile={selectedFile}
      />

      {/* Create PDF Modal */}
      <CreatePdfModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </View>
  );
}
