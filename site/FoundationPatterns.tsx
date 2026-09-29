import { useState, type ComponentType } from "react";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { compositionLevel, getCompositeEntry } from "./composition-catalog";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  DescriptionList,
  Field,
  Input,
  Pagination,
  SaveStatus,
  Table,
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
  ListPage,
  DetailPage,
  FormPage,
  MasterDetailLayout,
  FormSection,
  FormGrid,
  FormActions,
  ReadOnlyField,
  OrganizationTreeSelect,
  PermissionMatrix,
  SortableList,
  NotificationCenter,
  CommentComposer,
  CommentThread,
  FilePreview,
  AttachmentGallery,
  AccessDenied,
  SessionExpired,
  PageError,
  SavedViews,
  ImportWizard,
  ExportDialog,
  type PermissionGrant,
  type CommentItem,
  type NotificationItem,
  type PreviewFile,
  type ImportRow,
} from "@cheese/react";
import sampleLogo from "./assets/starship-logo.png";
import "./foundation-patterns.css";
import { CompositionAnatomy } from "./CompositionCatalog";
import { compositionImport } from "./composition-catalog";

import { foundationPatterns } from "./foundation-catalog";
export { foundationPatterns } from "./foundation-catalog";

type FoundationId = (typeof foundationPatterns)[number]["id"];
type Documentation = {
  demo: ComponentType;
  props: string[];
  usage: string;
  responsibility: string;
  code: string;
  component: string;
};

const staff = [
  { id: "min", name: "김민서", team: "플랫폼팀", role: "개발자" },
  { id: "ji", name: "박지안", team: "디자인팀", role: "디자이너" },
  { id: "su", name: "이수진", team: "피플팀", role: "People Partner" },
  { id: "yun", name: "정윤서", team: "플랫폼팀", role: "기획자" },
];

function ListPageDemo() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const matches = staff.filter((person) =>
    `${person.name} ${person.team}`.includes(search),
  );
  return (
    <ListPage
      title="구성원"
      headingLevel={3}
      description="이름과 소속을 확인합니다."
      summary={<Badge>{matches.length}명</Badge>}
      filters={
        <Field label="구성원 검색">
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="이름 또는 부서"
          />
        </Field>
      }
      pagination={
        <Pagination
          page={page}
          count={Math.max(1, Math.ceil(matches.length / 2))}
          onPageChange={setPage}
        />
      }
    >
      <Table
        caption="검색한 구성원"
        headers={["이름", "소속", "직무"]}
        rows={matches
          .slice((page - 1) * 2, page * 2)
          .map((person) => [person.name, person.team, person.role])}
      />
      {!matches.length && (
        <p className="cheese-help" role="status">
          검색 조건에 맞는 구성원이 없습니다.
        </p>
      )}
    </ListPage>
  );
}

function DetailPageDemo() {
  const [tab, setTab] = useState("profile");
  return (
    <TabsRoot value={tab} onValueChange={setTab}>
      <DetailPage
        title="김민서"
        headingLevel={3}
        description="구성원 상세 정보"
        summary={<Badge tone="brand">재직</Badge>}
        tabs={
          <TabsList aria-label="상세 정보 구분">
            <TabsTrigger value="profile">기본 정보</TabsTrigger>
            <TabsTrigger value="history">변경 이력</TabsTrigger>
          </TabsList>
        }
        aside={
          <Card>
            <ReadOnlyField label="담당자" value="이수진 · 피플팀" />
          </Card>
        }
        footer={
          <p className="cheese-help">
            조회 화면의 공개 항목은 서비스 권한 정책에서 결정합니다.
          </p>
        }
      >
        <TabsContent value="profile">
          <DescriptionList
            items={[
              { label: "소속", value: "플랫폼팀" },
              { label: "직무", value: "개발자" },
            ]}
          />
        </TabsContent>
        <TabsContent value="history">
          <Table
            caption="정보 변경 이력"
            headers={["변경일", "내용"]}
            rows={[["2026.09.01", "플랫폼팀으로 소속 변경"]]}
          />
        </TabsContent>
      </DetailPage>
    </TabsRoot>
  );
}

function FormPageDemo() {
  const [name, setName] = useState("김민서");
  const [status, setStatus] = useState<"idle" | "dirty" | "saving" | "saved">(
    "idle",
  );
  return (
    <FormPage
      title="구성원 등록"
      headingLevel={3}
      description="공통 입력 틀에 업무별 필드를 조합합니다."
      pending={status === "saving"}
      onSubmit={() => {
        setStatus("saving");
        window.setTimeout(() => setStatus("saved"), 500);
      }}
      footer={
        <FormActions
          pending={status === "saving"}
          submitDisabled={!name.trim()}
          status={<SaveStatus status={status} />}
          onCancel={() => {
            setName("");
            setStatus("idle");
          }}
        />
      }
    >
      <FormSection title="기본 정보">
        <FormGrid>
          <Field label="이름" required>
            <Input
              required
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setStatus("dirty");
              }}
            />
          </Field>
          <ReadOnlyField label="소속" value="플랫폼팀" />
        </FormGrid>
      </FormSection>
    </FormPage>
  );
}

function MasterDetailDemo() {
  const [selected, setSelected] = useState(staff[0]);
  return (
    <MasterDetailLayout
      listLabel="구성원 목록"
      detailLabel="선택한 구성원"
      list={
        <ul className="foundation-list">
          {staff.map((person) => (
            <li key={person.id}>
              <Button
                variant={selected.id === person.id ? "weak" : "ghost"}
                aria-pressed={selected.id === person.id}
                onClick={() => setSelected(person)}
              >
                {person.name}
              </Button>
            </li>
          ))}
        </ul>
      }
      detail={
        <DetailPage title={selected.name} headingLevel={3}>
          <DescriptionList
            items={[
              { label: "소속", value: selected.team },
              { label: "직무", value: selected.role },
            ]}
          />
        </DetailPage>
      }
    />
  );
}

