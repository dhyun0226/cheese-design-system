import { useEffect, useRef, useState, type ReactNode } from "react";
import { Bell, Building2, ClipboardCheck, House, Sparkles } from "lucide-react";
import {
  AppShell,
  Badge,
  Button,
  DialogContent,
  DialogDescription,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  NotificationCenter,
  UserIdentity,
} from "@cheese/react";
import Logo from "./Logo";
import {
  markNotificationsRead,
  useGroupwareSession,
} from "./groupware-session";
import { canLeaveWorkflow } from "./workflow-navigation";
import "./groupware-shell.css";

const groupwareNavigation = [
  {
    id: "home",
    label: "업무 홈",
    href: "#/examples",
    icon: <House aria-hidden="true" />,
    group: "업무",
  },
  {
    id: "employees",
    label: "조직·구성원",
    href: "#/examples/employees",
    icon: <Building2 aria-hidden="true" />,
    group: "People",
  },
  {
    id: "evaluation",
    label: "인사평가",
    href: "#/examples/evaluation",
    icon: <ClipboardCheck aria-hidden="true" />,
    group: "People",
  },
  {
    id: "auditions",
    label: "오디션 운영",
    href: "#/examples/auditions",
    icon: <Sparkles aria-hidden="true" />,
    group: "운영",
  },
];

export default function GroupwareShell({
  activeId,
  footer,
  children,
}: {
  activeId: "home" | "employees" | "evaluation" | "auditions";
  footer?: ReactNode;
  children: ReactNode;
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { notifications } = useGroupwareSession();
  const unreadCount = notifications.filter((item) => !item.read).length;
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      root.current?.querySelector<HTMLElement>("main")?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [activeId]);

  return (
    <div className="groupware-root" ref={root}>
      <AppShell
        className="groupware-shell"
        variant="application"
        brand={
          <span className="groupware-brand">
            <Logo />
            <strong>CHEESE WORKS</strong>
          </span>
        }
        navigationLabel="CHEESE WORKS 메뉴"
        items={groupwareNavigation}
        activeId={activeId}
        headerActions={
          <DialogRoot
            open={notificationsOpen}
            onOpenChange={setNotificationsOpen}
          >
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" aria-label="알림함 열기">
                <Bell aria-hidden="true" />
                알림
                {unreadCount > 0 && <Badge tone="brand">{unreadCount}</Badge>}
              </Button>
            </DialogTrigger>
            <DialogContent placement="right">
              <DialogTitle>알림</DialogTitle>
              <DialogDescription>
                업무 마감과 확인이 필요한 항목을 모아봅니다.
              </DialogDescription>
              <NotificationCenter
                title="최근 알림"
                items={notifications}
                onRead={markNotificationsRead}
                onReadAll={() => markNotificationsRead()}
                onNavigate={(item) => {
                  if (!item.href) return;
                  const destination = new URL(item.href, window.location.href)
                    .href;
                  setNotificationsOpen(false);
                  if (destination === window.location.href) return;
                  // Let the drawer finish closing before a dirty-form dialog
                  // opens, so its focus trap and Cancel action remain usable.
                  requestAnimationFrame(() => {
                    if (canLeaveWorkflow(destination))
                      window.location.assign(destination);
                  });
                }}
              />
            </DialogContent>
          </DialogRoot>
        }
        user={
          <UserIdentity
            name="김치즈"
            description="DX개발팀"
            fallback="김"
            size="sm"
          />
        }
        footer={footer ?? <span>보안 접속 · 최근 로그인 09:02</span>}
      >
        {children}
      </AppShell>
    </div>
  );
}
