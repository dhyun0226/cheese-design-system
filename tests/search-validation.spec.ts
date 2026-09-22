import { test, expect, type Page } from "@playwright/test";

async function completeRequiredSelections(page: Page) {
  const first = page.getByRole("combobox", { name: "First selection" });
  const second = page.getByRole("combobox", { name: "Second selection" });
  const submit = page.getByRole("button", { name: "Submit selections" });
  const result = page.getByLabel("Form result");
  const count = page.getByLabel("Submit count");

  await submit.click();
  await expect(first).toBeFocused();
  await expect(result).toBeEmpty();
  await expect(count).toHaveText("0");

  await first.click();
  await page.getByRole("option", { name: "하나", exact: true }).click();
  await first.press("Escape");
  await submit.click();
  await expect(second).toBeFocused();
  await expect(result).toBeEmpty();
  await expect(count).toHaveText("0");

  await second.click();
  await page.getByRole("option", { name: "둘", exact: true }).click();
  await second.press("Escape");
  await submit.click();
  await expect(count).toHaveText("1");
  const entries = JSON.parse((await result.textContent())!) as [
    string,
    string,
  ][];
  expect(entries).toContainEqual(["first", "one"]);
  expect(entries).toContainEqual(["second", "two"]);
  expect(entries.some(([name]) => name === "disabled")).toBe(false);
}

for (const framework of ["react", "vue"]) {
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
