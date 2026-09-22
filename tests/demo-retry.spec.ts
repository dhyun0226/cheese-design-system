import { test, expect } from "@playwright/test";

test("React search demos replay errors after toolbar reset and keep separate retry state", async ({
  page,
}) => {
  await page.goto("/#/components/async-combobox");
  const employee = page.getByRole("combobox", { name: "직원 서버 검색" });
  const searchError = page
    .getByRole("alert")
    .filter({ hasText: "검색에 실패했습니다." });

  await employee.fill("오류");
  await expect(searchError).toBeVisible();
  await page.getByRole("button", { name: "다시 검색", exact: true }).click();
  await expect(page.getByRole("option", { name: /^김하늘 01/ })).toBeVisible();
  await expect(searchError).not.toBeVisible();

  await page.getByRole("button", { name: "초기화", exact: true }).click();
  await expect(employee).toHaveValue("");
  await employee.fill("오류");
  await expect(searchError).toBeVisible();
  await page.getByRole("button", { name: "다시 검색", exact: true }).click();
  await page.getByRole("option", { name: /^김하늘 01/ }).click();
  await expect(employee).toHaveValue("김하늘 01");

  await page
    .getByRole("navigation", { name: "문서 탐색", exact: true })
    .getByRole("link", { name: "Multi Select", exact: true })
    .click();
  await expect(page).toHaveURL(/#\/components\/multi-select$/);
  const references = page.getByRole("combobox", {
    name: "서버에서 참조자 검색",
    exact: true,
  });
  await references.fill("오류");
  await expect(searchError).toBeVisible();
  await page.getByRole("button", { name: "다시 검색", exact: true }).click();
  await expect(page.getByRole("option", { name: /^김하늘 01/ })).toBeVisible();
  await expect(searchError).not.toBeVisible();
});

test("React table demo replays its error after toolbar reset", async ({
  page,
}) => {
  await page.goto("/#/components/data-table");
  const table = page.getByRole("region", { name: "평가 대상자", exact: true });
  const search = table.getByRole("textbox", {
    name: "평가 대상자 검색",
    exact: true,
  });
  const error = table.getByRole("alert");

  await search.fill("오류");
  await expect(error).toHaveText("데이터를 불러오지 못했습니다.");
  await table
    .getByRole("button", { name: "다시 불러오기", exact: true })
    .click();
  await expect(
    table.getByRole("cell", { name: "김하늘 01", exact: true }),
  ).toBeVisible();
  await expect(error).not.toBeVisible();

  await page.getByRole("button", { name: "초기화", exact: true }).click();
  await expect(search).toHaveValue("");
  await search.fill("오류");
  await expect(error).toHaveText("데이터를 불러오지 못했습니다.");
  await table
    .getByRole("button", { name: "다시 불러오기", exact: true })
    .click();
  await expect(
    table.getByRole("cell", { name: "김하늘 01", exact: true }),
  ).toBeVisible();
  await expect(error).not.toBeVisible();
});

test("Vue employee retry leaves the reference search error scenario available", async ({
  page,
}) => {
  await page.goto("/vue.html");
  const business = page.getByRole("region", {
    name: "Vue 업무 컴포넌트",
    exact: true,
  });
  const employee = business.getByRole("combobox", {
    name: "Vue 직원 서버 검색",
    exact: true,
  });
  const references = business.getByRole("combobox", {
    name: "Vue 서버 참조자",
    exact: true,
  });
  const error = business
    .getByRole("alert")
    .filter({ hasText: "검색에 실패했습니다." });

  await employee.fill("오류");
  await expect(error).toBeVisible();
  await business
    .getByRole("button", { name: "다시 검색", exact: true })
    .click();
  await business.getByRole("option", { name: /^김하늘 01/ }).click();
  await expect(employee).toHaveValue("김하늘 01");
  await expect(error).not.toBeVisible();

  await references.fill("오류");
  await expect(error).toBeVisible();
  await expect(employee).toHaveValue("김하늘 01");
  await business
    .getByRole("button", { name: "다시 검색", exact: true })
    .click();
  await business.getByRole("option", { name: /^김하늘 01/ }).click();
  await expect(
    business.getByRole("button", { name: "김하늘 01 선택 해제", exact: true }),
  ).toBeVisible();
  await expect(error).not.toBeVisible();
});
