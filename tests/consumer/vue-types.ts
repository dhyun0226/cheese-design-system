import { h, ref } from "vue";
import {
  Button,
  Input,
  SearchInput,
  ErrorSummary,
  AttachmentList,
  Field,
  Calendar,
  DateField,
  TimeField,
  NumberField,
  ScrollArea,
  Pagination,
  DialogRoot,
  DialogContent,
  DialogTitle,
  TabsTrigger,
  ContextMenuTrigger,
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
  NavigationMenuRoot,
  MenubarRoot,
  ToolbarRoot,
  AsyncCombobox,
  MultiSelect,
  DataTable,
  FileUpload,
  createOptionsLoader,
  createXHRUpload,
  type TableQuery,
} from "@cheese/vue";
import { CalendarDate } from "@internationalized/date";
const name = ref("");
const search = ref<InstanceType<typeof SearchInput> | null>(null);
const summary = ref<InstanceType<typeof ErrorSummary> | null>(null);
search.value?.focus();
search.value?.input?.select();
summary.value?.focus({ preventScroll: true });
const tableQuery = ref<TableQuery>({
  page: 1,
  pageSize: 5,
  search: "직원",
  sort: { key: "name", direction: "asc" },
});
h(SearchInput, {
  ref: search,
  label: "직원 검색",
  modelValue: name.value,
  name: "employeeSearch",
  description: "이름 또는 부서를 검색하세요.",
  "onUpdate:modelValue": (value) => {
    name.value = value.trim();
  },
  onSearch: (value) => value.toUpperCase(),
});
h(ErrorSummary, {
  ref: summary,
  errors: [
    {
      id: "employee-required",
      message: "이름을 입력해 주세요.",
      targetId: "employee",
    },
  ],
  onNavigate: (item, event) => {
    if (!item.targetId) event.preventDefault();
  },
});
h(AttachmentList, {
  label: "저장된 첨부파일",
  items: [
    {
      id: "guide",
      name: "입사 안내.pdf",
      size: 2048,
      href: "/files/guide.pdf",
    },
  ],
  remove: async (item, { signal }) => {
    await fetch(`/api/files/${encodeURIComponent(item.id)}`, {
      method: "DELETE",
      signal,
    });
  },
});
h(AsyncCombobox, {
  label: "검색",
  loadOptions: createOptionsLoader("/api/employees"),
  "onUpdate:modelValue": (item) => item?.value.trim(),
});
h(MultiSelect, {
  label: "선택",
  options: [],
  "onUpdate:modelValue": (items) => items.map((item) => item.value),
});
h(DataTable, {
  label: "목록",
  columns: [{ key: "name", label: "이름" }],
  rows: [{ id: "1", name: "직원" }],
  getRowId: (row) => String(row.id),
  query: tableQuery.value,
  "onUpdate:query": (query) => {
    tableQuery.value = query;
  },
  "onQuery-change": (query) => query.sort?.direction.toUpperCase(),
  "onUpdate:selected": (ids) => ids.join(","),
});
h(DataTable, {
  label: "기본 목록",
  columns: [{ key: "name", label: "이름" }],
  rows: [{ id: "1", name: "직원" }],
  getRowId: (row) => String(row.id),
  defaultQuery: { page: 1, pageSize: 5, search: "", sort: null },
});
h(FileUpload, {
  label: "첨부",
  upload: createXHRUpload("/api/files"),
  onComplete: (item) => item.file.name,
});
h(Button, { type: "submit", variant: "accent" }, () => "저장");
h(Input, {
  modelValue: name.value,
  "onUpdate:modelValue": (value) => {
    name.value = String(value ?? "");
  },
});
h(Field, { label: "이름", required: true }, () => h(Input));
h(Calendar, { label: "마감일", modelValue: new CalendarDate(2026, 10, 1) });
h(DateField, {
  label: "시작일",
  modelValue: "2026-10-01",
  name: "startDate",
  form: "employee-form",
  min: "2026-01-01",
  max: "2026-12-31",
  step: "any",
  "onUpdate:modelValue": (value) => value.trim(),
});
h(TimeField, {
  label: "알림 시간",
  defaultValue: "09:00",
  name: "reminder",
  min: "09:00",
  max: "18:00",
  step: 900,
  "onUpdate:modelValue": (value) => value.trim(),
});
h(NumberField, {
  label: "수량",
  modelValue: 1.5,
  name: "quantity",
  min: 0,
  max: 10,
  step: 0.5,
  "onUpdate:modelValue": (value) => value.trim(),
});
h(
  ScrollArea,
  {
    label: "업무 내역",
    orientation: "both",
    height: "12rem",
    dir: "rtl",
    viewportProps: { tabindex: 0, onScroll: (event) => event.type },
  },
  () => h("p", "스크롤 가능한 업무 내역"),
);
h(Pagination, {
  page: 5,
  count: 1000,
  label: "업무 페이지",
  previousLabel: "이전 업무 페이지",
  nextLabel: "다음 업무 페이지",
  getPageLabel: (page) => `${page}번째 업무 페이지`,
  "onUpdate:page": (page) => page.toFixed(0),
  onPageChange: (page) => page.toFixed(0),
});
h(DialogRoot, {}, () =>
  h(DialogContent, {}, () => h(DialogTitle, {}, () => "평가")),
);
h(TabsTrigger, { value: "profile" }, () => "프로필");
h(ContextMenuTrigger, { asChild: true, disabled: false }, () => h(Button));
h(Select, {
  label: "조직",
  options: [{ value: "people", label: "피플팀" }],
  "onUpdate:modelValue": (value) => value.toUpperCase(),
});
h(Combobox, { label: "검색", options: [], modelValue: "" });
h(Listbox, { label: "목록", options: [] });
h(PinInput, { label: "인증", length: 6 });
h(TagsInput, {
  label: "태그",
  "onUpdate:modelValue": (value) => value.join(","),
});
h(Editable, { label: "제목" });
h(Rating, { label: "평점" });
h(ColorPicker, { label: "색상" });
h(DateRangeField, {
  label: "기간",
  required: true,
  "onUpdate:modelValue": (value) => value.start.trim(),
});
h(TimeRangeField, {
  label: "시간",
  defaultValue: { start: "09:00", end: "10:00" },
});
h(MonthPicker, { label: "월" });
h(YearPicker, { label: "연도" });
h(Splitter, { label: "분할" }, { first: () => "조직", second: () => "내용" });
h(
  Carousel,
  { label: "안내", count: 2 },
  { default: ({ index }: { index: number }) => String(index) },
);
h(NavigationMenuRoot, {});
h(MenubarRoot, {});
h(ToolbarRoot, {});
