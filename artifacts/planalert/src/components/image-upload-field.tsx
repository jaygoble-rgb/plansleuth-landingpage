import { useRef, useState } from "react";
import { Upload, Loader2, ImageOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api`;

interface ImageUploadFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  helpText?: string;
  testId?: string;
}

export function ImageUploadField({
  id,
  label,
  value,
  onChange,
  placeholder = "https://…",
  helpText,
  testId,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image is too large. Max 5 MB.");
      return;
    }

    const fd = new FormData();
    fd.append("file", file);
    setUploading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/blog/uploads`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const text = await res.text();
      const data = text
        ? (() => {
            try {
              return JSON.parse(text);
            } catch {
              return null;
            }
          })()
        : null;
      if (!res.ok) {
        const msg =
          data && typeof data === "object" && "error" in data && typeof (data as { error?: unknown }).error === "string"
            ? (data as { error: string }).error
            : `Upload failed (${res.status})`;
        throw new Error(msg);
      }
      const url = (data as { url?: string } | null)?.url;
      if (!url) throw new Error("Upload response missing url");
      setPreviewError(false);
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1.5 flex gap-2">
        <Input
          id={id}
          value={value}
          onChange={(e) => {
            setPreviewError(false);
            onChange(e.target.value);
          }}
          placeholder={placeholder}
          data-testid={testId}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          data-testid={testId ? `${testId}-upload` : undefined}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Uploading…
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-1.5" /> Upload
            </>
          )}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {helpText && !error && (
        <p className="text-xs text-muted-foreground mt-1">{helpText}</p>
      )}
      {error && (
        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
          <X className="w-3.5 h-3.5" /> {error}
        </p>
      )}
      {value && !previewError && (
        <img
          src={value}
          alt=""
          width={1280}
          height={720}
          onError={() => setPreviewError(true)}
          onLoad={() => setPreviewError(false)}
          className="mt-2 w-full aspect-[16/9] object-cover rounded-lg border border-primary/10 bg-muted"
        />
      )}
      {value && previewError && (
        <div
          className="mt-2 w-full aspect-[16/9] rounded-lg border border-dashed border-destructive/40 bg-destructive/5 flex flex-col items-center justify-center text-destructive text-xs gap-1"
          data-testid={testId ? `${testId}-broken` : undefined}
        >
          <ImageOff className="w-5 h-5" />
          Image failed to load
        </div>
      )}
    </div>
  );
}
