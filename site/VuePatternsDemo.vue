<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import { ClipboardList, LayoutDashboard } from "@lucide/vue";
import {
  ActivityTimeline,
  AppShell,
  Badge,
  BulkActionBar,
  Button,
  Card,
  CheckboxRoot,
  CheckboxIndicator,
  Check,
  DescriptionList,
  Field,
  FilterBar,
  Input,
  PageHeader,
  PeoplePicker,
  SaveStatus,
  UserIdentity,
} from "@cheese/vue";
import "./business-patterns.css";

const organizations = [
  {
    id: "company",
    label: "CHEESE Studio",
    children: [
      { id: "design", label: "디자인팀" },
      { id: "product", label: "제품팀" },
      { id: "people", label: "피플팀" },
    ],
  },
];
const people = [
  {
    id: "min",
    name: "김민서",
    organizationId: "design",
    description: "디자인팀 · 프로덕트 디자이너",
  },
  {
    id: "ji",
    name: "박지훈",
    organizationId: "product",
    description: "제품팀 · 프로덕트 매니저",
  },
  {
    id: "su",
    name: "이수진",
    organizationId: "people",
    description: "피플팀 · People Partner",
  },
  {
    id: "yun",
    name: "정윤아",
    organizationId: "design",
    description: "디자인팀 · 브랜드 디자이너",
  },
];
const navigation = [
  {
    id: "overview",
    label: "요약",
    icon: LayoutDashboard,
    group: "워크스페이스",
  },
  {
    id: "library",
    label: "자료",
    icon: ClipboardList,
    group: "워크스페이스",
  },
];
const activePage = ref("overview");
const page = computed(
  () =>
    ({
      overview: {
        title: "요약",
        description: "PageHeader로 제목과 설명을 전달합니다.",
      },
      library: {
        title: "자료",
        description: "활성 메뉴에 맞는 콘텐츠를 default 슬롯으로 전달합니다.",
      },
    })[activePage.value as "overview" | "library"],
);
const selectedPeople = ref(["min"]);
const selectedNames = computed(() =>
  people
    .filter((person) => selectedPeople.value.includes(person.id))
    .map((person) => person.name)
    .join(", "),
);
const search = ref("");
const team = ref("");
const filters = computed(() => [
  {
    id: "team",
    label: "소속 조직",
    value: team.value,
    options: [
      { value: "", label: "전체 조직" },
      { value: "design", label: "디자인팀" },
      { value: "product", label: "제품팀" },
      { value: "people", label: "피플팀" },
    ],
  },
]);
const visiblePeople = computed(() =>
  people.filter(
    (person) =>
      (!team.value || person.organizationId === team.value) &&
      (person.name + person.description).includes(search.value.trim()),
  ),
);
function changeFilter(_id: string, value: string) {
  team.value = value;
}
function resetFilters() {
  search.value = "";
  team.value = "";
}

const selectedRows = ref(["min", "ji", "su"]);
const completed = ref<string[]>([]);
const busy = ref(false);
const simulateBulkFailure = ref(true);
const bulkResult = ref<{ succeeded: number; failed: number }>();
let bulkTimer: ReturnType<typeof setTimeout> | undefined;
function selectRow(id: string, checked: boolean | "indeterminate") {
  bulkResult.value = undefined;
  selectedRows.value =
    checked === true
      ? [...selectedRows.value, id]
      : selectedRows.value.filter((item) => item !== id);
}
function clearSelection() {
  selectedRows.value = [];
  bulkResult.value = undefined;
}
function runBulk(retry = false) {
  const ids = [...selectedRows.value];
  busy.value = true;
  bulkResult.value = undefined;
  clearTimeout(bulkTimer);
  bulkTimer = setTimeout(() => {
    const failed = !retry && simulateBulkFailure.value ? ids.slice(-1) : [];
    const succeeded = ids.filter((id) => !failed.includes(id));
    completed.value = [...new Set([...completed.value, ...succeeded])];
    selectedRows.value = failed;
    bulkResult.value = { succeeded: succeeded.length, failed: failed.length };
    busy.value = false;
  }, 650);
}
function resetBulk() {
  completed.value = [];
  selectedRows.value = ["min", "ji", "su"];
  bulkResult.value = undefined;
}
const details = ref(false);
const detailItems = computed(() => [
  { label: "이름", value: "김민서" },
  { label: "소속 조직", value: "제품디자인실 · 디자인팀" },
  { label: "직무", value: "프로덕트 디자이너" },
  ...(details.value
    ? [
        { label: "입사일", value: "2024년 3월 4일" },
        { label: "이메일", value: "minseo@example.com" },
      ]
    : []),
]);

