import * as React from "react";
export {
  Calendar,
  DatePicker,
  formatDate,
  type DateRange,
  type DatePickerProps,
} from "./Calendar.js";
import * as P from "radix-ui";
import { Check, ChevronDown } from "lucide-react";
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
export const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function NativeSelect({ className, ...props }, ref) {
  return (
    <select
      {...props}
      ref={ref}
      className={cx("cheese-input cheese-select", className)}
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
export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return <article {...props} className={cx("cheese-card", className)} />;
}
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
          <Check />
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
  ...props
}: React.ComponentPropsWithoutRef<typeof P.RadioGroup.Root> & {
  label: string;
  options: { value: string; label: string; disabled?: boolean }[];
}) {
  const id = React.useId();
  return (
    <P.RadioGroup.Root
      {...props}
      className="cheese-radio-group"
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
  ...props
}: React.ComponentPropsWithoutRef<typeof P.Slider.Root> & { label: string }) {
  const count = (props.value || props.defaultValue || [0]).length;
  return (
    <P.Slider.Root {...props} className="cheese-slider">
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
export function AlertDialogTitle(
  props: React.ComponentPropsWithoutRef<typeof P.AlertDialog.Title>,
) {
  return <P.AlertDialog.Title {...props} className="cheese-dialog-title" />;
}
export function AlertDialogDescription(
  props: React.ComponentPropsWithoutRef<typeof P.AlertDialog.Description>,
) {
  return (
    <P.AlertDialog.Description
      {...props}
      className="cheese-dialog-description"
    />
  );
}
export function AlertDialogContent(
  props: React.ComponentPropsWithoutRef<typeof P.AlertDialog.Content>,
) {
  return (
    <P.AlertDialog.Portal>
      <P.AlertDialog.Overlay className="cheese-overlay" />
      <P.AlertDialog.Content {...props} className="cheese-dialog cheese-root" />
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
export function DropdownMenuContent(
  props: React.ComponentPropsWithoutRef<typeof P.DropdownMenu.Content>,
) {
  return (
    <P.DropdownMenu.Portal>
      <P.DropdownMenu.Content
        sideOffset={8}
        {...props}
        className="cheese-menu"
      />
    </P.DropdownMenu.Portal>
  );
}
export function DropdownMenuItem(
  props: React.ComponentPropsWithoutRef<typeof P.DropdownMenu.Item>,
) {
  return <P.DropdownMenu.Item {...props} className="cheese-menu-item" />;
}
export const ContextMenuRoot = P.ContextMenu.Root,
  ContextMenuTrigger = P.ContextMenu.Trigger;
export function ContextMenuContent(
  props: React.ComponentPropsWithoutRef<typeof P.ContextMenu.Content>,
) {
  return (
    <P.ContextMenu.Portal>
      <P.ContextMenu.Content {...props} className="cheese-menu" />
    </P.ContextMenu.Portal>
  );
}
export function ContextMenuItem(
  props: React.ComponentPropsWithoutRef<typeof P.ContextMenu.Item>,
) {
  return <P.ContextMenu.Item {...props} className="cheese-menu-item" />;
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
export function Pagination({
  page,
  count,
  onPageChange,
}: {
  page: number;
  count: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <nav className="cheese-pagination" aria-label="페이지 탐색">
      <Button
        variant="weak"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        이전
      </Button>
      <span aria-live="polite">
        {page} / {count}
      </span>
      <Button
        variant="weak"
        size="sm"
        disabled={page >= count}
        onClick={() => onPageChange(page + 1)}
      >
        다음
      </Button>
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
            {i < current ? "✓" : i + 1}
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
export function Toggle(
  props: React.ComponentPropsWithoutRef<typeof P.Toggle.Root>,
) {
  return <P.Toggle.Root {...props} className="cheese-toggle" />;
}
export function ToggleGroup(
  props: React.ComponentPropsWithoutRef<typeof P.ToggleGroup.Root>,
) {
  return <P.ToggleGroup.Root {...props} className="cheese-toggle-group" />;
}
export function ToggleGroupItem(
  props: React.ComponentPropsWithoutRef<typeof P.ToggleGroup.Item>,
) {
  return <P.ToggleGroup.Item {...props} className="cheese-toggle" />;
}
export const ToastProvider = P.Toast.Provider;
export function Toast({
  title,
  description,
  ...props
}: React.ComponentPropsWithoutRef<typeof P.Toast.Root> & {
  title: string;
  description?: string;
}) {
  return (
    <P.Toast.Root {...props} className="cheese-toast">
      <P.Toast.Title className="cheese-toast-title">{title}</P.Toast.Title>
      {description && (
        <P.Toast.Description className="cheese-toast-description">
          {description}
        </P.Toast.Description>
      )}
      <P.Toast.Close asChild>
        <Button variant="ghost" size="sm">
          닫기
        </Button>
      </P.Toast.Close>
    </P.Toast.Root>
  );
}
export function ToastViewport() {
  return <P.Toast.Viewport className="cheese-toast-viewport" />;
}
export function ScrollArea({
  children,
  height = 180,
}: {
  children: React.ReactNode;
  height?: number;
}) {
  return (
    <P.ScrollArea.Root className="cheese-scroll-area" style={{ height }}>
      <P.ScrollArea.Viewport className="cheese-scroll-viewport" tabIndex={0}>
        {children}
      </P.ScrollArea.Viewport>
      <P.ScrollArea.Scrollbar
        orientation="vertical"
        className="cheese-scrollbar"
      >
        <P.ScrollArea.Thumb className="cheese-scroll-thumb" />
      </P.ScrollArea.Scrollbar>
    </P.ScrollArea.Root>
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
