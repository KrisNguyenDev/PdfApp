import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";

export default function PdfViewer() {
  const { uri, name } = useLocalSearchParams<{ uri: string; name: string }>();
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPdf();
  }, [uri]);

  const loadPdf = async () => {
    try {
      if (!uri) return;

      const decodedUri = decodeURIComponent(uri);
      const base64 = await FileSystem.readAsStringAsync(decodedUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setPdfBase64(base64);
      setLoading(false);
    } catch (error) {
      console.error("Error loading PDF:", error);
      Alert.alert("Error", "Failed to load PDF file");
      setLoading(false);
    }
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            overflow: auto;
            -webkit-overflow-scrolling: touch;
          }
          #pdf-container {
            width: 100%;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          embed, object {
            width: 100%;
            height: 100%;
          }
        </style>
      </head>
      <body>
        <div id="pdf-container">
          <embed 
            src="data:application/pdf;base64,${pdfBase64}" 
            type="application/pdf"
            width="100%"
            height="100%"
          />
        </div>
      </body>
    </html>
  `;

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-primary px-4 pt-14 pb-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text
              className="text-white text-lg font-semibold flex-1"
              numberOfLines={1}
            >
              {name || "PDF Document"}
            </Text>
          </View>
          <View className="flex-row items-center gap-4">
            <TouchableOpacity>
              <Ionicons name="share-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="ellipsis-vertical" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* PDF Viewer */}
      <View className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center bg-white">
            <ActivityIndicator size="large" color="#B91C1C" />
            <Text className="text-gray-600 mt-4">Loading PDF...</Text>
          </View>
        ) : pdfBase64 ? (
          <WebView
            source={{ html: htmlContent }}
            style={{ flex: 1 }}
            originWhitelist={["*"]}
            scalesPageToFit={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View className="absolute inset-0 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#B91C1C" />
              </View>
            )}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="document-outline" size={80} color="#9CA3AF" />
            <Text className="text-gray-600 mt-4">Failed to load PDF</Text>
            <TouchableOpacity
              onPress={loadPdf}
              className="mt-4 bg-primary px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold">Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
