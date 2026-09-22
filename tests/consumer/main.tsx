import "@cheese/css";
import { createRef } from "react";
import { createRoot } from "react-dom/client";
import {
  Button,
  Field,
  Input,
  DatePicker,
  Tree,
  Calendar,
} from "@cheese/react";
import { tokens } from "@cheese/tokens";

const input = createRef<HTMLInputElement>();
const picker = createRef<HTMLButtonElement>();
createRoot(document.getElementById("root")!).render(
  <main className="cheese-root" style={{ color: tokens.color.spaceBlack }}>
    <form>
      <Field label="이름" required>
        <Input ref={input} name="employee" />
      </Field>
      <DatePicker ref={picker} label="마감일" name="deadline" required />
      <Button type="submit">저장</Button>
    </form>
    <Tree nodes={[{ id: "team", label: "팀" }]} />
    <Calendar mode="single" onSelect={(date) => date?.getDate()} />
  </main>,
);
