import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const framework of ["react", "vue"]) {
  test.describe(`${framework} error summary`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(
        `/tests/fixtures/error-summary.html?framework=${framework}#/tasks/edit`,
      );
    });

    test("submission explicitly focuses the summary and links focus real fields without changing the route", async ({
      page,
    }) => {
      const summary = page.getByRole("region", {
        name: "입력 내용을 확인해 주세요.",
      });
      await expect(summary).not.toBeFocused();
      await page
        .getByRole("button", { name: "제출 실패", exact: true })
        .click();
      await expect(summary).toBeFocused();
      for (const [message, target] of [
        [
          "업무 이름을 입력해 주세요.",
          page.getByRole("textbox", { name: "업무 이름", exact: true }),
        ],
        [
          "담당자를 선택해 주세요.",
          page.getByRole("combobox", { name: "담당자", exact: true }),
        ],
        [
          "마감일을 입력해 주세요.",
          page.getByRole("textbox", { name: "마감일", exact: true }),
        ],
        [
          "연결된 항목을 확인해 주세요.",
          page.getByRole("button", { name: "연결 항목 선택", exact: true }),
        ],
      ] as const) {
        await summary.getByRole("link", { name: message, exact: true }).click();
        await expect(target).toBeFocused();
        expect(new URL(page.url()).hash).toBe("#/tasks/edit");
      }
    });

    test("custom composite navigation can cancel default focus", async ({
      page,
    }) => {
      await page
        .getByRole("link", { name: "복합 항목을 확인해 주세요.", exact: true })
        .focus();
      await page.keyboard.press("Enter");
      await expect(
        page.getByRole("button", {
          name: "직접 지정한 복합 항목",
          exact: true,
        }),
      ).toBeFocused();
      expect(new URL(page.url()).hash).toBe("#/tasks/edit");
    });

    test("unavailable targets keep keyboard focus on their link and never focus native proxies", async ({
      page,
    }) => {
      for (const message of [
        "사용할 수 없는 항목입니다.",
        "숨겨진 항목입니다.",
        "존재하지 않는 항목입니다.",
      ]) {
        const link = page.getByRole("link", { name: message, exact: true });
        await link.focus();
        await link.press("Enter");
        await expect(link).toBeFocused();
        expect(new URL(page.url()).hash).toBe("#/tasks/edit");
      }
    });

    test("form-wide errors are text, updates do not steal focus, and empty summaries disappear", async ({
      page,
    }) => {
      const summary = page.getByRole("region", {
        name: "입력 내용을 확인해 주세요.",
      });
      const serverError = summary.getByText(
        "저장하지 못했습니다. 입력 내용은 유지되며 잠시 후 다시 시도할 수 있습니다.",
        { exact: true },
      );
      await expect(serverError).toBeVisible();
      expect(
        await serverError.evaluate((node) => node.closest("a")),
      ).toBeNull();
      await expect(summary).not.toHaveAttribute("aria-live");
      await page
        .getByRole("button", { name: "오류 추가", exact: true })
        .focus();
      await page.keyboard.press("Enter");
      await expect(
        page.getByRole("button", { name: "오류 추가", exact: true }),
      ).toBeFocused();
      await page
        .getByRole("button", { name: "오류 지우기", exact: true })
        .click();
      await expect(summary).toHaveCount(0);
      await page
        .getByRole("button", { name: "제출 실패", exact: true })
        .click();
      await expect(summary).toBeFocused();
    });

    test("long errors fit a narrow screen and retain accessible headings and links", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 900 });
      await page
        .getByRole("button", { name: "오류 추가", exact: true })
        .click();
      const summary = page.getByRole("region", {
        name: "입력 내용을 확인해 주세요.",
      });
      await expect(summary.getByRole("heading", { level: 2 })).toHaveText(
        "입력 내용을 확인해 주세요.",
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const audit = await new AxeBuilder({ page }).include("main").analyze();
      expect(audit.violations).toEqual([]);
    });
  });
}
