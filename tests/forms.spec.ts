import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const framework of ["react", "vue"]) {
  test(`${framework} required Select validates without a form submission name`, async ({
    page,
  }) => {
    await page.goto(
      `/tests/fixtures/forms.html?namelessSelect&framework=${framework}`,
    );
    const select = page.getByRole("combobox", { name: "필수 조직" });
    const submit = page.getByRole("button", { name: "선택 저장", exact: true });
    await submit.click();
    await expect(page.getByLabel("저장 횟수")).toHaveText("0");
    await expect(select).toBeFocused();
    await expect(select).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByRole("alert")).toHaveText("항목을 선택해 주세요.");
    await select.click();
    await page.getByRole("option", { name: "개발팀" }).click();
    await submit.click();
    await expect(page.getByLabel("저장 횟수")).toHaveText("1");
    await expect(page.getByLabel("선택 제출 데이터")).toHaveText("{}");
    await page
      .getByRole("button", { name: "선택 초기화", exact: true })
      .click();
    await expect(select).toContainText("선택하세요");
    await submit.click();
    await expect(page.getByLabel("저장 횟수")).toHaveText("1");
    await expect(select).toBeFocused();
  });
}

async function select(page: Page, label: string, day: string) {
  await page
    .getByRole("button", { name: new RegExp("^" + label + " ") })
    .click();
  await page
    .getByRole("dialog")
    .locator(`[data-day="2026-10-${day}"] button`)
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
}
test.beforeEach(async ({ page }) => {
  await page.goto("/tests/fixtures/forms.html");
});

test("DatePicker required validation blocks submission and links error to focused trigger", async ({
  page,
}) => {
  await page.getByRole("button", { name: "제출", exact: true }).click();
  const trigger = page.getByRole("button", {
    name: "필수 날짜 날짜 선택",
    exact: true,
  });
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("alert")).toHaveText("날짜를 선택해 주세요.");
  await expect(page.getByRole("status", { name: "제출 데이터" })).toBeEmpty();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await select(page, "필수 날짜", "14");
  await expect(page.getByRole("alert")).toHaveCount(0);
  await page.getByRole("button", { name: "제출", exact: true }).click();
  const data = JSON.parse(
    await page.getByRole("status", { name: "제출 데이터" }).innerText(),
  );
  expect(data).toEqual({
    required: "2026-10-14",
    initial: "2026-10-10",
    readonly: "2026-10-20",
    memo: "초기 메모",
    external: "2026-10-10",
  });
});
test("DatePicker uncontrolled reset restores default and outside-form association", async ({
  page,
}) => {
  await select(page, "필수 날짜", "14");
  await select(page, "초기 날짜", "17");
  await select(page, "폼 외부 날짜", "18");
  await page.getByRole("textbox", { name: "메모" }).fill("변경 메모");
  await page.getByRole("button", { name: "초기화", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "필수 날짜 날짜 선택", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "초기 날짜 2026-10-10" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "폼 외부 날짜 2026-10-10" }),
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "메모" })).toHaveValue(
    "초기 메모",
  );
  await select(page, "필수 날짜", "15");
  await page.getByRole("button", { name: "제출", exact: true }).click();
  await expect(page.getByRole("status", { name: "제출 데이터" })).toContainText(
    '"initial":"2026-10-10"',
  );
  await expect(page.getByRole("status", { name: "제출 데이터" })).toContainText(
    '"external":"2026-10-10"',
  );
});
test("DatePicker respects canceled reset, disabled fields, readonly and controlled refs", async ({
  page,
}) => {
  await select(page, "초기 날짜", "17");
  await page.getByRole("checkbox", { name: "초기화 취소" }).check();
  await page.getByRole("button", { name: "초기화", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "초기 날짜 2026-10-17" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "비활성 2026-10-20", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "그룹 날짜 2026-10-20" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "읽기 전용 2026-10-20" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "제어값 지우기" }).click();
  await expect(
    page.getByRole("button", { name: "제어 날짜 날짜 선택" }),
  ).toBeFocused();
});

test("multiple required DatePickers focus the first remaining invalid trigger", async ({
  page,
}) => {
  const form = page.getByRole("form", { name: "다중 날짜 폼" });
  const submit = form.getByRole("button", { name: "다중 날짜 제출" });
  await submit.click();
  await expect(form.getByRole("alert")).toHaveCount(2);
  await expect(
    form.getByRole("button", { name: "첫 필수 날짜 날짜 선택" }),
  ).toBeFocused();
  await select(page, "첫 필수 날짜", "14");
  await submit.click();
  await expect(form.getByRole("alert")).toHaveCount(1);
  await expect(
    form.getByRole("button", { name: "둘째 필수 날짜 날짜 선택" }),
  ).toBeFocused();
});
