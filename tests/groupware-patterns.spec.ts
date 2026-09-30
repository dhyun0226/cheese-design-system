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

const patterns = [
  ["app-shell", "App shell"],
  ["people-picker", "People picker"],
  ["filter-bar", "Filter bar"],
  ["bulk-action-bar", "Bulk action bar"],
  ["description-list", "Description list"],
  ["activity-timeline", "Activity timeline"],
  ["save-status", "Save status"],
] as const;
type Framework = "react" | "vue";
type PatternId = (typeof patterns)[number][0];
const patternCategories: Record<PatternId, string> = {
  "app-shell": "레이아웃·탐색",
  "people-picker": "선택·권한",
  "filter-bar": "데이터·목록",
  "bulk-action-bar": "데이터·목록",
  "description-list": "데이터·목록",
  "activity-timeline": "협업",
  "save-status": "상태",
};

async function openPattern(page: Page, framework: Framework, id: PatternId) {
  if (framework === "react") {
    await page.goto(`/#/business-patterns/${id}`);
    return page.getByRole("region", { name: "미리보기", exact: true });
  }
  await page.goto("/vue.html?demo=patterns");
  const name = patterns.find(([pattern]) => pattern === id)![1];
  return id === "app-shell"
    ? page.getByRole("region", { name, exact: true })
    : page.getByRole("article", { name: `Vue ${name}`, exact: true });
}

async function choose(page: Page, select: Locator, name: string) {
  await select.click();
  await page.getByRole("option", { name, exact: true }).click();
}

async function noPageOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
}

test("unified composition catalog exposes 35 components, pattern navigation and service boundaries", async ({
  page,
}) => {
  await page.goto("/#/business-patterns");
  const sidebar = page.getByRole("complementary", { name: "문서 사이드바" });
  const catalog = page.locator(".composition-catalog");
  await expect(
    catalog.getByRole("heading", {
      name: "패턴과 템플릿",
      exact: true,
      level: 1,
    }),
  ).toBeVisible();
  await expect(catalog.getByRole("status")).toHaveText("35개 항목");
  await expect(catalog.locator("article.composition-entry")).toHaveCount(35);
  await expect(catalog.locator("a.composition-entry-main")).toHaveCount(35);

  for (const [id, name] of patterns) {
    const link = sidebar.getByRole("link", { name, exact: true });
    if (!(await link.isVisible()))
      await sidebar
        .getByRole("button", { name: patternCategories[id], exact: true })
        .click();
    await expect(link).toHaveAttribute("href", `#/business-patterns/${id}`);
    await link.click();
    await expect(page).toHaveURL(new RegExp(`#/business-patterns/${id}$`));
    await expect(
      page.getByRole("heading", { name, exact: true, level: 1 }),
    ).toBeVisible();
    await expect(link).toHaveAttribute("aria-current", "page");
    await expect(
      page.getByRole("region", { name: "미리보기", exact: true }),
    ).toBeVisible();
  }

  await sidebar.locator('a[href="#/business-patterns"]').click();
  const products = catalog.locator("footer");
  await expect(
    products.getByRole("heading", {
      name: "제품의 책임은 분리합니다",
      exact: true,
    }),
  ).toBeVisible();
  await expect(products.locator('a[href^="#/examples"]')).toHaveCount(0);
  await page.goto("/#/business-patterns/people-picker");
  await page
    .getByRole("main")
    .getByRole("link", { name: "Vue 예제", exact: true })
    .click();
  await expect(page).toHaveURL(/\/vue.html\?demo=patterns$/);
  await expect(
    page.getByRole("heading", { name: "People picker", exact: true }),
  ).toBeVisible();
});

