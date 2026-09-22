import { ScrollArea, List, Table } from "@cheese/react";
export default function Example() {
  return (
    <div className="cheese-stack">
      <ScrollArea height={220} label="최근 업무 기록">
        <List>
          {Array.from({ length: 15 }, (_, i) => (
            <li key={i}>업무 기록 {String(i + 1).padStart(2, "0")}</li>
          ))}
        </List>
      </ScrollArea>
      <ScrollArea
        height={180}
        orientation="both"
        label="가로·세로 업무 현황"
        style={{ maxWidth: "100%" }}
      >
        <div style={{ minWidth: 740 }}>
          <Table
            caption="가상 평가 진행 현황"
            headers={["이름", "조직", "직무", "평가자", "제출 기한"]}
            rows={Array.from({ length: 12 }, (_, index) => [
              `구성원 ${index + 1}`,
              "피플팀",
              "인사 운영",
              "평가 담당자",
              "2026-10-30",
            ])}
          />
        </div>
      </ScrollArea>
      <p className="cheese-help">
        영역에 Tab으로 진입한 뒤 방향키·Page Down으로 이동하세요. 긴 표는
        가로로도 스크롤할 수 있습니다.
      </p>
    </div>
  );
}
