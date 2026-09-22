import { useState } from "react";
import { PinInput, Button } from "@cheese/react";
const initialStatus = "테스트용입니다. 실제 인증 코드는 전송하지 않습니다.";
export default function Example() {
  const [status, setStatus] = useState(initialStatus);
  return (
    <form
      className="cheese-stack"
      onReset={() => setStatus(initialStatus)}
      onSubmit={(e) => {
        e.preventDefault();
        setStatus("6자리 입력이 확인되었습니다. 서버 검증은 별도입니다.");
      }}
    >
      <PinInput label="인증 코드" name="code" length={6} required />
      <div className="cheese-inline">
        <Button type="submit">코드 확인</Button>
        <Button type="reset" variant="weak">
          초기화
        </Button>
      </div>
      <p className="cheese-help" role="status">
        {status}
      </p>
    </form>
  );
}
