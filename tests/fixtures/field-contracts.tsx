import "@cheese/css";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { createApp } from "vue";
import {
  Editable,
  TagsInput,
  Rating,
  MonthPicker,
  YearPicker,
} from "@cheese/react";
import FieldContracts from "./FieldContracts.vue";

const params = new URLSearchParams(location.search);
const controlled = params.get("controlled") === "true";

function ReactFixture() {
  const [preventReset, setPreventReset] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [fieldsetDisabled, setFieldsetDisabled] = useState(false);
  const [tags, setTags] = useState(["기본"]);
  const [text, setText] = useState("기본 업무");
  const [month, setMonth] = useState("2026-09");
  const [year, setYear] = useState(2026);
  const [requiredData, setRequiredData] = useState("");
  const [ratingSubmits, setRatingSubmits] = useState(0);
  return (
    <main
      className="cheese-root cheese-stack"
      style={{ maxWidth: 720, margin: "24px auto" }}
    >
      <h1>필드 제출 계약</h1>
      <label>
        <input
          type="checkbox"
          checked={preventReset}
          onChange={(event) => setPreventReset(event.target.checked)}
        />
        초기화 취소
      </label>
      <label>
        <input
          type="checkbox"
          checked={disabled}
          onChange={(event) => setDisabled(event.target.checked)}
        />
        필드 비활성화
      </label>
      <label>
        <input
          type="checkbox"
          checked={fieldsetDisabled}
          onChange={(event) => setFieldsetDisabled(event.target.checked)}
        />
        폼 그룹 비활성화
      </label>
      <form
        aria-label="필수 편집"
        className="cheese-stack"
        onSubmit={(event) => {
          event.preventDefault();
          setRequiredData(
            JSON.stringify([...new FormData(event.currentTarget)]),
          );
        }}
      >
        <label>
          선행 필드
          <input name="first" required />
        </label>
        <Editable label="필수 제목" name="title" required disabled={disabled} />
        <Editable label="필수 설명" required disabled={disabled} />
        <button type="submit">편집 제출</button>
        <output data-testid="required-data">{requiredData}</output>
      </form>
      <form
        aria-label="필수 평점"
        className="cheese-stack"
        onReset={(event) => {
          if (preventReset) event.preventDefault();
        }}
        onSubmit={(event) => {
          event.preventDefault();
          setRatingSubmits((count) => count + 1);
        }}
      >
        <Rating label="업무 평점" name="rating" required disabled={disabled} />
        <Rating label="이름 없는 평점" required disabled={disabled} />
        <button type="submit">평점 제출</button>
        <button type="reset">평점 초기화</button>
        <output data-testid="rating-submits">{ratingSubmits}</output>
      </form>
      <form
        aria-label="임시 입력"
        className="cheese-stack"
        onSubmit={(event) => event.preventDefault()}
        onReset={(event) => {
          if (preventReset) event.preventDefault();
        }}
      >
        <TagsInput
          label="업무 태그"
          name="tags"
          defaultValue={["기본"]}
          value={controlled ? tags : undefined}
          onValueChange={setTags}
        />
        <Editable
          label="업무 제목"
          name="title"
          defaultValue="기본 업무"
          value={controlled ? text : undefined}
          onValueChange={setText}
          required
        />
        <button type="reset">임시 입력 초기화</button>
      </form>
      <form
        aria-label="기간 제출"
        className="cheese-stack"
        onReset={(event) => {
          if (preventReset) event.preventDefault();
        }}
      >
        <fieldset disabled={fieldsetDisabled}>
          <MonthPicker
            label="계획 월"
            name="month"
            defaultValue="2026-09"
            value={controlled ? month : undefined}
            onValueChange={setMonth}
            disabled={disabled}
          />
          <YearPicker
            label="계획 연도"
            name="year"
            defaultValue={2026}
            value={controlled ? year : undefined}
            onValueChange={setYear}
            disabled={disabled}
          />
        </fieldset>
        <button type="reset">기간 초기화</button>
      </form>
    </main>
  );
}

if (params.get("framework") === "vue")
  createApp(FieldContracts, { controlled }).mount("#root");
else createRoot(document.getElementById("root")!).render(<ReactFixture />);
