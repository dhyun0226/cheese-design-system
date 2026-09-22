// Synthetic, in-memory adapters. No employee data or files are sent to a server.
import type {
  OptionsLoader,
  RowsLoader,
  TableColumn,
  UploadHandler,
} from "@cheese/react";
export const demoColumns: TableColumn[] = [
  { key: "name", label: "이름" },
  { key: "team", label: "부서" },
  { key: "score", label: "점수" },
  { key: "status", label: "상태" },
];
export const demoRows = Array.from({ length: 24 }, (_, index) => ({
  id: String(index + 1),
  name:
    ["김하늘", "이도윤", "박서연", "최지우", "정민준", "윤수아"][index % 6] +
    " " +
    String(index + 1).padStart(2, "0"),
  team: ["피플팀", "개발팀", "크리에이티브팀"][index % 3],
  score: 60 + ((index * 7) % 40),
  status: index % 4 === 0 ? "작성 중" : "제출 완료",
}));
export const demoOptions = demoRows.map((row) => ({
  value: row.id,
  label: row.name,
  description: row.team,
  disabled: row.id === "24",
}));
export function demoDelay(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Canceled", "AbortError"));
      return;
    }
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException("Canceled", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, ms);
    signal.addEventListener("abort", abort, { once: true });
  });
}
// Create once per mounted example: retries share state, other examples do not.
export function createDemoOptionsLoader(): OptionsLoader {
  let failed = false;
  return async (query, { signal }) => {
    await demoDelay(450, signal);
    if (query === "오류" && !failed) {
      failed = true;
      throw Error("Demo failure");
    }
    return demoOptions
      .filter(
        (item) =>
          query === "오류" ||
          item.label.includes(query) ||
          item.description.includes(query),
      )
      .slice(0, 12);
  };
}
export function createDemoRowsLoader(): RowsLoader {
  let failed = false;
  return async (query, { signal }) => {
    await demoDelay(450, signal);
    if (query.search === "오류" && !failed) {
      failed = true;
      throw Error("Demo failure");
    }
    let rows = demoRows.filter(
      (row) =>
        query.search === "오류" ||
        Object.values(row).some((value) =>
          String(value).includes(query.search),
        ),
    );
    if (query.sort) {
      const { key, direction } = query.sort;
      rows = [...rows].sort(
        (a, b) =>
          String(a[key as keyof typeof a]).localeCompare(
            String(b[key as keyof typeof b]),
            "ko",
            { numeric: true },
          ) * (direction === "asc" ? 1 : -1),
      );
    }
    return {
      rows: rows.slice(
        (query.page - 1) * query.pageSize,
        query.page * query.pageSize,
      ),
      total: rows.length,
    };
  };
}
const attempts = new WeakMap<File, number>();
export const demoUpload: UploadHandler = async (
  file,
  { signal, onProgress },
) => {
  const attempt = (attempts.get(file) ?? 0) + 1;
  attempts.set(file, attempt);
  for (let step = 1; step <= 5; step++) {
    await demoDelay(240, signal);
    onProgress(step * 18);
    if (file.name.includes("실패") && attempt === 1 && step === 3)
      throw Error("Demo failure");
  }
  return { id: "demo-only", name: file.name };
};
