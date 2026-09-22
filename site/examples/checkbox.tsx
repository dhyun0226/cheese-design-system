import { useState } from "react";
import { Checkbox } from "@cheese/react";
export default function Example() {
  const [checked, setChecked] = useState(false);
  const [partial, setPartial] = useState<boolean | "indeterminate">(
    "indeterminate",
  );
  return (
    <div className="cheese-stack">
      <Checkbox
        label="평가 결과 알림 받기"
        name="notification"
        checked={checked}
        onCheckedChange={(v) => setChecked(v === true)}
      />
      <Checkbox
        label="일부 항목 선택됨"
        checked={partial}
        onCheckedChange={setPartial}
      />
      <Checkbox label="변경할 수 없는 항목" disabled />
      <p className="cheese-help" role="status">
        알림: {checked ? "켜짐" : "꺼짐"}
      </p>
    </div>
  );
}
