import "@cheese/css";
import { createApp, h } from "vue";
import {
  Button,
  Field,
  Input,
  Calendar,
  Tree,
  DateField,
  TimeField,
  NumberField,
  ScrollArea,
  Pagination,
} from "@cheese/vue";
import { CalendarDate } from "@internationalized/date";
createApp({
  render: () =>
    h("main", { class: "cheese-root" }, [
      h(Field, { label: "이름" }, () => h(Input, { name: "employee" })),
      h(Button, {}, () => "저장"),
      h(Calendar, {
        label: "마감일",
        modelValue: new CalendarDate(2026, 10, 1),
      }),
      h(DateField, {
        label: "시작일",
        name: "startDate",
        defaultValue: "2026-10-01",
        step: "any",
      }),
      h(TimeField, {
        label: "알림 시간",
        name: "reminder",
        defaultValue: "09:00",
        step: 900,
      }),
      h(NumberField, {
        label: "수량",
        name: "quantity",
        defaultValue: 1.5,
        min: 0,
        max: 10,
        step: 0.5,
      }),
      h(
        ScrollArea,
        { label: "업무 내역", orientation: "both", height: 180 },
        () => h("p", "스크롤 가능한 업무 내역"),
      ),
      h(Pagination, { page: 5, count: 1000, label: "업무 페이지" }),
      h(Tree, { nodes: [{ id: "team", label: "팀" }] }),
    ]),
}).mount("#root");
