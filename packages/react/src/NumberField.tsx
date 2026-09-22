"use client";
import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { useFieldBlur } from "./useFieldBlur.js";

export interface NumberFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "defaultValue" | "onChange"
> {
  label: string;
  value?: string | number;
  defaultValue?: string | number;
  /** A string preserves empty and decimal edits; parse at the application's boundary. */
  onValueChange?: (value: string) => void;
  description?: string;
  error?: string;
}

function validation(input: HTMLInputElement): string {
  const state = input.validity;
  if (state.badInput) return "숫자를 입력해 주세요.";
  if (state.valueMissing) return "값을 입력해 주세요.";
  if (state.rangeUnderflow) return `${input.min} 이상의 값을 입력해 주세요.`;
  if (state.rangeOverflow) return `${input.max} 이하의 값을 입력해 주세요.`;
  if (state.stepMismatch)
    return `${input.step || 1} 간격에 맞는 값을 입력해 주세요.`;
  return "";
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

export const NumberField = React.forwardRef<HTMLInputElement, NumberFieldProps>(
  function NumberField(
    {
      label,
      value,
      defaultValue = "",
      onValueChange,
      description,
      error,
      id: suppliedId,
      name,
      form,
      disabled,
      readOnly,
      required,
      min,
      max,
      step = 1,
      className,
      onBlur,
      onInvalid,
      ...props
    },
    forwardedRef,
  ) {
    const autoId = React.useId(),
      id = suppliedId ?? autoId;
    const input = React.useRef<HTMLInputElement>(null);
    const shouldRevealOnBlur = useFieldBlur(input);
    React.useImperativeHandle(forwardedRef, () => input.current!);
    const [local, setLocal] = React.useState(String(defaultValue));
    const [internalError, setInternalError] = React.useState("");
    const [revealed, setRevealed] = React.useState(false);
    const current = String(value === undefined ? local : value);
    const message = error || (revealed ? internalError : "");
    const hint = message || description;
    const describedBy =
      [props["aria-describedby"], hint ? `${id}-hint` : undefined]
        .filter(Boolean)
        .join(" ") || undefined;
    const measure = () => {
      const node = input.current;
      if (!node) return;
      // A controlled React number input otherwise moves the native step base
      // with each edit. Keep it anchored to the declared default, not the draft.
      const draft = node.value;
      node.defaultValue = String(defaultValue);
      if (node.value !== draft) node.value = draft;
      node.setCustomValidity("");
      const issue = validation(node);
      node.setCustomValidity(disabled || readOnly ? "" : error || issue);
      setInternalError(issue);
    };
    React.useEffect(measure);
    React.useEffect(() => {
      const owner = input.current?.form;
      if (!owner) return;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const reset = (event: Event) => {
        timer = setTimeout(() => {
          if (event.defaultPrevented) return;
          if (value === undefined) {
            setLocal(String(defaultValue));
            onValueChange?.(String(defaultValue));
          }
          // Reset's native DOM write must not replace a controlled value, and
          // an unchanged default must be restored even if React skips rendering.
          if (input.current)
            input.current.value = String(
              value === undefined ? defaultValue : value,
            );
          measure();
          setRevealed(false);
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
      if (value === undefined) setLocal(next);
      measure();
      onValueChange?.(next);
    };
    const increment = (direction: number) => {
      const node = input.current;
      if (!node || disabled || readOnly) return;
      if (step === "any") {
        const candidate =
          (Number.isFinite(node.valueAsNumber) ? node.valueAsNumber : 0) +
          direction;
        const bounded = Math.max(
          min === undefined ? -Infinity : Number(min),
          Math.min(max === undefined ? Infinity : Number(max), candidate),
        );
        node.value = String(bounded);
      } else if (direction > 0) node.stepUp();
      else node.stepDown();
      update(node.value);
      if (value !== undefined) node.value = current;
      node.focus();
    };
    const numeric = current.trim() === "" ? NaN : Number(current);
    return (
      <div className="cheese-field">
        <label htmlFor={id} className="cheese-label">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
        <div className="cheese-number-field-control">
          <input
            {...props}
            ref={input}
            id={id}
            name={name}
            form={form}
            type="number"
            inputMode={props.inputMode ?? "decimal"}
            value={current}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            className={["cheese-input cheese-number-field-input", className]
              .filter(Boolean)
              .join(" ")}
            aria-invalid={!!message || undefined}
            aria-describedby={describedBy}
            onChange={(event) => update(event.currentTarget.value)}
            onBlur={(event) => {
              measure();
              if (shouldRevealOnBlur(event)) setRevealed(true);
              onBlur?.(event);
            }}
            onInvalid={(event) => {
              event.preventDefault();
              measure();
              setRevealed(true);
              focusInvalid(event.currentTarget);
              onInvalid?.(event);
            }}
          />
          <div className="cheese-number-field-actions">
            <button
              type="button"
              className="cheese-field-action"
              aria-label={`${label} 감소`}
              disabled={
                disabled ||
                readOnly ||
                (min !== undefined &&
                  Number.isFinite(numeric) &&
                  numeric <= Number(min))
              }
              onClick={() => increment(-1)}
            >
              <Minus size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="cheese-field-action"
              aria-label={`${label} 증가`}
              disabled={
                disabled ||
                readOnly ||
                (max !== undefined &&
                  Number.isFinite(numeric) &&
                  numeric >= Number(max))
              }
              onClick={() => increment(1)}
            >
              <Plus size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
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
