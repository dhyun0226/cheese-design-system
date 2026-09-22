<script setup lang="ts">
import { ref } from "vue";
import {
  Card,
  Select,
  Combobox,
  Listbox,
  PinInput,
  TagsInput,
  Editable,
  Rating,
  ColorPicker,
  DateRangeField,
  TimeRangeField,
  MonthPicker,
  YearPicker,
  Splitter,
  Carousel,
  Button,
  Badge,
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardContent,
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
  ToolbarButton,
  ToolbarToggleGroup,
  ToolbarToggleItem,
  Bold,
  Italic,
  Save,
} from "@cheese/vue";
const options = [
  { value: "people", label: "피플팀", description: "인사 · 조직 문화" },
  { value: "tech", label: "개발팀", description: "시스템 · 플랫폼" },
  { value: "inactive", label: "비활성 조직", disabled: true },
];
const team = ref("people"),
  search = ref(""),
  tags = ref(["평가"]),
  title = ref("하반기 평가"),
  rating = ref(3),
  color = ref("#FFC928"),
  month = ref("2026-09"),
  year = ref(2026),
  menuAction = ref("없음"),
  formats = ref<string[]>([]),
  saved = ref(false),
  formResult = ref("제출 전");
const slides = ["목표를 정하세요", "기록을 남기세요", "피드백을 나누세요"];
function submit(event: Event) {
  formResult.value = JSON.stringify(
    Object.fromEntries(new FormData(event.target as HTMLFormElement)),
  );
}
</script>
<template>
  <section class="doc-section" aria-label="Vue 확장 컴포넌트">
    <h2>더 많은 실제 Vue 컴포넌트</h2>
    <p>
      같은 토큰과 스타일을 사용하는 Reka 기반 및 CHEESE 업무 컴포넌트입니다.
    </p>
    <div class="vue-grid">
      <Card
        ><h3>Select · 검색 · 목록</h3>
        <div class="cheese-stack">
          <Select
            label="Vue 담당 조직"
            v-model="team"
            :options="options"
          /><Combobox
            label="Vue 조직 검색"
            v-model="search"
            :options="options"
          /><Listbox label="Vue 조직 목록" v-model="team" :options="options" />
          <p class="cheese-help" role="status">
            조직: {{ team }} · 검색: {{ search || "없음" }}
          </p>
        </div></Card
      >
      <Card
        ><h3>편집 · 태그 · 평점</h3>
        <div class="cheese-stack">
          <TagsInput label="Vue 태그" v-model="tags" :max="5" /><Editable
            label="Vue 평가 이름"
            v-model="title"
            required
          /><Rating label="Vue 만족도" v-model="rating" /><ColorPicker
            label="Vue 브랜드 색상"
            v-model="color"
          /></div
      ></Card>
      <Card
        ><h3>폼 · 기간</h3>
        <form class="cheese-stack" @submit.prevent="submit">
          <PinInput label="Vue 인증 코드" name="code" required /><DateRangeField
            label="Vue 평가 기간"
            name="period"
            required
          /><TimeRangeField
            label="Vue 회의 시간"
            name="time"
            :default-value="{ start: '09:00', end: '10:00' }"
            required
          />
          <div class="cheese-inline">
            <Button type="submit">Vue 확장 폼 제출</Button
            ><Button type="reset" variant="weak">Vue 확장 폼 초기화</Button>
          </div>
          <p class="cheese-help" role="status">{{ formResult }}</p>
        </form></Card
      >
      <Card
        ><h3>월 · 연도</h3>
        <div class="cheese-stack">
          <MonthPicker
            label="Vue 평가 월"
            v-model="month"
            min="2025-01"
            max="2027-12"
          /><YearPicker
            label="Vue 기준 연도"
            v-model="year"
            :min="2020"
            :max="2040"
          />
          <p class="cheese-help" role="status">{{ month }} · {{ year }}</p>
        </div></Card
      >
      <Card
        ><h3>메뉴 · 툴바</h3>
        <div class="cheese-stack">
          <NavigationMenuRoot aria-label="Vue 업무 서비스"
            ><NavigationMenuList
              ><NavigationMenuItem
                ><NavigationMenuTrigger>업무 안내</NavigationMenuTrigger
                ><NavigationMenuContent
                  ><NavigationMenuLink href="./#/components/table"
                    >평가 목록</NavigationMenuLink
                  ><NavigationMenuLink href="./#/components/tree"
                    >조직도</NavigationMenuLink
                  ></NavigationMenuContent
                ></NavigationMenuItem
              ></NavigationMenuList
            ></NavigationMenuRoot
          ><MenubarRoot aria-label="Vue 문서 메뉴"
            ><MenubarMenu
              ><MenubarTrigger>파일</MenubarTrigger
              ><MenubarContent
                ><MenubarItem @select="menuAction = '새 문서'"
                  >새 문서</MenubarItem
                ><MenubarItem @select="menuAction = '저장'"
                  >저장</MenubarItem
                ></MenubarContent
              ></MenubarMenu
            ></MenubarRoot
          ><ToolbarRoot aria-label="Vue 문서 서식"
            ><ToolbarToggleGroup
              v-model="formats"
              type="multiple"
              aria-label="문자 서식"
              ><ToolbarToggleItem value="굵게" aria-label="굵게"
                ><Bold /></ToolbarToggleItem
              ><ToolbarToggleItem value="기울임" aria-label="기울임"
                ><Italic /></ToolbarToggleItem></ToolbarToggleGroup
            ><ToolbarButton aria-label="Vue 문서 저장" @click="saved = true"
              ><Save :size="18" /></ToolbarButton
          ></ToolbarRoot>
          <p class="cheese-help" role="status">
            명령: {{ menuAction }} · 서식: {{ formats.join(", ") || "없음"
            }}{{ saved ? " · 저장됨" : "" }}
          </p>
          <HoverCardRoot :open-delay="200"
            ><HoverCardTrigger as-child
              ><a class="cheese-navigation-link" href="./#/components/avatar"
                >Vue 담당자 정보</a
              ></HoverCardTrigger
            ><HoverCardContent
              ><strong>김치즈 · 피플팀</strong>
              <p class="cheese-help">인사평가 담당자</p></HoverCardContent
            ></HoverCardRoot
          >
        </div></Card
      >
      <Card
        ><h3>패널 · 캐러셀</h3>
        <div class="cheese-stack">
          <Splitter label="Vue 패널 크기"
            ><template #first
              ><strong>조직</strong>
              <p class="cheese-help">피플팀</p></template
            ><template #second
              ><strong>업무 공간</strong>
              <p class="cheese-help">구분선을 드래그해 보세요.</p></template
            ></Splitter
          ><Carousel label="Vue 업무 안내" :count="slides.length"
            ><template #default="{ index }"
              ><Card
                ><Badge tone="brand">STEP {{ index + 1 }}</Badge>
                <h3>{{ slides[index] }}</h3></Card
              ></template
            ></Carousel
          >
        </div></Card
      >
    </div>
  </section>
</template>
