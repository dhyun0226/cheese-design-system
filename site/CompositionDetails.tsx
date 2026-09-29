import { useState, type ComponentType } from "react";
import {
  ArrowUpRight,
  ChevronRight,
  Folder,
  LayoutGrid,
  Settings,
} from "lucide-react";
import {
  Badge,
  Button,
  Checkbox,
  NavigationList,
  RecordCollection,
  SectionHeader,
  StatCard,
  StatGroup,
  UserIdentity,
  type TableQuery,
} from "@cheese/react";
import { CompositionAnatomy } from "./CompositionCatalog";
import {
  compositionCategories,
  compositionLevel,
  getCompositeEntry,
} from "./composition-catalog";
import "./composition-docs.css";

function NavigationDemo() {
  const [active, setActive] = useState("overview");
  const items = [
    {
      id: "overview",
      label: "요약",
      icon: <LayoutGrid aria-hidden="true" />,
      group: "워크스페이스",
    },
    {
      id: "library",
      label: "자료",
      icon: <Folder aria-hidden="true" />,
      group: "워크스페이스",
    },
    {
      id: "settings",
      label: "설정",
      icon: <Settings aria-hidden="true" />,
      group: "관리",
      disabled: true,
    },
  ];
  return (
    <div className="composition-demo-navigation">
      <NavigationList
        label="탐색 미리보기"
        items={items}
        activeId={active}
        onNavigate={setActive}
      />
      <div className="composition-demo-content">
        <SectionHeader
          title={items.find((item) => item.id === active)?.label}
          headingLevel={3}
        />
        <p className="composition-demo-result" role="status">
          현재 항목: {active}
        </p>
        <p className="cheese-help">
          메뉴를 선택하면 부모가 관리하는 activeId가 바뀝니다.
        </p>
      </div>
    </div>
  );
}

function IdentityDemo() {
  const [description, setDescription] = useState(true);
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");
  return (
    <div className="composition-demo-stack">
      <UserIdentity
        name="김민서"
        description={description ? "디자인팀 · 디자이너" : undefined}
        fallback="김"
        size={size}
      />
      <div className="cheese-inline" role="group" aria-label="사용자 표시 크기">
        {(["sm", "md", "lg"] as const).map((value) => (
          <Button
            key={value}
            size="sm"
            variant="ghost"
            aria-pressed={size === value}
            onClick={() => setSize(value)}
          >
            {value}
          </Button>
        ))}
        <Checkbox
          label="보조 정보 표시"
          checked={description}
          onCheckedChange={(checked) => setDescription(checked === true)}
        />
      </div>
      <p>이미지를 제공하지 않으면 이름 또는 지정한 fallback을 표시합니다.</p>
    </div>
  );
}

function HeaderDemo() {
  const [showDescription, setShowDescription] = useState(true);
  const [showAction, setShowAction] = useState(true);
  const [count, setCount] = useState(3);
  return (
    <div className="composition-demo-stack">
      <SectionHeader
        title="자료"
        headingLevel={3}
        description={
          showDescription ? `${count}개의 자료를 관리합니다.` : undefined
        }
        actions={
          showAction ? (
            <Button
              variant="weak"
              size="sm"
              onClick={() => setCount((value) => value + 1)}
            >
              자료 추가
            </Button>
          ) : undefined
        }
      />
      <div className="cheese-inline">
        <Checkbox
          label="설명 표시"
          checked={showDescription}
          onCheckedChange={(checked) => setShowDescription(checked === true)}
        />
        <Checkbox
          label="동작 표시"
          checked={showAction}
          onCheckedChange={(checked) => setShowAction(checked === true)}
        />
      </div>
      <p role="status">자료 {count}개</p>
    </div>
  );
}

function StatCardDemo() {
  const [count, setCount] = useState(24);
  return (
    <div className="composition-demo-stack">
      <StatCard
        label="공유 자료"
        value={`${count}개`}
        description="현재 워크스페이스"
      />
      <div className="cheese-inline">
        <Button
          variant="weak"
          size="sm"
          onClick={() => setCount((value) => value + 1)}
        >
          자료 추가
        </Button>
        <span className="composition-demo-result">
          값은 부모의 상태에서 전달합니다.
        </span>
      </div>
    </div>
  );
}

