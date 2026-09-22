import { Field, Input } from "@cheese/react";
export default function Example() {
  return (
    <Field
      label="평가 마감일"
      description="브라우저의 기본 날짜 선택기를 사용합니다."
    >
      <Input
        type="date"
        min="2026-01-01"
        max="2026-12-31"
        defaultValue="2026-10-30"
      />
    </Field>
  );
}
