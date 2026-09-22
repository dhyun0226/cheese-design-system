import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readdirSync } from "node:fs";

test("the site search and package inputs share the same resting surface", async ({
  page,
}) => {
  await page.goto("/#/components/input");
  const input = page.getByRole("textbox", { name: "이름", exact: true });
  const search = page.locator(".site-sidebar .cheese-input");
  await expect(input).toBeVisible();
  for (const property of [
    "backgroundColor",
    "borderColor",
    "borderRadius",
    "boxShadow",
    "fontSize",
    "minHeight",
  ]) {
    const read = (el: Element, prop: string) =>
      getComputedStyle(el).getPropertyValue(
        prop.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()),
      );
    expect(await input.evaluate(read, property)).toBe(
      await search.evaluate(read, property),
    );
  }
  await expect(input).toHaveCSS("border-color", "rgb(206, 206, 206)");
  await expect(input).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(input).toHaveCSS("box-shadow", "none");
  await input.hover();
  await expect(input).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(input).toHaveCSS("box-shadow", "none");
  await expect(input).toHaveCSS("border-color", "rgb(187, 187, 187)");
  await expect(input).toHaveCSS("border-radius", "10px");
  await expect(page.getByRole("textbox", { name: "읽기 전용" })).toHaveCSS(
    "box-shadow",
    "none",
  );
  await expect(page.getByRole("textbox", { name: "비활성" })).toBeDisabled();
  await expect(page.getByRole("textbox", { name: "비활성" })).toHaveCSS(
    "box-shadow",
    "none",
  );
  for (const name of ["읽기 전용", "비활성"]) {
    await expect(page.getByRole("textbox", { name })).toHaveCSS(
      "background-color",
      "rgb(255, 255, 255)",
    );
  }
  await page.locator(".demo-stage").screenshot({
    path: `artifacts/${test.info().project.name}/surface-input.png`,
  });
  await input.focus();
  await expect(input).toHaveCSS("outline-color", "rgb(255, 201, 40)");
  await expect(input).toHaveCSS("border-color", "rgb(98, 98, 105)");
  await expect(input).toHaveCSS("outline-offset", "0px");
  await expect(input).toHaveCSS("box-shadow", "none");
  await page.screenshot({
    path: `artifacts/${test.info().project.name}/surface-input-focus.png`,
  });
  await page.keyboard.press("Tab");
  await expect(input).toHaveCSS("box-shadow", "none");
  await expect(input).toHaveCSS("outline-style", "none");
});

