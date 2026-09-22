import { expect, test, type Locator, type Page } from "@playwright/test";

async function waitForTable(page: Page) {
  await expect(page.getByRole("table", { name: "직원" })).toHaveAttribute(
    "aria-busy",
    "false",
  );
}

async function composingInput(input: Locator, value: string) {
  // Firefox fill(non-ASCII) runs a complete native composition, including end.
  // Dispatch only the in-progress portion so this check owns the event order.
  await input.evaluate((node, text) => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(node, text);
    node.dispatchEvent(
      new CompositionEvent("compositionupdate", {
        bubbles: true,
        data: text,
      }),
    );
    node.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        data: text,
        inputType: "insertCompositionText",
        isComposing: true,
      }),
    );
  }, value);
}

for (const framework of ["react", "vue"]) {
  test.describe(`${framework} controlled table query`, () => {
    const url = `/tests/fixtures/table-query.html?framework=${framework}`;

    test("external restoration and reset own every query field without feedback", async ({
      page,
    }) => {
      await page.goto(url);
      await page
        .getByRole("button", { name: "외부 복원", exact: true })
        .click();
      await expect(
        page.getByRole("searchbox", { name: "직원 검색" }),
      ).toHaveValue("구성원");
      await expect(
        page.getByRole("columnheader", { name: "이름 정렬" }),
      ).toHaveAttribute("aria-sort", "descending");
      await expect(page.getByText("총 30개 · 3 / 6페이지")).toBeVisible();
      await expect(
        page.getByRole("cell", { name: "구성원 20", exact: true }),
      ).toBeVisible();
      await expect(page.getByTestId("proposal-count")).toHaveText("0");
      await page.getByRole("button", { name: "전체 초기화" }).click();
      await expect(
        page.getByRole("searchbox", { name: "직원 검색" }),
      ).toBeEmpty();
      await expect(page.getByText("총 30개 · 1 / 6페이지")).toBeVisible();
      await expect(
        page.getByRole("cell", { name: "구성원 01", exact: true }),
      ).toBeVisible();
      await expect(page.locator("th[aria-sort]")).toHaveCount(0);
      await expect(page.getByTestId("proposal-count")).toHaveText("0");
    });

    test("user search, sort and page size reset page and emit only accepted intent", async ({
      page,
    }) => {
      await page.goto(url);
      await page
        .getByRole("button", { name: "외부 복원", exact: true })
        .click();
      await page.getByRole("button", { name: "이름 정렬" }).click();
      await expect(page.getByTestId("query")).toContainText('"page":1');
      await page
        .getByRole("button", { name: "외부 복원", exact: true })
        .click();
      await page.getByRole("combobox", { name: "페이지 크기" }).click();
      await page.getByRole("option", { name: "10개씩", exact: true }).click();
      await expect(page.getByText("총 30개 · 1 / 3페이지")).toBeVisible();
      await page
        .getByRole("button", { name: "외부 복원", exact: true })
        .click();
      await page.getByRole("searchbox", { name: "직원 검색" }).fill("디자인");
      await expect(page.getByText("총 15개 · 1 / 3페이지")).toBeVisible();
      await expect(page.getByTestId("proposal-count")).toHaveText("3");
      if (framework === "vue")
        await expect(page.getByTestId("legacy-count")).toHaveText("3");
    });

    test("a rejecting owner keeps query, search and server requests authoritative", async ({
      page,
    }) => {
      await page.goto(url + "&remote=true");
      await waitForTable(page);
      await page.getByLabel("변경 거절").check();
      await page.getByRole("button", { name: "다음 페이지" }).click();
      await page.getByRole("button", { name: "이름 정렬" }).click();
      await page.getByRole("searchbox", { name: "직원 검색" }).fill("디자인");
      await expect(page.getByTestId("proposal-count")).toHaveText("3");
      await expect(
        page.getByRole("searchbox", { name: "직원 검색" }),
      ).toBeEmpty();
      await expect(page.getByText("총 30개 · 1 / 6페이지")).toBeVisible();
      await expect(page.getByTestId("request-count")).toHaveText("1");
      await page.waitForTimeout(300);
      await expect(page.getByTestId("proposal-count")).toHaveText("3");
      await expect(page.getByTestId("request-count")).toHaveText("1");
    });

    test("same-value renders do not refetch and explicit reset cancels pending search", async ({
      page,
    }) => {
      await page.goto(url + "&remote=true");
      await waitForTable(page);
      await page.getByRole("button", { name: "동일 값 재렌더" }).click();
      await page.getByRole("button", { name: "동일 값 재렌더" }).click();
      await page.getByRole("searchbox", { name: "직원 검색" }).fill("디자인");
      await page.getByRole("button", { name: "전체 초기화" }).click();
      await expect(
        page.getByRole("searchbox", { name: "직원 검색" }),
      ).toBeEmpty();
      await page.waitForTimeout(300);
      await expect(page.getByTestId("proposal-count")).toHaveText("0");
      await expect(page.getByTestId("request-count")).toHaveText("1");
      await page.getByRole("searchbox", { name: "직원 검색" }).fill("개발");
      await page
        .getByRole("button", { name: "외부 복원", exact: true })
        .click();
      await page.waitForTimeout(300);
      await expect(
        page.getByRole("searchbox", { name: "직원 검색" }),
      ).toHaveValue("구성원");
      await expect(page.getByTestId("request-count")).toHaveText("2");
      await expect(page.getByTestId("proposal-count")).toHaveText("0");
    });

    test("IME waits for completion and an external reset discards composing text", async ({
      page,
    }) => {
      await page.goto(url);
      const input = page.getByRole("searchbox", { name: "직원 검색" });
      await input.dispatchEvent("compositionstart");
      await composingInput(input, "디자인");
      await page.waitForTimeout(300);
      await expect(page.getByTestId("proposal-count")).toHaveText("0");
      await input.dispatchEvent("compositionend", { data: "디자인" });
      await expect(page.getByTestId("proposal-count")).toHaveText("1");
      await expect(page.getByText("총 15개 · 1 / 3페이지")).toBeVisible();
      await input.dispatchEvent("compositionstart");
      await composingInput(input, "개발");
      await page.getByRole("button", { name: "전체 초기화" }).click();
      await input.dispatchEvent("compositionend", { data: "개발" });
      // Some engines dispatch the final input after compositionend.
      await input.evaluate((node) => {
        Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value",
        )!.set!.call(node, "개발");
        node.dispatchEvent(
          new InputEvent("input", {
            bubbles: true,
            inputType: "insertFromComposition",
            data: "개발",
          }),
        );
      });
      await page.waitForTimeout(300);
      await expect(input).toBeEmpty();
      await expect(page.getByTestId("proposal-count")).toHaveText("1");
      await input.press("a");
      await expect(input).toHaveValue("a");
      await expect(page.getByTestId("proposal-count")).toHaveText("2");
    });

    test("sorting before debounce commits the pending search exactly once", async ({
      page,
    }) => {
      await page.goto(url + "&remote=true");
      await waitForTable(page);
      await page.getByRole("searchbox", { name: "직원 검색" }).fill("디자인");
      await page.getByRole("button", { name: "이름 정렬" }).click();
      await expect(page.getByText("총 15개 · 1 / 3페이지")).toBeVisible();
      await expect(
        page.getByRole("searchbox", { name: "직원 검색" }),
      ).toHaveValue("디자인");
      await expect(
        page.getByRole("columnheader", { name: "이름 정렬" }),
      ).toHaveAttribute("aria-sort", "ascending");
      await page.waitForTimeout(300);
      await expect(page.getByTestId("request-count")).toHaveText("2");
      await expect(page.getByTestId("proposal-count")).toHaveText("1");
    });

    test("initial restored server page and newer query survive stale totals and responses", async ({
      page,
    }) => {
      await page.goto(url + "&remote=true&initialPage=3");
      await waitForTable(page);
      await expect(page.getByText("총 30개 · 3 / 6페이지")).toBeVisible();
      await expect(page.getByTestId("request-count")).toHaveText("1");
      await expect(page.getByTestId("proposal-count")).toHaveText("0");
      await page.getByRole("button", { name: "작은 결과" }).click();
      await expect(page.getByText("총 2개 · 1 / 1페이지")).toBeVisible();
      await page.getByRole("button", { name: "느린 복원" }).click();
      await expect(page.getByTestId("requests")).toContainText(
        '"page":3,"pageSize":5,"search":"slow"',
      );
      await page.getByRole("button", { name: "빠른 복원" }).click();
      await expect(page.getByText("총 30개 · 2 / 6페이지")).toBeVisible();
      await page.waitForTimeout(500);
      await expect(
        page.getByRole("cell", { name: "구성원 06", exact: true }),
      ).toBeVisible();
      await expect(page.getByTestId("proposal-count")).toHaveText("0");
      await expect(page.getByTestId("request-count")).toHaveText("4");
    });

    test("out-of-range page is corrected after its response without a rejecting-owner loop", async ({
      page,
    }) => {
      await page.goto(url + "&remote=true");
      await waitForTable(page);
      await page.getByRole("button", { name: "범위 밖 복원" }).click();
      await expect(page.getByText("총 30개 · 6 / 6페이지")).toBeVisible();
      await expect(page.getByTestId("proposal-count")).toHaveText("1");
      await expect(page.getByTestId("requests")).toContainText('"page":9');
      await page.getByLabel("변경 거절").check();
      await page.getByRole("button", { name: "범위 밖 복원" }).click();
      await expect(page.getByTestId("proposal-count")).toHaveText("2");
      await page.getByRole("button", { name: "동일 값 재렌더" }).click();
      await page.waitForTimeout(300);
      await expect(page.getByTestId("proposal-count")).toHaveText("2");
      await expect(page.getByTestId("request-count")).toHaveText("4");
      await expect(page.getByTestId("query")).toContainText('"page":9');
    });

    test("defaultQuery restores an uncontrolled server page and retains internal navigation", async ({
      page,
    }) => {
      await page.goto(url + "&remote=true&controlled=false&initialPage=3");
      await expect(page.getByText("총 30개 · 3 / 6페이지")).toBeVisible();
      await expect(page.getByTestId("request-count")).toHaveText("1");
      await page.getByRole("button", { name: "다음 페이지" }).click();
      await expect(page.getByText("총 30개 · 4 / 6페이지")).toBeVisible();
      await expect(page.getByTestId("request-count")).toHaveText("2");
    });
  });
}
