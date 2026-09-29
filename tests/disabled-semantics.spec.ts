import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

for (const framework of ["react", "vue"] as const) {
  test(`${framework} disabled tags stay readable, retain values and leave the tab order`, async ({
    page,
  }) => {
    await page.goto(
      `/tests/fixtures/field-contracts.html?framework=${framework}&controlled=true`,
    );
    const form = page.getByRole("form", { name: "임시 입력" });
    const input = form.getByRole("textbox", { name: "업무 태그" });
    const tags = form.locator(".cheese-tag");
    await input.fill("추가");
    await input.press("Enter");
    await expect(tags).toHaveText(["기본", "추가"]);

    await page.getByRole("checkbox", { name: "필드 비활성화" }).check();
    await expect(input).toBeDisabled();
    await expect(
      form.getByRole("button", { name: "기본 삭제" }),
    ).toBeDisabled();
    const remove = form.getByRole("button", { name: "추가 삭제" });
    await expect(remove).toBeDisabled();
    await remove.evaluate((button: HTMLButtonElement) => button.click());
    await expect(tags).toHaveText(["기본", "추가"]);
    expect(
      await form.evaluate((node: HTMLFormElement) =>
        new FormData(node).getAll("tags"),
      ),
    ).toEqual([]);

    await page.getByRole("button", { name: "평점 초기화" }).focus();
    await page.keyboard.press("Tab");
    await expect(
      form.getByRole("button", { name: "업무 제목 수정" }),
    ).toBeFocused();
    expect(
      (await new AxeBuilder({ page }).include(".cheese-tags").analyze())
        .violations,
    ).toEqual([]);

    await page.getByRole("checkbox", { name: "필드 비활성화" }).uncheck();
    await expect(input).toBeEnabled();
    expect(
      await form.evaluate((node: HTMLFormElement) =>
        new FormData(node).getAll("tags"),
      ),
    ).toEqual(["기본", "추가"]);
    await remove.click();
    await expect(tags).toHaveText(["기본"]);
    await expect(input).toBeFocused();
  });
}

test("Vue listbox announces disabled options and skips them during selection", async ({
  page,
}) => {
  await page.goto("/vue.html");
  const list = page.getByRole("listbox", { name: "Vue 조직 목록" });
  const unavailable = list.getByRole("option", { name: "비활성 조직" });
  await expect(unavailable).toHaveAttribute("aria-disabled", "true");
  await expect(unavailable).toBeDisabled();
  expect(await unavailable.evaluate((node) => node.tagName)).toBe("BUTTON");
  await expect(unavailable).toHaveAttribute("type", "button");

  await list.getByRole("option", { name: /피플팀/ }).focus();
  await page.keyboard.press("End");
  const available = list.getByRole("option", { name: /개발팀/ });
  await expect(available).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(available).toHaveAttribute("aria-selected", "true");
  await unavailable.evaluate((button: HTMLButtonElement) => button.click());
  await expect(available).toHaveAttribute("aria-selected", "true");
  await expect(unavailable).toHaveAttribute("aria-selected", "false");
  expect(
    (await new AxeBuilder({ page }).include(".cheese-listbox").analyze())
      .violations,
  ).toEqual([]);
});

test("disabled Vue listbox exposes its state and has no sequential keyboard stop", async ({
  page,
}) => {
  const { Listbox } = await import("@cheese/vue");
  const html = await renderToString(
    createSSRApp({
      render: () =>
        h("main", [
          h("button", "이전"),
          h(Listbox, {
            label: "고정 조직",
            disabled: true,
            defaultValue: "people",
            options: [
              { value: "people", label: "피플팀" },
              { value: "tech", label: "개발팀" },
            ],
          }),
          h("button", "다음"),
        ]),
    }),
  );
  await page.setContent(html);
  const list = page.getByRole("listbox", { name: "고정 조직" });
  await expect(list).toHaveAttribute("aria-disabled", "true");
  await expect(list).toHaveAttribute("tabindex", "-1");
  const options = list.getByRole("option");
  await expect(options).toHaveCount(2);
  for (const option of await options.all()) {
    await expect(option).toHaveAttribute("aria-disabled", "true");
    await expect(option).toBeDisabled();
  }
  await page.getByRole("button", { name: "이전" }).focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "다음" })).toBeFocused();
});
