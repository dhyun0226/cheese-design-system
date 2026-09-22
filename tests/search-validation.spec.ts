import { test, expect, type Page } from "@playwright/test";

async function completeRequiredSelections(page: Page) {
  const first = page.getByRole("combobox", { name: "First selection" });
  const second = page.getByRole("combobox", { name: "Second selection" });
  const submit = page.getByRole("button", { name: "Submit selections" });
  const result = page.getByLabel("Form result");
  const count = page.getByLabel("Submit count");

  await submit.click();
  await expect(first).toBeFocused();
  await expect(first).toHaveAttribute("aria-invalid", "true");
  await expect(second).toHaveAttribute("aria-invalid", "true");
  await expect(result).toBeEmpty();
  await expect(count).toHaveText("0");

  await first.click();
  await page.getByRole("option", { name: "하나", exact: true }).click();
  await first.press("Escape");
  await submit.click();
  await expect(second).toBeFocused();
  await expect(first).toHaveAttribute("aria-invalid", "false");
  await expect(second).toHaveAttribute("aria-invalid", "true");
  await expect(result).toBeEmpty();
  await expect(count).toHaveText("0");

  await second.click();
  await page.getByRole("option", { name: "둘", exact: true }).click();
  await second.press("Escape");
  await submit.click();
  await expect(count).toHaveText("1");
  await expect(first).toHaveAttribute("aria-invalid", "false");
  await expect(second).toHaveAttribute("aria-invalid", "false");
  const entries = JSON.parse((await result.textContent())!) as [
    string,
    string,
  ][];
  expect(entries).toContainEqual(["first", "one"]);
  expect(entries).toContainEqual(["second", "two"]);
  expect(entries.some(([name]) => name === "disabled")).toBe(false);
}

for (const framework of ["react", "vue"]) {
  for (const local of framework === "react" ? [false, true] : [false])
    test(`${framework} ${local ? "local" : "async/multi"} required searches clear local errors after externally restored values and retain server errors`, async ({
      page,
    }) => {
      await page.goto(
        `/tests/fixtures/search-validation.html?framework=${framework}&scenario=controlled${local ? "&local" : ""}`,
      );
      const first = page.getByRole("combobox", { name: "First selection" });
      const second = page.getByRole("combobox", { name: "Second selection" });
      const submit = page.getByRole("button", { name: "Submit selections" });

      await submit.click();
      await expect(first).toBeFocused();
      await expect(first).toHaveAttribute("aria-invalid", "true");
      await expect(second).toHaveAttribute("aria-invalid", "true");
      await first.press("Escape");
      await page.getByRole("button", { name: "Load saved selections" }).click();
      await expect(first).toHaveValue("하나");
      await expect(first).toHaveAttribute("aria-invalid", "false");
      await expect(second).toHaveAttribute("aria-invalid", "false");
      await expect(page.getByRole("alert")).toHaveCount(0);
      await submit.click();
      await expect(page.getByLabel("Submit count")).toHaveText("1");
      await expect(page.getByLabel("Form result")).toHaveText(
        '[["first","one"],["second","two"]]',
      );

      await page.getByRole("button", { name: "Set server error" }).click();
      await page.getByRole("button", { name: "Load saved selections" }).click();
      await expect(first).toHaveAttribute("aria-invalid", "true");
      await expect(page.getByRole("alert")).toHaveText(
        "담당자 권한을 확인해 주세요.",
      );
    });

  for (const order of ["async-first", "multi-first"]) {
    test(`${framework} ${order} required searches retain the first invalid focus and block incomplete submission`, async ({
      page,
    }) => {
      await page.goto(
        `/tests/fixtures/search-validation.html?framework=${framework}${order === "multi-first" ? "&multi-first" : ""}`,
      );
      await completeRequiredSelections(page);
      await expect(page.getByRole("alert")).toHaveCount(0);
    });
  }

  test(`${framework} required searches preserve focus on an earlier external form control`, async ({
    page,
  }) => {
    await page.goto(
      `/tests/fixtures/search-validation.html?framework=${framework}&external`,
    );
    const title = page.getByRole("textbox", { name: "External title" });
    await page.getByRole("button", { name: "Submit selections" }).click();
    await expect(title).toBeFocused();
    await expect(page.getByLabel("Submit count")).toHaveText("0");
    await title.fill("평가 계획");
    await completeRequiredSelections(page);
    await expect(page.getByLabel("Form result")).toContainText(
      '["title","평가 계획"]',
    );
  });
}

test("React required local Comboboxes retain the first invalid focus until each field is selected", async ({
  page,
}) => {
  await page.goto("/tests/fixtures/search-validation.html?scenario=local");
  await completeRequiredSelections(page);
});