function FormSectionDemo() {
  const [locked, setLocked] = useState(false);
  return (
    <div className="foundation-stack">
      <Checkbox
        label="입력 영역 비활성화"
        checked={locked}
        onCheckedChange={(value) => setLocked(value === true)}
      />
      <FormSection
        title="연락 정보"
        description="업무에 필요한 연락처만 수집합니다."
        disabled={locked}
      >
        <FormGrid>
          <Field label="회사 이메일">
            <Input type="email" defaultValue="minseo@example.com" />
          </Field>
          <Field label="내선 번호">
            <Input defaultValue="1234" />
          </Field>
        </FormGrid>
      </FormSection>
    </div>
  );
}

function FormGridDemo() {
  const [columns, setColumns] = useState<1 | 2 | 3>(2);
  return (
    <div className="foundation-stack">
      <div className="foundation-row" aria-label="입력 열 수">
        {([1, 2, 3] as const).map((count) => (
          <Button
            key={count}
            variant={columns === count ? "weak" : "ghost"}
            aria-pressed={columns === count}
            onClick={() => setColumns(count)}
          >
            {count}열
          </Button>
        ))}
      </div>
      <FormGrid columns={columns}>
        <Field label="이름">
          <Input defaultValue="김민서" />
        </Field>
        <Field label="부서">
          <Input defaultValue="플랫폼팀" />
        </Field>
        <Field label="직무">
          <Input defaultValue="개발자" />
        </Field>
      </FormGrid>
      <p className="foundation-note">
        좁은 화면에서는 자동으로 한 열로 전환합니다.
      </p>
    </div>
  );
}

function FormActionsDemo() {
  const [name, setName] = useState("프로젝트 알림");
  const [status, setStatus] = useState<"idle" | "dirty" | "saving" | "saved">(
    "idle",
  );
  return (
    <form
      className="foundation-stack"
      onSubmit={(event) => {
        event.preventDefault();
        if (status === "saving") return;
        setStatus("saving");
        window.setTimeout(() => setStatus("saved"), 500);
      }}
    >
      <Field label="설정 이름">
        <Input
          value={name}
          disabled={status === "saving"}
          onChange={(event) => {
            setName(event.target.value);
            setStatus("dirty");
          }}
        />
      </Field>
      <FormActions
        submitLabel="설정 저장"
        pending={status === "saving"}
        submitDisabled={!name.trim()}
        onCancel={() => {
          setName("프로젝트 알림");
          setStatus("idle");
        }}
        status={<SaveStatus status={status} />}
      />
    </form>
  );
}

function ReadOnlyFieldDemo() {
  const [empty, setEmpty] = useState(false);
  return (
    <div className="foundation-stack">
      <Checkbox
        label="비어 있는 값 보기"
        checked={empty}
        onCheckedChange={(value) => setEmpty(value === true)}
      />
      <FormGrid>
        <ReadOnlyField label="구성원" value={empty ? undefined : "김민서"} />
        <ReadOnlyField
          label="잔여 업무"
          value={empty ? undefined : 0}
          emptyText="등록된 업무 없음"
        />
        <ReadOnlyField label="알림 숨김" value={empty ? undefined : false} />
        <ReadOnlyField
          label="상태"
          value={empty ? undefined : <Badge tone="brand">재직</Badge>}
        />
      </FormGrid>
    </div>
  );
}

const organizationNodes = [
  {
    id: "company",
    label: "CHEESE Studio",
    children: [
      { id: "platform", label: "플랫폼팀" },
      { id: "design", label: "디자인팀" },
      { id: "archive", label: "보관 조직", disabled: true },
    ],
  },
];
function OrganizationDemo() {
  const [value, setValue] = useState<string[]>(["platform"]);
  const [multiple, setMultiple] = useState(true);
  return (
    <div className="foundation-stack">
      <Checkbox
        label="여러 조직 선택"
        checked={multiple}
        onCheckedChange={(next) => {
          setMultiple(next === true);
          setValue((current) =>
            next === true ? current : current.slice(0, 1),
          );
        }}
      />
      <OrganizationTreeSelect
        label="업무 담당 조직"
        nodes={organizationNodes}
        value={value}
        onValueChange={setValue}
        multiple={multiple}
        description="선택한 조직만 적용됩니다. 하위 조직을 자동 포함하지 않습니다."
      />
      <p className="cheese-help" role="status">
        선택된 ID: {value.join(", ") || "없음"}
      </p>
    </div>
  );
}

function PermissionDemo() {
  const [value, setValue] = useState<PermissionGrant[]>([
    { resourceId: "employee", actionId: "read" },
  ]);
  const [readOnly, setReadOnly] = useState(false);
  return (
    <div className="foundation-stack">
      <Checkbox
        label="권한 읽기 전용"
        checked={readOnly}
        onCheckedChange={(next) => setReadOnly(next === true)}
      />
      <PermissionMatrix
        label="역할별 기능 권한"
        resources={[
          { id: "employee", label: "직원 정보" },
          {
            id: "evaluation",
            label: "평가 결과",
            unavailableActions: ["delete"],
          },
          { id: "system", label: "시스템 설정", disabled: true },
        ]}
        actions={[
          { id: "read", label: "조회" },
          { id: "edit", label: "수정" },
          { id: "delete", label: "삭제" },
        ]}
        value={value}
        onValueChange={setValue}
        readOnly={readOnly}
      />
      <p className="cheese-help" role="status">
        선택된 권한 {value.length}개
      </p>
    </div>
  );
}

function SortableDemo() {
  const [items, setItems] = useState([
    { id: "dashboard", label: "대시보드" },
    { id: "employees", label: "직원 관리" },
    { id: "evaluations", label: "평가 관리" },
    { id: "settings", label: "보안 설정", disabled: true },
  ]);
  return (
    <SortableList
      label="메뉴 순서"
      description="이동 버튼 또는 Alt + 방향키로 정렬합니다. 보안 설정은 고정되어 있습니다."
      items={items}
      onItemsChange={setItems}
    />
  );
}

function useExampleRequest() {
  const [failNext, setFailNext] = useState(false);
  async function request() {
    await new Promise<void>((resolve) => window.setTimeout(resolve, 400));
    if (failNext) {
      setFailNext(false);
      throw new Error("예제 요청 실패");
    }
  }
  return {
    request,
    control: (
      <Checkbox
        label="다음 요청 실패 재현"
        checked={failNext}
        onCheckedChange={(value) => setFailNext(value === true)}
      />
    ),
  };
}