const step = ref(1);
const timelineFailed = ref(false);
const events = [
  {
    id: "received",
    title: "지원서 접수",
    description: "포트폴리오와 지원 정보를 접수했어요.",
    actor: "김민서",
    time: "09.24 · 10:30",
  },
  {
    id: "review",
    title: "서류 검토",
    description: "담당 심사위원이 지원서를 확인합니다.",
    actor: "이수진",
    time: "09.25 · 14:00",
  },
  {
    id: "interview",
    title: "인터뷰 안내",
    description: "다음 단계와 일정을 안내합니다.",
    actor: "피플팀",
    time: "09.29 · 09:00",
  },
];
const timeline = computed(() =>
  events.map((event, index) => ({
    ...event,
    status:
      index < step.value
        ? ("done" as const)
        : index > step.value
          ? ("pending" as const)
          : timelineFailed.value
            ? ("error" as const)
            : ("current" as const),
  })),
);
function nextStep() {
  step.value++;
  timelineFailed.value = false;
}
function resetTimeline() {
  step.value = 1;
  timelineFailed.value = false;
}

const title = ref("팀과 함께 만든 변화");
const saveState = ref<"idle" | "dirty" | "saving" | "saved" | "error">("idle");
const simulateSaveFailure = ref(false);
let saveTimer: ReturnType<typeof setTimeout> | undefined;
function updateTitle(value: string | number | undefined) {
  title.value = value === undefined ? "" : String(value);
  saveState.value = "dirty";
}
function save(retry = false) {
  saveState.value = "saving";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveState.value = simulateSaveFailure.value && !retry ? "error" : "saved";
  }, 650);
}
onBeforeUnmount(() => {
  clearTimeout(bulkTimer);
  clearTimeout(saveTimer);
});
</script>

