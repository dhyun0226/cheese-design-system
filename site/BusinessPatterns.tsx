import { useEffect, useRef, useState, type ComponentType } from "react";
import {
  ArrowUpRight,
  ChevronRight,
  LayoutDashboard,
  ClipboardList,
} from "lucide-react";
import {
  ActivityTimeline,
  AppShell,
  Badge,
  BulkActionBar,
  Button,
  Checkbox,
  DescriptionList,
  Field,
  FilterBar,
  Input,
  PageHeader,
  PeoplePicker,
  SaveStatus,
  Table,
  UserIdentity,
} from "@cheese/react";
import CompositionCatalog, { CompositionAnatomy } from "./CompositionCatalog";
import {
  compositionImport,
  compositionLevel,
  getCompositeEntry,
} from "./composition-catalog";
import "./business-patterns.css";

export const businessPatterns = [
  {
    id: "app-shell",
    name: "App shell",
    description:
      "탐색, 사용자 영역, 페이지 제목을 연결하는 업무 화면의 공통 구조입니다.",
  },
  {
    id: "people-picker",
    name: "People picker",
    description:
      "조직과 이름으로 사람을 찾고, 선택한 구성원을 확인한 뒤 적용합니다.",
  },
  {
    id: "filter-bar",
    name: "Filter bar",
    description: "검색어와 조건, 결과 수, 초기화를 한 흐름으로 묶습니다.",
  },
  {
    id: "bulk-action-bar",
    name: "Bulk action bar",
    description: "선택한 항목의 일괄 처리와 부분 실패, 재시도를 안내합니다.",
  },
  {
    id: "description-list",
    name: "Description list",
    description:
      "직원 정보와 요청 상세처럼 이름과 값으로 이루어진 정보를 정돈합니다.",
  },
  {
    id: "activity-timeline",
    name: "Activity timeline",
    description:
      "누가, 언제, 무엇을 했는지와 현재 진행 상태를 함께 보여 줍니다.",
  },
  {
    id: "save-status",
    name: "Save status",
    description: "변경, 저장 중, 완료, 실패 상태와 재시도 동작을 전달합니다.",
  },
] as const;

type PatternId = (typeof businessPatterns)[number]["id"];
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
const products = [
  { id: "evaluation", name: "인사평가", description: "평가 초안과 검토" },
  { id: "employees", name: "직원 관리", description: "검색과 일괄 처리" },
  { id: "auditions", name: "오디션 관리", description: "지원자와 심사 이력" },
];

function useDemoDelay() {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (callback: () => void) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(callback, 650);
  };
}

function AppShellDemo() {
  const [active, setActive] = useState("overview");
  const pages = {
    overview: {
      title: "요약",
      description: "PageHeader로 제목과 설명을 전달합니다.",
    },
    library: {
      title: "자료",
      description: "활성 메뉴에 맞는 콘텐츠를 children으로 전달합니다.",
    },
  };
  const page = pages[active as keyof typeof pages];
  return (
    <AppShell
      brand={<span className="business-demo-brand">Workspace</span>}
      navigationLabel="앱 구조 미리보기 탐색"
      items={[
        {
          id: "overview",
          label: "요약",
          icon: <LayoutDashboard aria-hidden="true" />,
          group: "워크스페이스",
        },
        {
          id: "library",
          label: "자료",
          icon: <ClipboardList aria-hidden="true" />,
          group: "워크스페이스",
        },
      ]}
      activeId={active}
      onNavigate={setActive}
      user={<UserIdentity name="김민서" description="사용자 영역" size="sm" />}
      footer={<span className="cheese-help">footer 슬롯</span>}
    >
      <div className="business-demo-dashboard">
        <PageHeader
          title={page.title}
          description={page.description}
          headingLevel={3}
        />
        <DescriptionList
          items={
            active === "overview"
              ? [
                  { label: "탐색", value: "items · activeId · onNavigate" },
                  { label: "사용자", value: "user 슬롯에 UserIdentity 전달" },
                  {
                    label: "본문",
                    value: "children 슬롯에 페이지 콘텐츠 전달",
                  },
                ]
              : [
                  { label: "현재 메뉴", value: "library" },
                  {
                    label: "콘텐츠",
                    value: "선택한 메뉴에 맞춰 부모에서 변경",
                  },
                ]
          }
        />
      </div>
    </AppShell>
  );
}

