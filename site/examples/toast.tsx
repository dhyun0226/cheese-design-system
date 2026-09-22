import { useRef, useState } from "react";
import { Button, ToastProvider, Toast, ToastViewport } from "@cheese/react";
export default function Example() {
  const nextId = useRef(0);
  const [notifications, setNotifications] = useState<
    { id: number; description: string }[]
  >([]);
  function notify(description: string) {
    const id = nextId.current++;
    setNotifications((current) => [...current, { id, description }]);
  }
  return (
    <ToastProvider duration={5000} label="알림">
      <div className="cheese-inline">
        <Button onClick={() => notify("예제 상태가 저장되었습니다.")}>
          알림 표시
        </Button>
        <Button
          variant="weak"
          onClick={() =>
            notify(
              "변경한 평가 내용과 첨부 파일이 모두 저장되었습니다. 다른 화면으로 이동해도 입력한 내용을 이어서 확인할 수 있습니다.",
            )
          }
        >
          긴 알림 표시
        </Button>
      </div>
      {notifications.map(({ id, description }) => (
        <Toast
          key={id}
          open
          onOpenChange={(open) => {
            if (!open)
              setNotifications((current) =>
                current.filter((notification) => notification.id !== id),
              );
          }}
          title="저장되었습니다."
          description={description}
        />
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
