import "@cheese/css";
import { createRef } from "react";
import { createRoot } from "react-dom/client";
import {
  Button,
  Field,
  Input,
  SearchInput,
  ErrorSummary,
  AttachmentList,
  DatePicker,
  DateField,
  TimeField,
  NumberField,
  ScrollArea,
  Pagination,
  Tree,
  Calendar,
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
  AsyncCombobox,
  MultiSelect,
  DataTable,
  FileUpload,
  createXHRUpload,
  createOptionsLoader,
  AppShell,
  NavigationList,
  UserIdentity,
  SectionHeader,
  StatCard,
  StatGroup,
  RecordCollection,
  PageHeader,
  PeoplePicker,
  FilterBar,
  BulkActionBar,
  DescriptionList,
  ActivityTimeline,
  SaveStatus,
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
  type SavedView,
  type ImportField,
  type ImportParsedData,
  type ImportResult,
  type ExportColumn,
  type ExportScope,
  type ExportFormat,
  type NotificationItem,
  type CommentItem,
  type PreviewFile,
  type OrganizationNode,
  type PermissionGrant,
  type SortableListItem,
  type AppShellItem,
  type NavigationItem,
  type RecordCollectionProps,
  type PatternFilter,
  type BulkAction,
  type PeoplePickerPerson,
  type PeoplePickerOrganization,
  type ActivityTimelineItem,
  type SaveStatusProps,
  type TableQuery,
} from "@cheese/react";
import { tokens } from "@cheese/tokens";

