import { test, expect } from "@playwright/test";

for (const framework of ["react", "vue"]) {
  test(`${framework} scroll region is named, focusable and keyboard scrollable`, async ({
    page,
  }) => {
    await page.goto(`/tests/fixtures/scrollbars.html?framework=${framework}`);
    const region = page.getByRole("region", { name: "업무 목록", exact: true });
    await expect(region).toHaveAttribute("tabindex", "0");
    await expect(region).toHaveAttribute("aria-describedby", "scroll-help");
    await expect(region).toHaveClass(/consumer-viewport/);
    await expect(page.getByTestId("vertical")).toHaveCSS("height", "200px");
    await expect(page.getByTestId("vertical")).toHaveClass(/consumer-region/);
    // The overflow indicator must be visible before hover, not an undiscoverable track.
    await expect(
      page.getByTestId("vertical").locator(".cheese-scroll-thumb"),
    ).toBeVisible();
    await region.focus();
    await region.press("PageDown");
    await expect
      .poll(() => region.evaluate((el) => el.scrollTop))
      .toBeGreaterThan(0);
    await expect(region).toHaveCSS("outline-style", "solid");
    await page.getByRole("button", { name: "목록 중간으로 이동" }).click();
    await expect.poll(() => region.evaluate((el) => el.scrollTop)).toBe(160);
    await expect(
      page.getByTestId("fits").locator(".cheese-scrollbar"),
    ).toHaveCount(0);
  });

  test(`${framework} horizontal and two-axis areas support native scrolling`, async ({
    page,
  }) => {
    await page.goto(`/tests/fixtures/scrollbars.html?framework=${framework}`);
    const horizontal = page.getByRole("region", {
      name: "가로 일정",
      exact: true,
    });
    const horizontalTrack = page
      .getByTestId("horizontal")
      .locator('.cheese-scrollbar[data-orientation="horizontal"]');
    await expect(horizontalTrack).toBeVisible();
    await expect(horizontalTrack).toHaveCSS("height", "16px");
    await expect(
      page
        .getByTestId("horizontal")
        .locator('.cheese-scrollbar[data-orientation="vertical"]'),
    ).toHaveCount(0);
    await horizontal.focus();
    await horizontal.press("ArrowRight");
    await expect
      .poll(() => horizontal.evaluate((el) => el.scrollLeft))
      .toBeGreaterThan(0);
    const both = page.getByRole("region", { name: "전체 현황", exact: true });
    await expect(
      page.getByTestId("both").locator(".cheese-scrollbar"),
    ).toHaveCount(2);
    await both.focus();
    await both.press("PageDown");
    await expect
      .poll(() => both.evaluate((el) => el.scrollTop))
      .toBeGreaterThan(0);
    await both.press("ArrowRight");
    await expect
      .poll(() => both.evaluate((el) => el.scrollLeft))
      .toBeGreaterThan(0);
  });

  test(`${framework} visible vertical and horizontal thumbs are draggable`, async ({
    page,
  }) => {
    await page.goto(`/tests/fixtures/scrollbars.html?framework=${framework}`);
    for (const [testId, label, axis] of [
      ["vertical", "업무 목록", "vertical"],
      ["horizontal", "가로 일정", "horizontal"],
    ] as const) {
      const region = page.getByRole("region", { name: label, exact: true });
      const thumb = page.getByTestId(testId).locator(".cheese-scroll-thumb");
      await expect(thumb).toBeVisible();
      await thumb.scrollIntoViewIfNeeded();
      const box = await thumb.boundingBox();
      expect(box).not.toBeNull();
      const x = box!.x + box!.width / 2;
      const y = box!.y + box!.height / 2;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(
        x + (axis === "horizontal" ? 80 : 0),
        y + (axis === "vertical" ? 70 : 0),
        { steps: 8 },
      );
      await page.mouse.up();
      await expect
        .poll(() =>
          region.evaluate(
            (el, direction) =>
              direction === "vertical" ? el.scrollTop : el.scrollLeft,
            axis,
          ),
        )
        .toBeGreaterThan(0);
    }
  });

  test(`${framework} native overflow inherits the theme without styling unrelated containers`, async ({
    page,
    browserName,
  }) => {
    await page.goto(`/tests/fixtures/scrollbars.html?framework=${framework}`);
    const theme = await page.getByTestId("native").evaluate((el) => ({
      pseudo: CSS.supports("selector(::-webkit-scrollbar)"),
      color: getComputedStyle(el).scrollbarColor,
    }));
    if (!theme.pseudo) {
      expect(theme.color).toBe("rgb(139, 139, 144) rgba(0, 0, 0, 0)");
      await expect(page.getByRole("textbox", { name: "업무 메모" })).toHaveCSS(
        "scrollbar-color",
        theme.color,
      );
      await expect(page.getByTestId("outside")).toHaveCSS(
        "scrollbar-color",
        "auto",
      );
    } else {
      // Non-auto standard colors silently bypass the pseudo-element theme.
      // Check the actual rendering properties, not just the existence of CSS.
      expect(theme.color || "auto").toBe("auto");
      for (const container of [
        page.getByTestId("native"),
        page.getByRole("textbox", { name: "업무 메모" }),
      ]) {
        const shape = await container.evaluate((el) => ({
          width: getComputedStyle(el, "::-webkit-scrollbar").width,
          thumb: getComputedStyle(el, "::-webkit-scrollbar-thumb")
            .backgroundColor,
          radius: getComputedStyle(el, "::-webkit-scrollbar-thumb")
            .borderRadius,
          arrows: getComputedStyle(el, "::-webkit-scrollbar-button").display,
        }));
        expect(shape).toEqual({
          width: "14px",
          thumb: "rgb(139, 139, 144)",
          radius: "999px",
          arrows: "none",
        });
      }
      const outside = await page
        .getByTestId("outside")
        .evaluate(
          (el) =>
            getComputedStyle(el, "::-webkit-scrollbar-thumb").backgroundColor,
        );
      expect(outside).not.toBe("rgb(139, 139, 144)");
    }
    await page.getByRole("region", { name: "업무 목록", exact: true }).hover();
    await page.mouse.wheel(0, 180);
    await expect
      .poll(() =>
        page
          .getByRole("region", { name: "업무 목록", exact: true })
          .evaluate((el) => el.scrollTop),
      )
      .toBeGreaterThan(0);
    await page.screenshot({
      path: `artifacts/${browserName}/scrollareas-${framework}.png`,
      fullPage: true,
    });
  });

  test(`${framework} forced colors restores native scrollbars and reduced motion stays immediate`, async ({
    page,
  }) => {
    await page.emulateMedia({
      forcedColors: "active",
      reducedMotion: "reduce",
    });
    await page.goto(`/tests/fixtures/scrollbars.html?framework=${framework}`);
    const region = page.getByRole("region", { name: "업무 목록", exact: true });
    await expect(region).toHaveCSS("scroll-behavior", "auto");
    const supported = await page.evaluate(
      () => matchMedia("(forced-colors: active)").matches,
    );
    test.skip(!supported, "This browser does not emulate forced-color mode.");
    const nativeWidth = await page
      .getByTestId("outside")
      .evaluate((el) => getComputedStyle(el).scrollbarWidth);
    if (nativeWidth === "none") {
      // Some Firefox test builds report `none` even on about:blank, including
      // when the winning author declaration is auto!important. Verify both
      // the authored restoration and equality to the unstyled native default;
      // do not skip forced-colors behavior or accept a missing restoration.
      const restoresNative = await region.evaluate((element) => {
        function visit(rules: CSSRuleList, forced = false): boolean {
          return Array.from(rules).some((rule) => {
            if (rule instanceof CSSMediaRule) {
              return (
                matchMedia(rule.conditionText).matches &&
                visit(
                  rule.cssRules,
                  forced || rule.conditionText.includes("forced-colors"),
                )
              );
            }
            if (rule instanceof CSSSupportsRule) {
              return (
                CSS.supports(rule.conditionText) && visit(rule.cssRules, forced)
              );
            }
            if (
              rule instanceof CSSStyleRule &&
              forced &&
              rule.style.getPropertyValue("scrollbar-width") === "auto" &&
              rule.style.getPropertyPriority("scrollbar-width") === "important"
            ) {
              return element.matches(rule.selectorText);
            }
            return false;
          });
        }
        return Array.from(document.styleSheets).some((sheet) =>
          visit(sheet.cssRules),
        );
      });
      expect(restoresNative).toBe(true);
      test.info().annotations.push({
        type: "platform",
        description:
          "Engine reports scrollbar-width:none for unstyled native elements; matching forced-colors auto!important declaration verified.",
      });
    }
    await expect(region).toHaveCSS("scrollbar-width", nativeWidth);
    const standardColor = await page.evaluate(() =>
      CSS.supports("scrollbar-color", "auto"),
    );
    if (standardColor) {
      await expect(region).toHaveCSS("scrollbar-color", "auto");
    } else {
      // This WebKit build supports forced colors but not scrollbar-color.
      // Verify its actual pseudo-element fallback: visible native scrollbar
      // and thumb decoration reset to the unstyled browser defaults.
      const fallback = await region.evaluate((el) => ({
        display: getComputedStyle(el, "::-webkit-scrollbar").display,
        thumb: getComputedStyle(el, "::-webkit-scrollbar-thumb")
          .backgroundColor,
        radius: getComputedStyle(el, "::-webkit-scrollbar-thumb").borderRadius,
      }));
      const nativeThumb = await page.getByTestId("outside").evaluate((el) => ({
        thumb: getComputedStyle(el, "::-webkit-scrollbar-thumb")
          .backgroundColor,
        radius: getComputedStyle(el, "::-webkit-scrollbar-thumb").borderRadius,
      }));
      expect(fallback).toEqual({ display: "block", ...nativeThumb });
      test.info().annotations.push({
        type: "platform",
        description:
          "scrollbar-color unsupported; native WebKit pseudo-element restoration verified instead.",
      });
    }
    await expect(
      page.getByTestId("vertical").locator(".cheese-scrollbar"),
    ).toBeHidden();
    await region.focus();
    await region.press("PageDown");
    await expect
      .poll(() => region.evaluate((el) => el.scrollTop))
      .toBeGreaterThan(0);
  });
}
