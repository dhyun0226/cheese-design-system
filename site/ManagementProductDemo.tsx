import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import {
  Alert,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogRoot,
  AlertDialogTitle,
  AttachmentGallery,
  Badge,
  Button,
  Checkbox,
  DialogContent,
  DialogDescription,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  Field,
  FormActions,
  FormGrid,
  FormPage,
  FormSection,
  Input,
  ListPage,
  PeoplePicker,
  ReadOnlyField,
  RecordCollection,
  SectionHeader,
  StatCard,
  StatGroup,
  UserIdentity,
  SaveStatus,
  Select,
  Textarea,
  queryRows,
  type TableColumn,
  type TableQuery,
} from "@cheese/react";
import {
  auditionCategoryOptions,
  auditionStageOptions,
  createApplicants,
  createEmployees,
  employeeStatusOptions,
  organizations,
  type Applicant,
  type AuditionStage,
  type Employee,
  type EmployeeStatus,
} from "./management-demo-data";
import "./management-product-demo.css";
import { registerWorkflowRouteBlocker } from "./workflow-navigation";
import GroupwareShell from "./GroupwareShell";

type DemoKind = "employees" | "auditions";
type SaveState = "idle" | "dirty" | "saved" | "error";
type BulkResult = { succeeded: number; failed: number };
type Failure = { id: string; message: string };
const employeeColumns: TableColumn[] = [
  { key: "name", label: "이름", width: 120 },
  { key: "id", label: "사번", width: 115 },
  { key: "team", label: "소속 팀", width: 135 },
  { key: "job", label: "직무", width: 145 },
  { key: "status", label: "상태", width: 105 },
  { key: "details", label: "직원 정보", sortable: false, width: 100 },
];

const applicantColumns: TableColumn[] = [
  { key: "name", label: "지원자", width: 120 },
  { key: "id", label: "지원 번호", width: 115 },
  { key: "category", label: "지원 분야", width: 115 },
  { key: "stage", label: "진행 단계", width: 110 },
  { key: "materials", label: "제출 자료", width: 115 },
  { key: "appliedDate", label: "접수일", width: 125 },
  { key: "details", label: "지원 정보", sortable: false, width: 100 },
];

function initialQuery(): TableQuery {
  return { page: 1, pageSize: 10, search: "", sort: null };
}

function employeePeople(employees: Employee[]) {
  return employees.map((employee) => ({
    id: employee.id,
    name: employee.name,
    organizationId: employee.organizationId,
    description: `${employee.team} · ${employee.job}${employee.status === "휴직" ? " · 휴직" : ""}`,
    disabled: employee.status === "휴직",
  }));
}

