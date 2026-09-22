import { useState } from "react";
import { Switch } from "@cheese/react";
export default function Example() {
  const [on, setOn] = useState(false);
  return (
    <div className="cheese-stack">
      <Switch label="이메일 알림" checked={on} onCheckedChange={setOn} />
      <Switch label="보안 알림 (필수)" checked disabled />
      <p role="status" className="cheese-help">
        {on ? "이메일 알림을 받습니다." : "이메일 알림이 꺼져 있습니다."}
      </p>
    </div>
  );
}
