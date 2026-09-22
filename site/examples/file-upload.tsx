import { FileUpload } from "@cheese/react";
import { demoUpload } from "../business-demo";
export default function Example() {
  return (
    <div className="cheese-stack">
      <p className="cheese-help">
        전송 시뮬레이션입니다. 파일을 외부로 전송하거나 저장하지 않습니다.
        파일명에 ‘실패’를 넣으면 첫 시도가 실패하고 재시도할 수 있습니다.
      </p>
      <FileUpload
        label="평가 첨부자료"
        accept=".pdf,.txt,image/*"
        maxSize={2 * 1024 * 1024}
        maxFiles={3}
        upload={demoUpload}
      />
    </div>
  );
}
