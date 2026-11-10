"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export default function ImageUploader({
  images = [],
  onChange,
  folder = "abi-products",
  multiple = true,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setError("");

    try {
      const uploaded = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);
        formData.append(
          "mediaType",
          file.type.startsWith("video/") ? "video" : "image"
        );

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Upload failed");
        }

        uploaded.push({
          url: data.url,
          publicId: data.publicId,
          mediaType: data.mediaType,
        });
      }

      onChange(multiple ? [...images, ...uploaded] : uploaded);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function removeImage(index) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((item, index) => (
          <div
            key={item.publicId || index}
            className="relative h-24 w-24 overflow-hidden rounded-lg border"
          >
            {item.mediaType === "video" ? (
              <video src={item.url} className="h-full w-full object-cover" controls />
            ) : item.url ? (
              <Image src={item.url} alt="Product image" fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                No image
              </div>
            )}

            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute right-1 top-1 h-5 w-5 rounded-full bg-black text-white"
            >
              ×
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed"
        >
          {uploading ? "Uploading..." : "+ Add"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple={multiple}
        onChange={handleFiles}
        className="hidden"
      />

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}