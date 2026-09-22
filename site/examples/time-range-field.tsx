import { useState } from "react";
import { TimeRangeField, Button } from "@cheese/react";
export default function Example() {
  const [status, setStatus] = useState("같은 날의 회의 시간입니다.");
  return (
    <form
      className="cheese-stack"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setStatus(`${data.get("time.start")} ~ ${data.get("time.end")}`);
      }}
    >
      <TimeRangeField
        label="회의 시간"
        name="time"
        defaultValue={{ start: "09:00", end: "10:00" }}
        required
      />
      <div className="cheese-inline">
        <Button type="submit">시간 확인</Button>
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
