import {
  Button,
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  Field,
  Input,
} from "@cheese/react";
export default function Example() {
  return (
    <DialogRoot>
      <DialogTrigger asChild>
        <Button>평가 만들기</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>새 평가</DialogTitle>
        <DialogDescription>
          평가 이름을 입력하세요. 이 예제는 데이터를 전송하지 않습니다.
        </DialogDescription>
        <Field label="평가 이름">
          <Input placeholder="예: 2026 하반기 평가" />
        </Field>
        <div className="cheese-dialog-actions">
          <DialogClose asChild>
            <Button variant="weak">취소</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="accent">완료</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </DialogRoot>
  );
}
