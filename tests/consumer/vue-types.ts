import { h, ref } from "vue";
import {
  Button,
  Input,
  Field,
  Calendar,
  DialogRoot,
  DialogContent,
  DialogTitle,
  TabsTrigger,
  ContextMenuTrigger,
} from "@cheese/vue";
import { CalendarDate } from "@internationalized/date";
const name = ref("");
h(Button, { type: "submit", variant: "accent" }, () => "저장");
h(Input, {
  modelValue: name.value,
  "onUpdate:modelValue": (value) => {
    name.value = String(value ?? "");
  },
});
h(Field, { label: "이름", required: true }, () => h(Input));
h(Calendar, { label: "마감일", modelValue: new CalendarDate(2026, 10, 1) });
h(DialogRoot, {}, () =>
  h(DialogContent, {}, () => h(DialogTitle, {}, () => "평가")),
);
h(TabsTrigger, { value: "profile" }, () => "프로필");
h(ContextMenuTrigger, { asChild: true, disabled: false }, () => h(Button));
