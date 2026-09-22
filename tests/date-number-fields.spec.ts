import { test, expect } from "@playwright/test";

for (const framework of ["react", "vue"]) {
  test.describe(`${framework} date and number fields`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(
        `/tests/fixtures/date-number-fields.html?framework=${framework}`,
      );
      await page.evaluate(() => document.fonts.ready);
    });

    test("date draft validates leap days, bounds and day steps without losing text", async ({
      page,
    }) => {
      const date = page.getByRole("textbox", {
        name: "기준 날짜",
        exact: true,
      });
      await expect(date).toHaveAttribute("type", "text");
      await date.fill("2023-02-29");
      await date.blur();
      await expect(date).toHaveValue("2023-02-29");
      await expect(page.getByRole("alert")).toContainText("실제 존재하는 날짜");
      await page.getByRole("button", { name: "저장", exact: true }).click();
      await expect(page.getByTestId("form-data")).toBeEmpty();
      await expect(date).toBeFocused();
      await date.fill("2024-01-31");
      await date.blur();
      await expect(page.getByRole("alert")).toContainText("2024-02-01 이후");
      await date.fill("2024-04-01");
      await date.blur();
      await expect(page.getByRole("alert")).toContainText("2024-03-31 이전");
      await date.fill("2024-02-28");
      await date.blur();
      await expect(page.getByRole("alert")).toContainText("2일 간격");
      await date.fill("2024-02-29");
      await date.blur();
      await expect(date).not.toHaveAttribute("aria-invalid", "true");
      await page.getByRole("button", { name: "저장", exact: true }).click();
      await expect(page.getByTestId("form-data")).toContainText(
        '"date":"2024-02-29"',
      );
      const optional = page.getByRole("textbox", {
        name: "선택 날짜",
        exact: true,
      });
      await optional.fill("0099-02-28");
      await optional.blur();
      await expect(optional).not.toHaveAttribute("aria-invalid", "true");
      await optional.fill("0000-01-01");
      await optional.blur();
      await expect(optional).toHaveAttribute("aria-invalid", "true");
      await expect(optional).toHaveValue("0000-01-01");
    });

    test("calendar is custom, excludes stepped dates, supports keyboard and restores input focus", async ({
      page,
    }) => {
      const date = page.getByRole("textbox", {
        name: "기준 날짜",
        exact: true,
      });
      await date.focus();
      await date.press("Alt+ArrowDown");
      const popup = page.getByRole("dialog", {
        name: "기준 날짜 달력",
        exact: true,
      });
      await expect(popup).toBeVisible();
      await popup.screenshot({
        path: `artifacts/date-number-${framework}-${test.info().project.name}-calendar.png`,
      });
      const day = popup
        .locator(
          framework === "react" ? ".rdp-day_button" : ".cheese-calendar-day",
        )
        .filter({ hasText: /^3$/ })
        .first();
      await day.click();
      await expect(date).toHaveValue("2024-02-03");
      await expect(date).toBeFocused();
      await page
        .getByRole("button", { name: "기준 날짜 달력 열기", exact: true })
        .click();
      const unavailable = popup
        .locator(
          framework === "react" ? ".rdp-day_button" : ".cheese-calendar-day",
        )
        .filter({ hasText: /^2$/ })
        .first();
      if (framework === "react") await expect(unavailable).toBeDisabled();
      else await expect(unavailable).toHaveAttribute("data-disabled");
      await page.keyboard.press("Escape");
      await expect(popup).not.toBeVisible();
      await expect(date).toBeFocused();
      await expect(
        page.getByRole("button", { name: "비활성 날짜 달력 열기" }),
      ).toBeDisabled();
      await expect(
        page.getByRole("button", { name: "읽기 날짜 달력 열기" }),
      ).toBeDisabled();
    });

    test("number custom actions preserve decimal step constraints and display inline errors", async ({
      page,
    }) => {
      const quantity = page.getByRole("spinbutton", {
        name: "수량",
        exact: true,
      });
      await expect(quantity).toHaveCSS("appearance", "textfield");
      await quantity.locator("..").screenshot({
        path: `artifacts/date-number-${framework}-${test.info().project.name}-number.png`,
      });
      await page
        .getByRole("button", { name: "수량 증가", exact: true })
        .click();
      await expect(quantity).toHaveValue("2");
      await page
        .getByRole("button", { name: "수량 감소", exact: true })
        .click();
      await expect(quantity).toHaveValue("1.5");
      await quantity.press("ArrowUp");
      await expect(quantity).toHaveValue("2");
      await quantity.fill("3");
      await expect(
        page.getByRole("button", { name: "수량 증가", exact: true }),
      ).toBeDisabled();
      await quantity.fill("0");
      await expect(
        page.getByRole("button", { name: "수량 감소", exact: true }),
      ).toBeDisabled();
      await quantity.fill("1.2");
      await quantity.blur();
      await expect(page.getByRole("alert")).toContainText("0.5 간격");
      await page.getByRole("button", { name: "저장", exact: true }).click();
      await expect(page.getByTestId("form-data")).toBeEmpty();
      await expect(quantity).toBeFocused();
      await quantity.fill("4");
      await quantity.blur();
      await expect(page.getByRole("alert")).toContainText("3 이하");
      await quantity.fill("");
      await quantity.blur();
      await expect(page.getByRole("alert")).toContainText("값을 입력");
      await page.getByRole("button", { name: "자유 수량 증가" }).click();
      await expect(
        page.getByRole("spinbutton", { name: "자유 수량", exact: true }),
      ).toHaveValue("1.25");
      await quantity.fill("1.5");
      const offset = page.getByRole("spinbutton", {
        name: "간격 수량",
        exact: true,
      });
      await offset.fill("4");
      await offset.blur();
      await expect(page.getByRole("alert")).toContainText("5 간격");
      expect(
        await offset.evaluate(
          (node: HTMLInputElement) => node.validity.stepMismatch,
        ),
      ).toBe(true);
      await offset.fill("8");
      await offset.blur();
      await expect(offset).not.toHaveAttribute("aria-invalid", "true");
      await page
        .getByRole("button", { name: "간격 수량 증가", exact: true })
        .click();
      await expect(offset).toHaveValue("13");
    });

    test("FormData, external association, reset cancellation and controlled ownership", async ({
      page,
    }) => {
      const date = page.getByRole("textbox", {
        name: "기준 날짜",
        exact: true,
      });
      const quantity = page.getByRole("spinbutton", {
        name: "수량",
        exact: true,
      });
      await date.fill("2024-02-03");
      await quantity.fill("2.5");
      await page
        .getByRole("textbox", { name: "제어 날짜", exact: true })
        .fill("2024-02-12");
      await page
        .getByRole("spinbutton", { name: "제어 수량", exact: true })
        .fill("5");
      await page
        .getByRole("textbox", { name: "외부 날짜", exact: true })
        .fill("2024-02-22");
      await page
        .getByRole("spinbutton", { name: "외부 수량", exact: true })
        .fill("6");
      await page.getByLabel("초기화 취소").check();
      await page.getByRole("button", { name: "초기화", exact: true }).click();
      await expect(date).toHaveValue("2024-02-03");
      await expect(quantity).toHaveValue("2.5");
      await page.getByLabel("초기화 취소").uncheck();
      await page.getByRole("button", { name: "초기화", exact: true }).click();
      await expect(date).toHaveValue("2024-02-01");
      await expect(quantity).toHaveValue("1.5");
      await expect(
        page.getByRole("textbox", { name: "제어 날짜", exact: true }),
      ).toHaveValue("2024-02-12");
      await expect(
        page.getByRole("spinbutton", { name: "제어 수량", exact: true }),
      ).toHaveValue("5");
      await expect(
        page.getByRole("textbox", { name: "외부 날짜", exact: true }),
      ).toHaveValue("2024-02-20");
      await expect(
        page.getByRole("spinbutton", { name: "외부 수량", exact: true }),
      ).toHaveValue("4");
      await page.getByRole("button", { name: "저장", exact: true }).click();
      const data = JSON.parse(
        (await page.getByTestId("form-data").textContent())!,
      );
      expect(data).toMatchObject({
        date: "2024-02-01",
        quantity: "1.5",
        externalDate: "2024-02-20",
        externalNumber: "4",
        controlledDate: "2024-02-12",
        controlledNumber: "5",
        readonlyDate: "2024-02-10",
        readonlyNumber: "2",
      });
      expect(data).not.toHaveProperty("disabledDate");
      expect(data).not.toHaveProperty("disabledNumber");
      await page.getByRole("button", { name: "날짜 참조 포커스" }).click();
      await expect(date).toBeFocused();
      await page.getByRole("button", { name: "수량 참조 포커스" }).click();
      await expect(quantity).toBeFocused();
    });

    test("required errors retain first field focus and reset clears inline state", async ({
      page,
    }) => {
      const date = page.getByRole("textbox", {
        name: "기준 날짜",
        exact: true,
      });
      const quantity = page.getByRole("spinbutton", {
        name: "수량",
        exact: true,
      });
      await date.fill("");
      await quantity.fill("");
      await page.getByRole("button", { name: "저장", exact: true }).click();
      await expect(page.getByRole("alert")).toHaveCount(2);
      // One real pointer click must invoke native validation, not just blur errors.
      await expect(page.getByTestId("invalid-events")).toHaveText("2");
      await expect(date).toBeFocused();
      await expect(page.getByTestId("form-data")).toBeEmpty();
      await page.getByRole("button", { name: "초기화", exact: true }).click();
      await expect(date).toHaveValue("2024-02-01");
      await expect(quantity).toHaveValue("1.5");
      await expect(page.getByRole("alert")).toHaveCount(0);
      await date.fill("2024-02-30");
      await page
        .getByRole("heading", { name: "날짜·수량 폼 계약", exact: true })
        .click();
      // A non-focusable outside target still reveals validation on blur.
      await expect(date).toHaveAttribute("aria-invalid", "true");
      await expect(page.getByRole("alert")).toContainText("실제 존재하는 날짜");
    });

    test("civil dates survive timezone changes and calendar today stays local", async ({
      browser,
      baseURL,
    }) => {
      test.setTimeout(60000);
      for (const timezoneId of [
        "Pacific/Apia",
        "America/Los_Angeles",
        "Asia/Seoul",
      ]) {
        const context = await browser.newContext({ baseURL, timezoneId });
        try {
          const zonePage = await context.newPage();
          await zonePage.goto(
            `/tests/fixtures/date-number-fields.html?framework=${framework}`,
          );
          const field = zonePage.getByRole("textbox", {
            name: "선택 날짜",
            exact: true,
          });
          await expect(field).toBeVisible();
          // TZDate builds timezone-aware getters from Date.prototype at import.
          // Install the fake clock after library initialization, not before it.
          await zonePage.clock.install({
            time: new Date("2026-09-22T00:30:00Z"),
          });
          // Samoa skipped this local day, but it remains a valid Gregorian date.
          await field.fill("2011-12-30");
          await field.blur();
          await expect(field).not.toHaveAttribute("aria-invalid", "true");
          expect(
            await field.evaluate(
              (node: HTMLInputElement) => node.validity.valid,
            ),
          ).toBe(true);
          await field.fill("");
          await zonePage
            .getByRole("button", { name: "선택 날짜 달력 열기", exact: true })
            .click();
          const popup = zonePage.getByRole("dialog", {
            name: "선택 날짜 달력",
            exact: true,
          });
          await expect(popup).toBeVisible();
          const today = popup.locator(
            framework === "react"
              ? ".rdp-today .rdp-day_button"
              : ".cheese-calendar-day[data-today]",
          );
          await expect(today).toHaveCount(1);
          const expectedDay =
            timezoneId === "America/Los_Angeles" ? "21" : "22";
          await expect(today).toHaveText(expectedDay);
          await today.click();
          await expect(field).toHaveValue(`2026-09-${expectedDay}`);
        } finally {
          await context.close();
        }
      }
    });
  });
}
