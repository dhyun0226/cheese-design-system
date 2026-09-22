import { expect, test, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const summaryTitle = "입력 내용을 확인해 주세요.";
const firstRecord = "01 하반기 평가 준비";
const serverFailure =
  "저장하지 못했습니다. 작성한 내용은 유지됩니다. 잠시 후 다시 시도해 주세요.";

async function choose(page: Page, label: string, option: string) {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

async function filterSecondPage(page: Page) {
  await page.getByRole("searchbox", { name: /평가.*검색/ }).fill("하반기");
  await expect
    .poll(() => new URL(page.url()).searchParams.get("work-search"))
    .toBe("하반기");
  await choose(page, "상태 필터", "진행 예정");
  await page.getByRole("button", { name: "업무명 정렬", exact: true }).click();
  await page.getByRole("button", { name: "업무명 정렬", exact: true }).click();
  await expect(
    page.getByRole("columnheader", { name: "업무명 정렬" }),
  ).toHaveAttribute("aria-sort", "descending");
  await page.getByRole("button", { name: "다음 페이지", exact: true }).click();
  await expect(
    page.getByText("총 6개 · 2 / 2페이지", { exact: true }),
  ).toBeVisible();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("work-page"))
    .toBe("2");
  await expect(
    page.getByRole("button", { name: `${firstRecord} 수정`, exact: true }),
  ).toBeVisible();
}

async function expectQueryRestored(page: Page) {
  await expect(page.getByRole("searchbox", { name: /평가.*검색/ })).toHaveValue(
    "하반기",
  );
  await expect(
    page.getByRole("combobox", { name: "상태 필터", exact: true }),
  ).toHaveText("진행 예정");
  await expect(
    page.getByRole("columnheader", { name: "업무명 정렬" }),
  ).toHaveAttribute("aria-sort", "descending");
  await expect(
    page.getByText("총 6개 · 2 / 2페이지", { exact: true }),
  ).toBeVisible();
  const params = new URL(page.url()).searchParams;
  expect(params.get("work-search")).toBe("하반기");
  expect(params.get("work-status")).toBe("진행 예정");
  expect(params.get("work-sort")).toBe("name");
  expect(params.get("work-order")).toBe("desc");
  expect(params.get("work-page")).toBe("2");
  expect(params.get("source")).toBe("workflow-test");
}

async function openFirstRecord(page: Page) {
  await page
    .getByRole("button", { name: `${firstRecord} 수정`, exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "업무명", exact: true }),
  ).toBeFocused();
}

async function assertSaveLocked(form: Locator) {
  await expect(form).toHaveAttribute("aria-busy", "true");
  await expect(form.locator('button[type="submit"]')).toBeDisabled();
  await expect(
    form.getByRole("textbox", { name: "업무명", exact: true }),
  ).toBeDisabled();
  await expect(
    form.getByRole("textbox", { name: "업무 마감일", exact: true }),
  ).toBeDisabled();
  await expect(
    form.getByRole("combobox", { name: "담당 조직", exact: true }),
  ).toBeDisabled();
  await expect(
    form.getByRole("button", { name: "수정 취소", exact: true }),
  ).toBeDisabled();
  // Even programmatic submissions during the active request must not advance the flow.
  await form.evaluate((node) => {
    (node as HTMLFormElement).requestSubmit();
    (node as HTMLFormElement).requestSubmit();
  });
}

