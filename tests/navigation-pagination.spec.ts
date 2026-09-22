import { test, expect, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { tabKey } from "./platform";

const visibleRange = async (pagination: Locator) =>
  (await pagination.locator(".cheese-pagination-list").innerText()).match(
    /\d+|…/g,
  ) ?? [];

const expectRange = async (pagination: Locator, expected: string[]) =>
  expect.poll(() => visibleRange(pagination)).toEqual(expected);

for (const framework of ["react", "vue"]) {
  test.describe(`${framework} navigation and pagination`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(
        `/tests/fixtures/navigation-pagination.html?framework=${framework}`,
      );
      await page.evaluate(() => document.fonts.ready);
    });

    test("page buttons, previous and next keep controlled state and keyboard activation", async ({
      page,
      browserName,
    }) => {
      const pagination = page.getByRole("navigation", { name: "페이지 탐색" });
      const current = pagination.locator('button[aria-current="page"]:visible');
      await expectRange(pagination, ["1", "2", "3", "4", "5", "…", "20"]);
      await expect(current).toHaveCount(1);
      await expect(current).toHaveAccessibleName("1페이지");
      await pagination
        .getByRole("button", { name: "3페이지", exact: true })
        .click();
      await expect(current).toHaveAccessibleName("3페이지");
      await expect(page.getByLabel("현재 페이지", { exact: true })).toHaveValue(
        "3",
      );
      await pagination
        .getByRole("button", { name: "다음 페이지", exact: true })
        .click();
      await expect(current).toHaveAccessibleName("4페이지");
      await pagination
        .getByRole("button", { name: "이전 페이지", exact: true })
        .click();
      await expect(current).toHaveAccessibleName("3페이지");
      const fifth = pagination.getByRole("button", {
        name: "5페이지",
        exact: true,
      });
      // Enter through Tab: programmatic focus after a click retains pointer
      // modality in Firefox and does not itself activate :focus-visible.
      await pagination
        .getByRole("button", { name: "4페이지", exact: true })
        .focus();
      await page.keyboard.press(tabKey(browserName));
      await expect(fifth).toBeFocused();
      await fifth.press("Enter");
      await expect(current).toHaveAccessibleName("5페이지");
      await expect(current).toBeFocused();
      await expect(current).toHaveCSS("outline-width", "2px");
      await current.press("Space");
      await expect(page.getByTestId("page-events")).toHaveText("[3,4,3,5]");
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    });

    test("desktop range and hidden end arrows preserve 40px cells and fixed width", async ({
      page,
    }) => {
      const pagination = page.getByRole("navigation", { name: "페이지 탐색" });
      const previous = pagination.locator('button[aria-label="이전 페이지"]');
      const next = pagination.locator('button[aria-label="다음 페이지"]');
      const list = pagination.locator(".cheese-pagination-list");
      await expect(previous).toBeDisabled();
      await expect(previous).toHaveCSS("visibility", "hidden");
      const firstWidth = (await list.boundingBox())!.width;
      await page.getByLabel("현재 페이지", { exact: true }).fill("10");
      await expectRange(pagination, ["1", "…", "9", "10", "11", "…", "20"]);
      await expect(previous).toBeVisible();
      await expect(next).toBeVisible();
      expect((await list.boundingBox())!.width).toBeCloseTo(firstWidth, 1);
      const cells = await pagination
        .locator(".cheese-pagination-item:visible, .cheese-pagination-ellipsis")
        .evaluateAll((buttons) =>
          buttons.map((button) => {
            const box = button.getBoundingClientRect();
            return { width: box.width, height: box.height };
          }),
        );
      expect(cells).toHaveLength(9);
      for (const cell of cells) expect(cell).toEqual({ width: 40, height: 40 });
      await pagination
        .getByRole("button", { name: "20페이지", exact: true })
        .click();
      await expectRange(pagination, ["1", "…", "16", "17", "18", "19", "20"]);
      await expect(next).toBeDisabled();
      await expect(next).toHaveCSS("visibility", "hidden");
      expect((await list.boundingBox())!.width).toBeCloseTo(firstWidth, 1);
      await pagination.screenshot({
        path: `artifacts/${test.info().project.name}/${framework}-pagination-last.png`,
      });
    });

    test("compact range remains aligned and fits a 320px screen", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 740 });
      const pagination = page.getByRole("navigation", { name: "페이지 탐색" });
      const list = pagination.locator(".cheese-pagination-list");
      await expectRange(pagination, ["1", "2", "3", "4", "…"]);
      await expect(list.locator(":scope > li")).toHaveCount(7);
      const firstWidth = (await list.boundingBox())!.width;
      await page.getByLabel("현재 페이지", { exact: true }).fill("10");
      await expectRange(pagination, ["…", "9", "10", "11", "…"]);
      for (const number of [9, 10, 11]) {
        await expect(
          pagination.getByRole("button", {
            name: `${number}페이지`,
            exact: true,
          }),
        ).toBeVisible();
      }
      const middle = (await list.boundingBox())!;
      expect(middle.width).toBeCloseTo(firstWidth, 1);
      expect(middle.x).toBeGreaterThanOrEqual(0);
      expect(middle.x + middle.width).toBeLessThanOrEqual(320);
      await page.getByLabel("현재 페이지", { exact: true }).fill("20");
      await expectRange(pagination, ["…", "17", "18", "19", "20"]);
      expect((await list.boundingBox())!.width).toBeCloseTo(firstWidth, 1);
      await pagination.screenshot({
        path: `artifacts/${test.info().project.name}/${framework}-pagination-mobile.png`,
      });
      await page.getByLabel("전체 페이지 수", { exact: true }).fill("5");
      await page.getByLabel("현재 페이지", { exact: true }).fill("3");
      await expectRange(pagination, ["1", "2", "3", "4", "5"]);
      await expect(
        pagination.locator('[aria-current="page"]:visible'),
      ).toHaveAccessibleName("3페이지");
    });

    test("empty and single pages hide; large counts stay bounded and page values clamp", async ({
      page,
    }) => {
      const count = page.getByLabel("전체 페이지 수", { exact: true });
      const pageInput = page.getByLabel("현재 페이지", { exact: true });
      const pagination = page.getByRole("navigation", { name: "페이지 탐색" });
      for (const value of ["0", "1"]) {
        await count.fill(value);
        await expect(pagination).not.toBeVisible();
      }
      await count.fill("1000000");
      await expect(pagination).toBeVisible();
      expect((await visibleRange(pagination)).length).toBeLessThanOrEqual(7);
      await pageInput.fill("999999999");
      await expect(
        pagination.locator('[aria-current="page"]:visible'),
      ).toHaveAccessibleName("1000000페이지");
      await expect(
        pagination.locator('button[aria-label="다음 페이지"]'),
      ).toBeDisabled();
      await pageInput.fill("-5");
      await expect(
        pagination.locator('[aria-current="page"]:visible'),
      ).toHaveAccessibleName("1페이지");
      await expect(
        pagination.locator('button[aria-label="이전 페이지"]'),
      ).toBeDisabled();
      await expect(page.getByTestId("page-events")).toHaveText("[]");
    });

    test("disabled controls do not emit page changes", async ({ page }) => {
      const pagination = page.getByRole("navigation", { name: "페이지 탐색" });
      await page.getByLabel("현재 페이지", { exact: true }).fill("10");
      await page.getByLabel("페이지 이동 비활성화", { exact: true }).check();
      for (const button of await pagination.locator("button").all()) {
        await expect(button).toBeDisabled();
      }
      await pagination.locator("button").evaluateAll((buttons) => {
        for (const button of buttons) (button as HTMLButtonElement).click();
      });
      await expect(page.getByLabel("현재 페이지", { exact: true })).toHaveValue(
        "10",
      );
      await expect(page.getByTestId("page-events")).toHaveText("[]");
      await page.getByLabel("페이지 이동 비활성화", { exact: true }).uncheck();
      await pagination
        .getByRole("button", { name: "다음 페이지", exact: true })
        .click();
      await expect(page.getByTestId("page-events")).toHaveText("[11]");
    });

    test("keyboard focus moves to the selected page when an end arrow disappears", async ({
      page,
    }) => {
      const pagination = page.getByRole("navigation", { name: "페이지 탐색" });
      const current = pagination.locator('button[aria-current="page"]:visible');
      await page.getByLabel("현재 페이지", { exact: true }).fill("2");
      const previous = pagination.getByRole("button", {
        name: "이전 페이지",
        exact: true,
      });
      await previous.focus();
      await previous.press("Enter");
      await expect(current).toHaveAccessibleName("1페이지");
      await expect(current).toBeFocused();
      await page.getByLabel("현재 페이지", { exact: true }).fill("19");
      const next = pagination.getByRole("button", {
        name: "다음 페이지",
        exact: true,
      });
      await next.focus();
      await next.press("Space");
      await expect(current).toHaveAccessibleName("20페이지");
      await expect(current).toBeFocused();
      await expect(page.getByTestId("page-events")).toHaveText("[1,20]");
    });

    test("a pointer-opened navigation menu stays closed after keyboard Escape", async ({
      page,
    }) => {
      // Install after mount so fixture setup has already completed its timers.
      const now = new Date("2026-01-01T00:00:00Z");
      await page.clock.install({ time: now });
      await page.clock.pauseAt(new Date(now.getTime() + 1_000));
      const navigation = page.getByRole("navigation", { name: "업무 서비스" });
      const trigger = navigation.getByRole("button", {
        name: "평가 관리",
        exact: true,
      });
      const popupLink = navigation.getByRole("link", { name: /평가 목록/ });
      const bounds = (await trigger.boundingBox())!;
      // Raw pointer input avoids locator actionability waiting for a paused RAF.
      await page.mouse.move(
        bounds.x + bounds.width / 2,
        bounds.y + bounds.height / 2,
      );
      await page.mouse.down();
      await page.mouse.up();
      await expect(popupLink).toBeVisible();
      await page.clock.runFor(1);
      await trigger.focus();
      await page.keyboard.press("Tab");
      await expect(popupLink).toBeFocused();
      await page.keyboard.press("Escape");
      // Any stale primitive 200ms hover timer must not reopen a dismissed menu.
      await page.clock.runFor(250);
      await expect(popupLink).not.toBeVisible();
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await expect(trigger).toBeFocused();
    });

    test("top navigation, menubar and toolbar share heights while popup links allow multiple lines", async ({
      page,
    }) => {
      const navigation = page.getByRole("navigation", { name: "업무 서비스" });
      const menubar = page.getByRole("menubar", { name: "문서 메뉴" });
      const toolbar = page.getByRole("toolbar", { name: "문서 서식" });
      const controls = [
        navigation.getByRole("button", { name: "평가 관리", exact: true }),
        navigation.getByRole("button", { name: "조직", exact: true }),
        navigation.getByRole("link", { name: "사용 안내", exact: true }),
        menubar.getByRole("menuitem", { name: "파일", exact: true }),
        menubar.getByRole("menuitem", { name: "편집", exact: true }),
        toolbar.getByRole("button", { name: "굵게", exact: true }),
        toolbar.getByRole("button", { name: "기울임", exact: true }),
        toolbar.getByRole("button", { name: "문서 저장", exact: true }),
      ];
      for (const control of controls) {
        await expect(control).toHaveCSS("line-height", "normal");
        expect((await control.boundingBox())!.height).toBe(36);
      }
      const listHeight = (await navigation
        .locator(".cheese-navigation-list")
        .boundingBox())!.height;
      expect((await menubar.boundingBox())!.height).toBe(listHeight);
      expect((await toolbar.boundingBox())!.height).toBe(listHeight);
      // Keep this keyboard scenario independent of Radix's delayed hover open.
      await controls[0].focus();
      await controls[0].press("Enter");
      const popupLink = navigation.getByRole("link", { name: /평가 목록/ });
      await expect(popupLink).toBeVisible();
      expect((await popupLink.boundingBox())!.height).toBeGreaterThan(36);
      await expect(popupLink).toHaveCSS("line-height", "21px");
      await controls[0].focus();
      await page.keyboard.press("Tab");
      await expect(popupLink).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(popupLink).not.toBeVisible();
      await expect(controls[0]).toHaveAttribute("aria-expanded", "false");
      await expect(controls[0]).toBeFocused();
      await controls[3].focus();
      await page.keyboard.press("ArrowDown");
      await page
        .getByRole("menuitem", { name: "새 문서", exact: true })
        .click();
      await expect(page.getByLabel("문서 변경 기록")).toContainText("새 문서");
      await controls[5].click();
      await controls[7].click();
      await expect(page.getByLabel("문서 변경 기록")).toHaveText("저장 · 굵게");
    });
  });
}
