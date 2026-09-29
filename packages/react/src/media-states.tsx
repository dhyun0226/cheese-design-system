"use client";

import * as React from "react";
import {
  CircleAlert,
  Download,
  File,
  FileImage,
  Film,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  RotateCcw,
  X,
} from "lucide-react";
import {
  Button,
  DialogContent,
  DialogDescription,
  DialogRoot,
  DialogTitle,
} from "./index.js";

export interface PreviewFile {
  id: string;
  name: string;
  kind: "image" | "pdf" | "video" | "unsupported";
  /** The caller owns URL creation, permissions, expiry and object-URL cleanup. */
  url?: string;
  description?: string;
  size?: number;
  status?: "ready" | "loading" | "error" | "expired";
  downloadable?: boolean;
  previewable?: boolean;
}

/** Rendering guard only. It does not establish that a remote file is trusted. */
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
    /* Invalid or relative URLs are deliberately not embedded. */
  }
  return undefined;
}

function fileSize(bytes?: number) {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return "";
  return bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 ** 2
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

export interface FilePreviewProps {
  open: boolean;
  item: PreviewFile | null;
  /** Explicit opener for programmatic dialogs and browsers that do not focus clicked buttons. */
  returnFocus?: HTMLElement | null;
  onOpenChange: (open: boolean) => void;
  onRetry?: (item: PreviewFile) => void;
  /** Downloads are delegated to the application, not arbitrary embedded links. */
  onDownload?: (item: PreviewFile) => void;
}

function PreviewContent({
  item,
  onRetry,
}: Pick<FilePreviewProps, "onRetry"> & { item: PreviewFile }) {
  const [loaded, setLoaded] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [attempt, setAttempt] = React.useState(0);
  const source = safePreviewUrl(item.url);
  const status = item.status ?? "ready";
  const unsupported = item.kind === "unsupported" || item.previewable === false;
  const error =
    status === "error" ||
    failed ||
    (!source && status === "ready" && !unsupported);
  const expired = status === "expired";
  const loading =
    status === "loading" || (!loaded && !error && !expired && !unsupported);
  const canRender = status === "ready" && !unsupported && !error && source;
  const retry = () => {
    setLoaded(false);
    setFailed(false);
    setAttempt((n) => n + 1);
    onRetry?.(item);
  };
  return (
    <div className="cheese-file-preview-stage" aria-busy={loading || undefined}>
      {canRender && (
        <div className="cheese-file-preview-media" key={attempt}>
          {item.kind === "image" && (
            <img
              src={source}
              alt={item.description ?? item.name}
              referrerPolicy="no-referrer"
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
            />
          )}
          {item.kind === "video" && (
            <video
              src={source}
              aria-label={item.name}
              controls
              preload="metadata"
              onLoadedMetadata={() => setLoaded(true)}
              onError={() => setFailed(true)}
            >
              브라우저가 영상 미리보기를 지원하지 않습니다.
            </video>
          )}
          {item.kind === "pdf" && (
            <iframe
              src={source}
              title={`${item.name} PDF 미리보기`}
              sandbox=""
              referrerPolicy="no-referrer"
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
            />
          )}
        </div>
      )}
      {loading && (
        <div className="cheese-file-preview-message" role="status">
          <LoaderCircle
            className="cheese-media-spinner"
            size={24}
            aria-hidden="true"
          />
          <span>파일을 불러오는 중입니다.</span>
        </div>
      )}
      {(unsupported || error || expired) && (
        <div className="cheese-file-preview-message" role="status">
          {error || expired ? (
            <CircleAlert size={28} aria-hidden="true" />
          ) : (
            <File size={28} aria-hidden="true" />
          )}
          <strong>
            {expired
              ? "미리보기 링크가 만료되었습니다."
              : error
                ? "파일을 불러오지 못했습니다."
                : "미리보기를 지원하지 않는 파일입니다."}
          </strong>
          <p>
            {expired
              ? "새 링크를 요청한 후 다시 시도해 주세요."
              : error
                ? "접근 권한이나 연결 상태를 확인해 주세요."
                : "다운로드가 허용된 경우 파일을 내려받아 확인할 수 있습니다."}
          </p>
          {(error || expired) && onRetry && (
            <Button variant="weak" onClick={retry}>
              <RotateCcw size={16} aria-hidden="true" />
              다시 시도
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/** Uses the browser's media/PDF renderer, not an office document conversion engine. */
export function FilePreview({
  open,
  item,
  returnFocus,
  onOpenChange,
  onRetry,
  onDownload,
}: FilePreviewProps) {
  const capturedFocus = React.useRef<HTMLElement | null>(null);
  return (
    <DialogRoot open={open && !!item} onOpenChange={onOpenChange}>
      {item && (
        <DialogContent
          className="cheese-file-preview"
          onOpenAutoFocus={() => {
            capturedFocus.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
          }}
          onCloseAutoFocus={(event) => {
            const target = returnFocus?.isConnected
              ? returnFocus
              : capturedFocus.current;
            if (target?.isConnected) {
              event.preventDefault();
              target.focus();
            }
          }}
        >
          <header className="cheese-file-preview-header">
            <div>
              <DialogTitle>{item.name}</DialogTitle>
              <DialogDescription>
                {item.description ?? "첨부 파일 미리보기"}
                {fileSize(item.size) && ` · ${fileSize(item.size)}`}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              aria-label="미리보기 닫기"
              onClick={() => onOpenChange(false)}
            >
              <X size={18} aria-hidden="true" />
            </Button>
          </header>
          <PreviewContent
            key={JSON.stringify([
              item.id,
              item.url,
              item.status,
              item.kind,
              item.previewable,
            ])}
            item={item}
            onRetry={onRetry}
          />
          <footer className="cheese-file-preview-footer">
            {item.kind === "pdf" && (
              <p>
                PDF 표시는 브라우저에 따라 다릅니다. 표시되지 않으면 다운로드해
                확인해 주세요.
              </p>
            )}
            {onDownload &&
              item.downloadable !== false &&
              item.status !== "expired" &&
              item.status !== "loading" && (
                <Button variant="weak" onClick={() => onDownload(item)}>
                  <Download size={16} aria-hidden="true" />
                  다운로드
                </Button>
              )}
          </footer>
        </DialogContent>
      )}
    </DialogRoot>
  );
}

export interface AttachmentGalleryProps {
  label: string;
  items: readonly PreviewFile[];
  previewId: string | null;
  onPreviewChange: (id: string | null) => void;
  onRetry?: (item: PreviewFile) => void;
  onDownload?: (item: PreviewFile) => void;
  emptyMessage?: string;
}

export function AttachmentGallery({
  label,
  items,
  previewId,
  onPreviewChange,
  onRetry,
  onDownload,
  emptyMessage = "첨부 파일이 없습니다.",
}: AttachmentGalleryProps) {
  const id = React.useId();
  const previewOpener = React.useRef<HTMLElement | null>(null);
  const current = items.find((item) => item.id === previewId) ?? null;
  return (
    <section className="cheese-attachment-gallery" aria-labelledby={id}>
      <h3 id={id}>
        {label}
        <span>{items.length}</span>
      </h3>
      {!items.length ? (
        <p className="cheese-attachment-gallery-empty">{emptyMessage}</p>
      ) : (
        <ul className="cheese-attachment-gallery-list">
          {items.map((item) => {
            const Icon =
              item.kind === "image"
                ? FileImage
                : item.kind === "video"
                  ? Film
                  : File;
            return (
              <li key={item.id}>
                <div className="cheese-attachment-gallery-icon">
                  <Icon size={24} aria-hidden="true" />
                </div>
                <div className="cheese-attachment-gallery-copy">
                  <strong>{item.name}</strong>
                  <span>
                    {item.description ?? item.kind.toUpperCase()}
                    {fileSize(item.size) && ` · ${fileSize(item.size)}`}
                  </span>
                </div>
                <div className="cheese-attachment-gallery-actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`${item.name} 미리보기`}
                    onClick={(event) => {
                      previewOpener.current = event.currentTarget;
                      onPreviewChange(item.id);
                    }}
                  >
                    미리보기
                  </Button>
                  {onDownload &&
                    item.downloadable !== false &&
                    item.status !== "expired" &&
                    item.status !== "loading" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`${item.name} 다운로드`}
                        onClick={() => onDownload(item)}
                      >
                        <Download size={16} aria-hidden="true" />
                      </Button>
                    )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <FilePreview
        open={!!current}
        item={current}
        returnFocus={previewOpener.current}
        onOpenChange={(next) => {
          if (!next) onPreviewChange(null);
        }}
        onRetry={onRetry}
        onDownload={onDownload}
      />
    </section>
  );
}

export interface AccessDeniedProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actions?: React.ReactNode;
}
export interface SessionExpiredProps extends Omit<
  AccessDeniedProps,
  "onAction"
> {
  onReauthenticate?: () => void;
  busy?: boolean;
}
export interface PageErrorProps extends Omit<
  AccessDeniedProps,
  "actionLabel" | "onAction"
> {
  retryLabel?: string;
  onRetry?: () => void;
  busy?: boolean;
}

function StatePage({
  title,
  description,
  icon,
  children,
  busy,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
  busy?: boolean;
}) {
  const id = React.useId();
  return (
    <section
      className="cheese-state-page"
      aria-labelledby={id}
      aria-busy={busy || undefined}
    >
      <div className="cheese-state-page-icon" aria-hidden="true">
        {icon}
      </div>
      <div className="cheese-state-page-copy" role="status">
        <h2 id={id}>{title}</h2>
        <p>{description}</p>
      </div>
      {children && <div className="cheese-state-page-actions">{children}</div>}
    </section>
  );
}

/** Presentation only; enforce authorization on the server. */
export function AccessDenied({
  title = "접근 권한이 없습니다",
  description = "이 화면을 보려면 필요한 권한이 있어야 합니다. 관리자에게 문의해 주세요.",
  actionLabel = "이전 화면으로",
  onAction,
  actions,
}: AccessDeniedProps) {
  return (
    <StatePage
      title={title}
      description={description}
      icon={<LockKeyhole size={28} />}
    >
      {actions ??
        (onAction && (
          <Button variant="weak" onClick={onAction}>
            {actionLabel}
          </Button>
        ))}
    </StatePage>
  );
}
/** Reauthentication and preservation of unsaved work belong to the application. */
export function SessionExpired({
  title = "로그인이 만료되었습니다",
  description = "안전한 이용을 위해 다시 로그인해 주세요.",
  actionLabel = "다시 로그인",
  onReauthenticate,
  busy,
  actions,
}: SessionExpiredProps) {
  return (
    <StatePage
      title={title}
      description={description}
      busy={busy}
      icon={<LogIn size={28} />}
    >
      {actions ??
        (onReauthenticate && (
          <Button onClick={onReauthenticate} loading={busy}>
            {actionLabel}
          </Button>
        ))}
    </StatePage>
  );
}
export function PageError({
  title = "화면을 불러오지 못했습니다",
  description = "잠시 후 다시 시도해 주세요. 문제가 계속되면 관리자에게 문의해 주세요.",
  retryLabel = "다시 시도",
  onRetry,
  busy,
  actions,
}: PageErrorProps) {
  return (
    <StatePage
      title={title}
      description={description}
      busy={busy}
      icon={<CircleAlert size={28} />}
    >
      {actions ??
        (onRetry && (
          <Button variant="weak" onClick={onRetry} loading={busy}>
            {retryLabel}
          </Button>
        ))}
    </StatePage>
  );
}
