import { expect, test } from "@playwright/test";

test("checkbox example lets the indeterminate control toggle with pointer and keyboard", async ({
  page,
}) => {
  await page.goto("/#/components/checkbox");
  const demo = page.locator(".demo-stage");
  const partial = demo.getByRole("checkbox", {
    name: "일부 항목 선택됨",
    exact: true,
  });
  await expect(partial).toHaveAttribute("aria-checked", "mixed");
  await partial.click();
  await expect(partial).toBeChecked();
  await expect(partial).toHaveAttribute("aria-checked", "true");
  await partial.press("Space");
  await expect(partial).not.toBeChecked();
  await partial.press("Space");
  await expect(partial).toBeChecked();

  const notification = demo.getByRole("checkbox", {
    name: "평가 결과 알림 받기",
    exact: true,
  });
  await expect(notification).not.toBeChecked();
  await notification.click();
  await expect(demo.getByRole("status")).toHaveText("알림: 켜짐");
  await expect(partial).toBeChecked();
  await expect(
    demo.getByRole("checkbox", { name: "변경할 수 없는 항목", exact: true }),
  ).toBeDisabled();
});

test("PIN example requires six digits and clears confirmation on edits and reset", async ({
  page,
}) => {
  await page.goto("/#/components/pin-otp-input");
  const demo = page.locator(".demo-stage");
  const input = demo.getByRole("textbox", { name: "인증 코드", exact: true });
  const submit = demo.getByRole("button", { name: "코드 확인", exact: true });
  const status = demo.getByRole("status");
  const initial = "테스트용입니다. 실제 인증 코드는 전송하지 않습니다.";
  const success = "6자리 입력이 확인되었습니다. 서버 검증은 별도입니다.";

  await submit.click();
  await expect(input).toBeFocused();
  await expect(demo.getByRole("alert")).toHaveText(
    "인증 코드를 입력해 주세요.",
  );
  await expect(status).toHaveText(initial);

  await input.fill("123456");
  await submit.click();
  await expect(status).toHaveText(success);

  await input.fill("654321");
  await expect(status).toHaveText(initial);
  await submit.click();
  await expect(status).toHaveText(success);

  await input.fill("65432");
  await expect(status).toHaveText(initial);
  await submit.click();
  await expect(input).toBeFocused();
  await expect(demo.getByRole("alert")).toHaveText(
    "숫자 6자리 인증 코드를 입력해 주세요.",
  );
  await expect(status).toHaveText(initial);

  await input.fill("654321");
  await submit.click();
  await expect(status).toHaveText(success);
  await demo.getByRole("button", { name: "초기화", exact: true }).click();
  await expect(input).toHaveValue("");
  await expect(status).toHaveText(initial);
  await expect(demo.getByRole("alert")).toHaveCount(0);
});

test("DatePicker example submits readonly values and excludes disabled values from its form", async ({
  page,
}) => {
  await page.goto("/#/components/date-picker");
  const demo = page.locator(".demo-stage");
  const form = demo.locator("form");
  const readonly = demo.getByRole("button", {
    name: "변경할 수 없는 날짜 2026-10-20",
    exact: true,
  });
  await readonly.click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(form.locator('input[name="locked-date"]')).toHaveAttribute(
    "readonly",
    "",
  );
  await expect(form.locator('input[name="disabled-date"]')).toBeDisabled();
  await expect(
    demo.getByRole("button", { name: "비활성 날짜 2026-10-20", exact: true }),
  ).toBeDisabled();

  await demo
    .getByRole("button", { name: "평가 마감일 날짜 선택", exact: true })
    .click();
  await page.locator('.rdp-day[data-day="2026-10-14"] button').click();
  await demo.getByRole("button", { name: "날짜 확인", exact: true }).click();
  expect(
    await form.evaluate((node: HTMLFormElement) =>
      Object.fromEntries(new FormData(node)),
    ),
  ).toEqual({ deadline: "2026-10-14", "locked-date": "2026-10-20" });
  const result = demo.getByText(/^전송할 값:/);
  await expect(result).toContainText("전송할 값: 2026-10-14");
  await expect(result).toContainText("읽기 전용: 2026-10-20");
  await expect(result).toContainText("비활성: 제출 제외");

  await demo.getByRole("button", { name: "날짜 초기화", exact: true }).click();
  await expect(result).toHaveCount(0);
  await expect(demo.getByRole("status")).toHaveText("선택한 날짜가 없습니다.");
  await expect(readonly).toBeVisible();
});
