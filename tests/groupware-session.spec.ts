import { expect, test, type Page } from "@playwright/test";

const runtimeErrors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  runtimeErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
});
test.afterEach(async ({ page }) => {
  expect(runtimeErrors.get(page), "uncaught page errors").toEqual([]);
});

const summary = (page: Page) =>
  page.getByRole("textbox", { name: "이번 기간의 업무와 기여", exact: true });
const nav = (page: Page, name: string) =>
  page
    .getByRole("navigation", { name: "CHEESE WORKS 메뉴", exact: true })
    .getByRole("link", { name, exact: true });
const stat = (page: Page, name: string) =>
  page
    .locator(".cheese-stat-card")
    .filter({ has: page.getByText(name, { exact: true }) });
const notifications = (page: Page) =>
  page.getByRole("dialog", { name: "알림", exact: true });
async function openDraft(page: Page) {
  await page.goto("/#/examples/evaluation");
  await page
    .getByRole("button", { name: "작성 이어가기", exact: true })
    .click();
}

test("home starts honestly and tracks persisted draft, submission and timestamp", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-10-02T00:15:00Z"));
  await page.goto("/#/examples");
  await expect(stat(page, "자기평가")).toContainText("시작 전");
  await expect(
    page.getByRole("link", { name: /2026 하반기 자기평가 작성/ }),
  ).not.toContainText("임시저장한");
  await nav(page, "인사평가").click();
  await page
    .getByRole("button", { name: "작성 이어가기", exact: true })
    .click();
  await summary(page).fill("제출 후에도 보존할 업무 기록");
  await page.getByRole("button", { name: "임시저장", exact: true }).click();
  await nav(page, "업무 홈").click();
  await expect(stat(page, "자기평가")).toContainText("작성 중");
  await expect(
    page.getByRole("link", { name: /2026 하반기 자기평가 작성/ }),
  ).toContainText("임시저장한");
  await nav(page, "인사평가").click();
  await page
    .getByRole("button", { name: "작성 이어가기", exact: true })
    .click();
  await page.getByRole("button", { name: "제출 전 검토", exact: true }).click();
  await page
    .getByRole("button", { name: "자기평가 제출", exact: true })
    .click();
  const receipt =
    "자기평가가 2026년 10월 2일 09:15에 제출되었습니다. (한국 시간)";
  await expect(page.getByText(receipt, { exact: true })).toBeVisible();
  await page.clock.setFixedTime(new Date("2026-10-03T02:00:00Z"));
  await page.reload();
  await page
    .getByRole("button", { name: "제출 내용 보기", exact: true })
    .click();
  await expect(page.getByText(receipt, { exact: true })).toBeVisible();
  await expect(
    page.getByText("제출 후에도 보존할 업무 기록", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "내용 수정", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "자기평가 제출", exact: true }),
  ).toHaveCount(0);
  await nav(page, "업무 홈").click();
  await expect(stat(page, "자기평가")).toContainText("제출 완료");
  await expect(stat(page, "내 할 일")).toContainText("2건");
  await expect(
    page.getByRole("link", { name: /2026 하반기 자기평가 작성/ }),
  ).toHaveCount(0);
});