<template>
  <main class="cheese-root business-patterns business-vue-page">
    <a class="text-link" href="./#/business-patterns">← CHEESE 업무 패턴</a>
    <header class="page-heading">
      <span class="eyebrow">BUSINESS PATTERNS · VUE</span>
      <h1>같은 업무 흐름.<br />Vue에서도 그대로.</h1>
      <p>
        공통 토큰과 Vue 컴포넌트로 구성한 일곱 가지 실행 예제입니다. 탐색, 선택,
        검색, 재시도까지 직접 확인해 보세요.
      </p>
    </header>

    <div class="business-vue-grid">
      <section class="business-vue-wide" aria-labelledby="vue-shell-heading">
        <div class="business-vue-card-heading">
          <h2 id="vue-shell-heading">App shell</h2>
          <Badge tone="brand">AppShell + PageHeader</Badge>
        </div>
        <div class="business-pattern-stage" data-pattern="app-shell">
          <AppShell
            :items="navigation"
            :active-id="activePage"
            navigation-label="앱 구조 미리보기 탐색"
            @navigate="activePage = $event"
          >
            <template #brand>
              <span class="business-demo-brand">Workspace</span>
            </template>
            <template #user>
              <UserIdentity name="김민서" description="사용자 영역" size="sm" />
            </template>
            <template #footer>
              <span class="cheese-help">footer 슬롯</span>
            </template>
            <div class="business-demo-dashboard">
              <PageHeader
                :title="page.title"
                :description="page.description"
                :heading-level="3"
              />
              <DescriptionList
                :items="
                  activePage === 'overview'
                    ? [
                        { label: '탐색', value: 'items · activeId · navigate' },
                        {
                          label: '사용자',
                          value: 'user 슬롯에 UserIdentity 전달',
                        },
                        {
                          label: '본문',
                          value: 'default 슬롯에 페이지 콘텐츠 전달',
                        },
                      ]
                    : [
                        { label: '현재 메뉴', value: 'library' },
                        {
                          label: '콘텐츠',
                          value: '선택한 메뉴에 맞춰 부모에서 변경',
                        },
                      ]
                "
              />
            </div>
          </AppShell>
        </div>
      </section>

      <Card aria-label="Vue People picker">
        <div class="business-vue-card-heading">
          <h2>People picker</h2>
          <Badge>선택 · 적용</Badge>
        </div>
        <div class="business-demo-stack">
          <PeoplePicker
            v-model="selectedPeople"
            label="리뷰에 참여할 구성원"
            :people="people"
            :organizations="organizations"
            multiple
          />
          <div class="business-demo-note" role="status">
            <span>적용된 구성원</span
            ><strong>{{ selectedNames || "선택한 구성원이 없습니다." }}</strong>
          </div>
          <p class="cheese-help">
            선택창의 변경은 적용할 때 확정됩니다. 취소하면 기존 선택이
            유지됩니다.
          </p>
        </div>
      </Card>

      <Card aria-label="Vue Description list">
        <div class="business-vue-card-heading">
          <h2>Description list</h2>
          <Button
            variant="ghost"
            size="sm"
            :aria-pressed="details"
            @click="details = !details"
            >{{ details ? "기본 정보" : "상세 정보" }}</Button
          >
        </div>
        <DescriptionList :items="detailItems" />
      </Card>

      <Card class="business-vue-wide" aria-label="Vue Filter bar">
        <div class="business-vue-card-heading">
          <h2>Filter bar</h2>
          <Badge>검색 · 초기화</Badge>
        </div>
        <div class="business-demo-stack">
          <FilterBar
            v-model:search="search"
            label="Vue 구성원 검색 조건"
            search-label="Vue 구성원 이름 검색"
            :filters="filters"
            :result-count="visiblePeople.length"
            @filter-change="changeFilter"
            @reset="resetFilters"
          />
          <DescriptionList
            v-if="visiblePeople.length"
            :items="
              visiblePeople.map((person) => ({
                label: person.name,
                value: person.description,
              }))
            "
          />
          <p v-else class="business-demo-empty" role="status">
            일치하는 구성원이 없습니다. 검색어나 조직 조건을 바꿔 보세요.
          </p>
        </div>
      </Card>

      <Card aria-label="Vue Bulk action bar">
        <div class="business-vue-card-heading">
          <h2>Bulk action bar</h2>
          <Badge>부분 실패 · 재시도</Badge>
        </div>
        <div class="business-demo-stack">
          <label class="business-demo-checkbox-label"
            ><CheckboxRoot
              :model-value="simulateBulkFailure"
              :disabled="busy"
              @update:model-value="simulateBulkFailure = $event === true"
              ><CheckboxIndicator
                ><Check aria-hidden="true" /></CheckboxIndicator></CheckboxRoot
            >마지막 한 명의 처리 실패 재현</label
          >
          <div class="business-demo-rows">
            <div
              v-for="person in people.slice(0, 3)"
              :key="person.id"
              class="business-demo-row"
            >
              <label class="business-demo-checkbox-label"
                ><CheckboxRoot
                  :model-value="selectedRows.includes(person.id)"
                  :disabled="busy || completed.includes(person.id)"
                  @update:model-value="selectRow(person.id, $event)"
                  ><CheckboxIndicator
                    ><Check
                      aria-hidden="true" /></CheckboxIndicator></CheckboxRoot
                >{{ person.name }}</label
              >
              <Badge
                :tone="completed.includes(person.id) ? 'positive' : 'neutral'"
                >{{
                  completed.includes(person.id) ? "발송 완료" : "발송 대기"
                }}</Badge
              >
            </div>
          </div>
          <BulkActionBar
            :selected-count="selectedRows.length"
            :actions="[{ id: 'notify', label: '평가 안내 보내기' }]"
            :busy="busy"
            :result="bulkResult"
            :retryable="!!bulkResult?.failed"
            @action="runBulk()"
            @clear="clearSelection"
            @retry="runBulk(true)"
          />
          <p v-if="!selectedRows.length && !bulkResult" class="cheese-help">
            구성원을 선택하면 일괄 작업이 나타납니다.
          </p>
          <Button
            v-if="completed.length"
            variant="ghost"
            size="sm"
            :disabled="busy"
            @click="resetBulk"
            >발송 예제 다시 시작</Button
          >
          <p class="cheese-help">
            가상 발송입니다. 실패한 항목만 선택에 남고 재시도됩니다.
          </p>
        </div>
      </Card>

      <Card aria-label="Vue Activity timeline">
        <div class="business-vue-card-heading">
          <h2>Activity timeline</h2>
          <Badge>진행 · 기록</Badge>
        </div>
        <div class="business-demo-stack">
          <ActivityTimeline label="Vue 지원자 진행 이력" :items="timeline" />
          <div class="cheese-inline">
            <Button
              variant="weak"
              size="sm"
              :disabled="step === events.length"
              @click="nextStep"
              >현재 단계 완료</Button
            >
            <Button
              variant="ghost"
              size="sm"
              :disabled="step === events.length"
              @click="timelineFailed = !timelineFailed"
              >{{ timelineFailed ? "문제 해결" : "오류 상태" }}</Button
            >
            <Button variant="ghost" size="sm" @click="resetTimeline"
              >초기화</Button
            >
          </div>
          <p class="cheese-help" role="status">
            {{
              step === events.length
                ? "모든 단계가 완료되었습니다."
                : `${events[step].title} ${timelineFailed ? "단계에서 확인이 필요합니다." : "단계가 진행 중입니다."}`
            }}
          </p>
        </div>
      </Card>

      <Card class="business-vue-wide" aria-label="Vue Save status">
        <div class="business-vue-card-heading">
          <h2>Save status</h2>
          <Badge>상태 · 재시도</Badge>
        </div>
        <div class="business-demo-stack">
          <Field label="Vue 평가 제목"
            ><Input
              :model-value="title"
              :disabled="saveState === 'saving'"
              @update:model-value="updateTitle"
          /></Field>
          <label class="business-demo-checkbox-label"
            ><CheckboxRoot
              :model-value="simulateSaveFailure"
              :disabled="saveState === 'saving'"
              @update:model-value="simulateSaveFailure = $event === true"
              ><CheckboxIndicator
                ><Check aria-hidden="true" /></CheckboxIndicator></CheckboxRoot
            >다음 저장 실패 재현</label
          >
          <div class="business-demo-row">
            <SaveStatus
              :status="saveState"
              :retryable="saveState === 'error'"
              @retry="save(true)"
            /><Button
              :disabled="!title.trim() || saveState === 'saving'"
              :loading="saveState === 'saving'"
              @click="save()"
              >저장</Button
            >
          </div>
          <p class="cheese-help">
            가상 요청으로 저장 상태를 전환합니다. 저장 실행, 데이터 보관, 자동
            저장과 이탈 확인은 사용하는 제품이 관리합니다.
          </p>
        </div>
      </Card>
    </div>

    <section class="business-pattern-section" aria-labelledby="vue-products-heading">
      <div class="page-heading">
        <h2 id="vue-products-heading">서비스에 연결할 때</h2>
        <p>실제 데이터, 서버 권한, 저장과 감사 정책은 도입하는 서비스가 연결합니다.</p>
      </div>
      <div class="business-product-links">
        <div><span><strong>데이터</strong><span>원천 시스템과 API</span></span></div>
        <div><span><strong>권한</strong><span>서버 검증과 감사</span></span></div>
        <div><span><strong>운영</strong><span>저장·실패·복구</span></span></div>
      </div>
    </section>
  </main>
</template>
