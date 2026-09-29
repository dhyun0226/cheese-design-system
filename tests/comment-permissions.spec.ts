import { test, expect, type Page } from "@playwright/test";

type Action = "edit" | "reply";

function composer(page: Page, action: Action) {
  const thread = page.getByRole("region", {
    name: "Permission comments",
    exact: true,
  });
  return {
    thread,
    open: thread.getByRole("button", {
      name: action === "edit" ? "Alex 댓글 수정" : "Alex 댓글에 답글 작성",
      exact: true,
    }),
    draft: thread.getByRole("textbox", {
      name: action === "edit" ? "댓글 수정" : "Alex님에게 답글 작성",
      exact: true,
    }),
    submit: thread.getByRole("button", {
      name: action === "edit" ? "변경 저장" : "답글 등록",
      exact: true,
    }),
    cancel: thread.getByRole("button", { name: "취소", exact: true }),
    remove: thread.getByRole("button", { name: "Alex 댓글 삭제", exact: true }),
    otherAction: thread.getByRole("button", {
      name: action === "reply" ? "Alex 댓글 수정" : "Alex 댓글에 답글 작성",
      exact: true,
    }),
  };
}

for (const framework of ["react", "vue"] as const) {
  for (const action of ["edit", "reply"] as const) {
    for (const removed of ["permission", "callback"] as const) {
      const revoke = `${removed === "permission" ? "Revoke" : "Remove"} ${action} ${removed}`;
      const restore = `Restore ${action} ${removed}`;
      const draftBody = `Preserved ${action} draft`;

      test(`${framework} ${action} ${removed} removal preserves a cancellable draft and supports restoration`, async ({
        page,
      }) => {
        await page.goto(
          `/tests/fixtures/comment-permissions.html?framework=${framework}`,
        );
        const view = composer(page, action);
        await view.open.click();
        await view.draft.fill(draftBody);
        await page.getByRole("button", { name: revoke, exact: true }).click();
        await expect(view.draft).toBeVisible();
        await expect(view.draft).toHaveValue(draftBody);
        await expect(view.draft).toBeDisabled();
        await expect(view.submit).toBeDisabled();
        await expect(view.cancel).toBeEnabled();
        await expect(view.remove).toBeDisabled();

        // Even dispatched shortcuts cannot invoke a removed callback or right.
        await view.draft.dispatchEvent("keydown", {
          key: "Enter",
          ctrlKey: true,
        });
        await expect(page.getByTestId("requests")).toHaveText("[]");
        await expect(view.draft).toHaveValue(draftBody);

        await page.getByRole("button", { name: restore, exact: true }).click();
        await expect(view.draft).toBeEnabled();
        await expect(view.draft).toHaveValue(draftBody);
        await view.submit.click();
        await expect(page.getByTestId("requests")).toHaveText(
          JSON.stringify([{ action, id: "comment-1", body: draftBody }]),
        );
        await page
          .getByRole("button", { name: `Resolve ${action}`, exact: true })
          .click();
        await expect(view.draft).toHaveCount(0);
        await expect(view.remove).toBeEnabled();

        await view.open.click();
        await view.draft.fill("Draft to cancel");
        await page.getByRole("button", { name: revoke, exact: true }).click();
        await view.cancel.click();
        await expect(view.draft).toHaveCount(0);
        await expect(view.otherAction).toBeEnabled();
        await expect(view.remove).toBeEnabled();
        await expect(view.open).toHaveCount(0);
        await expect(page.getByTestId("delete-count")).toHaveText("0");
      });

      test(`${framework} pending ${action} retains its lifecycle when ${removed} disappears`, async ({
        page,
      }) => {
        await page.goto(
          `/tests/fixtures/comment-permissions.html?framework=${framework}`,
        );
        const view = composer(page, action);
        await view.open.click();
        await view.draft.fill(draftBody);
        await view.submit.click();
        const firstRequest = { action, id: "comment-1", body: draftBody };
        await expect(page.getByTestId("requests")).toHaveText(
          JSON.stringify([firstRequest]),
        );
        await page.getByRole("button", { name: revoke, exact: true }).click();
        await expect(view.draft).toHaveValue(draftBody);
        await expect(view.draft).toBeDisabled();
        await expect(view.cancel).toBeDisabled();

        await page.getByRole("button", { name: restore, exact: true }).click();
        await expect(view.submit).toBeDisabled();
        await expect(view.cancel).toBeDisabled();
        await view.draft.dispatchEvent("keydown", {
          key: "Enter",
          ctrlKey: true,
        });
        await expect(page.getByTestId("requests")).toHaveText(
          JSON.stringify([firstRequest]),
        );

        await page.getByRole("button", { name: revoke, exact: true }).click();
        await page
          .getByRole("button", { name: `Reject ${action}`, exact: true })
          .click();
        await expect(view.thread.getByRole("alert")).toContainText(
          "작성한 내용은 유지됩니다",
        );
        await expect(view.draft).toHaveValue(draftBody);
        await expect(view.draft).toBeDisabled();
        await expect(view.submit).toBeDisabled();
        await expect(view.cancel).toBeEnabled();

        await page.getByRole("button", { name: restore, exact: true }).click();
        await view.submit.click();
        await expect(page.getByTestId("requests")).toHaveText(
          JSON.stringify([firstRequest, firstRequest]),
        );
        await page.getByRole("button", { name: revoke, exact: true }).click();
        await expect(view.cancel).toBeDisabled();
        await page
          .getByRole("button", { name: `Resolve ${action}`, exact: true })
          .click();
        await expect(view.draft).toHaveCount(0);
        await expect(view.remove).toBeEnabled();
        await expect(view.otherAction).toBeEnabled();
        await expect(view.open).toHaveCount(0);

        await page.getByRole("button", { name: restore, exact: true }).click();
        await view.open.click();
        await expect(view.draft).toHaveValue(
          action === "edit" ? "Original comment" : "",
        );
        await expect(view.submit).toBeEnabled();
        await expect(view.cancel).toBeEnabled();
      });
    }
  }
}
