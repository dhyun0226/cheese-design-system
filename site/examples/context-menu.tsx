import { useState } from "react";
import {
  ContextMenuRoot,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  Card,
} from "@cheese/react";
export default function Example() {
  const [action, setAction] = useState("없음");
  return (
    <ContextMenuRoot>
      <ContextMenuTrigger asChild>
        <Card tabIndex={0}>
          마우스 오른쪽 버튼 또는 Shift + F10으로 메뉴를 여세요.
          <p role="status" className="cheese-help">
            선택: {action}
          </p>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => setAction("복사")}>
          복사
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => setAction("이름 바꾸기")}>
          이름 바꾸기
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenuRoot>
  );
}
