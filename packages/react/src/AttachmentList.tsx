"use client";
import * as React from "react";
import { Download, File, RotateCcw, Trash2 } from "lucide-react";
import { formatFileSize } from "./business.js";

export interface AttachmentItem {
  /** Stable, unique identifier supplied by the owner of the saved file. */
  id: string;
  name: string;
  size: number;
  href?: string;
}
export type AttachmentRemoveHandler = (
  item: AttachmentItem,
  context: { signal: AbortSignal },
) => Promise<void>;
export interface AttachmentListProps {
  label: string;
  items: readonly AttachmentItem[];
  /** Delete remotely, then update items. Handle any confirmation before deleting. */
  onRemove?: AttachmentRemoveHandler;
}
type RemovalState = { pending: boolean; error?: string };

export function AttachmentList({
  label,
  items,
  onRemove,
}: AttachmentListProps) {
  const id = React.useId();
  const root = React.useRef<HTMLDivElement>(null);
  const heading = React.useRef<HTMLSpanElement>(null);
  const rows = React.useRef(new Map<string, HTMLLIElement>());
  const operations = React.useRef(new Map<string, AbortController>());
  const focusedRow = React.useRef<string | null>(null);
  const previousIds = React.useRef(items.map((item) => item.id));
  const currentItems = React.useRef(items);
  const mounted = React.useRef(false);
  const [states, setStates] = React.useState(new Map<string, RemovalState>());
  currentItems.current = items;

  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      operations.current.forEach((controller) => controller.abort());
      operations.current.clear();
    };
  }, []);

  React.useEffect(() => {
    const ids = new Set(items.map((item) => item.id));
    for (const [key, controller] of operations.current) {
      if (!ids.has(key) || !onRemove) {
        controller.abort();
        operations.current.delete(key);
      }
    }
    setStates((previous) => {
      const next = new Map(
        [...previous].filter(([key]) => ids.has(key) && onRemove),
      );
      return next.size === previous.size ? previous : next;
    });
    const removedId = focusedRow.current;
    if (removedId && !ids.has(removedId)) {
      const previousIndex = previousIds.current.indexOf(removedId);
      const nextItem =
        items[Math.min(Math.max(previousIndex, 0), items.length - 1)];
      const row = nextItem ? rows.current.get(nextItem.id) : undefined;
      const action =
        row?.querySelector<HTMLElement>("button") ??
        row?.querySelector<HTMLElement>("a[href]");
      (action ?? heading.current)?.focus();
    }
    previousIds.current = items.map((item) => item.id);
  }, [items, onRemove]);

  async function remove(item: AttachmentItem) {
    if (!onRemove || operations.current.has(item.id)) return;
    const controller = new AbortController();
    operations.current.set(item.id, controller);
    setStates((previous) => new Map(previous).set(item.id, { pending: true }));
    const isCurrent = () =>
      mounted.current &&
      !controller.signal.aborted &&
      operations.current.get(item.id) === controller &&
      currentItems.current.some((current) => current.id === item.id);
    try {
      await onRemove(item, { signal: controller.signal });
    } catch (error) {
      if (isCurrent()) {
        const message =
          error instanceof Error && error.message.trim()
            ? error.message
            : "파일을 삭제하지 못했습니다. 다시 시도해 주세요.";
        setStates((previous) =>
          new Map(previous).set(item.id, { pending: true, error: message }),
        );
      }
    } finally {
      if (isCurrent()) {
        operations.current.delete(item.id);
        setStates((previous) =>
          new Map(previous).set(item.id, {
            ...previous.get(item.id),
            pending: false,
          }),
        );
      }
    }
  }

  return (
    <div
      ref={root}
      className="cheese-attachment-list"
      role="group"
      aria-labelledby={id + "-label"}
      onFocusCapture={(event) => {
        focusedRow.current =
          (event.target as HTMLElement).closest<HTMLElement>(
            "[data-attachment-id]",
          )?.dataset.attachmentId ?? null;
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          focusedRow.current = null;
      }}
    >
      <span
        ref={heading}
        id={id + "-label"}
        className="cheese-label cheese-attachment-label"
        tabIndex={-1}
      >
        {label}
        <span className="cheese-attachment-count" aria-hidden="true">
          {items.length}개
        </span>
      </span>
      {items.length ? (
        <ul
          className="cheese-attachment-items"
          aria-label={label + " 파일 목록"}
        >
          {items.map((item, index) => {
            const state = states.get(item.id);
            const errorId = id + "-error-" + index;
            return (
              <li
                key={item.id}
                ref={(node) => {
                  if (node) rows.current.set(item.id, node);
                  else rows.current.delete(item.id);
                }}
                className="cheese-attachment-item"
                data-attachment-id={item.id}
                data-pending={state?.pending || undefined}
                aria-busy={state?.pending || undefined}
              >
                <File size={20} aria-hidden="true" />
                <div className="cheese-attachment-copy">
                  <strong>{item.name}</strong>
                  <span className="cheese-help">
                    {formatFileSize(item.size)}
                  </span>
                  {state?.error && (
                    <span
                      id={errorId}
                      className="cheese-attachment-error"
                      role="alert"
                    >
                      {state.error}
                    </span>
                  )}
                </div>
                {(item.href || onRemove) && (
                  <div className="cheese-attachment-actions">
                    {item.href && (
                      <a
                        className="cheese-button"
                        data-variant="ghost"
                        data-size="sm"
                        href={item.href}
                        download={item.name}
                        aria-label={item.name + " 다운로드"}
                      >
                        <Download size={16} aria-hidden="true" />
                        다운로드
                      </a>
                    )}
                    {onRemove && (
                      <button
                        type="button"
                        className="cheese-button"
                        data-variant="ghost"
                        data-size="sm"
                        aria-disabled={state?.pending || undefined}
                        aria-label={
                          item.name + (state?.error ? " 삭제 재시도" : " 삭제")
                        }
                        aria-describedby={state?.error ? errorId : undefined}
                        onClick={() => void remove(item)}
                      >
                        {state?.error ? (
                          <RotateCcw size={16} aria-hidden="true" />
                        ) : (
                          <Trash2 size={16} aria-hidden="true" />
                        )}
                        {state?.pending
                          ? "삭제 중"
                          : state?.error
                            ? "재시도"
                            : "삭제"}
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="cheese-attachment-empty">첨부파일이 없습니다.</p>
      )}
      <span className="cheese-sr-only" role="status">
        {[...states].filter(
          ([key, state]) =>
            state.pending && items.some((item) => item.id === key),
        ).length > 0
          ? "첨부파일을 삭제하고 있습니다."
          : ""}
      </span>
    </div>
  );
}
