import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readdirSync } from "node:fs";
const names = readdirSync("site/examples")
  .filter((n) => n.endsWith(".tsx"))
  .map((n) => n.slice(0, -4));
for (const name of names)
  test("catalog / " + name, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/#/components/" + name);
    await expect(page.locator(".demo-stage")).toBeVisible();
    await expect(page.locator("[data-example-loading]")).toHaveCount(0);
    await expect(page.locator("h1")).not.toBeEmpty();
    expect(errors).toEqual([]);
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  });
test("navigation, search, history and executable source", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "컴포넌트 둘러보기" }).click();
  await expect(page).toHaveURL(/#\/components$/);
  await page
    .getByRole("link", { name: "Tree 실행 예제", exact: false })
    .click();
  await expect(page.locator("h1")).toHaveText("Tree");
  await page.goBack();
  await expect(page.locator("h1")).toHaveText("컴포넌트");
  await page
    .locator(".site-sidebar")
    .getByRole("textbox", { name: "컴포넌트 검색" })
    .fill("Dialog");
  await page
    .locator(".site-sidebar")
    .getByRole("link", { name: "Dialog", exact: true })
    .click();
  await expect(page.locator("h1")).toHaveText("Dialog");
  await page.getByRole("tab", { name: "코드", exact: true }).click();
  await expect(page.locator("pre")).toContainText("@cheese/react");
});
test("dialog traps focus, closes and restores trigger", async ({ page }) => {
  await page.goto("/#/components/dialog");
  await page.getByRole("button", { name: "평가 만들기", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "새 평가", exact: true });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("textbox", { name: "평가 이름" }),
  ).toBeFocused();
  // WebKit on Linux can finish autofocus before the 160ms opacity animation.
  // Measure the settled foreground/background, not a transient composited frame.
  await expect(dialog).toHaveCSS("opacity", "1");
  await expect(page.locator(".cheese-overlay")).toHaveCSS("opacity", "1");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  await page.keyboard.press("Shift+Tab");
  await expect(
    dialog.getByRole("button", { name: "완료", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("textbox")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "평가 만들기", exact: true }),
  ).toBeFocused();
});
test("alert dialog focuses cancel and executes explicit action", async ({
  page,
}) => {
  await page.goto("/#/components/alert-dialog");
  await page.getByRole("button", { name: "평가 삭제", exact: true }).click();
  const dialog = page.getByRole("alertdialog");
  await expect(
    dialog.getByRole("button", { name: "취소", exact: true }),
  ).toBeFocused();
  await page.mouse.click(5, 100);
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "삭제", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText(
    "예제 평가가 삭제되었습니다.",
  );
});
test("form connects errors and clears errors on input", async ({ page }) => {
  await page.goto("/#/components/field");
  const email = page.getByRole("textbox", { name: "회사 이메일" });
  await page.getByRole("button", { name: "입력값 검증" }).click();
  await expect(email).toHaveAttribute("aria-invalid", "true");
  const id = await email.getAttribute("aria-describedby");
  await expect(page.locator('[id="' + id + '"]')).toContainText(
    "올바른 이메일",
  );
  await email.fill("cheese@example.test");
  await expect(email).not.toHaveAttribute("aria-invalid", "true");
  await page.getByRole("button", { name: "입력값 검증" }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
});
test("checkbox switch and native form controls are interactive", async ({
  page,
}) => {
  await page.goto("/#/components/checkbox");
  const check = page.getByRole("checkbox", { name: "평가 결과 알림 받기" });
  await check.focus();
  await page.keyboard.press("Space");
  await expect(check).toBeChecked();
  await page.goto("/#/components/switch");
  await page.getByRole("switch", { name: "이메일 알림" }).click();
  await expect(page.getByRole("status")).toHaveText("이메일 알림을 받습니다.");
});
test("tree has one tab stop, full keyboard navigation and correct hierarchy", async ({
  page,
}) => {
  await page.goto("/#/components/tree");
  const tree = page.getByRole("tree", { name: "조직 탐색" }),
    root = tree.getByRole("treeitem", { name: "CHEESE Studio", exact: true });
  await expect(tree.locator('[tabindex="0"]')).toHaveCount(1);
  await root.focus();
  await page.keyboard.press("ArrowRight");
  const people = tree.getByRole("treeitem", { name: "피플팀", exact: true });
  await expect(people).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(people).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("ArrowRight");
  const ops = tree.getByRole("treeitem", { name: "인사 운영", exact: true });
  await expect(ops).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(ops).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowLeft");
  await expect(people).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(people).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("End");
  await expect(
    tree.getByRole("treeitem", { name: "개발팀", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Home");
  await expect(root).toBeFocused();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("menu keyboard selection and tabs", async ({ page }) => {
  await page.goto("/#/components/dropdown-menu");
  await page.getByRole("button", { name: "평가 작업" }).focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).not.toHaveText(
    "선택한 작업: 선택 없음",
  );
  await page.goto("/#/components/tabs");
  const overview = page.getByRole("tab", { name: "개요", exact: true });
  await overview.focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tabpanel", { name: "대상자", exact: true }),
  ).toBeVisible();
});
test("pattern validates and changes real demo state", async ({ page }) => {
  await page.goto("/#/patterns");
  await page.getByRole("button", { name: "설정 저장", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "평가 이름" })).toBeFocused();
  await page.getByRole("textbox", { name: "평가 이름" }).fill("테스트 평가");
  await page.getByRole("button", { name: "설정 저장", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "예제 설정이 저장되었습니다.",
  );
  await page.getByRole("button", { name: "검토하기" }).click();
  await page.getByRole("button", { name: "예제 제출", exact: true }).click();
  await expect(page.locator(".product-progress")).toContainText("79%");
});
test("Vue package models, errors, switch, tabs, dialog and tree", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/vue.html");
  await page.getByRole("button", { name: "폼 검증" }).click();
  await expect(
    page.getByRole("textbox", { name: "이름", exact: true }),
  ).toHaveAttribute("aria-invalid", "true");
  await page.getByRole("textbox", { name: "이름", exact: true }).fill("치즈");
  await page
    .getByRole("combobox", { name: "조직", exact: true })
    .selectOption("tech");
  await page.getByRole("textbox", { name: "메모" }).fill("Vue 메모");
  await expect(
    page.getByText("입력값: 치즈 / tech / Vue 메모", { exact: true }),
  ).toBeVisible();
  await page.getByRole("checkbox", { name: "결과 알림 받기" }).click();
  await expect(page.getByRole("checkbox")).toBeChecked();
  await page.getByRole("switch", { name: "이메일 알림" }).click();
  await expect(page.getByRole("switch")).toBeChecked();
  await page.getByRole("tab", { name: "보안", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toHaveText("보안 설정입니다.");
  await page.getByRole("button", { name: "설정 열기" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "설정 열기" })).toBeFocused();
  const root = page.getByRole("treeitem", {
    name: "CHEESE Studio",
    exact: true,
  });
  await root.focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("treeitem", { name: "피플팀", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("treeitem", { name: "인사 운영", exact: true }),
  ).toBeFocused();
  expect(errors).toEqual([]);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("responsive visual checks and local fonts", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".product-preview")).toBeVisible();
  const fonts = await page
    .locator(".cheese-button")
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).fontFamily));
  expect(fonts.every((f) => f.includes("Pretendard"))).toBeTruthy();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: `artifacts/${test.info().project.name}/home-desktop.png`,
    fullPage: true,
  });
  await page.goto("/#/components/dialog");
  await expect(
    page.getByRole("button", { name: "평가 만들기", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: `artifacts/${test.info().project.name}/component-desktop.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "평가 만들기", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "새 평가", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: `artifacts/${test.info().project.name}/dialog-open.png`,
    fullPage: false,
  });
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.getByRole("button", { name: "메뉴 열기" }).click();
  const menu = page.getByRole("dialog");
  await expect(menu).toBeVisible();
  await menu.getByRole("link", { name: "업무 화면 예제", exact: true }).click();
  await expect(menu).not.toBeVisible();
  await expect(page.locator("h1")).toContainText("작은 부품에서");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: `artifacts/${test.info().project.name}/pattern-mobile.png`,
    fullPage: true,
  });
});
