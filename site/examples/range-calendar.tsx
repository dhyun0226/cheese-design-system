import { useState } from "react";
import { Calendar, formatDate, type DateRange } from "@cheese/react";
export default function Example() {
  const [range, setRange] = useState<DateRange>();
  return (
    <Calendar
      mode="range"
      defaultMonth={new Date(2026, 9, 1)}
      selected={range}
      onSelect={setRange}
      min={1}
      footer={
        range?.from
          ? formatDate(range.from) +
            " ~ " +
            (range.to ? formatDate(range.to) : "종료일 선택")
          : "평가 기간의 시작일과 종료일을 선택하세요."
      }
    />
  );
}