test("data table uses quiet row separators and a borderless outer surface", async ({
  page,
}) => {
  await page.goto("/#/components/data-table");
  await expect(
    page.getByRole("cell", { name: "김하늘 01", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".cheese-table-scroll")).toHaveCSS(
    "border-width",
    "0px",
  );
  const cell = page.getByRole("cell", { name: "김하늘 01", exact: true });
  await expect(cell).toHaveCSS("border-bottom-color", "rgb(238, 238, 241)");
  await cell.hover();
  await expect(cell).toHaveCSS("background-color", "rgb(250, 250, 251)");
  await page.mouse.move(0, 0);
  await page.locator(".demo-stage").screenshot({
    path: `artifacts/${test.info().project.name}/surface-data-table.png`,
  });
});

test("selected checkbox and date retain shape cues without dark perimeter borders", async ({
  page,
}) => {
  await page.goto("/#/components/checkbox");
  const check = page.getByRole("checkbox", { name: "평가 결과 알림 받기" });
  await check.check();
  await expect(check).toHaveCSS("border-color", "rgba(0, 0, 0, 0)");
  await expect(check).toHaveCSS("background-color", "rgb(255, 201, 40)");
  await expect(check.locator("svg.cheese-checkbox-check")).toBeVisible();
  await page.goto("/#/components/calendar");
  await page.locator(".rdp-day_button").filter({ hasText: /^5$/ }).click();
  const selected = page.locator(".rdp-selected .rdp-day_button");
  await expect(selected).toHaveCSS("border-color", "rgba(0, 0, 0, 0)");
  await expect(selected).toHaveCSS("text-decoration-line", "underline");
  await page.keyboard.press("Tab");
  await page.locator(".demo-stage").screenshot({
    path: `artifacts/${test.info().project.name}/surface-calendar.png`,
  });
});

test("dialog depth and select surfaces remain interactive and accessible", async ({
  page,
}) => {
  await page.goto("/#/components/dialog");
  await page.getByRole("button", { name: "평가 만들기", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toHaveCSS("opacity", "1");
  await expect(page.locator(".cheese-overlay")).toHaveCSS("opacity", "1");
  await expect(dialog).toHaveCSS("border-color", "rgba(0, 0, 0, 0)");
  await expect(dialog).toHaveCSS("border-radius", "20px");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await dialog.screenshot({
    path: `artifacts/${test.info().project.name}/surface-dialog.png`,
  });
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await page.goto("/#/components/select");
  await page.getByRole("combobox", { name: "담당 조직", exact: true }).click();
  await expect(page.locator(".cheese-select-content")).toHaveCSS(
    "border-color",
    "rgb(238, 238, 241)",
  );
  await page.getByRole("option", { name: /개발팀/ }).click();
  await expect(
    page.getByRole("combobox", { name: "담당 조직", exact: true }),
  ).toContainText("개발팀");
});

for (const framework of ["react", "vue"]) {
  test(
    framework + " consumes surface tokens outside the documentation site",
    async ({ page }) => {
      await page.goto("/tests/fixtures/business.html?framework=" + framework);
      const input = page.locator(".cheese-input").first();
      await expect(input).toHaveCSS("background-color", "rgb(255, 255, 255)");
      await expect(input).toHaveCSS("box-shadow", "none");
      await expect(input).toHaveCSS("border-color", "rgb(206, 206, 206)");
      await expect(input).toHaveCSS("border-radius", "10px");
      // Theme overrides flow through the token, without adding a component selector.
      await page.addStyleTag({
        content:
          ":root { --cheese-control-bg: #eeeeee; --cheese-radius-control: 14px; }",
      });
      await expect(input).toHaveCSS("background-color", "rgb(238, 238, 238)");
      await expect(input).toHaveCSS("border-radius", "14px");
    },
  );
}

test("entry controls share white surfaces and restrained rest and hover boundaries", async ({
  page,
}) => {
  const controls = [
    ["textarea", ".cheese-textarea"],
    ["select", ".cheese-select-trigger"],
    ["select-form", ".cheese-select-trigger"],
    ["combobox", ".cheese-input"],
    ["async-combobox", ".cheese-input"],
    ["multi-select", ".cheese-input"],
    ["date-picker", ".cheese-date-trigger"],
    ["tags-input", ".cheese-tags"],
  ];
  for (const [route, selector] of controls) {
    await page.goto("/#/components/" + route);
    const inputs = page.locator(".demo-stage").locator(selector);
    await expect(inputs.first()).toBeVisible();
    for (const input of await inputs.all()) {
      await page.mouse.move(0, 0);
      await expect(input).toHaveCSS("background-color", "rgb(255, 255, 255)");
      await expect(input).toHaveCSS("box-shadow", "none");
      const inactive = await input.evaluate((el) =>
        el.matches(
          ":disabled, [readonly], [data-disabled], [aria-disabled='true']",
        ),
      );
      await expect(input).toHaveCSS(
        "border-color",
        inactive ? "rgb(229, 229, 234)" : "rgb(206, 206, 206)",
      );
      await input.hover();
      await expect(input).toHaveCSS("box-shadow", "none");
      await expect(input).toHaveCSS("background-color", "rgb(255, 255, 255)");
      await expect(input).toHaveCSS(
        "border-color",
        inactive ? "rgb(229, 229, 234)" : "rgb(187, 187, 187)",
      );
    }
  }
});

for (const framework of ["react", "vue"]) {
  test(`${framework} styled select keeps its icon and uses an in-page option popup`, async ({
    page,
  }) => {
    await page.goto(
      framework === "react" ? "/#/components/select-form" : "/vue.html",
    );
    const select = page.getByRole("combobox", {
      name: framework === "react" ? "담당 조직" : "조직",
      exact: true,
    });
    await expect(select).toBeVisible();
    await expect(select).toHaveJSProperty("tagName", "BUTTON");
    await expect(select.locator("svg")).toBeVisible();
    await select.focus();
    await select.hover();
    await expect(select.locator("svg")).toBeVisible();
    await expect(select).toHaveCSS("border-color", "rgb(98, 98, 105)");
    await expect(select).toHaveCSS("box-shadow", "none");
    await expect(select).toHaveCSS("outline-offset", "0px");
    await select.click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.getByRole("option", { name: "개발팀", exact: true }).click();
    await expect(select).toContainText("개발팀");
    await expect(select.locator("svg")).toBeVisible();
    await expect(select).toHaveCSS("background-color", "rgb(255, 255, 255)");
  });
}

test("input focus and hover do not resize fields; tags use one outer focus edge", async ({
  page,
}) => {
  await page.goto("/#/components/input");
  const input = page.getByRole("textbox", { name: "이름", exact: true });
  const rest = await input.boundingBox();
  await input.hover();
  await input.focus();
  expect(await input.boundingBox()).toEqual(rest);
  await expect(input).toHaveCSS("border-color", "rgb(98, 98, 105)");
  await page.goto("/#/components/tags-input");
  const tags = page.locator(".cheese-tags:not([data-disabled])");
  const entry = tags.getByRole("textbox", { name: "프로젝트 태그" });
  await entry.focus();
  await tags.hover();
  await expect(tags).toHaveCSS("outline-color", "rgb(255, 201, 40)");
  await expect(tags).toHaveCSS("border-color", "rgb(98, 98, 105)");
  await expect(tags).toHaveCSS("box-shadow", "none");
  await expect(entry).toHaveCSS("outline-style", "none");
  await expect(entry).toHaveCSS("box-shadow", "none");
});

test("navigation hover is distinct from its container and custom class order respects reduced motion", async ({
  page,
}) => {
  await page.goto("/#/components/navigation-menu");
  const menu = page.getByRole("button", { name: "평가 관리", exact: true });
  await menu.hover();
  await expect(menu).toHaveCSS("background-color", "rgb(238, 238, 241)");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#/components/input");
  const input = page.getByRole("textbox", { name: "이름", exact: true });
  await input.evaluate((el) => {
    document
      .querySelectorAll(".cheese-root")
      .forEach((root) => root.classList.remove("cheese-root"));
    el.className = "consumer-field " + el.className;
  });
  const durations = await input.evaluate(
    (el) => getComputedStyle(el).transitionDuration,
  );
  expect(
    durations.split(",").every((value) => parseFloat(value) <= 0.00001),
  ).toBe(true);
});

test("stronger contrast and forced colors preserve entry and focus boundaries", async ({
  page,
}) => {
  await page.emulateMedia({ contrast: "more" });
  await page.goto("/#/components/input");
  const input = page.getByRole("textbox", { name: "이름", exact: true });
  await expect(input).toHaveCSS("border-color", "rgb(98, 98, 105)");
  await expect(input).toHaveCSS("box-shadow", "none");
  await page.emulateMedia({ forcedColors: "active" });
  await expect(input).toHaveCSS("border-width", "1px");
  await expect(input).toHaveCSS("box-shadow", "none");
  expect(
    await input.evaluate((el) => getComputedStyle(el).borderTopColor),
  ).not.toBe("rgba(0, 0, 0, 0)");
  await input.focus();
  await expect(input).toHaveCSS("outline-width", "2px");
  await page.screenshot({
    path: `artifacts/${test.info().project.name}/surface-forced-colors.png`,
  });
});

test("error text and aria survive focus without stacked shadows or bottom strokes", async ({
  page,
}) => {
  await page.goto("/#/components/field");
  await page.getByRole("button", { name: "입력값 검증" }).click();
  const input = page.getByRole("textbox", { name: "회사 이메일" });
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await input.focus();
  await expect(input).toHaveCSS("border-color", "rgb(98, 98, 105)");
  await expect(input).toHaveCSS("box-shadow", "none");
  await expect(input).toHaveCSS("border-width", "1px");
  await expect(input).toHaveCSS("outline-color", "rgb(255, 201, 40)");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("all catalog examples keep their layout at 320px and 390px widths", async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const names = readdirSync("site/examples").filter((name) =>
    name.endsWith(".tsx"),
  );
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    for (const name of names) {
      await page.goto("/#/components/" + name.slice(0, -4));
      await expect(page.locator(".demo-stage")).toBeVisible();
      await expect(page.locator("[data-example-loading]")).toHaveCount(0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${name} at ${width}px`,
      ).toBe(true);
    }
  }
});
