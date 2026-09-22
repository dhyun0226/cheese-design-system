import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { tabKey } from "./platform";

type Driver = {
  snapshot: () => { id: string; aborted: boolean }[];
  resolve: (index: number, remove: boolean) => void;
  reject: (index: number, message: string | null) => void;
  remove: (id: string) => void;
  reinsert: (id: string) => void;
  unmount: () => void;
};

const firstName = "업무 명세.pdf";
const secondName = "예산 검토.xlsx";
const lastName =
  "분기별_프로젝트_진행_현황_및_첨부_자료_검토_최종본_2026년_9월.txt";

async function requests(page: Page) {
  return page.evaluate(() =>
    (
      window as unknown as { attachmentFixture: Driver }
    ).attachmentFixture.snapshot(),
  );
}

async function resolve(page: Page, index: number, remove = true) {
  await page.evaluate(
    ({ index, remove }) =>
      (
        window as unknown as { attachmentFixture: Driver }
      ).attachmentFixture.resolve(index, remove),
    { index, remove },
  );
}

async function reject(page: Page, index: number, message: string | null) {
  await page.evaluate(
    ({ index, message }) =>
      (
        window as unknown as { attachmentFixture: Driver }
      ).attachmentFixture.reject(index, message),
    { index, message },
  );
}

async function externalChange(
  page: Page,
  action: "remove" | "reinsert" | "unmount",
  id = "",
) {
  await page.evaluate(
    ({ action, id }) =>
      (window as unknown as { attachmentFixture: Driver }).attachmentFixture[
        action
      ](id),
    { action, id },
  );
}

