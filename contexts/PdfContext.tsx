import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface PdfFile {
  id: string;
  name: string;
  size: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  uri?: string;
}

interface PdfContextType {
  pdfFiles: PdfFile[];
  addPdfFile: (file: PdfFile) => Promise<void>;
  updatePdfFile: (id: string, updates: Partial<PdfFile>) => Promise<void>;
  deletePdfFile: (id: string, uri?: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  refreshPdfFiles: () => Promise<void>;
  updateLastOpened: (id: string) => Promise<void>;
}

const PdfContext = createContext<PdfContextType | undefined>(undefined);

export function PdfProvider({ children }: { children: ReactNode }) {
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);

  const METADATA_KEY = "@pdf_metadata";

  const loadMetadata = useCallback(async (): Promise<
    Record<string, Partial<PdfFile>>
  > => {
    try {
      const data = await AsyncStorage.getItem(METADATA_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error("Error loading metadata:", error);
      return {};
    }
  }, [METADATA_KEY]);

  const saveMetadata = useCallback(
    async (metadata: Record<string, Partial<PdfFile>>) => {
      try {
        await AsyncStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
      } catch (error) {
        console.error("Error saving metadata:", error);
      }
    },
    [METADATA_KEY],
  );

  const loadPdfFiles = useCallback(async () => {
    try {
      const dirInfo = await FileSystem.getInfoAsync(
        FileSystem.documentDirectory!,
      );
      if (!dirInfo.exists) {
        return;
      }

      const files = await FileSystem.readDirectoryAsync(
        FileSystem.documentDirectory!,
      );
      const pdfFiles = files.filter((file) => file.endsWith(".pdf"));

      // Load saved metadata
      const savedMetadata = await loadMetadata();
      let hasNewFiles = false;

      const pdfFileInfos: PdfFile[] = await Promise.all(
        pdfFiles.map(async (fileName) => {
          const fileUri = `${FileSystem.documentDirectory}${fileName}`;
          const fileInfo = await FileSystem.getInfoAsync(fileUri);

          const fileSize =
            fileInfo.exists && "size" in fileInfo
              ? (fileInfo.size / 1024).toFixed(2) + "KB"
              : "Unknown";

          const currentTime = new Date().toISOString();

          // Merge with saved metadata
          const metadata = savedMetadata[fileName];

          // If this is a new file (no metadata), save initial metadata
          if (!metadata) {
            hasNewFiles = true;
            savedMetadata[fileName] = {
              createdAt: currentTime,
              updatedAt: currentTime,
              isFavorite: false,
            };
          }

          return {
            id: fileName,
            name: fileName.replace(".pdf", ""),
            size: fileSize,
            isFavorite: metadata?.isFavorite || false,
            createdAt: metadata?.createdAt || currentTime,
            updatedAt: metadata?.updatedAt || currentTime,
            uri: fileUri,
          };
        }),
      );

      // Save metadata if there are new files
      if (hasNewFiles) {
        await saveMetadata(savedMetadata);
      }

      setPdfFiles(pdfFileInfos.sort((a, b) => b.id.localeCompare(a.id)));
    } catch (error) {
      console.error("Error loading PDF files:", error);
    }
  }, [loadMetadata, saveMetadata]);

  useEffect(() => {
    loadPdfFiles();
  }, [loadPdfFiles]);

  const refreshPdfFiles = useCallback(async () => {
    await loadPdfFiles();
  }, [loadPdfFiles]);

  const addPdfFile = useCallback(async (file: PdfFile) => {
    setPdfFiles((prev) => [file, ...prev]);

    // Save metadata
    const metadata = await loadMetadata();
    metadata[file.id] = {
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      isFavorite: file.isFavorite,
    };
    await saveMetadata(metadata);
  }, [loadMetadata, saveMetadata]);

  const updatePdfFile = useCallback(async (id: string, updates: Partial<PdfFile>) => {
    setPdfFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, ...updates } : file)),
    );

    // Update metadata
    const metadata = await loadMetadata();
    metadata[id] = { ...metadata[id], ...updates };
    await saveMetadata(metadata);
  }, [loadMetadata, saveMetadata]);

  const deletePdfFile = useCallback(async (id: string, uri?: string) => {
    try {
      // Xóa file vật lý nếu có URI
      if (uri) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
      // Xóa khỏi state
      setPdfFiles((prev) => prev.filter((file) => file.id !== id));

      // Xóa metadata
      const metadata = await loadMetadata();
      delete metadata[id];
      await saveMetadata(metadata);
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }, [loadMetadata, saveMetadata]);

  const toggleFavorite = useCallback(async (id: string) => {
    let newFavoriteValue: boolean | undefined;

    setPdfFiles((prev) =>
      prev.map((file) => {
        if (file.id === id) {
          newFavoriteValue = !file.isFavorite;
          return { ...file, isFavorite: newFavoriteValue };
        }
        return file;
      }),
    );

    // Save to metadata
    if (newFavoriteValue !== undefined) {
      const metadata = await loadMetadata();
      metadata[id] = {
        ...metadata[id],
        isFavorite: newFavoriteValue,
      };
      await saveMetadata(metadata);
    }
  }, [loadMetadata, saveMetadata]);

  const updateLastOpened = useCallback(async (id: string) => {
    const currentTime = new Date().toISOString();
    
    setPdfFiles((prev) =>
      prev.map((file) =>
        file.id === id ? { ...file, updatedAt: currentTime } : file
      )
    );

    // Update metadata
    const metadata = await loadMetadata();
    metadata[id] = {
      ...metadata[id],
      updatedAt: currentTime,
    };
    await saveMetadata(metadata);
  }, [loadMetadata, saveMetadata]);

  return (
    <PdfContext.Provider
      value={{
        pdfFiles,
        addPdfFile,
        updatePdfFile,
        deletePdfFile,
        toggleFavorite,
        refreshPdfFiles,
        updateLastOpened,
      }}
    >
      {children}
    </PdfContext.Provider>
  );
}

export function usePdf() {
  const context = useContext(PdfContext);
  if (context === undefined) {
    throw new Error("usePdf must be used within a PdfProvider");
  }
  return context;
}
