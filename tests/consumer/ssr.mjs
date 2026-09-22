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
console.log("Isolated React + Vue SSR and token imports passed.");
