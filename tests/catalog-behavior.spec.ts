import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const [route, triggerName, title] of [
  ["drawer", "평가 상세 열기", "평가 상세"],
  ["bottom-sheet", "필터 설정 열기", "필터 설정"],
]) {
  test(`${route} opens within a small viewport, handles input and restores focus`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#/components/" + route);
    const trigger = page.getByRole("button", {
      name: triggerName,
      exact: true,
    });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: title, exact: true });
    await expect(dialog).toHaveCSS("opacity", "1");
    await expect(page.locator(".cheese-overlay")).toHaveCSS("opacity", "1");
    const box = (await dialog.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(845);
    const checkbox = dialog.getByRole("checkbox", {
      name: "진행 중인 평가만 표시",
    });
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.screenshot({
      path: `artifacts/${test.info().project.name}/audit-${route}-open.png`,
    });
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
}

test("popover controls work, dismiss and return to their trigger", async ({
  page,
}) => {
  await page.goto("/#/components/popover");
  const trigger = page.getByRole("button", { name: "표시 항목", exact: true });
  await trigger.click();
  const popup = page.getByRole("dialog", { name: "표시 항목 설정" });
  const checkbox = popup.getByRole("checkbox", {
    name: "평가 상태",
    exact: true,
  });
  await checkbox.check();
  await expect(checkbox).toBeChecked();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(popup).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("collapsible toggles by keyboard and stepper respects both ends", async ({
  page,
}) => {
  await page.goto("/#/components/collapsible");
  const trigger = page.getByRole("button", { name: "추가 설명 펼치기 / 접기" });
  await trigger.focus();
  await page.keyboard.press("Space");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByText("추가 설정은 조직별 평가 정책에 따라 변경할 수 있습니다."),
  ).toBeVisible();
  await page.keyboard.press("Space");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await page.goto("/#/components/stepper");
  const next = page.getByRole("button", { name: "다음 단계" });
  const previous = page.getByRole("button", { name: "이전 단계" });
  await expect(previous).toBeDisabled();
  await expect(page.locator('[aria-current="step"]')).toContainText(
    "기본 정보",
  );
  await next.click();
  await expect(page.locator('[aria-current="step"]')).toContainText(
    "대상자 선택",
  );
  await next.click();
  await expect(page.locator('[aria-current="step"]')).toContainText(
    "검토 및 제출",
  );
  await expect(next).toBeDisabled();
  await previous.click();
  await expect(page.locator('[aria-current="step"]')).toContainText(
    "대상자 선택",
  );
});

test("radio keyboard skips disabled choices and progress has synchronized values", async ({
  page,
}) => {
  await page.goto("/#/components/radio-group");
  const team = page.getByRole("radio", { name: "팀에 공개", exact: true });
  await expect(team).toBeChecked();
  await expect(
    page.getByRole("radio", { name: "전체 공개", exact: true }),
  ).toBeDisabled();
  await team.focus();
  // Radix defers roving focus to the next task. Keep keydown active until
  // selection follows focus, rather than racing an immediate synthetic keyup.
  await page.keyboard.down("ArrowDown");
  await expect(
    page.getByRole("radio", { name: "나만 보기", exact: true }),
  ).toBeChecked();
  await page.keyboard.up("ArrowDown");
  await page.goto("/#/components/progress");
  const bar = page.getByRole("progressbar", { name: "평가 완료율" });
  await expect(bar).toHaveAttribute("aria-valuenow", "40");
  await page.getByRole("button", { name: "진행률 변경" }).click();
  await expect(bar).toHaveAttribute("aria-valuenow", "60");
  await expect(page.getByRole("status")).toHaveText("완료율 60%");
});

test("native fields forward constraints and expose browser text fallback", async ({
  page,
}) => {
  for (const [route, name, valid, invalid] of [
    ["number-field", "평가 가중치", "45", "105"],
    ["date-field", "평가 마감일", "2026-11-01", "2027-01-01"],
    ["time-field", "알림 시간", "10:15", "10:16"],
  ]) {
    await page.goto("/#/components/" + route);
    const input = page.getByLabel(name, { exact: true });
    const expectedType =
      route === "number-field"
        ? "number"
        : route === "date-field"
          ? "date"
          : "time";
    await expect(input).toHaveAttribute("type", expectedType);
    if (expectedType === "date") {
      await expect(input).toHaveAttribute("min", "2026-01-01");
      await expect(input).toHaveAttribute("max", "2026-12-31");
    }
    if (expectedType === "number") {
      await expect(input).toHaveAttribute("max", "100");
      await expect(input).toHaveAttribute("step", "5");
    }
    if (expectedType === "time")
      await expect(input).toHaveAttribute("step", "900");
    const actualType = await input.evaluate((el: HTMLInputElement) => el.type);
    await input.fill(valid);
    expect(
      await input.evaluate((el: HTMLInputElement) => el.validity.valid),
    ).toBe(true);
    await input.fill(invalid);
    if (actualType === expectedType) {
      expect(
        await input.evaluate((el: HTMLInputElement) => el.validity.valid),
      ).toBe(false);
    } else {
      // Some WebKit builds expose native date/time controls as plain text.
      // The wrapper preserves attributes/values; it does not polyfill validation.
      expect(actualType).toBe("text");
      await expect(input).toHaveValue(invalid);
      test
        .info()
        .annotations.push({
          type: "browser-fallback",
          description: `${expectedType} uses text fallback; validate in the product or use DatePicker/RangeField.`,
        });
    }
    await expect(input).toHaveCSS("background-color", "rgb(255, 255, 255)");
  }
});
