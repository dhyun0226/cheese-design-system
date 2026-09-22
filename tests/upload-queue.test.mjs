import { test } from "node:test";
import assert from "node:assert/strict";
import * as React from "../packages/react/dist/index.js";
import * as Vue from "../packages/vue/dist/cheese-vue.js";

for (const [framework, api] of [
  ["React", React],
  ["Vue", Vue],
]) {
  test(`${framework} upload completion errors preserve success and prevent duplicate uploads`, async () => {
    const callbackError = new Error("Could not update the application");
    const states = [];
    let completionCount = 0;
    let uploadCount = 0;
    let uploadSignal;
    const result = { attachmentId: "saved-attachment" };
    const queue = new api.UploadQueue(
      (items) => states.push(items[0]?.status),
      (item) => {
        completionCount++;
        assert.equal(item.status, "success");
        assert.equal(item.result, result);
        throw callbackError;
      },
    );
    queue.add([new File(["report"], "report.txt")], {});
    const id = queue.items[0].id;
    const upload = async (_, { signal }) => {
      uploadCount++;
      uploadSignal = signal;
      return result;
    };

    await assert.rejects(
      queue.start(id, upload),
      (error) => error === callbackError,
    );
    assert.equal(queue.items[0].status, "success");
    assert.equal(queue.items[0].progress, 100);
    assert.equal(queue.items[0].result, result);
    assert.equal(queue.items[0].error, undefined);
    assert.deepEqual(states, ["queued", "uploading", "success"]);

    await queue.start(id, upload);
    assert.equal(uploadCount, 1);
    assert.equal(completionCount, 1);
    queue.cancel(id);
    assert.equal(uploadSignal.aborted, false);
    queue.dispose();
  });

  test(`${framework} successful upload observer errors do not become transport failures`, async () => {
    const callbackError = new Error("Could not render the result");
    const queue = new api.UploadQueue((items) => {
      if (items[0]?.status === "success") throw callbackError;
    });
    queue.add([new File(["report"], "report.txt")], {});
    await assert.rejects(
      queue.start(queue.items[0].id, async () => "saved-attachment"),
      (error) => error === callbackError,
    );
    assert.equal(queue.items[0].status, "success");
    assert.equal(queue.items[0].progress, 100);
    assert.equal(queue.items[0].result, "saved-attachment");
    assert.equal(queue.items[0].error, undefined);
    queue.dispose();
  });

  test(`${framework} failed upload adapters remain retryable and complete only after success`, async () => {
    const states = [];
    const completed = [];
    const queue = new api.UploadQueue(
      (items) => states.push(items[0]?.status),
      (item) => completed.push(item),
    );
    queue.add([new File(["report"], "report.txt")], {});
    const id = queue.items[0].id;
    await queue.start(id, async (_, { onProgress }) => {
      onProgress(40);
      throw new Error("Transport unavailable");
    });
    assert.equal(queue.items[0].status, "error");
    assert.equal(queue.items[0].result, undefined);
    assert.match(queue.items[0].error, /업로드에 실패/);
    assert.equal(completed.length, 0);

    await queue.start(id, async () => "saved-after-retry");
    assert.equal(queue.items[0].status, "success");
    assert.equal(queue.items[0].progress, 100);
    assert.equal(queue.items[0].error, undefined);
    assert.equal(completed.length, 1);
    assert.equal(completed[0].result, "saved-after-retry");
    assert.deepEqual(states, [
      "queued",
      "uploading",
      "uploading",
      "error",
      "uploading",
      "success",
    ]);
    queue.dispose();
  });
}
