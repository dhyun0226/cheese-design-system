"use client";
import * as React from "react";
import { RadioGroup } from "radix-ui";
import {
  Check,
  X,
  Pencil,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useFieldValue } from "./Collections.js";
import { DateField } from "./DateField.js";
import { TimeField } from "./TimeField.js";

export interface PinInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "size"
> {
  label: string;
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onComplete?: (value: string) => void;
}
export const PinInput = React.forwardRef<HTMLInputElement, PinInputProps>(
  function PinInput(
    {
      label,
      length = 6,
      value,
      defaultValue = "",
      onValueChange,
      onComplete,
      id: provided,
      onInvalid,
      onPaste,
      onFocus,
      onBlur,
      onSelect,
      onKeyUp,
      className,
      "aria-describedby": describedBy,
      ...props
    },
    ref,
  ) {
    const auto = React.useId(),
      id = provided || auto,
      size = Number.isFinite(length)
        ? Math.min(12, Math.max(1, Math.floor(length)))
        : 6;
    const [code, setCode, root] = useFieldValue(
      value,
      defaultValue,
      onValueChange,
      props.form,
    );
    const input = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => input.current!);
    const [validationError, setValidationError] = React.useState("");
    const [selection, setSelection] = React.useState({ start: 0, end: 0 });
    const syncSelection = () => {
      const node = input.current;
      if (node) {
        node.scrollLeft = 0;
        setSelection({
          start: node.selectionStart ?? 0,
          end: node.selectionEnd ?? 0,
        });
      }
    };
    React.useLayoutEffect(syncSelection, [code]);
    const updateCode = (next: string, caret: number) => {
      if (input.current?.matches(":disabled") || input.current?.readOnly)
        return;
      setValidationError("");
      setCode(next);
      if (input.current) {
        input.current.value = next;
        input.current.setSelectionRange(caret, caret);
        syncSelection();
      }
      if (next.length === size && next !== code) onComplete?.(next);
    };
    React.useEffect(
      () => setValidationError(""),
      [code, props.disabled, props.readOnly],
    );
    React.useEffect(() => {
      const owner = input.current?.form;
      const timers = new Set<ReturnType<typeof setTimeout>>();
      const reset = (event: Event) => {
        const timer = setTimeout(() => {
          timers.delete(timer);
          if (!event.defaultPrevented) setValidationError("");
        }, 0);
        timers.add(timer);
      };
      owner?.addEventListener("reset", reset);
      return () => {
        owner?.removeEventListener("reset", reset);
        timers.forEach(clearTimeout);
      };
    }, [props.form]);
    return (
      <div ref={root} className="cheese-field">
        <label htmlFor={id} className="cheese-label">
          {label}
        </label>
        <div
          className="cheese-pin-control"
          data-compact={size > 8 || undefined}
          style={{ "--cheese-pin-length": size } as React.CSSProperties}
        >
          <input
            {...props}
            ref={input}
            id={id}
            className={["cheese-input cheese-pin-input", className]
              .filter(Boolean)
              .join(" ")}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern={"[0-9]{" + size + "}"}
            maxLength={size}
            value={code}
            aria-invalid={validationError ? true : props["aria-invalid"]}
            aria-describedby={[
              describedBy,
              id + "-help",
              validationError ? id + "-error" : undefined,
            ]
              .filter(Boolean)
              .join(" ")}
            onChange={(e) => {
              const next = e.target.value.replace(/[^0-9]/g, "").slice(0, size);
              const caret = Math.min(
                e.target.value
                  .slice(0, e.target.selectionStart ?? e.target.value.length)
                  .replace(/[^0-9]/g, "").length,
                size,
              );
              updateCode(next, caret);
            }}
            onPaste={(event) => {
              onPaste?.(event);
              if (event.defaultPrevented) return;
              event.preventDefault();
              const node = event.currentTarget;
              if (node.matches(":disabled") || node.readOnly) return;
              const start = node.selectionStart ?? code.length;
              const end = node.selectionEnd ?? start;
              const digits = (
                event.clipboardData.getData("text/plain") ||
                event.clipboardData.getData("text")
              ).replace(/[^0-9]/g, "");
              if (!digits) return;
              const inserted = digits.slice(
                0,
                Math.max(0, size - (code.length - (end - start))),
              );
              const next = code.slice(0, start) + inserted + code.slice(end);
              const caret = start + inserted.length;
              if (next === code) {
                node.setSelectionRange(caret, caret);
                syncSelection();
                return;
              }
              // Bypass React's instance value tracker so the native input event
              // follows the same onChange path as typing, exactly once.
              const nativeValue = Object.getOwnPropertyDescriptor(
                HTMLInputElement.prototype,
                "value",
              );
              nativeValue!.set!.call(node, next);
              node.setSelectionRange(caret, caret);
              node.dispatchEvent(
                new InputEvent("input", {
                  bubbles: true,
                  composed: true,
                  inputType: "insertFromPaste",
                  data: inserted,
                }),
              );
            }}
            onFocus={(event) => {
              syncSelection();
              onFocus?.(event);
            }}
            onBlur={onBlur}
            onSelect={(event) => {
              syncSelection();
              onSelect?.(event);
            }}
            onKeyUp={(event) => {
              syncSelection();
              onKeyUp?.(event);
            }}
            onInvalid={(event) => {
              event.preventDefault();
              setValidationError(
                event.currentTarget.validity.valueMissing
                  ? "인증 코드를 입력해 주세요."
                  : `숫자 ${size}자리 인증 코드를 입력해 주세요.`,
              );
              const node = event.currentTarget;
              const first =
                node.form &&
                Array.from(node.form.elements).find((element) => {
                  const control = element as HTMLInputElement;
                  return (
                    control.willValidate &&
                    control.validity &&
                    !control.validity.valid
                  );
                });
              if (!first || first === node) node.focus();
              onInvalid?.(event);
            }}
          />
          <div className="cheese-pin-slots" aria-hidden="true">
            {Array.from({ length: size }, (_, index) => (
              <span
                key={index}
                className="cheese-pin-slot"
                data-active={
                  Math.min(selection.start, size - 1) === index || undefined
                }
                data-selected={
                  (index >= selection.start && index < selection.end) ||
                  undefined
                }
                data-empty={!code[index] || undefined}
              >
                {code[index] && <span>{code[index]}</span>}
              </span>
            ))}
          </div>
        </div>
        <p id={id + "-help"} className="cheese-help">
          숫자 {size}자리 · 코드를 붙여넣을 수 있습니다.
        </p>
        {validationError && (
          <p
            id={id + "-error"}
            className="cheese-help"
            data-error="true"
            role="alert"
          >
            {validationError}
          </p>
        )}
      </div>
    );
  },
);

