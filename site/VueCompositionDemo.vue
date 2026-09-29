<script setup lang="ts">
import { computed, ref } from "vue";
import {
  Badge,
  Button,
  Card,
  NavigationList,
  RecordCollection,
  SectionHeader,
  StatCard,
  StatGroup,
  UserIdentity,
  queryRows,
  type NavigationItem,
  type TableColumn,
  type TableQuery,
} from "@cheese/vue";
import "./business-patterns.css";

type RequestRecord = {
  id: string;
  title: string;
  owner: string;
  status: "대기" | "완료";
};

const navigation: NavigationItem[] = [
  { id: "overview", label: "업무 현황", group: "업무" },
  { id: "requests", label: "요청 목록", group: "업무" },
  { id: "archive", label: "완료 기록", group: "기록" },
  { id: "settings", label: "관리 설정", group: "관리", disabled: true },
];
const activeId = ref("overview");
const activeLabel = computed(
  () => navigation.find((item) => item.id === activeId.value)?.label,
);
const showDescription = ref(true);

function createRecords(): RequestRecord[] {
  return [
    { id: "REQ-001", title: "회의 자료 정리", owner: "김민서", status: "대기" },
    {
      id: "REQ-002",
      title: "신규 구성원 안내",
      owner: "이도윤",
      status: "대기",
    },
    { id: "REQ-003", title: "주간 일정 확인", owner: "박서연", status: "완료" },
    { id: "REQ-004", title: "문서 검토 요청", owner: "김민서", status: "대기" },
    {
      id: "REQ-005",
      title: "공용 자료 업데이트",
      owner: "박서연",
      status: "완료",
    },
    {
      id: "REQ-006",
      title: "프로젝트 일정 조율",
      owner: "이도윤",
      status: "대기",
    },
  ];
}

const columns: TableColumn[] = [
  { key: "id", label: "요청 번호", width: 120 },
  { key: "title", label: "업무", width: 220 },
  { key: "owner", label: "담당자", width: 120 },
  { key: "status", label: "상태", width: 100 },
];
const records = ref(createRecords());
const query = ref<TableQuery>({ page: 1, pageSize: 5, search: "", sort: null });
const selected = ref<string[]>([]);
const status = ref("");
const bulkResult = ref<{ succeeded: number; failed: number }>();
const pendingCount = computed(
  () => records.value.filter((record) => record.status === "대기").length,
);
const completedCount = computed(
  () => records.value.length - pendingCount.value,
);
const filteredRecords = computed(() =>
  records.value.filter(
    (record) => !status.value || record.status === status.value,
  ),
);
const resultCount = computed(
  () => queryRows(filteredRecords.value, columns, query.value).total,
);
const filters = computed(() => [
  {
    id: "status",
    label: "업무 상태",
    value: status.value,
    options: [
      { value: "", label: "전체 상태" },
      { value: "대기", label: "대기" },
      { value: "완료", label: "완료" },
    ],
  },
]);

const getRowId = (record: RequestRecord) => record.id;
const rowLabel = (record: RequestRecord) => `${record.title} ${record.id}`;
const isRowSelectable = (record: RequestRecord) => record.status === "대기";

function changeFilter(id: string, value: string) {
  if (id === "status") status.value = value;
}

function completeSelected() {
  const requested = new Set(selected.value);
  let succeeded = 0;
  records.value = records.value.map<RequestRecord>((record) => {
    if (!requested.has(record.id) || record.status !== "대기") return record;
    succeeded += 1;
    return { ...record, status: "완료" };
  });
  selected.value = [];
  bulkResult.value = { succeeded, failed: 0 };
}

function resetRecords() {
  records.value = createRecords();
  query.value = { page: 1, pageSize: 5, search: "", sort: null };
  status.value = "";
  selected.value = [];
  bulkResult.value = undefined;
}

const importCode = `import "@cheese/css";
import {
  NavigationList, UserIdentity, SectionHeader,
  StatCard, StatGroup, RecordCollection,
} from "@cheese/vue";`;

const collectionCode = `<RecordCollection
  v-model:query="query"
  v-model:selected="selected"
  label="업무 요청 목록"
  :columns="columns"
  :rows="filteredRecords"
  :get-row-id="getRowId"
  :filters="filters"
  :result-count="resultCount"
  @filter-change="changeFilter"
  @reset-filters="status = ''"
/>

// 상태 조건은 앱에서 적용합니다.
// 검색·정렬·페이지 이동은 RecordCollection 내부 DataTable이 처리합니다.`;
</script>

