import "@cheese/css";
import * as R from "@cheese/react";
import * as V from "@cheese/vue";
import { createRoot } from "react-dom/client";
import { useRef, useState } from "react";
import { createApp, h, ref } from "vue";
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
const uploadEndpoint = "/api/upload?key=" + crypto.randomUUID();
document.documentElement.dataset.uploadEndpoint = uploadEndpoint;
const upload = R.createXHRUpload(uploadEndpoint, { timeout: 3000 });
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
let cancelUploadReset = false;
function resetUpload(event: Event | React.FormEvent<HTMLFormElement>) {
  if (cancelUploadReset) event.preventDefault();
  window.businessEvents.push({
    kind: "upload-reset",
    query: cancelUploadReset ? "canceled" : "allowed",
  });
}
const resetUploadHandler: R.UploadHandler = (file, { signal }) =>
  new Promise((_, reject) => {
    window.businessEvents.push({ kind: "reset-upload", query: file.name });
    signal.addEventListener(
      "abort",
      () => {
        window.businessEvents.push({
          kind: "reset-upload",
          query: file.name,
          aborted: true,
        });
        reject(new DOMException("Canceled", "AbortError"));
      },
      { once: true },
    );
  });
const query = new URLSearchParams(location.search);
function recordOTPInput(kind: string, event: Event | React.SyntheticEvent) {
  if (!query.has("events")) return;
  const nativeEvent = (
    "nativeEvent" in event ? event.nativeEvent : event
  ) as InputEvent;
  window.businessEvents.push({
    kind,
    query: JSON.stringify({
      value: (event.target as HTMLInputElement).value,
      inputType: nativeEvent.inputType,
      data: nativeEvent.data,
      bubbles: nativeEvent.bubbles,
      composed: nativeEvent.composed,
    }),
  });
}
const otpProps = {
  label: "Contract OTP",
  name: "code",
  id: "contract-otp",
  required: true,
  length: query.has("length") ? Number(query.get("length")) : undefined,
  defaultValue: query.get("defaultValue") ?? undefined,
  form: query.has("external") ? "otp-form" : undefined,
  "aria-describedby": "otp-description",
  onInput: (event: Event | React.FormEvent<HTMLInputElement>) =>
    recordOTPInput("otp-public-input", event),
  onPaste: (event: ClipboardEvent | React.ClipboardEvent<HTMLInputElement>) => {
    window.businessEvents.push({
      kind: "otp-paste",
      query: event.clipboardData?.getData("text/plain") ?? "",
    });
    if (query.has("cancelPaste")) event.preventDefault();
  },
  onComplete: (value: string) => {
    window.businessEvents.push({ kind: "otp-complete", query: value });
  },
  onInvalid: (event: Event | React.FormEvent<HTMLInputElement>) => {
    window.businessEvents.push({
      kind: "otp-invalid",
      query: String(event.defaultPrevented),
    });
  },
};
const dateRangeProps = {
  label: "Contract dates",
  name: "period",
  required: true,
  defaultValue: { start: "2026-10-10", end: "2026-10-11" },
  min: "2026-01-01",
  max: "2026-12-31",
};
const timeRangeProps = {
  label: "Contract times",
  name: "time",
  required: true,
  step: 900,
  defaultValue: { start: "09:00", end: "10:00" },
};
const externalSelectProps = {
  label: "External department",
  name: "team",
  form: "external-selection",
  required: true,
  options: choices,
};
function clearResult() {
  document.getElementById("result")!.textContent = "";
}
let cancelLifecycleReset = false;
function resetLifecycle(event: Event | React.FormEvent<HTMLFormElement>) {
  if (cancelLifecycleReset) event.preventDefault();
  else clearResult();
}
function ReactSelectLifecycle() {
  const [owner, setOwner] = useState("select-a");
  return (
    <main className="cheese-root cheese-stack">
      <h1>Select lifecycle contract</h1>
      {["a", "b"].map((key) => (
        <form
          key={key}
          id={"select-" + key}
          onSubmit={submit}
          onReset={resetLifecycle}
        >
          <R.Button type="submit">Submit {key.toUpperCase()}</R.Button>
          <R.Button type="reset">Reset {key.toUpperCase()}</R.Button>
        </form>
      ))}
      <R.Select
        label="Controlled department"
        name="controlled"
        form="select-a"
        options={choices}
        required
        value="two"
        defaultValue="one"
        onValueChange={() => {}}
      />
      <R.Select
        label="Moving department"
        name="moving"
        form={owner}
        options={choices}
        required
        defaultValue="one"
      />
      <R.Button onClick={() => setOwner("select-b")}>Move select to B</R.Button>
      <R.Button
        onClick={() => {
          cancelLifecycleReset = true;
        }}
      >
        Cancel lifecycle reset
      </R.Button>
      <R.Button
        onClick={() => {
          cancelLifecycleReset = false;
        }}
      >
        Allow lifecycle reset
      </R.Button>
      <output id="result" aria-label="Form result" />
    </main>
  );
}
if (query.get("scenario") === "select-focus") {
  const selectFocusProps = (key: string) => ({
    label: key === "first" ? "First department" : "Second department",
    name: key,
    options: choices,
    required: true,
  });
  if (query.get("framework") === "vue")
    createApp({
      render: () =>
        h("main", { class: "cheese-root cheese-stack" }, [
          h("h1", "Select validation focus contract"),
          h("form", { class: "cheese-stack", onSubmit: submit }, [
            h(V.Select, selectFocusProps("first")),
            h(V.Select, selectFocusProps("second")),
            h(V.Button, { type: "submit" }, () => "Submit departments"),
          ]),
          h("output", { id: "result", "aria-label": "Form result" }),
        ]),
    }).mount("#root");
  else
    createRoot(document.getElementById("root")!).render(
      <main className="cheese-root cheese-stack">
        <h1>Select validation focus contract</h1>
        <form className="cheese-stack" onSubmit={submit}>
          <R.Select {...selectFocusProps("first")} />
          <R.Select {...selectFocusProps("second")} />
          <R.Button type="submit">Submit departments</R.Button>
        </form>
        <output id="result" aria-label="Form result" />
      </main>,
    );
} else if (query.get("scenario") === "select-lifecycle") {
  if (query.get("framework") === "vue")
    createApp({
      setup() {
        const owner = ref("select-a");
        return () =>
          h("main", { class: "cheese-root cheese-stack" }, [
            h("h1", "Select lifecycle contract"),
            ...["a", "b"].map((key) =>
              h(
                "form",
                {
                  id: "select-" + key,
                  onSubmit: submit,
                  onReset: resetLifecycle,
                },
                [
                  h(
                    V.Button,
                    { type: "submit" },
                    () => "Submit " + key.toUpperCase(),
                  ),
                  h(
                    V.Button,
                    { type: "reset" },
                    () => "Reset " + key.toUpperCase(),
                  ),
                ],
              ),
            ),
            h(V.Select, {
              label: "Controlled department",
              name: "controlled",
              form: "select-a",
              options: choices,
              required: true,
              modelValue: "two",
              defaultValue: "one",
              "onUpdate:modelValue": () => {},
            }),
            h(V.Select, {
              label: "Moving department",
              name: "moving",
              form: owner.value,
              options: choices,
              required: true,
              defaultValue: "one",
            }),
            h(
              V.Button,
              {
                onClick: () => {
                  owner.value = "select-b";
                },
              },
              () => "Move select to B",
            ),
            h(
              V.Button,
              {
                onClick: () => {
                  cancelLifecycleReset = true;
                },
              },
              () => "Cancel lifecycle reset",
            ),
            h(
              V.Button,
              {
                onClick: () => {
                  cancelLifecycleReset = false;
                },
              },
              () => "Allow lifecycle reset",
            ),
            h("output", { id: "result", "aria-label": "Form result" }),
          ]);
      },
    }).mount("#root");
  else
    createRoot(document.getElementById("root")!).render(
      <ReactSelectLifecycle />,
    );
} else if (query.get("scenario") === "range-form") {
  if (query.get("framework") === "vue")
    createApp({
      render: () =>
        h("main", { class: "cheese-root cheese-stack" }, [
          h("h1", "Range form contract"),
          h(
            "form",
            { class: "cheese-stack", onSubmit: submit, onReset: clearResult },
            [
              h(V.DateRangeField, dateRangeProps),
              h(V.TimeRangeField, timeRangeProps),
              h(V.DateRangeField, {
                ...dateRangeProps,
                label: "Readonly dates",
                name: "fixedDate",
                readOnly: true,
              }),
              h(V.TimeRangeField, {
                ...timeRangeProps,
                label: "Readonly times",
                name: "fixedTime",
                readOnly: true,
              }),
              h(V.DateRangeField, {
                ...dateRangeProps,
                label: "Disabled dates",
                name: "offDate",
                disabled: true,
              }),
              h(V.TimeRangeField, {
                ...timeRangeProps,
                label: "Disabled times",
                name: "offTime",
                disabled: true,
              }),
              h(V.Button, { type: "submit" }, () => "Submit ranges"),
              h(V.Button, { type: "reset" }, () => "Reset ranges"),
            ],
          ),
          h("output", { id: "result", "aria-label": "Form result" }),
        ]),
    }).mount("#root");
  else
    createRoot(document.getElementById("root")!).render(
      <main className="cheese-root cheese-stack">
        <h1>Range form contract</h1>
        <form className="cheese-stack" onSubmit={submit} onReset={clearResult}>
          <R.DateRangeField {...dateRangeProps} />
          <R.TimeRangeField {...timeRangeProps} />
          <R.DateRangeField
            {...dateRangeProps}
            label="Readonly dates"
            name="fixedDate"
            readOnly
          />
          <R.TimeRangeField
            {...timeRangeProps}
            label="Readonly times"
            name="fixedTime"
            readOnly
          />
          <R.DateRangeField
            {...dateRangeProps}
            label="Disabled dates"
            name="offDate"
            disabled
          />
          <R.TimeRangeField
            {...timeRangeProps}
            label="Disabled times"
            name="offTime"
            disabled
          />
          <R.Button type="submit">Submit ranges</R.Button>
          <R.Button type="reset">Reset ranges</R.Button>
        </form>
        <output id="result" aria-label="Form result" />
      </main>,
    );
} else if (query.get("scenario") === "external-select") {
  if (query.get("framework") === "vue")
    createApp({
      render: () =>
        h("main", { class: "cheese-root cheese-stack" }, [
          h("h1", "External select contract"),
          h(
            "form",
            {
              id: "external-selection",
              onSubmit: submit,
              onReset: clearResult,
            },
            [
              h(V.Button, { type: "submit" }, () => "Submit external select"),
              h(V.Button, { type: "reset" }, () => "Reset external select"),
            ],
          ),
          h(V.Select, externalSelectProps),
          h(V.Select, {
            ...externalSelectProps,
            label: "Disabled department",
            name: "ignored",
            disabled: true,
            defaultValue: "two",
          }),
          h("output", { id: "result", "aria-label": "Form result" }),
        ]),
    }).mount("#root");
  else
    createRoot(document.getElementById("root")!).render(
      <main className="cheese-root cheese-stack">
        <h1>External select contract</h1>
        <form id="external-selection" onSubmit={submit} onReset={clearResult}>
          <R.Button type="submit">Submit external select</R.Button>
          <R.Button type="reset">Reset external select</R.Button>
        </form>
        <R.Select {...externalSelectProps} />
        <R.Select
          {...externalSelectProps}
          label="Disabled department"
          name="ignored"
          disabled
          defaultValue="two"
        />
        <output id="result" aria-label="Form result" />
      </main>,
    );
} else if (query.get("scenario") === "otp") {
  if (query.get("framework") === "vue")
    createApp({
      setup() {
        const disabled = ref(query.has("disabled"));
        const readOnly = ref(query.has("readOnly"));
        const value = ref(query.get("value") ?? otpProps.defaultValue ?? "");
        const publicRef = ref<{
          input?: HTMLInputElement;
          focus: () => void;
        } | null>(null);
        const otp = () =>
          h(V.PinInput, {
            ...otpProps,
            ref: publicRef,
            class: query.get("className") ?? undefined,
            disabled: disabled.value,
            readOnly: readOnly.value,
            readonly: query.has("readonly"),
            modelValue: query.has("controlled") ? value.value : undefined,
            "onUpdate:modelValue": (next: string) => {
              window.businessEvents.push({ kind: "otp-change", query: next });
              if (!query.has("hold")) value.value = next;
            },
          });
        return () =>
          h("main", { class: "cheese-root cheese-stack" }, [
            h("h1", "OTP form contract"),
            h("p", { id: "otp-description" }, "Test codes only"),
            h(
              "form",
              {
                id: "otp-form",
                class: "cheese-stack",
                onSubmit: submit,
                onReset: clearResult,
                onInput: (event: Event) =>
                  recordOTPInput("otp-form-input", event),
              },
              [
                query.has("multiple")
                  ? h(V.PinInput, {
                      label: "First OTP",
                      name: "first",
                      required: true,
                    })
                  : null,
                query.has("external") ? null : otp(),
                h(V.Button, { type: "submit" }, () => "Submit OTP"),
                h(V.Button, { type: "reset" }, () => "Reset OTP"),
              ],
            ),
            query.has("external") ? otp() : null,
            query.has("ref")
              ? h(
                  V.Button,
                  {
                    onClick: () => {
                      publicRef.value?.focus();
                      if (query.has("events"))
                        window.businessEvents.push({
                          kind: "otp-ref",
                          query: String(
                            publicRef.value?.input instanceof
                              HTMLInputElement &&
                              publicRef.value.input === document.activeElement,
                          ),
                        });
                    },
                  },
                  () => "Focus OTP ref",
                )
              : null,
            query.has("lifecycle")
              ? [
                  h(
                    V.Button,
                    { onClick: () => (disabled.value = !disabled.value) },
                    () => "Toggle disabled OTP",
                  ),
                  h(
                    V.Button,
                    { onClick: () => (readOnly.value = !readOnly.value) },
                    () => "Toggle readonly OTP",
                  ),
                ]
              : null,
            query.has("controlled")
              ? [
                  h(
                    V.Button,
                    { onClick: () => (value.value = "654321") },
                    () => "Set controlled OTP",
                  ),
                  h(
                    "output",
                    { "aria-label": "Controlled OTP value" },
                    value.value,
                  ),
                ]
              : null,
            h("output", { id: "result", "aria-label": "Form result" }),
          ]);
      },
    }).mount("#root");
  else {
    function ReactOTPContract() {
      const [disabled, setDisabled] = useState(query.has("disabled"));
      const [readOnly, setReadOnly] = useState(query.has("readOnly"));
      const publicRef = useRef<HTMLInputElement>(null);
      const [value, setValue] = useState(
        query.get("value") ?? otpProps.defaultValue ?? "",
      );
      const otp = (
        <R.PinInput
          {...otpProps}
          ref={publicRef}
          className={query.get("className") ?? undefined}
          disabled={disabled}
          readOnly={readOnly}
          value={query.has("controlled") ? value : undefined}
          onValueChange={(next) => {
            window.businessEvents.push({ kind: "otp-change", query: next });
            if (!query.has("hold")) setValue(next);
          }}
        />
      );
      return (
        <main className="cheese-root cheese-stack">
          <h1>OTP form contract</h1>
          <p id="otp-description">Test codes only</p>
          <form
            id="otp-form"
            className="cheese-stack"
            onSubmit={submit}
            onReset={clearResult}
            onInput={(event) => recordOTPInput("otp-form-input", event)}
          >
            {query.has("multiple") && (
              <R.PinInput label="First OTP" name="first" required />
            )}
            {!query.has("external") && otp}
            <R.Button type="submit">Submit OTP</R.Button>
            <R.Button type="reset">Reset OTP</R.Button>
          </form>
          {query.has("external") && otp}
          {query.has("ref") && (
            <R.Button
              onClick={() => {
                publicRef.current?.focus();
                if (query.has("events"))
                  window.businessEvents.push({
                    kind: "otp-ref",
                    query: String(
                      publicRef.current instanceof HTMLInputElement &&
                        publicRef.current === document.activeElement,
                    ),
                  });
              }}
            >
              Focus OTP ref
            </R.Button>
          )}
          {query.has("lifecycle") && (
            <>
              <R.Button onClick={() => setDisabled(!disabled)}>
                Toggle disabled OTP
              </R.Button>
              <R.Button onClick={() => setReadOnly(!readOnly)}>
                Toggle readonly OTP
              </R.Button>
            </>
          )}
          {query.has("controlled") && (
            <>
              <R.Button onClick={() => setValue("654321")}>
                Set controlled OTP
              </R.Button>
              <output aria-label="Controlled OTP value">{value}</output>
            </>
          )}
          <output id="result" aria-label="Form result" />
        </main>
      );
    }
    createRoot(document.getElementById("root")!).render(<ReactOTPContract />);
  }
} else if (query.get("scenario") === "upload-reset") {
  if (query.get("framework") === "vue")
    createApp({
      render: () =>
        h("main", { class: "cheese-root cheese-stack" }, [
          h("h1", "Upload reset contract"),
          h("form", { class: "cheese-stack", onReset: resetUpload }, [
            h(V.FileUpload, {
              ...components.upload,
              upload: resetUploadHandler,
            }),
            h(V.Button, { type: "reset" }, () => "Reset upload"),
          ]),
          h(
            V.Button,
            { onClick: () => (cancelUploadReset = true) },
            () => "Cancel upload reset",
          ),
          h(
            V.Button,
            { onClick: () => (cancelUploadReset = false) },
            () => "Allow upload reset",
          ),
        ]),
    }).mount("#root");
  else
    createRoot(document.getElementById("root")!).render(
      <main className="cheese-root cheese-stack">
        <h1>Upload reset contract</h1>
        <form className="cheese-stack" onReset={resetUpload}>
          <R.FileUpload {...components.upload} upload={resetUploadHandler} />
          <R.Button type="reset">Reset upload</R.Button>
        </form>
        <R.Button onClick={() => (cancelUploadReset = true)}>
          Cancel upload reset
        </R.Button>
        <R.Button onClick={() => (cancelUploadReset = false)}>
          Allow upload reset
        </R.Button>
      </main>,
    );
} else if (query.get("framework") === "vue")
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
