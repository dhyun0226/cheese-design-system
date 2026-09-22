import { useState } from "react";
import { YearPicker } from "@cheese/react";
export default function Example() {
  const [year, setYear] = useState(2026);
  return (
    <div className="cheese-stack">
      <YearPicker
        label="기준 연도"
        value={year}
        onValueChange={setYear}
        min={2020}
        max={2040}
      />
      <p className="cheese-help" role="status">
        선택한 연도: {year}
      </p>
    </div>
  );
}