function useDraftExitGuard(dirty: boolean, close: () => void) {
  const [pending, setPending] = useState<{ destination?: string } | null>(null);
  const allowLeave = useRef(false);
  const leaveTrigger = useRef<HTMLElement | null>(null);
  const rememberFocus = () => {
    leaveTrigger.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
  };

  useEffect(() => {
    if (!dirty) return;
    allowLeave.current = false;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (allowLeave.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const unregister = registerWorkflowRouteBlocker((destination) => {
      if (allowLeave.current) return true;
      rememberFocus();
      setPending({ destination });
      return false;
    });
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      unregister();
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [dirty]);

  return {
    requestClose: () => {
      if (!dirty) {
        close();
        return;
      }
      rememberFocus();
      setPending({});
    },
    confirmation: (
      <AlertDialogRoot
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
      >
        <AlertDialogContent
          onCloseAutoFocus={(event) => {
            if (!allowLeave.current && leaveTrigger.current?.isConnected) {
              event.preventDefault();
              leaveTrigger.current.focus();
            }
          }}
        >
          <AlertDialogTitle>변경 내용을 버릴까요?</AlertDialogTitle>
          <AlertDialogDescription>
            저장하지 않은 수정 내용이 있습니다. 계속 수정하거나 변경 내용을
            버리고 닫을 수 있습니다.
          </AlertDialogDescription>
          <div className="cheese-dialog-actions">
            <AlertDialogCancel asChild>
              <Button variant="weak">계속 수정</Button>
            </AlertDialogCancel>
            <Button
              variant="critical"
              onClick={() => {
                const destination = pending?.destination;
                allowLeave.current = true;
                setPending(null);
                if (destination) window.location.assign(destination);
                else close();
              }}
            >
              변경 내용 버리기
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialogRoot>
    ),
  };
}

export default function ManagementProductDemo({ kind }: { kind: DemoKind }) {
  return (
    <div className="management-demo cheese-root">
      <GroupwareShell activeId={kind}>
        <main className="management-main" tabIndex={-1} autoFocus>
          {kind === "employees" ? <EmployeeWorkspace /> : <AuditionWorkspace />}
        </main>
      </GroupwareShell>
    </div>
  );
}

function EmployeeWorkspace() {
  const [employees, setEmployees] = useState(createEmployees);
  const [query, setQuery] = useState(initialQuery);
  const [organization, setOrganization] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkResult, setBulkResult] = useState<BulkResult>();
  const [projectMembers, setProjectMembers] = useState([
    "EMP-001",
    "EMP-003",
    "EMP-006",
  ]);
  const [assignmentSaved, setAssignmentSaved] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Employee | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [fieldErrors, setFieldErrors] = useState<{
    team?: string;
    job?: string;
  }>({});
  const teamInputRef = useRef<HTMLInputElement | null>(null);
  const jobInputRef = useRef<HTMLInputElement | null>(null);
  const detailTrigger = useRef<HTMLButtonElement | null>(null);
  const directoryHeading = useRef<HTMLElement | null>(null);

  const filtered = employees.filter(
    (employee) =>
      (!organization || employee.organizationId === organization) &&
      (!status || employee.status === status),
  );
  const resultCount = queryRows(filtered, employeeColumns, query).total;
  const employee = employees.find((item) => item.id === detailId);
  const dirty =
    !!employee && !!draft && JSON.stringify(employee) !== JSON.stringify(draft);
  const exitGuard = useDraftExitGuard(dirty, () => setDetailId(null));

  function clearSelection() {
    setSelected([]);
    setBulkResult(undefined);
  }

  function changeQuery(next: TableQuery) {
    if (next.search !== query.search) clearSelection();
    setQuery(next);
  }

  function resetFilters() {
    setOrganization("");
    setStatus("");
    setQuery(initialQuery());
    clearSelection();
  }

  function openEmployee(item: Employee, event: MouseEvent<HTMLButtonElement>) {
    detailTrigger.current = event.currentTarget;
    setDetailId(item.id);
    setDraft({ ...item });
    setSaveState("idle");
    setFieldErrors({});
  }

  function updateDraft(
    patch: Partial<
      Pick<Employee, "organizationId" | "team" | "job" | "status">
    >,
  ) {
    setDraft((current) => (current ? { ...current, ...patch } : current));
    setSaveState("dirty");
    setFieldErrors({});
  }

  function saveEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    if (!draft.job.trim() || !draft.team.trim()) {
      setFieldErrors({
        team: draft.team.trim() ? undefined : "소속 팀을 입력해 주세요.",
        job: draft.job.trim() ? undefined : "직무를 입력해 주세요.",
      });
      setSaveState("error");
      (draft.team.trim() ? jobInputRef : teamInputRef).current?.focus();
      return;
    }
    const next = { ...draft, team: draft.team.trim(), job: draft.job.trim() };
    setEmployees((current) =>
      current.map((item) => (item.id === next.id ? next : item)),
    );
    setDraft(next);
    setSelected((current) => current.filter((id) => id !== next.id));
    setFieldErrors({});
    setSaveState("saved");
  }

  function completeOnboarding() {
    const ids = new Set(selected);
    setEmployees((current) =>
      current.map((item) =>
        ids.has(item.id) ? { ...item, status: "재직" } : item,
      ),
    );
    setBulkResult({ succeeded: selected.length, failed: 0 });
    setSelected([]);
  }

  return (
    <>
      <ListPage
        eyebrow="People"
        title="조직·구성원"
        description="조직별 구성원과 입사 상태를 확인하고 소속·직무 정보를 관리하세요."
        summary={
          <StatGroup>
            <StatCard label="전체 구성원" value={employees.length + "명"} />
            <StatCard
              label="재직"
              value={
                employees.filter((item) => item.status === "재직").length + "명"
              }
            />
            <StatCard
              label="온보딩 진행 중"
              value={
                employees.filter((item) => item.status === "온보딩").length +
                "명"
              }
            />
          </StatGroup>
        }
      >
        <section
          className="management-section"
          ref={directoryHeading}
          tabIndex={-1}
          aria-label="구성원 디렉터리"
        >
          <SectionHeader title="구성원 디렉터리" />
          <RecordCollection
            label="직원 목록"
            columns={employeeColumns}
            rows={filtered}
            query={query}
            onQueryChange={changeQuery}
            searchLabel="직원 이름·사번·직무 검색"
            filters={[
              {
                id: "organization",
                label: "조직",
                value: organization,
                options: [
                  { value: "", label: "전체 조직" },
                  ...organizations.map((item) => ({
                    value: item.id,
                    label: item.label,
                  })),
                ],
              },
              {
                id: "status",
                label: "상태",
                value: status,
                options: [
                  { value: "", label: "전체 상태" },
                  ...employeeStatusOptions,
                ],
              },
            ]}
            onFilterChange={(id, value) => {
              if (id === "organization") setOrganization(value);
              if (id === "status") {
                setStatus(value);
              }
              setQuery({ ...query, page: 1 });
              clearSelection();
            }}
            onResetFilters={resetFilters}
            resultCount={resultCount}
            getRowId={(item) => item.id}
            rowLabel={(item) => item.name + " " + item.id}
            selected={selected}
            onSelectedChange={(ids) => {
              setSelected(ids);
              setBulkResult(undefined);
            }}
            onClearSelection={clearSelection}
            bulkActions={
              <Button
                variant="weak"
                disabled={!selected.length}
                onClick={completeOnboarding}
              >
                재직으로 변경
              </Button>
            }
            bulkResult={bulkResult}
            renderCell={(item, column) => {
              if (column.key === "status")
                return (
                  <Badge tone={item.status === "온보딩" ? "brand" : "neutral"}>
                    {item.status}
                  </Badge>
                );
              if (column.key === "details")
                return (
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`${item.name} 직원 상세 보기`}
                    onClick={(event) => openEmployee(item, event)}
                  >
                    상세 보기
                  </Button>
                );
              return String(item[column.key] ?? "—");
            }}
          />
        </section>
        <section className="management-section">
          <SectionHeader
            title="신규 입사자 온보딩"
            description="입사 안내와 계정·권한 확인을 함께 진행할 담당자를 지정하세요."
          />
          <PeoplePicker
            label="온보딩 담당자"
            people={employeePeople(employees)}
            organizations={organizations}
            value={projectMembers}
            onValueChange={(ids) => {
              setProjectMembers(ids);
              setAssignmentSaved(true);
            }}
          />
          <SaveStatus
            status={assignmentSaved ? "saved" : "idle"}
            label={
              assignmentSaved
                ? "온보딩 담당자가 지정되었습니다."
                : projectMembers.length + "명이 담당하고 있습니다."
            }
          />
        </section>
      </ListPage>
      <DialogRoot
        open={detailId !== null}
        onOpenChange={(open) => {
          if (!open) exitGuard.requestClose();
        }}
      >
        <DialogContent
          placement="right"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            (detailTrigger.current?.isConnected
              ? detailTrigger.current
              : directoryHeading.current
            )?.focus();
          }}
        >
          {employee && draft && (
            <>
              <DialogTitle>{employee.name} 직원 정보</DialogTitle>
              <DialogDescription>
                소속 조직, 직무와 재직 상태를 관리합니다.
              </DialogDescription>
              <FormPage
                title="직원 정보 수정"
                headingLevel={3}
                noValidate
                onSubmit={saveEmployee}
                footer={
                  <FormActions
                    cancelLabel="닫기"
                    submitLabel="변경 저장"
                    submitDisabled={
                      saveState === "idle" || saveState === "saved"
                    }
                    onCancel={exitGuard.requestClose}
                    status={
                      <SaveStatus
                        status={saveState}
                        label={
                          saveState === "saved"
                            ? "변경 내용이 이 화면에 저장되었습니다."
                            : undefined
                        }
                      />
                    }
                  />
                }
              >
                <FormSection title="기본 정보">
                  <FormGrid>
                    <ReadOnlyField label="사번" value={employee.id} />
                    <ReadOnlyField label="입사일" value={employee.joinedDate} />
                    <ReadOnlyField
                      label="현재 상태"
                      value={<Badge>{employee.status}</Badge>}
                    />
                  </FormGrid>
                </FormSection>
                <FormSection title="소속 및 직무">
                  <FormGrid columns={1}>
                    <Select
                      label="소속 조직"
                      value={draft.organizationId}
                      options={organizations.map((item) => ({
                        value: item.id,
                        label: item.label,
                      }))}
                      onValueChange={(value) =>
                        updateDraft({ organizationId: value })
                      }
                    />
                    <Field label="소속 팀" required error={fieldErrors.team}>
                      <Input
                        ref={teamInputRef}
                        value={draft.team}
                        maxLength={40}
                        onChange={(event) =>
                          updateDraft({ team: event.target.value })
                        }
                      />
                    </Field>
                    <Field
                      label="직무"
                      required
                      error={fieldErrors.job}
                      description="담당 업무를 40자 이내로 작성하세요."
                    >
                      <Input
                        ref={jobInputRef}
                        value={draft.job}
                        maxLength={40}
                        onChange={(event) =>
                          updateDraft({ job: event.target.value })
                        }
                      />
                    </Field>
                    <Select
                      label="재직 상태"
                      value={draft.status}
                      options={employeeStatusOptions}
                      onValueChange={(value) =>
                        updateDraft({ status: value as EmployeeStatus })
                      }
                    />
                  </FormGrid>
                </FormSection>
              </FormPage>
            </>
          )}
          {exitGuard.confirmation}
        </DialogContent>
      </DialogRoot>
    </>
  );
}

