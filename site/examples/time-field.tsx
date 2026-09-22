import { Field, Input } from "@cheese/react";
export default function Example() {
  return (
    <Field label="알림 시간">
      <Input type="time" defaultValue="09:00" step={900} />
    </Field>
  );
}
