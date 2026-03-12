"use client";
import { useState, useRef } from "react";
import { api } from "@/lib/api";
import { FiUpload, FiX, FiImage, FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";

interface ImageUploaderProps {
  images: string[];
  onChange: (urls: string[]) => void;
}

export default function ImageUploader({
  images,
  onChange,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: FileList) => {
    if (!files.length) return;

    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    for (const file of Array.from(files)) {
      if (!allowed.includes(file.type)) {
        toast.error(`${file.name} is not a valid image type`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return;
      }
    }

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("images", file));

      // ✅ Log the exact URL being called so we can verify it
      const baseURL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api";
      console.log("Uploading to:", `${baseURL}/admin/upload`);
      console.log(
        "Token:",
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : "no window",
      );

      const res = await api.post("/admin/upload", formData);
      const newUrls: string[] = res.data.data.map(
        (f: { url: string }) => f.url,
      );
      onChange([...images, ...newUrls]);
      toast.success(`${newUrls.length} image(s) uploaded!`);
    } catch (err: unknown) {
      // ✅ Log full error so we can see exactly what went wrong
      console.error("Full upload error:", err);
      console.error("Error message:", (err as Error)?.message);
      console.error("Error response:", (err as any)?.response);
      console.error("Error code:", (err as any)?.code);

      const error = err as {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
        code?: string;
      };

      if (error?.code === "ERR_NETWORK" || !error?.response) {
        toast.error(
          `Network error — is your backend running on port 5050? (${error?.message || "No response"})`,
        );
      } else if (error?.response?.status === 401) {
        toast.error("Not authenticated. Please log in again.");
      } else if (error?.response?.status === 403) {
        toast.error("Admin access required.");
      } else {
        toast.error(
          error?.response?.data?.message ||
            `Upload failed (${error?.response?.status})`,
        );
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeImage = async (url: string, index: number) => {
    const filename = url.split("/uploads/")[1];
    try {
      if (filename) await api.delete(`/admin/upload/${filename}`);
    } catch {
      // If file not found on server, still remove from UI
    }
    onChange(images.filter((_, i) => i !== index));
    toast.success("Image removed");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragOver
            ? "border-brand-red bg-red-50"
            : "border-gray-200 hover:border-brand-red hover:bg-orange-50"
        } ${uploading ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          disabled={uploading}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-brand-red">
            <FiLoader size={28} className="animate-spin" />
            <span className="text-sm font-semibold">Uploading...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <FiUpload size={28} />
            <span className="text-sm font-semibold text-gray-600">
              Click or drag & drop images here
            </span>
            <span className="text-xs text-gray-400">
              JPG, PNG, WebP, GIF · Max 5MB each · Up to 5 images
            </span>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div
              key={i}
              className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50"
            >
              <img
                src={url}
                alt={`Product image ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="55" text-anchor="middle" fill="%239ca3af" font-size="12">No image</text></svg>';
                }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(url, i);
                }}
                className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <FiX size={12} />
              </button>
              {i === 0 && (
                <div className="absolute bottom-1 left-1 bg-brand-dark/80 text-brand-yellow text-[9px] font-bold px-1.5 py-0.5 rounded">
                  MAIN
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <FiImage size={13} />
          No images uploaded yet. Add images to show on the product card.
        </div>
      )}
    </div>
  );
}
