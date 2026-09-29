import "@cheese/css";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { createApp, h, ref } from "vue";
import { CommentThread as ReactCommentThread } from "@cheese/react";
import { CommentThread as VueCommentThread } from "@cheese/vue";

type Action = "edit" | "reply";
type Request = {
  action: Action;
  id: string;
  body: string;
  resolve: () => void;
  reject: (error: Error) => void;
};

// Parent controls model permission updates and timer-free server responses.
function createModel(refresh: () => void) {
  const model = {
    editPermission: true,
    replyPermission: true,
    editCallback: true,
    replyCallback: true,
    requests: [] as Request[],
    deleteCount: 0,
    submit(action: Action, id: string, body: string) {
      const promise = new Promise<void>((resolve, reject) => {
        model.requests.push({ action, id, body, resolve, reject });
      });
      refresh();
      return promise;
    },
    delete() {
      model.deleteCount++;
      refresh();
    },
  };
  return model;
}
type Model = ReturnType<typeof createModel>;

function controls(model: Model, refresh: () => void) {
  return (["edit", "reply"] as const).flatMap((action) => [
    {
      label: `Revoke ${action} permission`,
      run: () => {
        model[`${action}Permission`] = false;
        refresh();
      },
    },
    {
      label: `Restore ${action} permission`,
      run: () => {
        model[`${action}Permission`] = true;
        refresh();
      },
    },
    {
      label: `Remove ${action} callback`,
      run: () => {
        model[`${action}Callback`] = false;
        refresh();
      },
    },
    {
      label: `Restore ${action} callback`,
      run: () => {
        model[`${action}Callback`] = true;
        refresh();
      },
    },
    {
      label: `Resolve ${action}`,
      run: () =>
        model.requests
          .filter((request) => request.action === action)
          .at(-1)
          ?.resolve(),
    },
    {
      label: `Reject ${action}`,
      run: () =>
        model.requests
          .filter((request) => request.action === action)
          .at(-1)
          ?.reject(new Error("Server rejected the request")),
    },
  ]);
}

function threadProps(model: Model) {
  return {
    label: "Permission comments",
    items: [
      {
        id: "comment-1",
        author: "Alex",
        body: "Original comment",
        time: "Today",
        canEdit: model.editPermission,
        canReply: model.replyPermission,
        canDelete: true,
      },
    ],
    onEdit: model.editCallback
      ? (id: string, body: string) => model.submit("edit", id, body)
      : undefined,
    onReply: model.replyCallback
      ? (id: string, body: string) => model.submit("reply", id, body)
      : undefined,
    onDelete: () => model.delete(),
  };
}

function requestLog(model: Model) {
  return JSON.stringify(
    model.requests.map(({ action, id, body }) => ({ action, id, body })),
  );
}

function ReactFixture() {
  const [, setRevision] = React.useState(0);
  const refresh = () => setRevision((value) => value + 1);
  const [model] = React.useState(() => createModel(refresh));
  return React.createElement(
    "main",
    { style: { maxWidth: 900, margin: "24px auto", padding: 24 } },
    React.createElement("h1", null, "React comment permissions"),
    React.createElement(
      "div",
      null,
      controls(model, refresh).map(({ label, run }) =>
        React.createElement(
          "button",
          { key: label, type: "button", onClick: run },
          label,
        ),
      ),
    ),
    React.createElement(
      "output",
      { "data-testid": "requests" },
      requestLog(model),
    ),
    React.createElement(
      "output",
      { "data-testid": "delete-count" },
      model.deleteCount,
    ),
    React.createElement(ReactCommentThread, threadProps(model)),
  );
}

const VueFixture = {
  setup() {
    const revision = ref(0);
    const refresh = () => revision.value++;
    const model = createModel(refresh);
    return () => {
      // The parent updates all thread props together, as an app subscription does.
      void revision.value;
      return h(
        "main",
        { style: { maxWidth: "900px", margin: "24px auto", padding: "24px" } },
        [
          h("h1", "Vue comment permissions"),
          h(
            "div",
            controls(model, refresh).map(({ label, run }) =>
              h("button", { key: label, type: "button", onClick: run }, label),
            ),
          ),
          h("output", { "data-testid": "requests" }, requestLog(model)),
          h(
            "output",
            { "data-testid": "delete-count" },
            String(model.deleteCount),
          ),
          h(VueCommentThread, threadProps(model)),
        ],
      );
    };
  },
};

if (new URLSearchParams(location.search).get("framework") === "vue") {
  createApp(VueFixture).mount("#root");
} else {
  createRoot(document.getElementById("root")!).render(
    React.createElement(ReactFixture),
  );
}
