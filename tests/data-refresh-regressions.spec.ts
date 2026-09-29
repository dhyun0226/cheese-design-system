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

async function openFixture(page: Page, framework: Framework, scenario: string) {
  const query = new URLSearchParams({ framework, case: scenario });
  await page.goto(`/tests/fixtures/data-refresh.html?${query}`);
  await expect(page.getByTestId("data-refresh")).toHaveAttribute(
    "data-framework",
    framework,
  );
}

// These controls represent a parent data refresh or a transport completing
// while a modal owns focus. Only fixture controls are invoked this way.
async function parentControl(page: Page, id: string) {
  await page
    .getByTestId(id)
    .evaluate((button: HTMLButtonElement) => button.click());
}

function exportDialog(page: Page) {
  return page.getByRole("dialog", { name: "Refresh export", exact: true });
}

function exportSuccess(dialog: Locator) {
  return dialog.getByRole("status").filter({ hasText: /완료/ });
}

function exportSubmit(dialog: Locator) {
  return dialog.getByRole("button", { name: "내보내기", exact: true });
}

function exportScope(dialog: Locator) {
  return dialog.getByRole("combobox", { name: /내보낼 범위|내보내기 범위/ });
}

const expectedSelection = {
  columns: ["name", "team"],
  scope: "all",
  format: "xlsx",
};

async function chooseExportOptions(page: Page) {
  await page.getByTestId("open-export").click();
  const dialog = exportDialog(page);
  await dialog.getByRole("checkbox", { name: "Email", exact: true }).uncheck();
  await exportScope(dialog).click();
  await page.getByRole("option", { name: "All rows", exact: true }).click();
  await dialog
    .getByRole("combobox", { name: "파일 형식", exact: true })
    .click();
  await page.getByRole("option", { name: "Workbook", exact: true }).click();
  return dialog;
}

async function expectExportOptions(dialog: Locator, name = "Name") {
  await expect(
    dialog.getByRole("checkbox", { name, exact: true }),
  ).toBeChecked();
  await expect(
    dialog.getByRole("checkbox", { name: "Email", exact: true }),
  ).not.toBeChecked();
  await expect(
    dialog.getByRole("checkbox", { name: "Team", exact: true }),
  ).toBeChecked();
  await expect(exportScope(dialog)).toContainText("All rows");
  await expect(
    dialog.getByRole("combobox", { name: "파일 형식", exact: true }),
  ).toContainText("Workbook");
}

