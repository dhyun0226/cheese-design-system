import { useState } from "react";
import { MonthPicker } from "@cheese/react";
export default function Example() {
  const [month, setMonth] = useState("2026-09");
  return (
    <div className="cheese-stack">
      <MonthPicker
        label="평가 월"
        value={month}
        onValueChange={setMonth}
        min="2025-01"
        max="2027-12"
      />
      <p className="cheese-help" role="status">
        선택한 월: {month}
      </p>
    </div>
  );
}
