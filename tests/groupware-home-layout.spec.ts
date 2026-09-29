import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("work home keeps readable task and schedule spacing at desktop, tablet and mobile widths", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#/examples");
  const home = page.getByRole("main", { name: "업무 홈", exact: true });
  await expect(home).toBeVisible();
  await page.evaluate(() => document.fonts.ready);

  for (const width of [1440, 1280, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    // Undefined spacing variables compute to zero/normal without causing a
    // JavaScript error. Check the actual painted gutters, not just visibility.
    const cards = await home
      .locator(".groupware-task-link")
      .evaluateAll((links) =>
        links.map((link) => {
          const card = link.getBoundingClientRect();
          const copy = link
            .querySelector(".groupware-task-copy")!
            .getBoundingClientRect();
          const icon = link
            .querySelector(":scope > svg")!
            .getBoundingClientRect();
          return {
            left: copy.left - card.left,
            top: copy.top - card.top,
            bottom: card.bottom - copy.bottom,
            right: card.right - icon.right,
            gap: icon.left - copy.right,
          };
        }),
      );
    expect(cards).toHaveLength(3);
    for (const card of cards) {
      for (const [edge, gap] of Object.entries(card)) {
        expect(gap, `${width}px task ${edge} gutter`).toBeGreaterThanOrEqual(
          15,
        );
      }
    }
    const scheduleGaps = await home
      .locator(".groupware-schedule > div")
      .evaluateAll((rows) =>
        rows
          .slice(1)
          .map(
            (row, i) =>
              row.getBoundingClientRect().top -
              rows[i].getBoundingClientRect().bottom,
          ),
      );
    for (const gap of scheduleGaps)
      expect(gap, `${width}px schedule row gap`).toBeGreaterThanOrEqual(16);

    const sections = await home
      .locator(".groupware-dashboard-section")
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          const r = node.getBoundingClientRect();
          return { left: r.left, top: r.top, bottom: r.bottom, right: r.right };
        }),
      );
    if (width <= 1100)
      expect(sections[1].top).toBeGreaterThan(sections[0].bottom);
    else expect(sections[1].left).toBeGreaterThan(sections[0].right);

    if (
      testInfo.project.name === "chromium" &&
      [1440, 1024, 390].includes(width)
    ) {
      await page.screenshot({
        path: `artifacts/groupware-home-fixed-${width}.png`,
        fullPage: true,
      });
    }
  }
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await home.locator(".groupware-task-link").first().focus();
  await expect(home.locator(".groupware-task-link").first()).toHaveCSS(
    "outline-style",
    "solid",
  );
  expect(errors).toEqual([]);
});
