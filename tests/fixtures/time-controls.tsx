import "@cheese/css";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { createApp, h, ref } from "vue";
import { TimeField as ReactTimeField } from "../../packages/react/src/TimeField";
import VueTimeField from "../../packages/vue/src/TimeField.vue";

const common = {
  label: "Meeting",
  name: "meeting",
  defaultValue: "09:00",
  min: "09:00",
  max: "18:00",
  step: 900,
  required: true,
  description: "15분 단위로 예약합니다.",
  "aria-describedby": "extra-hint",
};
const seconds = {
  label: "Seconds",
  name: "seconds",
  defaultValue: "09:00:30",
  min: "09:00:00",
  max: "09:01:00",
  step: 15,
};
const offset = {
  label: "Offset",
  name: "offset",
  defaultValue: "10:05",
  step: 900,
};
const external = {
  label: "External",
  name: "external",
  form: "external-form",
  defaultValue: "11:30",
  required: true,
};
const output = (form: HTMLFormElement) =>
  JSON.stringify(Object.fromEntries(new FormData(form)));
function ReactFixture() {
  const [result, setResult] = React.useState(""),
    [controlled, setControlled] = React.useState("12:00"),
    [changes, setChanges] = React.useState(0),
    [invalids, setInvalids] = React.useState(0);
  return (
    <main
      className="cheese-root cheese-stack"
      style={{ maxWidth: 620, margin: "24px auto", padding: 16 }}
    >
      <h1>Time controls</h1>
      <span id="extra-hint">24시간 형식</span>
      <form
        className="cheese-stack"
        onSubmit={(event) => {
          event.preventDefault();
          setResult(output(event.currentTarget));
        }}
      >
        <ReactTimeField
          {...common}
          onInvalid={() => setInvalids((n) => n + 1)}
        />
        <ReactTimeField {...seconds} />
        <ReactTimeField {...offset} />
        <ReactTimeField
          label="Controlled"
          name="controlled"
          value={controlled}
          defaultValue="08:00"
          onValueChange={(value) => {
            setControlled(value);
            setChanges((n) => n + 1);
          }}
        />
        <ReactTimeField
          label="Readonly"
          name="readonly"
          defaultValue="10:00"
          readOnly
          required
        />
        <ReactTimeField
          label="Disabled"
          name="disabled"
          defaultValue="10:00"
          disabled
          required
        />
        <button className="cheese-button" type="submit">
          Submit
        </button>
        <button className="cheese-button" type="reset">
          Reset
        </button>
      </form>
      <ReactTimeField {...external} />
      <form
        id="external-form"
        onSubmit={(event) => {
          event.preventDefault();
          setResult(output(event.currentTarget));
        }}
      >
        <button className="cheese-button" type="submit">
          External submit
        </button>
        <button className="cheese-button" type="reset">
          External reset
        </button>
      </form>
      <ReactTimeField label="No slots" min="18:00" max="09:00" />
      <output data-testid="result">{result}</output>
      <output data-testid="changes">{changes}</output>
      <output data-testid="invalids">{invalids}</output>
    </main>
  );
}
if (new URLSearchParams(location.search).get("framework") === "vue") {
  createApp({
    setup() {
      const result = ref(""),
        controlled = ref("12:00"),
        changes = ref(0),
        invalids = ref(0);
      const button = (label: string, type: "submit" | "reset") =>
        h("button", { class: "cheese-button", type }, label);
      const submit = (event: Event) => {
        event.preventDefault();
        result.value = output(event.currentTarget as HTMLFormElement);
      };
      return () =>
        h(
          "main",
          {
            class: "cheese-root cheese-stack",
            style: { maxWidth: "620px", margin: "24px auto", padding: "16px" },
          },
          [
            h("h1", "Time controls"),
            h("span", { id: "extra-hint" }, "24시간 형식"),
            h("form", { class: "cheese-stack", onSubmit: submit }, [
              h(VueTimeField, { ...common, onInvalid: () => invalids.value++ }),
              h(VueTimeField, seconds),
              h(VueTimeField, offset),
              h(VueTimeField, {
                label: "Controlled",
                name: "controlled",
                modelValue: controlled.value,
                defaultValue: "08:00",
                "onUpdate:modelValue": (value: string) => {
                  controlled.value = value;
                  changes.value++;
                },
              }),
              h(VueTimeField, {
                label: "Readonly",
                name: "readonly",
                defaultValue: "10:00",
                readOnly: true,
                required: true,
              }),
              h(VueTimeField, {
                label: "Disabled",
                name: "disabled",
                defaultValue: "10:00",
                disabled: true,
                required: true,
              }),
              button("Submit", "submit"),
              button("Reset", "reset"),
            ]),
            h(VueTimeField, external),
            h("form", { id: "external-form", onSubmit: submit }, [
              button("External submit", "submit"),
              button("External reset", "reset"),
            ]),
            h(VueTimeField, { label: "No slots", min: "18:00", max: "09:00" }),
            h("output", { "data-testid": "result" }, result.value),
            h("output", { "data-testid": "changes" }, changes.value),
            h("output", { "data-testid": "invalids" }, invalids.value),
          ],
        );
    },
  }).mount("#root");
} else createRoot(document.getElementById("root")!).render(<ReactFixture />);
