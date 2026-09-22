"use client";
import * as React from "react";
import { Select as Primitive } from "radix-ui";
import { Check, ChevronDown, ChevronUp, Search } from "lucide-react";
import { inertOutside } from "./inert.js";

export interface ChoiceOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}
export interface SelectProps extends React.ComponentPropsWithoutRef<
  typeof Primitive.Root
> {
  label: string;
  options: ChoiceOption[];
  placeholder?: string;
  id?: string;
  error?: string;
  description?: string;
}
export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  function Select(
    {
      label,
      options,
      placeholder = "선택하세요",
      id: provided,
      error,
      description,
      ...props
    },
    ref,
  ) {
    const [validation, setValidation] = React.useState("");
    const auto = React.useId(),
      id = provided || auto,
      invalid = error || validation,
      hint = invalid || description;
    const [selected, setSelected, root] = useFieldValue(
      props.value,
      props.defaultValue ?? "",
      (next) => {
        setValidation("");
        props.onValueChange?.(next);
      },
      props.form,
    );
    const [content, setContent] = React.useState<HTMLDivElement | null>(null);
    const [localOpen, setLocalOpen] = React.useState(
      props.defaultOpen ?? false,
    );
    const open = props.open ?? localOpen;
    const [focusOrigin, setFocusOrigin] = React.useState<
      "keyboard" | "pointer"
    >("keyboard");
    const pointerPosition = React.useRef<{ x: number; y: number } | null>(null);
    React.useEffect(() => {
      // Remember the pointer before opening too: Safari reports zero movement
      // deltas, while a stationary pointer may cross a repositioned popup.
      const trackPointer = (event: PointerEvent) => {
        if (event.isTrusted)
          pointerPosition.current = { x: event.clientX, y: event.clientY };
      };
      document.addEventListener("pointermove", trackPointer);
      return () => document.removeEventListener("pointermove", trackPointer);
    }, []);
    React.useEffect(() => {
      if (!open) setFocusOrigin("keyboard");
    }, [open]);
    const pointerFocus = (event: React.PointerEvent) => {
      pointerPosition.current = { x: event.clientX, y: event.clientY };
      setFocusOrigin("pointer");
    };
    const keyboardFocus = () => setFocusOrigin("keyboard");
    const undoInert = React.useRef<(() => void) | undefined>(undefined);
    const releaseInert = React.useCallback(() => {
      undoInert.current?.();
      undoInert.current = undefined;
    }, []);
    React.useEffect(() => {
      if (open && content?.isConnected)
        undoInert.current = inertOutside(content);
      return releaseInert;
    }, [content, open, releaseInert]);
    return (
      <div
        className="cheese-field"
        ref={root}
        onInvalidCapture={(event) => {
          event.preventDefault();
          setValidation("항목을 선택해 주세요.");
          const target = event.target as HTMLInputElement;
          const first =
            target.form &&
            Array.from(target.form.elements).find((element) => {
              const control = element as HTMLInputElement;
              return (
                control.willValidate &&
                control.validity &&
                !control.validity.valid
              );
            });
          if (!first || first === target)
            root.current
              ?.querySelector<HTMLButtonElement>('button[role="combobox"]')
              ?.focus();
        }}
      >
        <label className="cheese-label" htmlFor={id}>
          {label}
          {props.required && <span aria-hidden="true"> *</span>}
        </label>
        <Primitive.Root
          {...props}
          value={selected}
          onValueChange={setSelected}
          open={open}
          onOpenChange={(next) => {
            if (props.open === undefined) setLocalOpen(next);
            props.onOpenChange?.(next);
          }}
        >
          <Primitive.Trigger
            ref={ref}
            id={id}
            className="cheese-input cheese-select-trigger"
            onPointerDownCapture={pointerFocus}
            onKeyDownCapture={keyboardFocus}
            aria-invalid={!!invalid}
            aria-describedby={hint ? id + "-hint" : undefined}
          >
            <Primitive.Value placeholder={placeholder} />
            <Primitive.Icon asChild>
              <ChevronDown size={18} aria-hidden="true" />
            </Primitive.Icon>
          </Primitive.Trigger>
          <Primitive.Portal>
            <Primitive.Content
              ref={setContent}
              className="cheese-select-content cheese-root"
              data-focus-origin={focusOrigin}
              position="popper"
              sideOffset={6}
              collisionPadding={12}
              onKeyDownCapture={keyboardFocus}
              onPointerDownCapture={pointerFocus}
              onPointerMoveCapture={(event) => {
                const previous = pointerPosition.current;
                // A page opened entirely by keyboard has no prior coordinates;
                // its first real pointer event can also report zero deltas.
                if (
                  previous
                    ? previous.x !== event.clientX ||
                      previous.y !== event.clientY
                    : event.isTrusted
                )
                  pointerFocus(event);
              }}
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                releaseInert();
                root.current
                  ?.querySelector<HTMLButtonElement>('button[role="combobox"]')
                  ?.focus();
              }}
            >
              <Primitive.ScrollUpButton className="cheese-select-scroll">
                <ChevronUp size={16} />
              </Primitive.ScrollUpButton>
              <Primitive.Viewport>
                {options.map((option) => (
                  <Primitive.Item
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className="cheese-option"
                  >
                    <span className="cheese-option-copy">
                      <Primitive.ItemText>{option.label}</Primitive.ItemText>
                      {option.description && (
                        <small>{option.description}</small>
                      )}
                    </span>
                    <Primitive.ItemIndicator>
                      <Check size={17} aria-hidden="true" />
                    </Primitive.ItemIndicator>
                  </Primitive.Item>
                ))}
              </Primitive.Viewport>
              <Primitive.ScrollDownButton className="cheese-select-scroll">
                <ChevronDown size={16} />
              </Primitive.ScrollDownButton>
            </Primitive.Content>
          </Primitive.Portal>
        </Primitive.Root>
        {hint && (
          <p
            id={id + "-hint"}
            className="cheese-help"
            role={invalid ? "alert" : undefined}
          >
            {hint}
          </p>
        )}
      </div>
    );
  },
);