test("notification reads survive navigation/reload and synchronize home", async ({
  page,
}) => {
  await page.goto("/#/examples");
  await expect(stat(page, "확인 필요한 알림")).toContainText("2건");
  await page.getByRole("button", { name: "알림함 열기", exact: true }).click();
  await notifications(page)
    .getByRole("button", {
      name: "자기평가 제출 D-14 읽음으로 표시",
      exact: true,
    })
    .click();
  await expect(
    notifications(page).getByRole("status", { name: "읽지 않은 알림 1개" }),
  ).toHaveText("1");
  await page.keyboard.press("Escape");
  await expect(stat(page, "확인 필요한 알림")).toContainText("1건");
  await page.getByRole("button", { name: "알림함 열기", exact: true }).click();
  await notifications(page)
    .getByRole("button", { name: "모두 읽음", exact: true })
    .click();
  await notifications(page)
    .getByRole("link", { name: "신규 입사자 3명", exact: true })
    .click();
  await expect(page).toHaveURL(/#\/examples\/employees$/);
  await page.reload();
  await page.getByRole("button", { name: "알림함 열기", exact: true }).click();
  await expect(
    notifications(page).getByRole("status", { name: "읽지 않은 알림 0개" }),
  ).toHaveText("0");
  await notifications(page)
    .getByRole("link", { name: "오디션 자료 확인 필요", exact: true })
    .click();
  await expect(page).toHaveURL(/#\/examples\/auditions$/);
  await nav(page, "업무 홈").click();
  await expect(stat(page, "확인 필요한 알림")).toContainText("0건");
});

test("notification navigation retains dirty-form confirmation and keyboard focus", async ({
  page,
}) => {
  await openDraft(page);
  await summary(page).fill("알림으로 이동해도 사라지지 않는 기록");
  await page.getByRole("button", { name: "알림함 열기", exact: true }).click();
  await notifications(page)
    .getByRole("link", { name: "신규 입사자 3명", exact: true })
    .click();
  const confirmation = page.getByRole("alertdialog", {
    name: "작성 중인 내용을 저장할까요?",
    exact: true,
  });
  await expect(confirmation).toBeVisible();
  await expect(page).toHaveURL(/#\/examples\/evaluation$/);
  await confirmation
    .getByRole("button", { name: "계속 작성", exact: true })
    .click();
  await expect(summary(page)).toHaveValue(
    "알림으로 이동해도 사라지지 않는 기록",
  );
  await expect(
    page.getByRole("button", { name: "알림함 열기", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "알림함 열기", exact: true }).click();
  await notifications(page)
    .getByRole("link", { name: "신규 입사자 3명", exact: true })
    .click();
  await confirmation
    .getByRole("button", { name: "저장 후 이동", exact: true })
    .click();
  await expect(page).toHaveURL(/#\/examples\/employees$/);
  await nav(page, "인사평가").click();
  await page
    .getByRole("button", { name: "작성 이어가기", exact: true })
    .click();
  await expect(summary(page)).toHaveValue(
    "알림으로 이동해도 사라지지 않는 기록",
  );
});

test("same-route notification does not discard changes or disable later guards", async ({
  page,
}) => {
  await openDraft(page);
  await summary(page).fill("현재 화면 알림을 열어도 유지할 내용");
  await page.getByRole("button", { name: "알림함 열기", exact: true }).click();
  await notifications(page)
    .getByRole("link", { name: "자기평가 제출 D-14", exact: true })
    .click();
  await expect(notifications(page)).toHaveCount(0);
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  await expect(summary(page)).toHaveValue(
    "현재 화면 알림을 열어도 유지할 내용",
  );
  await nav(page, "업무 홈").click();
  await expect(
    page.getByRole("alertdialog", {
      name: "작성 중인 내용을 저장할까요?",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page).toHaveURL(/#\/examples\/evaluation$/);
});

test("evaluation moves focus to each new heading and first invalid field", async ({
  page,
}) => {
  await openDraft(page);
  await expect(
    page.getByRole("heading", { name: "자기평가 작성", exact: true }),
  ).toBeFocused();
  await page.getByRole("textbox", { name: "제목", exact: true }).fill("");
  await page.getByRole("button", { name: "제출 전 검토", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "제목", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("textbox", { name: "제목", exact: true })
    .fill("평가 기록");
  await page.getByRole("button", { name: "제출 전 검토", exact: true }).click();
  await expect(summary(page)).toBeFocused();
  await summary(page).fill("키보드로 기록한 업무 내용");
  await page.getByRole("button", { name: "제출 전 검토", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "제출 전 확인", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "내용 수정", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "자기평가 작성", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "제출 전 검토", exact: true }).click();
  await page
    .getByRole("button", { name: "자기평가 제출", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "제출한 자기평가", exact: true }),
  ).toBeFocused();
});

test.describe("touch-sized groupware workflow", () => {
  test.use({ hasTouch: true });
  test("mobile menu, validation, submission and notification drawer fit at 320px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 760 });
    await page.goto("/#/examples");
    await page
      .getByRole("button", { name: "CHEESE WORKS 메뉴 열기", exact: true })
      .tap();
    await page
      .getByRole("dialog", { name: "CHEESE WORKS 메뉴", exact: true })
      .getByRole("link", { name: "인사평가", exact: true })
      .tap();
    await page
      .getByRole("button", { name: "작성 이어가기", exact: true })
      .tap();
    await page.getByRole("button", { name: "제출 전 검토", exact: true }).tap();
    await expect(summary(page)).toHaveAttribute("aria-invalid", "true");
    await summary(page).fill("작은 화면에서 작성한 평가");
    await page.getByRole("button", { name: "제출 전 검토", exact: true }).tap();
    await page
      .getByRole("button", { name: "자기평가 제출", exact: true })
      .tap();
    await expect(
      page.getByRole("heading", { name: "제출한 자기평가", exact: true }),
    ).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    await page.getByRole("button", { name: "알림함 열기", exact: true }).tap();
    await expect(notifications(page)).toBeVisible();
    const bounds = await notifications(page).boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
    await notifications(page)
      .getByRole("button", { name: "모두 읽음", exact: true })
      .tap();
    await expect(
      notifications(page).getByRole("status", { name: "읽지 않은 알림 0개" }),
    ).toHaveText("0");
  });
});

test("storage failures never report submission or read-all success", async ({
  page,
}) => {
  await openDraft(page);
  await summary(page).fill("저장 실패에도 보존할 입력");
  await page.getByRole("button", { name: "제출 전 검토", exact: true }).click();
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage blocked", "QuotaExceededError");
    };
  });
  await page
    .getByRole("button", { name: "자기평가 제출", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "제출 전 확인", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "저장하지 못했습니다. 입력한 내용은 유지됩니다. 다시 시도해 주세요.",
      { exact: true },
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "내용 수정", exact: true }).click();
  await expect(summary(page)).toHaveValue("저장 실패에도 보존할 입력");
  await page.getByRole("button", { name: "알림함 열기", exact: true }).click();
  await notifications(page)
    .getByRole("button", { name: "모두 읽음", exact: true })
    .click();
  await expect(notifications(page).getByRole("alert")).toContainText(
    "알림을 읽음으로 변경하지 못했습니다",
  );
  await expect(
    notifications(page).getByRole("status", { name: "읽지 않은 알림 2개" }),
  ).toHaveText("2");
});

test("legacy drafts remain editable and malformed stored values do not crash home", async ({
  page,
}) => {
  await page.goto("/#/examples");
  await page.evaluate(() =>
    sessionStorage.setItem(
      "cheese-example-evaluation-draft",
      JSON.stringify({
        title: "이전 초안",
        summary: "기존 내용",
        focus: "growth",
      }),
    ),
  );
  await page.reload();
  await nav(page, "인사평가").click();
  await page
    .getByRole("button", { name: "작성 이어가기", exact: true })
    .click();
  await expect(summary(page)).toHaveValue("기존 내용");
  await page.evaluate(() => {
    sessionStorage.setItem("cheese-example-evaluation-draft", "invalid json");
    sessionStorage.setItem(
      "cheese-example-notifications-read",
      JSON.stringify({ unexpected: true }),
    );
  });
  await page.goto("/#/examples");
  await page.reload();
  await expect(stat(page, "자기평가")).toContainText("시작 전");
  await expect(stat(page, "확인 필요한 알림")).toContainText("2건");
});
