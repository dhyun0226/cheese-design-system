import {
  AttachmentList,
  type AttachmentItem,
  type AttachmentRemoveHandler,
} from "@cheese/react";
import { useRef, useState } from "react";

export default function Example() {
  const [items, setItems] = useState<AttachmentItem[]>([
    {
      id: "guide",
      name: "평가 안내.txt",
      size: 171,
      href: "./sample-evaluation.txt",
    },
  ]);
  const attempted = useRef(false);
  const remove: AttachmentRemoveHandler = async (item, { signal }) => {
    await new Promise<void>((resolve, reject) => {
      if (signal.aborted)
        return reject(new DOMException("Aborted", "AbortError"));
      const abort = () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      };
      const timer = setTimeout(() => {
        signal.removeEventListener("abort", abort);
        resolve();
      }, 500);
      signal.addEventListener("abort", abort, { once: true });
    });
    if (signal.aborted) return;
    if (!attempted.current) {
      attempted.current = true;
      throw new Error("파일을 삭제하지 못했습니다. 다시 시도해 주세요.");
    }
    setItems((previous) => previous.filter((file) => file.id !== item.id));
  };
  return (
    <div className="cheese-stack">
      <p className="cheese-help">
        안내 파일을 실제로 내려받을 수 있습니다. 삭제는 이 화면에서만 재현하며
        첫 시도는 실패하고 재시도하면 목록에서 사라집니다.
      </p>
      <AttachmentList label="저장된 첨부자료" items={items} onRemove={remove} />
    </div>
  );
}
