import { expect, test, type Locator, type Page } from "@playwright/test";

type Framework = "react" | "vue";
const errors = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }) => {
  const captured: string[] = [];
  errors.set(page, captured);
  page.on("pageerror", (error) => captured.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test.afterEach(async ({ page }) => {
  expect(errors.get(page), "uncaught fixture errors").toEqual([]);
});

async function openFixture(
  page: Page,
  framework: Framework,
  scenario: string,
  lock?: string,
) {
  const query = new URLSearchParams({ framework, case: scenario });
  if (lock) query.set("lock", lock);
  await page.goto(`/tests/fixtures/foundation-edges.html?${query}`);
  await expect(page.getByTestId("foundation-edges")).toHaveAttribute(
    "data-framework",
    framework,
  );
}

// Simulate an independent parent update/transport completion while a modal owns
// user focus. Native click() invokes only the labelled fixture control; it does
// not bypass a product control's disabled or pointer-interaction contracts.
async function parentControl(page: Page, id: string) {
  await page
    .getByTestId(id)
    .evaluate((button: HTMLButtonElement) => button.click());
}

function importRegion(page: Page) {
  return page.getByRole("region", { name: "Edge import", exact: true });
}

function resetButton(wizard: Locator) {
  return wizard.getByRole("button", { name: /^(새로 시작|초기화)$/ });
}

function retryButton(wizard: Locator) {
  return wizard.getByRole("button", {
    name: /^실패한 (행만 다시 시도|\d+행만 재시도)$/,
  });
}

function resultStatus(wizard: Locator) {
  return wizard.getByRole("status").filter({ hasText: /등록 성공/ });
}

async function chooseImportFile(page: Page) {
  await importRegion(page)
    .locator('input[type="file"]')
    .setInputFiles({
      name: "edge-rows.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("name\nAlpha\nBeta\n"),
    });
  await expect(page.getByTestId("parse-count")).toHaveText("1");
}

async function dispatchImport(page: Page) {
  const wizard = importRegion(page);
  await page.getByTestId("resolve-parse").click();
  await wizard
    .getByRole("button", { name: "데이터 검증", exact: true })
    .click();
  await wizard.getByRole("button", { name: /^(등록 실행|2행 등록)$/ }).click();
  await expect(page.getByTestId("import-count")).toHaveText("1");
  await expect(wizard).toHaveAttribute("aria-busy", "true");
}

for (const framework of ["react", "vue"] as const) {
  test(`${framework} equivalent import fields preserve pending parsing and registration`, async ({
    page,
  }) => {
    await openFixture(page, framework, "import");
    const wizard = importRegion(page);
    await chooseImportFile(page);
    await page.getByTestId("rerender-fields").click();
    await expect(page.getByTestId("field-revision")).toHaveText("1");
    await expect(page.getByTestId("parse-aborted")).toHaveText("false");
    await expect(wizard).toContainText("edge-rows.csv");
    await expect(wizard).toHaveAttribute("aria-busy", "true");

    await dispatchImport(page);
    await page.getByTestId("rerender-fields").click();
    await expect(page.getByTestId("field-revision")).toHaveText("2");
    await expect(page.getByTestId("import-aborted")).toHaveText("false");
    await expect(wizard).toHaveAttribute("aria-busy", "true");
    await expect(resetButton(wizard)).toBeDisabled();
    await page.getByTestId("resolve-import").click();
    await expect(resultStatus(wizard)).toContainText(
      /등록 성공 1(?:개|행)\s*· 실패 1(?:개|행)/,
    );
    await expect(wizard).toContainText("Retry Beta");

    await retryButton(wizard).click();
    await expect(page.getByTestId("import-count")).toHaveText("2");
    await expect(page.getByTestId("import-batches")).toHaveText("[[1,2],[2]]");
    await page.getByTestId("resolve-retry").click();
    await expect(resultStatus(wizard)).toContainText(
      /등록 성공 2(?:개|행)\s*· 실패 0(?:개|행)/,
    );
    await expect(page.getByTestId("parse-count")).toHaveText("1");
  });

  test(`${framework} a changed import schema preserves dispatched accounting until explicit reconciliation`, async ({
    page,
  }) => {
    await openFixture(page, framework, "import");
    const wizard = importRegion(page);
    await chooseImportFile(page);
    await dispatchImport(page);
    await page.getByTestId("change-schema").click();
    await expect(page.getByTestId("schema-label")).toHaveText("Renamed person");
    await expect(page.getByTestId("import-aborted")).toHaveText("false");
    await expect(wizard).toHaveAttribute("aria-busy", "true");
    const reconciled = wizard.getByRole("checkbox", {
      name: "서버 처리 내역을 확인했습니다",
      exact: true,
    });
    await expect(reconciled).toBeDisabled();
    await expect(resetButton(wizard)).toBeDisabled();
    await expect(
      wizard.getByRole("button", { name: "파일 변경", exact: true }),
    ).toBeDisabled();

    await page.getByTestId("resolve-import").click();
    await expect(resultStatus(wizard)).toContainText(
      /등록 성공 1(?:개|행)\s*· 실패 1(?:개|행)/,
    );
    await expect(
      wizard
        .locator(".cheese-data-actions-list")
        .filter({ hasText: "Retry Beta" }),
    ).toContainText("Name");
    await expect(
      wizard
        .locator(".cheese-data-actions-list")
        .filter({ hasText: "Retry Beta" }),
    ).not.toContainText("Renamed person");
    await expect(retryButton(wizard)).toBeDisabled();
    await expect(resetButton(wizard)).toBeDisabled();
    await reconciled.check();
    // Acknowledgement enables reset only; it cannot resubmit the old batch.
    await expect(retryButton(wizard)).toBeDisabled();
    await expect(
      wizard.getByRole("button", { name: "파일 변경", exact: true }),
    ).toBeDisabled();
    await expect(page.getByTestId("import-count")).toHaveText("1");
    await resetButton(wizard).click();
    await expect(resultStatus(wizard)).toHaveCount(0);
    await expect(
      wizard.getByRole("button", { name: "파일 선택", exact: true }),
    ).toBeEnabled();
    await expect(page.getByTestId("import-count")).toHaveText("1");
  });

  test(`${framework} uncertain retry preserves known import success across schema changes`, async ({
    page,
  }) => {
    await openFixture(page, framework, "import");
    const wizard = importRegion(page);
    await chooseImportFile(page);
    await dispatchImport(page);
    await page.getByTestId("resolve-import").click();
    await expect(resultStatus(wizard)).toContainText(/등록 성공 1(?:개|행)/);
    await retryButton(wizard).click();
    await expect(page.getByTestId("import-batches")).toHaveText("[[1,2],[2]]");
    await page.getByTestId("change-schema").click();
    await expect(page.getByTestId("import-aborted")).toHaveText("false");
    await page.getByTestId("reject-import").click();
    await expect(wizard).toHaveAttribute("aria-busy", "false");
    await expect(resultStatus(wizard)).toContainText(/등록 성공 1(?:개|행)/);
    await expect(
      wizard.getByRole("alert").filter({ hasText: "Uncertain import outcome" }),
    ).toContainText(
      framework === "react"
        ? "이미 저장되었을 수 있습니다"
        : "서버 반영 여부가 불확실합니다",
    );
    await expect(resetButton(wizard)).toBeDisabled();
    await expect(
      wizard.getByRole("button", { name: "파일 변경", exact: true }),
    ).toBeDisabled();
    const retry = retryButton(wizard);
    if (framework === "react") await expect(retry).toBeDisabled();
    else await expect(retry).toHaveCount(0);
    await page.getByTestId("rerender-fields").click();
    await expect(resultStatus(wizard)).toContainText(/등록 성공 1(?:개|행)/);
    await expect(
      wizard.getByRole("checkbox", {
        name: "서버 처리 내역을 확인했습니다",
        exact: true,
      }),
    ).not.toBeChecked();
    await expect(page.getByTestId("import-count")).toHaveText("2");
  });

  test(`${framework} deleting view A does not clear a newer controlled selection B`, async ({
    page,
  }) => {
    await openFixture(page, framework, "saved");
    const views = page.getByRole("region", { name: "Edge views", exact: true });
    await views
      .getByRole("button", { name: "선택한 보기 삭제", exact: true })
      .click();
    await views.getByRole("button", { name: "보기 삭제", exact: true }).click();
    await expect(page.getByTestId("delete-count")).toHaveText("1");
    await page.getByTestId("select-b").click();
    await expect(page.getByTestId("selected-view")).toHaveText("b");
    await page.getByTestId("resolve-delete").click();
    await expect(
      views.getByRole("status").filter({ hasText: /삭제/ }),
    ).toBeVisible();
    await expect(page.getByTestId("selected-view")).toHaveText("b");
    await expect(page.getByTestId("select-events")).toHaveText("[]");
    await expect(views.getByRole("combobox")).toContainText("View B");
    await views.getByRole("combobox").click();
    await expect(
      page.getByRole("option", { name: "View A", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("option", { name: "View B", exact: true }),
    ).toBeVisible();
  });

  test(`${framework} export cancellation releases busy state when its controlled parent retains the dialog`, async ({
    page,
  }) => {
    await openFixture(page, framework, "export");
    await page.getByTestId("open-export").click();
    const dialog = page.getByRole("dialog", {
      name: "Edge export",
      exact: true,
    });
    const submit = dialog.getByRole("button", {
      name: "내보내기",
      exact: true,
    });
    await submit.click();
    await expect(page.getByTestId("export-count")).toHaveText("1");
    await expect(submit).toBeDisabled();
    await dialog
      .getByRole("button", {
        name: framework === "react" ? "취소하고 닫기" : "닫기",
        exact: true,
      })
      .click();
    await expect(page.getByTestId("close-requests")).toHaveText("1");
    await expect(page.getByTestId("export-aborted")).toHaveText("true");
    await expect(dialog).toBeVisible();
    await expect(submit).toBeEnabled();
    await expect(
      dialog.getByRole("checkbox", { name: "Name", exact: true }),
    ).toBeEnabled();
    await submit.click();
    await expect(page.getByTestId("export-count")).toHaveText("2");
    await parentControl(page, "resolve-first-export");
    await expect(submit).toBeDisabled();
    await expect(
      dialog.getByRole("status").filter({ hasText: /완료/ }),
    ).toHaveCount(0);
    await parentControl(page, "resolve-export");
    await expect(
      dialog.getByRole("status").filter({ hasText: /완료/ }),
    ).toBeVisible();
  });

  test(`${framework} pending reply blocks edit and deletion and retains a rejected draft`, async ({
    page,
  }) => {
    await openFixture(page, framework, "comments");
    const thread = page.getByRole("region", {
      name: "Edge comments",
      exact: true,
    });
    await thread
      .getByRole("button", { name: "Alex 댓글에 답글 작성", exact: true })
      .click();
    const draft = thread.getByRole("textbox", {
      name: "Alex님에게 답글 작성",
      exact: true,
    });
    await draft.fill("Keep this reply after rejection.");
    await thread
      .getByRole("button", { name: "답글 등록", exact: true })
      .click();
    await expect(page.getByTestId("reply-count")).toHaveText("1");
    await expect(draft).toBeDisabled();
    await expect(
      thread.getByRole("button", { name: "Alex 댓글 수정", exact: true }),
    ).toHaveCount(0);
    await expect(
      thread.getByRole("button", { name: "Alex 댓글 삭제", exact: true }),
    ).toBeDisabled();
    await expect(
      thread.getByRole("button", { name: "취소", exact: true }),
    ).toBeDisabled();
    await page.getByTestId("reject-reply").click();
    await expect(thread.getByRole("alert")).toContainText(
      "작성한 내용은 유지됩니다",
    );
    await expect(draft).toBeEnabled();
    await expect(draft).toHaveValue("Keep this reply after rejection.");
    await expect(page.getByTestId("edit-count")).toHaveText("0");
    await expect(page.getByTestId("delete-count")).toHaveText("0");
    await thread
      .getByRole("button", { name: "답글 등록", exact: true })
      .click();
    await expect(page.getByTestId("reply-count")).toHaveText("2");
    await page.getByTestId("resolve-reply").click();
    await expect(draft).toHaveCount(0);
    await expect(
      thread.getByRole("button", { name: "Alex 댓글 수정", exact: true }),
    ).toBeEnabled();
    await expect(
      thread.getByRole("button", { name: "Alex 댓글 삭제", exact: true }),
    ).toBeEnabled();
  });

  for (const lock of [
    "page-disabled",
    "page-pending",
    "section-disabled",
  ] as const) {
    test(`${framework} ${lock} locks keyboard sorting and an already-open organization portal`, async ({
      page,
    }) => {
      await openFixture(page, framework, "form", lock);
      const order = page.getByRole("list", { name: "Edge order", exact: true });
      const beta = order.getByRole("listitem", {
        name: framework === "react" ? "2. Beta" : "Beta, 2개 중 2번째",
        exact: true,
      });
      await beta.focus();
      await parentControl(page, "lock-form");
      await expect(page.getByTestId("lock-state")).toHaveText("true");
      await expect(beta).toHaveAttribute("tabindex", "-1");
      await expect(
        order.getByRole("button", { name: "Beta 위로 이동", exact: true }),
      ).toBeDisabled();
      await beta.focus();
      await page.keyboard.press("Alt+ArrowUp");
      await expect(page.getByTestId("sort-order")).toHaveText('["a","b"]');
      await expect(page.getByTestId("reorder-count")).toHaveText("0");
      await page.getByTestId("unlock-form").click();
      await beta.focus();
      await page.keyboard.press("Alt+ArrowUp");
      await expect(page.getByTestId("sort-order")).toHaveText('["b","a"]');
      await expect(page.getByTestId("reorder-count")).toHaveText("1");

      await page
        .getByRole("button", { name: "Edge organization 선택", exact: true })
        .click();
      const dialog = page.getByRole("dialog", {
        name: "Edge organization 선택",
        exact: true,
      });
      const teamA = dialog.getByRole("treeitem", {
        name: "Team A",
        exact: true,
      });
      const teamB = dialog.getByRole("treeitem", {
        name: "Team B",
        exact: true,
      });
      await teamA.click();
      await expect(teamA).toHaveAttribute("aria-selected", "true");
      await parentControl(page, "lock-form");
      await expect(
        dialog.getByRole("searchbox", { name: "조직 검색", exact: true }),
      ).toBeDisabled();
      await expect(teamB).toHaveAttribute("aria-disabled", "true");
      await expect(
        dialog.getByRole("button", { name: "Team A 선택 해제", exact: true }),
      ).toBeDisabled();
      await teamB.focus();
      await page.keyboard.press("Space");
      await expect(teamB).toHaveAttribute("aria-selected", "false");
      await expect(teamA).toHaveAttribute("aria-selected", "true");
      await expect(
        dialog.getByRole("button", { name: "선택 적용", exact: true }),
      ).toBeDisabled();
      await expect(page.getByTestId("organization-count")).toHaveText("0");
      await expect(page.getByTestId("selected-organizations")).toHaveText("[]");
      await parentControl(page, "unlock-form");
      await dialog
        .getByRole("button", { name: "선택 적용", exact: true })
        .click();
      await expect(dialog).toHaveCount(0);
      await expect(page.getByTestId("selected-organizations")).toHaveText(
        '["a"]',
      );
      await expect(page.getByTestId("organization-count")).toHaveText("1");

      await page
        .getByRole("button", {
          name: "Edge organization 선택 · 1개",
          exact: true,
        })
        .click();
      await teamA.focus();
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
    });
  }

  test(`${framework} correcting failed media kind mounts video and metadata changes preserve that element`, async ({
    page,
  }) => {
    // Leave this safe same-origin media response pending. Browser error events
    // drive the state transition without network timing or video playback.
    await page.route("**/__foundation_edge_media__", () => {});
    await openFixture(page, framework, "media");
    await page.getByTestId("open-preview").click();
    const dialog = page.getByRole("dialog", {
      name: "Edge media",
      exact: true,
    });
    const image = dialog.getByRole("img");
    await expect(image).toHaveCount(1);
    await image.dispatchEvent("error");
    await expect(dialog.getByRole("status")).toContainText(
      "파일을 불러오지 못했습니다.",
    );
    await expect(image).toHaveCount(0);
    await parentControl(page, "correct-media-kind");
    const video = dialog.locator("video");
    await expect(video).toHaveCount(1);
    await expect(video).toHaveAttribute("src", /\/__foundation_edge_media__$/);
    await expect(
      dialog.getByText("파일을 불러오지 못했습니다.", { exact: true }),
    ).toHaveCount(0);
    await video.evaluate((node) => {
      node.dataset.fixtureIdentity = "retained-video";
    });
    await parentControl(page, "update-media-description");
    await expect(dialog).toContainText("Updated description");
    await expect(video).toHaveAttribute(
      "data-fixture-identity",
      "retained-video",
    );
  });
}
