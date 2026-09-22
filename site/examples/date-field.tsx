import { DateField } from "@cheese/react";
export default function Example() {
  return (
    <DateField
      label="평가 마감일"
      description="YYYY-MM-DD로 입력하거나 달력에서 선택하세요."
      min="2026-01-01"
      max="2026-12-31"
      defaultValue="2026-10-30"
    />
  );
}
