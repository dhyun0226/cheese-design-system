import { Alert } from "@cheese/react";
export default function Example() {
  return (
    <div className="cheese-stack">
      <Alert>평가 마감까지 7일 남았습니다.</Alert>
      <Alert tone="critical">
        저장하지 못했습니다. 입력 내용은 유지됩니다. 잠시 후 다시 시도해 주세요.
      </Alert>
    </div>
  );
}
