import { expect, test, type Page } from "@playwright/test";
import { compositeEntries } from "../site/composition-catalog";

const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const captured: string[] = [];
  errors.set(page, captured);
  page.on("pageerror", (error) => captured.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
});
test.afterEach(async ({ page }) => {
  expect(errors.get(page), "uncaught runtime errors").toEqual([]);
});

const components = [
  ["navigation-list", "NavigationList", ".cheese-workspace-navigation"],
  ["user-identity", "UserIdentity", ".cheese-user-identity"],
  ["section-header", "SectionHeader", ".cheese-section-header"],
  ["stat-card", "StatCard", ".cheese-stat-card"],
  ["stat-group", "StatGroup", ".cheese-stat-group"],
  ["record-collection", "RecordCollection", ".cheese-record-collection"],
] as const;

async function expectNoOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
}

test("composition catalog exposes every public entry and the six new live previews", async ({
  page,
}) => {
  await page.goto("/#/business-patterns");
  const catalog = page.locator(".composition-catalog");
  const links = catalog.locator(".composition-entry-main");
  await expect(links).toHaveCount(compositeEntries.length);
  expect(compositeEntries).toHaveLength(35);
  expect(
    await links.evaluateAll((items) =>
      items.map((item) => item.getAttribute("href")),
    ),
  ).toEqual(compositeEntries.map((entry) => `#/business-patterns/${entry.id}`));

  const search = catalog.getByRole("searchbox", {
    name: "패턴 검색",
  });
  await search.fill("RecordCollection");
  await expect(links).toHaveCount(1);
  await expect(links).toHaveAttribute(
    "href",
    "#/business-patterns/record-collection",
  );
  await search.fill("no-matching-composite");
  await expect(links).toHaveCount(0);
  await expect(catalog.getByText(/일치하는 항목이 없습니다/)).toBeVisible();
  await search.clear();
  await expect(links).toHaveCount(35);

  for (const [id, component, selector] of components) {
    await page.goto(`/#/business-patterns/${id}`);
    const preview = page.getByRole("region", {
      name: `${component} 미리보기`,
      exact: true,
    });
    await expect(preview).toBeVisible();
    await expect(preview.locator(selector).first()).toBeVisible();
    await expect(
      page.getByRole("region", {
        name: `${component} 구성과 책임`,
        exact: true,
      }),
    ).toBeVisible();
  }
});

test("Vue composition examples use the six public components and caller-owned state", async ({
  page,
}) => {
  await page.goto("/vue.html?demo=composition");
  for (const [, component, selector] of components) {
    const preview = page.getByRole("region", {
      name: `Vue ${component}`,
      exact: true,
    });
    await expect(preview.locator(selector).first()).toBeVisible();
  }
  const navigation = page.getByRole("region", {
    name: "Vue NavigationList",
    exact: true,
  });
  const requests = navigation.getByRole("button", {
    name: "요청 목록",
    exact: true,
  });
  await requests.click();
  await expect(requests).toHaveAttribute("aria-current", "page");
  await expect(navigation.getByRole("status")).toHaveText(
    "선택한 메뉴: 요청 목록",
  );
  await expect(
    navigation.getByRole("button", { name: "관리 설정", exact: true }),
  ).toBeDisabled();

  const header = page.getByRole("region", {
    name: "Vue SectionHeader",
    exact: true,
  });
  await expect(
    header.getByRole("heading", { level: 3, name: "진행 중인 업무" }),
  ).toBeVisible();
  await header
    .getByRole("button", { name: "설명 숨기기", exact: true })
    .click();
  await expect(
    header.getByText("담당자와 처리 상태를 함께 확인하세요.", { exact: true }),
  ).toHaveCount(0);
  await header.getByRole("button", { name: "설명 보기", exact: true }).click();
  await expect(
    header.getByText("담당자와 처리 상태를 함께 확인하세요.", { exact: true }),
  ).toBeVisible();

  const collection = page.getByRole("region", {
    name: "Vue RecordCollection",
    exact: true,
  });
  await collection
    .getByRole("checkbox", {
      name: "회의 자료 정리 REQ-001 행 선택",
      exact: true,
    })
    .check();
  await collection
    .getByRole("button", { name: "선택 업무 완료", exact: true })
    .click();
  await expect(
    collection.getByText("1건 성공 · 0건 실패", { exact: true }),
  ).toBeVisible();
  await expect(
    collection.getByRole("checkbox", {
      name: "회의 자료 정리 REQ-001 행 선택",
      exact: true,
    }),
  ).toBeDisabled();
  await expect(
    page
      .getByRole("region", { name: "Vue StatCard", exact: true })
      .locator(".cheese-stat-value"),
  ).toHaveText("3건");
});

