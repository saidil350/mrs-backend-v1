"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ImageIcon, Upload, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type MediaItem = {
  id: string;
  alt: string;
  filename: string;
  mimeType: string;
  url: string;
};

type Props = {
  name: string;
  defaultValue?: string | null;
  label?: string;
};

type Tab = "library" | "upload";

export function CmsMediaPicker({
  name,
  defaultValue,
  label = "Pilih Media",
}: Props) {
  const [mediaId, setMediaId] = useState<string | null>(defaultValue ?? null);
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("library");
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [selected, setSelected] = useState<MediaItem | null>(null);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadAlt, setUploadAlt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load preview for initial value
  useEffect(() => {
    if (defaultValue) {
      fetch(`/api/cms/media/${defaultValue}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.id) setPreview(data);
        })
        .catch(() => {});
    }
  }, [defaultValue]);

  // Fetch media list when dialog opens
  const fetchMedia = useCallback(() => {
    fetch("/api/cms/media/list")
      .then((res) => res.json())
      .then((data) => setMediaList(Array.isArray(data) ? data : []))
      .catch(() => setMediaList([]));
  }, []);

  useEffect(() => {
    if (open) fetchMedia();
  }, [open, fetchMedia]);

  function handleConfirm() {
    if (selected) {
      setMediaId(selected.id);
      setPreview(selected);
    }
    setSelected(null);
    setOpen(false);
    setTab("library");
    resetUpload();
  }

  function handleRemove() {
    setMediaId(null);
    setPreview(null);
    setSelected(null);
  }

  function resetUpload() {
    setUploadFile(null);
    setUploadAlt("");
    setUploadPreview(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadAlt(file.name.replace(/\.[^/.]+$/, "")); // filename without ext
    setUploadError(null);
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setUploadPreview(url);
    } else {
      setUploadPreview(null);
    }
  }

  async function handleUpload() {
    if (!uploadFile) return;
    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("alt", uploadAlt || uploadFile.name);

      const res = await fetch("/api/cms/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || "Upload gagal");
        return;
      }

      // Auto-select the newly uploaded media
      const newMedia: MediaItem = {
        id: data.id,
        alt: data.alt,
        filename: data.filename,
        mimeType: data.mimeType,
        url: data.url,
      };
      setMediaId(newMedia.id);
      setPreview(newMedia);
      setSelected(null);
      setOpen(false);
      setTab("library");
      resetUpload();
    } catch {
      setUploadError("Upload gagal. Coba lagi.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={mediaId ?? ""} />

      {/* Preview */}
      {preview ? (
        <div className="flex items-center gap-3 rounded-lg border p-2">
          {preview.mimeType?.startsWith("image/") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview.url}
              alt={preview.alt}
              className="size-16 rounded-md object-cover"
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-md bg-muted">
              <ImageIcon className="size-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{preview.alt}</p>
            <p className="text-xs text-muted-foreground truncate">
              {preview.filename}
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon-xs" onClick={handleRemove}>
            <X className="size-3" />
          </Button>
        </div>
      ) : null}

      {/* Picker button */}
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setSelected(null); resetUpload(); setTab("library"); } }}>
        <DialogTrigger render={<Button type="button" variant="outline" size="sm" />}>
          <ImageIcon className="mr-1.5 size-3.5" />
          {preview ? "Ganti" : label}
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Media</DialogTitle>
          </DialogHeader>

          {/* Tab switcher */}
          <div className="flex border-b">
            <button
              type="button"
              onClick={() => { setTab("library"); resetUpload(); }}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === "library"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Pilih dari Library
            </button>
            <button
              type="button"
              onClick={() => setTab("upload")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === "upload"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Upload Baru
            </button>
          </div>

          {/* Library tab */}
          {tab === "library" && (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 overflow-y-auto max-h-[55vh] p-1">
                {mediaList.length === 0 ? (
                  <p className="col-span-full text-center text-muted-foreground py-8">
                    Belum ada media. Tab "Upload Baru" untuk upload.
                  </p>
                ) : (
                  mediaList.map((media) => (
                    <button
                      key={media.id}
                      type="button"
                      onClick={() => setSelected(media)}
                      className={`relative rounded-lg border-2 overflow-hidden transition-colors text-left ${
                        selected?.id === media.id
                          ? "border-primary"
                          : "border-transparent hover:border-muted-foreground/30"
                      }`}
                    >
                      {selected?.id === media.id && (
                        <div className="absolute top-1 right-1 z-10 bg-primary text-primary-foreground rounded-full size-5 flex items-center justify-center">
                          <Check className="size-3" />
                        </div>
                      )}
                      <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                        {media.mimeType?.startsWith("image/") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={media.url}
                            alt={media.alt}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">📄</span>
                        )}
                      </div>
                      <div className="p-1.5">
                        <p className="text-xs truncate">{media.alt}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
              {selected && (
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Batal
                  </Button>
                  <Button type="button" onClick={handleConfirm}>
                    Pilih &quot;{selected.alt}&quot;
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Upload tab */}
          {tab === "upload" && (
            <div className="space-y-4 py-2">
              {/* Drop zone */}
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadPreview ? (
                  <div className="relative inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={uploadPreview} alt="Preview" className="max-h-40 rounded-md" />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full size-6 flex items-center justify-center"
                      onClick={(e) => { e.stopPropagation(); resetUpload(); }}
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto size-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Klik atau drag file ke sini
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, WebP, SVG, GIF, PDF (max 10MB)
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif,application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Alt text */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Alt Text</label>
                <Input
                  value={uploadAlt}
                  onChange={(e) => setUploadAlt(e.target.value)}
                  placeholder="Deskripsi gambar..."
                />
              </div>

              {uploadError && (
                <p className="text-sm text-destructive">{uploadError}</p>
              )}

              {/* Upload & select button */}
              {uploadFile && (
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetUpload}>
                    Batal
                  </Button>
                  <Button type="button" onClick={handleUpload} disabled={uploading}>
                    <Upload className="mr-1.5 size-3.5" />
                    {uploading ? "Uploading..." : "Upload & Gunakan"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
