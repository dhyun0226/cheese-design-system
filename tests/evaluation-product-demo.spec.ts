import { expect, test } from "@playwright/test";

test("evaluation concept connects sign-in, employee home, draft validation and review", async ({
  page,
}) => {
  await page.goto("/#/evaluation-demo");
  await expect(
    page.getByRole("heading", { name: "인사평가가 제품이 된다면." }),
  ).toBeVisible();
  await expect(page.getByRole("note")).toContainText("가상 데이터");

  await page.getByRole("button", { name: "직원 데모로 계속하기" }).click();
  await expect(
    page.getByRole("heading", { name: "안녕하세요, 김치즈 님." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "작성 이어가기" }).click();
  await expect(
    page.getByRole("heading", { name: "자기평가 초안" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "검토 화면 보기" }).click();
  const summary = page.getByRole("textbox", {
    name: "이번 기간의 업무와 기여",
  });
  await expect(summary).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("alert")).toContainText("간단히 작성");

  await summary.fill("반복 업무를 공통 컴포넌트와 배포 흐름으로 정리했습니다.");
  await page.getByRole("button", { name: "임시저장" }).click();
  await expect(
    page
      .getByRole("complementary", { name: "인사평가 예제 탐색" })
      .getByText("방금 이 브라우저에 임시 저장됨"),
  ).toBeVisible();
  await page.getByRole("button", { name: "검토 화면 보기" }).click();
  await expect(
    page.getByRole("heading", { name: "작성 내용을 확인하세요." }),
  ).toBeVisible();
  await expect(page.getByText("최종 제출 버튼은 의도적으로")).toBeVisible();
});

test("evaluation concept remains usable on a narrow screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto("/#/evaluation-demo");
  await page.getByRole("button", { name: "직원 데모로 계속하기" }).click();
  await expect(page.getByRole("button", { name: "내 평가" })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
});
