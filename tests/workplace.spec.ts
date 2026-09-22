import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const framework of ["react", "vue"]) {
  test(`${framework} multiple required Selects focus the first invalid trigger`, async ({
    page,
  }) => {
    await page.goto(
      `/tests/fixtures/business.html?scenario=select-focus&framework=${framework}`,
    );
    const first = page.getByRole("combobox", {
      name: "First department",
      exact: true,
    });
    const second = page.getByRole("combobox", {
      name: "Second department",
      exact: true,
    });
    const submit = page.getByRole("button", { name: "Submit departments" });
    const result = page.getByLabel("Form result");
    await submit.click();
    await expect(first).toBeFocused();
    await expect(page.getByRole("alert")).toHaveCount(2);
    await expect(result).toBeEmpty();
    await first.click();
    await page.getByRole("option", { name: "하나", exact: true }).click();
    await submit.click();
    await expect(second).toBeFocused();
    await expect(page.getByRole("alert")).toHaveCount(1);
    await expect(result).toBeEmpty();
    await second.click();
    await page.getByRole("option", { name: "둘", exact: true }).click();
    await submit.click();
    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(result).toHaveText('[["first","one"],["second","two"]]');
  });

  test(`${framework} Select preserves controlled reset ownership and rebinds a moved external form`, async ({
    page,
  }) => {
    await page.goto(
      `/tests/fixtures/business.html?scenario=select-lifecycle&framework=${framework}`,
    );
    const controlled = page.getByRole("combobox", {
      name: "Controlled department",
    });
    const moving = page.getByRole("combobox", { name: "Moving department" });
    const result = page.getByLabel("Form result");
    await moving.click();
    await page.getByRole("option", { name: "둘", exact: true }).click();
    await page.getByRole("button", { name: "Cancel lifecycle reset" }).click();
    await page.getByRole("button", { name: "Reset A", exact: true }).click();
    await expect(moving).toContainText("둘");
    await page.getByRole("button", { name: "Submit A", exact: true }).click();
    await expect(result).toHaveText('[["controlled","two"],["moving","two"]]');
    await page.getByRole("button", { name: "Allow lifecycle reset" }).click();
    await page.getByRole("button", { name: "Reset A", exact: true }).click();
    await expect(controlled).toContainText("둘");
    await expect(moving).toContainText("하나");
    await page.getByRole("button", { name: "Submit A", exact: true }).click();
    await expect(result).toHaveText('[["controlled","two"],["moving","one"]]');
    await moving.click();
    await page.getByRole("option", { name: "둘", exact: true }).click();
    await page.getByRole("button", { name: "Move select to B" }).click();
    await page.getByRole("button", { name: "Reset A", exact: true }).click();
    await expect(moving).toContainText("둘");
    await page.getByRole("button", { name: "Submit A", exact: true }).click();
    await expect(result).toHaveText('[["controlled","two"]]');
    await page.getByRole("button", { name: "Submit B", exact: true }).click();
    await expect(result).toHaveText('[["moving","two"]]');
    await page.getByRole("button", { name: "Reset B", exact: true }).click();
    await expect(moving).toContainText("하나");
    await page.getByRole("button", { name: "Submit B", exact: true }).click();
    await expect(result).toHaveText('[["moving","one"]]');
  });

  test(`${framework} multiple required OTP fields keep focus on the first invalid input`, async ({
    page,
  }) => {
    await page.goto(
      `/tests/fixtures/business.html?scenario=otp&multiple&framework=${framework}`,
    );
    const first = page.getByRole("textbox", { name: "First OTP" });
    const second = page.getByRole("textbox", { name: "Contract OTP" });
    const submit = page.getByRole("button", { name: "Submit OTP" });
    await submit.click();
    await expect(first).toBeFocused();
    await expect(page.getByRole("alert")).toHaveCount(2);
    await expect(page.getByLabel("Form result")).toBeEmpty();
    await first.fill("123456");
    await submit.click();
    await expect(second).toBeFocused();
    await expect(page.getByRole("alert")).toHaveCount(1);
    await second.fill("654321");
    await submit.click();
    await expect(page.getByLabel("Form result")).toHaveText(
      '[["first","123456"],["code","654321"]]',
    );
  });

  test(`${framework} workplace ranges validate real dates and times, retain drafts and reject reversed intervals`, async ({
    page,
  }) => {
    await page.goto(
      `/tests/fixtures/business.html?scenario=range-form&framework=${framework}`,
    );
    const dates = page.getByRole("group", {
      name: "Contract dates",
      exact: true,
    });
    const times = page.getByRole("group", {
      name: "Contract times",
      exact: true,
    });
    const startDate = dates.getByRole("textbox", { name: "시작", exact: true });
    const endDate = dates.getByRole("textbox", { name: "종료", exact: true });
    const startTime = times.getByRole("textbox", { name: "시작", exact: true });
    const endTime = times.getByRole("textbox", { name: "종료", exact: true });
    const submit = page.getByRole("button", { name: "Submit ranges" });
    const result = page.getByLabel("Form result");
    await expect(startDate).toHaveAttribute("type", "text");
    await expect(startTime).toHaveAttribute("type", "text");
    await startDate.fill("not-a-date");
    await submit.click();
    await expect(startDate).toHaveValue("not-a-date");
    await expect(dates.getByRole("alert")).toContainText("실제 존재하는 날짜");
    await expect(result).toBeEmpty();
    await startDate.fill("2026-02-30");
    await submit.click();
    await expect(dates.getByRole("alert")).toContainText("실제 존재하는 날짜");
    await expect(result).toBeEmpty();
    await startDate.fill("2026-10-10");
    await endDate.fill("2026-10-09");
    await submit.click();
    await expect(dates.getByRole("alert")).toHaveText(
      "종료는 시작보다 빠를 수 없습니다.",
    );
    await expect(endDate).toBeFocused();
    await expect(result).toBeEmpty();
    await endDate.fill("2026-10-11");
    await startTime.fill("24:30");
    await submit.click();
    await expect(startTime).toHaveValue("24:30");
    await expect(times.getByRole("alert")).toContainText("24시간 시간을 입력");
    await expect(result).toBeEmpty();
    await startTime.fill("09:01");
    await submit.click();
    await expect(times.getByRole("alert")).toContainText("15분 간격");
    await expect(result).toBeEmpty();
    await startTime.fill("11:00");
    await submit.click();
    await expect(times.getByRole("alert")).toHaveText(
      "종료는 시작보다 빠를 수 없습니다.",
    );
    await expect(endTime).toBeFocused();
    await expect(result).toBeEmpty();
    // Compare parsed seconds, not lexical strings: these values are equal.
    await startTime.fill("09:00:00");
    await endTime.fill("09:00");
    await submit.click();
    await expect(page.getByRole("alert")).toHaveCount(0);
    const values = JSON.parse(await result.innerText()) as [string, string][];
    expect(values).toEqual([
      ["period.start", "2026-10-10"],
      ["period.end", "2026-10-11"],
      ["time.start", "09:00:00"],
      ["time.end", "09:00"],
      ["fixedDate.start", "2026-10-10"],
      ["fixedDate.end", "2026-10-11"],
      ["fixedTime.start", "09:00"],
      ["fixedTime.end", "10:00"],
    ]);
    expect(new Set(values.map(([name]) => name)).size).toBe(values.length);
    for (const label of ["Readonly dates", "Readonly times"]) {
      const group = page.getByRole("group", { name: label, exact: true });
      await expect(
        group.getByRole("textbox", { name: "시작", exact: true }),
      ).toHaveAttribute("readonly");
      await expect(
        group.getByRole("textbox", { name: "종료", exact: true }),
      ).toHaveAttribute("readonly");
      for (const button of await group.getByRole("button").all())
        await expect(button).toBeDisabled();
    }
    for (const label of ["Disabled dates", "Disabled times"]) {
      const group = page.getByRole("group", { name: label, exact: true });
      await expect(
        group.getByRole("textbox", { name: "시작", exact: true }),
      ).toBeDisabled();
      await expect(
        group.getByRole("textbox", { name: "종료", exact: true }),
      ).toBeDisabled();
    }
    await page.getByRole("button", { name: "Reset ranges" }).click();
    await expect(startDate).toHaveValue("2026-10-10");
    await expect(endDate).toHaveValue("2026-10-11");
    await expect(startTime).toHaveValue("09:00");
    await expect(endTime).toHaveValue("10:00");
    await expect(result).toBeEmpty();
    await startDate.fill("");
    await submit.click();
    await expect(dates.getByRole("alert")).toHaveText("날짜를 입력해 주세요.");
    await expect(result).toBeEmpty();
    await page.getByRole("button", { name: "Reset ranges" }).click();
    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(startDate).toHaveValue("2026-10-10");
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });

  test(`${framework} external Select blocks missing value, submits once and resets through its form owner`, async ({
    page,
  }) => {
    await page.goto(
      `/tests/fixtures/business.html?scenario=external-select&framework=${framework}`,
    );
    const select = page.getByRole("combobox", { name: "External department" });
    const submit = page.getByRole("button", { name: "Submit external select" });
    const result = page.getByLabel("Form result");
    await submit.click();
    await expect(select).toBeFocused();
    await expect(page.getByRole("alert")).toHaveText("항목을 선택해 주세요.");
    await expect(result).toBeEmpty();
    await select.click();
    await page.getByRole("option", { name: "하나", exact: true }).click();
    await submit.click();
    await expect(result).toHaveText('[["team","one"]]');
    await expect(
      page.getByRole("combobox", { name: "Disabled department" }),
    ).toBeDisabled();
    await page.getByRole("button", { name: "Reset external select" }).click();
    await expect(select).toContainText("선택하세요");
    await expect(result).toBeEmpty();
    await submit.click();
    await expect(result).toBeEmpty();
    await expect(select).toHaveAttribute("aria-invalid", "true");
    await select.click();
    await page.getByRole("option", { name: "둘", exact: true }).click();
    await submit.click();
    await expect(result).toHaveText('[["team","two"]]');
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
}