export interface TagsInputProps {
  label: string;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  name?: string;
  disabled?: boolean;
  max?: number;
  placeholder?: string;
}
export function TagsInput({
  label,
  value,
  defaultValue = [],
  onValueChange,
  name,
  disabled,
  max = 10,
  placeholder = "입력 후 Enter",
}: TagsInputProps) {
  const [tags, setTags, root] = useFieldValue(
    value,
    defaultValue,
    onValueChange,
  );
  const [draft, setDraft] = React.useState(""),
    [message, setMessage] = React.useState("");
  const input = React.useRef<HTMLInputElement>(null),
    id = React.useId();
  const remove = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
    setMessage(tag + " 삭제됨");
    input.current?.focus();
  };
  const add = () => {
    const tag = draft.trim();
    if (!tag) return;
    if (tags.includes(tag)) {
      setMessage("이미 추가된 태그입니다.");
      return;
    }
    if (tags.length >= max) {
      setMessage(`최대 ${max}개까지 추가할 수 있습니다.`);
      return;
    }
    setTags([...tags, tag]);
    setDraft("");
    setMessage(tag + " 추가됨");
  };
  return (
    <div ref={root} className="cheese-field">
      <label className="cheese-label" htmlFor={id}>
        {label}
      </label>
      <div className="cheese-tags" data-disabled={disabled || undefined}>
        {tags.map((tag) => (
          <span className="cheese-tag" key={tag}>
            {tag}
            <button
              type="button"
              disabled={disabled}
              aria-label={tag + " 삭제"}
              onClick={() => remove(tag)}
            >
              <X size={14} aria-hidden="true" />
            </button>
            {name && (
              <input
                type="hidden"
                name={name}
                value={tag}
                disabled={disabled}
              />
            )}
          </span>
        ))}
        <input
          id={id}
          ref={input}
          disabled={disabled}
          value={draft}
          placeholder={placeholder}
          aria-describedby={id + "-help"}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            } else if (e.key === "Backspace" && !draft && tags.length) {
              e.preventDefault();
              remove(tags[tags.length - 1]);
            }
          }}
        />
      </div>
      <p id={id + "-help"} className="cheese-help">
        Enter로 추가 · 빈 입력에서 Backspace로 마지막 태그 삭제 · 최대 {max}개
      </p>
      <span className="cheese-help" role="status">
        {message}
      </span>
    </div>
  );
}