function NotificationDemo() {
  const [items, setItems] = useState<NotificationItem[]>([
    {
      id: "evaluation",
      title: "자기평가 작성 요청",
      body: "평가 기간과 작성 항목을 확인해 주세요.",
      time: "10분 전",
      read: false,
    },
    {
      id: "review",
      title: "지원서 검토 배정",
      body: "새로운 지원서 2건이 배정되었습니다.",
      time: "1시간 전",
      read: false,
    },
    {
      id: "notice",
      title: "업무 안내",
      body: "공통 문서 양식이 업데이트되었습니다.",
      time: "어제",
      read: true,
    },
  ]);
  const [opened, setOpened] = useState("");
  const { request, control } = useExampleRequest();
  return (
    <div className="foundation-stack">
      {control}
      <NotificationCenter
        items={items}
        onRead={async (id) => {
          await request();
          setItems((current) =>
            current.map((item) =>
              item.id === id ? { ...item, read: true } : item,
            ),
          );
        }}
        onReadAll={async () => {
          await request();
          setItems((current) =>
            current.map((item) => ({ ...item, read: true })),
          );
        }}
        onNavigate={(item) => setOpened(item.title)}
      />
      {opened && (
        <p className="cheese-help" role="status">
          선택한 알림: {opened}
        </p>
      )}
    </div>
  );
}

function ComposerDemo() {
  const [submitted, setSubmitted] = useState("");
  const { request, control } = useExampleRequest();
  return (
    <div className="foundation-stack">
      {control}
      <CommentComposer
        label="검토 의견"
        maxLength={500}
        onSubmit={async (body) => {
          await request();
          setSubmitted(body);
        }}
      />
      {submitted && (
        <Card>
          <ReadOnlyField label="등록한 의견" value={submitted} />
        </Card>
      )}
    </div>
  );
}

const initialComments: CommentItem[] = [
  {
    id: "one",
    author: "김민서",
    body: "공통 양식을 확인했습니다. 필수 항목부터 적용하면 좋겠습니다.",
    time: "오늘 10:00",
    canEdit: true,
    canDelete: true,
    canReply: true,
    replies: [
      {
        id: "reply-one",
        author: "이수진",
        body: "다음 검토에서 함께 확인하겠습니다.",
        time: "오늘 10:10",
      },
    ],
  },
  {
    id: "two",
    author: "박지안",
    body: "모바일에서도 같은 순서로 읽히면 좋겠습니다.",
    time: "오늘 11:00",
    canReply: true,
  },
];
function CommentThreadDemo() {
  const [items, setItems] = useState<CommentItem[]>(initialComments);
  const { request, control } = useExampleRequest();
  return (
    <div className="foundation-stack">
      {control}
      <CommentThread
        label="검토 대화"
        items={items}
        onEdit={async (id, body) => {
          await request();
          setItems((current) =>
            current.map((item) =>
              item.id === id ? { ...item, body, edited: true } : item,
            ),
          );
        }}
        onDelete={async (id) => {
          await request();
          setItems((current) => current.filter((item) => item.id !== id));
        }}
        onReply={async (id, body) => {
          await request();
          setItems((current) =>
            current.map((item) =>
              item.id === id
                ? {
                    ...item,
                    replies: [
                      ...(item.replies ?? []),
                      {
                        id: `reply-${Date.now()}`,
                        author: "나",
                        body,
                        time: "방금",
                      },
                    ],
                  }
                : item,
            ),
          );
        }}
      />
    </div>
  );
}

function previewItems(): PreviewFile[] {
  return [
    {
      id: "logo",
      name: "브랜드 로고.png",
      kind: "image",
      url: new URL(sampleLogo, window.location.href).href,
      description: "문서 사이트에서 사용하는 로고 이미지입니다.",
      status: "ready",
      downloadable: true,
    },
    {
      id: "text",
      name: "안내 문서.txt",
      kind: "unsupported",
      url: new URL("./sample-evaluation.txt", window.location.href).href,
      description: "이 형식은 다운로드해서 확인합니다.",
      status: "ready",
      downloadable: true,
    },
    {
      id: "expired",
      name: "만료된 이미지.png",
      kind: "image",
      url: new URL(sampleLogo, window.location.href).href,
      status: "expired",
    },
  ];
}
function downloadFile(item: PreviewFile) {
  if (!item.url) return;
  const link = document.createElement("a");
  link.href = item.url;
  link.download = item.name;
  link.click();
}
function FilePreviewDemo() {
  const [items, setItems] = useState(previewItems);
  const [id, setId] = useState<string | null>(null);
  const [opener, setOpener] = useState<HTMLElement | null>(null);
  return (
    <div className="foundation-stack">
      <div className="foundation-row">
        {items.map((item) => (
          <Button
            key={item.id}
            variant="weak"
            onClick={(event) => {
              setOpener(event.currentTarget);
              setId(item.id);
            }}
          >
            {item.name} 열기
          </Button>
        ))}
      </div>
      <FilePreview
        open={id !== null}
        item={items.find((item) => item.id === id) ?? null}
        returnFocus={opener}
        onOpenChange={(open) => !open && setId(null)}
        onRetry={(item) =>
          setItems((current) =>
            current.map((entry) =>
              entry.id === item.id ? { ...entry, status: "ready" } : entry,
            ),
          )
        }
        onDownload={downloadFile}
      />
      <p className="foundation-note">
        만료 항목의 재시도는 예제에서 상태만 복원합니다. 실제 서비스는 새 접근
        URL을 발급해야 합니다.
      </p>
    </div>
  );
}
function AttachmentGalleryDemo() {
  const [items, setItems] = useState(previewItems);
  const [id, setId] = useState<string | null>(null);
  return (
    <AttachmentGallery
      label="참고 첨부 파일"
      items={items}
      previewId={id}
      onPreviewChange={setId}
      onRetry={(item) =>
        setItems((current) =>
          current.map((entry) =>
            entry.id === item.id ? { ...entry, status: "ready" } : entry,
          ),
        )
      }
      onDownload={downloadFile}
    />
  );
}

