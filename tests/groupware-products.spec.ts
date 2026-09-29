import { expect, test, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

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

async function choose(page: Page, select: Locator, name: string) {
  await select.click();
  await page.getByRole("option", { name, exact: true }).click();
}

function employeeTable(page: Page) {
  return page.getByRole("table", { name: "직원 목록", exact: true });
}

function applicantTable(page: Page) {
  return page.getByRole("table", { name: "오디션 지원자 목록", exact: true });
}

test("work home and product pages share one groupware navigation", async ({
  page,
}) => {
  await page.goto("/#/examples");
  await expect(
    page.getByRole("heading", { name: "안녕하세요, 김치즈님." }),
  ).toBeVisible();
  const navigation = page.getByRole("navigation", {
    name: "CHEESE WORKS 메뉴",
    exact: true,
  });
  await expect(
    navigation.getByRole("link", { name: "업무 홈", exact: true }),
  ).toHaveAttribute("aria-current", "page");

  for (const [name, id, heading] of [
    ["인사평가", "evaluation", "내 인사평가"],
    ["조직·구성원", "employees", "조직·구성원"],
    ["오디션 운영", "auditions", "지원서 검토"],
  ]) {
    await navigation.getByRole("link", { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#/examples/${id}$`));
    await expect(
      page.getByRole("heading", { name: heading, exact: true, level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole("complementary", { name: "문서 사이드바" }),
    ).toHaveCount(0);
    await expect(
      page
        .getByRole("navigation", { name: "CHEESE WORKS 메뉴", exact: true })
        .getByRole("link", { name, exact: true }),
    ).toHaveAttribute("aria-current", "page");
  }
  await page
    .getByRole("navigation", { name: "CHEESE WORKS 메뉴", exact: true })
    .getByRole("link", { name: "업무 홈", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "안녕하세요, 김치즈님." }),
  ).toBeVisible();
});

test("employee filters combine organization, status and search, then reset all conditions", async ({
  page,
}) => {
  await page.goto("/#/examples/employees");
  const filter = page.getByRole("region", {
    name: "직원 목록 검색 및 필터",
    exact: true,
  });
  const search = filter.getByRole("searchbox", {
    name: "직원 이름·사번·직무 검색",
    exact: true,
  });
  const organization = filter.getByRole("combobox", {
    name: "조직",
    exact: true,
  });
  const status = filter.getByRole("combobox", { name: "상태", exact: true });
  await expect(filter.getByRole("status")).toHaveText("검색 결과 14건");
  await choose(page, organization, "제품·기술");
  await expect(filter.getByRole("status")).toHaveText("검색 결과 4건");
  await choose(page, status, "온보딩");
  await expect(filter.getByRole("status")).toHaveText("검색 결과 1건");
  await expect(
    employeeTable(page).getByRole("cell", { name: "류시우", exact: true }),
  ).toBeVisible();
  await search.fill("EMP-007");
  await expect(
    filter
      .getByRole("list", { name: "적용된 필터", exact: true })
      .getByRole("listitem"),
  ).toHaveCount(3);
  await expect(filter.getByRole("status")).toHaveText("검색 결과 1건");
  await search.fill("검색결과없음");
  await expect(filter.getByRole("status")).toHaveText("검색 결과 0건");
  await expect(employeeTable(page).getByRole("status")).toHaveText(
    "검색 결과가 없습니다.",
  );
  await filter.getByRole("button", { name: "초기화", exact: true }).click();
  await expect(search).toHaveValue("");
  await expect(organization).toHaveText("전체 조직");
  await expect(status).toHaveText("전체 상태");
  await expect(
    filter
      .getByRole("list", { name: "적용된 필터", exact: true })
      .getByRole("listitem"),
  ).toHaveCount(0);
  await expect(filter.getByRole("status")).toHaveText("검색 결과 14건");
  await expect(
    employeeTable(page).getByRole("cell", { name: "서지안", exact: true }),
  ).toBeVisible();
});

test("employee details validate required fields, save trimmed edits and discard drafts", async ({
  page,
}) => {
  await page.goto("/#/examples/employees");
  const trigger = employeeTable(page).getByRole("button", {
    name: "서지안 직원 상세 보기",
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole("dialog", {
    name: "서지안 직원 정보",
    exact: true,
  });
  const team = dialog.getByRole("textbox", { name: "소속 팀", exact: true });
  const job = dialog.getByRole("textbox", { name: "직무", exact: true });
  const save = dialog.getByRole("button", { name: "변경 저장", exact: true });
  await expect(dialog.getByText("EMP-001", { exact: true })).toBeVisible();
  await expect(save).toBeDisabled();
  await team.fill("   ");
  await job.fill("");
  await save.click();
  await expect(team).toHaveAttribute("aria-invalid", "true");
  await expect(job).toHaveAttribute("aria-invalid", "true");
  await expect(team).toBeFocused();
  await expect(
    dialog.getByText("소속 팀을 입력해 주세요.", { exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByText("직무를 입력해 주세요.", { exact: true }),
  ).toBeVisible();
  await expect(dialog.getByRole("status")).toHaveText("저장에 실패했습니다");
  await team.fill("  조직문화팀  ");
  await save.click();
  await expect(job).toBeFocused();
  await job.fill("  조직문화 매니저  ");
  await save.click();
  await expect(dialog.getByRole("status")).toHaveText(
    "변경 내용이 이 화면에 저장되었습니다.",
  );
  await expect(team).toHaveValue("조직문화팀");
  await expect(job).toHaveValue("조직문화 매니저");
  await expect(save).toBeDisabled();
  await dialog.getByRole("button", { name: "닫기", exact: true }).click();
  await expect(trigger).toBeFocused();
  const row = employeeTable(page)
    .getByRole("row")
    .filter({ hasText: "EMP-001" });
  await expect(
    row.getByRole("cell", { name: "조직문화팀", exact: true }),
  ).toBeVisible();
  await expect(
    row.getByRole("cell", { name: "조직문화 매니저", exact: true }),
  ).toBeVisible();
  await trigger.click();
  await job.fill("저장하지 않은 임시 직무");
  await dialog.getByRole("button", { name: "닫기", exact: true }).click();
  const discard = page.getByRole("alertdialog", {
    name: "변경 내용을 버릴까요?",
    exact: true,
  });
  await expect(discard).toBeVisible();
  await discard.getByRole("button", { name: "계속 수정", exact: true }).click();
  await expect(discard).toHaveCount(0);
  await expect(dialog).toBeVisible();
  await expect(job).toHaveValue("저장하지 않은 임시 직무");
  await expect(team).toHaveValue("조직문화팀");
  await page.keyboard.press("Escape");
  await expect(discard).toBeVisible();
  await discard
    .getByRole("button", { name: "변경 내용 버리기", exact: true })
    .click();
  await expect(discard).toHaveCount(0);
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(job).toHaveValue("조직문화 매니저");
  await dialog.getByRole("button", { name: "닫기", exact: true }).click();
});

test("employee bulk status changes update filtered results and clear completed selection", async ({
  page,
}) => {
  await page.goto("/#/examples/employees");
  const filter = page.getByRole("region", {
    name: "직원 목록 검색 및 필터",
    exact: true,
  });
  await choose(
    page,
    filter.getByRole("combobox", { name: "상태", exact: true }),
    "온보딩",
  );
  await expect(filter.getByRole("status")).toHaveText("검색 결과 3건");
  await employeeTable(page)
    .getByRole("checkbox", { name: "현재 페이지 전체 선택", exact: true })
    .check();
  await page
    .getByRole("button", { name: "재직으로 변경", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: /^3건 성공 · 0건 실패$/ }),
  ).toBeVisible();
  await expect(filter.getByRole("status")).toHaveText("검색 결과 0건");
  await expect(
    page.getByRole("button", { name: "재직으로 변경", exact: true }),
  ).toBeDisabled();
  await filter.getByRole("button", { name: "초기화", exact: true }).click();
  const row = employeeTable(page)
    .getByRole("row")
    .filter({ hasText: "EMP-007" });
  await expect(
    row.getByRole("cell", { name: "재직", exact: true }),
  ).toBeVisible();
  await expect(row.getByRole("checkbox")).not.toBeChecked();
});

test("onboarding owner picker excludes unavailable people and commits only an applied selection", async ({
  page,
}) => {
  await page.goto("/#/examples/employees");
  const trigger = page.getByRole("button", { name: /^온보딩 담당자 선택/ });
  await expect(trigger).toContainText("3명");
  await trigger.click();
  const picker = page.getByRole("dialog", {
    name: "온보딩 담당자 선택",
    exact: true,
  });
  await expect(
    picker.getByRole("checkbox", { name: "백소율 · 피플", exact: true }),
  ).toBeDisabled();
  await expect(
    picker.getByRole("checkbox", { name: "남도윤 · 운영", exact: true }),
  ).toBeDisabled();
  await picker
    .getByRole("treeitem", { name: "제품·기술", exact: true })
    .click();
  const results = picker.getByRole("region", {
    name: "사람 검색 결과",
    exact: true,
  });
  await expect(results.getByRole("checkbox")).toHaveCount(4);
  await picker
    .getByRole("searchbox", { name: "사람 검색", exact: true })
    .fill("프론트엔드");
  await expect(results.getByRole("checkbox")).toHaveCount(1);
  await results
    .getByRole("checkbox", { name: "류시우 · 제품·기술", exact: true })
    .check();
  await picker.getByRole("button", { name: "취소", exact: true }).click();
  await expect(trigger).toContainText("3명");
  await trigger.click();
  await expect(
    picker.getByRole("searchbox", { name: "사람 검색", exact: true }),
  ).toHaveValue("");
  await expect(
    picker.getByRole("checkbox", { name: "류시우 · 제품·기술", exact: true }),
  ).not.toBeChecked();
  await picker
    .getByRole("checkbox", { name: "류시우 · 제품·기술", exact: true })
    .check();
  await picker.getByRole("button", { name: "선택 적용", exact: true }).click();
  await expect(trigger).toContainText("4명");
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "온보딩 담당자가 지정되었습니다." }),
  ).toBeVisible();
});

test("audition bulk review retains a materials failure, saves correction and retries only the failed applicant", async ({
  page,
}) => {
  await page.goto("/#/examples/auditions");
  const table = applicantTable(page);
  const complete = table.getByRole("row").filter({ hasText: "APP-001" });
  const missing = table.getByRole("row").filter({ hasText: "APP-002" });
  await complete.getByRole("checkbox").check();
  await missing.getByRole("checkbox").check();
  await page.getByRole("button", { name: "검토 시작", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: /^1건 성공 · 1건 실패$/ }),
  ).toBeVisible();
  await expect(
    complete.getByRole("cell", { name: "검토 중", exact: true }),
  ).toBeVisible();
  await expect(complete.getByRole("checkbox")).not.toBeChecked();
  await expect(missing.getByRole("checkbox")).toBeChecked();
  await expect(
    missing.getByRole("cell", { name: "접수", exact: true }),
  ).toBeVisible();
  await expect(
    missing.getByRole("cell", { name: "자료 미비", exact: true }),
  ).toBeVisible();
  const failure = page
    .getByRole("status")
    .filter({ hasText: "처리하지 못한 지원서" });
  await expect(failure).toContainText("유찬솔 · APP-002");
  await expect(failure).toContainText("제출 자료가 미비합니다.");
  await failure
    .getByRole("button", {
      name: "APP-002 실패 사유 확인 및 수정",
      exact: true,
    })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "유찬솔 지원서",
    exact: true,
  });
  await dialog
    .getByRole("checkbox", { name: "제출 자료 확인 완료", exact: true })
    .check();
  await dialog
    .getByRole("textbox", { name: "검토 메모", exact: true })
    .fill("추가 퍼포먼스 영상을 확인했습니다.");
  await dialog.getByRole("button", { name: /^검토 담당자 선택/ }).click();
  const picker = page.getByRole("dialog", {
    name: "검토 담당자 선택",
    exact: true,
  });
  await picker
    .getByRole("checkbox", { name: "윤도하 · 크리에이티브", exact: true })
    .check();
  await picker.getByRole("button", { name: "선택 적용", exact: true }).click();
  await expect(picker).toHaveCount(0);
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: /^검토 담당자 선택/ }),
  ).toContainText("3명");
  await dialog
    .getByRole("button", { name: "검토 내용 저장", exact: true })
    .click();
  await expect(dialog.getByRole("status")).toHaveText(
    "검토 내용이 이 화면에 저장되었습니다.",
  );
  await dialog.getByRole("button", { name: "닫기", exact: true }).click();
  await expect(
    missing.getByRole("cell", { name: "제출 완료", exact: true }),
  ).toBeVisible();
  await expect(
    missing.getByRole("cell", { name: "접수", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "실패 항목 다시 시도", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: /^1건 성공 · 0건 실패$/ }),
  ).toBeVisible();
  await expect(
    missing.getByRole("cell", { name: "검토 중", exact: true }),
  ).toBeVisible();
  await expect(missing.getByRole("checkbox")).not.toBeChecked();
  await expect(failure).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "실패 항목 다시 시도", exact: true }),
  ).toHaveCount(0);
  await missing
    .getByRole("button", { name: "유찬솔 지원서 상세 보기", exact: true })
    .click();
  await expect(
    dialog.getByRole("textbox", { name: "검토 메모", exact: true }),
  ).toHaveValue("추가 퍼포먼스 영상을 확인했습니다.");
  await expect(
    dialog.getByRole("checkbox", { name: "제출 자료 확인 완료", exact: true }),
  ).toBeChecked();
  await expect(
    dialog.getByRole("button", { name: /^검토 담당자 선택/ }),
  ).toContainText("3명");
});

