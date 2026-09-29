import { expect, test, type Page } from "@playwright/test";

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

async function openDraft(page: Page) {
  await page
    .getByRole("button", { name: "작성 이어가기", exact: true })
    .click();
}

test("employee completes the self-evaluation workflow from overview to submission", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-09-29T02:42:00Z"));
  await page.goto("/#/examples/evaluation");
  await expect(
    page.getByRole("heading", { name: "내 인사평가", exact: true, level: 1 }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "CHEESE WORKS 메뉴", exact: true })
      .getByRole("link", { name: "인사평가", exact: true }),
  ).toHaveAttribute("aria-current", "page");

  await openDraft(page);
  await expect(
    page.getByRole("heading", { name: "자기평가 작성", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "제출 전 검토" }).click();
  const summary = page.getByRole("textbox", {
    name: "이번 기간의 업무와 기여",
  });
  await expect(summary).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("alert")).toContainText("간단히 작성");

  await summary.fill("반복 업무를 공통 컴포넌트와 배포 흐름으로 정리했습니다.");
  await page.getByRole("button", { name: "임시저장" }).click();
  await expect(
    page
      .getByRole("complementary", { name: "CHEESE WORKS 메뉴", exact: true })
      .getByText("이 탭에 임시저장했습니다.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "제출 전 검토" }).click();
  await expect(
    page.getByRole("heading", { name: "제출 전 확인", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "자기평가 제출" }).click();
  await expect(
    page.getByRole("heading", { name: "제출한 자기평가", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "자기평가가 2026년 9월 29일 11:42에 제출되었습니다. (한국 시간)",
    ),
  ).toBeVisible();
});

test("groupware evaluation remains usable on a narrow screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto("/#/examples/evaluation");
  const menu = page.getByRole("button", {
    name: "CHEESE WORKS 메뉴 열기",
    exact: true,
  });
  await expect(menu).toBeVisible();
  await menu.click();
  const navigation = page.getByRole("dialog", {
    name: "CHEESE WORKS 메뉴",
    exact: true,
  });
  await expect(
    navigation.getByRole("link", { name: "인사평가", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await navigation.getByRole("link", { name: "인사평가", exact: true }).click();
  await openDraft(page);
  await expect(
    page.getByRole("heading", { name: "자기평가 작성", exact: true, level: 1 }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
});

test("work home exposes real tasks and opens each groupware module", async ({
  page,
}) => {
  await page.goto("/#/examples");
  await expect(
    page.getByRole("heading", { name: "안녕하세요, 김치즈님." }),
  ).toBeVisible();
  await expect(page.getByRole("main", { name: "업무 홈" })).toContainText(
    "오늘 처리할 업무",
  );
  for (const href of [
    "#/examples/evaluation",
    "#/examples/employees",
    "#/examples/auditions",
  ]) {
    await expect(page.locator(`a[href="${href}"]`)).not.toHaveCount(0);
  }
  await page.getByRole("link", { name: /2026 하반기 자기평가 작성/ }).click();
  await expect(page).toHaveURL(/#\/examples\/evaluation$/);
  await expect(page.locator(".site-sidebar")).toHaveCount(0);
});

test("evaluation draft survives reload", async ({ page }) => {
  await page.goto("/#/examples/evaluation");
  await openDraft(page);
  await page
    .getByRole("textbox", { name: "이번 기간의 업무와 기여" })
    .fill("팀의 반복 업무를 줄인 평가 기록");
  await page.getByRole("button", { name: "임시저장", exact: true }).click();
  await page.reload();
  await openDraft(page);
  await expect(
    page.getByRole("textbox", { name: "이번 기간의 업무와 기여" }),
  ).toHaveValue("팀의 반복 업무를 줄인 평가 기록");
});

test("unsaved evaluation changes are protected when moving to another module", async ({
  page,
}) => {
  await page.goto("/#/examples/evaluation");
  await openDraft(page);
  await page
    .getByRole("textbox", { name: "이번 기간의 업무와 기여", exact: true })
    .fill("이동 전에 저장할 업무 기록");
  await page
    .getByRole("navigation", { name: "CHEESE WORKS 메뉴", exact: true })
    .getByRole("link", { name: "업무 홈", exact: true })
    .click();
  const confirmation = page.getByRole("alertdialog", {
    name: "작성 중인 내용을 저장할까요?",
    exact: true,
  });
  await expect(page).toHaveURL(/#\/examples\/evaluation$/);
  await expect(confirmation).toBeVisible();
  await confirmation
    .getByRole("button", { name: "저장 후 이동", exact: true })
    .click();
  await expect(page).toHaveURL(/#\/examples$/);
  await page
    .getByRole("navigation", { name: "CHEESE WORKS 메뉴", exact: true })
    .getByRole("link", { name: "인사평가", exact: true })
    .click();
  await openDraft(page);
  await expect(
    page.getByRole("textbox", { name: "이번 기간의 업무와 기여", exact: true }),
  ).toHaveValue("이동 전에 저장할 업무 기록");
});