function AccessDeniedDemo() {
  const [requested, setRequested] = useState(false);
  return (
    <div className="foundation-stack">
      <AccessDenied
        description="이 화면은 업무 담당자에게만 공개됩니다."
        actionLabel="접근 요청 안내"
        onAction={() => setRequested(true)}
      />
      {requested && (
        <p className="cheese-help" role="status">
          접근이 필요한 업무와 조직을 관리자에게 전달하세요. 예제에서는 요청을
          전송하지 않습니다.
        </p>
      )}
    </div>
  );
}
function SessionExpiredDemo() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  return done ? (
    <Card>
      <p role="status">
        로그인 연결 동작을 확인했습니다. 실제 인증은 수행하지 않았습니다.
      </p>
      <Button variant="ghost" onClick={() => setDone(false)}>
        만료 상태 다시 보기
      </Button>
    </Card>
  ) : (
    <SessionExpired
      busy={busy}
      onReauthenticate={() => {
        setBusy(true);
        window.setTimeout(() => {
          setBusy(false);
          setDone(true);
        }, 500);
      }}
    />
  );
}
function PageErrorDemo() {
  const [busy, setBusy] = useState(false);
  const [recovered, setRecovered] = useState(false);
  return recovered ? (
    <Card>
      <p role="status">화면을 다시 불러왔습니다.</p>
      <Button variant="ghost" onClick={() => setRecovered(false)}>
        오류 상태 다시 보기
      </Button>
    </Card>
  ) : (
    <PageError
      description="구성원 목록을 불러오지 못했습니다. 입력한 내용은 유지됩니다."
      busy={busy}
      onRetry={() => {
        setBusy(true);
        window.setTimeout(() => {
          setBusy(false);
          setRecovered(true);
        }, 500);
      }}
    />
  );
}

function SavedViewsDemo() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string>();
  const [views, setViews] = useState([
    { id: "platform", label: "플랫폼팀", query: "플랫폼팀" },
  ]);
  const { request, control } = useExampleRequest();
  const matches = staff.filter((person) =>
    `${person.name} ${person.team}`.includes(query),
  );
  return (
    <div className="foundation-stack">
      {control}
      <Field label="현재 검색 조건">
        <Input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected(undefined);
          }}
        />
      </Field>
      <SavedViews
        label="저장된 검색 조건"
        views={views}
        value={selected}
        onSelect={(id) => {
          setSelected(id);
          setQuery(views.find((view) => view.id === id)?.query ?? "");
        }}
        onSave={async (label) => {
          await request();
          const id = `view-${Date.now()}`;
          setViews((current) => [...current, { id, label, query }]);
          setSelected(id);
        }}
        onDelete={async (id) => {
          await request();
          setViews((current) => current.filter((view) => view.id !== id));
          if (selected === id) setSelected(undefined);
        }}
      />
      <Table
        caption="현재 조건의 구성원"
        headers={["이름", "소속"]}
        rows={matches.map((person) => [person.name, person.team])}
      />
    </div>
  );
}