/** Shared state with native form reset support. Controlled owners receive the reset value. */
export function useFieldValue<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
  formId?: string,
) {
  const [local, setLocal] = React.useState(defaultValue);
  const root = React.useRef<HTMLDivElement>(null);
  const resetting = React.useRef<Event | null>(null);
  const latest = React.useRef({ value, defaultValue, onChange });
  latest.current = { value, defaultValue, onChange };
  React.useEffect(() => {
    const form = formId
      ? document.getElementById(formId)
      : root.current?.closest("form");
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const reset = (event: Event) => {
      resetting.current = event;
      const timer = setTimeout(() => {
        timers.delete(timer);
        if (event.defaultPrevented) return;
        const state = latest.current;
        if (state.value === undefined) setLocal(state.defaultValue);
        state.onChange?.(state.defaultValue);
      }, 0);
      timers.add(timer);
    };
    // Radix can synchronously emit its initial value in a reset listener before
    // the owning React form cancels the event. Capture reset first; this helper
    // alone applies the final, cancel-aware reset after dispatch has completed.
    form?.addEventListener("reset", reset, true);
    return () => {
      form?.removeEventListener("reset", reset, true);
      timers.forEach(clearTimeout);
      resetting.current = null;
    };
  }, [formId]);
  const set = (next: T) => {
    if (resetting.current?.eventPhase) return;
    if (value === undefined) setLocal(next);
    onChange?.(next);
  };
  return [value ?? local, set, root] as const;
}

