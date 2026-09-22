"use client";
import * as React from "react";
import { Popover } from "radix-ui";
import { CalendarDays } from "lucide-react";
import { Calendar } from "./Calendar.js";
import { useFieldBlur } from "./useFieldBlur.js";

/** A date-only value. Raw drafts are retained so validation never silently clears input. */
export interface DateFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step"
> {
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  min?: string;
  max?: string;
  /** Days, anchored to min, defaultValue or 1970-01-01. */
  step?: number | "any";
  description?: string;
  error?: string;
}

function parse(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return;
  // Civil dates must not depend on DST or skipped local days (e.g. Apia).
  // setUTCFullYear also avoids JavaScript's special treatment of years 00–99.
  const result = new Date(0);
  result.setUTCFullYear(year, month - 1, day);
  if (
    result.getUTCFullYear() === year &&
    result.getUTCMonth() === month - 1 &&
    result.getUTCDate() === day
  )
    return result;
}
function iso(date: Date): string {
  return `${String(date.getUTCFullYear()).padStart(4, "0")}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}
function dayNumber(date: Date): number {
  return Math.floor(date.getTime() / 86400000);
}
function focusInvalid(input: HTMLInputElement) {
  const first =
    input.form &&
    Array.from(input.form.elements).find((element) => {
      const control = element as HTMLInputElement;
      return (
        control.willValidate && control.validity && !control.validity.valid
      );
    });
  if (!first || first === input) input.focus();
}

export const DateField = React.forwardRef<HTMLInputElement, DateFieldProps>(
  function DateField(
    {
      label,
      value,
      defaultValue = "",
      onValueChange,
      min,
      max,
      step = 1,
      description,
      error,
      id: suppliedId,
      name,
      form,
      disabled,
      readOnly,
      required,
      onBlur,
      onInvalid,
      onKeyDown,
      className,
      ...props
    },
    forwardedRef,
  ) {
    const autoId = React.useId(),
      id = suppliedId ?? autoId;
    const input = React.useRef<HTMLInputElement>(null);
    const shouldRevealOnBlur = useFieldBlur(input);
    React.useImperativeHandle(forwardedRef, () => input.current!);
    const [local, setLocal] = React.useState(defaultValue);
    const [open, setOpen] = React.useState(false);
    const [revealed, setRevealed] = React.useState(false);
    const [nativeError, setNativeError] = React.useState("");
    const current = value === undefined ? local : value;
    // Calendar arithmetic stays UTC, while "today" remains the user's local day.
    const now = new Date();
    const localToday = new Date(0);
    localToday.setUTCFullYear(now.getFullYear(), now.getMonth(), now.getDate());
    const minimum = parse(min ?? ""),
      maximum = parse(max ?? "");
    const invalidBounds = !!(
      minimum &&
      maximum &&
      dayNumber(minimum) > dayNumber(maximum)
    );
    const base =
      parse(min ?? "") ?? parse(defaultValue) ?? parse("1970-01-01")!;
    const interval =
      step === "any" ? null : Number.isFinite(step) && step > 0 ? step : 1;
    const validationMessage = (candidate: string): string => {
      if (invalidBounds)
        return "날짜 범위 설정을 확인해 주세요. 최소 날짜가 최대 날짜보다 늦습니다.";
      if (!candidate) return required ? "날짜를 입력해 주세요." : "";
      const date = parse(candidate);
      if (!date)
        return "실제 존재하는 날짜를 YYYY-MM-DD 형식으로 입력해 주세요.";
      if (minimum && dayNumber(date) < dayNumber(minimum))
        return `${min} 이후 날짜를 입력해 주세요.`;
      if (maximum && dayNumber(date) > dayNumber(maximum))
        return `${max} 이전 날짜를 입력해 주세요.`;
      if (interval !== null) {
        const delta = (dayNumber(date) - dayNumber(base)) / interval;
        if (Math.abs(delta - Math.round(delta)) > 1e-7)
          return `${iso(base)}부터 ${interval}일 간격의 날짜를 입력해 주세요.`;
      }
      return "";
    };
    const message =
      error || (revealed ? validationMessage(current) || nativeError : "");
    const hint = message || description;
    const describedBy =
      [props["aria-describedby"], hint ? `${id}-hint` : undefined]
        .filter(Boolean)
        .join(" ") || undefined;
    React.useEffect(() => {
      input.current?.setCustomValidity(
        disabled || readOnly ? "" : error || validationMessage(current),
      );
    });
    React.useEffect(() => {
      if (disabled || readOnly) setOpen(false);
    }, [disabled, readOnly]);
    React.useEffect(
      () => setNativeError(""),
      [current, min, max, step, required, error],
    );
    React.useEffect(() => {
      const owner = input.current?.form;
      if (!owner) return;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const reset = (event: Event) => {
        timer = setTimeout(() => {
          if (event.defaultPrevented) return;
          if (value === undefined) {
            setLocal(defaultValue);
            onValueChange?.(defaultValue);
          }
          if (input.current) {
            const resetValue = value === undefined ? defaultValue : value;
            input.current.value = resetValue;
            input.current.setCustomValidity(
              disabled || readOnly
                ? ""
                : error || validationMessage(resetValue),
            );
          }
          setRevealed(false);
          setNativeError("");
          setOpen(false);
        }, 0);
      };
      owner.addEventListener("reset", reset);
      return () => {
        owner.removeEventListener("reset", reset);
        clearTimeout(timer);
      };
    }, [
      value,
      defaultValue,
      onValueChange,
      form,
      min,
      max,
      step,
      disabled,
      readOnly,
      required,
      error,
    ]);
    const update = (next: string) => {
      if (disabled || readOnly) return;
      setNativeError("");
      if (value === undefined) setLocal(next);
      input.current?.setCustomValidity(error || validationMessage(next));
      onValueChange?.(next);
    };

    return (
      <div className="cheese-field">
        <label htmlFor={id} className="cheese-label">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
        <Popover.Root
          open={open && !disabled && !readOnly && !invalidBounds}
          onOpenChange={(next) => {
            if (!disabled && !readOnly) setOpen(next);
          }}
        >
          <div className="cheese-date-field-control">
            <input
              {...props}
              ref={input}
              id={id}
              name={name}
              form={form}
              type="text"
              inputMode="text"
              autoComplete={props.autoComplete ?? "off"}
              className={["cheese-input cheese-date-field-input", className]
                .filter(Boolean)
                .join(" ")}
              placeholder={props.placeholder ?? "YYYY-MM-DD"}
              value={current}
              disabled={disabled}
              readOnly={readOnly}
              required={required}
              aria-invalid={!!message || undefined}
              aria-describedby={describedBy}
              onChange={(event) => update(event.currentTarget.value)}
              onBlur={(event) => {
                if (shouldRevealOnBlur(event)) setRevealed(true);
                onBlur?.(event);
              }}
              onInvalid={(event) => {
                event.preventDefault();
                setRevealed(true);
                setNativeError(event.currentTarget.validationMessage);
                focusInvalid(event.currentTarget);
                onInvalid?.(event);
              }}
              onKeyDown={(event) => {
                onKeyDown?.(event);
                if (
                  !event.defaultPrevented &&
                  event.altKey &&
                  event.key === "ArrowDown" &&
                  !disabled &&
                  !readOnly
                ) {
                  event.preventDefault();
                  setOpen(true);
                }
              }}
            />
            <Popover.Trigger
              type="button"
              className="cheese-field-action cheese-date-field-action"
              disabled={disabled || readOnly || invalidBounds}
              aria-label={`${label} 달력 열기`}
            >
              <CalendarDays size={18} aria-hidden="true" />
            </Popover.Trigger>
          </div>
          <Popover.Portal>
            <Popover.Content
              className="cheese-popover cheese-root cheese-date-field-popover"
              sideOffset={8}
              collisionPadding={12}
              aria-label={`${label} 달력`}
              aria-labelledby={`${id}-calendar-title`}
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                input.current?.focus();
              }}
            >
              <span id={`${id}-calendar-title`} className="cheese-sr-only">
                {label} 달력
              </span>
              <Calendar
                mode="single"
                timeZone="UTC"
                today={localToday}
                autoFocus
                selected={parse(current)}
                defaultMonth={parse(current) ?? minimum}
                startMonth={minimum}
                endMonth={maximum}
                disabled={(date) => !!validationMessage(iso(date))}
                onSelect={(date) => {
                  if (date) update(iso(date));
                  setRevealed(true);
                  setOpen(false);
                }}
              />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
        {hint && (
          <p
            id={`${id}-hint`}
            className="cheese-help"
            data-error={!!message}
            role={message ? "alert" : undefined}
          >
            {hint}
          </p>
        )}
      </div>
    );
  },
);
