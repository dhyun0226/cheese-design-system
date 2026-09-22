import { test, expect, type Locator } from "@playwright/test";

async function expectCopyAndCloseAligned(toast: Locator) {
  const title = (await toast.locator(".cheese-toast-title").boundingBox())!;
  const close = (await toast
    .getByRole("button", { name: "닫기", exact: true })
    .boundingBox())!;
  const box = (await toast.boundingBox())!;
  expect(Math.abs(close.y - title.y)).toBeLessThanOrEqual(1);
  expect(close.x).toBeGreaterThanOrEqual(title.x + title.width + 8);
  expect(close.x + close.width).toBeLessThanOrEqual(box.x + box.width - 12);
  expect(close.width).toBe(32);
  expect(close.height).toBe(32);
  await expect(toast.locator(".cheese-toast-close svg")).toHaveCount(1);
  const description = toast.locator(".cheese-toast-description");
  if (await description.count()) {
    const copy = (await description.boundingBox())!;
    expect(copy.x).toBeCloseTo(title.x, 1);
    expect(copy.y).toBeGreaterThanOrEqual(title.y + title.height);
    expect(copy.x + copy.width).toBeLessThanOrEqual(close.x - 8);
    expect(
      await description.evaluate((node) => node.scrollWidth - node.clientWidth),
    ).toBeLessThanOrEqual(1);
  }
}

for (const framework of ["react", "vue"]) {
  test.describe(`${framework} Toast layout`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(
        `/tests/fixtures/toast-layout.html?framework=${framework}`,
      );
      await page.evaluate(() => document.fonts.ready);
    });

    test("close stays at the top right and stacked notifications dismiss independently", async ({
      page,
    }) => {
      await page
        .getByRole("button", { name: "알림 표시", exact: true })
        .click();
      await page
        .getByRole("button", { name: "긴 알림 표시", exact: true })
        .click();
      const first = page.getByTestId("toast-1");
      const second = page.getByTestId("toast-2");
      await expect(page.locator(".cheese-toast")).toHaveCount(2);
      await expectCopyAndCloseAligned(first);
      await expectCopyAndCloseAligned(second);
      const firstBox = (await first.boundingBox())!;
      const secondBox = (await second.boundingBox())!;
      const upper = firstBox.y < secondBox.y ? firstBox : secondBox;
      const lower = firstBox.y < secondBox.y ? secondBox : firstBox;
      expect(lower.y - upper.y - upper.height).toBeGreaterThanOrEqual(8);
      expect(secondBox.x + secondBox.width).toBeLessThanOrEqual(1440 - 24);
      expect(secondBox.y + secondBox.height).toBeLessThanOrEqual(1000 - 24);
      await expect(page.locator(".cheese-toast-viewport")).toHaveClass(
        /consumer-viewport/,
      );
      await expect(first).toHaveClass(/consumer-toast/);
      if (framework === "vue")
        await expect(second.locator(".cheese-toast-close")).toHaveAttribute(
          "data-composition",
          "as-child",
        );
      await first.getByRole("button", { name: "닫기", exact: true }).click();
      await expect(first).toHaveCount(0);
      await expect(second).toBeVisible();
      await second.getByRole("button", { name: "닫기", exact: true }).focus();
      await page.keyboard.press("Enter");
      await expect(page.locator(".cheese-toast")).toHaveCount(0);
    });

    test("long content fits a narrow screen and viewport gaps leave the page clickable", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 740 });
      await page
        .getByRole("button", { name: "알림 표시", exact: true })
        .click();
      await page
        .getByRole("button", { name: "긴 알림 표시", exact: true })
        .click();
      const toasts = page.locator(".cheese-toast");
      await expect(toasts).toHaveCount(2);
      for (const toast of await toasts.all()) {
        await expectCopyAndCloseAligned(toast);
        const box = (await toast.boundingBox())!;
        expect(box.x).toBeGreaterThanOrEqual(16);
        expect(box.x + box.width).toBeLessThanOrEqual(320 - 16);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.y + box.height).toBeLessThanOrEqual(740 - 16);
      }
      const longCopy = page
        .getByTestId("toast-2")
        .locator(".cheese-toast-description");
      const lineHeight = await longCopy.evaluate((node) =>
        parseFloat(getComputedStyle(node).lineHeight),
      );
      expect((await longCopy.boundingBox())!.height).toBeGreaterThan(
        lineHeight * 3,
      );
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(320);
      await page
        .getByRole("button", { name: "배경 버튼", exact: true })
        .click();
      await expect(page.getByTestId("background-count")).toHaveText("1");
      const gapPassesThrough = await toasts.evaluateAll((nodes) => {
        const boxes = nodes
          .map((node) => node.getBoundingClientRect())
          .sort((a, b) => a.top - b.top);
        const target = document.elementFromPoint(
          boxes[0].left + 24,
          (boxes[0].bottom + boxes[1].top) / 2,
        );
        return !target?.closest(".cheese-toast-viewport");
      });
      expect(gapPassesThrough).toBe(true);
      await page.locator(".cheese-toast-viewport").screenshot({
        path: `artifacts/${test.info().project.name}/${framework}-toast-mobile.png`,
      });
    });

    test("title-only notifications stay compact and body actions retain button layout", async ({
      page,
    }) => {
      await page
        .getByRole("button", { name: "제목만 표시", exact: true })
        .click();
      const titleOnly = page.getByTestId("toast-1");
      await expectCopyAndCloseAligned(titleOnly);
      expect((await titleOnly.boundingBox())!.height).toBeLessThanOrEqual(70);
      await titleOnly
        .getByRole("button", { name: "닫기", exact: true })
        .click();
      await page
        .getByRole("button", { name: "작업 알림 표시", exact: true })
        .click();
      const toast = page.getByTestId("toast-2");
      await expectCopyAndCloseAligned(toast);
      const action = toast.getByRole("button", {
        name: "되돌리기 작업 실행",
        exact: true,
      });
      const actionBox = (await action.boundingBox())!;
      const description = (await toast
        .locator(".cheese-toast-description")
        .boundingBox())!;
      expect(actionBox.width).toBeGreaterThan(80);
      expect(actionBox.x).toBeCloseTo(description.x, 1);
      await expect(action).not.toHaveClass(/cheese-toast-close/);
      await action.click();
      await expect(page.getByTestId("action-count")).toHaveText("1");
      await expect(toast).toBeVisible();
    });
  });
}
