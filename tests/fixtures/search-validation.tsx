import "@cheese/css";
import * as R from "@cheese/react";
import * as V from "@cheese/vue";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { createApp, h, ref } from "vue";

const params = new URLSearchParams(location.search);
const local = params.get("scenario") === "local";
const multiFirst = params.has("multi-first");
const external = params.has("external");
const choices = [
  { value: "one", label: "하나" },
  { value: "two", label: "둘" },
];
const loadOptions: R.OptionsLoader = async (query) =>
  choices.filter((option) => option.label.includes(query));
const formId = "search-validation";
const first = { label: "First selection", name: "first", required: true };
const second = { label: "Second selection", name: "second", required: true };
let submissions = 0;
const submit = (event: {
  preventDefault: () => void;
  currentTarget: EventTarget | null;
}) => {
  event.preventDefault();
  document.getElementById("result")!.textContent = JSON.stringify(
    Array.from(new FormData(event.currentTarget as HTMLFormElement).entries()),
  );
  document.getElementById("submissions")!.textContent = String(++submissions);
};

function ControlledSelections() {
  const [owner, setOwner] = useState<R.ChoiceOption | null>(null);
  const [people, setPeople] = useState<R.ChoiceOption[]>([]);
  const [error, setError] = useState<string>();
  return (
    <main className="cheese-root cheese-stack" style={{ padding: 24 }}>
      <h1>외부 검색 선택 상태</h1>
      <form id={formId} className="cheese-stack" onSubmit={submit}>
        {params.has("local") ? (
          <>
            <R.Combobox
              {...first}
              options={choices}
              value={owner?.value ?? ""}
              onValueChange={(key) =>
                setOwner(choices.find((choice) => choice.value === key) ?? null)
              }
              error={error}
            />
            <R.Combobox
              {...second}
              options={choices}
              value={people[0]?.value ?? ""}
              onValueChange={(key) =>
                setPeople(choices.filter((choice) => choice.value === key))
              }
            />
          </>
        ) : (
          <>
            <R.AsyncCombobox
              {...first}
              loadOptions={loadOptions}
              value={owner}
              onValueChange={setOwner}
              error={error}
            />
            <R.MultiSelect
              {...second}
              options={choices}
              value={people}
              onValueChange={setPeople}
            />
          </>
        )}
      </form>
      <R.Button
        onClick={() => {
          setOwner(choices[0]);
          setPeople([choices[1]]);
        }}
      >
        Load saved selections
      </R.Button>
      <R.Button onClick={() => setError("담당자 권한을 확인해 주세요.")}>
        Set server error
      </R.Button>
      <R.Button type="submit" form={formId}>
        Submit selections
      </R.Button>
      <output id="result" aria-label="Form result" />
      <output id="submissions" aria-label="Submit count">
        0
      </output>
    </main>
  );
}

if (params.get("scenario") === "controlled") {
  if (params.get("framework") === "vue") {
    createApp({
      setup() {
        const owner = ref<R.ChoiceOption | null>(null);
        const people = ref<R.ChoiceOption[]>([]);
        const error = ref<string>();
        return () =>
          h(
            "main",
            { class: "cheese-root cheese-stack", style: { padding: "24px" } },
            [
              h("h1", "외부 검색 선택 상태"),
              h(
                "form",
                { id: formId, class: "cheese-stack", onSubmit: submit },
                [
                  h(V.AsyncCombobox, {
                    ...first,
                    loadOptions,
                    modelValue: owner.value,
                    "onUpdate:modelValue": (value) => (owner.value = value),
                    error: error.value,
                  }),
                  h(V.MultiSelect, {
                    ...second,
                    options: choices,
                    modelValue: people.value,
                    "onUpdate:modelValue": (value) => (people.value = value),
                  }),
                ],
              ),
              h(
                V.Button,
                {
                  onClick: () => {
                    owner.value = choices[0];
                    people.value = [choices[1]];
                  },
                },
                () => "Load saved selections",
              ),
              h(
                V.Button,
                {
                  onClick: () => (error.value = "담당자 권한을 확인해 주세요."),
                },
                () => "Set server error",
              ),
              h(
                V.Button,
                { type: "submit", form: formId },
                () => "Submit selections",
              ),
              h("output", { id: "result", "aria-label": "Form result" }),
              h(
                "output",
                { id: "submissions", "aria-label": "Submit count" },
                "0",
              ),
            ],
          );
      },
    }).mount("#root");
  } else {
    createRoot(document.getElementById("root")!).render(
      <ControlledSelections />,
    );
  }
} else if (params.get("framework") === "vue") {
  createApp({
    render: () =>
      h(
        "main",
        {
          class: "cheese-root cheese-stack",
          style: { padding: "24px", maxWidth: "600px" },
        },
        [
          h("h1", "검색 선택 필수값 검증"),
          external
            ? h("label", [
                "External title",
                h("input", {
                  class: "cheese-input",
                  form: formId,
                  name: "title",
                  required: true,
                }),
              ])
            : null,
          h("form", { id: formId, class: "cheese-stack", onSubmit: submit }, [
            h(V.AsyncCombobox, {
              label: "Disabled selection",
              name: "disabled",
              required: true,
              disabled: true,
              loadOptions,
            }),
            multiFirst
              ? h(V.MultiSelect, { ...first, options: choices })
              : h(V.AsyncCombobox, { ...first, loadOptions, debounceMs: 0 }),
            multiFirst
              ? h(V.AsyncCombobox, { ...second, loadOptions, debounceMs: 0 })
              : h(V.MultiSelect, { ...second, options: choices }),
          ]),
          h(
            V.Button,
            { type: "submit", form: formId },
            () => "Submit selections",
          ),
          h("output", { id: "result", "aria-label": "Form result" }),
          h("output", { id: "submissions", "aria-label": "Submit count" }, "0"),
        ],
      ),
  }).mount("#root");
} else {
  createRoot(document.getElementById("root")!).render(
    <main
      className="cheese-root cheese-stack"
      style={{ padding: 24, maxWidth: 600 }}
    >
      <h1>검색 선택 필수값 검증</h1>
      {external && (
        <label>
          External title
          <input className="cheese-input" form={formId} name="title" required />
        </label>
      )}
      <form id={formId} className="cheese-stack" onSubmit={submit}>
        <R.AsyncCombobox
          label="Disabled selection"
          name="disabled"
          required
          disabled
          loadOptions={loadOptions}
        />
        {local ? (
          <>
            <R.Combobox {...first} options={choices} />
            <R.Combobox {...second} options={choices} />
          </>
        ) : multiFirst ? (
          <>
            <R.MultiSelect {...first} options={choices} />
            <R.AsyncCombobox
              {...second}
              loadOptions={loadOptions}
              debounceMs={0}
            />
          </>
        ) : (
          <>
            <R.AsyncCombobox
              {...first}
              loadOptions={loadOptions}
              debounceMs={0}
            />
            <R.MultiSelect {...second} options={choices} />
          </>
        )}
      </form>
      <R.Button type="submit" form={formId}>
        Submit selections
      </R.Button>
      <output id="result" aria-label="Form result" />
      <output id="submissions" aria-label="Submit count">
        0
      </output>
    </main>,
  );
}