for (const framework of ["react", "vue"]) {
  test.describe(`${framework} saved attachment contracts`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(
        `/tests/fixtures/attachment-list.html?framework=${framework}`,
      );
    });

    test("pending deletion prevents duplicates while other files remain independently actionable", async ({
      page,
    }) => {
      const group = page.getByRole("group", { name: "업무 첨부파일" });
      const first = group.getByRole("button", {
        name: `${firstName} 삭제`,
        exact: true,
      });
      const second = group.getByRole("button", {
        name: `${secondName} 삭제`,
        exact: true,
      });
      await first.click();
      await expect(first).toHaveAttribute("aria-disabled", "true");
      expect(
        await first.evaluate((node) => (node as HTMLButtonElement).disabled),
      ).toBe(false);
      await expect(group.locator('[data-pending="true"]')).toHaveCount(1);
      await first.press("Enter");
      await first.press("Space");
      await expect
        .poll(() => requests(page))
        .toEqual([{ id: "spec", aborted: false }]);
      await expect(second).toBeEnabled();
      await second.click();
      await expect(group.locator('[data-pending="true"]')).toHaveCount(2);
      await expect
        .poll(() => requests(page))
        .toEqual([
          { id: "spec", aborted: false },
          { id: "budget", aborted: false },
        ]);
      await resolve(page, 1);
      await expect(second).toHaveCount(0);
      await expect(first).toHaveAttribute("aria-disabled", "true");
      await reject(page, 0, "파일 삭제 권한을 확인해 주세요.");
      await expect(group.getByRole("alert")).toHaveText(
        "파일 삭제 권한을 확인해 주세요.",
      );
      await expect(group.locator('[data-pending="true"]')).toHaveCount(0);
    });

    test("failure retries retain files and confirmed removals restore next, previous, then label focus", async ({
      page,
    }) => {
      const group = page.getByRole("group", { name: "업무 첨부파일" });
      await group
        .getByRole("button", { name: `${secondName} 삭제`, exact: true })
        .press("Enter");
      await reject(page, 0, "서버 연결을 확인해 주세요.");
      await expect(group.getByRole("alert")).toHaveText(
        "서버 연결을 확인해 주세요.",
      );
      const retry = group.getByRole("button", {
        name: `${secondName} 삭제 재시도`,
        exact: true,
      });
      await expect(retry).toBeFocused();
      await expect(
        group.getByRole("link", { name: `${secondName} 다운로드` }),
      ).toBeVisible();
      await retry.press("Enter");
      await expect(group.getByRole("alert")).toHaveCount(0);
      await resolve(page, 1);
      const last = group.getByRole("button", {
        name: `${lastName} 삭제`,
        exact: true,
      });
      await expect(last).toBeFocused();
      await last.press("Enter");
      await resolve(page, 2);
      const first = group.getByRole("button", {
        name: `${firstName} 삭제`,
        exact: true,
      });
      await expect(first).toBeFocused();
      await first.press("Enter");
      await resolve(page, 3);
      await expect(
        group.getByText("첨부파일이 없습니다.", { exact: true }),
      ).toBeVisible();
      await expect(group.locator(".cheese-attachment-label")).toBeFocused();
    });

    test("external removal and unmount abort requests and stale failures cannot affect a reinserted file", async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const group = page.getByRole("group", { name: "업무 첨부파일" });
      const first = group.getByRole("button", {
        name: `${firstName} 삭제`,
        exact: true,
      });
      await first.click();
      await externalChange(page, "remove", "spec");
      await expect(first).toHaveCount(0);
      await expect
        .poll(() => requests(page))
        .toEqual([{ id: "spec", aborted: true }]);
      await externalChange(page, "reinsert", "spec");
      await first.click();
      await expect
        .poll(() => requests(page))
        .toEqual([
          { id: "spec", aborted: true },
          { id: "spec", aborted: false },
        ]);
      await reject(page, 0, "오래된 요청의 오류");
      await expect(group.getByRole("alert")).toHaveCount(0);
      await expect(first).toHaveAttribute("aria-disabled", "true");
      await resolve(page, 1, false);
      await expect(first).toBeEnabled();
      await first.click();
      await externalChange(page, "unmount");
      await expect(group).toHaveCount(0);
      await expect
        .poll(async () => (await requests(page))[2])
        .toEqual({
          id: "spec",
          aborted: true,
        });
      await reject(page, 2, "언마운트 이후 오류");
      await page.evaluate(
        () => new Promise<void>((done) => requestAnimationFrame(() => done())),
      );
      expect(errors).toEqual([]);
    });

    test("a resolved callback leaves the controlled item present until its owner changes items", async ({
      page,
    }) => {
      const group = page.getByRole("group", { name: "업무 첨부파일" });
      const first = group.getByRole("button", {
        name: `${firstName} 삭제`,
        exact: true,
      });
      await first.press("Enter");
      await resolve(page, 0, false);
      await expect(first).toBeEnabled();
      await expect(first).toBeFocused();
      await expect(
        group.getByRole("link", { name: `${firstName} 다운로드` }),
      ).toBeVisible();
      await expect(group.getByRole("button")).toHaveCount(3);
      await expect(group.getByRole("alert")).toHaveCount(0);
      await first.press("Enter");
      await expect.poll(async () => (await requests(page)).length).toBe(2);
    });

    test("read-only files expose real download URLs and empty lists have no delete controls", async ({
      page,
    }) => {
      await page.goto(
        `/tests/fixtures/attachment-list.html?framework=${framework}&readonly=true&unlinked=true`,
      );
      const group = page.getByRole("group", { name: "업무 첨부파일" });
      await expect(group.getByRole("button")).toHaveCount(0);
      await expect(group.getByRole("link")).toHaveCount(2);
      await expect(group.getByText(lastName, { exact: true })).toBeVisible();
      await expect(
        group.getByRole("link", { name: `${lastName} 다운로드` }),
      ).toHaveCount(0);
      const download = group.getByRole("link", {
        name: `${firstName} 다운로드`,
        exact: true,
      });
      await expect(download).toHaveAttribute(
        "href",
        "data:text/plain;charset=utf-8,attachment-spec",
      );
      await expect(download).toHaveAttribute("download", firstName);
      await page.goto(
        `/tests/fixtures/attachment-list.html?framework=${framework}&empty=true`,
      );
      await expect(
        group.getByText("첨부파일이 없습니다.", { exact: true }),
      ).toBeVisible();
      await expect(group.getByRole("button")).toHaveCount(0);
      await expect(group.getByRole("link")).toHaveCount(0);
    });

    test("keyboard traversal reaches each action and asynchronous removal never steals departed focus", async ({
      page,
      browserName,
    }) => {
      const group = page.getByRole("group", { name: "업무 첨부파일" });
      await page
        .getByRole("button", { name: "목록 이전", exact: true })
        .focus();
      await page.keyboard.press(tabKey(browserName));
      await expect(
        group.getByRole("link", { name: `${firstName} 다운로드` }),
      ).toBeFocused();
      await page.keyboard.press(tabKey(browserName));
      const first = group.getByRole("button", {
        name: `${firstName} 삭제`,
        exact: true,
      });
      await expect(first).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(first).toHaveAttribute("aria-disabled", "true");
      for (const name of [secondName, lastName]) {
        await page.keyboard.press(tabKey(browserName));
        await expect(
          group.getByRole("link", { name: `${name} 다운로드` }),
        ).toBeFocused();
        await page.keyboard.press(tabKey(browserName));
        await expect(
          group.getByRole("button", { name: `${name} 삭제`, exact: true }),
        ).toBeFocused();
      }
      await page.keyboard.press(tabKey(browserName));
      const after = page.getByRole("button", {
        name: "목록 다음",
        exact: true,
      });
      await expect(after).toBeFocused();
      await resolve(page, 0);
      await expect(first).toHaveCount(0);
      await expect(after).toBeFocused();
    });

    test("long filenames, pending controls, and fallback errors stay accessible on a narrow screen", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 760 });
      const group = page.getByRole("group", { name: "업무 첨부파일" });
      await expect(
        group.getByRole("link", { name: `${lastName} 다운로드` }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      await group
        .getByRole("button", { name: `${firstName} 삭제`, exact: true })
        .click();
      await reject(page, 0, null);
      await expect(group.getByRole("alert")).toHaveText(
        "파일을 삭제하지 못했습니다. 다시 시도해 주세요.",
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    });
  });
}
