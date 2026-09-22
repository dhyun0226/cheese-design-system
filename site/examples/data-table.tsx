import { DataTable } from "@cheese/react";
import { demoColumns, demoLoadRows } from "../business-demo";
export default function Example() {
  return (
    <div className="cheese-stack">
      <p className="cheese-help">
        가상 직원 24명 · 서버 정렬/검색/페이지 응답 시뮬레이션. ‘오류’ 검색으로
        실패·재시도를 체험하세요. 전체 선택은 현재 페이지에만 적용됩니다.
      </p>
      <DataTable
        label="평가 대상자"
        columns={demoColumns}
        loadRows={demoLoadRows}
        getRowId={(row) => String(row.id)}
        rowLabel={(row) => String(row.name)}
        isRowSelectable={(row) => row.id !== "24"}
      />
    </div>
  );
}