function PeoplePickerDemo() {
  const [value, setValue] = useState(["min"]);
  const [multiple, setMultiple] = useState(true);
  return (
    <div className="business-demo-stack">
      <Checkbox
        label="여러 명 선택"
        checked={multiple}
        onCheckedChange={(checked) => {
          setMultiple(checked === true);
          setValue((current) =>
            checked === true ? current : current.slice(0, 1),
          );
        }}
      />
      <PeoplePicker
        label="리뷰에 참여할 구성원"
        people={people}
        organizations={organizations}
        multiple={multiple}
        value={value}
        onValueChange={setValue}
      />
      <div className="business-demo-note" role="status">
        <span>적용된 구성원</span>
        <strong>
          {value.length
            ? people
                .filter((person) => value.includes(person.id))
                .map((person) => person.name)
                .join(", ")
            : "선택한 구성원이 없습니다."}
        </strong>
      </div>
      <p className="cheese-help">
        선택창에서 변경한 뒤 취소하면 기존 선택이 유지됩니다. ‘선택 적용’으로
        확정해 보세요.
      </p>
    </div>
  );
}

function FilterBarDemo() {
  const [search, setSearch] = useState("");
  const [team, setTeam] = useState("");
  const visible = people.filter(
    (person) =>
      (!team || person.organizationId === team) &&
      (person.name + person.description).includes(search.trim()),
  );
  return (
    <div className="business-demo-stack">
      <FilterBar
        label="구성원 검색 조건"
        search={search}
        onSearchChange={setSearch}
        searchLabel="구성원 이름 검색"
        filters={[
          {
            id: "team",
            label: "소속 조직",
            value: team,
            options: [
              { value: "", label: "전체 조직" },
              { value: "design", label: "디자인팀" },
              { value: "product", label: "제품팀" },
              { value: "people", label: "피플팀" },
            ],
          },
        ]}
        onFilterChange={(_, value) => setTeam(value)}
        onReset={() => {
          setSearch("");
          setTeam("");
        }}
        resultCount={visible.length}
      />
      <Table
        caption="조건에 맞는 구성원"
        headers={["이름", "소속 · 역할"]}
        rows={visible.map((person) => [person.name, person.description])}
      />
      {!visible.length && (
        <p className="business-demo-empty" role="status">
          일치하는 구성원이 없습니다. 검색어나 조직 조건을 바꿔 보세요.
        </p>
      )}
    </div>
  );
}

