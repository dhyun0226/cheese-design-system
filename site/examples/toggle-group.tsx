import { ToggleGroup, ToggleGroupItem } from "@cheese/react";
export default function Example() {
  return (
    <ToggleGroup type="single" defaultValue="all" aria-label="평가 필터">
      <ToggleGroupItem value="all">전체</ToggleGroupItem>
      <ToggleGroupItem value="progress">진행 중</ToggleGroupItem>
      <ToggleGroupItem value="done">완료</ToggleGroupItem>
    </ToggleGroup>
  );
}
