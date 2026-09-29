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

const draftSummary = (page: Page) =>
  page.getByRole("textbox", {
    name: "이번 기간의 업무와 기여",
    exact: true,
  });

const leaveConfirmation = (page: Page) =>
  page.getByRole("alertdialog", {
    name: "작성 중인 내용을 저장할까요?",
    exact: true,
  });

async function openDraftFromGallery(page: Page) {
  await page.goto("/#/examples");
  await page.getByRole("link", { name: /2026 하반기 자기평가 작성/ }).click();
  await expect(page).toHaveURL(/#\/examples\/evaluation$/);
  await page
    .getByRole("button", { name: "작성 이어가기", exact: true })
    .click();
  await expect(draftSummary(page)).toBeVisible();
}

async function expectWorkHome(page: Page) {
  await expect(page).toHaveURL(/#\/examples$/);
  await expect(
    page.getByRole("heading", {
      name: "안녕하세요, 김치즈님.",
      exact: true,
      level: 1,
    }),
  ).toBeVisible();
}

test("canceling native Back preserves the draft and the original Back/Forward entries", async ({
  page,
}) => {
  await openDraftFromGallery(page);
  const draft = "뒤로 가기를 취소해도 유지할 업무 기록";
  await draftSummary(page).fill(draft);

  await page.goBack();
  const confirmation = leaveConfirmation(page);
  await expect(confirmation).toBeVisible();
  // Restoring a browser history entry is asynchronous. Wait for both the
  // confirmation and the restored address before choosing to keep writing.
  await expect(page).toHaveURL(/#\/examples\/evaluation$/);
  await confirmation
    .getByRole("button", { name: "계속 작성", exact: true })
    .click();
  await expect(confirmation).toHaveCount(0);
  await expect(page).toHaveURL(/#\/examples\/evaluation$/);
  await expect(draftSummary(page)).toHaveValue(draft);

  await page.getByRole("button", { name: "임시저장", exact: true }).click();
  await expect(
    page
      .getByRole("complementary", { name: "CHEESE WORKS 메뉴", exact: true })
      .getByText("이 탭에 임시저장했습니다.", { exact: true }),
  ).toBeVisible();

  await page.goBack();
  await expectWorkHome(page);
  await expect(confirmation).toHaveCount(0);
  await expect(page.getByRole("main")).toBeFocused();

  await page.goForward();
  await expect(page).toHaveURL(/#\/examples\/evaluation$/);
  await page
    .getByRole("button", { name: "작성 이어가기", exact: true })
    .click();
  await expect(draftSummary(page)).toHaveValue(draft);

  await page.goBack();
  await expectWorkHome(page);
  await expect(confirmation).toHaveCount(0);
});

test("direct hash changes restore the dirty route until navigation is confirmed", async ({
  page,
}) => {
  await openDraftFromGallery(page);
  const draft = "주소를 직접 바꾸어도 취소하면 유지할 업무 기록";
  await draftSummary(page).fill(draft);

  await page.evaluate(() => {
    window.location.hash = "#/components/button";
  });
  const confirmation = leaveConfirmation(page);
  await expect(confirmation).toBeVisible();
  await expect(page).toHaveURL(/#\/examples\/evaluation$/);
  await confirmation
    .getByRole("button", { name: "계속 작성", exact: true })
    .click();
  await expect(confirmation).toHaveCount(0);
  await expect(page).toHaveURL(/#\/examples\/evaluation$/);
  await expect(draftSummary(page)).toHaveValue(draft);

  await page.evaluate(() => {
    window.location.hash = "#/components/button";
  });
  await expect(confirmation).toBeVisible();
  await expect(page).toHaveURL(/#\/examples\/evaluation$/);
  await confirmation
    .getByRole("button", { name: "저장하지 않고 이동", exact: true })
    .click();
  await expect(confirmation).toHaveCount(0);
  await expect(page).toHaveURL(/#\/components\/button$/);
  await expect(
    page.getByRole("heading", { name: "Button", exact: true, level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole("main")).toBeFocused();
});

test("ordinary route links retain canceled edits and complete confirmed navigation", async ({
  page,
}) => {
  await openDraftFromGallery(page);
  const draft = "링크 이동을 취소해도 유지할 업무 기록";
  await draftSummary(page).fill(draft);
  const galleryLink = page
    .getByRole("navigation", { name: "CHEESE WORKS 메뉴", exact: true })
    .getByRole("link", { name: "업무 홈", exact: true });

  await galleryLink.click();
  const confirmation = leaveConfirmation(page);
  await expect(confirmation).toBeVisible();
  await expect(page).toHaveURL(/#\/examples\/evaluation$/);
  await confirmation
    .getByRole("button", { name: "계속 작성", exact: true })
    .click();
  await expect(confirmation).toHaveCount(0);
  await expect(page).toHaveURL(/#\/examples\/evaluation$/);
  await expect(draftSummary(page)).toHaveValue(draft);

  await galleryLink.click();
  await expect(confirmation).toBeVisible();
  await confirmation
    .getByRole("button", { name: "저장하지 않고 이동", exact: true })
    .click();
  await expectWorkHome(page);
  await expect(confirmation).toHaveCount(0);
  await expect(page.getByRole("main")).toBeFocused();
});

test("the initial native-select alias renders the Select Form documentation", async ({
  page,
}) => {
  await page.goto("/#/components/native-select");
  await expect(
    page.getByRole("heading", { name: "Select Form", exact: true, level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole("main")).toContainText(
    "디자인된 선택창을 실제 폼 제출과 연결합니다.",
  );
});

test("canceling Back to a preexisting history entry restores the dirty address and draft", async ({
  page,
}) => {
  await page.goto("/#/examples/evaluation");
  await expect(page).toHaveURL(/#\/examples\/evaluation$/);
  await page
    .getByRole("button", { name: "작성 이어가기", exact: true })
    .click();
  await expect(draftSummary(page)).toBeVisible();
  await page.evaluate(() => {
    // Seed an unstamped predecessor after navigation has committed. Seeding in
    // addInitScript can be replaced by Firefox's initial navigation. Keep the
    // app's current opaque state, without firing a route change during setup.
    const currentState = window.history.state;
    window.history.replaceState(null, "", "#/examples");
    window.history.pushState(currentState, "", "#/examples/evaluation");
  });
  const draft = "앱 실행 전 방문 기록으로 이동해도 유지할 업무 기록";
  await draftSummary(page).fill(draft);

  await page.goBack();
  const confirmation = leaveConfirmation(page);
  await expect(confirmation).toBeVisible();
  await expect(page).toHaveURL(/#\/examples\/evaluation$/);
  await confirmation
    .getByRole("button", { name: "계속 작성", exact: true })
    .click();
  await expect(confirmation).toHaveCount(0);
  await expect(page).toHaveURL(/#\/examples\/evaluation$/);
  await expect(draftSummary(page)).toHaveValue(draft);
});
