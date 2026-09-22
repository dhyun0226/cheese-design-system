import { test, expect } from "@playwright/test";

test("pattern edits invalidate saved status and reset restores every default", async ({
  page,
}) => {
  await page.goto("/#/patterns");
  const name = page.getByRole("textbox", { name: "평가 이름", exact: true });
  const team = page.getByRole("combobox", { name: "대상 조직", exact: true });
  const deadline = page.getByRole("textbox", { name: "마감일", exact: true });
  const reminder = page.getByRole("checkbox", {
    name: "마감 3일 전 알림 발송",
    exact: true,
  });
  const allowEditing = page.getByRole("switch", {
    name: "제출 후 본인 수정 허용",
    exact: true,
  });
  const save = page.getByRole("button", { name: "설정 저장", exact: true });
  const saved = page
    .getByRole("status")
    .filter({ hasText: "예제 설정이 저장되었습니다." });

  await name.fill("회귀 테스트 평가");
  await save.click();
  await expect(saved).toBeVisible();

  const changes = [
    {
      field: "evaluation name",
      edit: async () => {
        await name.fill("수정한 회귀 테스트 평가");
        await expect(name).toHaveValue("수정한 회귀 테스트 평가");
      },
    },
    {
      field: "target organization",
      edit: async () => {
        await team.click();
        await page.getByRole("option", { name: "개발팀", exact: true }).click();
        await expect(team).toHaveText("개발팀");
      },
    },
    {
      field: "deadline",
      edit: async () => {
        await deadline.fill("2026-11-02");
        await expect(deadline).toHaveValue("2026-11-02");
      },
    },
    {
      field: "reminder",
      edit: async () => {
        await reminder.click();
        await expect(reminder).not.toBeChecked();
      },
    },
    {
      field: "editing permission",
      edit: async () => {
        await allowEditing.click();
        await expect(allowEditing).toBeChecked();
      },
    },
  ];

  for (const { field, edit } of changes) {
    await test.step(`${field} requires saving again`, async () => {
      await edit();
      await expect(saved).not.toBeVisible();
      await save.click();
      await expect(saved).toBeVisible();
    });
  }

  await page.getByRole("button", { name: "초기화", exact: true }).click();
  await expect(saved).not.toBeVisible();
  await expect(name).toHaveValue("");
  await expect(team).toHaveText("전체 조직");
  await expect(deadline).toHaveValue("2026-10-30");
  await expect(reminder).toBeChecked();
  await expect(allowEditing).not.toBeChecked();
});

test("pattern required and invalid values cannot report a successful save", async ({
  page,
}) => {
  await page.goto("/#/patterns");
  const name = page.getByRole("textbox", { name: "평가 이름", exact: true });
  const deadline = page.getByRole("textbox", { name: "마감일", exact: true });
  const save = page.getByRole("button", { name: "설정 저장", exact: true });
  const saved = page
    .getByRole("status")
    .filter({ hasText: "예제 설정이 저장되었습니다." });

  await name.fill("회귀 테스트 평가");
  await save.click();
  await expect(saved).toBeVisible();

  await name.fill("   ");
  await expect(saved).not.toBeVisible();
  await save.click();
  await expect(saved).not.toBeVisible();
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("alert")).toContainText(
    "평가 이름을 입력해 주세요.",
  );

  await name.fill("복구한 평가");
  await expect(name).not.toHaveAttribute("aria-invalid", "true");
  await save.click();
  await expect(saved).toBeVisible();

  for (const value of ["", "2026-02-30"]) {
    await test.step(`deadline ${value || "empty"} blocks saving`, async () => {
      await deadline.fill(value);
      await expect(saved).not.toBeVisible();
      await save.click();
      await expect(saved).not.toBeVisible();
      await expect(deadline).toBeFocused();
      await expect(deadline).toHaveAttribute("aria-invalid", "true");
      await expect(deadline).toHaveValue(value);

      await deadline.fill("2026-11-02");
      await save.click();
      await expect(saved).toBeVisible();
    });
  }

  await deadline.fill("");
  await save.click();
  await expect(deadline).toHaveAttribute("aria-invalid", "true");
  await page.getByRole("button", { name: "초기화", exact: true }).click();
  await expect(saved).not.toBeVisible();
  await expect(name).toHaveValue("");
  await expect(deadline).toHaveValue("2026-10-30");
  await expect(deadline).not.toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("alert")).toHaveCount(0);
});