export interface EditableProps {
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  name?: string;
  required?: boolean;
}
export function Editable({
  label,
  value,
  defaultValue = "",
  onValueChange,
  disabled,
  placeholder = "내용을 입력하세요",
  name,
  required,
}: EditableProps) {
  const [text, setText, root] = useFieldValue(
      value,
      defaultValue,
      onValueChange,
    ),
    [editing, setEditing] = React.useState(false),
    [draft, setDraft] = React.useState(""),
    [error, setError] = React.useState("");
  const input = React.useRef<HTMLInputElement>(null),
    trigger = React.useRef<HTMLButtonElement>(null),
    id = React.useId();
  React.useEffect(() => {
    if (editing) {
      input.current?.focus();
      input.current?.select();
    }
  }, [editing]);
  const finish = (save: boolean) => {
    if (save && required && !draft.trim()) {
      setError("내용을 입력해 주세요.");
      input.current?.focus();
      return;
    }
    setError("");
    if (save) setText(draft.trim());
    setEditing(false);
    requestAnimationFrame(() => trigger.current?.focus());
  };
  return (
    <div ref={root} className="cheese-field">
      <span className="cheese-label" id={id}>
        {label}
      </span>
      {editing ? (
        <div className="cheese-editable-controls">
          <input
            ref={input}
            className="cheese-input"
            aria-labelledby={id}
            aria-invalid={!!error}
            aria-describedby={error ? id + "-error" : undefined}
            value={draft}
            required={required}
            disabled={disabled}
            onChange={(e) => {
              setDraft(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing) return;
              if (e.key === "Enter" || e.key === "Escape") {
                e.preventDefault();
                finish(e.key === "Enter");
              }
            }}
          />
          <button
            className="cheese-icon-button"
            type="button"
            disabled={disabled}
            aria-label="변경 저장"
            onClick={() => finish(true)}
          >
            <Check size={18} />
          </button>
          <button
            className="cheese-icon-button"
            type="button"
            aria-label="변경 취소"
            onClick={() => finish(false)}
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <button
          ref={trigger}
          type="button"
          disabled={disabled}
          className="cheese-editable-preview"
          aria-label={label + " 수정"}
          onClick={() => {
            setDraft(text);
            setEditing(true);
          }}
        >
          {text || placeholder}
          <Pencil size={16} aria-hidden="true" />
        </button>
      )}
      {error && (
        <p id={id + "-error"} className="cheese-help" role="alert">
          {error}
        </p>
      )}
      {name && (
        <input type="hidden" name={name} value={text} disabled={disabled} />
      )}
    </div>
  );
}

