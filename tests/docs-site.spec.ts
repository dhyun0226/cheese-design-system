import { test, expect } from "@playwright/test";

test("home credits the original STARSHIP logo without changing its proportions", async ({
  page,
}) => {
  for (const width of [1440, 900, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const logo = page.getByRole("img", {
      name: "STARSHIP Entertainment 공식 로고",
    });
    await expect(logo).toBeVisible();
    await expect
      .poll(() =>
        logo.evaluate(
          (img: HTMLImageElement) =>
            img.complete &&
            img.naturalWidth === 400 &&
            img.naturalHeight === 107,
        ),
      )
      .toBe(true);
    const box = await logo.boundingBox();
    expect(box!.width / box!.height).toBeCloseTo(400 / 107, 1);
    const scene = await page.locator(".origin-scene").boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(scene!.x);
    expect(box!.x + box!.width).toBeLessThanOrEqual(scene!.x + scene!.width);
    const cheese = await page.locator(".origin-cheese").last().boundingBox();
    const caption = await page.locator(".origin-caption").boundingBox();
    expect(cheese!.y + cheese!.height).toBeLessThan(caption!.y);
    await expect(page.getByRole("link", { name: /로고 출처/ })).toHaveAttribute(
      "href",
      "https://www.starship-ent.com/about",
    );
    await expect(page.locator(".origin-note")).toContainText(
      "승인된 제품은 아닙니다",
    );
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);
  }
});

test("component navigation keeps the title, selection and section links in sync", async ({
  page,
}) => {
  await page.goto("/#/components/native-select");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Select Form",
  );
  const sidebar = page.getByRole("complementary", { name: "문서 사이드바" });
  await expect(sidebar.locator('a[aria-current="page"]')).toHaveText(
    "Select Form",
  );
  await sidebar.getByRole("textbox", { name: "컴포넌트 검색" }).fill("Toolbar");
  await sidebar.getByRole("link", { name: "Toolbar", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Toolbar");
  await expect(sidebar.locator('a[aria-current="page"]')).toHaveText("Toolbar");
  await expect(
    page
      .getByRole("navigation", { name: "주요 문서" })
      .locator('a[aria-current="page"]'),
  ).toHaveText("컴포넌트");
  await page
    .getByRole("navigation", { name: "이 페이지에서" })
    .getByRole("link", { name: "주요 API" })
    .click();
  await expect(
    page.getByRole("heading", { name: "주요 API", exact: true }),
  ).toBeFocused();
  await expect(page).toHaveURL(/#\/components\/toolbar$/);
  await page.getByRole("tab", { name: "코드", exact: true }).click();
  await expect(page.locator(".code-block code")).toContainText("@cheese/react");
  await expect(
    page.getByRole("button", { name: "복사", exact: true }),
  ).toBeVisible();
});

test("mobile documentation search navigates and closes the drawer", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  await expect(page.locator(".origin-story")).toContainText(
    "문을 열고 나와 보니",
  );
  await expect(page.locator(".origin-story")).toContainText("제작자가 상상한");
  await page.getByRole("button", { name: "메뉴 열기" }).click();
  const drawer = page.getByRole("dialog", { name: "문서 탐색" });
  await drawer
    .getByRole("textbox", { name: "컴포넌트 검색" })
    .fill("Pagination");
  await drawer.getByRole("link", { name: "Pagination", exact: true }).click();
  await expect(drawer).not.toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Pagination",
  );
  await expect(page.locator(".demo-stage")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
});

test("the active component scrolls inside the desktop sidebar without moving the page", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto("/#/components/time-field");
  const sidebar = page.getByRole("complementary", { name: "문서 사이드바" });
  const current = sidebar.locator('a[aria-current="page"]');
  await expect(current).toHaveText("Time Field");
  await expect
    .poll(() =>
      sidebar.evaluate((element) => {
        const selected = element.querySelector('a[aria-current="page"]');
        if (!selected) return false;
        const viewport = element.getBoundingClientRect();
        const item = selected.getBoundingClientRect();
        return (
          element.scrollTop > 0 &&
          item.top >= viewport.top &&
          item.bottom <= viewport.bottom
        );
      }),
    )
    .toBe(true);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.evaluate(() => {
    location.hash = "/components/button";
  });
  await expect(current).toHaveText("Button");
  await expect
    .poll(() =>
      sidebar.evaluate((element) => {
        const selected = element.querySelector('a[aria-current="page"]');
        if (!selected) return false;
        const viewport = element.getBoundingClientRect();
        const item = selected.getBoundingClientRect();
        return item.top >= viewport.top && item.bottom <= viewport.bottom;
      }),
    )
    .toBe(true);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});
