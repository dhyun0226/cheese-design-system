import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function entries(page: Page) {
  return page
    .getByRole("form", { name: "검색 폼" })
    .evaluate((node) => [...new FormData(node as HTMLFormElement)]);
}

for (const framework of ["react", "vue"]) {
  test.describe(`${framework} SearchInput`, () => {
    async function open(page: Page, query = "") {
      await page.goto(
        `/tests/fixtures/search-input.html?framework=${framework}${query}`,
      );
      return page.getByRole("searchbox", { name: "업무 검색" });
    }

    test("searches on Enter without submitting and clears with focus and native input attributes intact", async ({
      page,
    }) => {
      const input = await open(page);
      await expect(input).toHaveAttribute("type", "search");
      await expect(input).toHaveAttribute("autocomplete", "off");
      await expect(input).toHaveAccessibleDescription(
        "제목 또는 담당자로 검색하세요.",
      );
      await input.fill("인사 업무");
      await input.press("Enter");
      await expect(page.getByTestId("searches")).toHaveText('["인사 업무"]');
      await expect(page.getByTestId("submits")).toHaveText("0");
      await expect.poll(() => entries(page)).toEqual([["query", "인사 업무"]]);
      await page.getByRole("button", { name: "업무 검색 지우기" }).click();
      await expect(input).toHaveValue("");
      await expect(input).toBeFocused();
      await expect(
        page.getByRole("button", { name: "업무 검색 지우기" }),
      ).toHaveCount(0);
      await expect(page.getByTestId("changes")).toHaveText('["인사 업무",""]');
      await expect(page.getByTestId("searches")).toHaveText('["인사 업무"]');
      await expect.poll(() => entries(page)).toEqual([["query", ""]]);
    });

    test("Escape clears once and lets ancestors distinguish consumed and unconsumed presses", async ({
      page,
    }) => {
      const input = await open(page);
      await input.press("Escape");
      await expect(input).toHaveValue("");
      await expect(input).toBeFocused();
      await input.press("Escape");
      await expect(page.getByTestId("escapes")).toHaveText("[true,false]");
      await expect(page.getByTestId("changes")).toHaveText('[""]');
      await expect(page.getByTestId("key-count")).toHaveText("2");
    });

    test("composition Enter and legacy keyCode 229 do not search and native composition callbacks remain usable", async ({
      page,
    }) => {
      const input = await open(page);
      await input.fill("한글");
      // Firefox's native text insertion already emits a trusted composition
      // cycle. Measure only the explicit cycle exercised below.
      const previousCompositions = JSON.parse(
        (await page.getByTestId("compositions").textContent())!,
      ) as number[];
      await input.evaluate((node) => {
        node.dispatchEvent(
          new CompositionEvent("compositionstart", {
            bubbles: true,
            data: "ㅎ",
          }),
        );
        node.dispatchEvent(
          new CompositionEvent("compositionupdate", {
            bubbles: true,
            data: "한",
          }),
        );
        node.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Enter",
            isComposing: true,
            bubbles: true,
            cancelable: true,
          }),
        );
        node.dispatchEvent(
          new CompositionEvent("compositionend", {
            bubbles: true,
            data: "한글",
          }),
        );
        node.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Enter",
            keyCode: 229,
            bubbles: true,
            cancelable: true,
          }),
        );
      });
      await expect(page.getByTestId("searches")).toHaveText("[]");
      await expect(page.getByTestId("submits")).toHaveText("0");
      await expect(page.getByTestId("compositions")).toHaveText(
        JSON.stringify(previousCompositions.map((count) => count + 1)),
      );
      await input.press("Enter");
      await expect(page.getByTestId("searches")).toHaveText('["한글"]');
      await expect(page.getByTestId("key-count")).toHaveText("3");
    });

    test("without a search handler Enter retains native form submission and required validation", async ({
      page,
    }) => {
      const input = await open(page, "&scenario=native");
      await input.press("Enter");
      await expect(page.getByTestId("submits")).toHaveText("0");
      expect(
        await input.evaluate(
          (node) => (node as HTMLInputElement).validity.valueMissing,
        ),
      ).toBe(true);
      await input.fill("승인 요청");
      await input.press("Enter");
      await expect(page.getByTestId("submits")).toHaveText("1");
      await expect(page.getByTestId("result")).toHaveText(
        '[["query","승인 요청"]]',
      );
      await expect(page.getByTestId("searches")).toHaveText("[]");
    });

    test("a controlled owner can reject edits and clearing without DOM or FormData divergence", async ({
      page,
    }) => {
      const input = await open(page, "&scenario=reject");
      await input.fill("무시할 변경");
      await expect(input).toHaveValue("저장 업무");
      await expect.poll(() => entries(page)).toEqual([["query", "저장 업무"]]);
      await page.getByRole("button", { name: "업무 검색 지우기" }).click();
      await expect(input).toHaveValue("저장 업무");
      await expect(input).toBeFocused();
      await input.press("Enter");
      await expect(page.getByTestId("searches")).toHaveText('["저장 업무"]');
      await expect(page.getByTestId("changes")).toHaveText(
        '["무시할 변경",""]',
      );
      await expect.poll(() => entries(page)).toEqual([["query", "저장 업무"]]);
    });

    test("a controlled owner normalizes the visible value used for search and form submission", async ({
      page,
    }) => {
      const input = await open(page, "&scenario=normalize");
      await input.fill("task-42");
      await expect(input).toHaveValue("TASK-42");
      await input.press("Enter");
      await expect(page.getByTestId("searches")).toHaveText('["TASK-42"]');
      await page.getByRole("button", { name: "폼 제출" }).click();
      await expect(page.getByTestId("result")).toHaveText(
        '[["query","TASK-42"]]',
      );
    });

    test("native reset restores the uncontrolled default and canceled reset leaves the draft and callbacks unchanged", async ({
      page,
    }) => {
      const input = await open(page);
      await input.fill("진행 중 업무");
      await page.getByLabel("초기화 취소").check();
      await page.getByRole("button", { name: "검색 초기화" }).click();
      await expect(input).toHaveValue("진행 중 업무");
      await expect(page.getByTestId("resets")).toHaveText("1");
      await expect(page.getByTestId("changes")).toHaveText('["진행 중 업무"]');
      await page.getByLabel("초기화 취소").uncheck();
      await page.getByRole("button", { name: "검색 초기화" }).click();
      await expect(input).toHaveValue("기본 업무");
      await expect(page.getByTestId("resets")).toHaveText("2");
      await expect(page.getByTestId("changes")).toHaveText(
        '["진행 중 업무","기본 업무"]',
      );
      await expect.poll(() => entries(page)).toEqual([["query", "기본 업무"]]);
      await expect(page.getByTestId("searches")).toHaveText("[]");
    });

    test("controlled resets preserve the current owner value and external form controls reset through their associated form", async ({
      page,
    }) => {
      let input = await open(page, "&scenario=controlled&external");
      await input.fill("외부 검색");
      await page.getByRole("button", { name: "검색 초기화" }).click();
      await expect(input).toHaveValue("외부 검색");
      await expect.poll(() => entries(page)).toEqual([["query", "외부 검색"]]);
      input = await open(page, "&external");
      await input.fill("외부 검색");
      await page.getByRole("button", { name: "폼 제출" }).click();
      await expect(page.getByTestId("result")).toHaveText(
        '[["query","외부 검색"]]',
      );
      await page.getByRole("button", { name: "검색 초기화" }).click();
      await expect(input).toHaveValue("기본 업무");
      await expect.poll(() => entries(page)).toEqual([["query", "기본 업무"]]);
    });

    test("disabled and read-only inputs hide clearing and preserve native successful-control semantics", async ({
      page,
    }) => {
      let input = await open(page, "&scenario=disabled");
      await expect(input).toBeDisabled();
      await expect(
        page.getByRole("button", { name: "업무 검색 지우기" }),
      ).toHaveCount(0);
      await expect.poll(() => entries(page)).toEqual([]);
      input = await open(page, "&scenario=readonly");
      await expect(input).toHaveAttribute("readonly", "");
      await expect(
        page.getByRole("button", { name: "업무 검색 지우기" }),
      ).toHaveCount(0);
      await input.press("Escape");
      await expect(input).toHaveValue("기본 업무");
      await expect(page.getByTestId("changes")).toHaveText("[]");
      await expect.poll(() => entries(page)).toEqual([["query", "기본 업무"]]);
    });

    test("the labeled search input is accessible and usable at a 320px viewport", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 900 });
      const input = await open(page);
      await expect(input).toBeVisible();
      await expect(
        page.getByRole("button", { name: "업무 검색 지우기" }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      await page.getByRole("button", { name: "업무 검색 지우기" }).focus();
      await page
        .getByRole("button", { name: "업무 검색 지우기" })
        .press("Enter");
      await expect(input).toHaveValue("");
      await expect(input).toBeFocused();
    });
  });
}
