<script setup lang="ts">
import { ref } from "vue";
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
} from "@cheese/vue";

const page = ref(1);
const count = ref(20);
const disabled = ref(false);
const events = ref<number[]>([]);
const formats = ref<string[]>([]);
const action = ref("없음");
</script>

<template>
  <main
    class="cheese-root cheese-stack"
    style="max-width: 720px; margin: 24px auto; padding: 8px"
  >
    <h1>탐색 및 페이지 이동</h1>
    <section aria-label="페이지 이동 검증" class="cheese-stack">
      <div class="cheese-inline">
        <label>
          전체 페이지 수
          <input v-model.number="count" type="number" />
        </label>
        <label>
          현재 페이지
          <input v-model.number="page" type="number" />
        </label>
        <label>
          <input v-model="disabled" type="checkbox" />
          페이지 이동 비활성화
        </label>
      </div>
      <Pagination
        v-model:page="page"
        :count="count"
        :disabled="disabled"
        @page-change="events.push($event)"
      />
      <output aria-label="페이지 변경 기록" data-testid="page-events">
        {{ JSON.stringify(events) }}
      </output>
    </section>
    <section aria-label="탐색 높이 검증" class="cheese-stack">
      <NavigationMenuRoot aria-label="업무 서비스">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>평가 관리</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#evaluation">
                평가 목록<br />팀별 평가 진행 상황과 제출 기한을 확인합니다.
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>조직</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#organization"
                >조직도</NavigationMenuLink
              >
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
            <MenubarItem @select="action = '새 문서'">새 문서</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>편집</MenubarTrigger>
          <MenubarContent>
            <MenubarItem @select="action = '이름 변경'">이름 변경</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </MenubarRoot>
      <ToolbarRoot aria-label="문서 서식">
        <ToolbarToggleGroup
          v-model="formats"
          type="multiple"
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
        <ToolbarButton aria-label="문서 저장" @click="action = '저장'">
          <Save :size="18" />
        </ToolbarButton>
      </ToolbarRoot>
      <output aria-label="문서 변경 기록">
        {{ action }} · {{ formats.join(", ") || "서식 없음" }}
      </output>
    </section>
  </main>
</template>
