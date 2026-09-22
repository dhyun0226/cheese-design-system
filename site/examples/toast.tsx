import { useState } from "react";
import { Button, ToastProvider, Toast, ToastViewport } from "@cheese/react";
export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <ToastProvider duration={5000} label="알림">
      <Button onClick={() => setOpen(true)}>알림 표시</Button>
      <Toast
        open={open}
        onOpenChange={setOpen}
        title="저장되었습니다."
        description="예제 상태가 저장되었습니다."
      />
      <ToastViewport />
    </ToastProvider>
  );
}