export interface ComboboxProps {
  label: string;
  options: ChoiceOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  emptyText?: string;
}
export function Combobox({
  label,
  options,
  value,
  defaultValue = "",
  onValueChange,
  placeholder = "검색하여 선택",
  name,
  disabled,
  required,
  error,
  emptyText = "검색 결과가 없습니다.",
}: ComboboxProps) {
  const [invalid, setInvalid] = React.useState(false);
  const message = error || (invalid ? "항목을 선택해 주세요." : undefined);
  const [selected, setSelected, root] = useFieldValue(
    value,
    defaultValue,
    (next) => {
      setInvalid(false);
      onValueChange?.(next);
    },
  );
  const [open, setOpen] = React.useState(false),
    [query, setQuery] = React.useState(""),
    [active, setActive] = React.useState(-1);
  const input = React.useRef<HTMLInputElement>(null),
    id = React.useId();
  const labelOf = (key: string) =>
    options.find((o) => o.value === key)?.label ?? "";
  const filtered = options.filter((o) =>
    o.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  const available = filtered
    .map((o, i) => (o.disabled ? -1 : i))
    .filter((i) => i >= 0);
  const choose = (option: ChoiceOption) => {
    if (option.disabled) return;
    setSelected(option.value);
    setQuery("");
    setOpen(false);
    setActive(-1);
    input.current?.focus();
  };
  React.useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open, root]);
  React.useEffect(() => {
    if (open && active >= 0)
      document
        .getElementById(id + "-option-" + active)
        ?.scrollIntoView({ block: "nearest" });
  }, [open, active, id]);
  React.useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  React.useEffect(() => {
    if (selected) setInvalid(false);
  }, [selected]);
  return (
    <div
      className="cheese-field cheese-combobox"
      ref={root}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setOpen(false);
          setQuery("");
        }
      }}
    >
      <label className="cheese-label" htmlFor={id}>
        {label}
        {required ? " *" : ""}
      </label>
      <div className="cheese-input-shell">
        <Search size={17} aria-hidden="true" />
        <input
          ref={input}
          id={id}
          className="cheese-input"
          role="combobox"
          aria-expanded={open}
          aria-controls={id + "-list"}
          aria-autocomplete="list"
          aria-activedescendant={
            open && filtered[active] ? id + "-option-" + active : undefined
          }
          aria-invalid={!!message}
          aria-describedby={message ? id + "-error" : undefined}
          aria-required={required}
          disabled={disabled}
          placeholder={placeholder}
          value={open ? query : labelOf(selected)}
          onClick={() => {
            setQuery("");
            setOpen(true);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(-1);
            if (selected) setSelected("");
          }}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              setOpen(true);
              const pos = available.indexOf(active),
                direction = e.key === "ArrowDown" ? 1 : -1;
              setActive(
                available[
                  Math.max(
                    0,
                    Math.min(
                      available.length - 1,
                      pos < 0
                        ? direction > 0
                          ? 0
                          : available.length - 1
                        : pos + direction,
                    ),
                  )
                ] ?? -1,
              );
            } else if (e.key === "Enter" && open) {
              e.preventDefault();
              if (filtered[active]) choose(filtered[active]);
            } else if (e.key === "Escape") {
              e.preventDefault();
              setOpen(false);
              setQuery("");
            }
          }}
        />
        <ChevronDown size={17} aria-hidden="true" />
      </div>
      {name && (
        <input type="hidden" name={name} value={selected} disabled={disabled} />
      )}
      {/* The visible text is not the submitted option value; validate selection separately. */}
      {required && (
        <input
          className="cheese-form-proxy"
          tabIndex={-1}
          aria-hidden="true"
          value={selected}
          onChange={() => {}}
          required
          disabled={disabled}
          onInvalid={(e) => {
            e.preventDefault();
            setInvalid(true);
            const target = e.currentTarget;
            const first =
              target.form &&
              Array.from(target.form.elements).find((element) => {
                const control = element as HTMLInputElement;
                return (
                  control.willValidate &&
                  control.validity &&
                  !control.validity.valid
                );
              });
            if (!first || first === target) {
              input.current?.focus();
              setOpen(true);
            }
          }}
        />
      )}
      {open && (
        <div className="cheese-combobox-popup">
          <div
            id={id + "-list"}
            role="listbox"
            aria-label={label}
            className="cheese-option-list"
          >
            {filtered.map((option, index) => (
              <div
                key={option.value}
                id={id + "-option-" + index}
                role="option"
                aria-selected={selected === option.value}
                aria-disabled={option.disabled || undefined}
                className="cheese-option"
                data-active={active === index}
                onPointerMove={() => !option.disabled && setActive(index)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(option)}
              >
                <span className="cheese-option-copy">
                  {option.label}
                  {option.description && <small>{option.description}</small>}
                </span>
                {selected === option.value && (
                  <Check size={17} aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
          {!filtered.length && (
            <p className="cheese-collection-empty" role="status">
              {emptyText}
            </p>
          )}
        </div>
      )}
      {message && (
        <p id={id + "-error"} className="cheese-help" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}

export interface ListboxProps {
  label: string;
  options: ChoiceOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
}
export function Listbox({
  label,
  options,
  value,
  defaultValue = "",
  onValueChange,
  disabled,
  name,
}: ListboxProps) {
  const [selected, setSelected, root] = useFieldValue(
    value,
    defaultValue,
    onValueChange,
  );
  const [focus, setFocus] = React.useState(
    selected || options.find((o) => !o.disabled)?.value,
  );
  const active = options.some((o) => o.value === focus && !o.disabled)
    ? focus
    : options.find((o) => !o.disabled)?.value;
  const enabled = options.filter((o) => !o.disabled),
    id = React.useId();
  const move = (key?: string) => {
    if (!key) return;
    setFocus(key);
    root.current
      ?.querySelectorAll<HTMLElement>("[role=option]")
      .forEach((el) => {
        if (el.dataset.value === key) el.focus();
      });
  };
  return (
    <div ref={root} className="cheese-field">
      <span id={id} className="cheese-label">
        {label}
      </span>
      <div
        className="cheese-listbox"
        role="listbox"
        aria-labelledby={id}
        aria-disabled={disabled || undefined}
      >
        {options.map((option) => (
          <div
            key={option.value}
            className="cheese-option"
            role="option"
            data-value={option.value}
            aria-selected={selected === option.value}
            aria-disabled={disabled || option.disabled || undefined}
            tabIndex={!disabled && active === option.value ? 0 : -1}
            onFocus={() => setFocus(option.value)}
            onClick={() => {
              if (!disabled && !option.disabled) {
                move(option.value);
                setSelected(option.value);
              }
            }}
            onKeyDown={(e) => {
              if (disabled || option.disabled) return;
              const i = enabled.findIndex((o) => o.value === option.value);
              if (
                ["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "].includes(
                  e.key,
                )
              )
                e.preventDefault();
              if (e.key === "ArrowDown")
                move(enabled[Math.min(i + 1, enabled.length - 1)]?.value);
              else if (e.key === "ArrowUp")
                move(enabled[Math.max(i - 1, 0)]?.value);
              else if (e.key === "Home") move(enabled[0]?.value);
              else if (e.key === "End") move(enabled.at(-1)?.value);
              else if (e.key === "Enter" || e.key === " ")
                setSelected(option.value);
              else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey)
                move(
                  [...enabled.slice(i + 1), ...enabled.slice(0, i + 1)].find(
                    (o) =>
                      o.label
                        .toLocaleLowerCase()
                        .startsWith(e.key.toLocaleLowerCase()),
                  )?.value,
                );
            }}
          >
            <span className="cheese-option-copy">
              {option.label}
              {option.description && <small>{option.description}</small>}
            </span>
            {selected === option.value && (
              <Check size={17} aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
      {name && (
        <input type="hidden" name={name} value={selected} disabled={disabled} />
      )}
    </div>
  );
}
