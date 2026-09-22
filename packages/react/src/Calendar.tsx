import * as React from "react";
import {
  DayPicker,
  type DayPickerProps,
  type DateRange,
} from "react-day-picker";
import { ko } from "react-day-picker/locale";
import { Popover } from "radix-ui";
export type { DateRange };
export function Calendar(props: DayPickerProps) {
  return (
    <DayPicker
      locale={ko}
      showOutsideDays
      labels={{ labelNext: () => "다음 달", labelPrevious: () => "이전 달" }}
      {...props}
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
  name?: string;
}
export function DatePicker({
  label,
  value,
  defaultValue,
  onValueChange,
  min,
  max,
  disabled,
  name,
}: DatePickerProps) {
  const [local, setLocal] = React.useState<Date | undefined>(defaultValue),
    [open, setOpen] = React.useState(false);
  const selected = value === undefined ? local : (value ?? undefined),
    id = React.useId();
  return (
    <div className="cheese-field">
      <span id={id} className="cheese-label">
        {label}
      </span>
      {name && (
        <input
          type="hidden"
          name={name}
          value={selected ? formatDate(selected) : ""}
        />
      )}
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          disabled={disabled}
          className="cheese-input cheese-date-trigger"
          aria-labelledby={id + " " + id + "-value"}
        >
          <span id={id + "-value"}>
            {selected ? formatDate(selected) : "날짜 선택"}
          </span>
          <span aria-hidden="true">▦</span>
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
                setOpen(false);
              }}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
