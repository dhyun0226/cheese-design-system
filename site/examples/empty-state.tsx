import { EmptyState, Button } from "@cheese/react";
import { useState } from "react";
export default function Example() {
  const [reset, setReset] = useState(false);
  return (
    <EmptyState
      title="검색 결과가 없습니다."
      description={
        reset
          ? "필터가 초기화되었습니다. 검색어를 입력해 다시 찾아보세요."
          : "검색어를 바꾸거나 필터 조건을 확인해 주세요."
      }
    >
      <Button variant="weak" onClick={() => setReset(true)}>
        {reset ? "초기화 완료" : "필터 초기화"}
      </Button>
    </EmptyState>
  );
}
