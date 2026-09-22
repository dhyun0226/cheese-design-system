import "@cheese/css";
import "../../packages/css/src/date-number-field.css";
import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { createApp } from "vue";
import { DateField } from "../../packages/react/src/DateField";
import { NumberField } from "../../packages/react/src/NumberField";
import DateNumberFields from "./DateNumberFields.vue";

function ReactFields() {
  const [data, setData] = useState("");
  const [invalidEvents, setInvalidEvents] = useState(0);
  const [canceled, setCanceled] = useState(false);
  const [date, setDate] = useState("2024-02-10");
  const [number, setNumber] = useState("2");
  const dateRef = useRef<HTMLInputElement>(null);
  const numberRef = useRef<HTMLInputElement>(null);
  return (
    <main className="cheese-root cheese-stack">
      <h1>날짜·수량 폼 계약</h1>
      <form
        id="field-form"
        className="cheese-stack"
        onInvalidCapture={() => setInvalidEvents((count) => count + 1)}
        onReset={(event) => {
          if (canceled) event.preventDefault();
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
        <DateField
          label="기준 날짜"
          name="date"
          defaultValue="2024-02-01"
          min="2024-02-01"
          max="2024-03-31"
          step={2}
          required
          ref={dateRef}
        />
        <DateField
          label="선택 날짜"
          name="optional"
          description="YYYY-MM-DD 형식으로 입력하세요."
        />
        <DateField
          label="제어 날짜"
          name="controlledDate"
          value={date}
          onValueChange={setDate}
        />
        <DateField
          label="비활성 날짜"
          name="disabledDate"
          defaultValue="2024-02-10"
          disabled
        />
        <DateField
          label="읽기 날짜"
          name="readonlyDate"
          defaultValue="2024-02-10"
          readOnly
        />
        <NumberField
          label="수량"
          name="quantity"
          defaultValue="1.5"
          min={0}
          max={3}
          step={0.5}
          required
          ref={numberRef}
        />
        <NumberField
          label="제어 수량"
          name="controlledNumber"
          value={number}
          onValueChange={setNumber}
          min={0}
          max={10}
        />
        <NumberField
          label="비활성 수량"
          name="disabledNumber"
          defaultValue="2"
          disabled
        />
        <NumberField
          label="읽기 수량"
          name="readonlyNumber"
          defaultValue="2"
          readOnly
        />
        <NumberField
          label="자유 수량"
          name="anyNumber"
          defaultValue="0.25"
          step="any"
        />
        <NumberField
          label="간격 수량"
          name="offsetNumber"
          defaultValue="3"
          step={5}
        />
        <div className="cheese-inline">
          <button className="cheese-button" type="submit">
            저장
          </button>
          <button className="cheese-button" type="reset">
            초기화
          </button>
        </div>
      </form>
      <DateField
        label="외부 날짜"
        name="externalDate"
        form="field-form"
        defaultValue="2024-02-20"
      />
      <NumberField
        label="외부 수량"
        name="externalNumber"
        form="field-form"
        defaultValue="4"
      />
      <label>
        <input
          type="checkbox"
          checked={canceled}
          onChange={(event) => setCanceled(event.target.checked)}
        />
        초기화 취소
      </label>
      <button
        className="cheese-button"
        onClick={() => dateRef.current?.focus()}
      >
        날짜 참조 포커스
      </button>
      <button
        className="cheese-button"
        onClick={() => numberRef.current?.focus()}
      >
        수량 참조 포커스
      </button>
      <output data-testid="form-data">{data}</output>
      <output data-testid="invalid-events">{invalidEvents}</output>
    </main>
  );
}
if (new URLSearchParams(location.search).get("framework") === "vue")
  createApp(DateNumberFields).mount("#root");
else createRoot(document.getElementById("root")!).render(<ReactFields />);
