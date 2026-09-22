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

  for (const controlled of [false, true]) {
    const search = await render(ui.SearchInput, {
      id: "employee-search",
      label: "Employee search",
      name: "employeeSearch",
      defaultValue: controlled ? "ignored default" : "onboarding",
      ...(controlled
        ? { [framework === "React" ? "value" : "modelValue"]: "onboarding" }
        : {}),
      description: "Search by name or department.",
      clearLabel: "Clear employee search",
      required: true,
      onSearch: () => {},
    });
    const field = search.match(/<input\b[^>]*>/)?.[0];
    assert.ok(
      field,
      `${framework} SearchInput renders its native search control`,
    );
    assert.match(field, /type="search"/);
    assert.match(field, /name="employeeSearch"/);
    assert.match(field, /value="onboarding"/);
    assert.match(field, /\brequired(?:="")?(?:\s|>)/);
    assert.match(field, /aria-describedby="employee-search-hint"/);
    assert.match(search, /<label\b[^>]*for="employee-search"/);
    assert.match(search, /id="employee-search-hint"/);
    assert.match(search, /aria-label="Clear employee search"/);
    assert.match(search, /Search by name or department\./);
    assert.doesNotMatch(search, /ignored default/);
  }

  const summary = await render(ui.ErrorSummary, {
    title: "Check the form",
    errors: [
      {
        id: "name-required",
        message: "Enter a name.",
        targetId: "employee name",
      },
      { id: "save-failed", message: "Saving failed. Your draft is preserved." },
    ],
  });
  assert.match(summary, /role="region"/);
  assert.match(summary, /tabindex="-1"/i);
  assert.match(summary, /aria-labelledby="[^"]+"/);
  assert.match(summary, /Check the form/);
  assert.match(summary, /href="#employee%20name"/);
  assert.match(summary, /Enter a name\./);
  assert.match(summary, /Saving failed\. Your draft is preserved\./);
  const emptySummary = await render(ui.ErrorSummary, { errors: [] });
  assert.doesNotMatch(emptySummary, /role="region"|<h2\b|<ul\b/);

  const attachments = await render(ui.AttachmentList, {
    label: "Saved attachments",
    items: [
      { id: "guide", name: "Guide.pdf", size: 2048, href: "/files/guide.pdf" },
      { id: "internal", name: "Internal.txt", size: 32 },
    ],
    [framework === "React" ? "onRemove" : "remove"]: async () => {},
  });
  assert.match(attachments, /role="group"/);
  assert.match(attachments, /aria-label="Saved attachments 파일 목록"/);
  assert.match(attachments, /data-attachment-id="guide"/);
  assert.match(attachments, /data-attachment-id="internal"/);
  assert.match(attachments, /href="\/files\/guide\.pdf"/);
  assert.match(attachments, /download="Guide\.pdf"/);
  assert.match(attachments, /aria-label="Guide\.pdf 삭제"/);
  assert.match(attachments, /aria-label="Internal\.txt 삭제"/);
  assert.doesNotMatch(attachments, /aria-label="Internal\.txt 다운로드"/);
  assert.doesNotMatch(attachments, /삭제 중|삭제 재시도/);
  const emptyAttachments = await render(ui.AttachmentList, {
    label: "Saved attachments",
    items: [],
  });
  assert.match(emptyAttachments, /첨부파일이 없습니다\./);
  assert.doesNotMatch(emptyAttachments, /<ul\b|<button\b/);

  const initialQuery = {
    page: 2,
    pageSize: 1,
    search: "Staff",
    sort: { key: "name", direction: "desc" },
  };
  for (const controlled of [false, true]) {
    const table = await render(ui.DataTable, {
      label: "Restored employees",
      columns: [{ key: "name", label: "Employee" }],
      rows: [
        { id: "a", name: "Staff Alpha" },
        { id: "b", name: "Staff Bravo" },
        { id: "c", name: "Staff Charlie" },
        { id: "other", name: "Unrelated" },
      ],
      getRowId: (row) => row.id,
      defaultQuery: controlled
        ? { page: 1, pageSize: 5, search: "Missing", sort: null }
        : initialQuery,
      ...(controlled ? { query: initialQuery } : {}),
    });
    const body = table.match(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/)?.[1];
    assert.ok(
      body,
      `${framework} DataTable renders the restored page on the server`,
    );
    assert.match(body, /Staff Bravo/);
    assert.doesNotMatch(body, /Staff Alpha|Staff Charlie|Unrelated/);
    assert.match(table, /aria-sort="descending"/);
    assert.match(table, /<input\b[^>]*value="Staff"/);
    assert.doesNotMatch(table, /value="Missing"/);
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
