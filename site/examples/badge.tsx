import { Badge } from "@cheese/react";
export default function Example() {
  return (
    <div className="cheese-inline">
      <Badge>작성 전</Badge>
      <Badge tone="brand">진행 중</Badge>
      <Badge tone="positive">완료</Badge>
      <Badge tone="critical">확인 필요</Badge>
    </div>
  );
}
