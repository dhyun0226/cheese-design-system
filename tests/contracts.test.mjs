import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as R from "../packages/react/dist/index.js";
import { tokens } from "../packages/tokens/dist/index.js";
import * as V from "../packages/vue/dist/cheese-vue.js";

test("business modules export typed framework APIs and identical transport logic", () => {
  for (const api of [R, V])
    for (const key of [
      "AsyncCombobox",
      "MultiSelect",
      "DataTable",
      "FileUpload",
      "createXHRUpload",
      "createOptionsLoader",
      "queryRows",
      "UploadQueue",
    ])
      assert.ok(api[key], key);
  const react = readFileSync(
    new URL("../packages/react/src/business.ts", import.meta.url),
    "utf8",
  );
  const vue = readFileSync(
    new URL("../packages/vue/src/business.ts", import.meta.url),
    "utf8",
  );
  assert.equal(react.replace("./Collections.js", "./fieldModel"), vue);
});
for (const [framework, api] of [
  ["React", R],
  ["Vue", V],
]) {
  test(
    framework + " small upload limits are not rounded down to zero MB",
    () => {
      assert.equal(api.formatFileSize(10), "10 B");
      assert.equal(api.formatFileSize(512 * 1024), "512 KB");
      assert.equal(api.formatFileSize(2 * 1024 ** 2), "2 MB");
    },
  );
  test(
    framework +
      " local table filters, sorts numbers and paginates without mutating source",
    () => {
      const rows = [
        { id: "a", score: 10 },
        { id: "b", score: 2 },
        { id: "c", score: 8 },
      ];
      const result = api.queryRows(rows, [{ key: "score", label: "점수" }], {
        page: 2,
        pageSize: 1,
        search: "",
        sort: { key: "score", direction: "asc" },
      });
      assert.equal(result.rows[0].id, "c");
      assert.equal(result.total, 3);
      assert.equal(rows[0].id, "a");
    },
  );
  test(
    framework +
      " queue ignores late results after cancel/retry and validates uploads",
    async () => {
      const completed = [],
        snapshots = [];
      const queue = new api.UploadQueue(
        (items) => snapshots.push(items.map((item) => ({ ...item }))),
        (item) => completed.push(item),
      );
      const file = new File(["hello"], "document.txt", {
        type: "text/plain",
        lastModified: 1,
      });
      assert.deepEqual(
        queue.add([file], { accept: ".txt", maxFiles: 2, maxSize: 10 }),
        [],
      );
      assert.match(queue.add([file], { maxFiles: 2 })[0], /이미 추가/);
      assert.match(api.validateFile(file, { maxSize: 2 }), /파일 크기/);
      assert.match(api.validateFile(file, { accept: "image/*" }), /파일 형식/);
      const id = queue.items[0].id;
      let oldResolve, oldProgress;
      const first = queue.start(id, (_, context) => {
        oldProgress = context.onProgress;
        return new Promise((resolve) => (oldResolve = resolve));
      });
      oldProgress(50);
      queue.cancel(id);
      await queue.start(id, async (_, context) => {
        context.onProgress(80);
        return "new-result";
      });
      oldProgress(99);
      oldResolve("stale-result");
      await first;
      assert.equal(queue.items[0].result, "new-result");
      assert.equal(queue.items[0].status, "success");
      assert.equal(completed.length, 1);
      const count = snapshots.length;
      queue.dispose();
      assert.equal(snapshots.length, count);
    },
  );
}
test("public package exports include production-critical controls", () => {
  for (const key of [
    "Button",
    "Input",
    "Field",
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
test("NativeSelect is not part of either public framework API", () => {
  assert.equal("NativeSelect" in R, false);
  assert.equal("NativeSelect" in V, false);
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
  assert.equal(tokens.semantic.focus, "{color.cheeseGold}");
  assert.equal(tokens.semantic.danger, "{color.spaceBlack}");
  assert.equal(tokens.semantic.success, "{color.spaceBlack}");
});

test("typography separates native control leading from reading rhythm", () => {
  assert.equal(tokens.font.lineHeight.control, "normal");
  assert.equal(tokens.font.lineHeight.body, 1.5);
  assert.equal(tokens.font.lineHeight.heading, 1.25);
  assert.deepEqual(tokens.font.weight, {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  });
  const css = readFileSync(
    new URL("../packages/css/src/tokens.css", import.meta.url),
    "utf8",
  );
  assert.match(css, /--cheese-font-weight-semibold: 600;/);
  assert.doesNotMatch(css, /--cheese-font-weight-\w+: \d+px/);
});

test("quiet white inputs preserve contrast for focus and selection cues", () => {
  const luminance = (hex) => {
    const channels = hex
      .slice(1)
      .match(/../g)
      .map((v) => parseInt(v, 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const contrast = (a, b) => {
    const x = luminance(a),
      y = luminance(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  };
  assert.equal(tokens.semantic.controlBg, "{color.lunarWhite}");
  assert.equal(tokens.semantic.shadowControl, "none");
  assert.equal(tokens.semantic.controlBorder, "#CECECE");
  assert.equal(tokens.semantic.controlHoverBorder, "#BBBBBB");
  assert.ok(
    contrast(tokens.semantic.controlEdge, tokens.color.lunarWhite) >= 3,
  );
  for (const bg of [tokens.color.lunarWhite, tokens.color.cheeseGold]) {
    assert.ok(contrast(tokens.semantic.focusContrast, bg) >= 3);
    assert.ok(contrast(tokens.semantic.selectionIndicator, bg) >= 3);
  }
  const siteCss = readFileSync(
    new URL("../site/site.css", import.meta.url),
    "utf8",
  );
  // Search uses the package Input without a local appearance override. The
  // layout-only wrapper is valid even when no descendant selector exists.
  const searchRules = [
    ...siteCss.matchAll(/([^{}]*\.nav-search[^{}]*)\{([^}]+)\}/g),
  ];
  assert.ok(searchRules.length > 0, "search layout remains discoverable");
  for (const [, , rule] of searchRules) {
    assert.doesNotMatch(
      rule,
      /border|background|box-shadow|font-size|min-height/,
    );
  }
  const cssEntry = readFileSync(
    new URL("../packages/css/src/index.css", import.meta.url),
    "utf8",
  );
  assert.ok(cssEntry.trim().endsWith('@import "./accessibility.css";'));
});

test("all new high-level controls and navigation components are exported", () => {
  for (const name of [
    "Select",
    "Combobox",
    "Listbox",
    "PinInput",
    "TagsInput",
    "Editable",
    "Rating",
    "ColorPicker",
    "DateRangeField",
    "TimeRangeField",
    "MonthPicker",
    "YearPicker",
    "NavigationMenuRoot",
    "MenubarRoot",
    "ToolbarRoot",
    "HoverCardRoot",
    "Splitter",
    "Carousel",
  ])
    assert.ok(R[name], `Missing React export ${name}`);
});

test("legacy brown and semantic chromatic colors do not return", () => {
  const files = [
    "tokens.css",
    "components.css",
    "calendar.css",
    "extended.css",
  ];
  for (const file of files) {
    const css = readFileSync(
      new URL("../packages/css/src/" + file, import.meta.url),
      "utf8",
    );
    assert.doesNotMatch(
      css,
      /#(?:785500|ad8000|624700|21834f|d83b3b|b4232f|196c40|eaf6ee|ffedf0|edb4bc|fff7f8)\b/i,
    );
  }
  const reactTree = readFileSync(
    new URL("../packages/react/src/Tree.tsx", import.meta.url),
    "utf8",
  );
  const vueTree = readFileSync(
    new URL("../packages/vue/src/Tree.ts", import.meta.url),
    "utf8",
  );
  for (const source of [reactTree, vueTree]) {
    assert.match(source, /ChevronRight/);
    assert.doesNotMatch(source, /[⌄›]/);
  }
});
test("font loading has no runtime external CDN dependency", () => {
  const css = readFileSync(
    new URL("../packages/css/src/index.css", import.meta.url),
    "utf8",
  );
  assert.match(css, /pretendard\/dist/);
  assert.doesNotMatch(css, /https?:\/\//);
  const source = readFileSync(
    new URL("../public/licenses/Pretendard-OFL.txt", import.meta.url),
    "utf8",
  )
    .trim()
    .replace(/\r\n/g, "\n");
  const shipped = readFileSync(
    new URL("../packages/css/licenses/Pretendard-OFL.txt", import.meta.url),
    "utf8",
  )
    .trim()
    .replace(/\r\n/g, "\n");
  assert.equal(
    shipped,
    source,
    "Tarball and website must ship the same OFL notice",
  );
});

test("React public entry preserves the client boundary after compilation", () => {
  const entry = readFileSync(
    new URL("../packages/react/dist/index.js", import.meta.url),
    "utf8",
  );
  assert.match(entry, /^"use client";/);
});
test("Vue declarations are portable and do not reference workspace node_modules", () => {
  const dts = readFileSync(
    new URL("../packages/vue/dist/styled.d.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(dts, /\.\.\/.*node_modules/);
});
