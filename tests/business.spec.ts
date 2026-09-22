import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const audit = async (page: Page) =>
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
for (const framework of ["react", "vue"]) {
  test(`${framework} server search cancels old requests, rejects stale results and retries`, async ({
    page,
  }) => {
    await page.goto(`/tests/fixtures/business.html?framework=${framework}`);
    const input = page.getByRole("combobox", { name: "Race search" });
    await input.fill("old");
    await expect
      .poll(() =>
        page.evaluate(() =>
          window.businessEvents.some(
            (item) =>
              item.kind === "search" && item.query === "old" && !item.aborted,
          ),
        ),
      )
      .toBe(true);
    await input.fill("new");
    await expect(
      page.getByRole("option", { name: "new result" }),
    ).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() =>
          window.businessEvents.some(
            (item) =>
              item.kind === "search" && item.query === "old" && item.aborted,
          ),
        ),
      )
      .toBe(true);
    await page.waitForTimeout(750);
    await expect(page.getByRole("option", { name: "old result" })).toHaveCount(
      0,
    );
    await input.fill("fail");
    await expect(page.getByRole("alert")).toHaveText("검색에 실패했습니다.");
    await page.getByRole("button", { name: "다시 검색" }).click();
    await expect(
      page.getByRole("option", { name: "fail result" }),
    ).toBeVisible();
    await input.fill("empty");
    await expect(
      page.getByText("검색 결과가 없습니다.", { exact: true }),
    ).toBeVisible();
    await input.fill("new");
    await expect(
      page.getByRole("option", { name: "new result" }),
    ).toBeVisible();
    await input.press("ArrowDown");
    await input.press("Enter");
    await expect(input).toHaveValue("new result");
    await expect(input).toHaveAttribute("aria-expanded", "false");
    await audit(page);
  });
  test(`${framework} multi selection limits, IME, form values and reset`, async ({
    page,
  }) => {
    await page.goto(`/tests/fixtures/business.html?framework=${framework}`);
    await page.getByRole("button", { name: "Submit contract" }).click();
    await expect(
      page.getByRole("combobox", { name: "Race search" }),
    ).toHaveAttribute("aria-invalid", "true");
    const search = page.getByRole("combobox", { name: "Race search" });
    await search.fill("one");
    await page.getByRole("option", { name: "one result" }).click();
    const input = page.getByRole("combobox", { name: "Form people" });
    await input.click();
    await expect(
      page.getByRole("option", { name: "제외", exact: true }),
    ).toHaveAttribute("aria-disabled", "true");
    await input.dispatchEvent("compositionstart");
    await input.press("Enter");
    await input.dispatchEvent("compositionend");
    await expect(
      page.getByRole("button", { name: "하나 선택 해제" }),
    ).toHaveCount(0);
    await input.press("ArrowDown");
    await input.press("Enter");
    await page.getByRole("option", { name: "둘", exact: true }).click();
    await expect(page.getByText("2개 선택 · 최대 2개")).toBeVisible();
    await expect(
      page.getByRole("option", { name: "셋", exact: true }),
    ).toHaveAttribute("aria-disabled", "true");
    await input.press("Escape");
    await page.getByRole("button", { name: "Submit contract" }).click();
    await expect(page.getByLabel("Form result")).toContainText(
      '["people","one"]',
    );
    await expect(page.getByLabel("Form result")).toContainText(
      '["people","two"]',
    );
    await page.getByRole("button", { name: "둘 선택 해제" }).click();
    await expect(input).toBeFocused();
    await input.press("Escape");
    await page.getByRole("button", { name: "Reset contract" }).click();
    await expect(
      page.getByRole("button", { name: "하나 선택 해제" }),
    ).toHaveCount(0);
    await expect(search).toHaveValue("");
  });
  test(`${framework} table sorts, selects across pages, hides columns and rejects stale data`, async ({
    page,
  }) => {
    await page.goto(`/tests/fixtures/business.html?framework=${framework}`);
    const section = page.getByRole("region", {
      name: "Contract table",
      exact: true,
    });
    await expect(
      section.getByRole("cell", { name: "직원 01", exact: true }),
    ).toBeVisible();
    await section
      .getByRole("checkbox", { name: "현재 페이지 전체 선택" })
      .click();
    await expect(section.getByText("5개 행 선택")).toBeVisible();
    await section.getByRole("button", { name: "다음 페이지" }).click();
    await expect(
      section.getByRole("cell", { name: "직원 06", exact: true }),
    ).toBeVisible();
    await section
      .getByRole("checkbox", { name: "6 행 선택", exact: true })
      .click();
    await expect(section.getByText("6개 행 선택")).toBeVisible();
    await section.getByRole("button", { name: "점수 정렬" }).click();
    await expect(
      section.getByRole("columnheader", { name: "점수 정렬" }),
    ).toHaveAttribute("aria-sort", "ascending");
    await expect(section.locator("tbody tr").first()).toContainText("직원 12");
    await section.locator("summary").click();
    await section.getByRole("checkbox", { name: "점수", exact: true }).click();
    await expect(
      section.getByRole("columnheader", { name: "점수 정렬" }),
    ).toHaveCount(0);
    await section.locator("summary").click();
    const input = section.getByRole("textbox", { name: "Contract table 검색" });
    await input.fill("old");
    await expect
      .poll(() =>
        page.evaluate(() =>
          window.businessEvents.some(
            (item) =>
              item.kind === "table" &&
              JSON.parse(item.query).search === "old" &&
              !item.aborted,
          ),
        ),
      )
      .toBe(true);
    await input.fill("직원 02");
    await expect(
      section.getByRole("cell", { name: "직원 02", exact: true }),
    ).toBeVisible();
    await page.waitForTimeout(750);
    await expect(section.getByText("stale row")).toHaveCount(0);
    await section.getByRole("button", { name: "전체 선택 해제" }).click();
    await expect(section.getByText("0개 행 선택")).toBeVisible();
    const local = page.getByRole("region", {
      name: "Local table",
      exact: true,
    });
    await local.getByRole("button", { name: "점수 정렬" }).click();
    await expect(local.locator("tbody tr").first()).toContainText("직원 12");
    await audit(page);
  });
  test(`${framework} real XHR adapter supports validation, failure and retry`, async ({
    page,
  }) => {
    await page.goto(`/tests/fixtures/business.html?framework=${framework}`);
    const input = page.getByLabel("Contract upload 파일 선택");
    await expect(input).toBeAttached();
    const endpoint = await page
      .locator("html")
      .getAttribute("data-upload-endpoint");
    const received = async (): Promise<{
      calls: number;
      requests: { type: string; body: string }[];
    }> => (await page.request.get(endpoint!)).json();
    await input.setInputFiles({
      name: "bad.exe",
      mimeType: "application/octet-stream",
      buffer: Buffer.from("x"),
    });
    await expect(page.getByRole("alert")).toContainText(
      "지원하지 않는 파일 형식",
    );
    await input.setInputFiles({
      name: "big.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("01234567890"),
    });
    await expect(page.getByRole("alert")).toContainText("파일 크기를 초과");
    await input.setInputFiles({
      name: "ok.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("hello"),
    });
    expect((await received()).calls).toBe(0);
    await page
      .getByRole("button", { name: "ok.txt 업로드", exact: true })
      .click();
    await expect(page.getByRole("alert")).toContainText("업로드에 실패");
    await page.getByRole("button", { name: "ok.txt 재시도" }).click();
    await expect(page.getByText("1개 파일 · 1개 완료")).toBeVisible();
    const { calls, requests } = await received();
    expect(calls).toBe(2);
    expect(requests[1].type).toContain("multipart/form-data; boundary=");
    expect(requests[1].body).toContain('filename="ok.txt"');
    expect(requests[1].body).toContain("hello");
    await page.getByRole("button", { name: "ok.txt 삭제" }).click();
    await expect(page.getByText("0개 파일 · 0개 완료")).toBeVisible();
    expect((await received()).calls).toBe(2);
    await audit(page);
  });
  test(`${framework} upload cancel and queue limits do not report false completion`, async ({
    page,
  }) => {
    await page.route("**/api/upload?*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await route.fulfill({ status: 200, body: "ok" }).catch(() => {});
    });
    await page.goto(`/tests/fixtures/business.html?framework=${framework}`);
    const input = page.getByLabel("Contract upload 파일 선택"),
      file = {
        name: "a.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("a"),
      };
    const chooseSameFile = () =>
      input.evaluate((element: HTMLInputElement) => {
        const transfer = new DataTransfer();
        transfer.items.add(
          new File(["a"], "a.txt", { type: "text/plain", lastModified: 1 }),
        );
        element.files = transfer.files;
        element.dispatchEvent(new Event("change", { bubbles: true }));
      });
    await chooseSameFile();
    await chooseSameFile();
    await expect(page.getByRole("alert")).toContainText("이미 추가한 파일");
    await input.setInputFiles([
      { ...file, name: "b.txt" },
      { ...file, name: "c.txt" },
    ]);
    await expect(page.getByRole("alert")).toContainText("파일 수를 초과");
    await page
      .getByRole("button", { name: "a.txt 업로드", exact: true })
      .click();
    await page.getByRole("button", { name: "a.txt 업로드 취소" }).click();
    await page.waitForTimeout(950);
    await expect(
      page.getByRole("button", { name: "a.txt 재시도" }),
    ).toBeVisible();
    await expect(page.getByText("2개 파일 · 0개 완료")).toBeVisible();
  });
}
test("business documentation examples render, retry and fit mobile", async ({
  page,
}) => {
  await page.goto("/#/components/data-table");
  const section = page.getByRole("region", {
    name: "평가 대상자",
    exact: true,
  });
  await section.getByRole("textbox").fill("오류");
  await expect(page.getByRole("alert")).toContainText(
    "데이터를 불러오지 못했습니다",
  );
  await page.getByRole("button", { name: "다시 불러오기" }).click();
  await expect(section.getByText("총 24개 · 1 / 5페이지")).toBeVisible();
  await page.screenshot({
    path: `artifacts/${test.info().project.name}/data-table.png`,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const id of [
    "async-combobox",
    "multi-select",
    "data-table",
    "file-upload",
  ]) {
    await page.goto("/#/components/" + id);
    await expect(page.locator(".demo-stage")).toBeVisible();
    await expect(page.locator("[data-example-loading]")).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.screenshot({
    path: `artifacts/${test.info().project.name}/upload-mobile.png`,
    fullPage: true,
  });
});
