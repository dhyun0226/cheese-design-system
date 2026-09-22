import { Splitter, Tree } from "@cheese/react";
export default function Example() {
  return (
    <div className="cheese-stack">
      <Splitter
        label="조직 패널 크기"
        first={
          <Tree
            label="프로젝트 조직"
            nodes={[
              {
                id: "people",
                label: "피플팀",
                children: [{ id: "evaluation", label: "평가 관리" }],
              },
            ]}
            defaultExpanded={["people"]}
          />
        }
        second={
          <div className="cheese-stack">
            <h2>업무 공간</h2>
            <p className="cheese-help">
              구분선을 드래그하거나 포커스한 뒤 방향키로 너비를 조절하세요.
            </p>
          </div>
        }
      />
      <p className="cheese-help">
        ← → 2% 조절 · Shift와 함께 10% · Home/End 허용 범위
      </p>
    </div>
  );
}
