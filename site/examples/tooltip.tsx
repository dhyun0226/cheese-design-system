import { Tooltip, Button, Info } from "@cheese/react";
export default function Example() {
  return (
    <Tooltip content="마감 이후에는 평가를 수정할 수 없습니다.">
      <Button variant="weak" aria-label="마감 정책 안내">
        <Info aria-hidden="true" />
        마감 정책
      </Button>
    </Tooltip>
  );
}
