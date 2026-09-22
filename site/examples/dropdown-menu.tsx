import { useState } from "react";
import {
  Button,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@cheese/react";
export default function Example() {
  const [action, setAction] = useState("선택 없음");
  return (
    <div className="cheese-stack">
      <DropdownMenuRoot>
        <DropdownMenuTrigger asChild>
          <Button variant="weak">평가 작업</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => setAction("복제")}>
            복제
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setAction("보관")}>
            보관
          </DropdownMenuItem>
          <DropdownMenuItem disabled>내보내기 (권한 없음)</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuRoot>
      <p className="cheese-help" role="status">
        선택한 작업: {action}
      </p>
    </div>
  );
}
