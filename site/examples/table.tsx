import { Table, Badge } from "@cheese/react";
export default function Example() {
  return (
    <Table
      caption="평가 현황 · 가상 데이터"
      headers={["이름", "조직", "상태"]}
      rows={[
        ["김치즈", "피플팀", <Badge tone="positive">제출 완료</Badge>],
        ["이달", "개발팀", <Badge tone="brand">작성 중</Badge>],
        ["박우주", "크리에이티브팀", <Badge>작성 전</Badge>],
      ]}
    />
  );
}
