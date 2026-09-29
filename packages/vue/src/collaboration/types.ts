export interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  /** Application-formatted display time. */
  time: string;
  datetime?: string;
  read: boolean;
  /** Relative and HTTP(S) destinations; executable/data URLs are not linked. */
  href?: string;
}

export interface NotificationCenterProps {
  items: NotificationItem[];
  title?: string;
  /** May include unread items not yet loaded. */
  unreadCount?: number;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  onRead?: (id: string) => void | Promise<void>;
  onReadAll?: () => void | Promise<void>;
  /** Owns navigation instead of following href when provided. */
  onNavigate?: (item: NotificationItem) => void;
}

export interface CommentComposerProps {
  label?: string;
  /** Initial draft only; change the component key when switching edited items. */
  defaultValue?: string;
  placeholder?: string;
  submitLabel?: string;
  maxLength?: number;
  disabled?: boolean;
  /** Callback prop (not an emit): rejection preserves the draft. */
  onSubmit: (body: string) => void | Promise<void>;
  onCancel?: () => void;
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

/** One reply level; capabilities are UI hints, not server authorization. */
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