function BulkActionBarDemo() {
  const [selected, setSelected] = useState(["min", "ji", "su"]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(true);
  const [result, setResult] = useState<{ succeeded: number; failed: number }>();
  const delay = useDemoDelay();
  const process = (retry = false) => {
    const ids = [...selected];
    setBusy(true);
    setResult(undefined);
    delay(() => {
      const failed = !retry && simulateFailure ? ids.slice(-1) : [];
      const succeeded = ids.filter((id) => !failed.includes(id));
      setCompleted((current) => [...new Set([...current, ...succeeded])]);
      setSelected(failed);
      setResult({ succeeded: succeeded.length, failed: failed.length });
      setBusy(false);
    });
  };
  return (
    <div className="business-demo-stack">
      <Checkbox
        label="마지막 한 명의 처리 실패 재현"
        checked={simulateFailure}
        disabled={busy}
        onCheckedChange={(checked) => setSimulateFailure(checked === true)}
      />
      <div className="business-demo-rows">
        {people.slice(0, 3).map((person) => (
          <div className="business-demo-row" key={person.id}>
            <Checkbox
              label={person.name}
              checked={selected.includes(person.id)}
              disabled={busy || completed.includes(person.id)}
              onCheckedChange={(checked) => {
                setResult(undefined);
                setSelected((current) =>
                  checked === true
                    ? [...current, person.id]
                    : current.filter((id) => id !== person.id),
                );
              }}
            />
            <Badge
              tone={completed.includes(person.id) ? "positive" : "neutral"}
            >
              {completed.includes(person.id) ? "안내 발송 완료" : "발송 대기"}
            </Badge>
          </div>
        ))}
      </div>
      <BulkActionBar
        selectedCount={selected.length}
        busy={busy}
        result={result}
        actions={[
          {
            id: "notify",
            label: "평가 안내 보내기",
            onAction: () => process(),
          },
        ]}
        onClear={() => {
          setSelected([]);
          setResult(undefined);
        }}
        onRetry={result?.failed ? () => process(true) : undefined}
      />
      {!selected.length && !result && (
        <p className="cheese-help">구성원을 선택하면 일괄 작업이 나타납니다.</p>
      )}
      {!!completed.length && (
        <Button
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={() => {
            setCompleted([]);
            setSelected(["min", "ji", "su"]);
            setResult(undefined);
          }}
        >
          발송 예제 다시 시작
        </Button>
      )}
      <p className="cheese-help">
        가상 발송입니다. 실패한 항목만 선택에 남고, 재시도하면 해당 항목만
        처리합니다.
      </p>
    </div>
  );
}

function DescriptionListDemo() {
  const [details, setDetails] = useState(false);
  return (
    <div className="business-demo-stack">
      <div className="business-demo-row">
        <h3>김민서</h3>
        <Button
          variant="weak"
          size="sm"
          onClick={() => setDetails((current) => !current)}
          aria-pressed={details}
        >
          {details ? "기본 정보 보기" : "상세 정보 보기"}
        </Button>
      </div>
      <DescriptionList
        items={[
          { label: "소속 조직", value: "제품디자인실 · 디자인팀" },
          { label: "직무", value: "프로덕트 디자이너" },
          { label: "근무 상태", value: <Badge tone="positive">재직 중</Badge> },
          ...(details
            ? [
                { label: "입사일", value: "2024년 3월 4일" },
                { label: "이메일", value: "minseo@example.com" },
                {
                  label: "소개",
                  value:
                    "사람들이 복잡한 업무를 편안하게 처리할 수 있도록 제품 경험을 설계합니다.",
                },
              ]
            : []),
        ]}
      />
    </div>
  );
}

function ActivityTimelineDemo() {
  const [step, setStep] = useState(1);
  const [failed, setFailed] = useState(false);
  const events = [
    {
      id: "draft",
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
  return (
    <div className="business-demo-stack">
      <ActivityTimeline
        label="지원자 진행 이력"
        items={events.map((event, index) => ({
          ...event,
          status:
            index < step
              ? ("done" as const)
              : index > step
                ? ("pending" as const)
                : failed
                  ? ("error" as const)
                  : ("current" as const),
        }))}
      />
      <div className="cheese-inline">
        <Button
          variant="weak"
          disabled={step === events.length}
          onClick={() => {
            setStep((current) => current + 1);
            setFailed(false);
          }}
        >
          현재 단계 완료
        </Button>
        <Button
          variant="ghost"
          disabled={step === events.length}
          onClick={() => setFailed((current) => !current)}
        >
          {failed ? "문제 해결" : "오류 상태 보기"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setStep(1);
            setFailed(false);
          }}
        >
          초기화
        </Button>
      </div>
      <p className="cheese-help" role="status">
        {step === events.length
          ? "모든 단계가 완료되었습니다."
          : `${events[step].title} ${failed ? "단계에서 확인이 필요합니다." : "단계가 진행 중입니다."}`}
      </p>
    </div>
  );
}

function SaveStatusDemo() {
  const [title, setTitle] = useState("팀과 함께 만든 변화");
  const [status, setStatus] = useState<
    "idle" | "dirty" | "saving" | "saved" | "error"
  >("idle");
  const [simulateFailure, setSimulateFailure] = useState(false);
  const delay = useDemoDelay();
  const save = (retry = false) => {
    setStatus("saving");
    delay(() => setStatus(simulateFailure && !retry ? "error" : "saved"));
  };
  return (
    <div className="business-demo-stack">
      <Field label="평가 제목">
        <Input
          value={title}
          disabled={status === "saving"}
          onChange={(event) => {
            setTitle(event.target.value);
            setStatus("dirty");
          }}
        />
      </Field>
      <Checkbox
        label="다음 저장 실패 재현"
        checked={simulateFailure}
        disabled={status === "saving"}
        onCheckedChange={(checked) => setSimulateFailure(checked === true)}
      />
      <div className="business-demo-row">
        <SaveStatus
          status={status}
          onRetry={status === "error" ? () => save(true) : undefined}
        />
        <Button
          disabled={!title.trim() || status === "saving"}
          loading={status === "saving"}
          onClick={() => save()}
        >
          저장
        </Button>
      </div>
      <p className="cheese-help">
        가상 요청으로 상태를 전환합니다. 새로고침하면 입력값은 초기화됩니다.
      </p>
    </div>
  );
}

const documentation: Record<
  PatternId,
  {
    demo: ComponentType;
    props: string[];
    usage: string;
    code: string;
    products: string[];
  }
> = {
  "app-shell": {
    demo: AppShellDemo,
    props: [
      "brand",
      "items",
      "activeId",
      "onNavigate(id, event)",
      "user",
      "sidebarUser",
      "headerActions",
      "variant",
      "children",
    ],
    usage:
      "AppShell이 공통 탐색과 콘텐츠 영역을 배치하고, PageHeader가 페이지 제목과 동작을 묶습니다. 현재 메뉴와 이동 동작은 제품의 라우터에 연결하세요.",
    code: '<AppShell brand="Workspace" items={navigation}\n  activeId={page} onNavigate={setPage}\n  user={<UserIdentity name="김민서" description="디자인팀" />}>\n  <PageHeader title="자료" description="공유한 자료를 관리합니다." />\n  {children}\n</AppShell>',
    products: ["evaluation", "employees", "auditions"],
  },
  "people-picker": {
    demo: PeoplePickerDemo,
    props: [
      "label",
      "people",
      "organizations",
      "value",
      "onValueChange",
      "multiple",
    ],
    usage:
      "조직 트리와 이름 검색으로 후보를 찾습니다. 선택창 안의 변경은 임시 상태이며 적용할 때만 onValueChange가 호출됩니다. 취소와 Escape는 이전 선택을 유지합니다.",
    code: '<PeoplePicker label="평가 참여자"\n  people={people} organizations={organizations}\n  value={selected} onValueChange={setSelected}\n  multiple />',
    products: ["evaluation", "employees", "auditions"],
  },
  "filter-bar": {
    demo: FilterBarDemo,
    props: [
      "search",
      "onSearchChange",
      "filters",
      "onFilterChange",
      "onReset",
      "resultCount",
    ],
    usage:
      "필터 값과 검색 결과는 사용하는 화면에서 관리합니다. 조건이 바뀌면 목록과 resultCount를 함께 갱신하고, 초기화 시 각 필터의 기본값으로 되돌리세요.",
    code: "<FilterBar search={search} onSearchChange={setSearch}\n  filters={filters} onFilterChange={updateFilter}\n  onReset={resetFilters} resultCount={rows.length} />",
    products: ["employees", "auditions"],
  },
  "bulk-action-bar": {
    demo: BulkActionBarDemo,
    props: ["selectedCount", "actions", "onClear", "busy", "result", "onRetry"],
    usage:
      "선택 수와 실행할 작업을 전달합니다. 처리 중에는 중복 실행을 막고, 완료 후 성공한 항목은 선택에서 제거하세요. 실패한 항목만 유지하면 재시도 대상을 명확하게 전달할 수 있습니다.",
    code: '<BulkActionBar selectedCount={selected.length}\n  actions={[{ id: "send", label: "안내 발송", onAction: send }]}\n  onClear={clearSelection} busy={pending}\n  result={result} onRetry={retryFailed} />',
    products: ["employees", "auditions"],
  },
  "description-list": {
    demo: DescriptionListDemo,
    props: ["items: { label, value }[]"],
    usage:
      "연관된 정보를 이름과 값의 순서로 전달합니다. HTML의 dl, dt, dd 구조를 사용하며 긴 값은 자연스럽게 줄바꿈됩니다. React의 value에는 Badge 같은 컴포넌트도 넣을 수 있습니다.",
    code: '<DescriptionList items={[\n  { label: "소속", value: "디자인팀" },\n  { label: "직무", value: "프로덕트 디자이너" },\n]} />',
    products: ["employees", "auditions"],
  },
  "activity-timeline": {
    demo: ActivityTimelineDemo,
    props: ["label", "items", "status: done | current | pending | error"],
    usage:
      "업무 순서대로 항목을 전달하고 상태, 담당자, 시간을 함께 표시합니다. 과거 기록과 진행 단계를 구분해 제공하며, 상태 변화는 제품의 업무 데이터에 연결하세요.",
    code: '<ActivityTimeline label="심사 진행 이력" items={[\n  { id: "received", title: "지원서 접수", status: "done" },\n  { id: "review", title: "서류 검토", actor: "이수진",\n    time: "09.25 · 14:00", status: "current" },\n]} />',
    products: ["evaluation", "auditions"],
  },
  "save-status": {
    demo: SaveStatusDemo,
    props: [
      "status: idle | dirty | saving | saved | error",
      "label",
      "onRetry",
    ],
    usage:
      "저장 요청의 상태를 표시하고 실패 시 재시도를 제공합니다. 저장 실행, 자동 저장 주기, 데이터 보관, 페이지 이탈 확인은 사용하는 제품이 관리합니다. 이 패턴 자체는 데이터를 저장하지 않습니다.",
    code: '<SaveStatus status={saveState}\n  onRetry={saveState === "error" ? retrySave : undefined} />',
    products: ["evaluation", "auditions"],
  },
};

function ProductLinks({
  ids = products.map((product) => product.id),
}: {
  ids?: string[];
}) {
  return (
    <div className="business-product-links">
      {products
        .filter((product) => ids.includes(product.id))
        .map((product) => (
          <a key={product.id} href={`#/examples/${product.id}`}>
            <span>
              <strong>{product.name}</strong>
              <span>{product.description}</span>
            </span>
            <ArrowUpRight aria-hidden="true" />
          </a>
        ))}
    </div>
  );
}

export default function BusinessPatterns({ id }: { id?: string }) {
  const [revision, setRevision] = useState(0);
  const pattern = businessPatterns.find((item) => item.id === id);
  if (!pattern) return <CompositionCatalog />;
  const catalogEntry = getCompositeEntry(pattern.id)!;
  const level = compositionLevel(catalogEntry);
  const detail = documentation[pattern.id];
  const Demo = detail.demo;
  return (
    <article className="business-patterns business-pattern-detail">
      <nav className="doc-crumb" aria-label="문서 위치">
        <a href="#/business-patterns">패턴과 템플릿</a>
        <ChevronRight aria-hidden="true" />
        <span>{pattern.name}</span>
      </nav>
      <header className="page-heading">
        <span className="eyebrow">
          {level === "template" ? "TEMPLATE" : "PATTERN"}
        </span>
        <h1>{pattern.name}</h1>
        <p>{pattern.description}</p>
      </header>
      <div className="component-meta">
        <Badge>{level === "template" ? "템플릿" : "패턴"}</Badge>
        <span>@cheese/react · @cheese/vue</span>
        <a className="text-link" href="./vue.html?demo=patterns">
          Vue 예제 <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
      <CompositionAnatomy id={pattern.id} />
      <section
        className="business-pattern-section"
        aria-labelledby="pattern-demo-heading"
      >
        <div className="doc-section-heading">
          <h2 id="pattern-demo-heading">미리보기</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRevision((current) => current + 1)}
          >
            초기화
          </Button>
        </div>
        <div className="business-pattern-stage" data-pattern={pattern.id}>
          <Demo key={`${pattern.id}-${revision}`} />
        </div>
      </section>
      <section
        className="business-pattern-section"
        aria-labelledby="pattern-usage-heading"
      >
        <h2 id="pattern-usage-heading">사용하기</h2>
        <p className="business-pattern-usage">{detail.usage}</p>
        <div className="business-pattern-props" aria-label="주요 속성">
          {detail.props.map((prop) => (
            <Badge key={prop}>{prop}</Badge>
          ))}
        </div>
        <div className="code-block">
          <pre tabIndex={0}>
            <code>
              {compositionImport(
                pattern.name
                  .replace(/(^|\s)\S/g, (character) => character.toUpperCase())
                  .replaceAll(" ", ""),
                detail.code,
              )}
            </code>
          </pre>
        </div>
      </section>
      <section
        className="business-pattern-section"
        aria-labelledby="pattern-products-heading"
      >
        <div className="doc-section-heading">
          <h2 id="pattern-products-heading">제품 적용 예제</h2>
          <a className="text-link" href="#/business-patterns">
            모든 패턴과 템플릿 <ChevronRight aria-hidden="true" />
          </a>
        </div>
        <ProductLinks ids={detail.products} />
      </section>
    </article>
  );
}