/** Example adapter only: UTF-8 CSV with quotes, escaped quotes and CRLF support. */
function parseCsv(text: string) {
  const table: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (quoted || !cell) quoted = !quoted;
      else throw new Error("CSV 따옴표 형식을 확인해 주세요.");
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((value) => value.length)) table.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  if (quoted) throw new Error("닫히지 않은 CSV 따옴표가 있습니다.");
  row.push(cell);
  if (row.some((value) => value.length)) table.push(row);
  const columns =
    table.shift()?.map((value) => value.replace(/^\uFEFF/, "").trim()) ?? [];
  if (
    !columns.length ||
    columns.some((column) => !column) ||
    new Set(columns).size !== columns.length
  )
    throw new Error("첫 행에 서로 다른 열 이름을 입력하세요.");
  if (table.some((values) => values.length !== columns.length))
    throw new Error("각 행의 열 수가 일치해야 합니다.");
  return {
    columns,
    rows: table.map((values) =>
      Object.fromEntries(
        columns.map((column, index) => [column, values[index]]),
      ),
    ),
  };
}
function downloadCsv(name: string, columns: string[], rows: string[][]) {
  const escape = (value: string) =>
    `"${(/^[=+@\-\t\r]/.test(value) ? "'" : "") + value.replaceAll('"', '""')}"`;
  const url = URL.createObjectURL(
    new Blob(
      [
        "\uFEFF",
        [columns, ...rows].map((row) => row.map(escape).join(",")).join("\r\n"),
      ],
      { type: "text/csv;charset=utf-8" },
    ),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function ImportWizardDemo() {
  const [failNext, setFailNext] = useState(false);
  const [imported, setImported] = useState<ImportRow[]>([]);
  return (
    <div className="foundation-stack">
      <div className="foundation-row">
        <Button
          variant="weak"
          onClick={() =>
            downloadCsv(
              "cheese-members-sample.csv",
              ["name", "team"],
              [
                ["김민서", "플랫폼팀"],
                ["이지우", "디자인팀"],
              ],
            )
          }
        >
          샘플 CSV 다운로드
        </Button>
        <Checkbox
          label="다음 요청 실패 재현"
          checked={failNext}
          onCheckedChange={(value) => setFailNext(value === true)}
        />
      </div>
      <ImportWizard
        title="구성원 일괄 등록"
        accept=".csv"
        fields={[
          { id: "name", label: "이름", required: true },
          { id: "team", label: "소속", required: true },
        ]}
        parse={async (file, { signal }) => {
          const text = await file.text();
          if (signal.aborted) throw new DOMException("취소됨", "AbortError");
          return parseCsv(text);
        }}
        validate={async (rows) =>
          rows
            .filter((row) => row.values.name.length > 30)
            .map((row) => ({
              row: row.row,
              field: "name",
              message: "이름은 30자 이하로 입력하세요.",
            }))
        }
        importRows={async (rows, { signal }) => {
          await new Promise<void>((resolve) => window.setTimeout(resolve, 400));
          if (signal.aborted) throw new DOMException("취소됨", "AbortError");
          const failedRow = failNext ? rows[rows.length - 1]?.row : undefined;
          setFailNext(false);
          const succeeded = rows.filter((row) => row.row !== failedRow);
          setImported((current) => [...current, ...succeeded]);
          return {
            succeededRows: succeeded.map((row) => row.row),
            failures: failedRow
              ? [
                  {
                    row: failedRow,
                    message: "가상 등록 요청 실패. 이 행만 다시 시도하세요.",
                  },
                ]
              : [],
          };
        }}
      />
      <p className="cheese-help" role="status">
        예제 메모리에 등록한 행: {imported.length}개
      </p>
      <p className="foundation-note">
        이 예제의 어댑터는 UTF-8 CSV만 읽습니다. XLSX나 대용량 파일은 사용하는
        서비스에서 별도 파서를 연결하세요.
      </p>
    </div>
  );
}
function ExportDialogDemo() {
  const [open, setOpen] = useState(false);
  const [exported, setExported] = useState(false);
  const { request, control } = useExampleRequest();
  return (
    <div className="foundation-stack">
      {control}
      <div className="foundation-row">
        <Button onClick={() => setOpen(true)}>구성원 내보내기</Button>
        {exported && <Badge tone="brand">CSV 생성 완료</Badge>}
      </div>
      <ExportDialog
        open={open}
        onOpenChange={setOpen}
        title="구성원 내보내기"
        columns={[
          { id: "name", label: "이름" },
          { id: "team", label: "소속" },
          { id: "private", label: "비공개 정보", disabled: true },
        ]}
        scopes={[
          { value: "current", label: "현재 검색 결과" },
          { value: "selected", label: "선택한 1명" },
          { value: "all", label: "전체 구성원" },
        ]}
        formats={[{ value: "csv", label: "CSV" }]}
        onExport={async (options, { signal }) => {
          await request();
          if (signal.aborted) throw new DOMException("취소됨", "AbortError");
          const people =
            options.scope === "selected"
              ? staff.slice(0, 1)
              : options.scope === "current"
                ? staff.filter((person) => person.team === "플랫폼팀")
                : staff;
          downloadCsv(
            "cheese-members.csv",
            options.columns.map((column) =>
              column === "name" ? "이름" : "소속",
            ),
            people.map((person) =>
              options.columns.map((column) =>
                column === "name" ? person.name : person.team,
              ),
            ),
          );
          setExported(true);
        }}
      />
      <p className="foundation-note">
        현재 검색 결과는 플랫폼팀 2명, 선택 항목은 김민서 1명입니다. 실제 CSV
        파일이 다운로드됩니다.
      </p>
    </div>
  );
}

const documentation: Record<FoundationId, Documentation> = {
  "list-page": {
    component: "ListPage",
    demo: ListPageDemo,
    props: [
      "title",
      "headingLevel",
      "actions",
      "summary",
      "filters",
      "toolbar",
      "pagination",
      "children",
    ],
    usage:
      "상단 설명과 요약, 검색 조건, 목록, 페이지 이동 영역에 기존 컴포넌트를 전달합니다. 각 슬롯은 필요할 때만 사용합니다.",
    responsibility:
      "레이아웃은 영역의 배치와 반응형 간격만 담당합니다. 검색 요청, 정렬, 페이지 수 계산, 선택 상태는 사용하는 제품이 관리합니다.",
    code: '<ListPage title="구성원" filters={<FilterBar {...filters} />}\n  pagination={<Pagination {...pagination} />}>\n  <DataTable {...table} />\n</ListPage>',
  },
  "detail-page": {
    component: "DetailPage",
    demo: DetailPageDemo,
    props: ["title", "summary", "tabs", "aside", "footer", "children"],
    usage:
      "본문과 보조 패널을 분리하고 탭과 하단 안내를 필요에 따라 조합합니다. 좁은 화면에서는 보조 패널이 아래에 표시됩니다.",
    responsibility:
      "어떤 항목을 노출할지와 편집 권한은 서비스 정책입니다. 컴포넌트는 데이터를 조회하거나 사용자의 권한을 판단하지 않습니다.",
    code: "<DetailPage title={person.name} summary={<Badge>재직</Badge>}\n  aside={<ContactInformation />}>\n  <DescriptionList items={fields} />\n</DetailPage>",
  },
  "form-page": {
    component: "FormPage, FormActions",
    demo: FormPageDemo,
    props: ["title", "onSubmit", "pending", "disabled", "footer", "children"],
    usage:
      "실제 form 요소를 제공하며 제출 시 기본 브라우저 이동을 막습니다. pending을 전달하면 중복 제출과 입력을 방지합니다. footer에는 FormActions를 전달하세요.",
    responsibility:
      "유효성 검사 규칙, 서버 저장, 이탈 보호는 제품이 담당합니다. 예제는 가상 요청의 완료 상태만 표시합니다.",
    code: '<FormPage title="구성원 등록" onSubmit={save} pending={pending}\n  footer={<FormActions pending={pending} onCancel={cancel} />}>\n  <EmployeeFields />\n</FormPage>',
  },
  "master-detail-layout": {
    component: "MasterDetailLayout",
    demo: MasterDetailDemo,
    props: ["list", "detail", "listLabel", "detailLabel"],
    usage:
      "왼쪽에 탐색 목록, 오른쪽에 선택한 항목의 상세를 전달합니다. 좁은 화면에서는 두 영역을 세로로 배치합니다.",
    responsibility:
      "선택한 항목과 URL 동기화, 미저장 변경 보호, 원격 데이터 로딩은 제품에서 연결합니다. 이 컴포넌트는 선택 상태를 내장하지 않습니다.",
    code: '<MasterDetailLayout listLabel="직원 목록" detailLabel="직원 상세"\n  list={<EmployeeList onSelect={setSelected} />}\n  detail={<EmployeeDetail employee={selected} />} />',
  },
  "form-section": {
    component: "FormSection",
    demo: FormSectionDemo,
    props: ["title", "description", "disabled", "children"],
    usage:
      "연관된 필드들을 fieldset과 legend로 묶습니다. 섹션의 설명을 제공하고 disabled로 영역 전체의 입력을 잠글 수 있습니다.",
    responsibility:
      "업무 항목의 필수 여부나 표시 조건은 제품이 결정합니다. 단순 시각적 카드가 아니라 연관된 폼 필드에 사용하세요.",
    code: '<FormSection title="연락 정보" description="업무 연락처">\n  <Field label="이메일"><Input type="email" /></Field>\n</FormSection>',
  },
  "form-grid": {
    component: "FormGrid",
    demo: FormGridDemo,
    props: ["columns: 1 | 2 | 3", "children"],
    usage:
      "입력 필드나 ReadOnlyField를 반응형 그리드에 배치합니다. columns는 넓은 화면의 최대 열 수이며 모바일에서는 읽기 쉬운 한 열로 전환합니다.",
    responsibility:
      "라벨 연결과 오류 안내는 각 Field가 담당합니다. FormGrid는 필드 값을 변경하거나 유효성을 검사하지 않습니다.",
    code: '<FormGrid columns={2}>\n  <Field label="이름"><Input /></Field>\n  <Field label="부서"><Input /></Field>\n</FormGrid>',
  },
  "form-actions": {
    component: "FormActions",
    demo: FormActionsDemo,
    props: [
      "submitLabel",
      "cancelLabel",
      "onCancel",
      "pending",
      "submitDisabled",
      "status",
      "form",
      "children",
    ],
    usage:
      "제출과 취소, 저장 상태를 한 영역으로 묶습니다. form 안에 두거나 form 속성으로 제출 대상을 연결하세요. 취소 동작이 없으면 showCancel={false}로 감춥니다.",
    responsibility:
      "취소 시 이동할 화면이나 값 복원은 onCancel에서 처리합니다. 제출 중 pending을 유지하는 책임도 제품에 있습니다.",
    code: '<FormActions submitLabel="저장" pending={pending}\n  onCancel={reset} status={<SaveStatus status={state} />} />',
  },
  "read-only-field": {
    component: "ReadOnlyField",
    demo: ReadOnlyFieldDemo,
    props: ["label", "value", "emptyText"],
    usage:
      "수정 불가능한 값을 이름과 함께 표시합니다. 숫자 0과 false는 비어 있는 값으로 취급하지 않으며 Badge 등의 ReactNode도 전달할 수 있습니다.",
    responsibility:
      "개인정보 마스킹과 날짜·금액 형식은 서비스에서 적용합니다. 읽기 전용 표시 자체는 권한 통제가 아닙니다.",
    code: '<ReadOnlyField label="사번" value={person.employeeNumber} />\n<ReadOnlyField label="잔여 업무" value={0} />',
  },
  "organization-tree-select": {
    component: "OrganizationTreeSelect",
    demo: OrganizationDemo,
    props: ["label", "nodes", "value", "onValueChange", "multiple", "disabled"],
    usage:
      "대화상자에서 조직을 탐색하거나 검색해 선택합니다. 적용을 눌러야 값이 반영되며 취소하면 이전 선택을 유지합니다. 단일·다중 선택을 지원합니다.",
    responsibility:
      "선택은 명시한 조직 ID에만 적용됩니다. 하위 조직 자동 포함, 인사 원장 조회, 조직별 접근 권한 검사는 서비스가 결정합니다.",
    code: '<OrganizationTreeSelect label="담당 조직" nodes={organizations}\n  value={selected} onValueChange={setSelected} multiple />',
  },
  "permission-matrix": {
    component: "PermissionMatrix",
    demo: PermissionDemo,
    props: [
      "label",
      "resources",
      "actions",
      "value",
      "onValueChange",
      "readOnly",
    ],
    usage:
      "행은 대상, 열은 동작으로 정의합니다. 사용할 수 없는 동작은 unavailableActions로 표시하고 잠긴 대상은 disabled로 보호합니다.",
    responsibility:
      "권한을 편집하는 UI입니다. API와 데이터 접근을 실제로 허용하거나 거부하는 권한 검사는 반드시 서버에서 별도로 수행해야 합니다.",
    code: '<PermissionMatrix label="관리자 권한" resources={resources}\n  actions={actions} value={grants} onValueChange={setGrants} />',
  },
  "sortable-list": {
    component: "SortableList",
    demo: SortableDemo,
    props: ["label", "items", "onItemsChange", "disabled", "description"],
    usage:
      "항목별 이동 버튼과 Alt + 위·아래 방향키로 순서를 바꿉니다. 잠긴 항목은 이동할 수 없고 그 위치를 넘어서도 이동하지 않습니다. 드래그 앤 드롭은 제공하지 않습니다.",
    responsibility:
      "재정렬된 배열을 반환하며 서버 순서 저장이나 동시 수정 충돌은 제품이 처리합니다. 마우스 드래그 없이도 모든 동작을 실행할 수 있습니다.",
    code: '<SortableList label="메뉴 순서" items={items}\n  onItemsChange={setItems} />',
  },
  "notification-center": {
    component: "NotificationCenter",
    demo: NotificationDemo,
    props: [
      "items",
      "unreadCount",
      "onRead",
      "onReadAll",
      "onNavigate",
      "loading",
      "error",
      "onRetry",
    ],
    usage:
      "읽음 상태가 포함된 알림 목록을 전달합니다. 읽음 처리 콜백이 완료된 뒤 목록을 갱신하세요. 요청이 실패하면 알림 목록은 유지되고 다시 시도할 수 있습니다.",
    responsibility:
      "알림 구독, 발송, 서버 저장, 전체 미읽음 수 집계와 접근 권한은 제품이 담당합니다. Toast와 달리 사용자가 나중에 다시 볼 목록을 표현합니다.",
    code: "<NotificationCenter items={notifications}\n  onRead={markRead} onReadAll={markAllRead}\n  onNavigate={openNotificationTarget} />",
  },
  "comment-composer": {
    component: "CommentComposer",
    demo: ComposerDemo,
    props: [
      "label",
      "defaultValue",
      "maxLength",
      "onSubmit",
      "submitLabel",
      "disabled",
      "onCancel",
    ],
    usage:
      "일반 텍스트 의견을 작성합니다. 공백만 있는 내용과 글자 수 초과를 검사하고 제출 중 중복 요청을 막습니다. onSubmit이 실패하면 입력한 내용을 유지합니다.",
    responsibility:
      "작성자의 신원, 저장 API, 멘션, 첨부, 금칙어 정책은 포함하지 않습니다. HTML을 해석하지 않는 일반 텍스트 작성기입니다.",
    code: '<CommentComposer label="검토 의견" maxLength={1000}\n  onSubmit={async (body) => { await api.createComment(body); }} />',
  },
  "comment-thread": {
    component: "CommentThread",
    demo: CommentThreadDemo,
    props: [
      "items",
      "onEdit",
      "onDelete",
      "onReply",
      "loading",
      "error",
      "onRetry",
    ],
    usage:
      "작성자·시간·내용과 한 단계 답글을 표시합니다. 항목의 canEdit/canDelete/canReply와 해당 콜백을 함께 전달해야 동작을 표시합니다. 삭제에는 확인 절차가 있습니다.",
    responsibility:
      "작성·수정·삭제 권한은 서버에서도 반드시 검증해야 합니다. 답글은 한 단계만 지원하며, 실시간 동기화와 페이지 처리는 서비스가 담당합니다.",
    code: "<CommentThread items={comments}\n  onEdit={editComment} onDelete={deleteComment}\n  onReply={replyToComment} />",
  },
  "file-preview": {
    component: "FilePreview",
    demo: FilePreviewDemo,
    props: [
      "open",
      "item",
      "returnFocus",
      "onOpenChange",
      "onRetry",
      "onDownload",
    ],
    usage:
      "이미지, PDF, 비디오와 지원하지 않는 형식을 대화상자로 표시합니다. loading/error/expired 상태를 전달할 수 있습니다. 열기 버튼의 event.currentTarget 또는 ref.current를 returnFocus에 전달하면 Safari처럼 클릭 시 버튼에 포커스를 주지 않는 환경에서도 닫은 후 해당 버튼으로 포커스를 돌려줍니다.",
    responsibility:
      "파일 접근 권한과 URL 발급·만료·다운로드는 서비스가 담당합니다. PDF는 브라우저 렌더러를 이용하고 Office 변환은 제공하지 않습니다. URL 형식 검사는 파일의 안전성을 보증하지 않습니다.",
    code: "<FilePreview open={open} item={file} returnFocus={opener}\n  onOpenChange={setOpen} onRetry={refreshFileUrl}\n  onDownload={downloadFile} />",
  },
  "attachment-gallery": {
    component: "AttachmentGallery",
    demo: AttachmentGalleryDemo,
    props: [
      "label",
      "items",
      "previewId",
      "onPreviewChange",
      "onRetry",
      "onDownload",
      "emptyMessage",
    ],
    usage:
      "파일 이름과 유형을 목록으로 표현하고 선택한 파일을 공통 FilePreview로 엽니다. 업로드는 기존 FileUpload와 조합하세요.",
    responsibility:
      "첨부 목록 조회와 정렬, 접근 권한, 안전한 다운로드와 미리보기 URL 수명은 제품이 관리합니다. 첨부를 저장하는 별도 서버를 포함하지 않습니다.",
    code: '<AttachmentGallery label="제출 자료" items={files}\n  previewId={previewId} onPreviewChange={setPreviewId}\n  onDownload={downloadFile} />',
  },
  "access-denied": {
    component: "AccessDenied",
    demo: AccessDeniedDemo,
    props: ["title", "description", "actionLabel", "onAction", "actions"],
    usage:
      "접근 권한이 없을 때 이유와 다음 행동을 안내합니다. 실제로 수행할 수 있는 동작만 연결하고, 제한된 데이터 자체는 렌더링하지 마세요.",
    responsibility:
      "이 화면을 표시하는 것만으로 접근 제어가 이루어지지 않습니다. 서버 인가 실패를 판정하고 데이터를 차단하는 책임은 제품에 있습니다.",
    code: '<AccessDenied description="담당자만 확인할 수 있습니다."\n  actionLabel="접근 요청 안내" onAction={openAccessGuide} />',
  },
  "session-expired": {
    component: "SessionExpired",
    demo: SessionExpiredDemo,
    props: [
      "title",
      "description",
      "actionLabel",
      "onReauthenticate",
      "busy",
      "actions",
    ],
    usage:
      "인증 만료 안내와 재인증 경로를 제공합니다. busy로 진행 상태와 중복 실행 방지를 표현할 수 있습니다.",
    responsibility:
      "토큰 재발급이나 SSO를 직접 수행하지 않습니다. 재인증 이동, 로그인 완료 후 원래 위치 복귀, 안전한 초안 보관 정책은 서비스에서 연결합니다.",
    code: "<SessionExpired busy={signingIn}\n  onReauthenticate={redirectToIdentityProvider} />",
  },
  "page-error": {
    component: "PageError",
    demo: PageErrorDemo,
    props: ["title", "description", "retryLabel", "onRetry", "busy", "actions"],
    usage:
      "화면 단위의 로딩 실패와 재시도 방법을 표시합니다. 사용자가 이해할 수 있는 설명을 전달하고 재요청 중에는 busy를 유지합니다.",
    responsibility:
      "React 오류 경계를 대신하지 않습니다. 요청 취소, 오류 수집, 상태 복구와 실제 재시도는 제품이 수행하며 기술적인 내부 오류를 그대로 노출하지 마세요.",
    code: '<PageError description="목록을 불러오지 못했습니다."\n  busy={loading} onRetry={refetch} />',
  },
  "saved-views": {
    component: "SavedViews",
    demo: SavedViewsDemo,
    props: [
      "views",
      "value",
      "onSelect",
      "onSave",
      "onDelete",
      "disabled",
      "label",
    ],
    usage:
      "현재 검색 조건에 이름을 붙여 등록하고, 기존 보기를 선택하거나 삭제합니다. 저장·삭제 콜백은 Promise를 지원하며 실패 시 다시 시도할 수 있습니다.",
    responsibility:
      "컴포넌트는 ID와 이름만 관리합니다. 어떤 필터·정렬·열 구성을 저장할지와 개인/공유 범위, 서버 저장은 제품이 결정합니다. 예제의 보기들은 메모리에만 보관됩니다.",
    code: "<SavedViews views={views} value={activeView}\n  onSelect={applySnapshot} onSave={saveCurrentSnapshot}\n  onDelete={deleteSnapshot} />",
  },
  "import-wizard": {
    component: "ImportWizard",
    demo: ImportWizardDemo,
    props: [
      "fields",
      "parse",
      "validate",
      "importRows",
      "accept",
      "maxFileBytes",
      "maxRows",
    ],
    usage:
      "파일 선택 → 열 연결 → 검증 → 등록 결과 순서로 진행합니다. 필수 열과 빈 값을 기본 검사하며 validate에서 업무 규칙을 추가합니다. 일부 행만 실패했다면 해당 행만 재시도할 수 있습니다.",
    responsibility:
      "파일 파서, 서버 검증과 저장은 어댑터로 연결합니다. 기본적으로 XLSX를 해석하는 엔진은 내장하지 않습니다. 예제는 UTF-8 CSV만 지원합니다. 요청이 중간에 끊겼다면 멱등성 키나 서버 결과 조회로 중복 등록을 방지해야 합니다.",
    code: '<ImportWizard fields={fields} accept=".csv"\n  parse={parseCsvFile} validate={validateRows}\n  importRows={saveRowsWithIdempotencyKey} />',
  },
  "export-dialog": {
    component: "ExportDialog",
    demo: ExportDialogDemo,
    props: ["open", "onOpenChange", "columns", "scopes", "formats", "onExport"],
    usage:
      "내보낼 범위와 열, 형식을 선택한 뒤 비동기 작업을 실행합니다. 허용하지 않은 열과 범위는 disabled로 표시하며, 실패 시 선택 내용을 유지합니다.",
    responsibility:
      "파일 직렬화와 다운로드, 개인정보 마스킹, 내보내기 권한 검사는 서비스에서 수행합니다. 예제는 CSV 파일을 생성하며 수식으로 해석될 수 있는 값을 이스케이프합니다.",
    code: "<ExportDialog open={open} onOpenChange={setOpen}\n  columns={columns} scopes={scopes} formats={formats}\n  onExport={generateAndDownloadFile} />",
  },
};

export default function FoundationPatterns({ id }: { id: string }) {
  const [revision, setRevision] = useState(0);
  const pattern = foundationPatterns.find((item) => item.id === id);
  if (!pattern) return null;
  const catalogEntry = getCompositeEntry(pattern.id)!;
  const level = compositionLevel(catalogEntry);
  const detail = documentation[pattern.id];
  const Demo = detail.demo;
  return (
    <article className="foundation-patterns">
      <nav className="doc-crumb" aria-label="문서 위치">
        <a href="#/business-patterns">패턴과 템플릿</a>
        <ChevronRight aria-hidden="true" />
        <span>{pattern.title}</span>
      </nav>
      <header className="page-heading">
        <span className="eyebrow">
          {level === "template" ? "TEMPLATE" : "PATTERN"}
        </span>
        <h1>{pattern.title}</h1>
        <p>{pattern.description}</p>
      </header>
      <div className="component-meta">
        <Badge tone="brand">
          {level === "template" ? "템플릿" : "패턴"} · {pattern.group}
        </Badge>
        <span>@cheese/react · @cheese/vue</span>
        <a
          className="text-link"
          href={`./vue.html?demo=foundation#foundation-${pattern.id}`}
        >
          Vue 실행 예제 <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
      <CompositionAnatomy id={pattern.id} />
      <section
        className="foundation-doc-section"
        aria-labelledby="foundation-demo-title"
      >
        <div className="doc-section-heading">
          <h2 id="foundation-demo-title">미리보기</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRevision((value) => value + 1)}
          >
            초기화
          </Button>
        </div>
        <div className="foundation-demo-stage">
          <Demo key={`${id}-${revision}`} />
        </div>
        <p className="cheese-help foundation-disclaimer">
          가상 데이터로 동작합니다. 예제의 상태는 새로고침하면 초기화되며, 실제
          업무 서버에 전송하지 않습니다.
        </p>
      </section>
      {detail && (
        <>
          <section
            className="foundation-doc-section"
            aria-labelledby="foundation-usage-title"
          >
            <h2 id="foundation-usage-title">사용하기</h2>
            <p className="foundation-prose">{detail.usage}</p>
            <div className="foundation-props" aria-label="주요 속성">
              {detail.props.map((prop) => (
                <Badge key={prop}>{prop}</Badge>
              ))}
            </div>
            <div className="code-block">
              <pre tabIndex={0}>
                <code>{compositionImport(detail.component, detail.code)}</code>
              </pre>
            </div>
            <p className="foundation-prose">
              위 코드는 React 사용 예제입니다. Vue에서도 같은 구성요소를
              제공하며, 화면 영역은 이름 있는 슬롯으로, 상태 변경은 Vue 이벤트로
              연결합니다. 댓글 저장·가져오기·내보내기처럼 성공과 실패를 기다리는
              작업은 Promise를 반환하는 함수 prop으로 연결합니다. 같은
              구성요소의 동작은 상단의 Vue 실행 예제에서 확인할 수 있습니다.
            </p>
          </section>
          <section
            className="foundation-doc-section"
            aria-labelledby="foundation-boundary-title"
          >
            <h2 id="foundation-boundary-title">컴포넌트와 서비스의 책임</h2>
            <p className="foundation-prose">{detail.responsibility}</p>
          </section>
        </>
      )}
      <section
        className="foundation-doc-section"
        aria-labelledby="foundation-products-title"
      >
        <h2 id="foundation-products-title">조합된 제품 화면 살펴보기</h2>
        <p className="foundation-prose">
          개별 기능의 정답을 정하지 않고, 같은 구성요소를 서로 다른 업무에
          조합합니다. 실제 데이터와 정책은 제품에서 연결하세요.
        </p>
        <div className="foundation-product-links">
          {[
            { id: "evaluation", label: "인사평가" },
            { id: "employees", label: "직원 관리" },
            { id: "auditions", label: "오디션 지원자 관리" },
          ].map((product) => (
            <a key={product.id} href={`#/examples/${product.id}`}>
              <Card>
                <span>{product.label}</span>
                <ArrowUpRight aria-hidden="true" />
              </Card>
            </a>
          ))}
        </div>
      </section>
    </article>
  );
}
