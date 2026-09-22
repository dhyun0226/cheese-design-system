import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";

function visibleSvgViewportBounds(svg: SVGSVGElement) {
  // Project the clipping viewport from parent coordinates, independent of the
  // nested SVG's viewBox transform and its oversized image content bounds.
  const x = svg.x.baseVal.value;
  const y = svg.y.baseVal.value;
  const width = svg.width.baseVal.value;
  const height = svg.height.baseVal.value;
  const parent = svg.parentElement;
  if (!(parent instanceof SVGGraphicsElement)) {
    throw new Error("The rocket viewport has no SVG parent");
  }
  const matrix = parent.getScreenCTM();
  if (!matrix) throw new Error("The rocket viewport has no screen transform");
  const corners = [
    new DOMPoint(x, y),
    new DOMPoint(x + width, y),
    new DOMPoint(x, y + height),
    new DOMPoint(x + width, y + height),
  ].map((point) => point.matrixTransform(matrix));
  const left = Math.min(...corners.map((point) => point.x));
  const top = Math.min(...corners.map((point) => point.y));
  const right = Math.max(...corners.map((point) => point.x));
  const bottom = Math.max(...corners.map((point) => point.y));
  return {
    x: left,
    y: top,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
  };
}

test("home shows only the A rocket from the original source without covering the moon", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1440, 900, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(
      page.getByRole("img", {
        name: "STARSHIP 로고의 A 모양 우주선이 치즈 달을 향해 올라가는 장면",
      }),
    ).toBeVisible();
    const rocket = page.locator(".origin-rocket");
    await expect(rocket).toHaveAttribute("viewBox", "100 10 50 90");
    await expect(rocket).toHaveAttribute("overflow", "hidden");
    await expect(page.locator(".origin-starship-logo")).toHaveCount(0);
    await expect(page.locator(".origin-flight")).toHaveCSS(
      "animation-name",
      "none",
    );
    if (width === 1440) {
      const source = (await rocket.locator("image").getAttribute("href"))!;
      const bytes = source.startsWith("data:")
        ? Buffer.from(source.split(",")[1], "base64")
        : await (
            await page.request.get(new URL(source, page.url()).href)
          ).body();
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(
        "e0d5e68aa4988f5f067db931e71d11e35b700cd3bb942efbe1e9048f7daded8a",
      );
    }
    const box = await rocket.evaluate(visibleSvgViewportBounds);
    const scene = await page.locator(".origin-scene").boundingBox();
    const moon = await page.locator(".origin-moon").boundingBox();
    const coordinate = await page.locator(".origin-coordinate").boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(scene!.x);
    expect(box.right).toBeLessThanOrEqual(scene!.x + scene!.width);
    expect(box.right).toBeLessThan(moon!.x);
    expect(box.y).toBeGreaterThan(coordinate!.y + coordinate!.height);
    const cheese = await page.locator(".origin-cheese").last().boundingBox();
    const caption = await page.locator(".origin-caption").boundingBox();
    expect(box.bottom).toBeLessThan(caption!.y);
    expect(cheese!.y + cheese!.height).toBeLessThan(caption!.y);
    await expect(
      page.getByRole("link", { name: /우주선 원본/ }),
    ).toHaveAttribute("href", "https://www.starship-ent.com/about");
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

test("rocket launch runs once upward and remains visible at both ends", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const width of [1440, 900, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const flight = page.locator(".origin-flight");
    const rocket = page.locator(".origin-rocket");
    await expect(flight).toHaveCSS("animation-name", "cheese-origin-launch");
    const motion = await flight.evaluate(async (element) => {
      const animation = element.getAnimations()[0];
      animation.pause();
      await animation.ready;
      const timing = animation.effect!.getTiming();
      animation.currentTime = 0;
      return {
        duration: timing.duration,
        iterations: timing.iterations,
        fill: timing.fill,
      };
    });
    const start = await rocket.evaluate(visibleSvgViewportBounds);
    await flight.evaluate((element) => {
      const animation = element.getAnimations()[0];
      animation.currentTime = animation.effect!.getComputedTiming()
        .endTime as number;
    });
    const end = await rocket.evaluate(visibleSvgViewportBounds);
    await flight.evaluate((element) => element.getAnimations()[0].finish());
    expect(motion.iterations).toBe(1);
    expect(motion.duration).toBe(2200);
    expect(motion.fill).toBe("both");
    expect(end.y).toBeLessThan(start.y);
    const scene = await page.locator(".origin-scene").boundingBox();
    const caption = await page.locator(".origin-caption").boundingBox();
    const coordinate = await page.locator(".origin-coordinate").boundingBox();
    const moon = await page.locator(".origin-moon").boundingBox();
    for (const box of [start, end]) {
      expect(box.x).toBeGreaterThanOrEqual(scene!.x);
      expect(box.right).toBeLessThanOrEqual(scene!.x + scene!.width);
      expect(box.right).toBeLessThan(moon!.x);
      expect(box.y).toBeGreaterThan(coordinate!.y + coordinate!.height);
      expect(box.bottom).toBeLessThan(caption!.y);
    }
    if (width === 1440) {
      await flight.evaluate(async (element) => {
        const animation = element.getAnimations()[0];
        animation.currentTime = 0;
        animation.play();
        await animation.finished;
      });
      await expect(flight).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
    }
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
