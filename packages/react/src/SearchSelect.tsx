"use client";
import * as React from "react";
import { Search, X, Check, ChevronDown, RotateCcw } from "lucide-react";
import { useFieldValue, type ChoiceOption } from "./Collections.js";
import type { OptionsLoader } from "./business.js";

export interface MultiSelectProps {
  label: string;
  options?: ChoiceOption[];
  loadOptions?: OptionsLoader;
  value?: ChoiceOption[];
  defaultValue?: ChoiceOption[];
  onValueChange?: (items: ChoiceOption[]) => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  max?: number;
  debounceMs?: number;
  minLength?: number;
  placeholder?: string;
  error?: string;
}
interface SearchSelectProps extends MultiSelectProps {
  multiple: boolean;
}
export function SearchSelect({
  label,
  options = [],
  loadOptions,
  value,
  defaultValue = [],
  onValueChange,
  name,
  disabled,
  required,
  max = 100,
  debounceMs = 250,
  minLength = 0,
  placeholder = "검색하여 선택",
  error,
  multiple,
}: SearchSelectProps) {
  const [selected, setSelected, root] = useFieldValue(
    value,
    defaultValue,
    onValueChange,
  );
  const [open, setOpen] = React.useState(false),
    [query, setQuery] = React.useState(""),
    [active, setActive] = React.useState(-1);
  const [remote, setRemote] = React.useState<ChoiceOption[]>([]),
    [loading, setLoading] = React.useState(false),
    [failure, setFailure] = React.useState(false),
    [retry, setRetry] = React.useState(0),
    [composing, setComposing] = React.useState(false),
    [invalid, setInvalid] = React.useState(false);
  const input = React.useRef<HTMLInputElement>(null),
    sequence = React.useRef(0),
    id = React.useId();
  React.useEffect(() => {
    const ticket = ++sequence.current,
      controller = new AbortController();
    setActive(-1);
    setFailure(false);
    if (
      !loadOptions ||
      !open ||
      disabled ||
      composing ||
      query.trim().length < minLength
    ) {
      setLoading(false);
      setRemote([]);
      return () => controller.abort();
    }
    setLoading(true);
    setRemote([]);
    const timer = setTimeout(
      () => {
        Promise.resolve()
          .then(() => loadOptions(query, { signal: controller.signal }))
          .then((items) => {
            if (!controller.signal.aborted && sequence.current === ticket) {
              setRemote([
                ...new Map(items.map((item) => [item.value, item])).values(),
              ]);
              setLoading(false);
            }
          })
          .catch(() => {
            if (!controller.signal.aborted && sequence.current === ticket) {
              setFailure(true);
              setLoading(false);
            }
          });
      },
      Math.max(0, debounceMs),
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    query,
    open,
    disabled,
    composing,
    loadOptions,
    debounceMs,
    minLength,
    retry,
  ]);
  React.useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    const form = root.current?.closest("form");
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (!event.defaultPrevented) {
          setQuery("");
          setOpen(false);
          setInvalid(false);
        }
      });
    form?.addEventListener("reset", reset);
    return () => {
      document.removeEventListener("pointerdown", outside);
      form?.removeEventListener("reset", reset);
    };
  }, [root]);
  React.useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  const results = loadOptions
    ? remote
    : options.filter((item) =>
        item.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
      );
  const has = (item: ChoiceOption) =>
    selected.some((value) => value.value === item.value);
  const blocked = (item: ChoiceOption) =>
    !!item.disabled || (multiple && selected.length >= max && !has(item));
  const choose = (item: ChoiceOption) => {
    if (disabled || blocked(item)) return;
    setSelected(
      multiple
        ? has(item)
          ? selected.filter((value) => value.value !== item.value)
          : [...selected, item]
        : [item],
    );
    setInvalid(false);
    setQuery("");
    if (!multiple) setOpen(false);
    input.current?.focus();
  };
  const remove = (key: string) => {
    setSelected(selected.filter((item) => item.value !== key));
    input.current?.focus();
  };
  return (
    <div
      ref={root}
      className="cheese-field cheese-combobox"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node))
          setOpen(false);
      }}
    >
      <label className="cheese-label" htmlFor={id}>
        {label}
        {required ? " *" : ""}
      </label>
      {multiple && selected.length > 0 && (
        <ul className="cheese-selected-tags" aria-label={label + " 선택 항목"}>
          {selected.map((item) => (
            <li className="cheese-tag" key={item.value}>
              {item.label}
              <button
                type="button"
                disabled={disabled}
                aria-label={item.label + " 선택 해제"}
                onClick={() => remove(item.value)}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="cheese-input-shell">
        <Search size={17} aria-hidden="true" />
        <input
          ref={input}
          id={id}
          className="cheese-input"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open && !disabled}
          aria-controls={open ? id + "-list" : undefined}
          aria-activedescendant={
            open && results[active] ? id + "-option-" + active : undefined
          }
          aria-required={required}
          aria-invalid={!!error || invalid}
          aria-describedby={error || invalid ? id + "-error" : undefined}
          disabled={disabled}
          placeholder={placeholder}
          value={!multiple && !open ? (selected[0]?.label ?? "") : query}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            if (!multiple && selected.length) setSelected([]);
          }}
          onCompositionStart={() => setComposing(true)}
          onCompositionEnd={() => setComposing(false)}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing || composing) return;
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
              const enabled = results
                  .map((item, index) => (blocked(item) ? -1 : index))
                  .filter((index) => index >= 0),
                position = enabled.indexOf(active);
              const next =
                position < 0
                  ? event.key === "ArrowDown"
                    ? 0
                    : enabled.length - 1
                  : Math.max(
                      0,
                      Math.min(
                        enabled.length - 1,
                        position + (event.key === "ArrowDown" ? 1 : -1),
                      ),
                    );
              setActive(enabled[next] ?? -1);
              root.current
                ?.querySelector(
                  "#" + CSS.escape(id + "-option-" + enabled[next]),
                )
                ?.scrollIntoView({ block: "nearest" });
            } else if (event.key === "Enter" && open) {
              event.preventDefault();
              if (results[active]) choose(results[active]);
            } else if (event.key === "Escape") {
              event.preventDefault();
              setOpen(false);
              setQuery("");
            } else if (
              event.key === "Backspace" &&
              multiple &&
              !query &&
              selected.length
            ) {
              setSelected(selected.slice(0, -1));
            }
          }}
        />
        <ChevronDown size={17} aria-hidden="true" />
      </div>
      {name &&
        selected.map((item) => (
          <input
            key={item.value}
            type="hidden"
            name={name}
            value={item.value}
            disabled={disabled}
          />
        ))}
      {required && (
        <input
          className="cheese-form-proxy"
          tabIndex={-1}
          aria-hidden="true"
          value={selected.length ? "selected" : ""}
          onChange={() => {}}
          required
          disabled={disabled}
          onInvalid={(event) => {
            event.preventDefault();
            setInvalid(true);
            input.current?.focus();
          }}
        />
      )}
      {open && !disabled && (
        <div className="cheese-combobox-popup">
          <div
            role="listbox"
            id={id + "-list"}
            aria-label={label}
            aria-multiselectable={multiple || undefined}
            aria-busy={loading}
            className="cheese-option-list"
          >
            {results.map((item, index) => (
              <div
                key={item.value}
                role="option"
                id={id + "-option-" + index}
                aria-selected={has(item)}
                aria-disabled={blocked(item) || undefined}
                className="cheese-option"
                data-active={active === index}
                onPointerMove={() => {
                  if (!blocked(item)) setActive(index);
                }}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(item)}
              >
                <span className="cheese-option-copy">
                  {item.label}
                  {item.description && <small>{item.description}</small>}
                </span>
                {has(item) && <Check size={17} aria-hidden="true" />}
              </div>
            ))}
          </div>
          {failure ? (
            <div className="cheese-collection-empty">
              <p role="alert">검색에 실패했습니다.</p>
              <button
                type="button"
                className="cheese-button"
                data-variant="weak"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  input.current?.focus();
                  setRetry((value) => value + 1);
                }}
              >
                <RotateCcw size={15} aria-hidden="true" />
                다시 검색
              </button>
            </div>
          ) : (
            <p className="cheese-collection-empty" role="status">
              {loading
                ? "검색 중…"
                : query.trim().length < minLength
                  ? minLength + "자 이상 입력하세요."
                  : results.length
                    ? results.length + "개 결과"
                    : "검색 결과가 없습니다."}
            </p>
          )}
        </div>
      )}
      {multiple && (
        <p className="cheese-help" role="status">
          {selected.length}개 선택 · 최대 {max}개
        </p>
      )}
      {(error || invalid) && (
        <p className="cheese-help" id={id + "-error"} role="alert">
          {error || "항목을 선택해 주세요."}
        </p>
      )}
    </div>
  );
}
export function MultiSelect(props: MultiSelectProps) {
  return <SearchSelect {...props} multiple />;
}
export interface AsyncComboboxProps extends Omit<
  MultiSelectProps,
  "value" | "defaultValue" | "onValueChange" | "options" | "max" | "loadOptions"
> {
  loadOptions: OptionsLoader;
  value?: ChoiceOption | null;
  defaultValue?: ChoiceOption | null;
  onValueChange?: (item: ChoiceOption | null) => void;
}
export function AsyncCombobox({
  value,
  defaultValue,
  onValueChange,
  ...props
}: AsyncComboboxProps) {
  return (
    <SearchSelect
      {...props}
      multiple={false}
      value={value === undefined ? undefined : value ? [value] : []}
      defaultValue={defaultValue ? [defaultValue] : []}
      onValueChange={(items) => onValueChange?.(items[0] ?? null)}
    />
  );
}
