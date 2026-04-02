import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

export default function PdfViewer() {
  const { uri, name } = useLocalSearchParams<{ uri: string; name: string }>();
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPdf = useCallback(async () => {
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
  }, [uri]);

  useEffect(() => {
    loadPdf();
  }, [loadPdf]);

  const handleShare = async () => {
    try {
      if (!uri) return;

      const decodedUri = decodeURIComponent(uri);
      const isAvailable = await Sharing.isAvailableAsync();

      if (!isAvailable) {
        Alert.alert("Error", "Sharing is not available on this device");
        return;
      }

      await Sharing.shareAsync(decodedUri, {
        mimeType: "application/pdf",
        dialogTitle: name || "PDF Document",
      });
    } catch (error) {
      console.error("Error sharing PDF:", error);
      Alert.alert("Error", "Failed to share PDF");
    }
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            background: #525659;
            overflow-x: hidden;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }
          #pdf-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 10px;
            gap: 10px;
          }
          canvas {
            max-width: 100%;
            height: auto;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            background: white;
          }
          #loading {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 18px;
            font-family: Arial, sans-serif;
          }
          #error {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #ff6b6b;
            font-size: 16px;
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 20px;
          }
        </style>
      </head>
      <body>
        <div id="loading">Loading PDF...</div>
        <div id="error" style="display: none;"></div>
        <div id="pdf-container"></div>
        
        <script>
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          
          const base64Data = '${pdfBase64}';
          
          if (!base64Data) {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('error').style.display = 'block';
            document.getElementById('error').textContent = 'No PDF data available';
          } else {
            try {
              const binaryString = atob(base64Data);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              
              const loadingTask = pdfjsLib.getDocument({ data: bytes });
              
              loadingTask.promise.then(function(pdf) {
                document.getElementById('loading').style.display = 'none';
                const container = document.getElementById('pdf-container');
                
                const renderPromises = [];
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                  const promise = pdf.getPage(pageNum).then(function(page) {
                    const scale = 1.5;
                    const viewport = page.getViewport({ scale: scale });
                    
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    
                    container.appendChild(canvas);
                    
                    const renderContext = {
                      canvasContext: context,
                      viewport: viewport
                    };
                    
                    return page.render(renderContext).promise;
                  });
                  renderPromises.push(promise);
                }
                
                return Promise.all(renderPromises);
              }).catch(function(error) {
                console.error('PDF.js error:', error);
                document.getElementById('loading').style.display = 'none';
                document.getElementById('error').style.display = 'block';
                document.getElementById('error').textContent = 'Error loading PDF: ' + error.message;
              });
            } catch (error) {
              console.error('Error:', error);
              document.getElementById('loading').style.display = 'none';
              document.getElementById('error').style.display = 'block';
              document.getElementById('error').textContent = 'Error processing PDF: ' + error.message;
            }
          }
        </script>
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
            <TouchableOpacity onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color="white" />
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
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={false}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error("WebView error:", nativeEvent);
            }}
            onMessage={(event) => {
              console.log("WebView message:", event.nativeEvent.data);
            }}
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
