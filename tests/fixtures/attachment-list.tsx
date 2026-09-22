import "@cheese/css";
import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { createApp } from "vue";
import { AttachmentList } from "@cheese/react";
import AttachmentListFixture from "./AttachmentList.vue";

type Item = { id: string; name: string; size: number; href?: string };
type Request = {
  id: string;
  signal: AbortSignal;
  resolve: (remove: boolean) => void;
  reject: (error: unknown) => void;
};
type Driver = {
  snapshot: () => { id: string; aborted: boolean }[];
  resolve: (index: number, remove: boolean) => void;
  reject: (index: number, message: string | null) => void;
  remove: (id: string) => void;
  reinsert: (id: string) => void;
  unmount: () => void;
};

const params = new URLSearchParams(location.search);
const readOnly = params.get("readonly") === "true";
const empty = params.get("empty") === "true";
const initialItems: Item[] = [
  {
    id: "spec",
    name: "업무 명세.pdf",
    size: 15360,
    href: "data:text/plain;charset=utf-8,attachment-spec",
  },
  {
    id: "budget",
    name: "예산 검토.xlsx",
    size: 98304,
    href: "data:text/plain;charset=utf-8,attachment-budget",
  },
  {
    id: "report",
    name: "분기별_프로젝트_진행_현황_및_첨부_자료_검토_최종본_2026년_9월.txt",
    size: 0,
    href:
      params.get("unlinked") === "true"
        ? undefined
        : "data:text/plain;charset=utf-8,attachment-report",
  },
];

function ReactFixture() {
  const [items, setItems] = useState<Item[]>(empty ? [] : initialItems);
  const [mounted, setMounted] = useState(true);
  const requests = useRef<Request[]>([]);

  async function remove(item: Item, { signal }: { signal: AbortSignal }) {
    // Deliberately leave aborted requests pending: the component must ignore
    // stale rejections even when a transport does not cooperate with abort.
    const shouldRemove = await new Promise<boolean>((resolve, reject) => {
      requests.current.push({ id: item.id, signal, resolve, reject });
    });
    if (shouldRemove && !signal.aborted) {
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    }
  }

  (window as Window & { attachmentFixture?: Driver }).attachmentFixture = {
    snapshot: () =>
      requests.current.map(({ id, signal }) => ({
        id,
        aborted: signal.aborted,
      })),
    resolve: (index, shouldRemove) =>
      requests.current[index].resolve(shouldRemove),
    reject: (index, message) =>
      requests.current[index].reject(
        message === null ? "transport failure" : new Error(message),
      ),
    remove: (id) =>
      setItems((current) => current.filter((entry) => entry.id !== id)),
    reinsert: (id) =>
      setItems((current) => [
        ...current.filter((entry) => entry.id !== id),
        { ...initialItems.find((entry) => entry.id === id)! },
      ]),
    unmount: () => setMounted(false),
  };

  return (
    <main
      className="cheese-root cheese-stack"
      style={{ maxWidth: 640, margin: "24px auto", padding: 16 }}
    >
      <h1>저장된 첨부파일</h1>
      <button type="button">목록 이전</button>
      {mounted && (
        <AttachmentList
          label="업무 첨부파일"
          items={items}
          onRemove={readOnly ? undefined : remove}
        />
      )}
      <button type="button">목록 다음</button>
    </main>
  );
}

if (params.get("framework") === "vue") {
  createApp(AttachmentListFixture, { initialItems, readOnly, empty }).mount(
    "#root",
  );
} else {
  createRoot(document.getElementById("root")!).render(<ReactFixture />);
}
