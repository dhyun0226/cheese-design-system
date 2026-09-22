import { expect, test } from "@playwright/test";

const firstRecord = "01 하반기 평가 준비";

async function edit(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: `${firstRecord} 수정` }).click();
  await page
    .getByRole("textbox", { name: "업무명", exact: true })
    .fill("미저장 업무");
}

test("React document navigation keeps the draft until leaving is confirmed", async ({
  page,
}) => {
  await page.goto("/?source=workflow-test#/workflows");
  await edit(page);
  await page
    .getByRole("navigation", { name: "주요 문서" })
    .getByRole("link", { name: "컴포넌트" })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "수정을 중단하고 이동할까요?",
  });
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/#\/workflows$/);
  await dialog.getByRole("button", { name: "계속 작성" }).click();
  await expect(
    page.getByRole("textbox", { name: "업무명", exact: true }),
  ).toHaveValue("미저장 업무");
  await page
    .getByRole("navigation", { name: "주요 문서" })
    .getByRole("link", { name: "컴포넌트" })
    .click();
  await dialog.getByRole("button", { name: "이동하기" }).click();
  await expect(page).toHaveURL(/#\/components$/);
});

test("React browser Back asks before discarding a draft", async ({ page }) => {
  await page.goto("/#/components");
  await page.evaluate(() => {
    location.hash = "#/workflows";
  });
  await expect(page).toHaveURL(/#\/workflows$/);
  await edit(page);
  await page.evaluate(() => history.back());
  const dialog = page.getByRole("dialog", {
    name: "수정을 중단하고 이동할까요?",
  });
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/#\/workflows$/);
  await dialog.getByRole("button", { name: "계속 작성" }).click();
  await expect(
    page.getByRole("textbox", { name: "업무명", exact: true }),
  ).toHaveValue("미저장 업무");
});

for (const [framework, url] of [
  ["React", "/#/workflows"],
  ["Vue", "/workflow-vue.html"],
] as const) {
  test(`${framework} registers a browser leave warning only for unsaved changes`, async ({
    page,
  }) => {
    await page.goto(url);
    const wouldWarn = () =>
      page.evaluate(() => {
        const event = new Event("beforeunload", { cancelable: true });
        window.dispatchEvent(event);
        return event.defaultPrevented;
      });
    expect(await wouldWarn()).toBe(false);
    await edit(page);
    expect(await wouldWarn()).toBe(true);
  });
}
