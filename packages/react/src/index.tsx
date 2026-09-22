"use client";

import * as React from "react";
export * from "./business.js";
export * from "./SearchSelect.js";
export * from "./DataTable.js";
export * from "./FileUpload.js";
export * from "./ErrorSummary.js";
export * from "./AttachmentList.js";
export * from "./SearchInput.js";
export {
  Select,
  Combobox,
  Listbox,
  type SelectProps,
  type ComboboxProps,
  type ListboxProps,
  type ChoiceOption,
} from "./Collections.js";
export * from "./Fields.js";
export * from "./TimeField.js";
export * from "./DateField.js";
export * from "./NumberField.js";
export { ScrollArea, type ScrollAreaProps } from "./ScrollArea.js";
export * from "./Navigation.js";
export * from "./Layout.js";
export {
  Calendar,
  DatePicker,
  formatDate,
  type DateRange,
  type DatePickerProps,
} from "./Calendar.js";
import * as P from "radix-ui";
import {
  Check,
  Minus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
export {
  Search,
  Plus,
  X,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  Users,
  Settings,
  Bell,
  Upload,
  Download,
  Trash2,
  Pencil,
  MoreHorizontal,
  Info,
  CircleAlert,
  CircleCheck,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  Menu,
  Star,
  PencilLine,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Save,
  File,
  Folder,
  FolderOpen,
  GripVertical,
} from "lucide-react";
export type { LucideIcon, LucideProps } from "lucide-react";
export { Tree, type TreeNode, type TreeProps } from "./Tree.js";
export const Primitives = P;
const cx = (...v: (string | undefined)[]) => v.filter(Boolean).join(" ");
export type ButtonVariant =
  "primary" | "accent" | "weak" | "ghost" | "critical";
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className,
      type = "button",
      children,
      ...props
    },
    ref,
  ) {
    return (
      <button
        {...props}
        ref={ref}
        type={type}
        className={cx("cheese-button", className)}
        data-variant={variant}
        data-size={size}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
      >
        {children}
        {loading && <span aria-hidden="true">…</span>}
      </button>
    );
  },
);
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input {...props} ref={ref} className={cx("cheese-input", className)} />
  );
});
export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      {...props}
      ref={ref}
      className={cx("cheese-input cheese-textarea", className)}
    />
  );
});
export interface FieldProps {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  id?: string;
  children: React.ReactElement<React.InputHTMLAttributes<HTMLInputElement>>;
}
export function Field({
  label,
  description,
  error,
  required,
  id: provided,
  children,
}: FieldProps) {
  const auto = React.useId(),
    id = provided || children.props.id || auto;
  const hint = error || description;
  return (
    <div className="cheese-field">
      <label className="cheese-label" htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {React.cloneElement(children, {
        id,
        required: required || children.props.required,
        "aria-invalid": error ? true : children.props["aria-invalid"],
        "aria-describedby":
          [children.props["aria-describedby"], hint ? id + "-hint" : undefined]
            .filter(Boolean)
            .join(" ") || undefined,
      })}
      {hint && (
        <p
          id={id + "-hint"}
          className="cheese-help"
          data-error={!!error}
          role={error ? "alert" : undefined}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
export const Card = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(function Card({ className, ...props }, ref) {
  return (
    <article {...props} ref={ref} className={cx("cheese-card", className)} />
  );
});
export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "brand" | "positive" | "critical";
}) {
  return (
    <span
      {...props}
      className={cx("cheese-badge", className)}
      data-tone={tone}
    />
  );
}
export const CheckboxRoot = React.forwardRef<
  React.ComponentRef<typeof P.Checkbox.Root>,
  React.ComponentPropsWithoutRef<typeof P.Checkbox.Root>
>(function CheckboxRoot({ className, children, ...props }, ref) {
  return (
    <P.Checkbox.Root
      {...props}
      ref={ref}
      className={cx("cheese-checkbox", className)}
    >
      {children ?? (
        <P.Checkbox.Indicator>
          <Check className="cheese-checkbox-check" aria-hidden="true" />
          <Minus className="cheese-checkbox-minus" aria-hidden="true" />
        </P.Checkbox.Indicator>
      )}
    </P.Checkbox.Root>
  );
});
export const CheckboxIndicator = P.Checkbox.Indicator;
export function Checkbox({
  label,
  id: provided,
  ...props
}: React.ComponentPropsWithoutRef<typeof CheckboxRoot> & { label: string }) {
  const auto = React.useId();
  const id = provided || auto;
  return (
    <label className="cheese-check-label" htmlFor={id}>
      <CheckboxRoot {...props} id={id} />
      {label}
    </label>
  );
}
export const SwitchRoot = React.forwardRef<
  React.ComponentRef<typeof P.Switch.Root>,
  React.ComponentPropsWithoutRef<typeof P.Switch.Root>
>(function SwitchRoot({ className, children, ...props }, ref) {
  return (
    <P.Switch.Root
      {...props}
      ref={ref}
      className={cx("cheese-switch", className)}
    >
      {children ?? <P.Switch.Thumb className="cheese-switch-thumb" />}
    </P.Switch.Root>
  );
});
export const SwitchThumb = P.Switch.Thumb;
export function Switch({
  label,
  id: provided,
  ...props
}: React.ComponentPropsWithoutRef<typeof SwitchRoot> & { label: string }) {
  const auto = React.useId();
  const id = provided || auto;
  return (
    <label className="cheese-check-label" htmlFor={id}>
      <SwitchRoot {...props} id={id} />
      {label}
    </label>
  );
}
export const RadioGroupRoot = P.RadioGroup.Root;
export function RadioGroup({
  options,
  label,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof P.RadioGroup.Root> & {
  label: string;
  options: { value: string; label: string; disabled?: boolean }[];
}) {
  const id = React.useId();
  return (
    <P.RadioGroup.Root
      {...props}
      className={cx("cheese-radio-group", className)}
      aria-label={label}
    >
      {options.map((o) => (
        <label
          className="cheese-check-label"
          key={o.value}
          htmlFor={id + o.value}
        >
          <P.RadioGroup.Item
            id={id + o.value}
            className="cheese-radio"
            value={o.value}
            disabled={o.disabled}
          >
            <P.RadioGroup.Indicator className="cheese-radio-indicator" />
          </P.RadioGroup.Item>
          {o.label}
        </label>
      ))}
    </P.RadioGroup.Root>
  );
}
export function Slider({
  label,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof P.Slider.Root> & { label: string }) {
  const count = (props.value || props.defaultValue || [0]).length;
  return (
    <P.Slider.Root {...props} className={cx("cheese-slider", className)}>
      <P.Slider.Track className="cheese-slider-track">
        <P.Slider.Range className="cheese-slider-range" />
      </P.Slider.Track>
      {Array.from({ length: count }, (_, i) => (
        <P.Slider.Thumb
          key={i}
          className="cheese-slider-thumb"
          aria-label={count > 1 ? label + " " + (i + 1) : label}
        />
      ))}
    </P.Slider.Root>
  );
}
export const TabsRoot = P.Tabs.Root;
export const TabsList = React.forwardRef<
  React.ComponentRef<typeof P.Tabs.List>,
  React.ComponentPropsWithoutRef<typeof P.Tabs.List>
>(function TabsList({ className, ...props }, ref) {
  return (
    <P.Tabs.List
      {...props}
      ref={ref}
      className={cx("cheese-tabs-list", className)}
    />
  );
});
export const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof P.Tabs.Trigger>,
  React.ComponentPropsWithoutRef<typeof P.Tabs.Trigger>
>(function TabsTrigger({ className, ...props }, ref) {
  return (
    <P.Tabs.Trigger
      {...props}
      ref={ref}
      className={cx("cheese-tabs-trigger", className)}
    />
  );
});
export const TabsContent = React.forwardRef<
  React.ComponentRef<typeof P.Tabs.Content>,
  React.ComponentPropsWithoutRef<typeof P.Tabs.Content>
>(function TabsContent({ className, ...props }, ref) {
  return (
    <P.Tabs.Content
      {...props}
      ref={ref}
      className={cx("cheese-tabs-content", className)}
    />
  );
});
export const DialogRoot = P.Dialog.Root,
  DialogTrigger = P.Dialog.Trigger,
  DialogClose = P.Dialog.Close;
export function DialogTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof P.Dialog.Title>) {
  return (
    <P.Dialog.Title
      {...props}
      className={cx("cheese-dialog-title", className)}
    />
  );
}
export function DialogDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof P.Dialog.Description>) {
  return (
    <P.Dialog.Description
      {...props}
      className={cx("cheese-dialog-description", className)}
    />
  );
}
export const DialogContent = React.forwardRef<
  React.ComponentRef<typeof P.Dialog.Content>,
  React.ComponentPropsWithoutRef<typeof P.Dialog.Content> & {
    placement?: "center" | "right" | "bottom";
  }
>(function DialogContent({ className, placement = "center", ...props }, ref) {
  return (
    <P.Dialog.Portal>
      <P.Dialog.Overlay className="cheese-overlay" />
      <P.Dialog.Content
        {...props}
        ref={ref}
        className={cx("cheese-dialog cheese-root", className)}
        data-placement={placement}
      />
    </P.Dialog.Portal>
  );
});
export const AlertDialogRoot = P.AlertDialog.Root,
  AlertDialogTrigger = P.AlertDialog.Trigger,
  AlertDialogCancel = P.AlertDialog.Cancel,
  AlertDialogAction = P.AlertDialog.Action;
export function AlertDialogTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof P.AlertDialog.Title>) {
  return (
    <P.AlertDialog.Title
      {...props}
      className={cx("cheese-dialog-title", className)}
    />
  );
}
export function AlertDialogDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof P.AlertDialog.Description>) {
  return (
    <P.AlertDialog.Description
      {...props}
      className={cx("cheese-dialog-description", className)}
    />
  );
}
export function AlertDialogContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof P.AlertDialog.Content>) {
  return (
    <P.AlertDialog.Portal>
      <P.AlertDialog.Overlay className="cheese-overlay" />
      <P.AlertDialog.Content
        {...props}
        className={cx("cheese-dialog cheese-root", className)}
      />
    </P.AlertDialog.Portal>
  );
}
export const PopoverRoot = P.Popover.Root,
  PopoverTrigger = P.Popover.Trigger,
  PopoverClose = P.Popover.Close;
