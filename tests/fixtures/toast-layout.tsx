import "@cheese/css";
import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { createApp, defineComponent, h, ref } from "vue";
import * as R from "@cheese/react";
import * as V from "@cheese/vue";

type Kind = "short" | "long" | "title" | "action";
type Notification = {
  id: number;
  kind: Kind;
  title: string;
  description?: string;
};
const longDescription =
  "변경한 평가 내용과 첨부 파일이 모두 저장되었습니다. 상세 내역은 다음 주소에서 확인할 수 있습니다. https://example.test/" +
  "evaluation-report-".repeat(12);
const triggers: [Kind, string][] = [
  ["short", "알림 표시"],
  ["long", "긴 알림 표시"],
  ["title", "제목만 표시"],
  ["action", "작업 알림 표시"],
];
const fixtureStyle = { padding: "24px", maxWidth: "720px" };
const backgroundStyle = {
  position: "fixed" as const,
  right: 0,
  bottom: 0,
  width: "180px",
  height: "16px",
  padding: 0,
  border: 0,
  fontSize: "11px",
};

function notification(id: number, kind: Kind): Notification {
  return {
    id,
    kind,
    title:
      kind === "long"
        ? "평가 결과와 첨부 파일의 저장이 모두 완료되었습니다."
        : kind === "title"
          ? "제목만 있는 알림"
          : "저장되었습니다.",
    description:
      kind === "title"
        ? undefined
        : kind === "long"
          ? longDescription
          : "예제 상태가 저장되었습니다.",
  };
}

function ReactFixture() {
  const nextId = useRef(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [actions, setActions] = useState(0);
  const [backgroundClicks, setBackgroundClicks] = useState(0);
  function notify(kind: Kind) {
    const next = notification(++nextId.current, kind);
    setNotifications((current) => [...current, next]);
  }
  function close(id: number, open: boolean) {
    if (!open)
      setNotifications((current) => current.filter((item) => item.id !== id));
  }
  return (
    <main className="cheese-root cheese-stack" style={fixtureStyle}>
      <h1>React Toast layout</h1>
      <R.ToastProvider duration={60000} label="알림">
        <div className="cheese-inline">
          {triggers.map(([kind, label]) => (
            <R.Button key={kind} onClick={() => notify(kind)}>
              {label}
            </R.Button>
          ))}
        </div>
        {notifications.map((item) =>
          item.kind === "action" ? (
            <R.Primitives.Toast.Root
              key={item.id}
              className="cheese-toast"
              data-testid={`toast-${item.id}`}
              open
              onOpenChange={(open) => close(item.id, open)}
            >
              <R.Primitives.Toast.Title className="cheese-toast-title">
                {item.title}
              </R.Primitives.Toast.Title>
              <R.Primitives.Toast.Description className="cheese-toast-description">
                <div>{item.description}</div>
                <R.Button
                  variant="weak"
                  size="sm"
                  onClick={() => setActions((current) => current + 1)}
                >
                  되돌리기 작업 실행
                </R.Button>
              </R.Primitives.Toast.Description>
              <R.Primitives.Toast.Close
                className="cheese-toast-close"
                aria-label="닫기"
              >
                <R.X aria-hidden="true" />
              </R.Primitives.Toast.Close>
            </R.Primitives.Toast.Root>
          ) : (
            <R.Toast
              key={item.id}
              className="consumer-toast"
              data-testid={`toast-${item.id}`}
              open
              onOpenChange={(open) => close(item.id, open)}
              title={item.title}
              description={item.description}
            />
          ),
        )}
        <R.ToastViewport className="consumer-viewport" />
      </R.ToastProvider>
      <output data-testid="action-count">{actions}</output>
      <output data-testid="background-count">{backgroundClicks}</output>
      <button
        style={backgroundStyle}
        onClick={() => setBackgroundClicks((current) => current + 1)}
      >
        배경 버튼
      </button>
    </main>
  );
}

const VueFixture = defineComponent({
  setup() {
    let nextId = 0;
    const notifications = ref<Notification[]>([]);
    const actions = ref(0);
    const backgroundClicks = ref(0);
    function close(id: number, open: boolean) {
      if (!open)
        notifications.value = notifications.value.filter(
          (item) => item.id !== id,
        );
    }
    return () =>
      h("main", { class: "cheese-root cheese-stack", style: fixtureStyle }, [
        h("h1", "Vue Toast layout"),
        h(
          V.ToastProvider,
          { duration: 60000, label: "알림" },
          {
            default: () => [
              h(
                "div",
                { class: "cheese-inline" },
                triggers.map(([kind, label]) =>
                  h(
                    V.Button,
                    {
                      onClick: () => {
                        notifications.value.push(notification(++nextId, kind));
                      },
                    },
                    { default: () => label },
                  ),
                ),
              ),
              ...notifications.value.map((item) =>
                h(
                  V.ToastRoot,
                  {
                    key: item.id,
                    class: "consumer-toast",
                    "data-testid": `toast-${item.id}`,
                    open: true,
                    "onUpdate:open": (open: boolean) => close(item.id, open),
                  },
                  {
                    default: () => [
                      h(V.ToastTitle, {}, { default: () => item.title }),
                      item.description &&
                        h(
                          V.ToastDescription,
                          {},
                          {
                            default: () =>
                              item.kind === "action"
                                ? [
                                    h("div", item.description),
                                    h(
                                      V.Button,
                                      {
                                        variant: "weak",
                                        size: "sm",
                                        onClick: () => actions.value++,
                                      },
                                      { default: () => "되돌리기 작업 실행" },
                                    ),
                                  ]
                                : item.description,
                          },
                        ),
                      h(
                        V.ToastClose,
                        {
                          asChild: item.kind === "long",
                          "aria-label": "닫기",
                          "data-composition":
                            item.kind === "long" ? "as-child" : "default",
                        },
                        {
                          default: () =>
                            item.kind === "long"
                              ? h(
                                  V.Button,
                                  { variant: "ghost", size: "sm" },
                                  {
                                    default: () =>
                                      h(V.X, { "aria-hidden": "true" }),
                                  },
                                )
                              : h(V.X, { "aria-hidden": "true" }),
                        },
                      ),
                    ],
                  },
                ),
              ),
              h(V.ToastViewport, { class: "consumer-viewport" }),
            ],
          },
        ),
        h("output", { "data-testid": "action-count" }, actions.value),
        h(
          "output",
          { "data-testid": "background-count" },
          backgroundClicks.value,
        ),
        h(
          "button",
          {
            style: backgroundStyle,
            onClick: () => backgroundClicks.value++,
          },
          "배경 버튼",
        ),
      ]);
  },
});

if (new URLSearchParams(location.search).get("framework") === "vue") {
  createApp(VueFixture).mount("#root");
} else {
  createRoot(document.getElementById("root")!).render(<ReactFixture />);
}
