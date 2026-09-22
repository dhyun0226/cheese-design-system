import { expect, test, type Locator } from "@playwright/test";

async function entries(form: Locator) {
  return form.evaluate((node) => [...new FormData(node as HTMLFormElement)]);
}

for (const framework of ["react", "vue"]) {
  test.describe(`${framework} field form contracts`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(
        `/tests/fixtures/field-contracts.html?framework=${framework}`,
      );
    });

    test("required saved values block submission with or without a name and retain first invalid focus", async ({
      page,
    }) => {
      const form = page.getByRole("form", { name: "필수 편집", exact: true });
      const first = form.getByRole("textbox", { name: "선행 필드" });
      const title = form.getByRole("textbox", {
        name: "필수 제목",
        exact: true,
      });
      const description = form.getByRole("textbox", {
        name: "필수 설명",
        exact: true,
      });
      await form.getByRole("button", { name: "편집 제출" }).click();
      await expect(page.getByTestId("required-data")).toBeEmpty();
      await expect(first).toBeFocused();
      await expect(title).toBeVisible();
      await expect(description).toBeVisible();
      await first.fill("선행 내용");
      await form.getByRole("button", { name: "편집 제출" }).click();
      await expect(title).toBeFocused();
      await title.fill("저장 전 제목");
      await form.getByRole("button", { name: "편집 제출" }).click();
      await expect(page.getByTestId("required-data")).toBeEmpty();
      await expect(form.getByRole("alert").first()).toHaveText(
        "변경 내용을 저장해 주세요.",
      );
      await title.press("Enter");
      await form.getByRole("button", { name: "편집 제출" }).click();
      await expect(description).toBeFocused();
      await description.fill("설명");
      await description.press("Enter");
      await form.getByRole("button", { name: "편집 제출" }).click();
      await expect(page.getByTestId("required-data")).toContainText(
        '["title","저장 전 제목"]',
      );
      await expect
        .poll(() => entries(form))
        .toEqual([
          ["first", "선행 내용"],
          ["title", "저장 전 제목"],
        ]);

      // Drafts are not committed form values. A blank draft must not invalidate saved text.
      await form.getByRole("button", { name: "필수 제목 수정" }).click();
      await title.fill("");
      expect(
        await form.evaluate((node) =>
          (node as HTMLFormElement).checkValidity(),
        ),
      ).toBe(true);
      await expect
        .poll(() => entries(form))
        .toContainEqual(["title", "저장 전 제목"]);
    });

    test("required ratings validate named and unnamed groups and reset their selection", async ({
      page,
    }) => {
      const form = page.getByRole("form", { name: "필수 평점", exact: true });
      const named = form.getByRole("radiogroup", {
        name: "업무 평점",
        exact: true,
      });
      const unnamed = form.getByRole("radiogroup", {
        name: "이름 없는 평점",
        exact: true,
      });
      await form.getByRole("button", { name: "평점 제출" }).click();
      await expect(page.getByTestId("rating-submits")).toHaveText("0");
      await expect(
        named.getByRole("radio", { name: "1점", exact: true }),
      ).toBeFocused();
      await named.getByRole("radio", { name: "3점", exact: true }).click();
      await form.getByRole("button", { name: "평점 제출" }).click();
      await expect(page.getByTestId("rating-submits")).toHaveText("0");
      await expect(
        unnamed.getByRole("radio", { name: "1점", exact: true }),
      ).toBeFocused();
      await unnamed.getByRole("radio", { name: "4점", exact: true }).click();
      await form.getByRole("button", { name: "평점 제출" }).click();
      await expect(page.getByTestId("rating-submits")).toHaveText("1");
      await expect.poll(() => entries(form)).toEqual([["rating", "3"]]);
      await page.getByLabel("초기화 취소").check();
      await form.getByRole("button", { name: "평점 초기화" }).click();
      await expect(
        named.getByRole("radio", { name: "3점", exact: true }),
      ).toBeChecked();
      await expect(
        unnamed.getByRole("radio", { name: "4점", exact: true }),
      ).toBeChecked();
      await page.getByLabel("초기화 취소").uncheck();
      await form.getByRole("button", { name: "평점 초기화" }).click();
      await expect(named.getByRole("radio", { checked: true })).toHaveCount(0);
      await expect(unnamed.getByRole("radio", { checked: true })).toHaveCount(
        0,
      );
      await form.getByRole("button", { name: "평점 제출" }).click();
      await expect(page.getByTestId("rating-submits")).toHaveText("1");
      await page.getByLabel("필드 비활성화", { exact: true }).check();
      await form.getByRole("button", { name: "평점 제출" }).click();
      await expect(page.getByTestId("rating-submits")).toHaveText("2");
      await expect.poll(() => entries(form)).toEqual([]);
    });

    for (const controlled of [false, true]) {
      test(`reset clears drafts and errors while canceled reset preserves pending edits (${controlled ? "controlled" : "uncontrolled"})`, async ({
        page,
      }) => {
        await page.goto(
          `/tests/fixtures/field-contracts.html?framework=${framework}&controlled=${controlled}`,
        );
        const form = page.getByRole("form", { name: "임시 입력", exact: true });
        const tags = form.getByRole("textbox", {
          name: "업무 태그",
          exact: true,
        });
        const title = form.getByRole("textbox", {
          name: "업무 제목",
          exact: true,
        });
        await tags.fill("저장 태그");
        await tags.press("Enter");
        await tags.fill("저장 전 태그");
        await form.getByRole("button", { name: "업무 제목 수정" }).click();
        await title.fill("저장 전 업무");
        await form.getByRole("button", { name: "임시 입력 초기화" }).click();
        await expect(tags).toHaveValue("");
        await expect(title).toHaveCount(0);
        await tags.press("Enter");
        await expect
          .poll(() => entries(form))
          .toEqual([
            ["tags", "기본"],
            ["title", "기본 업무"],
          ]);
        await expect(form.getByRole("status")).toBeEmpty();

        await tags.fill("보존 태그");
        await form.getByRole("button", { name: "업무 제목 수정" }).click();
        await title.fill("보존 업무");
        await page.getByLabel("초기화 취소").check();
        await form.getByRole("button", { name: "임시 입력 초기화" }).click();
        await expect(tags).toHaveValue("보존 태그");
        await expect(title).toHaveValue("보존 업무");
        await tags.press("Enter");
        await title.press("Enter");
        await expect
          .poll(() => entries(form))
          .toEqual([
            ["tags", "기본"],
            ["tags", "보존 태그"],
            ["title", "보존 업무"],
          ]);

        await form.getByRole("button", { name: "업무 제목 수정" }).click();
        await title.fill("");
        await title.press("Enter");
        await expect(form.getByRole("alert")).toBeVisible();
        await page.getByLabel("초기화 취소").uncheck();
        await form.getByRole("button", { name: "임시 입력 초기화" }).click();
        await expect(form.getByRole("alert")).toHaveCount(0);
        await form.getByRole("button", { name: "업무 제목 수정" }).click();
        await expect(title).toHaveValue("기본 업무");
      });

      test(`period navigation preserves one submitted value and respects reset and disabled controls (${controlled ? "controlled" : "uncontrolled"})`, async ({
        page,
      }) => {
        await page.goto(
          `/tests/fixtures/field-contracts.html?framework=${framework}&controlled=${controlled}`,
        );
        const form = page.getByRole("form", { name: "기간 제출", exact: true });
        await expect
          .poll(() => entries(form))
          .toEqual([
            ["month", "2026-09"],
            ["year", "2026"],
          ]);
        await form
          .getByRole("button", { name: "다음 연도", exact: true })
          .click();
        await form
          .getByRole("button", { name: "다음 연도 범위", exact: true })
          .click();
        await expect
          .poll(() => entries(form))
          .toEqual([
            ["month", "2026-09"],
            ["year", "2026"],
          ]);
        await form
          .getByRole("radio", { name: "2027년 2월", exact: true })
          .click();
        await form.getByRole("radio", { name: "2030", exact: true }).click();
        await expect
          .poll(() => entries(form))
          .toEqual([
            ["month", "2027-02"],
            ["year", "2030"],
          ]);
        await page.getByLabel("초기화 취소").check();
        await form.getByRole("button", { name: "기간 초기화" }).click();
        await expect
          .poll(() => entries(form))
          .toEqual([
            ["month", "2027-02"],
            ["year", "2030"],
          ]);
        await page.getByLabel("초기화 취소").uncheck();
        await form.getByRole("button", { name: "기간 초기화" }).click();
        await expect
          .poll(() => entries(form))
          .toEqual([
            ["month", "2026-09"],
            ["year", "2026"],
          ]);
        await expect(
          form.getByRole("radio", { name: "2026년 9월", exact: true }),
        ).toBeChecked();
        await expect(
          form.getByRole("radio", { name: "2026", exact: true }),
        ).toBeChecked();
        await page.getByLabel("필드 비활성화", { exact: true }).check();
        await expect.poll(() => entries(form)).toEqual([]);
        await page.getByLabel("필드 비활성화", { exact: true }).uncheck();
        await page.getByLabel("폼 그룹 비활성화").check();
        await expect.poll(() => entries(form)).toEqual([]);
      });
    }
  });
}
