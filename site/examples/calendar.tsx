import { useState } from "react";
import { Calendar, formatDate } from "@cheese/react";
export default function Example() {
  const [date, setDate] = useState<Date>();
  return (
    <Calendar
      mode="single"
      defaultMonth={new Date(2026, 9, 1)}
      selected={date}
      onSelect={setDate}
      disabled={{ before: new Date(2026, 9, 5) }}
      footer={
        date
          ? "선택한 날짜: " + formatDate(date)
          : "10월 5일 이후 날짜를 선택하세요."
      }
    />
  );
}
