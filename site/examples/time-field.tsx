import { TimeField } from "@cheese/react";
export default function Example() {
  return (
    <TimeField
      label="알림 시간"
      defaultValue="09:00"
      step={900}
      description="24시간 형식 · 15분 간격으로 선택합니다."
    />
  );
}