for (const framework of ["react", "vue"] as const) {
  test(`${framework} collection documentation resets pages and explicitly clears hidden selection`, async ({
    page,
  }) => {
    await page.goto(
      framework === "react"
        ? "/#/business-patterns/record-collection"
        : "/vue.html?demo=composition",
    );
    const preview = page.getByRole("region", {
      name:
        framework === "react"
          ? "RecordCollection 미리보기"
          : "Vue RecordCollection",
      exact: true,
    });
    const collection = preview.locator(".cheese-record-collection");
    const firstName =
      framework === "react" ? "디자인 가이드" : "회의 자료 정리 REQ-001";
    const lastName =
      framework === "react" ? "릴리스 노트" : "프로젝트 일정 조율 REQ-006";
    const first = collection.getByRole("checkbox", {
      name: `${firstName} 행 선택`,
      exact: true,
    });
    const last = collection.getByRole("checkbox", {
      name: `${lastName} 행 선택`,
      exact: true,
    });
    await expect(collection.getByRole("searchbox")).toHaveCount(1);
    await first.check();
    await collection
      .getByRole("button", { name: "다음 페이지", exact: true })
      .click();
    await last.check();
    await expect(
      collection.getByRole("status").filter({ hasText: /^2건 선택$/ }),
    ).toBeVisible();

    const filter = collection.getByRole("combobox", {
      name: framework === "react" ? "분류" : "업무 상태",
      exact: true,
    });
    await filter.click();
    await page
      .getByRole("option", {
        name: framework === "react" ? "문서" : "대기",
        exact: true,
      })
      .click();
    await expect(
      collection
        .getByRole("status")
        .filter({ hasText: /총 \d+개 · 1 \/ 1페이지/ }),
    ).toHaveText(
      framework === "react" ? "총 2개 · 1 / 1페이지" : "총 4개 · 1 / 1페이지",
    );
    await expect(first).toBeChecked();
    const search = collection.getByRole("searchbox");
    await search.fill(
      framework === "react" ? "디자인 가이드" : "회의 자료 정리",
    );
    await expect(
      collection.getByRole("status").filter({ hasText: /^2건 선택$/ }),
    ).toBeVisible();
    await expect(last).toHaveCount(0);
    await expect(first).toBeChecked();
    await collection
      .getByRole("button", { name: "선택 해제", exact: true })
      .click();
    await expect(first).not.toBeChecked();
    await expect(collection.locator(".cheese-bulk-action-bar")).toHaveCount(0);

    await search.fill("no-matching-record");
    await expect(
      collection.getByText("검색 결과가 없습니다.", { exact: true }),
    ).toBeVisible();
    await collection
      .getByRole("button", { name: "초기화", exact: true })
      .click();
    await expect(search).toHaveValue("");
    await expect(filter).toHaveText(
      framework === "react" ? "전체" : "전체 상태",
    );
    await expect(
      collection.getByRole("status").filter({ hasText: /총 6개/ }),
    ).toHaveText("총 6개 · 1 / 2페이지");
    await collection
      .getByRole("button", { name: "다음 페이지", exact: true })
      .click();
    await expect(last).not.toBeChecked();
  });

  test(`${framework} mobile navigation honors cancellation and restores keyboard focus`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(
      `/tests/fixtures/composition.html?framework=${framework}&case=navigation`,
    );
    const opener = page.getByRole("button", {
      name: "Fixture workspace 열기",
      exact: true,
    });
    await opener.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", {
      name: "Fixture workspace",
      exact: true,
    });
    await expect(dialog).toBeVisible();
    const close = dialog.getByRole("button", {
      name: "Fixture workspace 닫기",
      exact: true,
    });
    await expect(close).toBeFocused();
    await expect(
      dialog.getByRole("list", { name: "Workspace", exact: true }),
    ).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: "Disabled page", exact: true }),
    ).toBeDisabled();

    await page.keyboard.press("Shift+Tab");
    const leave = dialog.getByRole("link", { name: "Leave page", exact: true });
    await expect(leave).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(dialog).toBeVisible();
    await expect(page).not.toHaveURL(/#destination$/);
    await expect(page.getByTestId("navigation-events")).toHaveText("leave:1");
    await expect(
      dialog.getByRole("button", { name: "Current page", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await page.keyboard.press("Tab");
    await expect(close).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(opener).toBeFocused();

    await page
      .getByRole("checkbox", { name: "Cancel navigation", exact: true })
      .uncheck();
    await opener.click();
    await leave.click();
    await expect(page).toHaveURL(/#destination$/);
    await expect(dialog).toHaveCount(0);
    await expect(page.getByTestId("navigation-events")).toHaveText("leave:2");
    await opener.click();
    await expect(leave).toHaveAttribute("aria-current", "page");
    await dialog
      .getByRole("button", { name: "Current page", exact: true })
      .click();
    await expect(page.getByTestId("navigation-events")).toHaveText("current:3");
    await expect(dialog).toHaveCount(0);
    await opener.click();
    await expect(
      dialog.getByRole("button", { name: "Current page", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await close.click();
    await expect(opener).toBeFocused();
    await expectNoOverflow(page);
  });

  test(`${framework} record collection recovers from errors and preserves query and selection`, async ({
    page,
  }) => {
    await page.goto(
      `/tests/fixtures/composition.html?framework=${framework}&case=records`,
    );
    const collection = page.locator(".cheese-record-collection");
    await expect(collection.getByRole("searchbox")).toHaveCount(1);
    await expect(collection.getByRole("alert")).toHaveText(
      "데이터를 불러오지 못했습니다.",
    );
    await collection
      .getByRole("button", { name: "다시 불러오기", exact: true })
      .click();
    await expect(
      collection.getByRole("cell", { name: "120.00 credits", exact: true }),
    ).toBeVisible();
    await expect(page.getByTestId("request-count")).toHaveText("2");
    await expect(
      collection.getByRole("checkbox", { name: "Gamma 행 선택", exact: true }),
    ).toBeDisabled();
    await collection
      .getByRole("checkbox", { name: "Alpha 행 선택", exact: true })
      .check();

    await page
      .getByRole("checkbox", { name: "Fail next request", exact: true })
      .check();
    const search = collection.getByRole("searchbox", {
      name: "Record search",
      exact: true,
    });
    await search.fill("Beta");
    await expect(collection.getByRole("alert")).toBeVisible();
    await expect(search).toHaveValue("Beta");
    await expect(page.getByTestId("selected-records")).toHaveText("alpha");
    await collection
      .getByRole("button", { name: "다시 불러오기", exact: true })
      .click();
    await expect(
      collection.getByRole("checkbox", { name: "Beta 행 선택", exact: true }),
    ).toBeVisible();
    await expect(
      collection.getByRole("checkbox", { name: "Alpha 행 선택", exact: true }),
    ).toHaveCount(0);
    await collection
      .getByRole("checkbox", { name: "Beta 행 선택", exact: true })
      .check();
    await expect(page.getByTestId("selected-records")).toHaveText("alpha,beta");
    await collection
      .getByRole("button", { name: "Apply bulk action", exact: true })
      .click();
    await expect(page.getByTestId("selected-records")).toHaveText("none");
    await expect(
      collection.getByText("2건 성공 · 0건 실패", { exact: true }),
    ).toBeVisible();
    await collection
      .getByRole("button", { name: "Dismiss bulk result", exact: true })
      .click();
    await expect(
      collection.getByText("2건 성공 · 0건 실패", { exact: true }),
    ).toHaveCount(0);

    await search.fill("no-matching-record");
    await expect(
      collection.getByText("검색 결과가 없습니다.", { exact: true }),
    ).toBeVisible();
    await expect(collection.getByRole("alert")).toHaveCount(0);
    await collection
      .getByRole("button", { name: "초기화", exact: true })
      .click();
    await expect(search).toHaveValue("");
    await expect(
      collection.getByRole("checkbox", { name: "Alpha 행 선택", exact: true }),
    ).toBeVisible();
    await expect(
      collection.getByRole("checkbox", { name: "Beta 행 선택", exact: true }),
    ).not.toBeChecked();
  });
}
