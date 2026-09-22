import { useState } from "react";
import {
  Button,
  AlertDialogRoot,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@cheese/react";
export default function Example() {
  const [done, setDone] = useState(false);
  return (
    <div className="cheese-stack">
      <AlertDialogRoot>
        <AlertDialogTrigger asChild>
          <Button variant="critical">평가 삭제</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>평가를 삭제할까요?</AlertDialogTitle>
          <AlertDialogDescription>
            삭제하면 복구할 수 없습니다. 이곳에서는 예제 상태만 변경됩니다.
          </AlertDialogDescription>
          <div className="cheese-dialog-actions">
            <AlertDialogCancel asChild>
              <Button variant="weak">취소</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="critical" onClick={() => setDone(true)}>
                삭제
              </Button>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialogRoot>
      <p className="cheese-help" role="status">
        {done ? "예제 평가가 삭제되었습니다." : "아직 삭제하지 않았습니다."}
      </p>
    </div>
  );
}
