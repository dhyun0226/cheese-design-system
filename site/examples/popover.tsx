import {
  Button,
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  Checkbox,
} from "@cheese/react";
export default function Example() {
  return (
    <PopoverRoot>
      <PopoverTrigger asChild>
        <Button variant="weak">표시 항목</Button>
      </PopoverTrigger>
      <PopoverContent aria-label="표시 항목 설정">
        <div className="cheese-stack">
          <Checkbox label="이름" defaultChecked />
          <Checkbox label="소속 조직" defaultChecked />
          <Checkbox label="평가 상태" />
        </div>
      </PopoverContent>
    </PopoverRoot>
  );
}
