import { useState } from "react";
import { Editable } from "@cheese/react";
export default function Example() {
  const [value, setValue] = useState("2026 하반기 평가");
  return (
    <div className="cheese-stack">
      <Editable
        label="평가 이름"
        value={value}
        onValueChange={setValue}
        required
      />
      <Editable label="고정 항목" defaultValue="수정 권한 없음" disabled />
      <p className="cheese-help" role="status">
        저장된 이름: {value}
      </p>
    </div>
  );
}