function StatGroupDemo() {
  const [columns, setColumns] = useState<2 | 3 | 4>(3);
  return (
    <div className="composition-demo-stack">
      <StatGroup columns={columns}>
        <StatCard label="전체 자료" value="24" description="공유된 자료" />
        <StatCard label="이번 주 추가" value="6" description="최근 7일" />
        <StatCard
          label="검토 중"
          value="3"
          description="검토를 기다리는 자료"
        />
        <StatCard label="보관함" value="12" description="보관한 자료" />
      </StatGroup>
      <div className="cheese-inline" role="group" aria-label="최대 열 수">
        {([2, 3, 4] as const).map((value) => (
          <Button
            key={value}
            size="sm"
            variant="ghost"
            aria-pressed={columns === value}
            onClick={() => setColumns(value)}
          >
            {value}열
          </Button>
        ))}
      </div>
      <p>
        columns는 넓은 화면에서의 최대 열 수입니다. 좁은 화면에서는 열 수가
        줄어듭니다.
      </p>
    </div>
  );
}

const sampleRows = [
  { id: "guide", title: "디자인 가이드", category: "문서", updated: "09.24" },
  {
    id: "release-check",
    title: "출시 체크리스트",
    category: "체크리스트",
    updated: "09.25",
  },
  { id: "meeting", title: "회의 기록", category: "기록", updated: "09.26" },
  {
    id: "a11y",
    title: "접근성 점검",
    category: "체크리스트",
    updated: "09.27",
  },
  { id: "research", title: "사용자 조사", category: "문서", updated: "09.28" },
  {
    id: "release-notes",
    title: "릴리스 노트",
    category: "기록",
    updated: "09.29",
  },
];
const columns = [
  { key: "title", label: "자료명", sortable: true },
  { key: "category", label: "분류", sortable: true },
  { key: "updated", label: "수정일", sortable: true },
];

