import { useState } from "react";
import { DateRangeField, Button } from "@cheese/react";
export default function Example() {
  const [status, setStatus] = useState("시작일과 종료일을 입력하세요.");
  return (
    <form
      className="cheese-stack"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setStatus(`${data.get("period.start")} ~ ${data.get("period.end")}`);
      }}
    >
      <DateRangeField label="평가 기간" name="period" required />
      <div className="cheese-inline">
        <Button type="submit">기간 확인</Button>
        <Button type="reset" variant="weak">
          초기화
        </Button>
      </div>
      <p className="cheese-help" role="status">
        {status}
      </p>
    </form>
  );
}