const input = createRef<HTMLInputElement>();
const picker = createRef<HTMLButtonElement>();
const date = createRef<HTMLInputElement>();
const time = createRef<HTMLInputElement>();
const number = createRef<HTMLInputElement>();
const scroll = createRef<HTMLDivElement>();
const viewport = createRef<HTMLDivElement>();
const search = createRef<HTMLInputElement>();
const summary = createRef<HTMLDivElement>();
const tableQuery: TableQuery = {
  page: 1,
  pageSize: 5,
  search: "직원",
  sort: { key: "name", direction: "asc" },
};
const navigation: AppShellItem[] = [{ id: "people", label: "구성원" }];
const workspaceNavigation: NavigationItem[] = [
  { id: "records", label: "Records", group: "Workspace", href: "#records" },
  { id: "archive", label: "Archive", group: "Workspace", disabled: true },
];
type ConsumerRecord = { id: string; name: string; reviewerId: number };
const recordCollection: RecordCollectionProps<ConsumerRecord> = {
  label: "Consumer records",
  columns: [{ key: "name", label: "Name" }],
  rows: [{ id: "record", name: "Consumer record", reviewerId: 42 }],
  getRowId: (row) => row.id,
  rowLabel: (row) => `${row.name} reviewer ${row.reviewerId.toFixed(0)}`,
  isRowSelectable: (row) => row.reviewerId > 0,
  query: { page: 1, pageSize: 5, search: "", sort: null },
  onQueryChange: (query) => query.search.trim(),
  selected: ["record"],
  onSelectedChange: (ids) => ids.map((id) => id.trim()),
  renderCell: (row) => <span>{row.reviewerId.toFixed(0)}</span>,
  onClearSelection: () => undefined,
};
const organizations: PeoplePickerOrganization[] = [
  {
    id: "company",
    label: "회사",
    children: [{ id: "people", label: "피플팀" }],
  },
];
const people: PeoplePickerPerson[] = [
  {
    id: "member",
    name: "가상 직원",
    organizationId: "people",
    disabled: false,
  },
];
const filters: PatternFilter[] = [
  {
    id: "organization",
    label: "소속",
    value: "",
    options: [
      { value: "", label: "전체 조직" },
      { value: "people", label: "피플팀" },
    ],
  },
];
const bulkActions: BulkAction[] = [
  { id: "review", label: "검토 시작", onAction: () => undefined },
];
const activities: ActivityTimelineItem[] = [
  {
    id: "review",
    title: "구성원 검토",
    actor: "운영자",
    time: "2026-09-29",
    status: "current",
  },
];
const saveStatus: SaveStatusProps = {
  status: "error",
  onRetry: () => undefined,
};
const organizationNodes: OrganizationNode[] = organizations;
const permissionGrants: PermissionGrant[] = [
  { resourceId: "people", actionId: "read" },
];
const reviewOrder: (SortableListItem & { required: boolean })[] = [
  { id: "profile", label: "프로필 확인", required: true },
  { id: "review", label: "담당자 검토", required: false },
];
const notifications: NotificationItem[] = [
  { id: "review", title: "검토 요청", time: "방금 전", read: false },
];
const comments: CommentItem[] = [
  {
    id: "comment",
    author: "가상 직원",
    body: "검토 부탁드립니다.",
    time: "방금 전",
    canEdit: true,
    canDelete: true,
    canReply: true,
  },
];
const previewFiles: PreviewFile[] = [
  {
    id: "guide",
    name: "검토 안내.txt",
    kind: "unsupported",
    downloadable: false,
  },
];
const savedViews: SavedView[] = [{ id: "all", label: "전체 구성원" }];
const importFields: ImportField[] = [
  { id: "name", label: "이름", required: true },
];
const exportColumns: ExportColumn[] = [{ id: "name", label: "이름" }];
const exportScopes: ExportScope[] = [{ value: "current", label: "현재 보기" }];
const exportFormats: ExportFormat[] = [{ value: "csv", label: "CSV" }];
createRoot(document.getElementById("root")!).render(
  <main className="cheese-root" style={{ color: tokens.color.spaceBlack }}>
    <AppShell
      brand="CHEESE PEOPLE"
      variant="application"
      items={navigation}
      activeId="people"
      onNavigate={(id, event) => {
        if (id === "people") event.preventDefault();
      }}
      user={<UserIdentity name="운영자" description="피플팀" size="sm" />}
      sidebarUser={<UserIdentity name="Reviewer" fallback="R" />}
      headerActions={<Button>Workspace settings</Button>}
      footer="소비자 패키지 검증"
    >
      <PageHeader
        title="업무 패턴"
        description="공개 패키지의 구성원 업무"
        actions={<Button>새 업무</Button>}
      />
      <PeoplePicker
        label="프로젝트 구성원"
        people={people}
        organizations={organizations}
        value={["member"]}
        multiple
        onValueChange={(ids) => ids.map((id) => id.toUpperCase())}
      />
      <FilterBar
        search=""
        onSearchChange={(value) => value.trim()}
        filters={filters}
        onFilterChange={(id, value) => `${id}:${value}`}
        onReset={() => undefined}
        resultCount={1}
      />
      <BulkActionBar
        selectedCount={1}
        actions={bulkActions}
        onClear={() => undefined}
        result={{ succeeded: 0, failed: 1 }}
        onRetry={() => undefined}
      />
      <DescriptionList
        items={[{ label: "소속", value: <strong>피플팀</strong> }]}
      />
      <ActivityTimeline label="업무 이력" items={activities} />
      <SaveStatus {...saveStatus} />
    </AppShell>
    <NavigationList
      items={workspaceNavigation}
      activeId="records"
      label="Consumer workspace"
      onNavigate={(id, event) => {
        if (id === "records" && !event.metaKey && !event.ctrlKey)
          event.preventDefault();
      }}
    />
    <SectionHeader
      title="Consumer metrics"
      description="Values supplied by the consuming application"
      headingLevel={2}
      actions={<Button>Refresh metrics</Button>}
    />
    <StatGroup columns={2} aria-label="Consumer statistics">
      <StatCard label="Pending records" value={0} description="Current view" />
      <StatCard label="Completion" value={<strong>50%</strong>} />
    </StatGroup>
    <RecordCollection
      {...recordCollection}
      toolbar={<Button>New record</Button>}
      bulkActions={<Button>Review selected records</Button>}
      bulkResult={{ succeeded: 0, failed: 1 }}
      onRetryBulkActions={() => undefined}
    />
    <MasterDetailLayout
      listLabel="구성원 목록"
      detailLabel="선택한 구성원"
      list={
        <ListPage title="구성원" headingLevel={2} summary="1명">
          <p>가상 직원</p>
        </ListPage>
      }
      detail={
        <DetailPage title="구성원 상세" headingLevel={2} aside="업무 이력">
          <ReadOnlyField label="완료한 검토" value={0} />
        </DetailPage>
      }
    />
    <FormPage
      id="foundation-form"
      title="업무 설정"
      headingLevel={2}
      onSubmit={(event) => new FormData(event.currentTarget)}
      footer={
        <FormActions
          form="foundation-form"
          onCancel={() => undefined}
          status={<SaveStatus status="idle" />}
        />
      }
    >
      <FormSection title="조직 및 권한" description="화면에서 편집할 설정">
        <FormGrid columns={2}>
          <OrganizationTreeSelect
            label="소속 조직"
            nodes={organizationNodes}
            value={["people"]}
            multiple
            onValueChange={(ids) => ids.map((id) => id.trim())}
          />
          <PermissionMatrix
            label="업무 권한"
            resources={[
              { id: "people", label: "구성원", unavailableActions: ["delete"] },
            ]}
            actions={[
              { id: "read", label: "조회" },
              { id: "delete", label: "삭제" },
            ]}
            value={permissionGrants}
            onValueChange={(grants) =>
              grants.map((grant) => `${grant.resourceId}:${grant.actionId}`)
            }
          />
        </FormGrid>
      </FormSection>
      <SortableList
        label="검토 순서"
        items={reviewOrder}
        onItemsChange={(items) => items.filter((item) => item.required)}
      />
    </FormPage>
    <NotificationCenter
      items={notifications}
      onRead={async (id) => {
        id.toUpperCase();
      }}
      onReadAll={async () => undefined}
      onNavigate={(item) => item.id.trim()}
    />
    <CommentComposer
      label="검토 의견"
      onSubmit={async (body) => {
        body.trim();
      }}
    />
    <CommentThread
      items={comments}
      onEdit={async (id, body) => {
        id.trim();
        body.trim();
      }}
      onDelete={async (id) => {
        id.trim();
      }}
      onReply={async (parentId, body) => {
        parentId.trim();
        body.trim();
      }}
    />
    <FilePreview
      open={false}
      item={previewFiles[0]}
      onOpenChange={(open) => !open}
      onRetry={(item) => item.id.trim()}
    />
    <AttachmentGallery
      label="검토 자료"
      items={previewFiles}
      previewId={null}
      onPreviewChange={(id) => id?.trim()}
      onDownload={(item) => item.name.trim()}
    />
    <AccessDenied onAction={() => undefined} />
    <SessionExpired onReauthenticate={() => undefined} busy={false} />
    <PageError onRetry={() => undefined} />
    <SavedViews
      views={savedViews}
      value="all"
      onSelect={(id) => id.trim()}
      onSave={async (label) => {
        label.trim();
      }}
      onDelete={async (id) => {
        id.trim();
      }}
    />
    <ImportWizard
      fields={importFields}
      // Deterministic consumer fixture: production supplies a CSV/XLSX decoder.
      parse={async (file, { signal }) => {
        signal.throwIfAborted();
        return {
          columns: ["이름"],
          rows: [{ 이름: file.name }],
        } satisfies ImportParsedData;
      }}
      validate={async (rows, { signal }) => {
        signal.throwIfAborted();
        return rows
          .filter((row) => !row.values.name?.trim())
          .map((row) => ({
            row: row.row,
            field: "name",
            message: "이름이 필요합니다.",
          }));
      }}
      importRows={async (rows, { signal }) => {
        signal.throwIfAborted();
        return {
          succeededRows: rows.map((row) => row.row),
          failures: [],
        } satisfies ImportResult;
      }}
    />
    <ExportDialog
      open={false}
      onOpenChange={(open) => !open}
      columns={exportColumns}
      scopes={exportScopes}
      formats={exportFormats}
      onExport={async (selection, { signal }) => {
        signal.throwIfAborted();
        selection.columns.map((column) => column.trim());
        selection.scope.toUpperCase();
        selection.format.trim();
      }}
    />
    <form>
      <ErrorSummary
        ref={summary}
        errors={[
          {
            id: "employee-required",
            message: "이름을 입력해 주세요.",
            targetId: "employee",
          },
        ]}
        onNavigate={(item, event) => {
          if (!item.targetId) event.preventDefault();
        }}
      />
      <Field label="이름" required>
        <Input ref={input} id="employee" name="employee" />
      </Field>
      <DatePicker ref={picker} label="마감일" name="deadline" required />
      <DateField
        ref={date}
        label="시작일"
        name="startDate"
        defaultValue="2026-10-01"
        min="2026-01-01"
        max="2026-12-31"
        step="any"
        onValueChange={(value) => value.trim()}
      />
      <TimeField
        ref={time}
        label="알림 시간"
        name="reminder"
        defaultValue="09:00"
        min="09:00"
        max="18:00"
        step={900}
        onValueChange={(value) => value.trim()}
      />
      <NumberField
        ref={number}
        label="수량"
        name="quantity"
        defaultValue={1.5}
        min={0}
        max={10}
        step={0.5}
        onValueChange={(value) => value.trim()}
      />
      <Button type="submit">저장</Button>
    </form>
    <SearchInput
      ref={search}
      label="직원 검색"
      name="employeeSearch"
      defaultValue="김치즈"
      description="이름 또는 부서를 검색하세요."
      onValueChange={(value) => value.trim()}
      onSearch={(value) => value.toUpperCase()}
    />
    <ScrollArea
      ref={scroll}
      viewportRef={viewport}
      label="업무 내역"
      orientation="both"
      height="12rem"
      viewportProps={{ onScroll: (event) => event.currentTarget.scrollTop }}
    >
      <p>스크롤 가능한 업무 내역</p>
    </ScrollArea>
    <Pagination
      page={5}
      count={1000}
      label="업무 페이지"
      previousLabel="이전 업무 페이지"
      nextLabel="다음 업무 페이지"
      getPageLabel={(page) => `${page}번째 업무 페이지`}
      onPageChange={(page) => page.toFixed(0)}
    />
    <Tree nodes={[{ id: "team", label: "팀" }]} />
    <Calendar mode="single" onSelect={(date) => date?.getDate()} />
    <Select label="조직" options={[{ value: "people", label: "피플팀" }]} />
    <Combobox
      label="검색"
      options={[]}
      onValueChange={(value) => value.toUpperCase()}
    />
    <Listbox label="목록" options={[]} />
    <PinInput label="인증 코드" onComplete={(code) => code.trim()} />
    <TagsInput label="태그" onValueChange={(tags) => tags.join(",")} />
    <Editable label="제목" />
    <Rating label="평점" />
    <ColorPicker label="색상" />
    <DateRangeField
      label="기간"
      onValueChange={(range) => range.start.trim()}
    />
    <TimeRangeField label="회의" />
    <MonthPicker label="월" />
    <YearPicker label="연도" />
    <Splitter label="분할" first="조직" second="내용" />
    <Carousel label="안내" items={["안내"]} />
    <AsyncCombobox
      label="서버 직원"
      loadOptions={createOptionsLoader("/api/employees")}
      onValueChange={(item) => item?.value.trim()}
    />
    <MultiSelect
      label="평가자"
      options={[]}
      onValueChange={(items) => items.map((item) => item.value)}
    />
    <DataTable
      label="목록"
      columns={[{ key: "name", label: "이름" }]}
      rows={[{ id: "1", name: "가상 직원" }]}
      getRowId={(row) => row.id}
      defaultQuery={{ page: 1, pageSize: 5, search: "", sort: null }}
      onQueryChange={(query) => query.sort?.key.trim()}
      renderCell={(row, column) => String(row[column.key as keyof typeof row])}
    />
    <DataTable
      label="복원한 목록"
      columns={[{ key: "name", label: "이름" }]}
      rows={[{ id: "1", name: "가상 직원" }]}
      getRowId={(row) => row.id}
      query={tableQuery}
      onQueryChange={(query) => query.page.toFixed(0)}
    />
    <AttachmentList
      label="저장된 첨부파일"
      items={[
        {
          id: "guide",
          name: "입사 안내.pdf",
          size: 2048,
          href: "/files/guide.pdf",
        },
      ]}
      onRemove={async (item, { signal }) => {
        await fetch(`/api/files/${encodeURIComponent(item.id)}`, {
          method: "DELETE",
          signal,
        });
      }}
    />
    <FileUpload
      label="자료"
      upload={createXHRUpload("/api/files")}
      onComplete={(item) => item.file.name}
    />
  </main>,
);
