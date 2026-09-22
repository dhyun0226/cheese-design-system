import "@cheese/css";
import { createApp, h } from "vue";
import { Button, Field, Input, Calendar, Tree } from "@cheese/vue";
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
      h(Tree, { nodes: [{ id: "team", label: "팀" }] }),
    ]),
}).mount("#root");
