import "@cheese/css";
import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Button,
  DatePicker,
  Field,
  Input,
  Checkbox,
  Select,
} from "@cheese/react";

function Forms() {
  const [data, setData] = useState("");
  const [cancelReset, setCancelReset] = useState(false);
  const [controlled, setControlled] = useState<Date | null>(
    new Date(2026, 9, 20),
  );
  const control = useRef<HTMLButtonElement>(null);
  const bounds = { min: new Date(2026, 9, 1), max: new Date(2026, 9, 31) };
  return (
    <main className="cheese-root cheese-stack">
      <h1>폼 계약 테스트</h1>
      <form
        id="main-form"
        className="cheese-stack"
        onReset={(event) => {
          if (cancelReset) event.preventDefault();
        }}
        onSubmit={(event) => {
          event.preventDefault();
          setData(
            JSON.stringify(
              Object.fromEntries(new FormData(event.currentTarget)),
            ),
          );
        }}
      >
        <DatePicker label="필수 날짜" name="required" required {...bounds} />
        <DatePicker
          label="초기 날짜"
          name="initial"
          defaultValue={new Date(2026, 9, 10)}
          {...bounds}
        />
        <DatePicker
          label="읽기 전용"
          name="readonly"
          readOnly
          defaultValue={new Date(2026, 9, 20)}
          {...bounds}
        />
        <DatePicker
          label="비활성"
          name="disabled"
          disabled
          defaultValue={new Date(2026, 9, 20)}
          {...bounds}
        />
        <fieldset disabled>
          <legend>비활성 그룹</legend>
          <DatePicker
            label="그룹 날짜"
            name="fieldset"
            defaultValue={new Date(2026, 9, 20)}
            {...bounds}
          />
        </fieldset>
        <Field label="메모">
          <Input name="memo" defaultValue="초기 메모" />
        </Field>
        <Button type="submit">제출</Button>
        <Button type="reset">초기화</Button>
      </form>
      <Checkbox
        label="초기화 취소"
        checked={cancelReset}
        onCheckedChange={(checked) => setCancelReset(checked === true)}
      />
      <DatePicker
        label="폼 외부 날짜"
        name="external"
        form="main-form"
        defaultValue={new Date(2026, 9, 10)}
        {...bounds}
      />
      <DatePicker
        label="제어 날짜"
        value={controlled}
        ref={control}
        onValueChange={(date) => setControlled(date ?? null)}
        {...bounds}
      />
      <Button
        onClick={() => {
          setControlled(null);
          control.current?.focus();
        }}
      >
        제어값 지우기
      </Button>
      <output aria-label="제출 데이터">{data}</output>
      <form
        aria-label="선택 폼"
        className="cheese-stack"
        onSubmit={(event) => {
          event.preventDefault();
          setData(
            JSON.stringify(
              Object.fromEntries(new FormData(event.currentTarget)),
            ),
          );
        }}
      >
        <Select
          label="필수 조직"
          name="team"
          required
          options={[
            { value: "people", label: "피플팀" },
            { value: "tech", label: "개발팀" },
          ]}
        />
        <Button type="submit">선택 폼 제출</Button>
        <Button type="reset">선택 폼 초기화</Button>
      </form>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<Forms />);
