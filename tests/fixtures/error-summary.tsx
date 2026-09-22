import "@cheese/css";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { createApp } from "vue";
import {
  DateField,
  ErrorSummary,
  Input,
  Select,
  type ErrorSummaryItem,
} from "@cheese/react";
import ErrorSummaryFixture from "./ErrorSummary.vue";

const initialErrors: ErrorSummaryItem[] = [
  { id: "name", message: "업무 이름을 입력해 주세요.", targetId: "task-name" },
  { id: "assignee", message: "담당자를 선택해 주세요.", targetId: "assignee" },
  { id: "date", message: "마감일을 입력해 주세요.", targetId: "due-date" },
  { id: "group", message: "연결된 항목을 확인해 주세요.", targetId: "group" },
  {
    id: "custom",
    message: "복합 항목을 확인해 주세요.",
    targetId: "custom-default",
  },
  {
    id: "disabled",
    message: "사용할 수 없는 항목입니다.",
    targetId: "disabled-target",
  },
  { id: "hidden", message: "숨겨진 항목입니다.", targetId: "hidden-target" },
  {
    id: "missing",
    message: "존재하지 않는 항목입니다.",
    targetId: "missing-target",
  },
  {
    id: "server",
    message:
      "저장하지 못했습니다. 입력 내용은 유지되며 잠시 후 다시 시도할 수 있습니다.",
  },
];

function ReactFixture() {
  const [errors, setErrors] = useState<ErrorSummaryItem[]>(initialErrors);
  const summary = useRef<HTMLDivElement>(null);
  return (
    <main
      className="cheese-root cheese-stack"
      style={{
        boxSizing: "border-box",
        width: "100%",
        maxWidth: 600,
        margin: "24px auto",
        padding: 20,
      }}
    >
      <h1>오류 요약</h1>
      <form
        className="cheese-stack"
        noValidate
        aria-label="업무 작성"
        onSubmit={(event) => {
          event.preventDefault();
          flushSync(() => setErrors(initialErrors));
          summary.current?.focus();
        }}
      >
        <ErrorSummary
          ref={summary}
          errors={errors}
          onNavigate={(item, event) => {
            if (item.id === "custom") {
              event.preventDefault();
              document.getElementById("custom-target")?.focus();
            }
          }}
        />
        <label htmlFor="task-name">업무 이름</label>
        <Input id="task-name" name="name" />
        <Select
          id="assignee"
          label="담당자"
          name="assignee"
          options={[{ value: "kim", label: "김치즈" }]}
        />
        <DateField id="due-date" label="마감일" name="date" />
        <div id="group">
          <input
            aria-label="내부 제출 값"
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              clip: "rect(0px, 0px, 0px, 0px)",
            }}
            tabIndex={-1}
          />
          <button type="button">연결 항목 선택</button>
        </div>
        <button id="custom-default" type="button">
          기본 복합 항목
        </button>
        <button id="custom-target" type="button">
          직접 지정한 복합 항목
        </button>
        <button id="disabled-target" type="button" disabled>
          사용 불가
        </button>
        <input id="hidden-target" type="hidden" value="proxy" readOnly />
        <button type="submit">제출 실패</button>
        <button type="button" onClick={() => setErrors([])}>
          오류 지우기
        </button>
        <button
          type="button"
          onClick={() =>
            setErrors([
              ...initialErrors,
              { id: "long", message: "긴오류메시지".repeat(35) },
            ])
          }
        >
          오류 추가
        </button>
      </form>
    </main>
  );
}

if (new URLSearchParams(location.search).get("framework") === "vue")
  createApp(ErrorSummaryFixture, { initialErrors }).mount("#root");
else createRoot(document.getElementById("root")!).render(<ReactFixture />);
