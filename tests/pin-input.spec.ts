import { expect, test, type Locator, type Page } from "@playwright/test";
import { tabKey } from "./platform";

async function openOTP(
  page: Page,
  framework: string,
  options: Record<string, string> = {},
) {
  const query = new URLSearchParams({ scenario: "otp", framework, ...options });
  await page.goto(`/tests/fixtures/business.html?${query}`);
  const input = page.getByRole("textbox", {
    name: "Contract OTP",
    exact: true,
  });
  await expect(input).toBeVisible();
  return input;
}

// ClipboardEvent exercises the component's paste handler consistently in all
// three engines; synthetic events do not perform browser-default insertion.
async function paste(input: Locator, text: string) {
  await input.evaluate((node: HTMLInputElement, value) => {
    const clipboardData = new DataTransfer();
    clipboardData.setData("text/plain", value);
    const event = new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData,
    });
    // Firefox may drop a constructor-supplied transfer from a synthetic event.
    // Pin the real test transfer so this tests the handler with actual payload.
    if (event.clipboardData?.getData("text/plain") !== value)
      Object.defineProperty(event, "clipboardData", { value: clipboardData });
    if (event.clipboardData?.getData("text/plain") !== value)
      throw new Error(
        "Synthetic OTP paste did not retain its clipboard payload",
      );
    node.dispatchEvent(event);
  }, text);
}

async function expectSelection(input: Locator, start: number, end = start) {
  await expect
    .poll(() =>
      input.evaluate((node: HTMLInputElement) => [
        node.selectionStart,
        node.selectionEnd,
      ]),
    )
    .toEqual([start, end]);
}

async function slotGeometry(slots: Locator) {
  return slots.evaluateAll((nodes) =>
    nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    }),
  );
}

