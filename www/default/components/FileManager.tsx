"use client";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import {
  FolderIcon,
  FileIcon,
  Download,
  Upload,
  Edit,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type FileItem = {
  id: string;
  name: string;
  type: "file" | "folder";
  lastModified: Date;
  size?: number; // Size in bytes
};

interface FileManagerProps {
  items: FileItem[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function FileManager({ items, onSelectionChange }: FileManagerProps) {
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
      const allIds = items.map((item) => item.id);
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

  return (
    <div className="w-full max-w-4xl mx-auto bg-background rounded-lg border">
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
          <Button variant="ghost" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={selectedItems.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={selectedItems.length === 0}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* File List */}
      <div className="divide-y divide-border">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
          >
            <Checkbox
              checked={selectedItems.includes(item.id)}
              onCheckedChange={(checked) =>
                handleSelectionChange(item.id, checked as boolean)
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
              {format(item.lastModified, "MMM d, yyyy")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
