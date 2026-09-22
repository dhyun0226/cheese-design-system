import { useState } from "react";
import { Button, DatePicker, formatDate } from "@cheese/react";
export default function Example() {
  const [date, setDate] = useState<Date>();
  const [result, setResult] = useState("");
  return (
    <div className="cheese-stack">
      <form
        className="cheese-stack"
        onReset={() => {
          setDate(undefined);
          setResult("");
        }}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setResult(
            "전송할 값: " +
              data.get("deadline") +
              " · 읽기 전용: " +
              data.get("locked-date") +
              " · 비활성: " +
              (data.has("disabled-date")
                ? data.get("disabled-date")
                : "제출 제외"),
          );
        }}
      >
        <DatePicker
          label="평가 마감일"
          name="deadline"
          required
          description="10월부터 12월까지 선택할 수 있습니다."
          value={date ?? null}
          onValueChange={setDate}
          min={new Date(2026, 9, 1)}
          max={new Date(2026, 11, 31)}
        />
        <p role="status" className="cheese-help">
          {date ? "선택: " + formatDate(date) : "선택한 날짜가 없습니다."}
        </p>
        <DatePicker
          label="변경할 수 없는 날짜"
          name="locked-date"
          defaultValue={new Date(2026, 9, 20)}
          readOnly
          description="읽기 전용 값은 제출에 포함됩니다."
        />
        <DatePicker
          label="비활성 날짜"
          name="disabled-date"
          defaultValue={new Date(2026, 9, 20)}
          disabled
          description="비활성 값은 제출에서 제외됩니다."
        />
        <div className="cheese-inline">
          <Button type="submit">날짜 확인</Button>
          <Button type="reset" variant="weak">
            날짜 초기화
          </Button>
        </div>
        {result && (
          <p className="cheese-help">
            {result} · 서버로 전송하지 않는 예제입니다.
          </p>
        )}
      </form>
    </div>
  );
}