for (const framework of ["react", "vue"]) {
  test.describe(`${framework} segmented OTP`, () => {
    for (const width of [1440, 320]) {
      test(`lengths 1, 4, 6 and 12 keep centered slots within ${width}px`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        for (const length of [1, 4, 6, 12]) {
          const input = await openOTP(page, framework, {
            length: String(length),
            className: "caller-otp",
          });
          const control = page.locator(".cheese-pin-control");
          const slots = control.locator(".cheese-pin-slot");
          await expect(slots).toHaveCount(length);
          await expect(page.getByRole("textbox")).toHaveCount(1);
          await expect(control.locator("input")).toHaveCount(1);
          await expect(input).toHaveClass(/\bcheese-pin-input\b/);
          await expect(input).toHaveClass(/\bcaller-otp\b/);
          await expect(input).toHaveAttribute("type", "text");
          await expect(input).toHaveAttribute("inputmode", "numeric");
          await expect(input).toHaveAttribute("autocomplete", "one-time-code");
          await expect(input).toHaveAttribute("maxlength", String(length));
          await expect(control.locator(".cheese-pin-slots")).toHaveAttribute(
            "aria-hidden",
            "true",
          );
          await expect(
            control.locator(
              ".cheese-pin-slots input, .cheese-pin-slots button",
            ),
          ).toHaveCount(0);
          await page.evaluate(() => document.fonts.ready);
          const empty = await slotGeometry(slots);
          const code = "123456789012".slice(0, length);
          await input.fill(code);
          await expect(slots).toHaveText(code.split(""));
          const filled = await slotGeometry(slots);
          expect(filled).toEqual(empty);
          for (let index = 0; index < filled.length; index += 1) {
            const slot = filled[index];
            expect(slot.x).toBeGreaterThanOrEqual(0);
            expect(slot.x + slot.width).toBeLessThanOrEqual(width + 1);
            expect(Math.abs(slot.y - filled[0].y)).toBeLessThanOrEqual(1);
            expect(Math.abs(slot.width - filled[0].width)).toBeLessThanOrEqual(
              1,
            );
            expect(
              Math.abs(slot.height - filled[0].height),
            ).toBeLessThanOrEqual(1);
            if (index > 0)
              expect(slot.x).toBeGreaterThanOrEqual(
                filled[index - 1].x + filled[index - 1].width,
              );
          }
          const digits = await slots.evaluateAll((nodes) =>
            nodes.map((node) => {
              const slot = node.getBoundingClientRect();
              const text = document.createRange();
              text.selectNodeContents(node);
              const digit = text.getBoundingClientRect();
              const style = getComputedStyle(node);
              return {
                offsetX: digit.x + digit.width / 2 - (slot.x + slot.width / 2),
                fontFamily: style.fontFamily,
                fontSize: style.fontSize,
                fontWeight: style.fontWeight,
                display: style.display,
                alignItems: style.alignItems,
                justifyContent: style.justifyContent,
              };
            }),
          );
          for (const digit of digits) {
            expect(Math.abs(digit.offsetX)).toBeLessThanOrEqual(1);
            expect(digit.fontFamily).toContain("Pretendard");
            expect(digit.fontSize).toBe(length > 8 ? "16px" : "20px");
            expect(digit.fontWeight).toBe("600");
            expect(digit.display).toBe("flex");
            expect(digit.alignItems).toBe("center");
            expect(digit.justifyContent).toBe("center");
          }
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          ).toBe(true);
          await input.fill(length === 1 ? "" : "1");
          expect(await slotGeometry(slots)).toEqual(empty);
        }
      });
    }

    test("uses six slots by default and clamps finite lengths to 1–12", async ({
      page,
    }) => {
      await openOTP(page, framework);
      await expect(page.locator(".cheese-pin-slot")).toHaveCount(6);
      for (const [requested, expected] of [
        [0, 1],
        [20, 12],
        [4.8, 4],
      ]) {
        const input = await openOTP(page, framework, {
          length: String(requested),
        });
        await expect(page.locator(".cheese-pin-slot")).toHaveCount(expected);
        await expect(input).toHaveAttribute("maxlength", String(expected));
      }
    });

    test("native focus, arrow selection and Backspace update the active slots", async ({
      page,
      browserName,
    }) => {
      const input = await openOTP(page, framework);
      const slots = page.locator(".cheese-pin-slot");
      const active = page.locator('.cheese-pin-slot[data-active="true"]');
      await input.focus();
      await expect(slots.nth(0)).toHaveAttribute("data-active", "true");
      await expect(active).toHaveCount(1);
      await expect(active).toHaveCSS("outline-color", "rgb(255, 201, 40)");
      await expect(active).toHaveCSS("outline-style", "solid");
      expect(
        await active.evaluate((node) =>
          parseFloat(getComputedStyle(node).outlineWidth),
        ),
      ).toBeGreaterThanOrEqual(2);
      await input.pressSequentially("1234");
      await expect(input).toHaveValue("1234");
      await expect(slots.nth(4)).toHaveAttribute("data-active", "true");
      await input.press("ArrowLeft");
      await expectSelection(input, 3);
      await expect(slots.nth(3)).toHaveAttribute("data-active", "true");
      await input.press("Shift+ArrowLeft");
      await input.press("Shift+ArrowLeft");
      await expectSelection(input, 1, 3);
      await expect(
        page.locator('.cheese-pin-slot[data-selected="true"]'),
      ).toHaveText(["2", "3"]);
      await input.press("Backspace");
      await expect(input).toHaveValue("14");
      await expectSelection(input, 1);
      await expect(input).toBeFocused();
      await input.press("ArrowRight");
      await input.press("Backspace");
      await expect(input).toHaveValue("1");
      await expectSelection(input, 1);
      await input.press(tabKey(browserName));
      await expect(
        page.getByRole("button", { name: "Submit OTP", exact: true }),
      ).toBeFocused();
      await expect(active).toHaveCSS("outline-style", "none");
      await page.keyboard.press(tabKey(browserName, true));
      await expect(input).toBeFocused();
    });

    test("clicking a digit positions native editing near that slot at desktop and mobile widths", async ({
      page,
    }) => {
      for (const width of [1440, 320]) {
        await page.setViewportSize({ width, height: 900 });
        const input = await openOTP(page, framework, {
          defaultValue: "123456",
        });
        await page.evaluate(() => document.fonts.ready);
        const inputBox = (await input.boundingBox())!;
        const slotBox = (await page
          .locator(".cheese-pin-slot")
          .nth(1)
          .boundingBox())!;
        await input.click({
          position: {
            x: slotBox.x + slotBox.width / 2 - inputBox.x,
            y: inputBox.height / 2,
          },
        });
        const caret = await input.evaluate(
          (node: HTMLInputElement) => node.selectionStart!,
        );
        // Engines place a caret on either side of a glyph at its midpoint.
        expect([1, 2]).toContain(caret);
        await expectSelection(input, caret);
        await input.press("Backspace");
        await expect(input).toHaveValue(caret === 1 ? "23456" : "13456");
        await expect(input).toBeFocused();
        await expectSelection(input, caret - 1);
      }
    });

    test("paste sanitizes formatted codes before the length limit and replaces selections", async ({
      page,
    }) => {
      const input = await openOTP(page, framework);
      for (const formatted of ["123 456", "123-456"]) {
        await input.fill("");
        await paste(input, formatted);
        await expect(input).toHaveValue("123456");
        await expect(page.locator(".cheese-pin-slot")).toHaveText(
          "123456".split(""),
        );
        await expectSelection(input, 6);
      }
      // Select from the known end position; Home has native OS-specific meaning.
      await input.press("ArrowLeft");
      await input.press("ArrowLeft");
      await input.press("Shift+ArrowLeft");
      await input.press("Shift+ArrowLeft");
      await expectSelection(input, 2, 4);
      await paste(input, "9 0");
      await expect(input).toHaveValue("129056");
      await expectSelection(input, 4);
      await expect(input).toBeFocused();
      await paste(input, "88");
      await expect(input).toHaveValue("129056");
      await expectSelection(input, 4);
      await input.selectText();
      await paste(input, "98-76 54 321");
      await expect(input).toHaveValue("987654");
      await expectSelection(input, 6);
      expect(
        await page.evaluate(() =>
          window.businessEvents
            .filter((event) => event.kind === "otp-complete")
            .map((event) => event.query),
        ),
      ).toEqual(["123456", "123456", "129056", "987654"]);
    });

    test("formatted paste emits one input event through the public, form and model contracts", async ({
      page,
    }) => {
      const input = await openOTP(page, framework, {
        controlled: "",
        events: "",
        defaultValue: "12",
      });
      await page.locator("#otp-form").evaluate((form) => {
        form.addEventListener("input", (event) => {
          const inputEvent = event as InputEvent;
          window.businessEvents.push({
            kind: "otp-native-input",
            query: JSON.stringify({
              value: (event.target as HTMLInputElement).value,
              inputType: inputEvent.inputType,
              data: inputEvent.data,
              bubbles: event.bubbles,
              composed: event.composed,
            }),
          });
        });
      });
      await input.focus();
      await input.press("End");
      await paste(input, "3-456");
      await expect(input).toHaveValue("123456");
      await expect(page.getByLabel("Controlled OTP value")).toHaveText(
        "123456",
      );
      const delivered = await page.evaluate(() =>
        window.businessEvents.filter((event) => event.kind !== "otp-paste"),
      );
      for (const kind of [
        "otp-public-input",
        "otp-form-input",
        "otp-native-input",
      ]) {
        const events = delivered.filter((event) => event.kind === kind);
        expect(events).toHaveLength(1);
        expect(JSON.parse(events[0].query)).toEqual({
          value: "123456",
          inputType: "insertFromPaste",
          data: "3456",
          bubbles: true,
          composed: true,
        });
      }
      for (const kind of ["otp-change", "otp-complete"])
        expect(delivered.filter((event) => event.kind === kind)).toEqual([
          { kind, query: "123456" },
        ]);

      // Neither a full field nor replacing it with the same code dirties it.
      await paste(input, "999");
      await expect(input).toHaveValue("123456");
      expect(
        await page.evaluate(() =>
          window.businessEvents.filter((event) => event.kind !== "otp-paste"),
        ),
      ).toEqual(delivered);
      await input.selectText();
      await paste(input, "123-456");
      await expect(input).toHaveValue("123456");
      expect(
        await page.evaluate(() =>
          window.businessEvents.filter((event) => event.kind !== "otp-paste"),
        ),
      ).toEqual(delivered);
    });

    test("the public ref focuses the single native input", async ({ page }) => {
      const input = await openOTP(page, framework, { ref: "", events: "" });
      await page
        .getByRole("button", { name: "Focus OTP ref", exact: true })
        .click();
      await expect(input).toBeFocused();
      await expect(page.getByRole("textbox")).toHaveCount(1);
      expect(
        await page.evaluate(() =>
          window.businessEvents.filter((event) => event.kind === "otp-ref"),
        ),
      ).toEqual([{ kind: "otp-ref", query: "true" }]);
      await input.pressSequentially("123456");
      await expect(input).toHaveValue("123456");
      await expect(page.locator(".cheese-pin-slot")).toHaveText(
        "123456".split(""),
      );
    });

    test("a caller can cancel paste before it changes the value or selection", async ({
      page,
    }) => {
      const input = await openOTP(page, framework, {
        cancelPaste: "",
        defaultValue: "123456",
      });
      await input.focus();
      await input.selectText();
      await paste(input, "654-321");
      await expect(input).toHaveValue("123456");
      await expectSelection(input, 0, 6);
      await expect(page.locator(".cheese-pin-slot")).toHaveText(
        "123456".split(""),
      );
      expect(
        await page.evaluate(() =>
          window.businessEvents.filter((event) =>
            event.kind.startsWith("otp-"),
          ),
        ),
      ).toEqual([{ kind: "otp-paste", query: "654-321" }]);
    });

    test("external form validation, submission and reset retain one native code value", async ({
      page,
    }) => {
      const input = await openOTP(page, framework, {
        external: "",
        defaultValue: "12",
      });
      const submit = page.getByRole("button", {
        name: "Submit OTP",
        exact: true,
      });
      const result = page.getByLabel("Form result", { exact: true });
      await expect(page.locator("#otp-form input")).toHaveCount(0);
      await expect(input).toHaveAttribute("form", "otp-form");
      await input.fill("");
      await submit.click();
      await expect(input).toBeFocused();
      await expect(page.getByRole("alert")).toHaveText(
        "인증 코드를 입력해 주세요.",
      );
      await expect(result).toBeEmpty();
      await input.fill("123");
      await submit.click();
      await expect(page.getByRole("alert")).toHaveText(
        "숫자 6자리 인증 코드를 입력해 주세요.",
      );
      await input.selectText();
      await paste(input, "123 456");
      await expect(page.getByRole("alert")).toHaveCount(0);
      await submit.click();
      await expect(result).toHaveText('[["code","123456"]]');
      await page
        .getByRole("button", { name: "Reset OTP", exact: true })
        .click();
      await expect(input).toHaveValue("12");
      await expect(page.locator(".cheese-pin-slot")).toHaveText([
        "1",
        "2",
        "",
        "",
        "",
        "",
      ]);
      await expect(result).toBeEmpty();
      await expect(input).not.toHaveAttribute("aria-invalid", "true");
    });

    test("disabled and readonly transitions clear obsolete errors and preserve form semantics", async ({
      page,
    }) => {
      const input = await openOTP(page, framework, { lifecycle: "" });
      const submit = page.getByRole("button", {
        name: "Submit OTP",
        exact: true,
      });
      await submit.click();
      await expect(page.getByRole("alert")).toBeVisible();
      await page.getByRole("button", { name: "Toggle disabled OTP" }).click();
      await expect(input).toBeDisabled();
      await paste(input, "654-321");
      await expect(input).toHaveValue("");
      await expect(page.getByRole("alert")).toHaveCount(0);
      await expect(input).not.toHaveAttribute("aria-invalid", "true");
      await submit.click();
      await expect(page.getByLabel("Form result", { exact: true })).toHaveText(
        "[]",
      );
      await page.getByRole("button", { name: "Toggle disabled OTP" }).click();
      await input.fill("123");
      await submit.click();
      await expect(page.getByRole("alert")).toBeVisible();
      await page.getByRole("button", { name: "Toggle readonly OTP" }).click();
      await expect(input).not.toBeEditable();
      await paste(input, "654-321");
      await expect(input).toHaveValue("123");
      await expect(page.getByRole("alert")).toHaveCount(0);
      await expect(input).not.toHaveAttribute("aria-invalid", "true");
      await input.focus();
      // WebKit maps Backspace in readonly controls to browser history. Test
      // mutation prevention with Delete; editable Backspace is covered above.
      await input.press("Delete");
      await input.pressSequentially("9");
      await expect(input).toHaveValue("123");
      await submit.click();
      await expect(page.getByLabel("Form result", { exact: true })).toHaveText(
        '[["code","123"]]',
      );
      await page.getByRole("button", { name: "Toggle readonly OTP" }).click();
      await expect(input).toBeEditable();
      if (framework === "vue") {
        const readonly = await openOTP(page, framework, {
          readonly: "",
          defaultValue: "123",
        });
        await expect(readonly).not.toBeEditable();
        await paste(readonly, "654-321");
        await expect(readonly).toHaveValue("123");
      }
    });

    test("controlled updates and parent replacement keep the native value and slots synchronized", async ({
      page,
    }) => {
      const input = await openOTP(page, framework, { controlled: "" });
      await input.fill("12");
      await paste(input, "3-456");
      await expect(input).toHaveValue("123456");
      await expect(page.getByLabel("Controlled OTP value")).toHaveText(
        "123456",
      );
      await expect(page.locator(".cheese-pin-slot")).toHaveText(
        "123456".split(""),
      );
      await page.getByRole("button", { name: "Set controlled OTP" }).click();
      await expect(input).toHaveValue("654321");
      await expect(page.locator(".cheese-pin-slot")).toHaveText(
        "654321".split(""),
      );
      await page
        .getByRole("button", { name: "Submit OTP", exact: true })
        .click();
      await expect(page.getByLabel("Form result", { exact: true })).toHaveText(
        '[["code","654321"]]',
      );
    });

    test("a controlled owner can reject edits and retains its value on reset", async ({
      page,
    }) => {
      const input = await openOTP(page, framework, {
        controlled: "",
        hold: "",
        value: "112233",
        defaultValue: "123456",
      });
      await input.focus();
      await input.selectText();
      await paste(input, "654 321");
      await expect(input).toHaveValue("112233");
      await expect(page.getByLabel("Controlled OTP value")).toHaveText(
        "112233",
      );
      await expect(page.locator(".cheese-pin-slot")).toHaveText(
        "112233".split(""),
      );
      expect(
        await page.evaluate(() =>
          window.businessEvents.filter((event) => event.kind === "otp-change"),
        ),
      ).toEqual([{ kind: "otp-change", query: "654321" }]);
      await page
        .getByRole("button", { name: "Reset OTP", exact: true })
        .click();
      await expect(input).toHaveValue("112233");
      await expect(page.locator(".cheese-pin-slot")).toHaveText(
        "112233".split(""),
      );
    });
  });
}
