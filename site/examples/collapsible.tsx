import {
  Button,
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@cheese/react";
export default function Example() {
  return (
    <CollapsibleRoot>
      <CollapsibleTrigger asChild>
        <Button variant="weak">추가 설명 펼치기 / 접기</Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p>추가 설정은 조직별 평가 정책에 따라 변경할 수 있습니다.</p>
      </CollapsibleContent>
    </CollapsibleRoot>
  );
}
