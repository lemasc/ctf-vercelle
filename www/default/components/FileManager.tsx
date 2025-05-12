"use client";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FolderIcon,
  FileIcon,
  Download,
  Upload,
  Trash,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export type FileItem = {
  name: string;
  type: "file" | "folder";
  lastModified: string;
  size?: number; // Size in bytes
};

interface FileManagerProps {
  site: string;
  items: FileItem[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function FileManager({
  items,
  onSelectionChange,
  site,
}: FileManagerProps) {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleSelectionChange = (id: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedItems, id]
      : selectedItems.filter((itemId) => itemId !== id);

    setSelectedItems(newSelection);
    onSelectionChange?.(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
      onSelectionChange?.([]);
    } else {
      const allIds = items.map((item) => item.name);
      setSelectedItems(allIds);
      onSelectionChange?.(allIds);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (bytes === undefined) return "-";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const [uploading, setUploading] = useState(false);

  const handleUpload = () => {
    if (uploading) return;
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(`/api/sites/${site}/file/upload`, {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          throw new Error("Upload failed");
        }
        // Handle successful upload
        router.refresh();
        alert(`File ${file.name} uploaded successfully.`);
      } catch (error) {
        console.error("Upload error:", error);
        alert(`Upload ${file.name} failed. Please try again.`);
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const handleDownload = async () => {
    if (selectedItems.length === 0) return;
    const params = new URLSearchParams();
    for (const item of selectedItems) {
      params.append("fileName", item);
    }
    window.location.href = `/api/sites/${site}/file/download?${params.toString()}`;
  };

  const handleDelete = async () => {
    if (selectedItems.length === 0) return;
    const confirmed = confirm(
      `Are you sure you want to delete file "${selectedItems.join(
        ", "
      )}"? This action cannot be undone.`
    );
    if (!confirmed) return;
    try {
      const response = await fetch(`/api/sites/${site}/file/delete`, {
        method: "POST",
        body: JSON.stringify({ fileNames: selectedItems }),
      });

      const result = await response.json();
      if (!result.success) {
        console.error("Delete error:", result.failures);
        alert("Delete failed. Please try again.");
      } else {
        router.refresh();
        alert("Files deleted successfully.");
      }
    } catch (error) {
      alert("Delete failed. Please try again.");
      router.refresh();
      console.error("Delete error:", error);
    }
  };

  useEffect(() => {
    // reset selected items when items change (from remote)
    setSelectedItems([]);
  }, [items]);

  return (
    <div className="bg-background rounded-lg border">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={selectedItems.length === items.length}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm text-muted-foreground">
            {selectedItems.length > 0
              ? `${selectedItems.length} item${
                  selectedItems.length > 1 ? "s" : ""
                } selected`
              : "No items selected"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleUpload}
            disabled={uploading}
            variant="ghost"
            size="sm"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Upload{uploading && "ing..."}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={selectedItems.length === 0}
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-500"
            disabled={selectedItems.length === 0}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* File List */}
      <div className="divide-y divide-border">
        {items.map((item) => (
          <div
            key={item.name}
            data-selected={selectedItems.includes(item.name)}
            className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors data-[selected=true]:bg-muted"
          >
            <Checkbox
              checked={selectedItems.includes(item.name)}
              onCheckedChange={(checked) =>
                handleSelectionChange(item.name, checked as boolean)
              }
            />
            <div className="flex items-center gap-2 flex-1">
              {item.type === "folder" ? (
                <FolderIcon className="h-5 w-5 text-yellow-500" />
              ) : (
                <FileIcon className="h-5 w-5 text-blue-500" />
              )}
              <span className="font-medium">{item.name}</span>
            </div>
            <span className="text-sm text-muted-foreground w-24 text-right">
              {formatFileSize(item.size)}
            </span>
            <span className="text-sm text-muted-foreground w-32 text-right">
              {item.lastModified}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
