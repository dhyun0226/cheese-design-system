import {
  Card,
  Badge,
  Button,
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@cheese/react";
export default function Example() {
  return (
    <Card>
      <div className="cheese-stack">
        <Badge tone="brand">진행 중</Badge>
        <h2>2026 하반기 평가</h2>
        <p className="cheese-help">
          한 해의 성과를 돌아보고, 다음 목표를 함께 정합니다.
        </p>
        <DialogRoot>
          <DialogTrigger asChild>
            <Button variant="weak">평가 안내 확인</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>평가 안내</DialogTitle>
            <DialogDescription>
              10월 30일까지 성과와 다음 목표를 작성해 주세요. 가상 데이터 기반
              예제입니다.
            </DialogDescription>
            <div className="cheese-dialog-actions">
              <DialogClose asChild>
                <Button>확인</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </DialogRoot>
      </div>
    </Card>
  );
}
