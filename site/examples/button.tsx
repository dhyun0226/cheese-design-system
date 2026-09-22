import { Button, Plus } from "@cheese/react";
export default function Example() {
  return (
    <div className="cheese-inline">
      <Button>저장하기</Button>
      <Button variant="accent">
        <Plus aria-hidden="true" />새 평가 만들기
      </Button>
      <Button variant="weak">취소</Button>
      <Button disabled>비활성</Button>
      <Button loading>저장 중</Button>
    </div>
  );
}
