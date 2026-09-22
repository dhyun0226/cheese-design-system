import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
const target = process.argv[2] || "http://127.0.0.1:48176/";
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(target + "#/readiness");
  await page
    .getByRole("heading", { name: "상용화까지 남은 일", exact: true })
    .waitFor();
  await page.evaluate(() => document.fonts.ready);
  mkdirSync("artifacts/release", { recursive: true });
  await page
    .getByRole("heading", { name: "상용화까지 남은 일", exact: true })
    .scrollIntoViewIfNeeded();
  await page
    .getByRole("heading", { name: "상용화까지 남은 일", exact: true })
    .locator("..")
    .screenshot({ path: "artifacts/release/readiness.png" });
  await page.goto(target + "#/components/date-picker");
  await page.getByRole("button", { name: "날짜 확인", exact: true }).click();
  await page.getByRole("alert").waitFor();
  await page.screenshot({
    path: "artifacts/release/date-validation.png",
    fullPage: true,
  });
  if (errors.length) throw Error(errors.join("\n"));
  console.log(
    "Readiness and form-validation screenshots captured without JavaScript errors.",
  );
} finally {
  await browser.close();
}