function AuditionWorkspace() {
  const [applicants, setApplicants] = useState(createApplicants);
  const [reviewers] = useState(createEmployees);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("");
  const [stage, setStage] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkResult, setBulkResult] = useState<BulkResult>();
  const [failures, setFailures] = useState<Failure[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Applicant | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState("");
  const stageSelectRef = useRef<HTMLButtonElement | null>(null);
  const detailTrigger = useRef<HTMLButtonElement | null>(null);
  const directoryHeading = useRef<HTMLElement | null>(null);
  const rows = applicants
    .filter(
      (item) =>
        (!category || item.category === category) &&
        (!stage || item.stage === stage),
    )
    .map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      stage: item.stage,
      materials: item.materialsComplete ? "제출 완료" : "자료 미비",
      appliedDate: item.appliedDate,
    }));
  const resultCount = queryRows(rows, applicantColumns, query).total;
  const applicant = applicants.find((item) => item.id === detailId);
  const dirty =
    !!applicant &&
    !!draft &&
    JSON.stringify(applicant) !== JSON.stringify(draft);
  const exitGuard = useDraftExitGuard(dirty, closeApplicant);

  function clearSelection() {
    setSelected([]);
    setBulkResult(undefined);
    setFailures([]);
  }

  function changeQuery(next: TableQuery) {
    if (next.search !== query.search) clearSelection();
    setQuery(next);
  }

  function resetFilters() {
    setCategory("");
    setStage("");
    setQuery(initialQuery());
    clearSelection();
  }

  function openApplicant(id: string, event: MouseEvent<HTMLButtonElement>) {
    const item = applicants.find((entry) => entry.id === id);
    if (!item) return;
    detailTrigger.current = event.currentTarget;
    setDetailId(item.id);
    setPreviewId(null);
    setDraft({ ...item, reviewerIds: [...item.reviewerIds] });
    setSaveState("idle");
    setError("");
  }

  function closeApplicant() {
    setDetailId(null);
    setPreviewId(null);
  }

  function updateDraft(patch: Partial<Applicant>) {
    setDraft((current) => (current ? { ...current, ...patch } : current));
    setSaveState("dirty");
    setError("");
  }

  function saveApplicant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft || !applicant) return;
    if (
      !draft.materialsComplete &&
      (draft.stage === "검토 중" || draft.stage === "인터뷰")
    ) {
      setError("검토를 진행하려면 먼저 제출 자료를 확인해 주세요.");
      setSaveState("error");
      stageSelectRef.current?.focus();
      return;
    }
    const next = {
      ...draft,
      stage: applicant.stage === "마감" ? ("마감" as const) : draft.stage,
      note: draft.note.trim(),
    };
    setApplicants((current) =>
      current.map((item) => (item.id === next.id ? next : item)),
    );
    setDraft(next);
    setError("");
    setSaveState("saved");
  }

  function startReview(ids: string[]) {
    const nextFailures: Failure[] = [];
    const successful = new Set<string>();
    for (const id of ids) {
      const item = applicants.find((entry) => entry.id === id);
      if (!item) continue;
      if (item.stage === "마감")
        nextFailures.push({ id, message: "이미 마감된 지원서입니다." });
      else if (item.stage === "인터뷰")
        nextFailures.push({
          id,
          message:
            "인터뷰 단계의 지원서입니다. 상세 정보에서 진행 단계를 관리하세요.",
        });
      else if (!item.materialsComplete)
        nextFailures.push({
          id,
          message:
            "제출 자료가 미비합니다. 상세 정보에서 자료 확인 후 다시 시도하세요.",
        });
      else successful.add(id);
    }
    setApplicants((current) =>
      current.map((item) =>
        successful.has(item.id) ? { ...item, stage: "검토 중" } : item,
      ),
    );
    setSelected(nextFailures.map((item) => item.id));
    setFailures(nextFailures);
    setBulkResult({ succeeded: successful.size, failed: nextFailures.length });
  }

  return (
    <>
      <ListPage
        eyebrow="오디션 운영"
        title="지원서 검토"
        description="신규 지원서의 제출 자료를 확인하고 심사 담당자와 진행 단계를 관리하세요."
        summary={
          <StatGroup>
            <StatCard label="전체 지원서" value={applicants.length + "건"} />
            <StatCard
              label="검토 중"
              value={
                applicants.filter((item) => item.stage === "검토 중").length +
                "건"
              }
            />
            <StatCard
              label="자료 확인 필요"
              value={
                applicants.filter(
                  (item) => !item.materialsComplete && item.stage !== "마감",
                ).length + "건"
              }
            />
          </StatGroup>
        }
      >
        <section
          className="management-section"
          ref={directoryHeading}
          tabIndex={-1}
          aria-label="지원서 목록"
        >
          <SectionHeader title="지원서 목록" />
          {failures.length > 0 && (
            <Alert>
              <div className="cheese-stack">
                <strong>처리하지 못한 지원서를 확인해 주세요.</strong>
                <ul className="management-failures">
                  {failures.map((failure) => (
                    <li key={failure.id}>
                      <div className="cheese-stack">
                        <span>
                          {
                            applicants.find((item) => item.id === failure.id)
                              ?.name
                          }{" "}
                          · {failure.id}
                        </span>
                        <p className="cheese-help">{failure.message}</p>
                        <Button
                          size="sm"
                          variant="weak"
                          aria-label={`${failure.id} 실패 사유 확인 및 수정`}
                          onClick={(event) => openApplicant(failure.id, event)}
                        >
                          확인 및 수정
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Alert>
          )}
          <RecordCollection
            label="오디션 지원자 목록"
            columns={applicantColumns}
            rows={rows}
            searchLabel="지원자 이름·지원 번호 검색"
            filters={[
              {
                id: "category",
                label: "지원 분야",
                value: category,
                options: [
                  { value: "", label: "전체 분야" },
                  ...auditionCategoryOptions,
                ],
              },
              {
                id: "stage",
                label: "진행 단계",
                value: stage,
                options: [
                  { value: "", label: "전체 단계" },
                  ...auditionStageOptions,
                ],
              },
            ]}
            onFilterChange={(id, value) => {
              if (id === "category") setCategory(value);
              if (id === "stage") {
                setStage(value);
              }
              setQuery({ ...query, page: 1 });
              clearSelection();
            }}
            onResetFilters={resetFilters}
            resultCount={resultCount}
            onClearSelection={clearSelection}
            bulkActions={
              <Button
                variant="weak"
                disabled={!selected.length}
                onClick={() => startReview(selected)}
              >
                검토 시작
              </Button>
            }
            bulkResult={bulkResult}
            onRetryBulkActions={
              failures.length
                ? () => startReview(failures.map((item) => item.id))
                : undefined
            }
            query={query}
            onQueryChange={changeQuery}
            getRowId={(item) => item.id}
            rowLabel={(item) => `${item.name} ${item.id}`}
            selected={selected}
            onSelectedChange={(ids) => {
              setSelected(ids);
              setBulkResult(undefined);
              setFailures([]);
            }}
            renderCell={(item, column) => {
              if (column.key === "stage")
                return (
                  <Badge tone={item.stage === "검토 중" ? "brand" : "neutral"}>
                    {item.stage}
                  </Badge>
                );
              if (column.key === "materials")
                return (
                  <Badge
                    tone={
                      item.materials === "자료 미비" ? "critical" : "neutral"
                    }
                  >
                    {item.materials}
                  </Badge>
                );
              if (column.key === "details")
                return (
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`${item.name} 지원서 상세 보기`}
                    onClick={(event) => openApplicant(item.id, event)}
                  >
                    상세 보기
                  </Button>
                );
              return String(item[column.key as keyof typeof item] ?? "—");
            }}
          />
          <p className="cheese-help">
            자료가 확인된 접수·검토 중 지원서를 일괄 처리합니다. 자료
            미비·인터뷰·마감 항목은 실패 사유를 표시합니다.
          </p>
        </section>
      </ListPage>
      <DialogRoot
        open={detailId !== null}
        onOpenChange={(open) => {
          if (!open) exitGuard.requestClose();
        }}
      >
        <DialogContent
          placement="right"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            (detailTrigger.current?.isConnected
              ? detailTrigger.current
              : directoryHeading.current
            )?.focus();
          }}
        >
          {applicant && draft && (
            <>
              <DialogTitle>{applicant.name} 지원서</DialogTitle>
              <DialogDescription>
                제출 자료를 확인하고, 담당자와 검토 내용을 관리합니다.
              </DialogDescription>
              <FormPage
                title="지원서 검토"
                headingLevel={3}
                noValidate
                onSubmit={saveApplicant}
                footer={
                  <FormActions
                    cancelLabel="닫기"
                    submitLabel="검토 내용 저장"
                    submitDisabled={
                      saveState === "idle" || saveState === "saved"
                    }
                    onCancel={exitGuard.requestClose}
                    status={
                      <SaveStatus
                        status={saveState}
                        label={
                          saveState === "saved"
                            ? "검토 내용이 이 화면에 저장되었습니다."
                            : undefined
                        }
                      />
                    }
                  />
                }
              >
                <FormSection title="접수 정보">
                  <FormGrid>
                    <ReadOnlyField label="지원 번호" value={applicant.id} />
                    <ReadOnlyField
                      label="지원 분야"
                      value={applicant.category}
                    />
                    <ReadOnlyField
                      label="접수일"
                      value={applicant.appliedDate}
                    />
                    <ReadOnlyField label="지원 자격" value="성인 지원자" />
                  </FormGrid>
                </FormSection>
                <FormSection
                  title="제출 자료"
                  description="지원자가 제출한 영상과 서류의 확인 상태를 관리합니다."
                >
                  <AttachmentGallery
                    label="제출 자료"
                    items={[
                      {
                        id: `${applicant.id}-sample`,
                        name: `${applicant.category}_지원영상.mp4`,
                        kind: "unsupported",
                        description:
                          "보안 정책에 따라 전용 뷰어에서 확인합니다.",
                        downloadable: false,
                      },
                    ]}
                    previewId={previewId}
                    onPreviewChange={setPreviewId}
                  />
                  <Checkbox
                    label="제출 자료 확인 완료"
                    checked={draft.materialsComplete}
                    onCheckedChange={(checked) =>
                      updateDraft({ materialsComplete: checked === true })
                    }
                  />
                  <p className="cheese-help">
                    영상 재생 상태와 지원서의 필수 항목을 확인한 후 완료로
                    표시하세요.
                  </p>
                </FormSection>
                <FormSection title="검토 내용">
                  <FormGrid columns={1}>
                    <Select
                      ref={stageSelectRef}
                      label="진행 단계"
                      value={draft.stage}
                      options={auditionStageOptions}
                      disabled={applicant.stage === "마감"}
                      description={
                        applicant.stage === "마감"
                          ? "마감된 지원서는 다시 검토할 수 없습니다."
                          : undefined
                      }
                      error={error}
                      onValueChange={(value) =>
                        updateDraft({ stage: value as AuditionStage })
                      }
                    />
                    <PeoplePicker
                      label="검토 담당자"
                      people={employeePeople(reviewers)}
                      organizations={organizations}
                      value={draft.reviewerIds}
                      onValueChange={(ids) => updateDraft({ reviewerIds: ids })}
                    />
                    <Field
                      label="검토 메모"
                      description="검토에 필요한 내용을 500자 이내로 남기세요."
                    >
                      <Textarea
                        value={draft.note}
                        maxLength={500}
                        rows={4}
                        onChange={(event) =>
                          updateDraft({ note: event.target.value })
                        }
                      />
                    </Field>
                  </FormGrid>
                </FormSection>
              </FormPage>
            </>
          )}
          {exitGuard.confirmation}
        </DialogContent>
      </DialogRoot>
    </>
  );
}
