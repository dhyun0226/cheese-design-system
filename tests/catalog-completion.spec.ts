import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const audit = async (page: Page) =>
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

test("required custom select focuses the trigger and clears its error", async ({
  page,
}) => {
  await page.goto("/tests/fixtures/forms.html");
  const select = page.getByRole("combobox", { name: "필수 조직" });
  await page.getByRole("button", { name: "선택 폼 제출" }).click();
  await expect(select).toBeFocused();
  await expect(select).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("alert")).toHaveText("항목을 선택해 주세요.");
  await select.click();
  await page.getByRole("option", { name: "개발팀" }).click();
  await expect(select).toHaveAttribute("aria-invalid", "false");
  await page.getByRole("button", { name: "선택 폼 제출" }).click();
  await expect(page.getByLabel("제출 데이터")).toHaveText('{"team":"tech"}');
  await page.getByRole("button", { name: "선택 폼 초기화" }).click();
  await expect(select).toContainText("선택하세요");
});

test("custom select keyboard, disabled options, submission and reset", async ({
  page,
}) => {
  await page.goto("/#/components/select");
  const select = page.getByRole("combobox", { name: "담당 조직" });
  await select.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("listbox")).toBeVisible();
  await expect(
    page.getByRole("option", { name: "보관된 조직" }),
  ).toBeDisabled();
  await expect(page.locator("#root")).toHaveAttribute("inert");
  // The modal listbox intentionally makes the document landmarks inert.
  // Audit its full open content here; the closed page is covered by catalog tests.
  expect(
    (await new AxeBuilder({ page }).include(".cheese-select-content").analyze())
      .violations,
  ).toEqual([]);
  await page.screenshot({
    path: `artifacts/${test.info().project.name}/select-open.png`,
  });
  await page.getByRole("option", { name: /개발팀/ }).click();
  await expect(select).toBeFocused();
  await expect(select).toContainText("개발팀");
  await expect(page.locator("#root")).not.toHaveAttribute("inert");
  await page.getByRole("button", { name: "선택 확인" }).click();
  await expect(page.getByRole("status")).toHaveText("선택한 조직: tech");
  await page
    .locator(".demo-stage")
    .getByRole("button", { name: "초기화", exact: true })
    .click();
  await expect(select).toContainText("피플팀");
});

test("combobox search, empty results, keyboard selection and IME", async ({
  page,
}) => {
  await page.goto("/#/components/combobox");
  const input = page.getByRole("combobox", { name: "담당자 검색" });
  await input.fill("없는사람");
  await expect(
    page.getByText("검색 결과가 없습니다.", { exact: true }),
  ).toBeVisible();
  await input.fill("이달");
  await page.keyboard.press("ArrowDown");
  await input.dispatchEvent("keydown", { key: "Enter", isComposing: true });
  await expect(input).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Enter");
  await expect(input).toHaveValue("이달");
  await expect(page.getByRole("status")).toHaveText("선택한 값: lee");
  await input.click();
  await page.keyboard.press("ArrowDown");
  await audit(page);
  await page.keyboard.press("Escape");
  await expect(input).toHaveValue("이달");
  await expect(input).toHaveAttribute("aria-expanded", "false");
});

test("tags reject duplicates, preserve IME, remove and editable save cancel", async ({
  page,
}) => {
  await page.goto("/#/components/tags-input");
  const input = page.getByRole("textbox", { name: "프로젝트 태그" });
  await input.fill("협업");
  await input.dispatchEvent("keydown", { key: "Enter", isComposing: true });
  await expect(page.getByRole("button", { name: "협업 삭제" })).toHaveCount(0);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "협업 삭제" })).toBeVisible();
  await input.fill("협업");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("status").filter({ hasText: "이미 추가" }),
  ).toBeVisible();
  await input.fill("");
  await page.keyboard.press("Backspace");
  await expect(page.getByRole("button", { name: "협업 삭제" })).toHaveCount(0);
  await audit(page);
  await page.goto("/#/components/editable");
  await page.getByRole("button", { name: "평가 이름 수정" }).click();
  const edit = page.getByRole("textbox", { name: "평가 이름" });
  await expect(edit).toBeFocused();
  await edit.fill("   ");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("alert")).toHaveText("내용을 입력해 주세요.");
  await edit.fill("바꾸지 않음");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("status")).toContainText("2026 하반기 평가");
  await page.getByRole("button", { name: "평가 이름 수정" }).click();
  await edit.fill("새 평가");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toHaveText("저장된 이름: 새 평가");
  await expect(
    page.getByRole("button", { name: "평가 이름 수정" }),
  ).toBeFocused();
});

