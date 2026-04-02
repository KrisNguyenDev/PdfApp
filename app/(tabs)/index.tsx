import CreatePdfModal from "@/components/CreatePdfModal";
import FileMenuModal from "@/components/FileMenuModal";
import { usePdf } from "@/contexts/PdfContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  const dateStr = date.toLocaleDateString("en-GB");
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return { date: dateStr, time: timeStr };
};

export default function Index() {
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { pdfFiles, toggleFavorite, refreshPdfFiles, updateLastOpened } = usePdf();

  console.log(pdfFiles);

  const handleOpenMenu = (file: any) => {
    setSelectedFile(file);
    setShowModal(true);
  };

  const handleOpenPdf = async (file: any) => {
    if (file.uri) {
      await updateLastOpened(file.id);
      router.push({
        pathname: "/pdf-viewer",
        params: {
          uri: encodeURIComponent(file.uri),
          name: file.name,
          id: file.id,
        },
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshPdfFiles();
    setRefreshing(false);
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#B91C1C"
            colors={["#B91C1C"]}
          />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="document-text-outline" size={80} color="#9CA3AF" />
            <Text className="text-gray-400 text-base mt-4">
              No PDF files yet
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              Tap the + button to create your first PDF
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const { date, time } = formatDateTime(item.createdAt);
          return (
            <TouchableOpacity
              onPress={() => handleOpenPdf(item)}
              className="flex-row items-center px-4 py-3 border border-spacing-10 border-gray-300 rounded-lg mb-3"
              activeOpacity={0.7}
            >
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
                  {date} | {time} | {item.size}
                </Text>
              </View>

              {/* Star Icon */}
              <TouchableOpacity
                className="mr-3"
                onPress={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item.id);
                }}
              >
                <Ionicons
                  name={item.isFavorite ? "star" : "star-outline"}
                  size={22}
                  color={item.isFavorite ? "#FCD34D" : "#9CA3AF"}
                />
              </TouchableOpacity>

              {/* Menu Icon */}
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleOpenMenu(item);
                }}
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
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
