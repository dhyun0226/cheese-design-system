import { test, expect } from "@playwright/test";
test("composed card popup, empty state and context menu work without DOM patches", async ({
  page,
}) => {
  await page.goto("/#/components/card");
  await page.getByRole("button", { name: "평가 안내 확인" }).click();
  await expect(
    page.getByRole("dialog", { name: "평가 안내", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "확인", exact: true })
    .click();
  await page.goto("/#/components/empty-state");
  await page.getByRole("button", { name: "필터 초기화" }).click();
  await expect(page.getByRole("button", { name: "초기화 완료" })).toBeVisible();
  await page.goto("/#/components/context-menu");
  await page.locator(".demo-stage .cheese-card").focus();
  await page.keyboard.press("Shift+F10");
  await expect(page.getByRole("menu")).toBeVisible();
  await page.getByRole("menuitem", { name: "복사", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("선택: 복사");
});
