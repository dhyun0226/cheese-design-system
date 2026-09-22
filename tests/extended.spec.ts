import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("calendar date selection, restriction, range and popup", async ({
  page,
}) => {
  await page.goto("/#/components/calendar");
  await expect(page.locator(".cheese-calendar")).toBeVisible();
  const fifth = page.locator('.rdp-day[data-day="2026-10-05"] button');
  await fifth.click();
  await expect(page.locator(".rdp-footer")).toContainText("2026-10-05");
  await fifth.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(page.locator(".rdp-footer")).toContainText("2026-10-06");
  await expect(
    page.locator('.rdp-day[data-day="2026-10-04"] button'),
  ).toBeDisabled();
  await page.goto("/#/components/range-calendar");
  await page.locator('.rdp-day[data-day="2026-10-12"] button').click();
  await page.locator('.rdp-day[data-day="2026-10-16"] button').click();
  await expect(page.locator(".rdp-footer")).toContainText(
    "2026-10-12 ~ 2026-10-16",
  );
  await page.goto("/#/components/date-picker");
  await page.getByRole("button", { name: "평가 마감일 날짜 선택" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.locator('.rdp-day[data-day="2026-10-14"] button').click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByRole("status")).toHaveText("선택: 2026-10-14");
  await expect(
    page.getByRole("button", { name: "평가 마감일 2026-10-14" }),
  ).toBeFocused();
});
test("Vue calendar changes model with mouse and keyboard", async ({ page }) => {
  await page.goto("/vue.html");
  const cal = page.locator(".cheese-calendar");
  await cal.locator('[data-value="2026-10-14"]').click();
  await expect(
    page.getByText("날짜: 2026-10-14", { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(
    page.getByText("날짜: 2026-10-15", { exact: true }),
  ).toBeVisible();
});
test("other interactions: accordion, slider, tooltip, toast and pagination", async ({
  page,
}) => {
  await page.goto("/#/components/accordion");
  await page.getByRole("button", { name: "평가 마감일은 언제인가요?" }).click();
  await expect(
    page.getByText("10월 30일 오후 6시까지 제출해 주세요.", { exact: true }),
  ).toBeVisible();
  await page.goto("/#/components/slider");
  await page.getByRole("slider").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("slider")).toHaveAttribute("aria-valuenow", "65");
  await page.goto("/#/components/tooltip");
  await page.getByRole("button", { name: "마감 정책 안내" }).focus();
  await expect(page.getByRole("tooltip")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).not.toBeVisible();
  await page.goto("/#/components/toast");
  await page.getByRole("button", { name: "알림 표시", exact: true }).click();
  await expect(page.locator(".cheese-toast-title")).toHaveText(
    "저장되었습니다.",
  );
  await page
    .locator(".cheese-toast")
    .getByRole("button", { name: "닫기" })
    .click();
  await expect(page.locator(".cheese-toast")).not.toBeVisible();
  await page.goto("/#/components/pagination");
  await page.getByRole("button", { name: "다음 페이지", exact: true }).click();
  await expect(
    page.getByRole("navigation", { name: "페이지 탐색" }),
  ).toContainText("2 / 20");
});
test("all documentation routes and small screen dialog are usable", async ({
  page,
}) => {
  test.setTimeout(90000); // Five full-page axe scans, including slower browser engines.
  for (const route of [
    "components",
    "getting-started",
    "foundations",
    "patterns",
    "readiness",
  ]) {
    await page.goto("/#/" + route);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      (await new AxeBuilder({ page }).analyze()).violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  }
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/#/components/dialog");
  await page.getByRole("button", { name: "평가 만들기", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "새 평가" });
  await expect(dialog).toBeVisible();
  const bounds = await dialog.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(360);
  await page.screenshot({
    path: `artifacts/${test.info().project.name}/dialog-mobile.png`,
    fullPage: false,
  });
});
