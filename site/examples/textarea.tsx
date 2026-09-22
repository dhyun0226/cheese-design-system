import { Field, Textarea } from "@cheese/react";
export default function Example() {
  return (
    <Field
      label="평가 의견"
      description="업무 성과와 다음 목표를 구체적으로 적어 주세요."
    >
      <Textarea placeholder="의견을 입력하세요." maxLength={1000} />
    </Field>
  );
}