test("audition details block review without materials and preserve a closed application stage", async ({
  page,
}) => {
  await page.goto("/#/examples/auditions");
  await applicantTable(page)
    .getByRole("button", { name: "유찬솔 지원서 상세 보기", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "유찬솔 지원서",
    exact: true,
  });
  const stage = dialog.getByRole("combobox", {
    name: "진행 단계",
    exact: true,
  });
  await choose(page, stage, "검토 중");
  await dialog
    .getByRole("button", { name: "검토 내용 저장", exact: true })
    .click();
  await expect(stage).toHaveAttribute("aria-invalid", "true");
  await expect(stage).toBeFocused();
  await expect(
    dialog.getByText("검토를 진행하려면 먼저 제출 자료를 확인해 주세요.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(dialog.getByRole("status")).toHaveText("저장에 실패했습니다");
  await dialog.getByRole("button", { name: "닫기", exact: true }).click();
  const discard = page.getByRole("alertdialog", {
    name: "변경 내용을 버릴까요?",
    exact: true,
  });
  await expect(discard).toBeVisible();
  await discard.getByRole("button", { name: "계속 수정", exact: true }).click();
  await expect(discard).toHaveCount(0);
  await expect(dialog).toBeVisible();
  await expect(stage).toHaveText("검토 중");
  await expect(stage).toHaveAttribute("aria-invalid", "true");
  await dialog.getByRole("button", { name: "닫기", exact: true }).click();
  await discard
    .getByRole("button", { name: "변경 내용 버리기", exact: true })
    .click();
  await expect(dialog).toHaveCount(0);
  await expect(
    applicantTable(page)
      .getByRole("row")
      .filter({ hasText: "APP-002" })
      .getByRole("cell", { name: "접수", exact: true }),
  ).toBeVisible();
  await applicantTable(page)
    .getByRole("button", { name: "유찬솔 지원서 상세 보기", exact: true })
    .click();
  await expect(stage).toHaveText("접수");
  await expect(stage).not.toHaveAttribute("aria-invalid", "true");
  await dialog.getByRole("button", { name: "닫기", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(discard).toHaveCount(0);

  await applicantTable(page)
    .getByRole("button", { name: "전이든 지원서 상세 보기", exact: true })
    .click();
  const closed = page.getByRole("dialog", {
    name: "전이든 지원서",
    exact: true,
  });
  await expect(
    closed.getByRole("combobox", { name: "진행 단계", exact: true }),
  ).toBeDisabled();
  await closed
    .getByRole("textbox", { name: "검토 메모", exact: true })
    .fill("마감 후 보관 메모");
  await closed
    .getByRole("button", { name: "검토 내용 저장", exact: true })
    .click();
  await expect(closed.getByRole("status")).toHaveText(
    "검토 내용이 이 화면에 저장되었습니다.",
  );
  await closed.getByRole("button", { name: "닫기", exact: true }).click();
  const row = applicantTable(page)
    .getByRole("row")
    .filter({ hasText: "APP-004" });
  await expect(
    row.getByRole("cell", { name: "마감", exact: true }),
  ).toBeVisible();
  await row.getByRole("checkbox").check();
  await page.getByRole("button", { name: "검토 시작", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: /^0건 성공 · 1건 실패$/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("status").filter({ hasText: "처리하지 못한 지원서" }),
  ).toContainText("이미 마감된 지원서입니다.");
  await expect(
    row.getByRole("cell", { name: "마감", exact: true }),
  ).toBeVisible();
});

for (const kind of ["employees", "auditions"] as const) {
  for (const width of [1440, 320]) {
    test(`${kind} product fits ${width}px and supports its detail panel${width === 1440 ? " with WCAG checks" : ""}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/#/examples/${kind}`);
      await expect(
        page.getByRole("heading", {
          level: 1,
          name: kind === "employees" ? "조직·구성원" : "지원서 검토",
          exact: true,
        }),
      ).toBeVisible();
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        )
        .toBe(true);
      if (testInfo.project.name === "chromium") {
        if (width === 1440) {
          await page.screenshot({
            path: `artifacts/groupware-${kind}-desktop.png`,
            fullPage: true,
          });
        } else if (kind === "employees") {
          await page.screenshot({
            path: "artifacts/groupware-mobile.png",
            fullPage: true,
          });
        }
      }
      if (width === 1440) {
        const audit = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        expect(audit.violations).toEqual([]);
      }
      const table =
        kind === "employees" ? employeeTable(page) : applicantTable(page);
      const name =
        kind === "employees"
          ? "서지안 직원 상세 보기"
          : "노해린 지원서 상세 보기";
      await table.getByRole("button", { name, exact: true }).click();
      const dialog = page.getByRole("dialog", {
        name: kind === "employees" ? "서지안 직원 정보" : "노해린 지원서",
        exact: true,
      });
      await expect(dialog).toBeVisible();
      await expect
        .poll(() =>
          dialog.evaluate((element) => {
            const rect = element.getBoundingClientRect();
            return (
              rect.left >= -1 &&
              rect.right <= innerWidth + 1 &&
              element.scrollWidth <= element.clientWidth + 1
            );
          }),
        )
        .toBe(true);
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        )
        .toBe(true);
      await dialog.getByRole("button", { name: "닫기", exact: true }).click();
      await expect(dialog).toHaveCount(0);
      await expect(
        table.getByRole("button", { name, exact: true }),
      ).toBeFocused();
    });
  }
}
