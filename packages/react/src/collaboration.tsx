"use client";

import * as React from "react";
import {
  Bell,
  Check,
  MessageSquare,
  Pencil,
  Reply,
  Trash2,
} from "lucide-react";
import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Textarea,
} from "./index.js";

export interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  /** Application-formatted display time; no locale or timezone policy is imposed. */
  time: string;
  datetime?: string;
  read: boolean;
  /** Relative and HTTP(S) destinations; executable/data URLs are not linked. */
  href?: string;
}

function notificationHref(value?: string) {
  if (!value || /[\u0000-\u001f\u007f]/u.test(value)) return undefined;
  try {
    const url = new URL(value, "https://cheese.invalid");
    return url.protocol === "http:" || url.protocol === "https:"
      ? value
      : undefined;
  } catch {
    return undefined;
  }
}

export interface NotificationCenterProps {
  items: NotificationItem[];
  title?: string;
  /** May include unread items not loaded into this view. */
  unreadCount?: number;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  onRead?: (id: string) => void | Promise<void>;
  onReadAll?: () => void | Promise<void>;
  /** When provided, owns navigation instead of following href. */
  onNavigate?: (item: NotificationItem) => void;
}

/** Controlled list: the app owns persistence, pagination, subscriptions and rights. */
export function NotificationCenter({
  items,
  title = "알림",
  unreadCount,
  loading = false,
  error,
  onRetry,
  onRead,
  onReadAll,
  onNavigate,
}: NotificationCenterProps) {
  const titleId = React.useId();
  const [pending, setPending] = React.useState(false);
  const pendingRef = React.useRef(false);
  const [actionError, setActionError] = React.useState("");
  const count = Math.max(
    0,
    unreadCount ?? items.filter((item) => !item.read).length,
  );
  async function perform(action: () => void | Promise<void>) {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    setActionError("");
    try {
      await action();
    } catch {
      setActionError(
        "알림을 읽음으로 변경하지 못했습니다. 다시 시도해 주세요.",
      );
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }
  function navigate(item: NotificationItem, event: React.MouseEvent) {
    if (onNavigate) {
      event.preventDefault();
      onNavigate(item);
    }
  }
  return (
    <section
      className="cheese-notification-center cheese-root"
      aria-labelledby={titleId}
    >
      <header className="cheese-collaboration-header">
        <h2 id={titleId}>
          {title}
          <span
            className="cheese-notification-count"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`읽지 않은 알림 ${count}개`}
          >
            {count}
          </span>
        </h2>
        {onReadAll && (
          <Button
            variant="ghost"
            size="sm"
            disabled={pending || loading || count === 0}
            onClick={() => void perform(onReadAll)}
          >
            <Check size={16} aria-hidden="true" />
            모두 읽음
          </Button>
        )}
      </header>
      {(error || actionError) && (
        <div className="cheese-collaboration-error" role="alert">
          <p>{error || actionError}</p>
          {error && onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              disabled={loading}
            >
              다시 시도
            </Button>
          )}
        </div>
      )}
      <div aria-busy={loading || pending}>
        {loading && (
          <p className="cheese-collaboration-state" role="status">
            알림을 불러오는 중입니다.
          </p>
        )}
        {!loading && !error && items.length === 0 && (
          <div className="cheese-collaboration-empty">
            <Bell size={24} aria-hidden="true" />
            <p>새로운 알림이 없습니다.</p>
          </div>
        )}
        {items.length > 0 && (
          <ul className="cheese-notification-list">
            {items.map((item) => (
              <li
                key={item.id}
                className="cheese-notification-item"
                data-unread={!item.read || undefined}
              >
                <span
                  className="cheese-notification-marker"
                  role="img"
                  aria-label={item.read ? "읽음" : "읽지 않음"}
                />
                <div className="cheese-notification-copy">
                  {notificationHref(item.href) ? (
                    <a
                      className="cheese-notification-title"
                      href={notificationHref(item.href)}
                      onClick={(event) => navigate(item, event)}
                    >
                      {item.title}
                    </a>
                  ) : onNavigate ? (
                    <button
                      className="cheese-notification-title"
                      type="button"
                      onClick={() => onNavigate(item)}
                    >
                      {item.title}
                    </button>
                  ) : (
                    <strong className="cheese-notification-title">
                      {item.title}
                    </strong>
                  )}
                  {item.body && <p>{item.body}</p>}
                  <time dateTime={item.datetime}>{item.time}</time>
                </div>
                {!item.read && onRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pending || loading}
                    aria-label={`${item.title} 읽음으로 표시`}
                    onClick={() => void perform(() => onRead(item.id))}
                  >
                    <Check size={16} aria-hidden="true" />
                    <span>읽음</span>
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export interface CommentComposerProps {
  label?: string;
  /** Initial uncontrolled draft. Remount with a new key to change the edited item. */
  defaultValue?: string;
  placeholder?: string;
  submitLabel?: string;
  maxLength?: number;
  disabled?: boolean;
  /** Resolve to accept; reject to retain the draft and display a retryable error. */
  onSubmit: (body: string) => void | Promise<void>;
  onCancel?: () => void;
}

/** Plain text only. Pending submissions lock this draft; no nested HTML form. */
export function CommentComposer({
  label = "댓글 작성",
  defaultValue = "",
  placeholder = "의견을 입력해 주세요.",
  submitLabel = "등록",
  maxLength = 5000,
  disabled = false,
  onSubmit,
  onCancel,
}: CommentComposerProps) {
  const id = React.useId();
  const [draft, setDraft] = React.useState(defaultValue);
  const [pending, setPending] = React.useState(false);
  const pendingRef = React.useRef(false);
  const draftRef = React.useRef(draft);
  const [error, setError] = React.useState("");
  const [status, setStatus] = React.useState("");
  const limit = Math.max(1, maxLength);
  async function submit() {
    if (disabled || pendingRef.current) return;
    const submitted = draftRef.current;
    const body = submitted.trim();
    if (!body) {
      setError("내용을 입력해 주세요.");
      return;
    }
    if (body.length > limit) {
      setError(`${limit}자 이내로 입력해 주세요.`);
      return;
    }
    pendingRef.current = true;
    setPending(true);
    setError("");
    setStatus("");
    try {
      await onSubmit(body);
      if (draftRef.current === submitted) {
        draftRef.current = "";
        setDraft("");
      }
      setStatus("등록되었습니다.");
    } catch {
      setError(
        "저장하지 못했습니다. 작성한 내용은 유지됩니다. 다시 시도해 주세요.",
      );
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }
  return (
    <div className="cheese-comment-composer cheese-root" aria-busy={pending}>
      <label className="cheese-label" htmlFor={id}>
        {label}
      </label>
      <Textarea
        id={id}
        value={draft}
        rows={3}
        placeholder={placeholder}
        maxLength={limit}
        disabled={disabled || pending}
        aria-invalid={!!error || undefined}
        aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
        onChange={(event) => {
          draftRef.current = event.target.value;
          setDraft(event.target.value);
          setError("");
          setStatus("");
        }}
        onKeyDown={(event) => {
          if (
            (event.ctrlKey || event.metaKey) &&
            event.key === "Enter" &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();
            void submit();
          }
        }}
      />
      {error && (
        <p
          id={`${id}-error`}
          className="cheese-collaboration-error"
          role="alert"
        >
          {error}
        </p>
      )}
      <div className="cheese-comment-composer-footer">
        <span id={`${id}-hint`} className="cheese-comment-hint">
          {draft.length.toLocaleString()} / {limit.toLocaleString()}자
        </span>
        <div className="cheese-comment-actions">
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={onCancel}
            >
              취소
            </Button>
          )}
          <Button
            size="sm"
            loading={pending}
            disabled={disabled}
            onClick={() => void submit()}
          >
            {submitLabel}
          </Button>
        </div>
      </div>
      <span className="cheese-comment-status" role="status" aria-live="polite">
        {status}
      </span>
    </div>
  );
}

export interface CommentReply {
  id: string;
  author: string;
  body: string;
  time: string;
  datetime?: string;
  edited?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}
/** Exactly one reply level. All capabilities are UI hints, never authorization. */
export interface CommentItem extends CommentReply {
  canReply?: boolean;
  replies?: CommentReply[];
}
export interface CommentThreadProps {
  items: CommentItem[];
  label?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  onEdit?: (id: string, body: string) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
  onReply?: (parentId: string, body: string) => void | Promise<void>;
}

function CommentEntry({
  item,
  onEdit,
  onDelete,
  onReply,
  nested = false,
}: { item: CommentItem; nested?: boolean } & Pick<
  CommentThreadProps,
  "onEdit" | "onDelete" | "onReply"
>) {
  const [editing, setEditing] = React.useState(false);
  const [replying, setReplying] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const deletingRef = React.useRef(false);
  const [deleteError, setDeleteError] = React.useState("");
  const authorId = React.useId();
  async function remove() {
    if (!onDelete || deletingRef.current || editing || replying) return;
    deletingRef.current = true;
    setDeleting(true);
    setDeleteError("");
    try {
      await onDelete(item.id);
      setConfirming(false);
    } catch {
      setDeleteError("삭제하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      deletingRef.current = false;
      setDeleting(false);
    }
  }
  return (
    <li className="cheese-comment-entry">
      <article aria-labelledby={authorId}>
        <header className="cheese-comment-meta">
          <strong id={authorId}>{item.author}</strong>
          <time dateTime={item.datetime}>{item.time}</time>
          {item.edited && <span>수정됨</span>}
        </header>
        {editing ? (
          <CommentComposer
            label="댓글 수정"
            defaultValue={item.body}
            submitLabel="변경 저장"
            disabled={!item.canEdit || !onEdit}
            onCancel={() => setEditing(false)}
            onSubmit={async (body) => {
              if (!item.canEdit || !onEdit)
                throw new Error("Editing unavailable");
              await onEdit(item.id, body);
              setEditing(false);
            }}
          />
        ) : (
          <p className="cheese-comment-body">{item.body}</p>
        )}
        <div className="cheese-comment-actions">
          {!editing && !replying && item.canEdit && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              aria-label={`${item.author} 댓글 수정`}
              onClick={() => {
                setEditing(true);
              }}
            >
              <Pencil size={14} aria-hidden="true" />
              수정
            </Button>
          )}
          {item.canDelete && onDelete && (
            <AlertDialogRoot
              open={confirming}
              onOpenChange={(open) => {
                if (!deleting && (!open || (!editing && !replying))) {
                  setConfirming(open);
                  if (open) setDeleteError("");
                }
              }}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`${item.author} 댓글 삭제`}
                  disabled={editing || replying}
                >
                  <Trash2 size={14} aria-hidden="true" />
                  삭제
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>댓글을 삭제할까요?</AlertDialogTitle>
                <AlertDialogDescription>
                  아래 댓글을 삭제합니다. 내용을 확인한 후 삭제해 주세요.
                </AlertDialogDescription>
                <p className="cheese-comment-delete-preview">{item.body}</p>
                {deleteError && (
                  <p className="cheese-collaboration-error" role="alert">
                    {deleteError}
                  </p>
                )}
                <div className="cheese-comment-confirm-actions">
                  <AlertDialogCancel asChild>
                    <Button variant="ghost" disabled={deleting}>
                      취소
                    </Button>
                  </AlertDialogCancel>
                  <Button
                    variant="critical"
                    loading={deleting}
                    onClick={() => void remove()}
                  >
                    삭제
                  </Button>
                </div>
              </AlertDialogContent>
            </AlertDialogRoot>
          )}
          {!nested && !editing && !replying && item.canReply && onReply && (
            <Button
              variant="ghost"
              size="sm"
              aria-label={`${item.author} 댓글에 답글 작성`}
              onClick={() => setReplying(true)}
            >
              <Reply size={14} aria-hidden="true" />
              답글
            </Button>
          )}
        </div>
        {replying && (
          <CommentComposer
            label={`${item.author}님에게 답글 작성`}
            submitLabel="답글 등록"
            disabled={!item.canReply || !onReply}
            onCancel={() => setReplying(false)}
            onSubmit={async (body) => {
              if (!item.canReply || !onReply)
                throw new Error("Reply unavailable");
              await onReply(item.id, body);
              setReplying(false);
            }}
          />
        )}
      </article>
      {!nested && !!item.replies?.length && (
        <ul className="cheese-comment-replies">
          {item.replies.map((reply) => (
            <CommentEntry
              key={reply.id}
              item={reply}
              nested
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/** Renders app-owned plain text content; callbacks must enforce server-side rights. */
export function CommentThread({
  items,
  label = "댓글",
  loading = false,
  error,
  onRetry,
  onEdit,
  onDelete,
  onReply,
}: CommentThreadProps) {
  const id = React.useId();
  return (
    <section className="cheese-comment-thread cheese-root" aria-labelledby={id}>
      <header className="cheese-collaboration-header">
        <h2 id={id}>{label}</h2>
      </header>
      {error && (
        <div className="cheese-collaboration-error" role="alert">
          <p>{error}</p>
          {onRetry && (
            <Button
              variant="ghost"
              size="sm"
              disabled={loading}
              onClick={onRetry}
            >
              다시 시도
            </Button>
          )}
        </div>
      )}
      <div aria-busy={loading}>
        {loading && (
          <p className="cheese-collaboration-state" role="status">
            댓글을 불러오는 중입니다.
          </p>
        )}
        {!loading && !error && !items.length && (
          <div className="cheese-collaboration-empty">
            <MessageSquare size={24} aria-hidden="true" />
            <p>아직 작성된 댓글이 없습니다.</p>
          </div>
        )}
        {items.length > 0 && (
          <ul className="cheese-comment-list">
            {items.map((item) => (
              <CommentEntry
                key={item.id}
                item={item}
                onEdit={onEdit}
                onDelete={onDelete}
                onReply={onReply}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