for (const framework of ["react", "vue"] as const) {
  test(`${framework} shell navigation changes content and active menu locally`, async ({
    page,
  }) => {
    const demo = await openPattern(page, framework, "app-shell");
    const url = page.url();
    const navigation = demo.getByRole("navigation", {
      name: "앱 구조 미리보기 탐색",
      exact: true,
    });
    const overview = navigation.getByRole("button", {
      name: "요약",
      exact: true,
    });
    const library = navigation.getByRole("button", {
      name: "자료",
      exact: true,
    });
    await expect(overview).toHaveAttribute("aria-current", "page");
    await expect(
      demo.getByRole("heading", { name: "요약", exact: true, level: 3 }),
    ).toBeVisible();
    await library.click();
    await expect(library).toHaveAttribute("aria-current", "page");
    await expect(overview).not.toHaveAttribute("aria-current", "page");
    await expect(
      demo.getByRole("heading", { name: "자료", exact: true, level: 3 }),
    ).toBeVisible();
    await expect(demo.getByText("library", { exact: true })).toBeVisible();
    await overview.click();
    await expect(overview).toHaveAttribute("aria-current", "page");
    await expect(
      demo.getByRole("heading", { name: "요약", exact: true, level: 3 }),
    ).toBeVisible();
    await expect(demo.getByText("library", { exact: true })).toHaveCount(0);
    await expect(page).toHaveURL(url);
  });

  test(`${framework} people picker stages changes, cancels, searches organizations and applies selection`, async ({
    page,
  }) => {
    const demo = await openPattern(page, framework, "people-picker");
    const trigger = demo.getByRole("button", {
      name: /^리뷰에 참여할 구성원 선택/,
    });
    const applied = demo
      .getByRole("status")
      .filter({ hasText: "적용된 구성원" });
    await expect(applied).toContainText("김민서");
    await trigger.click();
    const dialog = page.getByRole("dialog", {
      name: "리뷰에 참여할 구성원 선택",
      exact: true,
    });
    const search = dialog.getByRole("searchbox", {
      name: "사람 검색",
      exact: true,
    });
    await expect(search).toBeFocused();
    await dialog
      .getByRole("checkbox", {
        name: "박지훈 · CHEESE Studio / 제품팀",
        exact: true,
      })
      .check();
    await expect(
      dialog.getByRole("status").filter({ hasText: /^\s*2명 선택\s*$/ }),
    ).toBeVisible();
    await dialog.getByRole("button", { name: "취소", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(applied).toContainText("김민서");
    await expect(applied).not.toContainText("박지훈");

    await trigger.click();
    await expect(
      dialog.getByRole("checkbox", { name: /^박지훈 ·/ }),
    ).not.toBeChecked();
    await dialog
      .getByRole("treeitem", { name: "디자인팀", exact: true })
      .click();
    const results = dialog.getByRole("region", {
      name: "사람 검색 결과",
      exact: true,
    });
    await expect(results.getByRole("checkbox")).toHaveCount(2);
    await expect(
      results.getByRole("checkbox", { name: /^박지훈 ·/ }),
    ).toHaveCount(0);
    await search.fill("브랜드");
    await expect(results.getByRole("checkbox")).toHaveCount(1);
    await results
      .getByRole("checkbox", {
        name: "정윤아 · CHEESE Studio / 디자인팀",
        exact: true,
      })
      .check();
    await search.fill("검색결과없음");
    await expect(results.getByRole("checkbox")).toHaveCount(0);
    await expect(
      results.getByText("검색 결과가 없습니다", { exact: true }),
    ).toBeVisible();
    await dialog
      .getByRole("button", { name: "선택 적용", exact: true })
      .click();
    await expect(applied).toContainText("김민서, 정윤아");
    await expect(trigger).toContainText("2명");

    await trigger.click();
    await dialog.getByRole("checkbox", { name: /^김민서 ·/ }).uncheck();
    await page.keyboard.press("Escape");
    await expect(applied).toContainText("김민서, 정윤아");
    await demo
      .getByRole("button", {
        name: "정윤아 · CHEESE Studio / 디자인팀 선택 해제",
        exact: true,
      })
      .click();
    await expect(applied).toContainText("김민서");
    await expect(applied).not.toContainText("정윤아");
  });

  test(`${framework} filters synchronize results, removable chips and reset`, async ({
    page,
  }) => {
    const demo = await openPattern(page, framework, "filter-bar");
    const filter = demo.getByRole("region", { name: /구성원 검색 조건$/ });
    const searchLabel =
      framework === "vue" ? "Vue 구성원 이름 검색" : "구성원 이름 검색";
    const search = filter.getByRole("searchbox", {
      name: searchLabel,
      exact: true,
    });
    const organization = filter.getByRole("combobox", {
      name: "소속 조직",
      exact: true,
    });
    const chips = filter.getByRole("list", {
      name: "적용된 필터",
      exact: true,
    });
    const reset = filter.getByRole("button", { name: "초기화", exact: true });
    await expect(filter.getByRole("status")).toHaveText("검색 결과 4건");
    await expect(reset).toBeDisabled();
    await choose(page, organization, "디자인팀");
    await expect(filter.getByRole("status")).toHaveText("검색 결과 2건");
    await search.fill("김민서");
    await expect(filter.getByRole("status")).toHaveText("검색 결과 1건");
    await expect(chips.getByRole("listitem")).toHaveCount(2);
    await filter
      .getByRole("button", { name: `${searchLabel} 필터 해제`, exact: true })
      .click();
    await expect(search).toHaveValue("");
    await expect(filter.getByRole("status")).toHaveText("검색 결과 2건");
    await expect(chips.getByRole("listitem")).toHaveCount(1);
    await search.fill("검색결과없음");
    await expect(filter.getByRole("status")).toHaveText("검색 결과 0건");
    await expect(
      demo
        .getByRole("status")
        .filter({ hasText: "일치하는 구성원이 없습니다." }),
    ).toBeVisible();
    await reset.click();
    await expect(search).toHaveValue("");
    await expect(organization).toHaveText("전체 조직");
    await expect(chips.getByRole("listitem")).toHaveCount(0);
    await expect(filter.getByRole("status")).toHaveText("검색 결과 4건");
    await expect(reset).toBeDisabled();
  });

  test(`${framework} bulk action keeps only failed people selected and retries them`, async ({
    page,
  }) => {
    const demo = await openPattern(page, framework, "bulk-action-bar");
    const send = demo.getByRole("button", {
      name: "평가 안내 보내기",
      exact: true,
    });
    await expect(
      demo.getByRole("status").filter({ hasText: /^3건 선택$/ }),
    ).toBeVisible();
    await send.click();
    await expect(send).toBeDisabled();
    await expect(
      demo.getByRole("status").filter({ hasText: "2건 성공 · 1건 실패" }),
    ).toBeVisible();
    for (const name of ["김민서", "박지훈"]) {
      const person = demo.getByRole("checkbox", { name, exact: true });
      await expect(person).not.toBeChecked();
      await expect(person).toBeDisabled();
    }
    await expect(
      demo.getByRole("checkbox", { name: "이수진", exact: true }),
    ).toBeChecked();
    await expect(
      demo.getByRole("status").filter({ hasText: /^1건 선택$/ }),
    ).toBeVisible();
    await demo
      .getByRole("button", { name: "실패 항목 다시 시도", exact: true })
      .click();
    await expect(
      demo.getByRole("status").filter({ hasText: "1건 성공 · 0건 실패" }),
    ).toBeVisible();
    await expect(
      demo.getByRole("checkbox", { name: "이수진", exact: true }),
    ).not.toBeChecked();
    await expect(
      demo.getByRole("checkbox", { name: "이수진", exact: true }),
    ).toBeDisabled();
    await expect(send).toBeDisabled();
    await expect(
      demo.getByRole("button", { name: "실패 항목 다시 시도", exact: true }),
    ).toHaveCount(0);
    await demo
      .getByRole("button", { name: "발송 예제 다시 시작", exact: true })
      .click();
    await demo.getByRole("button", { name: "선택 해제", exact: true }).click();
    await expect(send).toHaveCount(0);
    await demo.getByRole("checkbox", { name: "김민서", exact: true }).check();
    await expect(send).toBeEnabled();
  });

  test(`${framework} save status rejects empty titles and preserves edits across failure and retry`, async ({
    page,
  }) => {
    const demo = await openPattern(page, framework, "save-status");
    const title = demo.getByRole("textbox", {
      name: framework === "vue" ? "Vue 평가 제목" : "평가 제목",
      exact: true,
    });
    const save = demo.getByRole("button", { name: "저장", exact: true });
    await title.fill("   ");
    await expect(save).toBeDisabled();
    await title.fill("검토할 팀의 성장 기록");
    await expect(demo.getByRole("status")).toContainText(
      "저장하지 않은 변경 사항",
    );
    await demo
      .getByRole("checkbox", { name: "다음 저장 실패 재현", exact: true })
      .check();
    await save.click();
    await expect(title).toBeDisabled();
    await expect(demo.getByRole("status")).toContainText("저장에 실패했습니다");
    await expect(title).toHaveValue("검토할 팀의 성장 기록");
    await demo.getByRole("button", { name: "다시 시도", exact: true }).click();
    await expect(demo.getByRole("status")).toHaveText("저장됨");
    await expect(title).toBeEnabled();
    await expect(title).toHaveValue("검토할 팀의 성장 기록");
    await title.fill("저장 후 추가한 기록");
    await expect(demo.getByRole("status")).toHaveText(
      "저장하지 않은 변경 사항",
    );
  });

  test(`${framework} details expand and timeline progresses through recovery to completion`, async ({
    page,
  }) => {
    const details = await openPattern(page, framework, "description-list");
    await expect(
      details.getByText("minseo@example.com", { exact: true }),
    ).toHaveCount(0);
    await details.getByRole("button", { name: /^상세 정보/ }).click();
    await expect(
      details.getByText("minseo@example.com", { exact: true }),
    ).toBeVisible();
    await details.getByRole("button", { name: /^기본 정보/ }).click();
    await expect(
      details.getByText("minseo@example.com", { exact: true }),
    ).toHaveCount(0);

    const demo = await openPattern(page, framework, "activity-timeline");
    const timeline = demo.getByRole("region", { name: /지원자 진행 이력$/ });
    const review = timeline
      .getByRole("listitem")
      .filter({ hasText: "서류 검토" });
    await expect(review).toHaveAttribute("aria-current", "step");
    await demo.getByRole("button", { name: /^오류 상태/ }).click();
    await expect(review).toContainText("실패");
    await demo.getByRole("button", { name: "문제 해결", exact: true }).click();
    await expect(review).toHaveAttribute("aria-current", "step");
    await demo
      .getByRole("button", { name: "현재 단계 완료", exact: true })
      .click();
    await expect(
      timeline.getByRole("listitem").filter({ hasText: "인터뷰 안내" }),
    ).toHaveAttribute("aria-current", "step");
    await demo
      .getByRole("button", { name: "현재 단계 완료", exact: true })
      .click();
    await expect(demo.getByRole("status")).toHaveText(
      "모든 단계가 완료되었습니다.",
    );
    await expect(
      demo.getByRole("button", { name: "현재 단계 완료", exact: true }),
    ).toBeDisabled();
  });

  test(`${framework} open people picker meets WCAG checks`, async ({
    page,
  }, testInfo) => {
    const demo = await openPattern(page, framework, "people-picker");
    await demo
      .getByRole("button", { name: /^리뷰에 참여할 구성원 선택/ })
      .click();
    const dialog = page.getByRole("dialog", {
      name: "리뷰에 참여할 구성원 선택",
      exact: true,
    });
    await expect(dialog).toBeVisible();
    if (framework === "react" && testInfo.project.name === "chromium") {
      await page.screenshot({
        path: "artifacts/people-picker.png",
        fullPage: true,
      });
    }
    const audit = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(audit.violations).toEqual([]);
  });
}

for (const width of [1440, 320]) {
  test(`pattern documentation and Vue demos fit ${width}px including open picker`, async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#/business-patterns");
    await expect(
      page.getByRole("heading", {
        name: "패턴과 템플릿",
        exact: true,
        level: 1,
      }),
    ).toBeVisible();
    await noPageOverflow(page);
    for (const [id] of patterns) {
      const demo = await openPattern(page, "react", id);
      await expect(demo).toBeVisible();
      await noPageOverflow(page);
    }
    for (const framework of ["react", "vue"] as const) {
      const demo = await openPattern(page, framework, "people-picker");
      await noPageOverflow(page);
      await demo
        .getByRole("button", { name: /^리뷰에 참여할 구성원 선택/ })
        .click();
      const dialog = page.getByRole("dialog", {
        name: "리뷰에 참여할 구성원 선택",
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
      await noPageOverflow(page);
      await dialog
        .getByRole("button", { name: "선택 적용", exact: true })
        .click();
      await expect(dialog).toHaveCount(0);
    }
  });
}