<template>
  <main class="cheese-root business-patterns business-vue-page">
    <a class="text-link" href="./#/business-patterns">← CHEESE 조합 컴포넌트</a>
    <header class="page-heading">
      <span class="eyebrow">COMPOSITE COMPONENTS · VUE</span>
      <h1>가져와서 조합하는 업무 화면.</h1>
      <p>
        탐색, 사용자 표시, 섹션 제목, 지표와 목록을 공개 Vue 컴포넌트로
        구성했습니다. 목록에서 업무를 완료하면 위의 지표에도 반영됩니다.
      </p>
      <p class="cheese-help">
        가상 데이터입니다. 변경 내용은 새로고침하면 초기화됩니다.
      </p>
    </header>
    <div class="code-block">
      <pre
        tabindex="0"
        aria-label="Vue 조합 컴포넌트 가져오기"
      ><code>{{ importCode }}</code></pre>
    </div>

    <div class="business-vue-grid">
      <section
        id="composition-navigation-list"
        class="cheese-stack"
        aria-label="Vue NavigationList"
      >
        <div class="business-vue-card-heading">
          <h2>NavigationList</h2>
          <Badge>탐색</Badge>
        </div>
        <Card class="cheese-stack">
          <NavigationList
            :items="navigation"
            :active-id="activeId"
            label="Vue 조합 예제 탐색"
            @navigate="activeId = $event"
          />
          <p class="cheese-help" role="status">
            선택한 메뉴: {{ activeLabel }}
          </p>
        </Card>
      </section>

      <section
        id="composition-user-identity"
        class="cheese-stack"
        aria-label="Vue UserIdentity"
      >
        <div class="business-vue-card-heading">
          <h2>UserIdentity</h2>
          <Badge>Avatar 조합</Badge>
        </div>
        <Card class="cheese-stack">
          <UserIdentity
            name="김민서"
            description="운영팀 · 업무 담당자"
            fallback="민"
          />
          <UserIdentity
            name="이도윤"
            description="프로젝트 담당자"
            fallback="도"
            size="sm"
          />
          <p class="cheese-help">
            같은 사용자 표시를 탐색 영역과 목록, 상세 화면에서 사용합니다.
          </p>
        </Card>
      </section>

      <section
        id="composition-section-header"
        class="business-vue-wide cheese-stack"
        aria-label="Vue SectionHeader"
      >
        <div class="business-vue-card-heading">
          <h2>SectionHeader</h2>
          <Badge>제목 + 설명 + 작업</Badge>
        </div>
        <Card>
          <SectionHeader
            title="진행 중인 업무"
            :heading-level="3"
            :description="
              showDescription
                ? '담당자와 처리 상태를 함께 확인하세요.'
                : undefined
            "
          >
            <template #actions>
              <Button
                variant="weak"
                size="sm"
                @click="showDescription = !showDescription"
              >
                {{ showDescription ? "설명 숨기기" : "설명 보기" }}
              </Button>
            </template>
          </SectionHeader>
        </Card>
      </section>

      <section
        id="composition-stat-card"
        class="business-vue-wide cheese-stack"
        aria-label="Vue StatCard"
      >
        <div class="business-vue-card-heading">
          <h2>StatCard</h2>
          <Badge>Card + 지표</Badge>
        </div>
        <StatCard
          label="처리를 기다리는 업무"
          description="아래 목록에서 선택한 업무를 완료할 수 있습니다."
        >
          <template #value>{{ pendingCount }}건</template>
        </StatCard>
      </section>

      <section
        id="composition-stat-group"
        class="business-vue-wide cheese-stack"
        aria-label="Vue StatGroup"
      >
        <div class="business-vue-card-heading">
          <h2>StatGroup</h2>
          <Badge>반응형 지표 배치</Badge>
        </div>
        <StatGroup :columns="3">
          <StatCard
            label="전체 업무"
            :value="records.length"
            description="전체 요청 수"
          />
          <StatCard
            label="대기"
            :value="pendingCount"
            description="처리가 필요한 업무"
          />
          <StatCard
            label="완료"
            :value="completedCount"
            description="처리를 마친 업무"
          />
        </StatGroup>
      </section>

      <section
        id="composition-record-collection"
        class="business-vue-wide cheese-stack"
        aria-label="Vue RecordCollection"
      >
        <div class="business-vue-card-heading">
          <h2>RecordCollection</h2>
          <Badge>FilterBar + BulkActionBar + DataTable</Badge>
        </div>
        <Card class="cheese-stack">
          <SectionHeader
            title="업무 요청"
            :heading-level="3"
            description="검색하고 상태별로 좁힌 뒤, 대기 중인 업무를 선택해 완료하세요."
          >
            <template #actions>
              <Button variant="ghost" size="sm" @click="resetRecords"
                >목록 초기화</Button
              >
            </template>
          </SectionHeader>
          <RecordCollection
            v-model:query="query"
            v-model:selected="selected"
            label="업무 요청 목록"
            search-label="업무·담당자 검색"
            :columns="columns"
            :rows="filteredRecords"
            :get-row-id="getRowId"
            :row-label="rowLabel"
            :is-row-selectable="isRowSelectable"
            :filters="filters"
            :result-count="resultCount"
            :bulk-result="bulkResult"
            @filter-change="changeFilter"
            @reset-filters="status = ''"
            @update:selected="bulkResult = undefined"
          >
            <template #bulk-actions>
              <Button
                size="sm"
                :disabled="!selected.length"
                @click="completeSelected"
              >
                선택 업무 완료
              </Button>
            </template>
            <template #cell="{ row, column }">
              <UserIdentity
                v-if="column.key === 'owner'"
                :name="row.owner"
                size="sm"
              />
              <Badge
                v-else-if="column.key === 'status'"
                :tone="row.status === '대기' ? 'brand' : 'neutral'"
              >
                {{ row.status }}
              </Badge>
              <template v-else>{{
                row[column.key as keyof RequestRecord]
              }}</template>
            </template>
          </RecordCollection>
        </Card>
        <div class="code-block">
          <pre
            tabindex="0"
            aria-label="Vue RecordCollection 사용 코드"
          ><code>{{ collectionCode }}</code></pre>
        </div>
      </section>
    </div>
  </main>
</template>
