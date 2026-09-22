import * as React from "react";
import {
  DayPicker,
  type DayPickerProps,
  type DateRange,
  type ChevronProps,
} from "react-day-picker";
import { ko } from "react-day-picker/locale";
import { Popover } from "radix-ui";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
export type { DateRange };
function CalendarChevron({ orientation, className }: ChevronProps) {
  const Icon =
    orientation === "left"
      ? ChevronLeft
      : orientation === "up"
        ? ChevronUp
        : orientation === "down"
          ? ChevronDown
          : ChevronRight;
  return <Icon size={16} className={className} aria-hidden="true" />;
}
export function Calendar(props: DayPickerProps) {
  return (
    <DayPicker
      locale={ko}
      showOutsideDays
      labels={{ labelNext: () => "다음 달", labelPrevious: () => "이전 달" }}
      {...props}
      components={{ Chevron: CalendarChevron, ...props.components }}
      className={["cheese-calendar", props.className].filter(Boolean).join(" ")}
    />
  );
}
export function formatDate(value: Date) {
  return [
    value.getFullYear(),
    String(value.getMonth() + 1).padStart(2, "0"),
    String(value.getDate()).padStart(2, "0"),
  ].join("-");
}
export interface DatePickerProps {
  label: string;
  value?: Date | null;
  defaultValue?: Date;
  onValueChange?: (date: Date | undefined) => void;
  min?: Date;
  max?: Date;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  description?: string;
  error?: string;
  name?: string;
  form?: string;
  id?: string;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
}
export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  function DatePicker(
    {
      label,
      value,
      defaultValue,
      onValueChange,
      min,
      max,
      disabled,
      readOnly,
      required,
      description,
      error,
      name,
      form,
      id: providedId,
      onBlur,
    },
    forwardedRef,
  ) {
    const [local, setLocal] = React.useState<Date | undefined>(defaultValue),
      [open, setOpen] = React.useState(false),
      [validationError, setValidationError] = React.useState("");
    const trigger = React.useRef<HTMLButtonElement>(null);
    const input = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(forwardedRef, () => trigger.current!);
    const autoId = React.useId(),
      id = providedId ?? autoId;
    const selected = value === undefined ? local : (value ?? undefined);
    const hint = error || validationError || description;

    React.useEffect(() => {
      const owner = input.current?.form;
      if (!owner) return;
      const reset = (event: Event) => {
        // Respect an application's preventDefault() and controlled-state ownership.
        // A browser may flush microtasks between native listeners. Wait until
        // React's delegated onReset has also had a chance to cancel the event.
        setTimeout(() => {
          if (event.defaultPrevented) return;
          if (value === undefined) {
            setLocal(defaultValue);
            onValueChange?.(defaultValue);
          }
          setValidationError("");
          setOpen(false);
        }, 0);
      };
      owner.addEventListener("reset", reset);
      return () => owner.removeEventListener("reset", reset);
    }, [value, defaultValue, onValueChange, form]);
    React.useEffect(() => {
      setValidationError("");
      if (disabled || readOnly) setOpen(false);
    }, [selected, disabled, readOnly]);

    return (
      <div className="cheese-field">
        <label htmlFor={id} id={id + "-label"} className="cheese-label">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
        {/* A native form control supplies constraint validation and FormData.
          Focus and error announcements belong to the visible trigger. */}
        <input
          ref={input}
          type="date"
          className="cheese-form-proxy"
          tabIndex={-1}
          aria-hidden="true"
          name={name}
          form={form}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          min={min ? formatDate(min) : undefined}
          max={max ? formatDate(max) : undefined}
          value={selected ? formatDate(selected) : ""}
          onChange={() => {}}
          onInvalid={(event) => {
            event.preventDefault();
            setValidationError(
              event.currentTarget.validity.valueMissing
                ? "날짜를 선택해 주세요."
                : "선택 가능한 날짜 범위를 확인해 주세요.",
            );
            trigger.current?.focus();
          }}
        />
        <Popover.Root
          open={open && !disabled && !readOnly}
          onOpenChange={(next) => {
            if (!disabled && !readOnly) setOpen(next);
          }}
        >
          <Popover.Trigger
            ref={trigger}
            id={id}
            type="button"
            disabled={disabled}
            data-readonly={readOnly || undefined}
            onBlur={onBlur}
            className="cheese-input cheese-date-trigger"
            aria-labelledby={id + "-label " + id + "-value"}
            aria-describedby={hint ? id + "-hint" : undefined}
            aria-invalid={!!(error || validationError) || undefined}
          >
            <span id={id + "-value"}>
              {selected ? formatDate(selected) : "날짜 선택"}
            </span>
            <CalendarIcon size={18} aria-hidden="true" />
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              className="cheese-popover cheese-root"
              sideOffset={8}
              aria-label={label + " 달력"}
            >
              <Calendar
                mode="single"
                autoFocus
                selected={selected}
                defaultMonth={selected ?? min}
                startMonth={min}
                endMonth={max}
                disabled={[
                  ...(min ? [{ before: min }] : []),
                  ...(max ? [{ after: max }] : []),
                ]}
                onSelect={(date) => {
                  if (value === undefined) setLocal(date);
                  onValueChange?.(date);
                  setValidationError("");
                  setOpen(false);
                }}
              />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
        {hint && (
          <p
            id={id + "-hint"}
            className="cheese-help"
            data-error={!!(error || validationError)}
            role={error || validationError ? "alert" : undefined}
          >
            {hint}
          </p>
        )}
      </div>
    );
  },
);
