import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { createSSRApp, h } from "vue";
import { renderToString as renderVue } from "vue/server-renderer";
import * as ReactUI from "@cheese/react";
import * as VueUI from "@cheese/vue";
import { tokens } from "@cheese/tokens";

assert.equal(tokens.color.cheeseGold, "#FFC928");
assert.match(
  renderToString(createElement(ReactUI.Button, {}, "Save")),
  /type="button"/,
);
assert.match(
  renderToString(
    createElement(ReactUI.DatePicker, {
      label: "마감일",
      name: "deadline",
      disabled: true,
    }),
  ),
  /disabled/,
);
const vue = await renderVue(
  createSSRApp({ render: () => h(VueUI.Button, {}, () => "Save") }),
);
assert.match(vue, /type="button"/);
assert.match(vue, /cheese-button/);

// Packaged components must render without a browser and preserve the values
// and accessibility attributes required for the first hydrated paint.
for (const [framework, ui, render] of [
  [
    "React",
    ReactUI,
    (component, props, content) =>
      renderToString(createElement(component, props, content)),
  ],
  [
    "Vue",
    VueUI,
    (component, props, content) =>
      renderVue(
        createSSRApp({
          render: () =>
            h(component, props, content ? () => content : undefined),
        }),
      ),
  ],
]) {
  for (const [component, value, type, extra] of [
    ["DateField", "2026-10-01", "text", { step: "any" }],
    ["TimeField", "09:00", "text", { step: 900 }],
    ["NumberField", "1.5", "number", { min: 0, max: 10, step: 0.5 }],
  ]) {
    const markup = await render(ui[component], {
      label: component,
      name: component,
      defaultValue: value,
      required: true,
      ...extra,
    });
    const field = markup.match(/<input\b[^>]*>/)?.[0];
    assert.ok(field, `${framework} ${component} renders its form control`);
    assert.match(field, new RegExp(`type="${type}"`));
    assert.match(field, new RegExp(`name="${component}"`));
    assert.match(field, new RegExp(`value="${value}"`));
    assert.match(field, /\brequired(?:="")?(?:\s|>)/);
  }
  const scroll = await render(
    ui.ScrollArea,
    { label: "Activity history", orientation: "both", height: "12rem" },
    "Scrollable activity",
  );
  assert.match(scroll, /data-scroll-orientation="both"/);
  assert.match(scroll, /role="region"/);
  assert.match(scroll, /aria-label="Activity history"/);
  assert.match(scroll, /tabindex="0"/i);
  assert.match(scroll, /Scrollable activity/);

  const pagination = await render(ui.Pagination, {
    page: 500,
    count: 1000000,
    label: "Results pages",
    previousLabel: "Previous results",
    nextLabel: "Next results",
    getPageLabel: (page) => `Results page ${page}`,
    onPageChange: () => {},
  });
  assert.match(pagination, /aria-label="Results pages"/);
  assert.match(pagination, /aria-label="Previous results"/);
  assert.match(pagination, /aria-label="Next results"/);
  assert.match(pagination, /aria-label="Results page 500"/);
  assert.match(pagination, /aria-current="page"/);
  const buttons = pagination.match(/<button\b/g) ?? [];
  assert.ok(
    buttons.length > 0 && buttons.length <= 9,
    `${framework} pagination stays bounded for a million pages`,
  );
}
console.log("Isolated React + Vue SSR and token imports passed.");