export interface RatingProps {
  label: string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  max?: number;
  name?: string;
  disabled?: boolean;
  required?: boolean;
}
export function Rating({
  label,
  value,
  defaultValue = 0,
  onValueChange,
  max = 5,
  name,
  disabled,
  required,
}: RatingProps) {
  const [rating, setRating, root] = useFieldValue(
      value,
      defaultValue,
      onValueChange,
    ),
    count = Math.min(10, Math.max(1, max));
  const id = React.useId();
  return (
    <div className="cheese-field" ref={root}>
      <span id={id} className="cheese-label">
        {label}
      </span>
      <RadioGroup.Root
        className="cheese-rating"
        aria-labelledby={id}
        value={String(rating)}
        onValueChange={(v) => setRating(Number(v))}
        name={name}
        disabled={disabled}
        required={required}
        orientation="horizontal"
        onKeyDown={(event) => {
          if (
            disabled ||
            !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
          )
            return;
          const current =
            Number(
              (event.target as HTMLElement)
                .closest('[role="radio"]')
                ?.getAttribute("value"),
            ) || rating;
          const next =
            event.key === "Home"
              ? 1
              : event.key === "End"
                ? count
                : ((current -
                    1 +
                    (event.key === "ArrowRight" ? 1 : -1) +
                    count) %
                    count) +
                  1;
          event.preventDefault();
          setRating(next);
          root.current
            ?.querySelector<HTMLButtonElement>(
              `[role="radio"][value="${next}"]`,
            )
            ?.focus();
        }}
      >
        {Array.from({ length: count }, (_, i) => (
          <RadioGroup.Item
            key={i}
            value={String(i + 1)}
            className="cheese-rating-item"
            aria-label={i + 1 + "점"}
            data-filled={i < rating}
          >
            <Star size={26} aria-hidden="true" />
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
      <p className="cheese-help" role="status">
        {rating ? `${count}점 중 ${rating}점` : "평점을 선택하세요."}
      </p>
    </div>
  );
}
export interface ColorSwatch {
  value: string;
  label: string;
}
export const brandSwatches: ColorSwatch[] = [
  { value: "#FFC928", label: "Cheese Gold" },
  { value: "#111111", label: "Space Black" },
  { value: "#FFFFFF", label: "Lunar White" },
  { value: "#F4F4F0", label: "Moon Gray" },
];
export interface ColorPickerProps {
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  swatches?: ColorSwatch[];
  disabled?: boolean;
  name?: string;
}
export function ColorPicker({
  label,
  value,
  defaultValue = "#FFC928",
  onValueChange,
  swatches = brandSwatches,
  disabled,
  name,
}: ColorPickerProps) {
  const [color, setColor, root] = useFieldValue(
      value,
      defaultValue,
      onValueChange,
    ),
    id = React.useId();
  return (
    <div ref={root} className="cheese-field">
      <span id={id} className="cheese-label">
        {label}
      </span>
      <RadioGroup.Root
        className="cheese-swatches"
        aria-labelledby={id}
        value={color}
        onValueChange={setColor}
        disabled={disabled}
        name={name}
        orientation="horizontal"
      >
        {swatches.map((s) => (
          <RadioGroup.Item
            key={s.value}
            value={s.value}
            className="cheese-swatch"
            aria-label={s.label}
            style={{ "--swatch": s.value } as React.CSSProperties}
          >
            <RadioGroup.Indicator className="cheese-swatch-check">
              <Check size={14} aria-hidden="true" />
            </RadioGroup.Indicator>
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
      <p className="cheese-help" role="status">
        {swatches.find((s) => s.value === color)?.label} · {color}
      </p>
    </div>
  );
}

export interface RangeFieldValue {
  start: string;
  end: string;
}
export interface RangeFieldProps {
  label: string;
  value?: RangeFieldValue;
  defaultValue?: RangeFieldValue;
  onValueChange?: (value: RangeFieldValue) => void;
  name?: string;
  form?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  min?: string;
  max?: string;
  step?: number;
}
function RangeField({
  type,
  label,
  value,
  defaultValue = { start: "", end: "" },
  onValueChange,
  name,
  form,
  disabled,
  readOnly,
  required,
  min,
  max,
  step,
}: RangeFieldProps & { type: "date" | "time" }) {
  const [range, setRange, root] = useFieldValue(
      value,
      defaultValue,
      onValueChange,
      form,
    ),
    id = React.useId();
  const validShape = (value: string) => {
    if (type === "time")
      return /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(0);
    date.setUTCFullYear(year, month - 1, day);
    return (
      year >= 1 &&
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  };
  const timeOrder = (value: string) => {
    const [h, m, s = 0] = value.split(":").map(Number);
    return h * 3600 + m * 60 + s;
  };
  const invalid =
    validShape(range.start) &&
    validShape(range.end) &&
    (type === "time"
      ? timeOrder(range.end) < timeOrder(range.start)
      : range.end < range.start);
  const Control = type === "date" ? DateField : TimeField;
  return (
    <div ref={root}>
      <fieldset className="cheese-range-field" disabled={disabled}>
        <legend className="cheese-label">{label}</legend>
        <div className="cheese-range-inputs">
          {(["start", "end"] as const).map((key) => (
            <Control
              key={key}
              label={key === "start" ? "시작" : "종료"}
              id={id + key}
              value={range[key]}
              defaultValue={defaultValue[key]}
              name={name ? name + "." + key : undefined}
              form={form}
              disabled={disabled}
              readOnly={readOnly}
              required={required}
              min={min}
              max={max}
              step={step}
              error={
                key === "end" && invalid
                  ? "종료는 시작보다 빠를 수 없습니다."
                  : undefined
              }
              onValueChange={(next) => setRange({ ...range, [key]: next })}
            />
          ))}
        </div>
      </fieldset>
    </div>
  );
}
export function DateRangeField(props: RangeFieldProps) {
  return <RangeField {...props} type="date" />;
}
/** Same-day time interval. Overnight intervals require explicit dates at product level. */
export function TimeRangeField(props: RangeFieldProps) {
  return <RangeField {...props} type="time" />;
}

export interface MonthPickerProps {
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  name?: string;
}
export function MonthPicker({
  label,
  value,
  defaultValue = "",
  onValueChange,
  min,
  max,
  disabled,
  name,
}: MonthPickerProps) {
  const [month, setMonth, root] = useFieldValue(
    value,
    defaultValue,
    onValueChange,
  );
  const [year, setYear] = React.useState(
    () =>
      Number((value || defaultValue).slice(0, 4)) || new Date().getFullYear(),
  );
  const id = React.useId();
  React.useEffect(() => {
    if (month) setYear(Number(month.slice(0, 4)));
  }, [month]);
  return (
    <div ref={root} className="cheese-period-picker">
      <span className="cheese-label" id={id}>
        {label}
      </span>
      <div className="cheese-period-heading">
        <button
          type="button"
          className="cheese-icon-button"
          aria-label="이전 연도"
          disabled={disabled || (!!min && year <= Number(min.slice(0, 4)))}
          onClick={() => setYear(year - 1)}
        >
          <ChevronLeft size={18} />
        </button>
        <span aria-live="polite">{year}년</span>
        <button
          type="button"
          className="cheese-icon-button"
          aria-label="다음 연도"
          disabled={disabled || (!!max && year >= Number(max.slice(0, 4)))}
          onClick={() => setYear(year + 1)}
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <RadioGroup.Root
        className="cheese-period-grid"
        aria-labelledby={id}
        value={month}
        onValueChange={setMonth}
        disabled={disabled}
        name={name}
      >
        {Array.from({ length: 12 }, (_, i) => {
          const key = `${year}-${String(i + 1).padStart(2, "0")}`;
          return (
            <RadioGroup.Item
              className="cheese-period-item"
              key={key}
              value={key}
              aria-label={`${year}년 ${i + 1}월`}
              disabled={(!!min && key < min) || (!!max && key > max)}
            >
              {i + 1}월
            </RadioGroup.Item>
          );
        })}
      </RadioGroup.Root>
    </div>
  );
}
export interface YearPickerProps {
  label: string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  name?: string;
}
export function YearPicker({
  label,
  value,
  defaultValue = new Date().getFullYear(),
  onValueChange,
  min = 1900,
  max = 2100,
  disabled,
  name,
}: YearPickerProps) {
  const [year, setYear, root] = useFieldValue(
      value,
      defaultValue,
      onValueChange,
    ),
    [start, setStart] = React.useState(
      () => Math.floor((value ?? defaultValue) / 12) * 12,
    ),
    id = React.useId();
  React.useEffect(() => setStart(Math.floor(year / 12) * 12), [year]);
  return (
    <div ref={root} className="cheese-period-picker">
      <span className="cheese-label" id={id}>
        {label}
      </span>
      <div className="cheese-period-heading">
        <button
          type="button"
          className="cheese-icon-button"
          aria-label="이전 연도 범위"
          disabled={disabled || start <= min}
          onClick={() => setStart(start - 12)}
        >
          <ChevronLeft size={18} />
        </button>
        <span aria-live="polite">
          {start}–{start + 11}
        </span>
        <button
          type="button"
          className="cheese-icon-button"
          aria-label="다음 연도 범위"
          disabled={disabled || start + 11 >= max}
          onClick={() => setStart(start + 12)}
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <RadioGroup.Root
        className="cheese-period-grid"
        aria-labelledby={id}
        value={String(year)}
        onValueChange={(v) => setYear(Number(v))}
        disabled={disabled}
        name={name}
      >
        {Array.from({ length: 12 }, (_, i) => (
          <RadioGroup.Item
            key={start + i}
            className="cheese-period-item"
            value={String(start + i)}
            disabled={start + i < min || start + i > max}
          >
            {start + i}
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </div>
  );
}