function CollectionDemo() {
  const [rows, setRows] = useState(sampleRows);
  const [query, setQuery] = useState<TableQuery>({
    page: 1,
    pageSize: 5,
    search: "",
    sort: null,
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("검색하거나 항목을 선택해 보세요.");
  const visible = rows.filter((row) => !category || row.category === category);
  return (
    <div className="composition-demo-stack">
      <RecordCollection
        label="자료 목록"
        searchLabel="자료 검색"
        columns={columns}
        rows={visible}
        getRowId={(row) => row.id}
        rowLabel={(row) => row.title}
        query={query}
        onQueryChange={setQuery}
        selected={selected}
        onSelectedChange={setSelected}
        filters={[
          {
            id: "category",
            label: "분류",
            value: category,
            options: [
              { value: "", label: "전체" },
              { value: "문서", label: "문서" },
              { value: "체크리스트", label: "체크리스트" },
              { value: "기록", label: "기록" },
            ],
          },
        ]}
        onFilterChange={(_, value) => setCategory(value)}
        onResetFilters={() => setCategory("")}
        bulkActions={
          <Button
            size="sm"
            onClick={() => {
              setRows((current) =>
                current.filter((row) => !selected.includes(row.id)),
              );
              setMessage(`${selected.length}개 자료를 보관했습니다.`);
              setSelected([]);
              setQuery((current) => ({ ...current, page: 1 }));
            }}
          >
            보관
          </Button>
        }
      />
      <p role="status">{message}</p>
      <p>
        필터와 보관 동작은 이 미리보기의 데이터에만 적용됩니다. 검색 조건을
        바꿔도 선택한 ID는 유지됩니다.
      </p>
    </div>
  );
}

type ApiRow = [name: string, type: string, description: string];
type Detail = { demo: ComponentType; api: ApiRow[]; code: string };
const details: Record<string, Detail> = {
  "navigation-list": {
    demo: NavigationDemo,
    api: [
      [
        "items",
        "NavigationItem[]",
        "id · label · icon? · href? · disabled? · group?",
      ],
      ["activeId", "string?", "현재 항목의 ID"],
      ["onNavigate", "(id, event) => void", "사용자가 선택한 ID와 클릭 이벤트"],
      ["label", "string?", "탐색 영역의 접근 가능한 이름"],
    ],
    code: `import { useState } from "react";
import { NavigationList } from "@cheese/react";

export function WorkspaceNavigation() {
  const [activeId, setActiveId] = useState("overview");
  return (
    <NavigationList label="워크스페이스"
      items={[
        { id: "overview", label: "요약", group: "워크스페이스" },
        { id: "library", label: "자료", group: "워크스페이스" },
      ]}
      activeId={activeId} onNavigate={setActiveId} />
  );
}`,
  },
  "user-identity": {
    demo: IdentityDemo,
    api: [
      ["name", "string", "사용자 이름"],
      ["description", "string?", "소속·역할 등 보조 정보"],
      ["src / fallback", "string?", "아바타 URL과 대체 텍스트"],
      ["size", '"sm" | "md" | "lg"', "표시 크기 · 기본 md"],
    ],
    code: `import { UserIdentity } from "@cheese/react";

<UserIdentity name="김민서" description="디자인팀 · 디자이너"
  fallback="김" size="md" />`,
  },
  "section-header": {
    demo: HeaderDemo,
    api: [
      ["title", "ReactNode", "영역의 제목"],
      ["description", "ReactNode?", "선택적인 설명"],
      ["actions", "ReactNode?", "이 영역에 관련된 버튼·링크"],
      [
        "headingLevel",
        "1 | 2 | 3 | 4 | 5 | 6",
        "문서 구조에 맞는 제목 수준 · 기본 2",
      ],
    ],
    code: `import { Button, SectionHeader } from "@cheese/react";

export function LibraryHeader({ onAdd }: { onAdd: () => void }) {
  return <SectionHeader title="자료" description="공유한 자료를 관리합니다."
    actions={<Button onClick={onAdd}>자료 추가</Button>} />;
}`,
  },
  "stat-card": {
    demo: StatCardDemo,
    api: [
      ["label", "string", "지표 이름"],
      ["value", "ReactNode", "형식을 적용한 지표 값"],
      ["description", "ReactNode?", "집계 기간이나 값의 맥락"],
    ],
    code: `import { StatCard } from "@cheese/react";

<StatCard label="공유 자료" value="24개" description="현재 워크스페이스" />`,
  },
  "stat-group": {
    demo: StatGroupDemo,
    api: [
      ["columns", "2 | 3 | 4", "최대 열 수 · 기본 3"],
      ["children", "ReactNode", "StatCard 등 표시할 자식"],
    ],
    code: `import { StatCard, StatGroup } from "@cheese/react";

<StatGroup columns={3}>
  <StatCard label="전체 자료" value="24" />
  <StatCard label="이번 주 추가" value="6" />
  <StatCard label="검토 중" value="3" />
</StatGroup>`,
  },
  "record-collection": {
    demo: CollectionDemo,
    api: [
      [
        "label / columns / getRowId",
        "string / TableColumn[] / (row) => string",
        "목록의 이름, 열 정의와 안정적인 행 ID",
      ],
      [
        "rows / loadRows",
        "T[] / RowsLoader<T>",
        "로컬 데이터 또는 취소 신호를 받는 비동기 조회 함수",
      ],
      [
        "rowLabel / isRowSelectable",
        "(row) => string / (row) => boolean",
        "행 선택의 접근 가능한 이름과 선택 가능 여부",
      ],
      [
        "renderCell",
        "(row, column) => ReactNode",
        "셀 표현 사용자화 · Vue에서는 #cell 슬롯",
      ],
      [
        "query / onQueryChange",
        "TableQuery / (query) => void",
        "page · pageSize · search · sort를 제품에서 관리",
      ],
      [
        "selected / onSelectedChange",
        "string[] / (ids) => void",
        "검색 결과와 독립적으로 유지할 선택 ID",
      ],
      [
        "filters / onFilterChange",
        "PatternFilter[] / (id, value) => void",
        "필터 값과 적용 콜백 · 데이터 필터링은 제품 책임",
      ],
      ["onResetFilters", "() => void", "제품이 관리하는 필터 값을 초기화"],
      [
        "searchLabel / resultCount",
        "string / number",
        "검색 입력 이름과 확인된 전체 결과 수 · 서버 건수를 모르면 생략",
      ],
      [
        "toolbar / bulkActions",
        "ReactNode",
        "목록 작업과 선택 항목에 적용할 동작",
      ],
      [
        "bulkBusy / bulkResult",
        "boolean / { succeeded, failed }",
        "일괄 처리 중 상태와 성공·실패 건수",
      ],
      ["onRetryBulkActions", "() => void", "실패한 항목 재시도"],
      [
        "onClearSelection",
        "() => void",
        "빈 선택으로 변경을 요청한 뒤 실행 · 이전 작업 결과 정리 등에 사용",
      ],
    ],
    code: `import { useState } from "react";
import { RecordCollection, type TableQuery } from "@cheese/react";

const rows = [
  { id: "guide", title: "디자인 가이드" },
  { id: "notes", title: "릴리스 노트" },
];

export function Library() {
  const [query, setQuery] = useState<TableQuery>({
    page: 1, pageSize: 5, search: "", sort: null,
  });
  const [selected, setSelected] = useState<string[]>([]);

  return <RecordCollection label="자료 목록" rows={rows}
    columns={[{ key: "title", label: "자료명", sortable: true }]}
    getRowId={(row) => row.id} rowLabel={(row) => row.title}
    query={query} onQueryChange={setQuery}
    selected={selected} onSelectedChange={setSelected} />;
}`,
  },
};

export default function CompositionDetails({ id }: { id: string }) {
  const [revision, setRevision] = useState(0);
  const entry = getCompositeEntry(id);
  const detail = details[id];
  if (!entry || !detail) return null;
  const Demo = detail.demo;
  const category = compositionCategories.find(
    (item) => item.id === entry.category,
  );
  return (
    <article className="composition-detail">
      <nav className="doc-crumb" aria-label="문서 위치">
        <a href="#/business-patterns">패턴과 템플릿</a>
        <ChevronRight aria-hidden="true" />
        <span>{entry.name}</span>
      </nav>
      <header className="page-heading">
        <span className="eyebrow">
          {compositionLevel(entry) === "template" ? "TEMPLATE" : "PATTERN"}
        </span>
        <h1>{entry.name}</h1>
        <p>{entry.description}</p>
      </header>
      <div className="component-meta">
        <Badge>
          {compositionLevel(entry) === "template" ? "템플릿" : "패턴"} ·{" "}
          {category?.name}
        </Badge>
        <span>@cheese/react · @cheese/vue</span>
        <a
          className="text-link"
          href={`./vue.html?demo=composition#composition-${id}`}
        >
          Vue 실행 예제
          <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
      <CompositionAnatomy id={id} />
      <section
        className="composition-detail-section"
        aria-label={`${entry.component} 미리보기`}
      >
        <div className="doc-section-heading">
          <h2>미리보기</h2>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setRevision((value) => value + 1)}
          >
            초기화
          </Button>
        </div>
        <div className="composition-preview">
          <Demo key={`${id}-${revision}`} />
        </div>
      </section>
      <section
        className="composition-detail-section"
        aria-labelledby="composition-api-heading"
      >
        <h2 id="composition-api-heading">API</h2>
        <div className="composition-api-scroll">
          <table className="composition-api-table">
            <thead>
              <tr>
                <th scope="col">속성</th>
                <th scope="col">타입</th>
                <th scope="col">역할</th>
              </tr>
            </thead>
            <tbody>
              {detail.api.map(([name, type, description]) => (
                <tr key={name}>
                  <th scope="row">
                    <code>{name}</code>
                  </th>
                  <td>
                    <code>{type}</code>
                  </td>
                  <td>{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section
        className="composition-detail-section"
        aria-labelledby="composition-code-heading"
      >
        <h2 id="composition-code-heading">사용하기</h2>
        <div className="code-block">
          <pre tabIndex={0}>
            <code>{detail.code}</code>
          </pre>
        </div>
        <p className="cheese-help">
          React 사용 예제입니다. Vue에서는 같은 속성과 이름 있는 슬롯을 사용하고
          상태를 이벤트로 연결합니다. 프레임워크별 동작은 위의 Vue 실행 예제에서
          확인할 수 있습니다.
        </p>
      </section>
    </article>
  );
}
