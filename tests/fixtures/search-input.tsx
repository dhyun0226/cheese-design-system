import "@cheese/css";
import { useState, type FormEvent, type KeyboardEvent } from "react";
import { createRoot } from "react-dom/client";
import { createApp } from "vue";
import { SearchInput } from "@cheese/react";
import VueFixture from "./SearchInput.vue";

const params = new URLSearchParams(location.search);
const scenario = params.get("scenario") ?? "search";
const external = params.has("external");

function ReactFixture() {
  const controlled = ["controlled", "reject", "normalize"].includes(scenario);
  const [value, setValue] = useState("저장 업무");
  const [changes, setChanges] = useState<string[]>([]);
  const [searches, setSearches] = useState<string[]>([]);
  const [submits, setSubmits] = useState(0);
  const [result, setResult] = useState("");
  const [cancelReset, setCancelReset] = useState(false);
  const [resets, setResets] = useState(0);
  const [escapes, setEscapes] = useState<boolean[]>([]);
  const [keyCount, setKeyCount] = useState(0);
  const [compositions, setCompositions] = useState([0, 0, 0]);
  function change(next: string) {
    setChanges((previous) => [...previous, next]);
    if (scenario !== "reject")
      setValue(scenario === "normalize" ? next.toUpperCase() : next);
  }
  function composition(index: number) {
    setCompositions((previous) =>
      previous.map((count, position) => count + Number(position === index)),
    );
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmits((count) => count + 1);
    setResult(JSON.stringify([...new FormData(event.currentTarget)]));
  }
  function reset(event: FormEvent<HTMLFormElement>) {
    setResets((count) => count + 1);
    if (cancelReset) event.preventDefault();
  }
  function escape(event: KeyboardEvent) {
    if (event.key === "Escape")
      setEscapes((previous) => [...previous, event.defaultPrevented]);
  }
  const input = (
    <SearchInput
      label="업무 검색"
      name="query"
      form={external ? "search-form" : undefined}
      defaultValue={scenario === "native" ? "" : "기본 업무"}
      value={controlled ? value : undefined}
      onValueChange={change}
      onSearch={
        scenario === "native"
          ? undefined
          : (query) => setSearches((previous) => [...previous, query])
      }
      description="제목 또는 담당자로 검색하세요."
      placeholder="업무 제목 검색"
      autoComplete="off"
      required={scenario === "native"}
      disabled={scenario === "disabled"}
      readOnly={scenario === "readonly"}
      onKeyDown={() => setKeyCount((count) => count + 1)}
      onCompositionStart={() => composition(0)}
      onCompositionUpdate={() => composition(1)}
      onCompositionEnd={() => composition(2)}
    />
  );
  return (
    <main
      className="cheese-root cheese-stack"
      style={{ maxWidth: 560, margin: "0 auto", padding: 16 }}
      onKeyDown={escape}
    >
      <h1>검색 입력 계약</h1>
      <label>
        <input
          type="checkbox"
          checked={cancelReset}
          onChange={(event) => setCancelReset(event.target.checked)}
        />
        초기화 취소
      </label>
      <form
        id="search-form"
        aria-label="검색 폼"
        className="cheese-stack"
        onSubmit={submit}
        onReset={reset}
      >
        {!external && input}
      </form>
      {external && input}
      <button type="submit" form="search-form">
        폼 제출
      </button>
      <button type="reset" form="search-form">
        검색 초기화
      </button>
      <output data-testid="changes">{JSON.stringify(changes)}</output>
      <output data-testid="searches">{JSON.stringify(searches)}</output>
      <output data-testid="submits">{submits}</output>
      <output data-testid="resets">{resets}</output>
      <output data-testid="result">{result}</output>
      <output data-testid="escapes">{JSON.stringify(escapes)}</output>
      <output data-testid="key-count">{keyCount}</output>
      <output data-testid="compositions">{JSON.stringify(compositions)}</output>
    </main>
  );
}

if (params.get("framework") === "vue")
  createApp(VueFixture, { scenario, external }).mount("#root");
else createRoot(document.getElementById("root")!).render(<ReactFixture />);
