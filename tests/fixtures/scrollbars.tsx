import "@cheese/css";
import { useRef } from "react";
import { createRoot } from "react-dom/client";
import { createApp, h, shallowRef } from "vue";
import { ScrollArea as ReactScrollArea, Button } from "@cheese/react";
import { ScrollArea as VueScrollArea, Button as VueButton } from "@cheese/vue";

const paragraphs = Array.from({ length: 30 }, (_, i) => `업무 항목 ${i + 1}`);
const shared = { style: { width: "320px", maxWidth: "100%" } };
function ReactFixture() {
  const viewport = useRef<HTMLDivElement>(null);
  return (
    <>
      <main
        className="cheese-root cheese-stack"
        style={{ padding: 24, maxWidth: 760 }}
      >
        <h1>React scroll contracts</h1>
        <ReactScrollArea
          {...shared}
          className="consumer-region"
          label="업무 목록"
          height="200px"
          viewportRef={viewport}
          viewportProps={{
            className: "consumer-viewport",
            "aria-describedby": "scroll-help",
          }}
          data-testid="vertical"
        >
          {paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </ReactScrollArea>
        <p id="scroll-help">방향키와 Page Down으로 탐색할 수 있습니다.</p>
        <Button onClick={() => viewport.current?.scrollTo({ top: 160 })}>
          목록 중간으로 이동
        </Button>
        <ReactScrollArea
          {...shared}
          label="가로 일정"
          height={140}
          orientation="horizontal"
          data-testid="horizontal"
        >
          <div style={{ width: 900 }}>
            월요일 · 화요일 · 수요일 · 목요일 · 금요일
          </div>
        </ReactScrollArea>
        <ReactScrollArea
          {...shared}
          label="전체 현황"
          height={180}
          orientation="both"
          data-testid="both"
        >
          <div style={{ width: 900, height: 700 }}>
            가로와 세로로 탐색하는 업무 현황
          </div>
        </ReactScrollArea>
        <ReactScrollArea
          {...shared}
          label="짧은 안내"
          height={100}
          data-testid="fits"
        >
          추가 업무가 없습니다.
        </ReactScrollArea>
        <div
          role="region"
          aria-label="기본 스크롤 목록"
          tabIndex={0}
          data-testid="native"
          style={{ height: 100, overflow: "auto" }}
        >
          {paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <textarea
          aria-label="업무 메모"
          className="cheese-input"
          defaultValue={paragraphs.join("\n")}
          rows={3}
        />
      </main>
      <div data-testid="outside" style={{ height: 50, overflow: "auto" }}>
        Outside CHEESE scope
      </div>
    </>
  );
}

if (new URLSearchParams(location.search).get("framework") === "vue") {
  createApp({
    setup() {
      const area = shallowRef<{
        scrollTo: (options: ScrollToOptions) => void;
      }>();
      return () =>
        h("div", [
          h(
            "main",
            {
              class: "cheese-root cheese-stack",
              style: { padding: "24px", maxWidth: "760px" },
            },
            [
              h("h1", "Vue scroll contracts"),
              h(
                VueScrollArea,
                {
                  ...shared,
                  ref: area,
                  class: "consumer-region",
                  label: "업무 목록",
                  height: "200px",
                  viewportProps: {
                    class: "consumer-viewport",
                    "aria-describedby": "scroll-help",
                  },
                  "data-testid": "vertical",
                },
                () => paragraphs.map((p) => h("p", { key: p }, p)),
              ),
              h(
                "p",
                { id: "scroll-help" },
                "방향키와 Page Down으로 탐색할 수 있습니다.",
              ),
              h(
                VueButton,
                { onClick: () => area.value?.scrollTo({ top: 160 }) },
                () => "목록 중간으로 이동",
              ),
              h(
                VueScrollArea,
                {
                  ...shared,
                  label: "가로 일정",
                  height: 140,
                  orientation: "horizontal",
                  "data-testid": "horizontal",
                },
                () =>
                  h(
                    "div",
                    { style: { width: "900px" } },
                    "월요일 · 화요일 · 수요일 · 목요일 · 금요일",
                  ),
              ),
              h(
                VueScrollArea,
                {
                  ...shared,
                  label: "전체 현황",
                  height: 180,
                  orientation: "both",
                  "data-testid": "both",
                },
                () =>
                  h(
                    "div",
                    { style: { width: "900px", height: "700px" } },
                    "가로와 세로로 탐색하는 업무 현황",
                  ),
              ),
              h(
                VueScrollArea,
                {
                  ...shared,
                  label: "짧은 안내",
                  height: 100,
                  "data-testid": "fits",
                },
                () => "추가 업무가 없습니다.",
              ),
              h(
                "div",
                {
                  role: "region",
                  "aria-label": "기본 스크롤 목록",
                  tabindex: 0,
                  "data-testid": "native",
                  style: { height: "100px", overflow: "auto" },
                },
                paragraphs.map((p) => h("p", { key: p }, p)),
              ),
              h("textarea", {
                "aria-label": "업무 메모",
                class: "cheese-input",
                value: paragraphs.join("\n"),
                rows: 3,
              }),
            ],
          ),
          h(
            "div",
            {
              "data-testid": "outside",
              style: { height: "50px", overflow: "auto" },
            },
            "Outside CHEESE scope",
          ),
        ]);
    },
  }).mount("#root");
} else createRoot(document.getElementById("root")!).render(<ReactFixture />);
