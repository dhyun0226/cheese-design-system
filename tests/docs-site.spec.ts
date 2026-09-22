import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("home task demo creates the entered task and resets at desktop and mobile widths", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1440, 900, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const demo = page.locator(".hero-playground");
    await expect(demo).toBeVisible();
    await expect(page.locator(".origin-illustration")).toHaveCount(0);
    const title = demo.getByRole("textbox", { name: "업무 이름" });
    await expect(title).not.toBeFocused();
    await title.fill("온보딩 가이드 검토");
    const assignee = demo.getByRole("combobox", {
      name: "담당자",
      exact: true,
    });
    await assignee.click();
    await page
      .getByRole("option", { name: "박하린 · 디자인팀", exact: true })
      .click();
    await demo
      .getByRole("button", { name: "업무 만들기", exact: true })
      .click();
    const result = demo.getByRole("heading", {
      name: "온보딩 가이드 검토",
      exact: true,
    });
    await expect(result).toBeVisible();
    await expect(result).toBeFocused();
    await expect(demo.locator(".hero-task-person")).toContainText("박하린");
    await expect(demo.locator(".hero-task-person")).toContainText("디자인팀");
    await expect(demo.locator(".hero-task-result")).toHaveCSS(
      "animation-name",
      "none",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await demo
      .getByRole("button", { name: "다시 만들어 보기", exact: true })
      .click();
    await expect(title).toBeFocused();
    await expect(title).toHaveValue("신규 입사자 온보딩 준비");
    await expect(assignee).toHaveText("김치즈 · 피플팀");
    await expect(demo.locator(".hero-task-result")).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("home task demo validates blank input, supports keyboard selection and keeps long text within its card", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/");
  const demo = page.locator(".hero-playground");
  const title = demo.getByRole("textbox", { name: "업무 이름" });
  await title.fill("   ");
  await title.press("Enter");
  await expect(title).toBeFocused();
  await expect(title).toHaveAttribute("aria-invalid", "true");
  await expect(demo.getByRole("alert")).toHaveText(
    "업무 이름을 입력해 주세요.",
  );
  await expect(demo.locator(".hero-task-result")).toHaveCount(0);
  const taskTitle = "온보딩가이드검토".repeat(8);
  await title.fill(taskTitle);
  await expect(title).not.toHaveAttribute("aria-invalid", "true");
  await expect(demo.getByRole("alert")).toHaveCount(0);
  const assignee = demo.getByRole("combobox", { name: "담당자", exact: true });
  await assignee.focus();
  await assignee.press("ArrowDown");
  await page
    .getByRole("option", { name: "김치즈 · 피플팀", exact: true })
    .press("ArrowDown");
  await page
    .getByRole("option", { name: "이서준 · 개발팀", exact: true })
    .press("Enter");
  await demo
    .getByRole("button", { name: "업무 만들기", exact: true })
    .press("Enter");
  await expect(
    demo.getByRole("heading", { name: taskTitle, exact: true }),
  ).toBeFocused();
  await expect(demo.locator(".hero-task-person")).toContainText("이서준");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("home task demo stays accessible before and after its one-time result transition", async ({
  page,
}) => {
  await page.goto("/");
  const demo = page.locator(".hero-playground");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await demo.getByRole("button", { name: "업무 만들기", exact: true }).click();
  const result = demo.locator(".hero-task-result");
  await expect(result).toHaveCSS("animation-name", "cheese-task-created");
  await expect(result).toHaveCSS("animation-iteration-count", "1");
  await expect(result).toHaveCSS("opacity", "1");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await demo
    .getByRole("button", { name: "다시 만들어 보기", exact: true })
    .click();
  await page.reload();
  await expect(demo.getByRole("textbox", { name: "업무 이름" })).toHaveValue(
    "신규 입사자 온보딩 준비",
  );
});

test("home guides visitors into the docs and its evaluation example updates after submission", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .locator(".home-hero")
    .getByRole("link", { name: "시작하기", exact: true })
    .click();
  await expect(page).toHaveURL(/#\/getting-started$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "작게 시작하세요.",
  );
  await page.getByRole("link", { name: "CHEESE 홈", exact: true }).click();
  await expect(page).toHaveURL(/#\/$/);
  await expect(page.locator(".home-hero")).toBeVisible();

  const showcase = page.locator(".home-showcase");
  const showcaseBox = await showcase.boundingBox();
  const componentsBox = await page.locator(".explore-grid").boundingBox();
  expect(showcaseBox!.y).toBeLessThan(componentsBox!.y);
  const progress = showcase.getByRole("progressbar", {
    name: "팀 평가 진행률",
  });
  const submitted = showcase
    .locator(".product-stats > div")
    .filter({ hasText: "제출 완료" })
    .locator("strong");
  await expect(progress).toHaveAttribute("aria-valuenow", "75");
  await expect(submitted).toHaveText(/^18\s*명$/);
  await showcase.getByRole("button", { name: "검토하기", exact: true }).click();
  const dialog = page.getByRole("dialog", {
    name: "평가 제출 전 확인",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "예제 제출", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(progress).toHaveAttribute("aria-valuenow", "79");
  await expect(submitted).toHaveText(/^19\s*명$/);
  await expect(showcase.locator(".product-task")).toContainText(
    "검토가 완료되었습니다.",
  );
  await expect(
    showcase.getByRole("button", { name: "다시 보기", exact: true }),
  ).toBeVisible();
});

test("component navigation keeps the title, selection and section links in sync", async ({
  page,
}) => {
  await page.goto("/#/components/native-select");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Select Form",
  );
  const sidebar = page.getByRole("complementary", { name: "문서 사이드바" });
  await expect(sidebar.locator('a[aria-current="page"]')).toHaveText(
    "Select Form",
  );
  await sidebar.getByRole("textbox", { name: "컴포넌트 검색" }).fill("Toolbar");
  await sidebar.getByRole("link", { name: "Toolbar", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Toolbar");
  await expect(sidebar.locator('a[aria-current="page"]')).toHaveText("Toolbar");
  await expect(
    page
      .getByRole("navigation", { name: "주요 문서" })
      .locator('a[aria-current="page"]'),
  ).toHaveText("컴포넌트");
  await page
    .getByRole("navigation", { name: "이 페이지에서" })
    .getByRole("link", { name: "주요 API" })
    .click();
  await expect(
    page.getByRole("heading", { name: "주요 API", exact: true }),
  ).toBeFocused();
  await expect(page).toHaveURL(/#\/components\/toolbar$/);
  await page.getByRole("tab", { name: "코드", exact: true }).click();
  await expect(page.locator(".code-block code")).toContainText("@cheese/react");
  await expect(
    page.getByRole("button", { name: "복사", exact: true }),
  ).toBeVisible();
});

test("mobile documentation search navigates and closes the drawer", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  await expect(page.locator(".origin-story")).toContainText(
    "문을 열고 나와 보니",
  );
  await expect(page.locator(".origin-story")).toContainText("개인 프로젝트");
  await page.getByRole("button", { name: "메뉴 열기" }).click();
  const drawer = page.getByRole("dialog", { name: "문서 탐색" });
  await drawer
    .getByRole("textbox", { name: "컴포넌트 검색" })
    .fill("Pagination");
  await drawer.getByRole("link", { name: "Pagination", exact: true }).click();
  await expect(drawer).not.toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Pagination",
  );
  await expect(page.locator(".demo-stage")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
});

test("the active component scrolls inside the desktop sidebar without moving the page", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto("/#/components/time-field");
  const sidebar = page.getByRole("complementary", { name: "문서 사이드바" });
  const current = sidebar.locator('a[aria-current="page"]');
  await expect(current).toHaveText("Time Field");
  await expect
    .poll(() =>
      sidebar.evaluate((element) => {
        const selected = element.querySelector('a[aria-current="page"]');
        if (!selected) return false;
        const viewport = element.getBoundingClientRect();
        const item = selected.getBoundingClientRect();
        return (
          element.scrollTop > 0 &&
          item.top >= viewport.top &&
          item.bottom <= viewport.bottom
        );
      }),
    )
    .toBe(true);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.evaluate(() => {
    location.hash = "/components/button";
  });
  await expect(current).toHaveText("Button");
  await expect
    .poll(() =>
      sidebar.evaluate((element) => {
        const selected = element.querySelector('a[aria-current="page"]');
        if (!selected) return false;
        const viewport = element.getBoundingClientRect();
        const item = selected.getBoundingClientRect();
        return item.top >= viewport.top && item.bottom <= viewport.bottom;
      }),
    )
    .toBe(true);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});
