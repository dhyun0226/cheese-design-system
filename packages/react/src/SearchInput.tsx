"use client";
import * as React from "react";
import { Search, X } from "lucide-react";

export interface SearchInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "defaultValue" | "onChange" | "onSearch"
> {
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Handles Enter instead of submitting the surrounding form. */
  onSearch?: (value: string) => void;
  clearLabel?: string;
  description?: string;
  error?: string;
}

/** A query field. Use Combobox when users must choose a suggested option. */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    {
      label,
      value,
      defaultValue = "",
      onValueChange,
      onSearch,
      clearLabel = `${label} 지우기`,
      description,
      error,
      id: suppliedId,
      form,
      disabled,
      readOnly,
      required,
      className,
      onKeyDown,
      onCompositionStart,
      onCompositionEnd,
      ...props
    },
    forwardedRef,
  ) {
    const autoId = React.useId();
    const id = suppliedId ?? autoId;
    const input = React.useRef<HTMLInputElement>(null);
    const composing = React.useRef(false);
    const [local, setLocal] = React.useState(defaultValue);
    const current = value === undefined ? local : value;
    const hint = error || description;
    const resetState = React.useRef({ value, defaultValue, onValueChange });
    resetState.current = { value, defaultValue, onValueChange };
    React.useImperativeHandle(forwardedRef, () => input.current!);
    React.useEffect(() => {
      input.current?.setCustomValidity(disabled || readOnly ? "" : error || "");
    }, [error, disabled, readOnly]);
    React.useEffect(() => {
      const owner = input.current?.form;
      if (!owner) return;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const reset = (event: Event) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (event.defaultPrevented) return;
          composing.current = false;
          const state = resetState.current;
          if (state.value === undefined) {
            setLocal(state.defaultValue);
            state.onValueChange?.(state.defaultValue);
          }
          // Native reset may write the input's default value without a render.
          if (input.current)
            input.current.value = state.value ?? state.defaultValue;
        }, 0);
      };
      owner.addEventListener("reset", reset);
      return () => {
        owner.removeEventListener("reset", reset);
        clearTimeout(timer);
      };
    }, [form]);

    const update = (next: string) => {
      if (disabled || readOnly) return;
      if (value === undefined) setLocal(next);
      onValueChange?.(next);
    };
    const clear = () => {
      update("");
      input.current?.focus();
    };
    return (
      <div className="cheese-field cheese-search-field">
        <label htmlFor={id} className="cheese-label">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
        <div className="cheese-search-input-control">
          <Search
            className="cheese-search-input-icon"
            size={18}
            aria-hidden="true"
          />
          <input
            {...props}
            ref={input}
            id={id}
            form={form}
            type="search"
            value={current}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            className={["cheese-input cheese-search-input", className]
              .filter(Boolean)
              .join(" ")}
            aria-invalid={error ? true : props["aria-invalid"]}
            aria-describedby={
              [props["aria-describedby"], hint ? `${id}-hint` : undefined]
                .filter(Boolean)
                .join(" ") || undefined
            }
            onChange={(event) => update(event.currentTarget.value)}
            onCompositionStart={(event) => {
              composing.current = true;
              onCompositionStart?.(event);
            }}
            onCompositionEnd={(event) => {
              composing.current = false;
              onCompositionEnd?.(event);
            }}
            onKeyDown={(event) => {
              onKeyDown?.(event);
              if (event.defaultPrevented || disabled) return;
              const isComposing =
                composing.current ||
                event.nativeEvent.isComposing ||
                event.keyCode === 229;
              if (event.key === "Enter" && onSearch) {
                // Suppress implicit form submission, including IME confirmation.
                event.preventDefault();
                if (!isComposing && event.currentTarget.reportValidity())
                  onSearch(current);
              } else if (
                event.key === "Escape" &&
                !isComposing &&
                !readOnly &&
                current
              ) {
                event.preventDefault();
                // Ancestors can respect defaultPrevented; empty Escape stays theirs.
                clear();
              }
            }}
          />
          {!!current && !disabled && !readOnly && (
            <button
              type="button"
              className="cheese-field-action cheese-search-input-clear"
              aria-label={clearLabel}
              onClick={clear}
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
        {hint && (
          <p
            id={`${id}-hint`}
            className="cheese-help"
            data-error={!!error}
            role={error ? "alert" : undefined}
          >
            {hint}
          </p>
        )}
      </div>
    );
  },
);
