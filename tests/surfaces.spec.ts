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
  await expect(input).toHaveCSS("border-color", "rgba(0, 0, 0, 0)");
  await expect(input).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(input).toHaveCSS("box-shadow", "none");
  await input.hover();
  await expect(input).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(input).toHaveCSS("box-shadow", "none");
  await expect(input).toHaveCSS("border-color", "rgba(0, 0, 0, 0)");
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
    path: `artifacts/${test.info().project.name}/borderless-input.png`,
  });
  await input.focus();
  await expect(input).toHaveCSS("outline-color", "rgb(255, 201, 40)");
  await expect(input).toHaveCSS(
    "box-shadow",
    "rgb(98, 98, 105) 0px 0px 0px 1px",
  );
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
      await expect(input).toHaveCSS("border-color", "rgba(0, 0, 0, 0)");
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

test("entry controls share white borderless rest and hover states", async ({
  page,
}) => {
  const controls = [
    ["textarea", ".cheese-textarea"],
    ["select", ".cheese-select-trigger"],
    ["native-select", ".cheese-select"],
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
      await expect(input).toHaveCSS("background-color", "rgb(255, 255, 255)");
      await expect(input).toHaveCSS("box-shadow", "none");
      await expect(input).toHaveCSS("border-color", "rgba(0, 0, 0, 0)");
      await input.hover();
      await expect(input).toHaveCSS("box-shadow", "none");
      await expect(input).toHaveCSS("background-color", "rgb(255, 255, 255)");
    }
  }
});

test("stronger contrast and forced colors preserve entry and focus boundaries", async ({
  page,
}) => {
  await page.emulateMedia({ contrast: "more" });
  await page.goto("/#/components/input");
  const input = page.getByRole("textbox", { name: "이름", exact: true });
  await expect(input).toHaveCSS(
    "box-shadow",
    "rgb(98, 98, 105) 0px 0px 0px 1px inset",
  );
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

test("error cues survive focus without adding a dark surrounding box", async ({
  page,
}) => {
  await page.goto("/#/components/field");
  await page.getByRole("button", { name: "입력값 검증" }).click();
  const input = page.getByRole("textbox", { name: "회사 이메일" });
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await input.focus();
  await expect(input).toHaveCSS("border-color", "rgba(0, 0, 0, 0)");
  await expect(input).toHaveCSS("box-shadow", /0px -2px/);
  await expect(input).toHaveCSS("outline-color", "rgb(255, 201, 40)");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("all catalog examples keep their layout at mobile width", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const names = readdirSync("site/examples").filter((name) =>
    name.endsWith(".tsx"),
  );
  for (const name of names) {
    await page.goto("/#/components/" + name.slice(0, -4));
    await expect(page.locator(".demo-stage")).toBeVisible();
    await expect(page.locator("[data-example-loading]")).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      name,
    ).toBe(true);
  }
});
