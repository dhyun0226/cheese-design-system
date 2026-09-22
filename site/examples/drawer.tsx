import {
  Button,
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  Checkbox,
} from "@cheese/react";
export default function Example() {
  return (
    <DialogRoot>
      <DialogTrigger asChild>
        <Button variant="weak">평가 상세 열기</Button>
      </DialogTrigger>
      <DialogContent placement="right">
        <DialogTitle>평가 상세</DialogTitle>
        <DialogDescription>
          현재 화면을 유지한 채 추가 작업을 진행합니다.
        </DialogDescription>
        <Checkbox label="진행 중인 평가만 표시" />
        <div className="cheese-dialog-actions">
          <DialogClose asChild>
            <Button>닫기</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </DialogRoot>
  );
}
