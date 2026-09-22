import { useState } from "react";
import { Combobox } from "@cheese/react";
export default function Example() {
  const [value, setValue] = useState("");
  return (
    <div className="cheese-stack">
      <Combobox
        label="담당자 검색"
        value={value}
        onValueChange={setValue}
        options={[
          { value: "kim", label: "김치즈", description: "피플팀" },
          { value: "lee", label: "이달", description: "개발팀" },
          { value: "park", label: "박우주", description: "크리에이티브팀" },
          { value: "inactive", label: "비활성 사용자", disabled: true },
        ]}
      />
      <p className="cheese-help" role="status">
        선택한 값: {value || "없음"}
      </p>
    </div>
  );
}
