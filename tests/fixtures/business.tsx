import "@cheese/css";
import * as R from "@cheese/react";
import * as V from "@cheese/vue";
import { createRoot } from "react-dom/client";
import { createApp, h } from "vue";
declare global {
  interface Window {
    businessEvents: { kind: string; query: string; aborted?: boolean }[];
  }
}
window.businessEvents = [];
let failed = false;
const options: R.OptionsLoader = (query, { signal }) =>
  new Promise((resolve, reject) => {
    window.businessEvents.push({ kind: "search", query });
    signal.addEventListener(
      "abort",
      () =>
        window.businessEvents.push({ kind: "search", query, aborted: true }),
      { once: true },
    );
    // Intentionally ignores cancellation: consumers must also guard stale responses.
    setTimeout(
      () => {
        if (query === "fail" && !failed) {
          failed = true;
          reject(Error("failed"));
        } else
          resolve(
            query === "empty"
              ? []
              : [
                  {
                    value: query || "all",
                    label: (query || "all") + " result",
                  },
                ],
          );
      },
      query === "old" ? 650 : 60,
    );
  });
const rows = Array.from({ length: 12 }, (_, index) => ({
  id: String(index + 1),
  name: "직원 " + String(index + 1).padStart(2, "0"),
  score: 12 - index,
}));
const columns = [
  { key: "name", label: "이름" },
  { key: "score", label: "점수" },
];
const loadRows: R.RowsLoader = async (query, { signal }) => {
  window.businessEvents.push({ kind: "table", query: JSON.stringify(query) });
  signal.addEventListener(
    "abort",
    () =>
      window.businessEvents.push({
        kind: "table",
        query: JSON.stringify(query),
        aborted: true,
      }),
    { once: true },
  );
  await new Promise((resolve) =>
    setTimeout(resolve, query.search === "old" ? 650 : 60),
  );
  return query.search === "old"
    ? { rows: [{ id: "old", name: "stale row", score: 0 }], total: 1 }
    : R.queryRows(rows, columns, query);
};
const upload = R.createXHRUpload("/api/upload", { timeout: 3000 });
const getRowId = (row: R.DataRow) => String(row.id);
const choices = [
  { value: "one", label: "하나" },
  { value: "two", label: "둘" },
  { value: "three", label: "셋" },
  { value: "off", label: "제외", disabled: true },
];
const components = {
  async: {
    label: "Race search",
    loadOptions: options,
    debounceMs: 30,
    required: true,
    name: "employee",
  },
  multi: {
    label: "Form people",
    options: choices,
    max: 2,
    required: true,
    name: "people",
  },
  table: {
    label: "Contract table",
    columns,
    loadRows,
    getRowId,
    debounceMs: 30,
    defaultPageSize: 5,
  },
  client: {
    label: "Local table",
    columns,
    rows,
    getRowId,
    debounceMs: 0,
    defaultPageSize: 5,
  },
  upload: {
    label: "Contract upload",
    upload,
    accept: ".txt",
    maxFiles: 2,
    maxSize: 10,
  },
};
function submit(event: Event | React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  document.getElementById("result")!.textContent = JSON.stringify([
    ...new FormData(form),
  ]);
}
if (new URLSearchParams(location.search).get("framework") === "vue")
  createApp({
    render: () =>
      h(
        "main",
        {
          class: "cheese-root cheese-stack",
          style: { padding: "24px", maxWidth: "900px" },
        },
        [
          h("h1", "Vue business contracts"),
          h("form", { class: "cheese-stack", onSubmit: submit }, [
            h(V.AsyncCombobox, components.async),
            h(V.MultiSelect, components.multi),
            h(V.Button, { type: "submit" }, () => "Submit contract"),
            h(V.Button, { type: "reset" }, () => "Reset contract"),
          ]),
          h("output", { id: "result", "aria-label": "Form result" }),
          h(V.DataTable, components.table),
          h(V.DataTable, components.client),
          h(V.FileUpload, components.upload),
        ],
      ),
  }).mount("#root");
else
  createRoot(document.getElementById("root")!).render(
    <main
      className="cheese-root cheese-stack"
      style={{ padding: 24, maxWidth: 900 }}
    >
      <h1>React business contracts</h1>
      <form className="cheese-stack" onSubmit={submit}>
        <R.AsyncCombobox {...components.async} />
        <R.MultiSelect {...components.multi} />
        <R.Button type="submit">Submit contract</R.Button>
        <R.Button type="reset">Reset contract</R.Button>
      </form>
      <output id="result" aria-label="Form result" />
      <R.DataTable {...components.table} />
      <R.DataTable {...components.client} />
      <R.FileUpload {...components.upload} />
    </main>,
  );
