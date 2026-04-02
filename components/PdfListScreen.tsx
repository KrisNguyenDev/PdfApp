import CreatePdfModal from "@/components/CreatePdfModal";
import FileMenuModal from "@/components/FileMenuModal";
import { PdfFile, usePdf } from "@/contexts/PdfContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface PdfListScreenProps {
  title: string;
  filterType: "all" | "recent" | "favorite";
}

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

export default function PdfListScreen({ title, filterType }: PdfListScreenProps) {
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { pdfFiles, toggleFavorite, refreshPdfFiles, updateLastOpened } =
    usePdf();

  const filteredFiles = useMemo(() => {
    let files = pdfFiles;

    // Filter by type
    if (filterType === "favorite") {
      files = files.filter((file) => file.isFavorite);
    } else if (filterType === "recent") {
      // Sort by updatedAt for recent
      files = [...files].sort((a, b) => {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      files = files.filter((file) => file.name.toLowerCase().includes(query));
    }

    // Sort by name (only if not recent)
    if (filterType !== "recent") {
      const sorted = [...files].sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();

        if (sortOrder === "asc") {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });

      return sorted;
    }

    return files;
  }, [pdfFiles, searchQuery, sortOrder, filterType]);

  const handleToggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchQuery("");
    }
  };

  const handleToggleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

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

  const getEmptyMessage = () => {
    if (searchQuery) {
      return {
        icon: "search-outline" as const,
        title: "No PDF files found",
        subtitle: `No results for "${searchQuery}"`,
      };
    }

    if (filterType === "favorite") {
      return {
        icon: "star-outline" as const,
        title: "No favorite files yet",
        subtitle: "Mark files as favorite to see them here",
      };
    }

    if (filterType === "recent") {
      return {
        icon: "time-outline" as const,
        title: "No recent files",
        subtitle: "Files you open will appear here",
      };
    }

    return {
      icon: "document-text-outline" as const,
      title: "No PDF files yet",
      subtitle: "Tap the + button to create your first PDF",
    };
  };

  const emptyMessage = getEmptyMessage();

  return (
    <View className="w-full h-full">
      {/* Header */}
      <View className="bg-primary px-4 pt-14 pb-8 rounded-b-2xl">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-white text-2xl font-bold">{title}</Text>
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={handleToggleSearch}>
              <Ionicons name="search-outline" size={24} color="white" />
            </TouchableOpacity>
            {filterType !== "recent" && (
              <TouchableOpacity onPress={handleToggleSort}>
                <Ionicons
                  name={sortOrder === "asc" ? "arrow-down" : "arrow-up"}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Input */}
        {showSearch && (
          <View className="flex-row items-center bg-white rounded-full px-4 py-2 mt-3">
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="Search PDF files..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* PDF List */}
      <FlatList
        style={{ paddingHorizontal: 16, paddingTop: 16 }}
        data={filteredFiles}
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
            <Ionicons name={emptyMessage.icon} size={80} color="#9CA3AF" />
            <Text className="text-gray-400 text-base mt-4">
              {emptyMessage.title}
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              {emptyMessage.subtitle}
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
      {filterType === "all" && (
        <Pressable
          onPress={() => setShowCreateModal(true)}
          className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg"
        >
          <Ionicons name="add" size={28} color="white" />
        </Pressable>
      )}

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
