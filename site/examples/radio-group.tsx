import { RadioGroup } from "@cheese/react";
export default function Example() {
  return (
    <RadioGroup
      label="평가 공개 범위"
      defaultValue="team"
      options={[
        { value: "private", label: "나만 보기" },
        { value: "team", label: "팀에 공개" },
        { value: "all", label: "전체 공개", disabled: true },
      ]}
    />
  );
}
