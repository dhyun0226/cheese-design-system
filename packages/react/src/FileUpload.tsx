"use client";
import * as React from "react";
import {
  Upload,
  File,
  X,
  RotateCcw,
  CircleCheck,
  CircleAlert,
} from "lucide-react";
import { Button } from "./index.js";
import {
  UploadQueue,
  formatFileSize,
  type UploadHandler,
  type UploadItem,
  type UploadRules,
} from "./business.js";
export interface FileUploadProps extends UploadRules {
  label: string;
  upload: UploadHandler;
  disabled?: boolean;
  onChange?: (items: UploadItem[]) => void;
  onComplete?: (item: UploadItem) => void;
}
const statusLabel = {
  queued: "대기",
  uploading: "업로드 중",
  success: "완료",
  error: "실패",
  canceled: "취소됨",
};
export function FileUpload({
  label,
  upload,
  disabled,
  accept,
  maxSize = 10 * 1024 * 1024,
  maxFiles = 5,
  onChange,
  onComplete,
}: FileUploadProps) {
  const [items, setItems] = React.useState<UploadItem[]>([]),
    [errors, setErrors] = React.useState<string[]>([]),
    [drag, setDrag] = React.useState(false);
  const queue = React.useRef<UploadQueue | null>(null),
    input = React.useRef<HTMLInputElement>(null),
    root = React.useRef<HTMLDivElement>(null),
    id = React.useId(),
    callbacks = React.useRef({ onChange, onComplete });
  callbacks.current = { onChange, onComplete };
  React.useEffect(() => {
    const instance = new UploadQueue(
      (next) => {
        setItems(next);
        callbacks.current.onChange?.(next);
      },
      (item) => callbacks.current.onComplete?.(item),
    );
    queue.current = instance;
    const form = root.current?.closest("form");
    const resetTimers = new Set<ReturnType<typeof setTimeout>>();
    const reset = (event: Event) => {
      // React's delegated onReset may run after this native listener. Wait
      // until dispatch finishes before honoring or canceling the reset.
      const timer = setTimeout(() => {
        resetTimers.delete(timer);
        if (!event.defaultPrevented) {
          instance.clear();
          setErrors([]);
          setDrag(false);
        }
      }, 0);
      resetTimers.add(timer);
    };
    form?.addEventListener("reset", reset);
    return () => {
      form?.removeEventListener("reset", reset);
      resetTimers.forEach(clearTimeout);
      instance.dispose();
      queue.current = null;
    };
  }, []);
  React.useEffect(() => {
    if (disabled) {
      for (const item of queue.current?.items ?? [])
        if (item.status === "uploading") queue.current?.cancel(item.id);
    }
  }, [disabled]);
  const add = (files: File[]) => {
    if (!disabled)
      setErrors(queue.current?.add(files, { accept, maxSize, maxFiles }) ?? []);
  };
  return (
    <div
      ref={root}
      className="cheese-file-upload"
      role="group"
      aria-labelledby={id + "-label"}
    >
      <span className="cheese-label" id={id + "-label"}>
        {label}
      </span>
      <div
        className="cheese-dropzone"
        data-dragging={drag && !disabled}
        data-disabled={disabled}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDrag(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node))
            setDrag(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDrag(false);
          add(Array.from(event.dataTransfer.files));
        }}
      >
        <Upload size={28} aria-hidden="true" />
        <p>파일을 끌어 놓거나 직접 선택하세요.</p>
        <Button
          variant="weak"
          disabled={disabled}
          onClick={() => input.current?.click()}
        >
          파일 선택
        </Button>
        <input
          ref={input}
          type="file"
          className="cheese-sr-only"
          tabIndex={-1}
          aria-label={label + " 파일 선택"}
          accept={accept}
          multiple={maxFiles > 1}
          disabled={disabled}
          onChange={(event) => {
            add(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
        <p className="cheese-help">
          최대 {maxFiles}개 · 파일당 {formatFileSize(maxSize)}
          {accept ? " · " + accept : ""}
        </p>
      </div>
      {errors.length > 0 && (
        <div role="alert" className="cheese-upload-errors">
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
      <ul className="cheese-upload-list" aria-label={label + " 파일 목록"}>
        {items.map((item) => (
          <li key={item.id} className="cheese-upload-item">
            <File size={20} aria-hidden="true" />
            <div className="cheese-upload-copy">
              <strong>{item.file.name}</strong>
              <span className="cheese-help">
                {formatFileSize(item.file.size)} · {statusLabel[item.status]}
              </span>
              {item.status === "uploading" && (
                <progress
                  className="cheese-upload-progress"
                  max={100}
                  value={item.progress}
                  aria-label={item.file.name + " 업로드 진행률"}
                />
              )}
              {item.error && (
                <span role="alert" className="cheese-help">
                  {item.error}
                </span>
              )}
            </div>
            {item.status === "success" ? (
              <CircleCheck size={20} aria-label="업로드 완료" />
            ) : item.status === "uploading" ? (
              <Button
                variant="ghost"
                size="sm"
                aria-label={item.file.name + " 업로드 취소"}
                onClick={() => queue.current?.cancel(item.id)}
              >
                취소
              </Button>
            ) : (
              <Button
                variant="weak"
                size="sm"
                disabled={disabled}
                aria-label={
                  item.file.name +
                  (item.status === "queued" ? " 업로드" : " 재시도")
                }
                onClick={() => queue.current?.start(item.id, upload)}
              >
                {item.status === "queued" ? (
                  <Upload size={16} aria-hidden="true" />
                ) : (
                  <RotateCcw size={16} aria-hidden="true" />
                )}
                {item.status === "queued" ? "업로드" : "재시도"}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              disabled={disabled}
              aria-label={item.file.name + " 삭제"}
              onClick={() => queue.current?.remove(item.id)}
            >
              <X size={16} aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ul>
      <p className="cheese-help" role="status">
        {items.length}개 파일 ·{" "}
        {items.filter((item) => item.status === "success").length}개 완료
      </p>
      <p className="cheese-help">
        <CircleAlert
          size={14}
          className="cheese-inline-icon"
          aria-hidden="true"
        />{" "}
        업로드 버튼을 눌러 전송합니다. 완료 파일의 삭제 버튼은 목록에서만
        제거합니다.
      </p>
    </div>
  );
}
