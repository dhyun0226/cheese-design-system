import { test, expect } from "@playwright/test";

test("single-line controls use font-native leading instead of paragraph leading", async ({
  page,
}) => {
  test.setTimeout(90000);
  for (const [route, selector] of [
    ["button", ".cheese-button"],
    ["input", ".cheese-input"],
    ["select-form", ".cheese-select-trigger"],
    ["select", ".cheese-select-trigger"],
    ["badge", ".cheese-badge"],
    ["radio-group", ".cheese-check-label"],
    ["tabs", ".cheese-tabs-trigger"],
    ["toggle-group", ".cheese-toggle"],
    ["calendar", ".rdp-day_button"],
    ["month-picker", ".cheese-period-item"],
    ["tree", ".cheese-tree-row"],
    ["stepper", ".cheese-step-circle"],
    ["tags-input", ".cheese-tag"],
  ]) {
    await page.goto("/#/components/" + route);
    const controls = page.locator(".demo-stage").locator(selector);
    await expect(controls.first()).toBeVisible();
    const mismatches = await controls.evaluateAll((elements) =>
      elements
        .filter((el) => getComputedStyle(el).lineHeight !== "normal")
        .map((el) => ({
          className: el.className,
          lineHeight: getComputedStyle(el).lineHeight,
        })),
    );
    expect(mismatches, route).toEqual([]);
  }
  await page.goto("/#/components/textarea");
  await expect(page.locator(".demo-stage textarea")).toHaveCSS(
    "line-height",
    "21px",
  );
});

test("button, badge, tab and toggle text boxes stay vertically centered", async ({
  page,
}) => {
  for (const [route, selector] of [
    ["button", ".cheese-button"],
    ["badge", ".cheese-badge"],
    ["tabs", ".cheese-tabs-trigger"],
    ["toggle-group", ".cheese-toggle"],
    ["calendar", ".rdp-day_button"],
  ]) {
    await page.goto("/#/components/" + route);
    const elements = page.locator(".demo-stage").locator(selector);
    await expect(elements.first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const offsets = await elements.evaluateAll((elements) =>
      elements
        .filter((el) => el.getClientRects().length)
        .map((el) => {
          const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          let node: Node | null;
          while ((node = walker.nextNode())) {
            if (!node.textContent?.trim()) continue;
            const range = document.createRange();
            range.selectNodeContents(node);
            const text = range.getBoundingClientRect();
            const box = el.getBoundingClientRect();
            return {
              text: node.textContent,
              offset: Math.abs(
                (text.top + text.bottom - box.top - box.bottom) / 2,
              ),
            };
          }
          return { text: "", offset: 0 };
        }),
    );
    // DOM text boxes, not a claim that every glyph/language has identical ink metrics.
    for (const item of offsets)
      expect(item.offset, `${route}: ${item.text}`).toBeLessThanOrEqual(1);
  }
});

test("API references use real badges and preserve the document type hierarchy", async ({
  page,
}) => {
  await page.goto("/#/components/toolbar");
  const badges = page.locator(".api-list > .cheese-badge");
  await expect(badges.first()).toBeVisible();
  await expect(page.locator(".api-list code")).toHaveCount(0);
  await expect(badges).toHaveCount(7);
  await expect(badges.first()).toHaveCSS("font-size", "12px");
  await expect(badges.first()).toHaveCSS("font-weight", "500");
  await expect(page.locator("main h1")).toHaveCSS("font-size", "48px");
  await expect(page.locator("main h1")).toHaveCSS("font-weight", "700");
  await expect(page.locator(".doc-details h2").first()).toHaveCSS(
    "font-size",
    "20px",
  );
  await expect(page.locator(".doc-details h2").first()).toHaveCSS(
    "font-weight",
    "600",
  );
  await page.locator(".doc-details").screenshot({
    path: `artifacts/${test.info().project.name}/api-badges.png`,
  });
});

for (const framework of ["react", "vue"]) {
  test(`${framework} package control typography does not depend on documentation styles`, async ({
    page,
  }) => {
    await page.goto("/tests/fixtures/business.html?framework=" + framework);
    const input = page.locator(".cheese-input").first();
    await expect(input).toHaveCSS("line-height", "normal");
    await expect(input).toHaveCSS("font-family", /Pretendard/);
    const button = page.locator(".cheese-button").first();
    await expect(button).toHaveCSS("line-height", "normal");
    await expect(button).toHaveCSS("font-weight", "600");
  });
}
