"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PhotoUpload({
  defaultUrl,
  inputClass,
}: {
  defaultUrl?: string | null;
  inputClass: string;
}) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload-photo", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
      } else {
        setUrl(data.url);
      }
    } catch {
      setError("Upload failed — check your connection");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      {url && (
        <div className="flex items-center gap-4">
          <img
            src={url}
            alt="Staff photo preview"
            className="h-20 w-20 rounded-full object-cover border border-white/10 bg-[#0D0D0D]"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setUrl("")}
            className="text-[#888888] hover:text-red-400 hover:bg-transparent"
          >
            <X className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      )}

      {/* Hidden field submitted with the rest of the form */}
      <input type="hidden" name="photo_url" value={url} />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="border-white/10 bg-transparent text-[#F5F5F5] hover:bg-white/5 hover:text-[#F5F5F5] shrink-0"
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading…" : url ? "Replace Photo" : "Upload Photo"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
        <Input
          placeholder="Or paste image URL…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={inputClass}
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