async function auditWorkflow(page: Page) {
  expect(
    (await new AxeBuilder({ page }).include(".workflow-demo").analyze())
      .violations,
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
}

for (const framework of ["react", "vue"] as const) {
  const url =
    framework === "react"
      ? "/?source=workflow-test#/workflows"
      : "/workflow-vue.html?source=workflow-test#workflow-demo";
  const listTitle = "평가 업무 목록";
  const discardTitle = "변경 내용을 버릴까요?";
  const discardAction = "변경 사항 버리기";

  test.describe(`${framework} connected workflow`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(url);
      await expect(
        page.getByRole("heading", { name: listTitle, exact: true }),
      ).toBeVisible();
    });

    test("filtered second-page edits survive save failure and return to the same list after retry", async ({
      page,
    }) => {
      await filterSecondPage(page);
      const listUrl = page.url();
      await openFirstRecord(page);
      const form = page.getByRole("form", { name: "업무 수정", exact: true });
      const name = form.getByRole("textbox", { name: "업무명", exact: true });
      const deadline = form.getByRole("textbox", {
        name: "업무 마감일",
        exact: true,
      });
      const newName = `${firstRecord} · 수정`;
      await name.fill(newName);
      await choose(page, "담당 조직", "디자인팀");
      await deadline.fill("2026-11-15");
      await form
        .getByRole("button", { name: "변경 내용 저장", exact: true })
        .click();
      await assertSaveLocked(form);
      const summary = page.getByRole("region", {
        name: summaryTitle,
        exact: true,
      });
      await expect(summary).toContainText(serverFailure);
      await expect(summary).toBeFocused();
      await expect(name).toHaveValue(newName);
      await expect(deadline).toHaveValue("2026-11-15");
      await expect(
        form.getByRole("combobox", { name: "담당 조직", exact: true }),
      ).toHaveText("디자인팀");
      await expect(
        form.getByRole("combobox", { name: "진행 상태", exact: true }),
      ).toHaveText("진행 예정");
      await expect(
        page.getByRole("heading", { name: "저장 완료", exact: true }),
      ).toHaveCount(0);
      await expect(name).toBeEnabled();
      await form
        .getByRole("button", { name: "다시 저장", exact: true })
        .click();
      await expect(
        page.getByRole("heading", { name: "저장 완료", exact: true }),
      ).toBeFocused();
      await page
        .getByRole("button", { name: "목록으로 돌아가기", exact: true })
        .click();
      await expect(
        page.getByRole("heading", { name: listTitle, exact: true }),
      ).toBeFocused();
      await expectQueryRestored(page);
      expect(page.url()).toBe(listUrl);
      const savedRow = page.getByRole("row").filter({
        has: page.getByRole("button", {
          name: `${newName} 수정`,
          exact: true,
        }),
      });
      await expect(savedRow).toContainText("디자인팀");
      await expect(savedRow).toContainText("2026-11-15");
      await expect(savedRow).toContainText("진행 예정");
      await expect(savedRow).toHaveCount(1);
    });

    test("search, filter, sorting and page are restored from URL after reload", async ({
      page,
    }) => {
      await filterSecondPage(page);
      const filteredUrl = page.url();
      await page.reload();
      await expectQueryRestored(page);
      expect(page.url()).toBe(filteredUrl);
      await expect(
        page.getByRole("button", { name: `${firstRecord} 수정`, exact: true }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "조건 초기화", exact: true })
        .click();
      await expect(
        page.getByRole("searchbox", { name: /평가.*검색/ }),
      ).toHaveValue("");
      await expect(
        page.getByText("총 12개 · 1 / 3페이지", { exact: true }),
      ).toBeVisible();
      await expect
        .poll(() =>
          [...new URL(page.url()).searchParams.keys()].filter((key) =>
            key.startsWith("work-"),
          ),
        )
        .toEqual([]);
      expect(new URL(page.url()).searchParams.get("source")).toBe(
        "workflow-test",
      );
      expect(new URL(page.url()).hash).toBe(new URL(filteredUrl).hash);
    });

    test("blank names and invalid dates link back to their inputs without changing the route", async ({
      page,
    }) => {
      await openFirstRecord(page);
      const editUrl = page.url();
      const name = page.getByRole("textbox", { name: "업무명", exact: true });
      const deadline = page.getByRole("textbox", {
        name: "업무 마감일",
        exact: true,
      });
      await name.fill("   ");
      await deadline.fill("2026-02-31");
      await page
        .getByRole("button", { name: "변경 내용 저장", exact: true })
        .click();
      const summary = page.getByRole("region", {
        name: summaryTitle,
        exact: true,
      });
      await expect(summary).toBeFocused();
      await expect(summary.getByRole("link")).toHaveCount(2);
      await summary
        .getByRole("link", { name: "업무명을 입력해 주세요.", exact: true })
        .click();
      await expect(name).toBeFocused();
      expect(page.url()).toBe(editUrl);
      await summary
        .getByRole("link", {
          name: "마감일을 YYYY-MM-DD 형식의 실제 날짜로 입력해 주세요.",
          exact: true,
        })
        .click();
      await expect(deadline).toBeFocused();
      expect(page.url()).toBe(editUrl);
      await expect(name).toHaveValue("   ");
      await expect(deadline).toHaveValue("2026-02-31");
      await expect(
        page.getByRole("heading", { name: "저장 완료", exact: true }),
      ).toHaveCount(0);
      await name.fill("정상 업무명");
      await deadline.fill("0000-10-15");
      await page
        .getByRole("button", { name: "변경 내용 저장", exact: true })
        .click();
      await expect(summary).toBeFocused();
      await expect(summary.getByRole("link")).toHaveCount(1);
      await expect(summary).toContainText(
        "마감일을 YYYY-MM-DD 형식의 실제 날짜로 입력해 주세요.",
      );
      await auditWorkflow(page);
    });

    test("server field errors retain the draft and clear after correction and successful save", async ({
      page,
    }) => {
      await openFirstRecord(page);
      const name = page.getByRole("textbox", { name: "업무명", exact: true });
      await name.fill("중복 평가");
      await page
        .getByRole("button", { name: "변경 내용 저장", exact: true })
        .click();
      const summary = page.getByRole("region", {
        name: summaryTitle,
        exact: true,
      });
      const error = "이미 사용 중인 업무명입니다. 다른 이름을 입력해 주세요.";
      await expect(summary).toBeFocused();
      await expect(
        summary.getByRole("link", { name: error, exact: true }),
      ).toBeVisible();
      await expect(name).toHaveValue("중복 평가");
      await expect(name).toHaveAttribute("aria-invalid", "true");
      const editUrl = page.url();
      await summary.getByRole("link", { name: error, exact: true }).click();
      await expect(name).toBeFocused();
      expect(page.url()).toBe(editUrl);
      await name.fill("확정 하반기 평가");
      await expect(summary).toHaveCount(0);
      await expect(name).not.toHaveAttribute("aria-invalid", "true");
      await page
        .getByRole("form", { name: "업무 수정", exact: true })
        .locator('button[type="submit"]')
        .click();
      await expect(
        page.getByRole("heading", { name: "저장 완료", exact: true }),
      ).toBeFocused();
      await page
        .getByRole("button", { name: "목록으로 돌아가기", exact: true })
        .click();
      await expect(
        page.getByRole("button", {
          name: "확정 하반기 평가 수정",
          exact: true,
        }),
      ).toBeVisible();
    });

    test("dirty cancellation offers continuing or discarding while preserving saved records", async ({
      page,
    }) => {
      await openFirstRecord(page);
      const name = page.getByRole("textbox", { name: "업무명", exact: true });
      await name.fill("저장하지 않은 수정");
      await page
        .getByRole("button", { name: "수정 취소", exact: true })
        .click();
      const dialog = page.getByRole("dialog", {
        name: discardTitle,
        exact: true,
      });
      await expect(dialog).toBeVisible();
      // Audit the settled dialog, not the intermediate fade-in colors.
      await page.evaluate(async () => {
        const surfaces = document.querySelectorAll(
          ".cheese-dialog, .cheese-overlay",
        );
        await Promise.all(
          [...surfaces].flatMap((surface) =>
            surface.getAnimations().map((animation) => animation.finished),
          ),
        );
      });
      await expect(dialog).toHaveCSS("opacity", "1");
      expect(
        (await new AxeBuilder({ page }).include('[role="dialog"]').analyze())
          .violations,
      ).toEqual([]);
      await dialog
        .getByRole("button", { name: "계속 작성", exact: true })
        .click();
      await expect(dialog).toHaveCount(0);
      await expect(name).toHaveValue("저장하지 않은 수정");
      await expect(
        page.getByRole("button", { name: "수정 취소", exact: true }),
      ).toBeFocused();
      await page
        .getByRole("button", { name: "수정 취소", exact: true })
        .click();
      await dialog
        .getByRole("button", { name: discardAction, exact: true })
        .click();
      await expect(dialog).toHaveCount(0);
      await expect(
        page.getByRole("heading", { name: listTitle, exact: true }),
      ).toBeFocused();
      await openFirstRecord(page);
      await expect(name).toHaveValue(firstRecord);
      await page
        .getByRole("button", { name: "수정 취소", exact: true })
        .click();
      await expect(dialog).toHaveCount(0);
      await expect(
        page.getByRole("heading", { name: listTitle, exact: true }),
      ).toBeFocused();
    });

    test("saved attachments download real contents and remain until deletion retry succeeds", async ({
      page,
    }) => {
      await openFirstRecord(page);
      const attachments = page.getByRole("group", {
        name: "저장된 첨부",
        exact: true,
      });
      const downloadPromise = page.waitForEvent("download");
      await attachments
        .getByRole("link", { name: "평가 안내.txt 다운로드", exact: true })
        .click();
      const download = await downloadPromise;
      // macOS WebKit returns canonically equivalent decomposed Korean names.
      expect(download.suggestedFilename().normalize("NFC")).toBe(
        "평가 안내.txt",
      );
      expect(await download.failure()).toBeNull();
      const stream = await download.createReadStream();
      expect(stream).not.toBeNull();
      const decoder = new TextDecoder();
      let contents = "";
      for await (const chunk of stream!)
        contents += decoder.decode(chunk, { stream: true });
      contents += decoder.decode();
      expect(contents).toBe(
        "CHEESE 평가 안내\n평가 항목과 마감일을 확인하고 작성 내용을 저장해 주세요.\n이 파일은 업무 흐름 체험을 위한 예제 자료입니다.\n",
      );
      await attachments
        .getByRole("button", { name: "평가 안내.txt 삭제", exact: true })
        .press("Enter");
      await expect(
        attachments.getByRole("button", {
          name: "평가 안내.txt 삭제",
          exact: true,
        }),
      ).toHaveAttribute("aria-disabled", "true");
      await expect(attachments.getByRole("alert")).toContainText(
        "삭제하지 못했습니다.",
      );
      await expect(
        attachments.getByRole("link", {
          name: "평가 안내.txt 다운로드",
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        attachments.getByRole("button", {
          name: "평가 안내.txt 삭제 재시도",
          exact: true,
        }),
      ).toBeFocused();
      await attachments
        .getByRole("button", { name: "평가 안내.txt 삭제 재시도", exact: true })
        .press("Enter");
      await expect(
        attachments.getByText("첨부파일이 없습니다.", { exact: true }),
      ).toBeVisible();
      await expect(attachments.getByRole("link")).toHaveCount(0);
      await expect(attachments.getByRole("alert")).toHaveCount(0);
      await expect(
        attachments.locator(".cheese-attachment-label"),
      ).toBeFocused();
      await page
        .getByRole("button", { name: "수정 취소", exact: true })
        .click();
      await openFirstRecord(page);
      await expect(
        attachments.getByText("첨부파일이 없습니다.", { exact: true }),
      ).toBeVisible();
    });

    test("list, edit and errors fit 320px and 390px screens with accessible controls", async ({
      page,
    }) => {
      for (const width of [320, 390]) {
        await page.setViewportSize({ width, height: 900 });
        // A same-hash goto can retain the previous viewport's in-memory edit.
        await page.goto("about:blank");
        await page.goto(url);
        await expect(
          page.getByRole("heading", { name: listTitle, exact: true }),
        ).toBeVisible();
        await auditWorkflow(page);
        await openFirstRecord(page);
        await auditWorkflow(page);
        await page
          .getByRole("textbox", { name: "업무명", exact: true })
          .fill("");
        await page
          .getByRole("button", { name: "변경 내용 저장", exact: true })
          .click();
        await expect(
          page.getByRole("region", { name: summaryTitle, exact: true }),
        ).toBeFocused();
        await auditWorkflow(page);
      }
    });
  });
}
