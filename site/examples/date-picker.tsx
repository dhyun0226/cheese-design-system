import { useState } from "react";
import { DatePicker, formatDate } from "@cheese/react";
export default function Example() {
  const [date, setDate] = useState<Date>();
  return (
    <div className="cheese-stack">
      <DatePicker
        label="평가 마감일"
        name="deadline"
        value={date ?? null}
        onValueChange={setDate}
        min={new Date(2026, 9, 1)}
        max={new Date(2026, 11, 31)}
      />
      <p role="status" className="cheese-help">
        {date ? "선택: " + formatDate(date) : "선택한 날짜가 없습니다."}
      </p>
    </div>
  );
}
