"use client";
import * as React from "react";
import { useFieldBlur } from "./useFieldBlur.js";
import { Popover } from "radix-ui";
import { Clock } from "lucide-react";

/** A same-day, 24-hour time. Step is measured in whole seconds; its fixed
 * origin is min, then defaultValue, then midnight (never the mutable value). */
export interface TimeFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  | "type"
  | "value"
  | "defaultValue"
  | "min"
  | "max"
  | "step"
  | "size"
  | "onChange"
> {
  label: string;
  value?: string;
  defaultValue?: string;
  /** Receives both typed drafts and committed picker values. Use with value for controlled input. */
  onValueChange?: (value: string) => void;
  min?: string;
  max?: string;
  step?: number;
  description?: string;
  error?: string;
}

function seconds(value?: string) {
  if (!value || !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value))
    return undefined;
  const [h, m, s = 0] = value.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}
function format(value: number, withSeconds: boolean) {
  const parts = [Math.floor(value / 3600), Math.floor((value % 3600) / 60)];
  if (withSeconds) parts.push(value % 60);
  return parts.map((part) => String(part).padStart(2, "0")).join(":");
}
function part(value: number, column: number) {
  return column === 0
    ? Math.floor(value / 3600)
    : column === 1
      ? Math.floor((value % 3600) / 60)
      : value % 60;
}

