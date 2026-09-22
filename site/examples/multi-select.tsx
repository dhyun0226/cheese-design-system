import { MultiSelect, Button } from "@cheese/react";
import { useState } from "react";
import { demoOptions, createDemoOptionsLoader } from "../business-demo";
export default function Example() {
  const [result, setResult] = useState("미선택");
  const [loadOptions] = useState(createDemoOptionsLoader);
  return (
    <form
      className="cheese-stack"
      onSubmit={(event) => {
        event.preventDefault();
        setResult(
          new FormData(event.currentTarget).getAll("reviewers").join(", "),
        );
      }}
    >
      <MultiSelect
        label="평가자 선택"
        options={demoOptions.slice(0, 8)}
        max={3}
        name="reviewers"
        required
      />
      <MultiSelect
        label="서버에서 참조자 검색"
        loadOptions={loadOptions}
        max={5}
      />
      <div className="cheese-inline">
        <Button type="submit">평가자 확인</Button>
        <Button type="reset" variant="weak">
          선택 초기화
        </Button>
      </div>
      <p role="status" className="cheese-help">
        평가자 ID: {result}
      </p>
    </form>
  );
}
