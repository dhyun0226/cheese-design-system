import { AsyncCombobox, Button } from "@cheese/react";
import { useState } from "react";
import { demoLoadOptions } from "../business-demo";
export default function Example() {
  const [result, setResult] = useState("미선택");
  return (
    <form
      className="cheese-stack"
      onSubmit={(event) => {
        event.preventDefault();
        setResult(String(new FormData(event.currentTarget).get("employee")));
      }}
    >
      <p className="cheese-help">
        샘플 서버 응답을 재현합니다. 이름·부서를 검색하거나 ‘오류’를 입력해
        재시도를 확인하세요.
      </p>
      <AsyncCombobox
        label="직원 서버 검색"
        loadOptions={demoLoadOptions}
        name="employee"
        required
      />
      <div className="cheese-inline">
        <Button type="submit">직원 확인</Button>
        <Button type="reset" variant="weak">
          선택 초기화
        </Button>
      </div>
      <p role="status" className="cheese-help">
        직원 ID: {result}
      </p>
    </form>
  );
}