export const TimeField = React.forwardRef<HTMLInputElement, TimeFieldProps>(
  function TimeField(
    {
      label,
      value,
      defaultValue = "",
      onValueChange,
      min,
      max,
      step = 60,
      description,
      error,
      id: providedId,
      name,
      form,
      disabled,
      readOnly,
      required,
      className,
      onBlur,
      onInvalid,
      onKeyDown,
      "aria-describedby": describedBy,
      ...inputProps
    },
    forwardedRef,
  ) {
    const autoId = React.useId();
    const id = providedId || autoId;
    const input = React.useRef<HTMLInputElement>(null);
    const shouldRevealOnBlur = useFieldBlur(input);
    React.useImperativeHandle(forwardedRef, () => input.current!);
    const [local, setLocal] = React.useState(defaultValue);
    const current = value ?? local;
    const [open, setOpen] = React.useState(false);
    const [touched, setTouched] = React.useState(false);
    const [nativeError, setNativeError] = React.useState("");
    const [draft, setDraft] = React.useState(0);
    const lists = React.useRef<(HTMLDivElement | null)[]>([]);
    const lower = seconds(min) ?? 0,
      upper = seconds(max) ?? 86399;
    const origin = seconds(min) ?? seconds(defaultValue) ?? 0;
    const validConfig =
      Number.isInteger(step) &&
      step > 0 &&
      step <= 86400 &&
      (!min || seconds(min) !== undefined) &&
      (!max || seconds(max) !== undefined) &&
      lower <= upper;
    const withSeconds =
      step % 60 !== 0 ||
      origin % 60 !== 0 ||
      (upper % 60 !== 59 && upper % 60 !== 0);
    const times = React.useMemo(() => {
      if (!validConfig) return [];
      const first = lower + ((((origin - lower) % step) + step) % step);
      const result: number[] = [];
      for (let n = first; n <= upper; n += step) result.push(n);
      return result;
    }, [lower, upper, origin, step, validConfig]);
    const validation = (() => {
      if (disabled || readOnly) return "";
      if (error) return error;
      if (!current) return required ? "시간을 입력해 주세요." : "";
      const n = seconds(current);
      if (n === undefined)
        return `${withSeconds ? "HH:mm:ss" : "HH:mm"} 형식의 24시간 시간을 입력해 주세요.`;
      if (!validConfig || !times.length)
        return "선택 가능한 시간 범위를 확인해 주세요.";
      if (n < lower || n > upper)
        return `${format(lower, withSeconds)}–${format(upper, withSeconds)} 사이의 시간을 입력해 주세요.`;
      if ((n - origin) % step !== 0)
        return `${format(origin, withSeconds)} 기준 ${step % 60 ? `${step}초` : `${step / 60}분`} 간격으로 입력해 주세요.`;
      return "";
    })();
    const visibleError = error || (touched ? validation || nativeError : "");
    const hint = visibleError || description;
    const hintId = id + "-hint";
    const descriptionIds =
      [describedBy, hint ? hintId : undefined].filter(Boolean).join(" ") ||
      undefined;
    React.useEffect(() => {
      input.current?.setCustomValidity(validation);
    }, [validation]);
    React.useEffect(() => {
      if (disabled || readOnly) setOpen(false);
    }, [disabled, readOnly]);
    React.useEffect(() => {
      const owner = input.current?.form;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const reset = (event: Event) => {
        timer = setTimeout(() => {
          if (event.defaultPrevented) return;
          if (value === undefined) setLocal(defaultValue);
          if (input.current) input.current.value = value ?? defaultValue;
          setTouched(false);
          setNativeError("");
          setOpen(false);
        }, 0);
      };
      owner?.addEventListener("reset", reset);
      return () => {
        owner?.removeEventListener("reset", reset);
        clearTimeout(timer);
      };
    }, [form, value, defaultValue]);
    const change = (next: string) => {
      setNativeError("");
      if (value === undefined) setLocal(next);
      onValueChange?.(next);
    };
    const show = (next: boolean) => {
      if (disabled || readOnly) return;
      if (next) {
        const n = seconds(current);
        setDraft(
          n !== undefined && times.includes(n)
            ? n
            : (times.find((t) => t >= (n ?? lower)) ?? times[0] ?? 0),
        );
      }
      setOpen(next);
    };
    const optionsFor = (column: number) =>
      Array.from(
        new Set(
          times
            .filter((n) => column === 0 || part(n, 0) === part(draft, 0))
            .filter((n) => column < 2 || part(n, 1) === part(draft, 1))
            .map((n) => part(n, column)),
        ),
      );
    const selectPart = (column: number, next: number) => {
      const candidates = times.filter(
        (n) =>
          part(n, column) === next &&
          (column === 0 || part(n, 0) === part(draft, 0)) &&
          (column < 2 || part(n, 1) === part(draft, 1)),
      );
      const matching = candidates.find((n) =>
        column === 0
          ? part(n, 1) === part(draft, 1) && part(n, 2) === part(draft, 2)
          : column === 1
            ? part(n, 2) === part(draft, 2)
            : true,
      );
      if (candidates.length) setDraft(matching ?? candidates[0]);
    };
    React.useEffect(() => {
      if (open && times.length && !times.includes(draft)) setDraft(times[0]);
    }, [open, times, draft]);
    React.useEffect(() => {
      if (open)
        lists.current.forEach((list) =>
          list
            ?.querySelector('[aria-selected="true"]')
            ?.scrollIntoView({ block: "nearest" }),
        );
    }, [open, draft]);
    return (
      <div className="cheese-field cheese-time-field">
        <label className="cheese-label" htmlFor={id}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
        <Popover.Root open={open} onOpenChange={show}>
          <div className="cheese-time-control">
            <input
              {...inputProps}
              ref={input}
              id={id}
              type="text"
              inputMode="text"
              className={["cheese-input cheese-time-input", className]
                .filter(Boolean)
                .join(" ")}
              name={name}
              form={form}
              value={current}
              disabled={disabled}
              readOnly={readOnly}
              required={required}
              placeholder={
                inputProps.placeholder ?? (withSeconds ? "HH:mm:ss" : "HH:mm")
              }
              aria-invalid={!!visibleError}
              aria-describedby={descriptionIds}
              onChange={(event) => change(event.target.value)}
              onBlur={(event) => {
                if (shouldRevealOnBlur(event)) setTouched(true);
                onBlur?.(event);
              }}
              onInvalid={(event) => {
                onInvalid?.(event);
                const handled = event.defaultPrevented;
                event.preventDefault();
                setNativeError(
                  validation ? "" : event.currentTarget.validationMessage,
                );
                setTouched(true);
                const node = input.current;
                const first = Array.from(node?.form?.elements ?? []).find(
                  (element) => {
                    const control = element as HTMLInputElement;
                    return control.willValidate && !control.validity.valid;
                  },
                );
                if (!handled && (!first || first === node)) node?.focus();
              }}
              onKeyDown={(event) => {
                onKeyDown?.(event);
                if (
                  !event.defaultPrevented &&
                  !event.nativeEvent.isComposing &&
                  event.key === "ArrowDown" &&
                  !disabled &&
                  !readOnly
                ) {
                  event.preventDefault();
                  show(true);
                }
              }}
            />
            <Popover.Trigger asChild>
              <button
                className="cheese-icon-button cheese-time-trigger"
                type="button"
                disabled={disabled || readOnly}
                aria-label={`${label} 시간 선택`}
              >
                <Clock size={18} aria-hidden="true" />
              </button>
            </Popover.Trigger>
          </div>
          <Popover.Portal>
            <Popover.Content
              className="cheese-root cheese-time-popover"
              sideOffset={8}
              align="start"
              collisionPadding={12}
              aria-label={`${label} 시간 선택`}
              onOpenAutoFocus={(event) => {
                if (times.length) {
                  event.preventDefault();
                  lists.current[0]?.focus();
                  lists.current.forEach((list) =>
                    list
                      ?.querySelector('[aria-selected="true"]')
                      ?.scrollIntoView({ block: "nearest" }),
                  );
                }
              }}
            >
              <div className="cheese-time-heading">
                <span>{label}</span>
                <output aria-live="polite">
                  {times.length ? format(draft, withSeconds) : "—"}
                </output>
              </div>
              {times.length ? (
                <div className="cheese-time-columns">
                  {(withSeconds ? ["시", "분", "초"] : ["시", "분"]).map(
                    (title, column) => {
                      const options = optionsFor(column);
                      return (
                        <div className="cheese-time-column" key={title}>
                          <span
                            className="cheese-time-column-label"
                            id={`${id}-column-${column}`}
                          >
                            {title}
                          </span>
                          <div
                            className="cheese-time-list"
                            role="listbox"
                            tabIndex={0}
                            ref={(node) => {
                              lists.current[column] = node;
                            }}
                            aria-labelledby={`${id}-column-${column}`}
                            aria-activedescendant={`${id}-option-${column}-${part(draft, column)}`}
                            onKeyDown={(event) => {
                              if (
                                ![
                                  "ArrowUp",
                                  "ArrowDown",
                                  "Home",
                                  "End",
                                ].includes(event.key)
                              )
                                return;
                              event.preventDefault();
                              const index = options.indexOf(
                                part(draft, column),
                              );
                              const next =
                                event.key === "Home"
                                  ? 0
                                  : event.key === "End"
                                    ? options.length - 1
                                    : Math.max(
                                        0,
                                        Math.min(
                                          options.length - 1,
                                          index +
                                            (event.key === "ArrowDown"
                                              ? 1
                                              : -1),
                                        ),
                                      );
                              selectPart(column, options[next]);
                            }}
                          >
                            {options.map((option) => (
                              <div
                                key={option}
                                id={`${id}-option-${column}-${option}`}
                                className="cheese-time-option"
                                role="option"
                                aria-selected={part(draft, column) === option}
                                onClick={() => {
                                  selectPart(column, option);
                                  lists.current[column]?.focus();
                                }}
                              >
                                {String(option).padStart(2, "0")}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              ) : (
                <p className="cheese-help" role="status">
                  선택 가능한 시간이 없습니다. 시간 범위와 간격을 확인해 주세요.
                </p>
              )}
              <div className="cheese-time-actions">
                <Popover.Close asChild>
                  <button
                    type="button"
                    className="cheese-button"
                    data-variant="ghost"
                    data-size="sm"
                  >
                    취소
                  </button>
                </Popover.Close>
                <button
                  type="button"
                  className="cheese-button"
                  data-variant="accent"
                  data-size="sm"
                  disabled={!times.includes(draft)}
                  onClick={() => {
                    if (!times.includes(draft)) return;
                    change(format(draft, withSeconds));
                    setTouched(true);
                    setOpen(false);
                  }}
                >
                  적용
                </button>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
        {hint && (
          <p
            className="cheese-help"
            id={hintId}
            data-error={!!visibleError}
            role={visibleError ? "alert" : undefined}
          >
            {hint}
          </p>
        )}
      </div>
    );
  },
);
