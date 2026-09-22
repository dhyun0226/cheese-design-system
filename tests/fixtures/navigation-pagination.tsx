import "@cheese/css";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { createApp } from "vue";
import {
  Pagination,
  NavigationMenuRoot,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  MenubarRoot,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  ToolbarRoot,
  ToolbarToggleGroup,
  ToolbarToggleItem,
  ToolbarButton,
  ToolbarSeparator,
  Bold,
  Italic,
  Save,
} from "@cheese/react";
import NavigationPagination from "./NavigationPagination.vue";

function ReactFixture() {
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(20);
  const [disabled, setDisabled] = useState(false);
  const [events, setEvents] = useState<number[]>([]);
  const [formats, setFormats] = useState<string[]>([]);
  const [action, setAction] = useState("없음");

  return (
    <main
      className="cheese-root cheese-stack"
      style={{ maxWidth: 720, margin: "24px auto", padding: 8 }}
    >
      <h1>탐색 및 페이지 이동</h1>
      <section aria-label="페이지 이동 검증" className="cheese-stack">
        <div className="cheese-inline">
          <label>
            전체 페이지 수
            <input
              type="number"
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
            />
          </label>
          <label>
            현재 페이지
            <input
              type="number"
              value={page}
              onChange={(event) => setPage(Number(event.target.value))}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={disabled}
              onChange={(event) => setDisabled(event.target.checked)}
            />
            페이지 이동 비활성화
          </label>
        </div>
        <Pagination
          page={page}
          count={count}
          disabled={disabled}
          onPageChange={(next) => {
            setPage(next);
            setEvents((previous) => [...previous, next]);
          }}
        />
        <output aria-label="페이지 변경 기록" data-testid="page-events">
          {JSON.stringify(events)}
        </output>
      </section>
      <section aria-label="탐색 높이 검증" className="cheese-stack">
        <NavigationMenuRoot aria-label="업무 서비스">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>평가 관리</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="#evaluation">
                  평가 목록
                  <br />
                  팀별 평가 진행 상황과 제출 기한을 확인합니다.
                </NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>조직</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="#organization">
                  조직도
                </NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#guide">사용 안내</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenuRoot>
        <MenubarRoot aria-label="문서 메뉴">
          <MenubarMenu>
            <MenubarTrigger>파일</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onSelect={() => setAction("새 문서")}>
                새 문서
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>편집</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onSelect={() => setAction("이름 변경")}>
                이름 변경
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </MenubarRoot>
        <ToolbarRoot aria-label="문서 서식">
          <ToolbarToggleGroup
            type="multiple"
            value={formats}
            onValueChange={setFormats}
            aria-label="문자 서식"
          >
            <ToolbarToggleItem value="굵게" aria-label="굵게">
              <Bold />
            </ToolbarToggleItem>
            <ToolbarToggleItem value="기울임" aria-label="기울임">
              <Italic />
            </ToolbarToggleItem>
          </ToolbarToggleGroup>
          <ToolbarSeparator />
          <ToolbarButton
            aria-label="문서 저장"
            onClick={() => setAction("저장")}
          >
            <Save size={18} />
          </ToolbarButton>
        </ToolbarRoot>
        <output aria-label="문서 변경 기록">
          {action} · {formats.join(", ") || "서식 없음"}
        </output>
      </section>
    </main>
  );
}

if (new URLSearchParams(location.search).get("framework") === "vue") {
  createApp(NavigationPagination).mount("#root");
} else {
  createRoot(document.getElementById("root")!).render(<ReactFixture />);
}
