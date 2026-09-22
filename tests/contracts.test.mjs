import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as R from "../packages/react/dist/index.js";
import { tokens } from "../packages/tokens/dist/index.js";
test("public package exports include production-critical controls", () => {
  for (const key of [
    "Button",
    "Input",
    "Field",
    "NativeSelect",
    "Textarea",
    "Checkbox",
    "Switch",
    "DialogContent",
    "Tree",
    "TabsRoot",
    "Progress",
  ])
    assert.ok(R[key], key);
});
test("button cannot accidentally submit; loading blocks duplicate actions", () => {
  const html = renderToStaticMarkup(h(R.Button, { loading: true }, "Save"));
  assert.match(html, /type="button"/);
  assert.match(html, /disabled/);
  assert.match(html, /aria-busy="true"/);
});
test("Field preserves existing describedby and assigns deterministic IDs", () => {
  const html = renderToStaticMarkup(
    h(
      R.Field,
      { label: "Email", id: "email", error: "Invalid", required: true },
      h(R.Input, { "aria-describedby": "external" }),
    ),
  );
  assert.match(html, /for="email"/);
  assert.match(html, /id="email"/);
  assert.match(html, /aria-describedby="external email-hint"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /role="alert"/);
  assert.match(html, /required/);
});
test("tree has exactly one tab stop and does not use submit buttons", () => {
  const html = renderToStaticMarkup(
    h(R.Tree, {
      nodes: [{ id: "a", label: "A", children: [{ id: "b", label: "B" }] }],
      defaultExpanded: ["a"],
      label: "Directory",
    }),
  );
  assert.equal((html.match(/tabindex="0"/g) || []).length, 1);
  assert.match(html, /role="group"/);
  assert.doesNotMatch(html, /<button/);
});
test("progress clamps values at bounds", () => {
  const html = renderToStaticMarkup(
    h(R.Progress, { value: 120, label: "Upload" }),
  );
  assert.match(html, /aria-valuenow="100"/);
});
test("brand tokens remain explicit and orange is absent", () => {
  assert.equal(tokens.color.cheeseGold, "#FFC928");
  assert.ok(!Object.keys(tokens.color).some((k) => /orange/i.test(k)));
  const css = readFileSync(
    new URL("../packages/css/src/tokens.css", import.meta.url),
    "utf8",
  );
  assert.ok(css.includes(tokens.color.cheeseGold));
});
test("font loading has no runtime external CDN dependency", () => {
  const css = readFileSync(
    new URL("../packages/css/src/index.css", import.meta.url),
    "utf8",
  );
  assert.match(css, /pretendard\/dist/);
  assert.doesNotMatch(css, /https?:\/\//);
});
test("Vue declarations are portable and do not reference workspace node_modules", () => {
  const dts = readFileSync(
    new URL("../packages/vue/dist/styled.d.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(dts, /\.\.\/.*node_modules/);
});
