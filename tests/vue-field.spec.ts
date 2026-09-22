import { test, expect } from "@playwright/test";
import {
  createSSRApp,
  createCommentVNode,
  createTextVNode,
  Fragment,
  h,
} from "vue";
import { renderToString } from "vue/server-renderer";
let Field: typeof import("@cheese/vue").Field;
let Input: typeof import("@cheese/vue").Input;

test.beforeAll(async () => {
  // The published package is ESM-only; keep this import native in Playwright.
  ({ Field, Input } = await import("@cheese/vue"));
});

test("Vue Field skips slot comments and text while preserving the input's form and label contracts", async ({
  page,
}) => {
  const html = await renderToString(
    createSSRApp({
      render: () =>
        h("form", { id: "profile" }, [
          h("p", { id: "existing-help" }, "팀 디렉터리에 표시됩니다."),
          h(
            Field,
            {
              label: "이름",
              required: true,
              description: "이름을 입력하세요.",
            },
            {
              default: () => [
                createCommentVNode("입력 설명"),
                createTextVNode("\n  "),
                h(Input, {
                  id: "name-control",
                  name: "name",
                  "aria-describedby": "existing-help",
                }),
              ],
            },
          ),
        ]),
    }),
  );
  await page.setContent(html);
  const input = page.getByRole("textbox", { name: "이름", exact: true });
  await expect(input).toHaveCount(1);
  await expect(input).toHaveAttribute("id", "name-control");
  await expect(input).toHaveAttribute("required", "");
  await expect(input).toHaveAccessibleDescription(
    "팀 디렉터리에 표시됩니다. 이름을 입력하세요.",
  );
  expect(
    await input.evaluate(
      (node: HTMLInputElement) => node.validity.valueMissing,
    ),
  ).toBe(true);
  await page.locator("label").click();
  await expect(input).toBeFocused();
  await input.fill("김담당");
  expect(
    await page
      .locator("form")
      .evaluate((form: HTMLFormElement) =>
        Object.fromEntries(new FormData(form)),
      ),
  ).toEqual({ name: "김담당" });
});

test("Vue Field resolves a control through nested fragments and connects its error", async ({
  page,
}) => {
  const html = await renderToString(
    createSSRApp({
      render: () =>
        h(
          Field,
          {
            id: "email-field",
            label: "이메일",
            description: "업무용 이메일을 입력하세요.",
            error: "사용 중인 이메일입니다.",
          },
          {
            default: () => [
              h(Fragment, [createCommentVNode("빈 조건부 입력")]),
              h(Fragment, [
                createTextVNode(" "),
                h(Fragment, [
                  createCommentVNode("템플릿 설명"),
                  h("input", {
                    id: "child-id",
                    name: "email",
                    type: "email",
                    required: true,
                    "aria-invalid": false,
                  }),
                ]),
              ]),
            ],
          },
        ),
    }),
  );
  await page.setContent(html);
  const input = page.getByRole("textbox", { name: "이메일", exact: true });
  await expect(input).toHaveCount(1);
  await expect(input).toHaveAttribute("id", "email-field");
  await expect(input).toHaveAttribute("required", "");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(input).toHaveAccessibleDescription("사용 중인 이메일입니다.");
  await expect(page.getByRole("alert")).toHaveText("사용 중인 이메일입니다.");
  await expect(page.getByText("업무용 이메일을 입력하세요.")).toHaveCount(0);
  await page.locator("label").click();
  await expect(input).toBeFocused();
});

test("Vue Field safely leaves an empty conditional slot without inventing a control", async ({
  page,
}) => {
  for (const visible of [false, true]) {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(
            Field,
            { label: "추가 정보", description: "필요할 때 입력하세요." },
            {
              default: () => [
                createCommentVNode("조건부 입력"),
                h(Fragment, [
                  visible
                    ? h(Input, { name: "detail" })
                    : createCommentVNode("v-if"),
                ]),
              ],
            },
          ),
      }),
    );
    await page.setContent(html);
    await expect(page.locator("label")).toHaveText("추가 정보");
    await expect(page.getByText("필요할 때 입력하세요.")).toBeVisible();
    await expect(page.getByRole("textbox")).toHaveCount(visible ? 1 : 0);
    if (visible) {
      const input = page.getByRole("textbox", {
        name: "추가 정보",
        exact: true,
      });
      await expect(input).toHaveAccessibleDescription("필요할 때 입력하세요.");
      await page.locator("label").click();
      await expect(input).toBeFocused();
    }
  }
});
