import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

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

test("home shows the original A rocket as a vector with a readable responsive illustration", async ({
  page,
}) => {
  const original = await readFile(
    join(__dirname, "../site/assets/starship-logo.png"),
  );
  expect(createHash("sha256").update(original).digest("hex")).toBe(
    "e0d5e68aa4988f5f067db931e71d11e35b700cd3bb942efbe1e9048f7daded8a",
  );
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
    const drawing = rocket.locator("use");
    await expect
      .poll(() =>
        drawing.evaluate((element: SVGUseElement) => {
          const box = element.getBBox();
          return box.width * box.height;
        }),
      )
      .toBeGreaterThan(0);
    if (width === 1440) {
      const source = (await drawing.getAttribute("href"))!;
      const asset = await page.evaluate(async (reference) => {
        const url = new URL(reference, window.location.href);
        const fragment = decodeURIComponent(url.hash.slice(1));
        url.hash = "";
        const response = await fetch(url);
        if (!response.ok) throw new Error("The rocket asset failed to load");
        const document = new DOMParser().parseFromString(
          await response.text(),
          "image/svg+xml",
        );
        const target = document.getElementById(fragment);
        const vectorShapes =
          "path, polygon, polyline, circle, ellipse, rect, line";
        return {
          root: document.documentElement.localName,
          fragment,
          targetHasGeometry:
            !!target &&
            (target.matches(vectorShapes) ||
              !!target.querySelector(vectorShapes)),
          embeddedImages: document.querySelectorAll(
            "image, feImage, foreignObject",
          ).length,
        };
      }, source);
      expect(asset.root).toBe("svg");
      expect(asset.fragment).toBe("rocket");
      expect(asset.targetHasGeometry).toBe(true);
      expect(asset.embeddedImages).toBe(0);
    }
    const box = await rocket.evaluate(visibleSvgViewportBounds);
    const scene = await page.locator(".origin-scene").boundingBox();
    const moon = await page.locator(".origin-moon").boundingBox();
    const kicker = await page.locator(".origin-kicker").boundingBox();
    const caption = await page.locator(".origin-caption").boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(scene!.x);
    expect(box.right).toBeLessThanOrEqual(scene!.x + scene!.width);
    expect(box.y).toBeGreaterThanOrEqual(scene!.y);
    expect(box.bottom).toBeLessThanOrEqual(scene!.y + scene!.height);
    expect(kicker!.y + kicker!.height).toBeLessThanOrEqual(scene!.y);
    expect(scene!.y + scene!.height).toBeLessThanOrEqual(caption!.y);
    expect(box.bottom).toBeLessThan(caption!.y);
    expect(moon!.y + moon!.height).toBeLessThan(caption!.y);
    await expect(
      page.getByRole("link", { name: /우주선 원본/ }),
    ).toHaveAttribute("href", "https://www.starship-ent.com/about");
    await expect(page.locator(".origin-note")).toContainText("개인 프로젝트");
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);
  }
});

test("rocket launches once toward the moon and reduced motion keeps its final position", async ({
  page,
}) => {
  for (const width of [1440, 900, 390, 320]) {
    await page.emulateMedia({ reducedMotion: "no-preference" });
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
    expect(end.x).toBeGreaterThan(start.x);
    const scene = await page.locator(".origin-scene").boundingBox();
    const caption = await page.locator(".origin-caption").boundingBox();
    const moon = await page.locator(".origin-moon").boundingBox();
    const distanceToMoon = (box: typeof start) =>
      Math.hypot(
        box.x + box.width / 2 - (moon!.x + moon!.width / 2),
        box.y + box.height / 2 - (moon!.y + moon!.height / 2),
      );
    expect(distanceToMoon(end)).toBeLessThan(distanceToMoon(start));
    for (const box of [start, end]) {
      expect(box.x).toBeGreaterThanOrEqual(scene!.x);
      expect(box.right).toBeLessThanOrEqual(scene!.x + scene!.width);
      expect(box.y).toBeGreaterThanOrEqual(scene!.y);
      expect(box.bottom).toBeLessThanOrEqual(scene!.y + scene!.height);
      expect(box.bottom).toBeLessThan(caption!.y);
    }
    if (width === 1440) {
      await flight.evaluate(async (element) => {
        const animation = element.getAnimations()[0];
        animation.currentTime = 0;
        animation.play();
        await animation.finished;
      });
      const settled = await rocket.evaluate(visibleSvgViewportBounds);
      expect(settled.x).toBeCloseTo(end.x, 1);
      expect(settled.y).toBeCloseTo(end.y, 1);
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(flight).toHaveCSS("animation-name", "none");
    const reduced = await rocket.evaluate(visibleSvgViewportBounds);
    expect(reduced.x).toBeCloseTo(end.x, 1);
    expect(reduced.y).toBeCloseTo(end.y, 1);
  }
});

test("home guides visitors into the docs and its evaluation example updates after submission", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .locator(".home-hero")
    .getByRole("link", { name: "시작하기", exact: true })
    .click();
  await expect(page).toHaveURL(/#\/getting-started$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "작게 시작하세요.",
  );
  await page.getByRole("link", { name: "CHEESE 홈", exact: true }).click();
  await expect(page).toHaveURL(/#\/$/);
  await expect(page.locator(".home-hero")).toBeVisible();

  const showcase = page.locator(".home-showcase");
  const showcaseBox = await showcase.boundingBox();
  const componentsBox = await page.locator(".explore-grid").boundingBox();
  expect(showcaseBox!.y).toBeLessThan(componentsBox!.y);
  const progress = showcase.getByRole("progressbar", {
    name: "팀 평가 진행률",
  });
  const submitted = showcase
    .locator(".product-stats > div")
    .filter({ hasText: "제출 완료" })
    .locator("strong");
  await expect(progress).toHaveAttribute("aria-valuenow", "75");
  await expect(submitted).toHaveText(/^18\s*명$/);
  await showcase.getByRole("button", { name: "검토하기", exact: true }).click();
  const dialog = page.getByRole("dialog", {
    name: "평가 제출 전 확인",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "예제 제출", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(progress).toHaveAttribute("aria-valuenow", "79");
  await expect(submitted).toHaveText(/^19\s*명$/);
  await expect(showcase.locator(".product-task")).toContainText(
    "검토가 완료되었습니다.",
  );
  await expect(
    showcase.getByRole("button", { name: "다시 보기", exact: true }),
  ).toBeVisible();
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
  await expect(page.locator(".origin-story")).toContainText("개인 프로젝트");
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
