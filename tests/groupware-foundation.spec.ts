import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

type Framework = "react" | "vue";

const components = [
  ["list-page", "ListPage"],
  ["detail-page", "DetailPage"],
  ["form-page", "FormPage"],
  ["master-detail-layout", "MasterDetailLayout"],
  ["form-section", "FormSection"],
  ["form-grid", "FormGrid"],
  ["form-actions", "FormActions"],
  ["read-only-field", "ReadOnlyField"],
  ["organization-tree-select", "OrganizationTreeSelect"],
  ["permission-matrix", "PermissionMatrix"],
  ["comment-thread", "CommentThread"],
  ["comment-composer", "CommentComposer"],
  ["notification-center", "NotificationCenter"],
  ["file-preview", "FilePreview"],
  ["attachment-gallery", "AttachmentGallery"],
  ["saved-views", "SavedViews"],
  ["import-wizard", "ImportWizard"],
  ["export-dialog", "ExportDialog"],
  ["sortable-list", "SortableList"],
  ["access-denied", "AccessDenied"],
  ["session-expired", "SessionExpired"],
  ["page-error", "PageError"],
] as const;
type ComponentId = (typeof components)[number][0];

const runtimeErrors = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  runtimeErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test.afterEach(async ({ page }) => {
  expect(runtimeErrors.get(page), "uncaught page errors").toEqual([]);
});

async function openComponent(
  page: Page,
  framework: Framework,
  id: ComponentId,
): Promise<Locator> {
  await page.goto(
    framework === "react"
      ? `/#/business-patterns/${id}`
      : "/vue.html?demo=foundation",
  );
  const demo =
    framework === "react"
      ? page.getByRole("region", { name: "미리보기", exact: true })
      : page.locator(`#foundation-${id}`);
  await expect(demo).toBeVisible();
  return demo;
}

async function choose(page: Page, control: Locator, name: string) {
  await control.click();
  await page.getByRole("option", { name, exact: true }).click();
}

async function expectNoPageOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    )
    .toBe(true);
}

async function expectDialogFits(page: Page, dialog: Locator) {
  await expect(dialog).toBeVisible();
  await expect
    .poll(() =>
      dialog.evaluate((element) => {
        const { left, right } = element.getBoundingClientRect();
        return (
          left >= -1 &&
          right <= innerWidth + 1 &&
          element.scrollWidth <= element.clientWidth + 1
        );
      }),
    )
    .toBe(true);
  await expectNoPageOverflow(page);
}

