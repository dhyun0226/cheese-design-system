import { test, expect } from "@playwright/test";

for (const framework of ["react", "vue"]) {
  test(`${framework} switch is borderless in both states and keeps keyboard focus`, async ({
    page,
  }) => {
    await page.goto(
      framework === "react" ? "/#/components/switch" : "/vue.html",
    );
    const toggle = page.getByRole("switch", {
      name: "이메일 알림",
      exact: true,
    });
    const thumb = toggle.locator(".cheese-switch-thumb");
    await expect(toggle).not.toBeChecked();
    await expect(toggle).toHaveCSS("border-color", "rgba(0, 0, 0, 0)");
    await expect(thumb).toHaveCSS("box-shadow", "none");
    await toggle.hover();
    await expect(toggle).toHaveCSS("border-color", "rgba(0, 0, 0, 0)");
    await toggle.click();
    await expect(toggle).toBeChecked();
    await expect(toggle).toHaveCSS("border-color", "rgba(0, 0, 0, 0)");
    await expect(toggle).toHaveCSS("background-color", "rgb(255, 201, 40)");
    await expect(thumb).toHaveCSS("transform", "matrix(1, 0, 0, 1, 16, 0)");
    await expect(thumb).toHaveCSS("box-shadow", "none");
    if (framework === "react") {
      await expect(
        page.getByRole("switch", { name: "보안 알림 (필수)" }),
      ).toBeDisabled();
      await page.locator(".demo-stage").screenshot({
        path: `artifacts/${test.info().project.name}/borderless-switch-on.png`,
      });
    }
    await page.keyboard.press("Tab");
    await toggle.focus();
    await expect(toggle).toHaveCSS("outline-color", "rgb(255, 201, 40)");
    await expect(toggle).toHaveCSS("outline-width", "2px");
    await page.keyboard.press("Space");
    await expect(toggle).not.toBeChecked();
    await expect(thumb).toHaveCSS("transform", "none");
    await page.keyboard.press("Tab");
    await expect(toggle).toHaveCSS("box-shadow", "none");
    if (framework === "react") {
      await page.locator(".demo-stage").screenshot({
        path: `artifacts/${test.info().project.name}/borderless-switch-off.png`,
      });
    }
    await page.emulateMedia({ contrast: "more" });
    // Firefox's emulated media query changes immediately, but selector styles
    // may stay cached. Verify the requested OS preference on a fresh document.
    await page.reload();
    expect(
      await page.evaluate(() => matchMedia("(prefers-contrast: more)").matches),
    ).toBe(true);
    await expect(toggle).toHaveCSS("border-color", "rgb(98, 98, 105)");
  });
}

test("toggle buttons and groups have no selected underline or perimeter", async ({
  page,
}) => {
  for (const [route, name] of [
    ["toggle", "즐겨찾기"],
    ["toggle-group", "진행 중"],
    ["toolbar", "굵게"],
  ]) {
    await page.goto("/#/components/" + route);
    const target = page
      .locator(".demo-stage")
      .getByRole(route === "toggle-group" ? "radio" : "button", {
        name,
        exact: true,
      });
    await expect(target).toHaveAttribute("data-state", "off");
    await target.click();
    await expect(target).toHaveAttribute("data-state", "on");
    // Clear pointer focus so this assertion checks selection, not the keyboard ring.
    await page.locator("main h1").click();
    await expect(target).toHaveCSS("border-color", "rgba(0, 0, 0, 0)");
    await expect(target).toHaveCSS("box-shadow", "none");
    await expect(target).toHaveCSS("font-weight", "600");
    await expect(target).toHaveCSS("background-color", "rgb(255, 243, 204)");
    await page.locator(".demo-stage").screenshot({
      path: `artifacts/${test.info().project.name}/borderless-${route}.png`,
    });
    await target.focus();
    await page.keyboard.press("Space");
    await expect(target).toHaveAttribute("data-state", "off");
  }
});