test("OTP filters input, validates length and resets", async ({ page }) => {
  await page.goto("/#/components/pin-otp-input");
  const input = page.getByRole("textbox", { name: "인증 코드" });
  await input.fill("12a3");
  await expect(input).toHaveValue("123");
  await page.getByRole("button", { name: "코드 확인" }).click();
  await expect(input).toBeFocused();
  await input.fill("123456");
  await page.getByRole("button", { name: "코드 확인" }).click();
  await expect(page.getByRole("status")).toContainText("6자리 입력이 확인");
  await page
    .locator(".demo-stage")
    .getByRole("button", { name: "초기화" })
    .click();
  await expect(input).toHaveValue("");
});

test("listbox, color swatches and rating use labelled keyboard controls", async ({
  page,
}) => {
  await page.goto("/#/components/listbox");
  const list = page.getByRole("listbox", { name: "평가 상태" });
  await list.getByRole("option", { name: /작성 중/ }).focus();
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toHaveText("선택한 상태: done");
  await expect(list.getByRole("option", { name: /보관/ })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await page.goto("/#/components/color-picker");
  await page.getByRole("radio", { name: "Space Black" }).click();
  await expect(page.getByRole("status")).toContainText("#111111");
  await page.goto("/#/components/rating");
  const group = page.getByRole("radiogroup", { name: "업무 경험 만족도" });
  await group.getByRole("radio", { name: "3점" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(group.getByRole("radio", { name: "4점" })).toBeChecked();
  await audit(page);
});

test("range fields reject reversed intervals, submit both values and reset", async ({
  page,
}) => {
  for (const type of ["date", "time"] as const) {
    await page.goto(`/#/components/${type}-range-field`);
    const start = page.getByLabel("시작", { exact: true }),
      end = page.getByLabel("종료", { exact: true });
    const a = type === "date" ? "2026-10-10" : "14:00",
      b = type === "date" ? "2026-10-09" : "13:00",
      c = type === "date" ? "2026-10-11" : "15:00";
    await start.fill(a);
    await end.fill(b);
    await expect(page.getByRole("alert")).toContainText("종료는 시작보다");
    expect(
      await end.evaluate((el: HTMLInputElement) => el.checkValidity()),
    ).toBe(false);
    await end.fill(c);
    await expect(page.getByRole("alert")).toHaveCount(0);
    await page
      .getByRole("button", {
        name: type === "date" ? "기간 확인" : "시간 확인",
      })
      .click();
    await expect(page.getByRole("status")).toHaveText(a + " ~ " + c);
    await page
      .locator(".demo-stage")
      .getByRole("button", { name: "초기화" })
      .click();
    await expect(start).toHaveValue(type === "date" ? "" : "09:00");
  }
});

test("month and year pickers navigate within bounds", async ({ page }) => {
  await page.goto("/#/components/month-picker");
  await page.getByRole("radio", { name: "2026년 11월" }).click();
  await expect(page.getByRole("status")).toHaveText("선택한 월: 2026-11");
  await page.getByRole("button", { name: "이전 연도", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "이전 연도", exact: true }),
  ).toBeDisabled();
  await page.goto("/#/components/year-picker");
  await page.getByRole("radio", { name: "2027", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("선택한 연도: 2027");
  await page.getByRole("button", { name: "다음 연도 범위" }).click();
  await page.getByRole("button", { name: "다음 연도 범위" }).click();
  await expect(
    page.getByRole("radio", { name: "2041", exact: true }),
  ).toBeDisabled();
});

test("navigation, menubar, toolbar and hover card interactions", async ({
  page,
}) => {
  await page.goto("/#/components/navigation-menu");
  await page.getByRole("button", { name: "평가 관리" }).click();
  await expect(
    page.getByRole("link", { name: "평가 일정", exact: true }),
  ).toBeVisible();
  // Radix uses an aria-hidden, tabbable focus proxy with a delegated onFocus.
  // axe cannot observe React's delegated redirect; test the actual Tab path first.
  await page.getByRole("button", { name: "평가 관리" }).focus();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "평가 목록", exact: true }),
  ).toBeFocused();
  expect(
    (
      await new AxeBuilder({ page })
        .exclude('.cheese-navigation [aria-hidden="true"][tabindex="0"]')
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await page.goto("/#/components/menubar");
  await page.getByRole("menuitem", { name: "파일", exact: true }).focus();
  await page.keyboard.press("ArrowDown");
  await page.getByRole("menuitem", { name: "저장", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("선택한 명령: 저장");
  await page.goto("/#/components/toolbar");
  await page.getByRole("button", { name: "굵게", exact: true }).click();
  await page.getByRole("button", { name: "문서 저장" }).click();
  await expect(page.getByRole("status")).toHaveText("서식: 굵게 · 저장됨");
  await page.goto("/#/components/hover-card");
  await page
    .getByRole("link", { name: "김치즈 · 피플팀", exact: true })
    .focus();
  await expect(page.locator(".cheese-popover")).toBeVisible();
  await audit(page);
  await page.keyboard.press("Escape");
  await expect(page.locator(".cheese-popover")).not.toBeVisible();
});

test("splitter pointer and keyboard, carousel buttons and boundaries", async ({
  page,
}) => {
  await page.goto("/#/components/splitter");
  const handle = page.getByRole("separator", { name: "조직 패널 크기" });
  await handle.focus();
  await page.keyboard.press("ArrowRight");
  await expect(handle).toHaveAttribute("aria-valuenow", "42");
  await page.keyboard.press("Home");
  await expect(handle).toHaveAttribute("aria-valuenow", "20");
  const box = await handle.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + 30);
  await page.mouse.down();
  await page.mouse.move(box!.x + 100, box!.y + 30);
  await page.mouse.up();
  expect(Number(await handle.getAttribute("aria-valuenow"))).toBeGreaterThan(
    20,
  );
  await page.goto("/#/components/carousel");
  await expect(
    page.getByRole("button", { name: "이전 슬라이드" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "다음 슬라이드" }).click();
  await expect(
    page.getByRole("heading", { name: "진행 상황을 기록하세요" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "3번 슬라이드로 이동" }).click();
  await expect(
    page.getByRole("button", { name: "다음 슬라이드" }),
  ).toBeDisabled();
  await audit(page);
});

test("gold focus, SVG tree carets, favicon and mobile visual evidence", async ({
  page,
}) => {
  await page.goto("/#/components/input");
  const input = page.locator(".demo-stage input:not(:disabled)").first();
  await input.focus();
  await expect(input).toHaveCSS("outline-color", "rgb(255, 201, 40)");
  const favicon = page.locator('link[rel="icon"]');
  await expect(favicon).toHaveAttribute("href", "./favicon.svg");
  expect((await page.request.get("/favicon.svg")).status()).toBe(200);
  await page.screenshot({
    path: `artifacts/${test.info().project.name}/gold-input-focus.png`,
  });
  await page.goto("/#/components/tree");
  const tree = page.getByRole("tree");
  await expect(tree.locator(".cheese-tree-caret svg").first()).toBeVisible();
  await expect(tree.locator(".cheese-tree-caret svg").first()).toHaveCSS(
    "width",
    "16px",
  );
  expect(await tree.locator(".cheese-tree-caret").allTextContents()).toEqual(
    expect.arrayContaining([""]),
  );
  await page.screenshot({
    path: `artifacts/${test.info().project.name}/tree-lucide.png`,
  });
  await page
    .locator(".demo-stage")
    .screenshot({
      path: `artifacts/${test.info().project.name}/tree-detail.png`,
    });
  await page.goto("/#/components/calendar");
  await expect(page.locator(".cheese-calendar")).toBeVisible();
  await page.screenshot({
    path: `artifacts/${test.info().project.name}/calendar-gold.png`,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const id of [
    "select",
    "tags-input",
    "date-range-field",
    "splitter",
    "toolbar",
    "tree",
  ]) {
    await page.goto("/#/components/" + id);
    await expect(page.locator(".demo-stage")).toBeVisible();
    await expect(page.locator("[data-example-loading]")).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.screenshot({
    path: `artifacts/${test.info().project.name}/tree-mobile.png`,
    fullPage: true,
  });
});

test("Vue added collection, editing, rating and navigation interactions", async ({
  page,
}) => {
  await page.goto("/vue.html");
  await page.getByRole("combobox", { name: "Vue 담당 조직" }).click();
  await page
    .getByRole("option", { name: /개발팀/ })
    .last()
    .click();
  await expect(
    page.getByRole("combobox", { name: "Vue 담당 조직" }),
  ).toContainText("개발팀");
  const search = page.getByRole("combobox", { name: "Vue 조직 검색" });
  await search.fill("피플");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(search).toHaveValue("피플팀");
  const tags = page.getByRole("textbox", { name: "Vue 태그" });
  await tags.fill("협업");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "협업 삭제" })).toBeVisible();
  await page.getByRole("button", { name: "Vue 평가 이름 수정" }).click();
  await page
    .getByRole("textbox", { name: "Vue 평가 이름" })
    .fill("Vue 새 평가");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Vue 평가 이름 수정" }),
  ).toContainText("Vue 새 평가");
  await page
    .getByRole("radiogroup", { name: "Vue 만족도" })
    .getByRole("radio", { name: "5점" })
    .click();
  await expect(
    page
      .getByRole("radiogroup", { name: "Vue 만족도" })
      .getByRole("radio", { name: "5점" }),
  ).toBeChecked();
  await page.getByRole("menuitem", { name: "파일", exact: true }).click();
  await page.getByRole("menuitem", { name: "저장", exact: true }).click();
  await page.getByRole("button", { name: "굵게", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "굵게", exact: true }),
  ).toHaveAttribute("data-state", "on");
  await audit(page);
});

test("Vue added dates, form reset, splitter and carousel", async ({ page }) => {
  await page.goto("/vue.html");
  const code = page.getByRole("textbox", { name: "Vue 인증 코드" });
  await code.fill("123456");
  const group = page.getByRole("group", { name: "Vue 평가 기간", exact: true });
  await group.getByLabel("시작", { exact: true }).fill("2026-10-10");
  await group.getByLabel("종료", { exact: true }).fill("2026-10-09");
  await expect(group.getByRole("alert")).toBeVisible();
  await group.getByLabel("종료", { exact: true }).fill("2026-10-11");
  await page.getByRole("button", { name: "Vue 확장 폼 제출" }).click();
  await expect(page.getByText(/"period.start":"2026-10-10"/)).toBeVisible();
  await page.getByRole("button", { name: "Vue 확장 폼 초기화" }).click();
  await expect(code).toHaveValue("");
  await expect(group.getByLabel("시작", { exact: true })).toHaveValue("");
  await page.getByRole("radio", { name: "2026년 11월" }).click();
  await expect(page.getByRole("radio", { name: "2026년 11월" })).toBeChecked();
  await page.getByRole("radio", { name: "2027", exact: true }).click();
  await expect(
    page.getByRole("radio", { name: "2027", exact: true }),
  ).toBeChecked();
  const handle = page.getByRole("separator", { name: "Vue 패널 크기" });
  await handle.focus();
  await page.keyboard.press("End");
  await expect(handle).toHaveAttribute("aria-valuenow", "80");
  await page.getByRole("button", { name: "다음 슬라이드" }).click();
  await expect(
    page.getByRole("heading", { name: "기록을 남기세요" }),
  ).toBeVisible();
  await page.screenshot({
    path: `artifacts/${test.info().project.name}/vue-extended.png`,
    fullPage: true,
  });
});
