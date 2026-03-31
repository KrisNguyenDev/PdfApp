import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import * as FileSystem from "expo-file-system/legacy";

export interface PdfFile {
  id: string;
  name: string;
  date: string;
  time: string;
  size: string;
  isFavorite: boolean;
  updatedDate: string;
  uri?: string;
}

interface PdfContextType {
  pdfFiles: PdfFile[];
  addPdfFile: (file: PdfFile) => void;
  updatePdfFile: (id: string, updates: Partial<PdfFile>) => void;
  deletePdfFile: (id: string, uri?: string) => Promise<void>;
  toggleFavorite: (id: string) => void;
  refreshPdfFiles: () => Promise<void>;
}

const PdfContext = createContext<PdfContextType | undefined>(undefined);

export function PdfProvider({ children }: { children: ReactNode }) {
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);

  const loadPdfFiles = async () => {
    try {
      const dirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory!);
      if (!dirInfo.exists) {
        return;
      }

      const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory!);
      const pdfFiles = files.filter(file => file.endsWith('.pdf'));

      const pdfFileInfos: PdfFile[] = await Promise.all(
        pdfFiles.map(async (fileName) => {
          const fileUri = `${FileSystem.documentDirectory}${fileName}`;
          const fileInfo = await FileSystem.getInfoAsync(fileUri);
          
          const fileSize = fileInfo.exists && "size" in fileInfo
            ? (fileInfo.size / 1024).toFixed(2) + "KB"
            : "Unknown";

          const modificationTime = fileInfo.exists && "modificationTime" in fileInfo
            ? new Date(fileInfo.modificationTime)
            : new Date();

          const date = modificationTime.toLocaleDateString("en-GB").replace(/\//g, "/");
          const time = modificationTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });

          return {
            id: fileName,
            name: fileName.replace(".pdf", ""),
            date: date,
            time: time,
            size: fileSize,
            isFavorite: false,
            updatedDate: date,
            uri: fileUri,
          };
        })
      );

      setPdfFiles(pdfFileInfos.sort((a, b) => b.id.localeCompare(a.id)));
    } catch (error) {
      console.error("Error loading PDF files:", error);
    }
  };

  useEffect(() => {
    loadPdfFiles();
  }, []);

  const refreshPdfFiles = async () => {
    await loadPdfFiles();
  };

  const addPdfFile = (file: PdfFile) => {
    setPdfFiles((prev) => [file, ...prev]);
  };

  const updatePdfFile = (id: string, updates: Partial<PdfFile>) => {
    setPdfFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, ...updates } : file))
    );
  };

  const deletePdfFile = async (id: string, uri?: string) => {
    try {
      // Xóa file vật lý nếu có URI
      if (uri) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
      // Xóa khỏi state
      setPdfFiles((prev) => prev.filter((file) => file.id !== id));
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  };

  const toggleFavorite = (id: string) => {
    setPdfFiles((prev) =>
      prev.map((file) =>
        file.id === id ? { ...file, isFavorite: !file.isFavorite } : file
      )
    );
  };

  return (
    <PdfContext.Provider
      value={{
        pdfFiles,
        addPdfFile,
        updatePdfFile,
        deletePdfFile,
        toggleFavorite,
        refreshPdfFiles,
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
