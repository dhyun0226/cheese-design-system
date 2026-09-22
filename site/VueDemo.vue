<script setup lang="ts">
import { ref, shallowRef } from "vue";
import { CalendarDate, type DateValue } from "@internationalized/date";
import { Calendar } from "@cheese/vue";
const calendarDate = shallowRef<DateValue>(new CalendarDate(2026, 10, 12));
import {
  Button,
  Input,
  Textarea,
  NativeSelect,
  Field,
  Card,
  Badge,
  CheckboxRoot,
  CheckboxIndicator,
  SwitchRoot,
  SwitchThumb,
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  Tree,
  RadioGroupRoot,
  RadioGroupItem,
  RadioGroupIndicator,
  SliderRoot,
  SliderTrack,
  SliderRange,
  SliderThumb,
  AccordionRoot,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
  ContextMenuRoot,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@cheese/vue";
const name = ref(""),
  memo = ref(""),
  team = ref("people"),
  checked = ref(false),
  notifications = ref(false),
  error = ref(""),
  saved = ref(false),
  selected = ref("없음"),
  value = ref([40]),
  scope = ref("team");
const menuAction = ref("없음");
const nodes = [
  {
    id: "company",
    label: "CHEESE Studio",
    children: [
      {
        id: "people",
        label: "피플팀",
        children: [{ id: "ops", label: "인사 운영" }],
      },
      { id: "tech", label: "개발팀" },
    ],
  },
];
function save() {
  error.value = name.value.trim() ? "" : "이름을 입력해 주세요.";
  saved.value = !error.value;
}
</script>
<template>
  <div class="cheese-root vue-page">
    <header class="vue-header">
      <a href="./index.html#/">← CHEESE 문서</a><Badge>Vue · Reka UI</Badge>
    </header>
    <main>
      <div class="page-heading">
        <span class="eyebrow">REAL PACKAGE INTEGRATION</span>
        <h1>같은 기준, Vue에서도.</h1>
        <p>
          실제 @cheese/vue 패키지의 상태·이벤트·접근성을 확인하는 통합
          예제입니다.
        </p>
      </div>
      <div class="vue-grid">
        <Card>
          <h2>Context Menu · 키보드와 포인터</h2>
          <ContextMenuRoot>
            <ContextMenuTrigger as-child>
              <Card tabindex="0" aria-label="Vue 작업 영역"
                >오른쪽 클릭 또는 Shift + F10으로 작업 메뉴를 여세요.</Card
              >
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem @select="menuAction = '복사'"
                >복사</ContextMenuItem
              >
              <ContextMenuItem @select="menuAction = '이름 바꾸기'"
                >이름 바꾸기</ContextMenuItem
              >
            </ContextMenuContent>
          </ContextMenuRoot>
          <p role="status" class="cheese-help">작업: {{ menuAction }}</p>
        </Card>
        <Card
          ><h2>Calendar · 한국어 날짜 선택</h2>
          <Calendar
            v-model="calendarDate"
            label="Vue 평가 달력"
            :min-value="new CalendarDate(2026, 10, 5)"
            :max-value="new CalendarDate(2026, 12, 31)"
          />
          <p class="cheese-help" role="status">
            날짜: {{ calendarDate?.toString() }}
          </p></Card
        >
        <Card
          ><h2>폼과 v-model</h2>
          <form class="cheese-stack" novalidate @submit.prevent="save">
            <Field label="이름" :error="error" required
              ><Input
                v-model="name"
                placeholder="이름 입력"
                name="name"
                @input="
                  error = '';
                  saved = false;
                "
            /></Field>
            <Field label="조직"
              ><NativeSelect v-model="team"
                ><option value="people">피플팀</option>
                <option value="tech">개발팀</option></NativeSelect
              ></Field
            >
            <Field
              label="메모"
              description="변경 사항은 브라우저 메모리에만 보관됩니다."
              ><Textarea v-model="memo"
            /></Field>
            <Button type="submit" variant="accent">폼 검증</Button>
            <p class="cheese-help" role="status">
              {{
                saved
                  ? "검증 완료"
                  : "입력값: " + name + " / " + team + " / " + memo
              }}
            </p>
          </form></Card
        >
        <Card
          ><h2>선택 컨트롤</h2>
          <div class="cheese-stack">
            <label class="cheese-check-label" for="vue-agree"
              ><CheckboxRoot id="vue-agree" v-model="checked"
                ><CheckboxIndicator>✓</CheckboxIndicator></CheckboxRoot
              >결과 알림 받기</label
            >
            <label class="cheese-check-label" for="vue-switch"
              ><SwitchRoot id="vue-switch" v-model="notifications"
                ><SwitchThumb /></SwitchRoot
              >이메일 알림</label
            >
            <p role="status" class="cheese-help">
              선택 {{ checked }} · 알림 {{ notifications }}
            </p>
            <RadioGroupRoot v-model="scope" aria-label="공개 범위"
              ><label class="cheese-check-label" for="vue-private"
                ><RadioGroupItem id="vue-private" value="private"
                  ><RadioGroupIndicator /></RadioGroupItem
                >나만 보기</label
              ><label class="cheese-check-label" for="vue-team"
                ><RadioGroupItem id="vue-team" value="team"
                  ><RadioGroupIndicator /></RadioGroupItem
                >팀 공개</label
              ></RadioGroupRoot
            >
            <SliderRoot v-model="value" :min="0" :max="100" :step="10"
              ><SliderTrack><SliderRange /></SliderTrack
              ><SliderThumb aria-label="달성률"
            /></SliderRoot>
            <p class="cheese-help">달성률 {{ value[0] }}%</p>
          </div></Card
        >
        <Card
          ><h2>Dialog · 포커스 관리</h2>
          <DialogRoot
            ><DialogTrigger as-child><Button>설정 열기</Button></DialogTrigger
            ><DialogContent
              ><DialogTitle>Vue 설정</DialogTitle
              ><DialogDescription
                >Esc로 닫으면 설정 열기 버튼으로 돌아갑니다.</DialogDescription
              ><Field label="설정 이름"
                ><Input placeholder="설정 입력"
              /></Field>
              <div class="cheese-dialog-actions">
                <DialogClose as-child><Button>닫기</Button></DialogClose>
              </div></DialogContent
            ></DialogRoot
          ></Card
        >
        <Card
          ><h2>Tree · 조직 탐색</h2>
          <Tree
            label="Vue 조직 탐색"
            :nodes="nodes"
            :default-expanded="['company']"
            @select="selected = $event.label"
          />
          <p class="cheese-help" role="status">선택: {{ selected }}</p></Card
        >
        <Card
          ><h2>Tabs · 키보드 탐색</h2>
          <TabsRoot default-value="profile"
            ><TabsList aria-label="Vue 정보"
              ><TabsTrigger value="profile">프로필</TabsTrigger
              ><TabsTrigger value="security">보안</TabsTrigger></TabsList
            ><TabsContent value="profile">프로필 정보입니다.</TabsContent
            ><TabsContent value="security"
              >보안 설정입니다.</TabsContent
            ></TabsRoot
          ></Card
        >
        <Card
          ><h2>Accordion</h2>
          <AccordionRoot type="single" collapsible
            ><AccordionItem value="policy"
              ><AccordionHeader
                ><AccordionTrigger
                  >평가 정책 보기</AccordionTrigger
                ></AccordionHeader
              ><AccordionContent
                >마감 전에 제출해 주세요.</AccordionContent
              ></AccordionItem
            ></AccordionRoot
          ></Card
        >
      </div>
      <p class="vue-footer">
        가상 데이터 · 외부 전송 없음 · 실제 사내 시스템이 아닙니다.
      </p>
    </main>
  </div>
</template>
