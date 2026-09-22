import { test, expect, type Locator } from "@playwright/test";

async function expectPointerOption(option: Locator) {
  await expect(option).toBeFocused();
  await expect(option).toHaveCSS("outline-style", "none");
  await expect(option).toHaveCSS("box-shadow", "none");
}

async function expectKeyboardOption(option: Locator) {
  await expect(option).toBeFocused();
  await expect(option).toHaveCSS("outline-style", "solid");
  await expect(option).toHaveCSS("outline-width", "2px");
  await expect(option).toHaveCSS("outline-offset", "-2px");
}

for (const clickInputFirst of [false, true]) {
  test(`home assignee mouse options have no keyboard ring ${clickInputFirst ? "after clicking its input" : "on the first interaction"}`, async ({
    page,
  }) => {
    await page.goto("/");
    const demo = page.locator(".hero-playground");
    const title = demo.getByRole("textbox", { name: "업무 이름" });
    if (clickInputFirst) {
      await title.click();
      await expect(title).toBeFocused();
    }
    // Keep this click the first input event in the fresh-page regression.
    await demo.getByRole("combobox", { name: "담당자", exact: true }).click();
    const current = page.getByRole("option", {
      name: "김치즈 · 피플팀",
      exact: true,
    });
    await expectPointerOption(current);
    const next = page.getByRole("option", {
      name: "이서준 · 개발팀",
      exact: true,
    });
    await next.hover();
    await expectPointerOption(next);
    await next.click();
    await expect(
      demo.getByRole("combobox", { name: "담당자", exact: true }),
    ).toHaveText("이서준 · 개발팀");
  });
}

test("home assignee changes its option ring when keyboard and mouse navigation alternate", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page
    .locator(".hero-playground")
    .getByRole("combobox", { name: "담당자", exact: true });
  await trigger.press("ArrowDown");
  const current = page.getByRole("option", {
    name: "김치즈 · 피플팀",
    exact: true,
  });
  const next = page.getByRole("option", {
    name: "이서준 · 개발팀",
    exact: true,
  });
  await expectKeyboardOption(current);
  // Repositioning a popup may emit a pointer event without user movement.
  await current.dispatchEvent("pointermove", {
    pointerType: "mouse",
    movementX: 0,
    movementY: 0,
  });
  await expectKeyboardOption(current);
  await next.hover();
  await expectPointerOption(next);
  await page.keyboard.press("ArrowUp");
  await expectKeyboardOption(current);
  await page.emulateMedia({ forcedColors: "active" });
  await expectKeyboardOption(current);
  await expect(current).toHaveCSS("box-shadow", "none");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("listbox")).toHaveCount(0);
});

for (const framework of ["react", "vue"]) {
  test(`${framework} Select restores keyboard rings after pointer opening and clears them on mouse movement`, async ({
    page,
  }) => {
    await page.goto(
      `/tests/fixtures/business.html?scenario=external-select&framework=${framework}`,
    );
    const trigger = page.getByRole("combobox", {
      name: "External department",
      exact: true,
    });
    const first = page.getByRole("option", { name: "하나", exact: true });
    const second = page.getByRole("option", { name: "둘", exact: true });

    await trigger.click();
    await expectPointerOption(first);
    await page.keyboard.press("ArrowDown");
    await expectKeyboardOption(second);
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
    await expect(page.getByRole("listbox")).toHaveCount(0);

    await trigger.press("ArrowDown");
    await expectKeyboardOption(first);
    await second.hover();
    await expectPointerOption(second);
    await page.keyboard.press("ArrowUp");
    await expectKeyboardOption(first);
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveText("하나");
    await expect(trigger).toBeFocused();
  });
}
