export interface PreviewFile {
  id: string;
  name: string;
  kind: "image" | "pdf" | "video" | "unsupported";
  /** The application owns permissions, URL renewal and blob URL cleanup. */
  url?: string;
  description?: string;
  size?: number;
  status?: "ready" | "loading" | "error" | "expired";
  downloadable?: boolean;
  previewable?: boolean;
}

/** Rendering guard, not authentication or validation of remote file contents. */
export function safePreviewUrl(value?: string): string | undefined {
  if (!value || /[\u0000-\u0020\u007f]/.test(value)) return undefined;
  if (
    /^data:image\/(?:png|jpeg|gif|webp|avif);base64,[A-Za-z0-9+/]+=*$/i.test(
      value,
    )
  )
    return value;
  try {
    const url = new URL(value);
    if (
      ["http:", "https:", "blob:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    )
      return value;
  } catch {
    /* Relative/invalid URLs are not embedded. */
  }
  return undefined;
}
export function previewFileSize(bytes?: number) {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return "";
  return bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 ** 2
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}
