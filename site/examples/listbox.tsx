import { useState } from "react";
import { Listbox } from "@cheese/react";
export default function Example() {
  const [value, setValue] = useState("draft");
  return (
    <div className="cheese-stack">
      <Listbox
        label="평가 상태"
        value={value}
        onValueChange={setValue}
        options={[
          {
            value: "draft",
            label: "작성 중",
            description: "아직 제출하지 않은 평가",
          },
          {
            value: "review",
            label: "검토 중",
            description: "담당자가 확인 중인 평가",
          },
          { value: "done", label: "완료", description: "최종 확정된 평가" },
          { value: "archive", label: "보관 (권한 없음)", disabled: true },
        ]}
      />
      <p className="cheese-help" role="status">
        선택한 상태: {value}
      </p>
    </div>
  );
}
