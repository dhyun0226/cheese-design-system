import { Field, NativeSelect } from "@cheese/react";
export default function Example() {
  return (
    <Field label="담당 조직">
      <NativeSelect defaultValue="">
        <option value="" disabled>
          조직을 선택하세요
        </option>
        <option value="people">피플팀</option>
        <option value="creative">크리에이티브팀</option>
        <option value="tech">개발팀</option>
      </NativeSelect>
    </Field>
  );
}
