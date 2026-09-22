import { useState } from "react";
import {
  Button,
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
  Calendar,
  formatDate,
  type DateRange,
} from "@cheese/react";
export default function Example() {
  const [range, setRange] = useState<DateRange>();
  return (
    <PopoverRoot>
      <PopoverTrigger asChild>
        <Button variant="weak">
          {range?.from && range.to
            ? formatDate(range.from) + " ~ " + formatDate(range.to)
            : "평가 기간 선택"}
        </Button>
      </PopoverTrigger>
      <PopoverContent aria-label="평가 기간 달력">
        <Calendar
          mode="range"
          defaultMonth={new Date(2026, 9, 1)}
          selected={range}
          onSelect={setRange}
          footer={
            range?.from
              ? formatDate(range.from) +
                " ~ " +
                (range.to ? formatDate(range.to) : "종료일 선택")
              : "시작일과 종료일을 선택하세요."
          }
        />
        <PopoverClose asChild>
          <Button disabled={!range?.from || !range?.to}>선택 완료</Button>
        </PopoverClose>
      </PopoverContent>
    </PopoverRoot>
  );
}