for (const framework of ["react", "vue"] as const) {
  test(`${framework} exposes every reusable foundation example`, async ({
    page,
  }) => {
    test.setTimeout(60_000);
    for (const [id] of components) {
      const demo = await openComponent(page, framework, id);
      await expect(demo).not.toBeEmpty();
      await expect(demo).not.toContainText("실행 예제를 준비하고 있습니다.");
    }
  });

  test(`${framework} list template renders caller filtering and a nested heading`, async ({
    page,
  }) => {
    const demo = await openComponent(page, framework, "list-page");
    const search = demo.getByRole(
      framework === "react" ? "textbox" : "searchbox",
      {
        name: framework === "react" ? "구성원 검색" : "직원 검색",
        exact: true,
      },
    );
    await search.fill("김민서");
    const table = demo.getByRole("table");
    await expect(table.locator("tbody tr")).toHaveCount(1);
    await expect(table).toContainText("김민서");
    await search.fill("일치하지않는직원");
    await expect(table).not.toContainText("김민서");
    await search.fill("");
    await expect(table).toContainText("김민서");
    await expect(demo.locator(".cheese-page-header h1")).toHaveCount(0);
    await expect(
      demo.locator(".cheese-page-header h3, .cheese-page-header h4"),
    ).toHaveCount(1);
  });

  test(`${framework} detail and master-detail templates keep selection controlled by the consumer`, async ({
    page,
  }) => {
    const detail = await openComponent(page, framework, "detail-page");
    if (framework === "react") {
      await detail.getByRole("tab", { name: "변경 이력", exact: true }).click();
      await expect(
        detail.getByRole("table", { name: "정보 변경 이력", exact: true }),
      ).toBeVisible();
      await detail.getByRole("tab", { name: "기본 정보", exact: true }).click();
      await expect(
        detail.getByRole("table", { name: "정보 변경 이력", exact: true }),
      ).toHaveCount(0);
    } else {
      await detail
        .getByRole("button", { name: "연락처 보기", exact: true })
        .click();
      await expect(
        detail.getByText("minseo@example.com", { exact: true }),
      ).toBeVisible();
      await detail
        .getByRole("button", { name: "연락처 숨기기", exact: true })
        .click();
      await expect(
        detail.getByText("minseo@example.com", { exact: true }),
      ).toHaveCount(0);
    }
    const master = await openComponent(page, framework, "master-detail-layout");
    const name = framework === "react" ? "박지안" : "이지우";
    const selection = master.getByRole("button", { name, exact: true });
    await selection.click();
    await expect(selection).toHaveAttribute("aria-pressed", "true");
    await expect(
      master.getByRole("region", {
        name: framework === "react" ? "선택한 구성원" : "선택한 직원 정보",
        exact: true,
      }),
    ).toContainText(name);
    await expect(
      master.getByRole("button", { name: "김민서", exact: true }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  test(`${framework} form template preserves native required validation and locks during submit`, async ({
    page,
  }) => {
    const now = new Date("2026-09-29T00:00:00Z");
    await page.clock.install({ time: now });
    const demo = await openComponent(page, framework, "form-page");
    const input = demo.getByRole("textbox", {
      name: framework === "react" ? "이름" : "직원 이름",
      exact: true,
    });
    const form = demo.locator("form.cheese-form-page");
    const save = demo.getByRole("button", {
      name: framework === "react" ? "저장" : "변경 저장",
      exact: true,
    });
    const originalUrl = page.url();
    await input.fill("");
    await input.press("Enter");
    await expect(input).toBeFocused();
    expect(
      await input.evaluate(
        (node: HTMLInputElement) => node.validity.valueMissing,
      ),
    ).toBe(true);
    await expect(form).not.toHaveAttribute("aria-busy", "true");
    await input.fill("검증 담당자");
    // Hold the pending state while checking every control; slower browser
    // actionability checks must not consume the example's 300/500ms request.
    await page.clock.pauseAt(new Date(now.getTime() + 60_000));
    await save.click();
    await expect(form).toHaveAttribute("aria-busy", "true");
    await expect(input).toBeDisabled();
    await expect(save).toBeDisabled();
    await expect(
      demo.getByRole("button", { name: "취소", exact: true }),
    ).toBeDisabled();
    await page.clock.runFor(framework === "react" ? 600 : 400);
    await expect(form).not.toHaveAttribute("aria-busy", "true");
    await expect(demo.getByRole("status")).toContainText(/저장/);
    await expect(input).toHaveValue("검증 담당자");
    await expect(page).toHaveURL(originalUrl);
  });

  test(`${framework} form section disables its own fields and responsive grid remains configurable`, async ({
    page,
  }) => {
    const section = await openComponent(page, framework, "form-section");
    const lock = section.getByRole("checkbox", {
      name: framework === "react" ? "입력 영역 비활성화" : "연락처 편집 잠금",
      exact: true,
    });
    const input = section.getByRole("textbox", {
      name: framework === "react" ? "회사 이메일" : "업무 이메일",
      exact: true,
    });
    await input.fill("team@example.com");
    await lock.check();
    await expect(input).toBeDisabled();
    await expect(lock).toBeEnabled();
    await lock.uncheck();
    await expect(input).toBeEnabled();
    await expect(input).toHaveValue("team@example.com");
    const grid = await openComponent(page, framework, "form-grid");
    await grid.getByRole("button", { name: "3열", exact: true }).click();
    await expect(grid.locator(".cheese-form-grid")).toHaveAttribute(
      "data-columns",
      "3",
    );
    await grid.getByRole("button", { name: "1열", exact: true }).click();
    await expect(grid.locator(".cheese-form-grid")).toHaveAttribute(
      "data-columns",
      "1",
    );
    await expect(
      grid.getByRole("button", { name: "1열", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test(`${framework} form actions submit and cancel through the owning form`, async ({
    page,
  }) => {
    const demo = await openComponent(page, framework, "form-actions");
    const input = demo.getByRole("textbox", {
      name: framework === "react" ? "설정 이름" : "문서 제목",
      exact: true,
    });
    const baseline = await input.inputValue();
    await input.fill("수정한 문서");
    await demo
      .getByRole("button", {
        name: framework === "react" ? "설정 저장" : "저장",
        exact: true,
      })
      .click();
    await expect(demo.getByRole("status")).toContainText(/저장/);
    await expect(input).toBeEnabled();
    await input.fill("취소할 변경");
    await demo.getByRole("button", { name: "취소", exact: true }).click();
    await expect(input).toHaveValue(baseline);
  });

  test(`${framework} read-only fields do not mistake zero or false for an absent value`, async ({
    page,
  }) => {
    const demo = await openComponent(page, framework, "read-only-field");
    await expect(
      demo.locator(".cheese-read-only-field-value").filter({ hasText: /^0$/ }),
    ).toHaveCount(1);
    await expect(
      demo
        .locator(".cheese-read-only-field-value")
        .filter({ hasText: /^false$/ }),
    ).toHaveCount(1);
    if (framework === "react") {
      await demo
        .getByRole("checkbox", { name: "비어 있는 값 보기", exact: true })
        .check();
      await expect(
        demo.getByText("등록된 업무 없음", { exact: true }),
      ).toBeVisible();
    } else {
      await demo
        .getByRole("button", { name: "빈 값 보기", exact: true })
        .click();
      await expect(
        demo.getByText("등록된 이메일 없음", { exact: true }),
      ).toBeVisible();
    }
  });

  test(`${framework} organization selection stays staged until applied and preserves disabled nodes`, async ({
    page,
  }) => {
    const demo = await openComponent(
      page,
      framework,
      "organization-tree-select",
    );
    const trigger = demo.getByRole("button", { name: /^업무 담당 조직 선택/ });
    await trigger.click();
    const dialog = page.getByRole("dialog", {
      name: "업무 담당 조직 선택",
      exact: true,
    });
    const search = dialog.getByRole("searchbox", {
      name: "조직 검색",
      exact: true,
    });
    await expect(search).toBeFocused();
    const design = dialog.getByRole("treeitem", {
      name: "디자인팀",
      exact: true,
    });
    await design.click();
    await expect(design).toHaveAttribute("aria-selected", "true");
    await dialog.getByRole("button", { name: "취소", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();

    await trigger.click();
    await expect(design).toHaveAttribute("aria-selected", "false");
    await expect(
      dialog.getByRole("treeitem", { name: /보관 조직/ }),
    ).toHaveAttribute("aria-disabled", "true");
    await search.fill("디자인");
    await expect(
      dialog.getByRole("treeitem", { name: "플랫폼팀", exact: true }),
    ).toHaveCount(0);
    await design.click();
    await dialog
      .getByRole("button", { name: "선택 적용", exact: true })
      .click();
    await expect(dialog).toHaveCount(0);
    await expect(demo.locator(".cheese-org-chips")).toContainText("디자인팀");
    await trigger.click();
    await expect(design).toHaveAttribute("aria-selected", "true");
    await design.click();
    await page.keyboard.press("Escape");
    await expect(demo.locator(".cheese-org-chips")).toContainText("디자인팀");
  });

  test(`${framework} organization tree supports keyboard selection without selecting descendants`, async ({
    page,
  }) => {
    const demo = await openComponent(
      page,
      framework,
      "organization-tree-select",
    );
    await demo.getByRole("button", { name: /^업무 담당 조직 선택/ }).click();
    const dialog = page.getByRole("dialog", {
      name: "업무 담당 조직 선택",
      exact: true,
    });
    const root = dialog.getByRole("treeitem", {
      name: /^(회사|CHEESE Studio)$/,
    });
    await root.focus();
    await page.keyboard.press("Space");
    await expect(root).toHaveAttribute("aria-selected", "true");
    await expect(
      dialog.getByRole("treeitem", { name: "디자인팀", exact: true }),
    ).toHaveAttribute("aria-selected", "false");
    await page.keyboard.press("ArrowDown");
    await expect(
      dialog.getByRole("treeitem", { name: "플랫폼팀", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("End");
    const locked = dialog.getByRole("treeitem", { name: /보관 조직/ });
    await expect(locked).toBeFocused();
    await page.keyboard.press("Space");
    await expect(locked).toHaveAttribute("aria-selected", "false");
    await page.keyboard.press("Home");
    await expect(root).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(
      demo.getByRole("button", { name: /^업무 담당 조직 선택/ }),
    ).toBeFocused();
    await expect(demo.locator(".cheese-org-chips")).not.toContainText(
      /회사|CHEESE Studio/,
    );
  });

  test(`${framework} permission cells and row selectors keep unavailable and locked grants unchanged`, async ({
    page,
  }) => {
    const demo = await openComponent(page, framework, "permission-matrix");
    const matrix = demo.getByRole("table", {
      name: "역할별 기능 권한",
      exact: true,
    });
    const read = matrix.getByRole("checkbox", { name: /^직원\s?정보 조회$/ });
    const row = matrix.getByRole("checkbox", {
      name: /^직원\s?정보 사용 가능한 권한 전체( 선택)?$/,
    });
    await read.check();
    await expect(row).toHaveAttribute("aria-checked", "mixed");
    await row.check();
    await expect(read).toBeChecked();
    await expect(
      matrix.getByRole("checkbox", { name: /^직원\s?정보 수정$/ }),
    ).toBeChecked();
    await row.uncheck();
    await expect(read).not.toBeChecked();
    await expect(
      matrix.getByRole("checkbox", { name: /^시스템\s?설정 조회$/ }),
    ).toBeDisabled();
    await expect(
      matrix.getByRole("checkbox", {
        name: /^시스템\s?설정 사용 가능한 권한 전체( 선택)?$/,
      }),
    ).toBeDisabled();
    await expect(
      matrix.getByLabel(/^평가\s?결과 삭제 (제공하지 않음|권한 사용 불가)$/),
    ).toBeVisible();
    await matrix
      .getByRole("checkbox", {
        name: /^평가\s?결과 사용 가능한 권한 전체( 선택)?$/,
      })
      .check();
    await expect(
      matrix.getByRole("checkbox", { name: /^평가\s?결과 삭제$/ }),
    ).toHaveCount(0);
  });

  test(`${framework} sortable list supports keyboard order and protects list bounds`, async ({
    page,
  }) => {
    const demo = await openComponent(page, framework, "sortable-list");
    const list = demo.getByRole("list", { name: "메뉴 순서", exact: true });
    await expect(
      list.getByRole("button", { name: "대시보드 위로 이동", exact: true }),
    ).toBeDisabled();
    const employee = list.getByRole("listitem", {
      name:
        framework === "react"
          ? /^2\. 직원\s?관리$/
          : /^직원\s?관리, 4개 중 2번째$/,
    });
    await employee.focus();
    await page.keyboard.press("Alt+ArrowUp");
    const firstEmployee = list.getByRole("listitem", {
      name:
        framework === "react"
          ? /^1\. 직원\s?관리$/
          : /^직원\s?관리, 4개 중 1번째$/,
    });
    await expect(firstEmployee).toBeFocused();
    await expect(list.getByRole("listitem").first()).toContainText(
      /직원\s?관리/,
    );
    await expect(
      list.getByRole("button", { name: /^직원\s?관리 위로 이동$/ }),
    ).toBeDisabled();
    await page.keyboard.press("Alt+ArrowUp");
    await expect(list.getByRole("listitem").first()).toContainText(
      /직원\s?관리/,
    );
    await list
      .getByRole("button", { name: /^직원\s?관리 아래로 이동$/ })
      .click();
    await expect(list.getByRole("listitem").first()).toContainText("대시보드");
    await expect(
      demo.getByRole("status").filter({ hasText: /이동 요청됨|이동했습니다/ }),
    ).toContainText(/직원\s?관리/);
  });

  test(`${framework} permission read-only mode and fixed sort entries block edits`, async ({
    page,
  }) => {
    const demo = await openComponent(page, framework, "permission-matrix");
    await demo.getByRole("checkbox", { name: /^(권한 )?읽기 전용$/ }).check();
    const matrix = demo.getByRole("table", {
      name: "역할별 기능 권한",
      exact: true,
    });
    for (const checkbox of await matrix.getByRole("checkbox").all())
      await expect(checkbox).toBeDisabled();
    await expect(
      matrix.getByRole("checkbox", { name: /^직원\s?정보 조회$/ }),
    ).toBeChecked();
    const sort = await openComponent(page, framework, "sortable-list");
    await expect(
      sort.getByRole("button", { name: /^평가\s?관리 아래로 이동$/ }),
    ).toBeDisabled();
    await expect(
      sort.getByRole("button", { name: /^보안 (설정|정책) 위로 이동$/ }),
    ).toBeDisabled();
    await expect(
      sort.getByRole("button", { name: /^보안 (설정|정책) 아래로 이동$/ }),
    ).toBeDisabled();
  });

  test(`${framework} comment composer preserves a rejected draft and accepts the same draft once`, async ({
    page,
  }) => {
    const demo = await openComponent(page, framework, "comment-composer");
    const input = demo.getByRole("textbox", { name: /^검토 의견( 작성)?$/ });
    const submit = demo.getByRole("button", { name: "등록", exact: true });
    const failure = demo.getByRole("checkbox", {
      name: "다음 요청 실패 재현",
      exact: true,
    });
    await failure.check();
    await input.fill("팀별 검토 일정을 함께 확인해 주세요.");
    await submit.click();
    await expect(input).toBeDisabled();
    await expect(submit).toBeDisabled();
    await expect(demo.getByRole("alert")).toContainText(
      "작성한 내용은 유지됩니다",
    );
    await expect(input).toHaveValue("팀별 검토 일정을 함께 확인해 주세요.");
    await failure.uncheck();
    await input.press("Control+Enter");
    await expect(input).toHaveValue("");
    await expect(
      demo.getByRole("status").filter({ hasText: "등록되었습니다." }),
    ).toBeVisible();
    await expect(
      demo.locator(".cheese-description-list, .cheese-read-only-field"),
    ).toContainText("팀별 검토 일정을 함께 확인해 주세요.");
  });

  test(`${framework} comment thread supports cancel, failure, edit, reply and confirmed deletion`, async ({
    page,
  }) => {
    const demo = await openComponent(page, framework, "comment-thread");
    const edit = demo.getByRole("button", {
      name: "김민서 댓글 수정",
      exact: true,
    });
    await edit.click();
    const editor = demo.getByRole("textbox", {
      name: "댓글 수정",
      exact: true,
    });
    const original = await editor.inputValue();
    await editor.fill("취소할 의견");
    await demo.getByRole("button", { name: "취소", exact: true }).click();
    await expect(demo.getByText(original, { exact: true })).toBeVisible();
    await edit.click();
    await editor.fill("검토가 완료된 의견");
    const failure = demo.getByRole("checkbox", {
      name: "다음 요청 실패 재현",
      exact: true,
    });
    await failure.check();
    await demo.getByRole("button", { name: "변경 저장", exact: true }).click();
    await expect(demo.getByRole("alert")).toBeVisible();
    await expect(editor).toHaveValue("검토가 완료된 의견");
    await failure.uncheck();
    await demo.getByRole("button", { name: "변경 저장", exact: true }).click();
    await expect(editor).toHaveCount(0);
    await expect(
      demo.getByText("검토가 완료된 의견", { exact: true }),
    ).toBeVisible();
    await demo
      .getByRole("button", { name: "김민서 댓글에 답글 작성", exact: true })
      .click();
    await demo
      .getByRole("textbox", { name: "김민서님에게 답글 작성", exact: true })
      .fill("답글 확인했습니다.");
    await demo.getByRole("button", { name: "답글 등록", exact: true }).click();
    await expect(
      demo.getByText("답글 확인했습니다.", { exact: true }),
    ).toBeVisible();
    await demo
      .getByRole("button", { name: "김민서 댓글 삭제", exact: true })
      .click();
    const dialog = page.getByRole("alertdialog", {
      name: "댓글을 삭제할까요?",
      exact: true,
    });
    await dialog.getByRole("button", { name: "취소", exact: true }).click();
    await expect(
      demo.getByText("검토가 완료된 의견", { exact: true }),
    ).toBeVisible();
    await demo
      .getByRole("button", { name: "김민서 댓글 삭제", exact: true })
      .click();
    await dialog.getByRole("button", { name: "삭제", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(
      demo.getByText("검토가 완료된 의견", { exact: true }),
    ).toHaveCount(0);
    await expect(
      demo.getByText("답글 확인했습니다.", { exact: true }),
    ).toHaveCount(0);
  });

  test(`${framework} notification navigation is separate from reading and failures keep unread state`, async ({
    page,
  }) => {
    const demo = await openComponent(page, framework, "notification-center");
    const title =
      framework === "react" ? "자기평가 작성 요청" : "평가 검토 요청";
    const read = demo.getByRole("button", {
      name: `${title} 읽음으로 표시`,
      exact: true,
    });
    await demo.getByRole("button", { name: title, exact: true }).click();
    await expect(read).toBeVisible();
    await expect(
      demo.getByRole("status").filter({ hasText: title }),
    ).toBeVisible();
    const failure = demo.getByRole("checkbox", {
      name: "다음 요청 실패 재현",
      exact: true,
    });
    await failure.check();
    await read.click();
    await expect(demo.getByRole("alert")).toContainText(
      "읽음으로 변경하지 못했습니다",
    );
    await expect(read).toBeVisible();
    await failure.uncheck();
    await read.click();
    await expect(read).toHaveCount(0);
    const all = demo.getByRole("button", { name: "모두 읽음", exact: true });
    await all.click();
    await expect(all).toBeDisabled();
    await expect(
      demo.getByRole("button", { name: /읽음으로 표시$/ }),
    ).toHaveCount(0);
  });

  test(`${framework} expired preview delegates retry, displays an image and restores trigger focus`, async ({
    page,
  }) => {
    const demo = await openComponent(page, framework, "file-preview");
    const trigger = demo.getByRole("button", {
      name:
        framework === "react" ? "만료된 이미지.png 열기" : "파일 미리보기 열기",
      exact: true,
    });
    await trigger.click();
    const dialog = page.getByRole("dialog", {
      name: framework === "react" ? "만료된 이미지.png" : "브랜드 로고.png",
      exact: true,
    });
    await expect(
      dialog.getByText("미리보기 링크가 만료되었습니다.", { exact: true }),
    ).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: "다운로드", exact: true }),
    ).toHaveCount(0);
    await dialog
      .getByRole("button", { name: "다시 시도", exact: true })
      .click();
    const img = dialog.getByRole("img");
    await expect(img).toBeVisible();
    await expect
      .poll(() =>
        img.evaluate(
          (node: HTMLImageElement) => node.complete && node.naturalWidth > 0,
        ),
      )
      .toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test(`${framework} attachment gallery exposes unsupported content without fake media and opens another file`, async ({
    page,
  }) => {
    const demo = await openComponent(page, framework, "attachment-gallery");
    const unsupported =
      framework === "react" ? "안내 문서.txt" : "업무 원본.zip";
    await demo
      .getByRole("button", { name: `${unsupported} 미리보기`, exact: true })
      .click();
    const dialog = page.getByRole("dialog", { name: unsupported, exact: true });
    await expect(
      dialog
        .locator(".cheese-file-preview-message")
        .getByText("미리보기를 지원하지 않는 파일입니다.", { exact: true }),
    ).toBeVisible();
    await expect(dialog.locator("img, iframe, video")).toHaveCount(0);
    await dialog
      .getByRole("button", { name: "미리보기 닫기", exact: true })
      .click();
    await expect(dialog).toHaveCount(0);
    await expect(
      demo.getByRole("button", {
        name: `${unsupported} 미리보기`,
        exact: true,
      }),
    ).toBeFocused();
    const imageName = "브랜드 로고.png";
    await demo
      .getByRole("button", { name: `${imageName} 미리보기`, exact: true })
      .click();
    const imageDialog = page.getByRole("dialog", {
      name: imageName,
      exact: true,
    });
    await expect(imageDialog.getByRole("img")).toBeVisible();
    await expect(
      imageDialog.getByText("미리보기를 지원하지 않는 파일입니다.", {
        exact: true,
      }),
    ).toHaveCount(0);
    await imageDialog
      .getByRole("button", { name: "미리보기 닫기", exact: true })
      .click();
    await expect(imageDialog).toHaveCount(0);
    await expect(
      demo.getByRole("button", { name: `${imageName} 미리보기`, exact: true }),
    ).toBeFocused();
  });

  test(`${framework} access, session and page-error states execute only caller actions`, async ({
    page,
  }) => {
    const access = await openComponent(page, framework, "access-denied");
    const url = page.url();
    await access
      .getByRole("button", {
        name: framework === "react" ? "접근 요청 안내" : "권한 요청 안내",
        exact: true,
      })
      .click();
    await expect(
      access.getByRole("status").filter({ hasText: /전달/ }),
    ).toBeVisible();
    await expect(page).toHaveURL(url);
    const session = await openComponent(page, framework, "session-expired");
    await session
      .getByRole("button", { name: "다시 로그인", exact: true })
      .click();
    await expect(session.getByRole("status")).toContainText("로그인 연결");
    await session
      .getByRole("button", { name: "만료 상태 다시 보기", exact: true })
      .click();
    await expect(
      session.getByRole("button", { name: "다시 로그인", exact: true }),
    ).toBeVisible();
    const error = await openComponent(page, framework, "page-error");
    await error.getByRole("button", { name: "다시 시도", exact: true }).click();
    await expect(error.getByRole("status")).toContainText(/다시/);
    await error
      .getByRole("button", { name: "오류 상태 다시 보기", exact: true })
      .click();
    await expect(
      error.getByRole("button", { name: "다시 시도", exact: true }),
    ).toBeVisible();
  });

  test(`${framework} saved views capture, restore and delete a named caller-owned filter`, async ({
    page,
  }) => {
    const demo = await openComponent(page, framework, "saved-views");
    const query = demo.getByRole("textbox", {
      name: framework === "react" ? "현재 검색 조건" : "저장할 검색어",
      exact: true,
    });
    const name = demo.getByRole("textbox", {
      name: "새 보기 이름",
      exact: true,
    });
    const select = demo.getByRole("combobox");
    const save = demo.getByRole("button", {
      name: "현재 조건 저장",
      exact: true,
    });
    await expect(save).toBeDisabled();
    await query.fill("디자인팀");
    await name.fill("디자인 조직");
    await save.click();
    await expect(name).toHaveValue("");
    await expect(select).toContainText("디자인 조직");
    await query.fill("다른 검색어");
    await choose(
      page,
      select,
      framework === "react" ? "플랫폼팀" : "전체 직원",
    );
    await choose(page, select, "디자인 조직");
    await expect(query).toHaveValue("디자인팀");
    await demo
      .getByRole("button", {
        name: "선택한 보기 삭제",
        exact: true,
      })
      .click();
    await demo.getByRole("button", { name: "취소", exact: true }).click();
    await expect(select).toContainText("디자인 조직");
    await demo
      .getByRole("button", {
        name: "선택한 보기 삭제",
        exact: true,
      })
      .click();
    await demo
      .getByRole("button", {
        name: "보기 삭제",
        exact: true,
      })
      .click();
    await expect(select).not.toContainText("디자인 조직");
    await select.click();
    await expect(
      page.getByRole("option", { name: "디자인 조직", exact: true }),
    ).toHaveCount(0);
    await page.keyboard.press("Escape");
  });

  test(`${framework} import validates file, mappings and required values before allowing writes`, async ({
    page,
  }) => {
    const demo = await openComponent(page, framework, "import-wizard");
    const file = demo.locator('input[type="file"]');
    await file.setInputFiles({
      name: "empty.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(""),
    });
    await expect(demo.getByRole("alert")).toBeVisible();
    await file.setInputFiles({
      name: "invalid.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("name,team\n,플랫폼팀\n", "utf8"),
    });
    await demo
      .getByRole("button", { name: "데이터 검증", exact: true })
      .click();
    await expect(
      demo.locator(
        framework === "react"
          ? "ul.cheese-data-actions-list"
          : ".cheese-data-actions-result .cheese-data-actions-list",
      ),
    ).toContainText(/이름/);
    if (framework === "react")
      await expect(
        demo.getByRole("button", { name: "등록 실행", exact: true }),
      ).toBeDisabled();
    else
      await expect(
        demo.getByRole("button", { name: /^\d+행 등록$/ }),
      ).toHaveCount(0);
    await file.setInputFiles({
      name: "unmapped.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("sourceName,sourceTeam\n김민서,플랫폼팀\n", "utf8"),
    });
    await demo
      .getByRole("button", { name: "데이터 검증", exact: true })
      .click();
    await expect(demo.getByRole("alert")).toBeVisible();
    await choose(
      page,
      demo.getByRole("combobox", { name: /^이름( \(필수\))?$/ }),
      "sourceName",
    );
    await choose(
      page,
      demo.getByRole("combobox", { name: /^소속( \(필수\))?$/ }),
      "sourceTeam",
    );
    await demo
      .getByRole("button", { name: "데이터 검증", exact: true })
      .click();
    await expect(
      demo.getByRole("button", {
        name: framework === "react" ? "등록 실행" : "1행 등록",
        exact: true,
      }),
    ).toBeEnabled();
    await expect(
      demo.getByRole("status").filter({
        hasText:
          framework === "react" ? /메모리에 등록한 행/ : /메모리에 등록된 이름/,
      }),
    ).toContainText(framework === "react" ? "0개" : "없음");
  });

  test(`${framework} import retries only failed rows and a new file resets the previous result`, async ({
    page,
  }) => {
    const demo = await openComponent(page, framework, "import-wizard");
    const file = demo.locator('input[type="file"]');
    await file.setInputFiles({
      name: "team.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(
        "name,team\n김민서,플랫폼팀\n이지우,디자인팀\n",
        "utf8",
      ),
    });
    await demo
      .getByRole("button", { name: "데이터 검증", exact: true })
      .click();
    await demo
      .getByRole("checkbox", { name: "다음 요청 실패 재현", exact: true })
      .check();
    await demo
      .getByRole("button", {
        name: framework === "react" ? "등록 실행" : "2행 등록",
        exact: true,
      })
      .click();
    const result = demo.getByRole("status").filter({ hasText: /등록 성공/ });
    await expect(result).toContainText(/성공 1(개|행).*실패 1(개|행)/);
    await demo
      .getByRole("button", {
        name:
          framework === "react"
            ? "실패한 행만 다시 시도"
            : "실패한 1행만 재시도",
        exact: true,
      })
      .click();
    await expect(result).toContainText(/성공 2(개|행).*실패 0(개|행)/);
    const persisted = demo.getByRole("status").filter({
      hasText:
        framework === "react" ? /메모리에 등록한 행/ : /메모리에 등록된 이름/,
    });
    await expect(persisted).toContainText(
      framework === "react" ? "2개" : "김민서, 이지우",
    );
    await demo
      .locator(".cheese-data-actions")
      .getByRole("button", {
        name: framework === "react" ? "새로 시작" : "초기화",
        exact: true,
      })
      .click();
    await file.setInputFiles({
      name: "next.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("name,team\n박하린,피플팀\n", "utf8"),
    });
    await expect(result).toHaveCount(0);
    await expect(
      demo.getByRole("button", { name: /실패한.*(재시도|다시 시도)/ }),
    ).toHaveCount(0);
    await expect(
      demo.getByRole("button", { name: "데이터 검증", exact: true }),
    ).toBeEnabled();
    await demo
      .getByRole("button", { name: "데이터 검증", exact: true })
      .click();
    await demo
      .getByRole("button", {
        name: framework === "react" ? "등록 실행" : "1행 등록",
        exact: true,
      })
      .click();
    await expect(result).toContainText(/성공 1(개|행).*실패 0(개|행)/);
    await expect(persisted).toContainText(
      framework === "react" ? "3개" : "김민서, 이지우, 박하린",
    );
  });

  test(`${framework} export requires columns, retains a failed selection and produces a file after retry`, async ({
    page,
  }) => {
    const demo = await openComponent(page, framework, "export-dialog");
    const failure = demo.getByRole("checkbox", {
      name: "다음 요청 실패 재현",
      exact: true,
    });
    await failure.check();
    const trigger = demo.getByRole("button", {
      name: framework === "react" ? "구성원 내보내기" : "직원 정보 내보내기",
      exact: true,
    });
    await trigger.click();
    const dialog = page.getByRole("dialog", {
      name: framework === "react" ? "구성원 내보내기" : "데이터 내보내기",
      exact: true,
    });
    const exportButton = dialog.getByRole("button", {
      name: "내보내기",
      exact: true,
    });
    await dialog.getByRole("checkbox", { name: "이름", exact: true }).uncheck();
    await dialog.getByRole("checkbox", { name: "소속", exact: true }).uncheck();
    await expect(exportButton).toBeDisabled();
    await dialog.getByRole("checkbox", { name: "이름", exact: true }).check();
    await choose(
      page,
      dialog.getByRole("combobox", {
        name: framework === "react" ? "내보낼 범위" : "내보내기 범위",
        exact: true,
      }),
      framework === "react" ? "선택한 1명" : "선택한 직원 (1명)",
    );
    await exportButton.click();
    await expect(exportButton).toBeDisabled();
    await expect(dialog.getByRole("alert")).toBeVisible();
    await expect(
      dialog.getByRole("checkbox", { name: "이름", exact: true }),
    ).toBeChecked();
    await expect(
      dialog.getByRole("checkbox", { name: "소속", exact: true }),
    ).not.toBeChecked();
    await dialog.getByRole("button", { name: /^(취소|닫기)$/ }).click();
    await failure.uncheck();
    await trigger.click();
    const downloadPromise = page.waitForEvent("download");
    await dialog.getByRole("button", { name: "내보내기", exact: true }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
    expect(await download.failure()).toBeNull();
    await expect(dialog.getByRole("status")).toContainText(/완료되었습니다/);
  });

  test(`${framework} pending reply cannot be unmounted by edit or delete and rejected content survives`, async ({
    page,
  }) => {
    const now = new Date("2026-09-29T00:00:00Z");
    await page.clock.install({ time: now });
    const demo = await openComponent(page, framework, "comment-thread");
    const failure = demo.getByRole("checkbox", {
      name: "다음 요청 실패 재현",
      exact: true,
    });
    await failure.check();
    await demo
      .getByRole("button", { name: "김민서 댓글에 답글 작성", exact: true })
      .click();
    const draft = demo.getByRole("textbox", {
      name: "김민서님에게 답글 작성",
      exact: true,
    });
    await draft.fill("실패해도 남아 있어야 하는 답글");
    // Verify the pending guards before explicitly releasing the request timer.
    await page.clock.pauseAt(new Date(now.getTime() + 60_000));
    await demo.getByRole("button", { name: "답글 등록", exact: true }).click();
    await expect(draft).toBeDisabled();
    await expect(
      demo.getByRole("button", { name: "김민서 댓글 수정", exact: true }),
    ).toHaveCount(0);
    await expect(
      demo.getByRole("button", { name: "김민서 댓글 삭제", exact: true }),
    ).toBeDisabled();
    await expect(
      demo.getByRole("button", { name: "취소", exact: true }),
    ).toBeDisabled();
    await page.clock.runFor(400);
    await expect(demo.getByRole("alert")).toContainText(
      "작성한 내용은 유지됩니다",
    );
    await expect(draft).toHaveValue("실패해도 남아 있어야 하는 답글");
    await failure.uncheck();
    await demo.getByRole("button", { name: "답글 등록", exact: true }).click();
    await page.clock.runFor(400);
    await expect(
      demo.getByText("실패해도 남아 있어야 하는 답글", { exact: true }),
    ).toBeVisible();
    await expect(
      demo.getByRole("button", { name: "김민서 댓글 수정", exact: true }),
    ).toBeVisible();
  });

  test(`${framework} foundation pages fit a 320px viewport without global horizontal scroll`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 320, height: 800 });
    for (const [id] of components) {
      const demo = await openComponent(page, framework, id);
      await expectNoPageOverflow(page);
      if (id === "form-grid") {
        await demo.getByRole("button", { name: "3열", exact: true }).click();
        const inputs = demo.getByRole("textbox");
        const first = await inputs.nth(0).boundingBox();
        const second = await inputs.nth(1).boundingBox();
        expect(first).not.toBeNull();
        expect(second).not.toBeNull();
        expect(second!.y).toBeGreaterThan(first!.y + first!.height);
      }
      if (id === "list-page" && testInfo.project.name === "chromium") {
        await demo.screenshot({
          path: `artifacts/foundation-${framework}-list-mobile.png`,
        });
      }
    }
  });

  test(`${framework} organization, export and media dialogs fit 320px and remain keyboard closable`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const org = await openComponent(
      page,
      framework,
      "organization-tree-select",
    );
    await org.getByRole("button", { name: /^업무 담당 조직 선택/ }).click();
    const orgDialog = page.getByRole("dialog", {
      name: "업무 담당 조직 선택",
      exact: true,
    });
    await expectDialogFits(page, orgDialog);
    if (testInfo.project.name === "chromium")
      await page.screenshot({
        path: `artifacts/foundation-${framework}-organization-mobile.png`,
      });
    await page.keyboard.press("Escape");
    await expect(orgDialog).toHaveCount(0);
    const exportDemo = await openComponent(page, framework, "export-dialog");
    await exportDemo
      .getByRole("button", {
        name: framework === "react" ? "구성원 내보내기" : "직원 정보 내보내기",
        exact: true,
      })
      .click();
    const exportDialog = page.getByRole("dialog", {
      name: framework === "react" ? "구성원 내보내기" : "데이터 내보내기",
      exact: true,
    });
    await expectDialogFits(page, exportDialog);
    await page.keyboard.press("Escape");
    await expect(exportDialog).toHaveCount(0);
    const preview = await openComponent(page, framework, "file-preview");
    await preview
      .getByRole("button", {
        name:
          framework === "react"
            ? "만료된 이미지.png 열기"
            : "파일 미리보기 열기",
        exact: true,
      })
      .click();
    const previewDialog = page.getByRole("dialog", {
      name: framework === "react" ? "만료된 이미지.png" : "브랜드 로고.png",
      exact: true,
    });
    await expectDialogFits(page, previewDialog);
    await page.keyboard.press("Escape");
    await expect(previewDialog).toHaveCount(0);
  });

  test(`${framework} representative form, permissions and collaboration examples pass scoped WCAG checks`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(60_000);
    for (const id of [
      "form-page",
      "permission-matrix",
      "comment-composer",
    ] as const) {
      const demo = await openComponent(page, framework, id);
      const report = await new AxeBuilder({ page })
        .include(
          framework === "react"
            ? ".foundation-demo-stage"
            : `#foundation-${id}`,
        )
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(report.violations, `${framework} ${id}`).toEqual([]);
      if (testInfo.project.name === "chromium" && id === "permission-matrix") {
        await demo.screenshot({
          path: `artifacts/foundation-${framework}-permissions-desktop.png`,
        });
      }
    }
  });

  test(`${framework} open organization picker passes scoped WCAG checks`, async ({
    page,
  }) => {
    const demo = await openComponent(
      page,
      framework,
      "organization-tree-select",
    );
    await demo.getByRole("button", { name: /^업무 담당 조직 선택/ }).click();
    await expect(
      page.getByRole("dialog", { name: "업무 담당 조직 선택", exact: true }),
    ).toBeVisible();
    const report = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(report.violations).toEqual([]);
  });
}
