import { useState } from "react";
import {
  MenubarRoot,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  File,
  Save,
  Pencil,
} from "@cheese/react";
export default function Example() {
  const [action, setAction] = useState("선택 없음");
  return (
    <div className="cheese-stack">
      <MenubarRoot aria-label="문서 메뉴">
        <MenubarMenu>
          <MenubarTrigger>파일</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onSelect={() => setAction("새 문서")}>
              <File size={16} />새 문서
            </MenubarItem>
            <MenubarItem onSelect={() => setAction("저장")}>
              <Save size={16} />
              저장
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem disabled>내보내기 (권한 없음)</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>편집</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onSelect={() => setAction("이름 변경")}>
              <Pencil size={16} />
              이름 변경
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </MenubarRoot>
      <p className="cheese-help" role="status">
        선택한 명령: {action}
      </p>
    </div>
  );
}