for (const framework of ["react", "vue"] as const) {
  for (const guard of [
    "tracked composition",
    "native composing",
    "legacy 229",
  ] as const) {
    test(`${framework} SavedViews ${guard} Enter does not save and normal Enter and click do`, async ({
      page,
    }) => {
      await openFixture(page, framework, "saved");
      const views = page.getByRole("region", {
        name: "Refresh views",
        exact: true,
      });
      const input = views.getByRole("textbox", {
        name: "새 보기 이름",
        exact: true,
      });
      await input.fill("  한글 보기  ");
      await input.evaluate((node, mode) => {
        if (mode === "tracked composition")
          node.dispatchEvent(
            new CompositionEvent("compositionstart", {
              bubbles: true,
              data: "한",
            }),
          );
        node.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Enter",
            code: "Enter",
            keyCode: mode === "legacy 229" ? 229 : 13,
            isComposing: mode === "native composing",
            bubbles: true,
            cancelable: true,
          }),
        );
      }, guard);
      await expect(page.getByTestId("saved-labels")).toHaveText("[]");
      await expect(input).toHaveValue("  한글 보기  ");
      if (guard === "tracked composition")
        await input.evaluate((node) => {
          node.dispatchEvent(
            new CompositionEvent("compositionend", {
              bubbles: true,
              data: "한글 보기",
            }),
          );
        });
      await input.press("Enter");
      await expect(page.getByTestId("saved-labels")).toHaveText(
        '["한글 보기"]',
      );
      await expect(input).toHaveValue("");
      await input.press("Enter");
      await expect(page.getByTestId("saved-labels")).toHaveText(
        '["한글 보기"]',
      );
      await input.fill("  Click saved view  ");
      await views
        .getByRole("button", { name: "현재 조건 저장", exact: true })
        .click();
      await expect(page.getByTestId("saved-labels")).toHaveText(
        '["한글 보기","Click saved view"]',
      );
      await expect(input).toHaveValue("");
      await expect(page.getByTestId("select-events")).toHaveText("[]");
      await expect(page.getByTestId("selected-view")).toHaveText("a");
    });
  }

  test(`${framework} active organization search expands fresh matching descendants and preserves ordinary expansion`, async ({
    page,
  }) => {
    await openFixture(page, framework, "organization");
    await page
      .getByRole("button", { name: "Refresh organization 선택", exact: true })
      .click();
    const dialog = page.getByRole("dialog", {
      name: "Refresh organization 선택",
      exact: true,
    });
    const manualBranch = dialog.getByRole("treeitem", {
      name: "Manual branch",
      exact: true,
    });
    const collapsedRoot = dialog.getByRole("treeitem", {
      name: "Collapsed root",
      exact: true,
    });
    await expect(manualBranch).toHaveAttribute("aria-expanded", "false");
    await manualBranch.focus();
    await manualBranch.press("ArrowRight");
    await expect(manualBranch).toHaveAttribute("aria-expanded", "true");
    await expect(
      dialog.getByRole("treeitem", { name: "Manual leaf", exact: true }),
    ).toBeVisible();
    await collapsedRoot.focus();
    await collapsedRoot.press("ArrowLeft");
    await expect(collapsedRoot).toHaveAttribute("aria-expanded", "false");
    const search = dialog.getByRole("searchbox", {
      name: "조직 검색",
      exact: true,
    });
    await search.fill("Needle");
    await expect(
      dialog.getByRole("treeitem", { name: "Needle old", exact: true }),
    ).toBeVisible();
    await parentControl(page, "refresh-nodes");
    await expect(page.getByTestId("node-revision")).toHaveText("1");
    await expect(search).toHaveValue("Needle");
    await expect(
      dialog.getByRole("treeitem", { name: "Needle old", exact: true }),
    ).toHaveCount(0);
    const fresh = dialog.getByRole("treeitem", {
      name: "Needle fresh",
      exact: true,
    });
    await expect(fresh).toBeVisible();
    await expect(
      dialog.getByRole("treeitem", { name: "Fresh branch", exact: true }),
    ).toHaveAttribute("aria-expanded", "true");
    await fresh.focus();
    await fresh.press("Enter");
    await expect(fresh).toHaveAttribute("aria-selected", "true");
    await search.fill("");
    await expect(manualBranch).toHaveAttribute("aria-expanded", "true");
    await expect(
      dialog.getByRole("treeitem", { name: "Manual leaf", exact: true }),
    ).toBeVisible();
    await expect(collapsedRoot).toHaveAttribute("aria-expanded", "false");
    await expect(fresh).toHaveCount(0);
    await dialog
      .getByRole("button", { name: "선택 적용", exact: true })
      .click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByTestId("selected-organizations")).toHaveText(
      '["fresh-leaf"]',
    );
  });

  test(`${framework} equivalent export arrays preserve choices, pending export, and success`, async ({
    page,
  }) => {
    await openFixture(page, framework, "export");
    const dialog = await chooseExportOptions(page);
    await parentControl(page, "rerender-config");
    await expect(page.getByTestId("config-revision")).toHaveText("1");
    await expectExportOptions(dialog);
    await exportSubmit(dialog).click();
    await expect(page.getByTestId("export-count")).toHaveText("1");
    await expect(page.getByTestId("export-selections")).toHaveText(
      JSON.stringify([expectedSelection]),
    );
    await parentControl(page, "rerender-config");
    await expect(page.getByTestId("config-revision")).toHaveText("2");
    await expect(page.getByTestId("export-aborted")).toHaveText("[false]");
    await expect(exportSubmit(dialog)).toBeDisabled();
    await expectExportOptions(dialog);
    await expect(dialog.getByRole("alert")).toHaveCount(0);
    await parentControl(page, "resolve-export");
    await expect(exportSuccess(dialog)).toBeVisible();
    await parentControl(page, "rerender-config");
    await expect(page.getByTestId("config-revision")).toHaveText("3");
    await expect(exportSuccess(dialog)).toBeVisible();
    await expectExportOptions(dialog);
    await expect(page.getByTestId("export-count")).toHaveText("1");
    await expect(page.getByTestId("export-aborted")).toHaveText("[false]");
  });

  if (framework === "vue") {
    test("vue an in-place config mutation invalidates an export even after its resolution is queued", async ({
      page,
    }) => {
      await openFixture(page, framework, "export");
      const dialog = await chooseExportOptions(page);
      const submit = exportSubmit(dialog);
      await submit.click();
      await expect(page.getByTestId("export-count")).toHaveText("1");
      await parentControl(page, "resolve-and-mutate-columns");
      await expect(page.getByTestId("config-change")).toHaveText(
        "columns:mutate",
      );
      await expect(page.getByTestId("export-aborted")).toHaveText("[true]");
      await expect(dialog.getByRole("alert")).toContainText("설정이 변경");
      await expect(exportSuccess(dialog)).toHaveCount(0);
      await expect(submit).toBeEnabled();
      await expectExportOptions(dialog, "Display name");
      await submit.click();
      await expect(page.getByTestId("export-count")).toHaveText("2");
      await expect(page.getByTestId("export-aborted")).toHaveText(
        "[true,false]",
      );
      await parentControl(page, "resolve-export");
      await expect(exportSuccess(dialog)).toBeVisible();
      await expect(dialog.getByRole("alert")).toHaveCount(0);
    });
  }

  for (const kind of ["columns", "scopes", "formats"] as const) {
    for (const completion of ["resolve", "reject"] as const) {
      const modes =
        framework === "vue"
          ? (["replace", "mutate"] as const)
          : (["replace"] as const);
      for (const mode of modes) {
        test(`${framework} ${mode} export ${kind} aborts the old request and late ${completion} preserves a newer request`, async ({
          page,
        }) => {
          await openFixture(page, framework, "export");
          const dialog = await chooseExportOptions(page);
          const submit = exportSubmit(dialog);
          await submit.click();
          await expect(page.getByTestId("export-count")).toHaveText("1");
          await expect(submit).toBeDisabled();
          await parentControl(
            page,
            `${mode === "replace" ? "change" : "mutate"}-${kind}`,
          );
          await expect(page.getByTestId("config-change")).toHaveText(
            `${kind}:${mode}`,
          );
          await expect(page.getByTestId("export-aborted")).toHaveText("[true]");
          await expect(dialog.getByRole("alert")).toContainText("설정이 변경");
          await expect(submit).toBeEnabled();
          await expectExportOptions(
            dialog,
            kind === "columns" ? "Display name" : "Name",
          );
          await submit.click();
          await expect(page.getByTestId("export-count")).toHaveText("2");
          await expect(page.getByTestId("export-selections")).toHaveText(
            JSON.stringify([expectedSelection, expectedSelection]),
          );
          await expect(page.getByTestId("export-aborted")).toHaveText(
            "[true,false]",
          );
          await parentControl(page, `${completion}-first-export`);
          await expect(submit).toBeDisabled();
          await expect(
            dialog.getByRole("checkbox", { name: "Team", exact: true }),
          ).toBeDisabled();
          await expect(exportSuccess(dialog)).toHaveCount(0);
          await expect(dialog.getByRole("alert")).toHaveCount(0);
          await expect(page.getByTestId("export-count")).toHaveText("2");
          await parentControl(page, "resolve-export");
          await expect(exportSuccess(dialog)).toBeVisible();
          await expect(dialog.getByRole("alert")).toHaveCount(0);
          await expect(page.getByTestId("export-aborted")).toHaveText(
            "[true,false]",
          );
        });
      }
    }
  }
}