export function PopoverContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof P.Popover.Content>) {
  return (
    <P.Popover.Portal>
      <P.Popover.Content
        sideOffset={8}
        {...props}
        className={cx("cheese-popover cheese-root", className)}
      />
    </P.Popover.Portal>
  );
}
export function Tooltip({
  content,
  children,
}: {
  content: string;
  children: React.ReactElement;
}) {
  return (
    <P.Tooltip.Provider delayDuration={250}>
      <P.Tooltip.Root>
        <P.Tooltip.Trigger asChild>{children}</P.Tooltip.Trigger>
        <P.Tooltip.Portal>
          <P.Tooltip.Content sideOffset={8} className="cheese-tooltip">
            {content}
          </P.Tooltip.Content>
        </P.Tooltip.Portal>
      </P.Tooltip.Root>
    </P.Tooltip.Provider>
  );
}
export const DropdownMenuRoot = P.DropdownMenu.Root,
  DropdownMenuTrigger = P.DropdownMenu.Trigger;
export function DropdownMenuContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof P.DropdownMenu.Content>) {
  return (
    <P.DropdownMenu.Portal>
      <P.DropdownMenu.Content
        sideOffset={8}
        {...props}
        className={cx("cheese-menu", className)}
      />
    </P.DropdownMenu.Portal>
  );
}
export function DropdownMenuItem({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof P.DropdownMenu.Item>) {
  return (
    <P.DropdownMenu.Item
      {...props}
      className={cx("cheese-menu-item", className)}
    />
  );
}
export const ContextMenuRoot = P.ContextMenu.Root;
export const ContextMenuTrigger = React.forwardRef<
  React.ComponentRef<typeof P.ContextMenu.Trigger>,
  React.ComponentPropsWithoutRef<typeof P.ContextMenu.Trigger>
>(function ContextMenuTrigger(
  { onKeyDown, disabled, tabIndex, ...props },
  ref,
) {
  return (
    <P.ContextMenu.Trigger
      {...props}
      ref={ref}
      disabled={disabled}
      tabIndex={tabIndex ?? (disabled ? -1 : 0)}
      aria-haspopup="menu"
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || disabled) return;
        if (
          event.key !== "ContextMenu" &&
          !(event.shiftKey && event.key === "F10")
        )
          return;
        event.preventDefault();
        // Firefox/WebKit do not consistently synthesize contextmenu from the
        // keyboard. Use the same primitive event path as a pointer invocation.
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.dispatchEvent(
          new MouseEvent("contextmenu", {
            bubbles: true,
            cancelable: true,
            button: 2,
            clientX: rect.left + 8,
            clientY: rect.top + Math.min(rect.height, 32),
          }),
        );
      }}
    />
  );
});
export function ContextMenuContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof P.ContextMenu.Content>) {
  return (
    <P.ContextMenu.Portal>
      <P.ContextMenu.Content
        {...props}
        className={cx("cheese-menu", className)}
      />
    </P.ContextMenu.Portal>
  );
}
export function ContextMenuItem({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof P.ContextMenu.Item>) {
  return (
    <P.ContextMenu.Item
      {...props}
      className={cx("cheese-menu-item", className)}
    />
  );
}
export function Accordion({
  items,
  headingLevel = 2,
  ...props
}: React.ComponentPropsWithoutRef<typeof P.Accordion.Root> & {
  items: { value: string; title: string; content: React.ReactNode }[];
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}) {
  const Heading = ("h" + headingLevel) as "h2" | "h3" | "h4" | "h5" | "h6";
  return (
    <P.Accordion.Root {...props}>
      {items.map((i) => (
        <P.Accordion.Item
          key={i.value}
          value={i.value}
          className="cheese-accordion-item"
        >
          <P.Accordion.Header className="cheese-accordion-header" asChild>
            <Heading>
              <P.Accordion.Trigger className="cheese-accordion-trigger">
                {i.title}
                <ChevronDown aria-hidden="true" />
              </P.Accordion.Trigger>
            </Heading>
          </P.Accordion.Header>
          <P.Accordion.Content className="cheese-accordion-content">
            {i.content}
          </P.Accordion.Content>
        </P.Accordion.Item>
      ))}
    </P.Accordion.Root>
  );
}
export const CollapsibleRoot = P.Collapsible.Root,
  CollapsibleTrigger = P.Collapsible.Trigger,
  CollapsibleContent = P.Collapsible.Content;
export function Progress({
  value,
  max = 100,
  label,
}: {
  value?: number;
  max?: number;
  label: string;
}) {
  const bound = Number.isFinite(max) && max > 0 ? max : 100,
    n =
      value == null || !Number.isFinite(value)
        ? null
        : Math.min(bound, Math.max(0, value));
  return (
    <P.Progress.Root
      className="cheese-progress"
      value={n}
      max={bound}
      aria-label={label}
    >
      <P.Progress.Indicator
        className="cheese-progress-indicator"
        style={
          n === null
            ? undefined
            : { transform: `translateX(-${100 - (n / bound) * 100}%)` }
        }
      />
    </P.Progress.Root>
  );
}
export function Avatar({
  src,
  alt,
  fallback,
}: {
  src?: string;
  alt: string;
  fallback: string;
}) {
  return (
    <P.Avatar.Root className="cheese-avatar">
      <P.Avatar.Image src={src} alt={alt} />
      <P.Avatar.Fallback aria-label={alt} role="img">
        {fallback}
      </P.Avatar.Fallback>
    </P.Avatar.Root>
  );
}
export function Separator() {
  return <P.Separator.Root className="cheese-separator" />;
}
export const AspectRatio = P.AspectRatio.Root;
export function Skeleton({
  width = "100%",
  height = 18,
}: {
  width?: string | number;
  height?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className="cheese-skeleton"
      style={{ width, height }}
    />
  );
}
export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="cheese-empty">
      <h2 className="cheese-empty-title">{title}</h2>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function Alert({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "critical";
  children: React.ReactNode;
}) {
  return (
    <div
      className="cheese-alert"
      data-tone={tone}
      role={tone === "critical" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
export function Table({
  caption,
  headers,
  rows,
}: {
  caption: string;
  headers: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="cheese-table-wrap">
      <table className="cheese-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="현재 위치">
      <ol className="cheese-breadcrumb">
        {items.map((item, i) => (
          <React.Fragment key={i}>
            {i > 0 && <li aria-hidden="true">/</li>}
            <li>
              {item.href && i < items.length - 1 ? (
                <a href={item.href}>{item.label}</a>
              ) : (
                <span
                  aria-current={i === items.length - 1 ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}
export interface PaginationProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "children"
> {
  page: number;
  count: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  label?: string;
  previousLabel?: string;
  nextLabel?: string;
  getPageLabel?: (page: number) => string;
}
const paginationQuery = "(max-width: 479px)";
const subscribePaginationWidth = (notify: () => void) => {
  const query = window.matchMedia(paginationQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const getPaginationWidth = () => window.matchMedia(paginationQuery).matches;
const getServerPaginationWidth = () => false;

// Calculate a bounded range even when the result set contains millions of pages.
function paginationItems(page: number, count: number, slots: number) {
  const range = (start: number, length: number) =>
    Array.from({ length }, (_, index) => start + index);
  if (count <= slots) return range(1, count);
  if (slots === 5) {
    if (page <= 3) return [...range(1, 4), "end-gap"];
    if (page >= count - 2) return ["start-gap", ...range(count - 3, 4)];
    return ["start-gap", page - 1, page, page + 1, "end-gap"];
  }
  if (page <= Math.ceil(slots / 2))
    return [...range(1, slots - 2), "end-gap", count];
  if (page >= count - Math.floor(slots / 2))
    return [1, "start-gap", ...range(count - slots + 3, slots - 2)];
  return [
    1,
    "start-gap",
    ...range(page - Math.floor((slots - 4) / 2), slots - 4),
    "end-gap",
    count,
  ];
}
export function Pagination({
  page,
  count,
  onPageChange,
  disabled = false,
  label = "페이지 탐색",
  previousLabel = "이전 페이지",
  nextLabel = "다음 페이지",
  getPageLabel = (value) => `${value}페이지`,
  className,
  ...props
}: PaginationProps) {
  const compact = React.useSyncExternalStore(
    subscribePaginationWidth,
    getPaginationWidth,
    getServerPaginationWidth,
  );
  const total = Number.isFinite(count)
    ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(count)))
    : 0;
  const current = Math.min(
    total,
    Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1),
  );
  const root = React.useRef<HTMLElement>(null);
  const pendingFocus = React.useRef<number | undefined>(undefined);
  React.useEffect(() => {
    if (pendingFocus.current === current) {
      root.current
        ?.querySelector<HTMLButtonElement>('[aria-current="page"]')
        ?.focus();
      pendingFocus.current = undefined;
    }
  }, [current]);
  if (total <= 1) return null;
  const changePage = (value: number, fromArrow = false) => {
    if (!disabled && value !== current && value >= 1 && value <= total) {
      // An arrow disappears at the boundary; keep its keyboard user in the nav.
      pendingFocus.current =
        fromArrow && (value === 1 || value === total) ? value : undefined;
      onPageChange(value);
    }
  };
  return (
    <nav
      aria-label={label}
      {...props}
      ref={root}
      className={cx("cheese-pagination", className)}
      aria-disabled={disabled || undefined}
    >
      <ol className="cheese-pagination-list">
        <li>
          <button
            type="button"
            className="cheese-pagination-item cheese-pagination-arrow"
            aria-label={previousLabel}
            data-unavailable={current === 1 || undefined}
            disabled={disabled || current === 1}
            onClick={() => changePage(current - 1, true)}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
        </li>
        {paginationItems(current, total, compact ? 5 : 7).map((item) => (
          <li key={item}>
            {typeof item === "number" ? (
              <button
                type="button"
                className="cheese-pagination-item"
                aria-label={getPageLabel(item)}
                aria-current={item === current ? "page" : undefined}
                disabled={disabled}
                onClick={() => changePage(item)}
              >
                {item}
              </button>
            ) : (
              <span className="cheese-pagination-ellipsis" aria-hidden="true">
                …
              </span>
            )}
          </li>
        ))}
        <li>
          <button
            type="button"
            className="cheese-pagination-item cheese-pagination-arrow"
            aria-label={nextLabel}
            data-unavailable={current === total || undefined}
            disabled={disabled || current === total}
            onClick={() => changePage(current + 1, true)}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </li>
      </ol>
      <span className="cheese-sr-only" aria-live="polite" aria-atomic="true">
        {current} / {total}
      </span>
    </nav>
  );
}
export function Stepper({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <ol className="cheese-stepper" aria-label="진행 단계">
      {steps.map((s, i) => (
        <li
          key={i}
          className="cheese-step"
          aria-current={current === i ? "step" : undefined}
        >
          <span className="cheese-step-circle" aria-hidden="true">
            {i < current ? <Check size={16} aria-hidden="true" /> : i + 1}
          </span>
          <span className="cheese-step-label">
            {s}
            {i < current && <span className="cheese-sr-only"> 완료</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}
export function Toggle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof P.Toggle.Root>) {
  return (
    <P.Toggle.Root {...props} className={cx("cheese-toggle", className)} />
  );
}
export function ToggleGroup({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof P.ToggleGroup.Root>) {
  return (
    <P.ToggleGroup.Root
      {...props}
      className={cx("cheese-toggle-group", className)}
    />
  );
}
export function ToggleGroupItem({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof P.ToggleGroup.Item>) {
  return (
    <P.ToggleGroup.Item {...props} className={cx("cheese-toggle", className)} />
  );
}
export const ToastProvider = P.Toast.Provider;
export function Toast({
  title,
  description,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof P.Toast.Root> & {
  title: string;
  description?: string;
}) {
  return (
    <P.Toast.Root {...props} className={cx("cheese-toast", className)}>
      <P.Toast.Title className="cheese-toast-title">{title}</P.Toast.Title>
      {description && (
        <P.Toast.Description className="cheese-toast-description">
          {description}
        </P.Toast.Description>
      )}
      <P.Toast.Close className="cheese-toast-close" aria-label="닫기">
        <X aria-hidden="true" />
      </P.Toast.Close>
    </P.Toast.Root>
  );
}
export function ToastViewport({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof P.Toast.Viewport> = {}) {
  return (
    <P.Toast.Viewport
      {...props}
      className={cx("cheese-toast-viewport", className)}
    />
  );
}
export function List({ children }: { children: React.ReactNode }) {
  return <ul className="cheese-list">{children}</ul>;
}
export function Timeline({
  items,
}: {
  items: { title: string; description: string }[];
}) {
  return (
    <ol className="cheese-timeline">
      {items.map((i, n) => (
        <li key={n}>
          <strong>{i.title}</strong>
          <p className="cheese-help">{i.description}</p>
        </li>
      ))}
    </ol>
  );
}
