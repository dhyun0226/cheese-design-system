import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const framework of ["react", "vue"]) {
  test.describe(`${framework} branded time field`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(
        `/tests/fixtures/time-controls.html?framework=${framework}`,
      );
      await expect(
        page.getByLabel("Meeting", { exact: false }).first(),
      ).toBeVisible();
    });

    test("keyboard draft, apply, cancel and accessible listboxes", async ({
      page,
    }) => {
      const field = page.getByRole("textbox", {
        name: "Meeting",
        exact: true,
      });
      await expect(field).toHaveAttribute("type", "text");
      await expect(field).toHaveAttribute("aria-describedby", /extra-hint/);
      await field.press("ArrowDown");
      const hours = page.getByRole("listbox", { name: "시", exact: true });
      const minutes = page.getByRole("listbox", { name: "분", exact: true });
      await expect(hours).toBeFocused();
      await hours.press("ArrowDown");
      await expect(field).toHaveValue("09:00");
      await hours.press("Tab");
      await expect(minutes).toBeFocused();
      await minutes.press("End");
      await page.getByRole("button", { name: "적용", exact: true }).click();
      await expect(field).toHaveValue("10:45");
      const trigger = page.getByRole("button", { name: "Meeting 시간 선택" });
      await expect(trigger).toBeFocused();
      await trigger.click();
      await hours.press("Home");
      await hours.press("Escape");
      await expect(field).toHaveValue("10:45");
      await expect(trigger).toBeFocused();
      await trigger.click();
      const accessibility = await new AxeBuilder({ page })
        .include(".cheese-time-popover")
        .analyze();
      expect(accessibility.violations).toEqual([]);
      await page.getByRole("button", { name: "취소", exact: true }).click();
    });

    test("format, range, required and step validate inline without losing draft", async ({
      page,
    }) => {
      const field = page.getByRole("textbox", {
        name: "Meeting",
        exact: false,
      });
      const submit = page.getByRole("button", { name: "Submit", exact: true });
      for (const [value, message] of [
        ["25:73", "형식"],
        ["08:45", "사이"],
        ["09:07", "15분"],
        ["", "시간을 입력"],
      ]) {
        await field.fill(value);
        await submit.click();
        await expect(field).toHaveValue(value);
        await expect(field).toHaveAttribute("aria-invalid", "true");
        await expect(page.getByRole("alert")).toContainText(message);
        await expect(page.getByTestId("result")).toBeEmpty();
      }
      expect(
        Number(await page.getByTestId("invalids").textContent()),
      ).toBeGreaterThanOrEqual(4);
      await field.fill("09:15");
      await submit.click();
      await expect(page.getByTestId("result")).toContainText(
        '"meeting":"09:15"',
      );
      await expect(field).toHaveAttribute("aria-invalid", "false");
    });

    test("uncontrolled reset, controlled ownership and successful controls", async ({
      page,
    }) => {
      const meeting = page.getByRole("textbox", {
        name: "Meeting",
        exact: false,
      });
      const controlled = page.getByRole("textbox", {
        name: "Controlled",
        exact: true,
      });
      await page.getByRole("button", { name: "Reset", exact: true }).click();
      await expect(meeting).toHaveValue("09:00");
      await expect(controlled).toHaveValue("12:00");
      await expect(page.getByTestId("changes")).toHaveText("0");
      await meeting.fill("11:15");
      await controlled.fill("13:30");
      const changes = await page.getByTestId("changes").textContent();
      await page.getByRole("button", { name: "Reset", exact: true }).click();
      await expect(meeting).toHaveValue("09:00");
      await expect(controlled).toHaveValue("13:30");
      await expect(page.getByTestId("changes")).toHaveText(changes!);
      await page.getByRole("button", { name: "Submit", exact: true }).click();
      await expect(page.getByTestId("result")).toContainText(
        '"readonly":"10:00"',
      );
      await expect(page.getByTestId("result")).not.toContainText('"disabled"');
    });

    test("rejected controlled edits preserve native value, validity and submission", async ({
      page,
    }) => {
      const field = page.getByRole("textbox", {
        name: "Fixed time",
        exact: true,
      });
      for (const candidate of ["13:30", "25:73", ""]) {
        await field.fill(candidate);
        await expect(field).toHaveValue("12:00");
        expect(
          await field.evaluate((node: HTMLInputElement) => node.validity.valid),
        ).toBe(true);
      }
      await page.getByRole("button", { name: "Submit", exact: true }).click();
      await expect(page.getByTestId("result")).toContainText('"fixed":"12:00"');
      await expect(field).toHaveAttribute("aria-invalid", "false");
    });

    test("seconds picker and default-value step origin stay valid", async ({
      page,
    }) => {
      await page.getByRole("button", { name: "Seconds 시간 선택" }).click();
      const seconds = page.getByRole("listbox", { name: "초", exact: true });
      await seconds.focus();
      await seconds.press("End");
      await page.getByRole("button", { name: "적용", exact: true }).click();
      await expect(
        page.getByRole("textbox", { name: "Seconds", exact: true }),
      ).toHaveValue("09:00:45");
      const offset = page.getByRole("textbox", { name: "Offset", exact: true });
      await offset.fill("10:15");
      await page.getByRole("button", { name: "Submit", exact: true }).click();
      await expect(page.getByRole("alert")).toContainText("10:05 기준 15분");
      await offset.fill("10:20");
      await page.getByRole("button", { name: "Submit", exact: true }).click();
      await expect(page.getByTestId("result")).toContainText(
        '"offset":"10:20"',
      );
      await page.getByRole("button", { name: "Offset 시간 선택" }).click();
      await expect(
        page
          .getByRole("listbox", { name: "분", exact: true })
          .getByRole("option"),
      ).toHaveText(["05", "20", "35", "50"]);
    });

    test("external form submission and reset, readonly and disabled", async ({
      page,
    }) => {
      const external = page.getByRole("textbox", {
        name: "External",
        exact: false,
      });
      await external.fill("14:00");
      await page.getByRole("button", { name: "External submit" }).click();
      await expect(page.getByTestId("result")).toHaveText(
        '{"external":"14:00"}',
      );
      await page.getByRole("button", { name: "External reset" }).click();
      await expect(external).toHaveValue("11:30");
      await expect(
        page.getByRole("textbox", { name: "Readonly", exact: false }),
      ).toHaveAttribute("readonly", "");
      await expect(
        page.getByRole("button", { name: "Readonly 시간 선택" }),
      ).toBeDisabled();
      await expect(
        page.getByRole("textbox", { name: "Disabled", exact: false }),
      ).toBeDisabled();
      await expect(
        page.getByRole("button", { name: "Disabled 시간 선택" }),
      ).toBeDisabled();
    });

    test("empty configuration and narrow viewport remain understandable", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 640 });
      await page.getByRole("button", { name: "No slots 시간 선택" }).click();
      await expect(page.locator(".cheese-time-popover")).toContainText(
        "선택 가능한 시간이 없습니다",
      );
      await expect(
        page.getByRole("button", { name: "적용", exact: true }),
      ).toBeDisabled();
      const box = await page.locator(".cheese-time-popover").boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(320);
      await page.getByRole("button", { name: "취소", exact: true }).click();
      await expect(
        page.getByRole("button", { name: "No slots 시간 선택" }),
      ).toBeFocused();
    });

    test("an external controlled correction clears a stale native constraint error", async ({
      page,
    }) => {
      const form = page.getByRole("form", { name: "Native constraint form" });
      const input = form.getByRole("textbox", {
        name: "Native constrained",
        exact: true,
      });
      await form
        .getByRole("button", { name: "Validate native constraint" })
        .click();
      await expect(input).toHaveAttribute("aria-invalid", "true");
      await expect(form.getByRole("alert")).toHaveCount(1);
      await form
        .getByRole("button", { name: "Correct constrained time" })
        .click();
      await expect(input).toHaveValue("11:00");
      expect(
        await input.evaluate((node: HTMLInputElement) => node.validity.valid),
      ).toBe(true);
      await expect(input).toHaveAttribute("aria-invalid", "false");
      await expect(form.getByRole("alert")).toHaveCount(0);
    });
  });
}
