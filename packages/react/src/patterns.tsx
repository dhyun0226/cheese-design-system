"use client";

import * as React from "react";
import { RadioGroup as RadioPrimitive } from "radix-ui";
import {
  Check,
  Circle,
  CircleAlert,
  CircleCheck,
  CircleDot,
  LoaderCircle,
  Menu,
  Users,
  X,
} from "lucide-react";
import {
  Button,
  CheckboxRoot,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  EmptyState,
} from "./index.js";
import { Select } from "./Collections.js";
import { SearchInput } from "./SearchInput.js";
import { Tree } from "./Tree.js";
import {
  NavigationList,
  type NavigationItem,
  type NavigationListProps,
} from "./workspace.js";

export interface AppShellItem extends NavigationItem {}

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  brand: React.ReactNode;
  navigationLabel?: string;
  items: AppShellItem[];
  activeId?: string;
  onNavigate?: NavigationListProps["onNavigate"];
  variant?: "embedded" | "application";
  headerActions?: React.ReactNode;
  sidebarUser?: React.ReactNode;
  user?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/** Application layout only; route state and the main landmark belong to the app. */
export function AppShell({
  brand,
  navigationLabel = "주 메뉴",
  items,
  activeId,
  onNavigate,
  variant = "embedded",
  headerActions,
  sidebarUser,
  user,
  footer,
  children,
  className,
  ...props
}: AppShellProps) {
  const [navigationOpen, setNavigationOpen] = React.useState(false);
  // A router may prevent the native click, then accept navigation by changing activeId.
  React.useEffect(() => setNavigationOpen(false), [activeId]);
  React.useEffect(() => {
    if (!navigationOpen) return;
    const desktop = window.matchMedia("(min-width: 721px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setNavigationOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    closeOnDesktop();
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, [navigationOpen]);
  const navigate: NonNullable<NavigationListProps["onNavigate"]> = (
    id,
    event,
  ) => {
    onNavigate?.(id, event);
    if (!event.defaultPrevented) setNavigationOpen(false);
  };
  const navigation = () => (
    <NavigationList
      className="cheese-app-shell-nav"
      items={items}
      activeId={activeId}
      label={navigationLabel}
      onNavigate={navigate}
    />
  );
  const sidebarEnd = () =>
    (footer != null || sidebarUser != null) && (
      <div className="cheese-app-shell-sidebar-end">
        {footer != null && (
          <div className="cheese-app-shell-footer">{footer}</div>
        )}
        {sidebarUser != null && (
          <div className="cheese-app-shell-sidebar-user">{sidebarUser}</div>
        )}
      </div>
    );
  return (
    <DialogRoot open={navigationOpen} onOpenChange={setNavigationOpen}>
      <div
        {...props}
        className={["cheese-app-shell cheese-root", className]
          .filter(Boolean)
          .join(" ")}
        data-variant={variant}
      >
        <header className="cheese-app-shell-header">
          <div className="cheese-app-shell-header-start">
            <DialogTrigger asChild>
              <Button
                className="cheese-app-shell-menu-button"
                variant="ghost"
                aria-label={`${navigationLabel} 열기`}
              >
                <Menu aria-hidden="true" />
              </Button>
            </DialogTrigger>
            <div className="cheese-app-shell-brand">{brand}</div>
          </div>
          {(headerActions != null || user != null) && (
            <div className="cheese-app-shell-header-end">
              {headerActions != null && (
                <div className="cheese-app-shell-header-actions">
                  {headerActions}
                </div>
              )}
              {user != null && (
                <div className="cheese-app-shell-user">{user}</div>
              )}
            </div>
          )}
        </header>
        <div className="cheese-app-shell-body">
          <aside
            className="cheese-app-shell-sidebar"
            aria-label={navigationLabel}
          >
            {navigation()}
            {sidebarEnd()}
          </aside>
          <div className="cheese-app-shell-content">{children}</div>
        </div>
      </div>
      <DialogContent
        className="cheese-app-shell-mobile-navigation"
        placement="right"
        aria-describedby={undefined}
      >
        <div className="cheese-app-shell-mobile-header">
          <DialogTitle>{navigationLabel}</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" aria-label={`${navigationLabel} 닫기`}>
              <X aria-hidden="true" />
            </Button>
          </DialogClose>
        </div>
        {navigation()}
        {sidebarEnd()}
      </DialogContent>
    </DialogRoot>
  );
}

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  headingLevel = 1,
}: PageHeaderProps) {
  const Heading = `h${headingLevel}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  return (
    <header className="cheese-page-header">
      <div className="cheese-page-header-copy">
        {eyebrow && <p className="cheese-page-eyebrow">{eyebrow}</p>}
        <Heading>{title}</Heading>
        {description && (
          <p className="cheese-page-description">{description}</p>
        )}
      </div>
      {actions && <div className="cheese-page-actions">{actions}</div>}
    </header>
  );
}

export interface PatternFilter {
  id: string;
  label: string;
  value: string;
  /** The first option is the default restored when removing an active filter. */
  options: { value: string; label: string }[];
}

export interface FilterBarProps {
  label?: string;
  search: string;
  onSearchChange: (value: string) => void;
  searchLabel?: string;
  filters: PatternFilter[];
  onFilterChange: (id: string, value: string) => void;
  onReset: () => void;
  resultCount?: number;
}

export function FilterBar({
  label = "검색 및 필터",
  search,
  onSearchChange,
  searchLabel = "검색",
  filters,
  onFilterChange,
  onReset,
  resultCount,
}: FilterBarProps) {
  const active = filters.filter(
    (filter) => filter.value !== (filter.options[0]?.value ?? ""),
  );
  return (
    <section className="cheese-filter-bar" aria-label={label}>
      <div className="cheese-filter-controls">
        <SearchInput
          label={searchLabel}
          value={search}
          onValueChange={onSearchChange}
          onSearch={() => {}}
        />
        {filters.map((filter) => (
          <Select
            key={filter.id}
            label={filter.label}
            value={
              filter.options.some((option) => option.value === filter.value)
                ? `value:${filter.value}`
                : ""
            }
            options={filter.options.map((option) => ({
              ...option,
              value: `value:${option.value}`,
            }))}
            disabled={!filter.options.length}
            onValueChange={(next) => onFilterChange(filter.id, next.slice(6))}
          />
        ))}
        <Button
          variant="ghost"
          disabled={!search && !active.length}
          onClick={onReset}
        >
          초기화
        </Button>
      </div>
      <div className="cheese-filter-summary">
        <ul className="cheese-pattern-chips" aria-label="적용된 필터">
          {search && (
            <li className="cheese-pattern-chip">
              <span>
                {searchLabel}: {search}
              </span>
              <button
                type="button"
                aria-label={`${searchLabel} 필터 해제`}
                onClick={() => onSearchChange("")}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </li>
          )}
          {active.map((filter) => (
            <li key={filter.id} className="cheese-pattern-chip">
              <span>
                {filter.label}:{" "}
                {filter.options.find((option) => option.value === filter.value)
                  ?.label ?? filter.value}
              </span>
              <button
                type="button"
                aria-label={`${filter.label} 필터 해제`}
                onClick={() =>
                  onFilterChange(filter.id, filter.options[0]?.value ?? "")
                }
              >
                <X size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
        {resultCount !== undefined && (
          <p className="cheese-pattern-count" role="status">
            검색 결과 {resultCount}건
          </p>
        )}
      </div>
    </section>
  );
}

export interface BulkAction {
  id: string;
  label: string;
  onAction: () => void;
  disabled?: boolean;
}

export interface BulkActionBarProps {
  selectedCount: number;
  actions: BulkAction[];
  onClear: () => void;
  busy?: boolean;
  result?: { succeeded: number; failed: number };
  onRetry?: () => void;
}

/** Selection and operation outcomes stay controlled by the consuming feature. */
export function BulkActionBar({
  selectedCount,
  actions,
  onClear,
  busy = false,
  result,
  onRetry,
}: BulkActionBarProps) {
  if (!selectedCount && !busy && !result) return null;
  return (
    <div
      className="cheese-bulk-action-bar"
      role="group"
      aria-label="선택 항목 작업"
    >
      <p className="cheese-bulk-summary" role="status" aria-atomic="true">
        <strong>{selectedCount}건 선택</strong>
        {busy && <span> · 처리 중</span>}
      </p>
      <div className="cheese-bulk-actions">
        {actions.map((action) => (
          <Button
            key={action.id}
            size="sm"
            variant="weak"
            disabled={busy || !selectedCount || action.disabled}
            onClick={action.onAction}
          >
            {action.label}
          </Button>
        ))}
        {selectedCount > 0 && (
          <Button size="sm" variant="ghost" disabled={busy} onClick={onClear}>
            선택 해제
          </Button>
        )}
        {!!result?.failed && onRetry && (
          <Button size="sm" variant="weak" disabled={busy} onClick={onRetry}>
            실패 항목 다시 시도
          </Button>
        )}
      </div>
      {result && (
        <p className="cheese-bulk-result" role="status" aria-atomic="true">
          {result.succeeded}건 성공 · {result.failed}건 실패
        </p>
      )}
    </div>
  );
}

export interface PeoplePickerOrganization {
  id: string;
  label: string;
  children?: PeoplePickerOrganization[];
}

export interface PeoplePickerPerson {
  id: string;
  name: string;
  organizationId: string;
  description?: string;
  disabled?: boolean;
}

export interface PeoplePickerProps {
  label: string;
  people: PeoplePickerPerson[];
  organizations: PeoplePickerOrganization[];
  value: string[];
  onValueChange: (value: string[]) => void;
  multiple?: boolean;
  disabled?: boolean;
}

function organizationIndex(organizations: PeoplePickerOrganization[]) {
  const paths = new Map<string, string>();
  const descendants = new Map<string, Set<string>>();
  const visit = (
    node: PeoplePickerOrganization,
    parentPath: string,
  ): Set<string> => {
    const path = parentPath ? `${parentPath} / ${node.label}` : node.label;
    paths.set(node.id, path);
    const ids = new Set([node.id]);
    node.children?.forEach((child) =>
      visit(child, path).forEach((id) => ids.add(id)),
    );
    descendants.set(node.id, ids);
    return ids;
  };
  organizations.forEach((node) => visit(node, ""));
  return { paths, descendants };
}

/** A staged picker: closing or cancelling never changes the caller's value. */
export function PeoplePicker({
  label,
  people,
  organizations,
  value,
  onValueChange,
  multiple = true,
  disabled = false,
}: PeoplePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<string[]>([]);
  const [search, setSearch] = React.useState("");
  const [organization, setOrganization] = React.useState("");
  const id = React.useId();
  const searchInput = React.useRef<HTMLInputElement>(null);
  const index = React.useMemo(
    () => organizationIndex(organizations),
    [organizations],
  );
  const byId = React.useMemo(
    () => new Map(people.map((person) => [person.id, person])),
    [people],
  );
  const unique = (ids: string[]) => [...new Set(ids)];
  const current = unique(value);
  const singleLocked =
    !multiple && draft.some((personId) => byId.get(personId)?.disabled);
  const organizationIds = index.descendants.get(organization);
  const query = search.trim().toLocaleLowerCase();
  const visible = people.filter(
    (person) =>
      (!organization ||
        !organizationIds ||
        organizationIds.has(person.organizationId)) &&
      (!query ||
        `${person.name} ${person.description ?? ""} ${index.paths.get(person.organizationId) ?? ""}`
          .toLocaleLowerCase()
          .includes(query)),
  );
  const accessibleName = (person: PeoplePickerPerson) =>
    `${person.name} · ${index.paths.get(person.organizationId) ?? person.organizationId}`;
  const changeOpen = (next: boolean) => {
    if (next && disabled) return;
    if (next) {
      setDraft(unique(value));
      setSearch("");
      setOrganization("");
    }
    setOpen(next);
  };
  const toggle = (person: PeoplePickerPerson) => {
    if (
      disabled ||
      person.disabled ||
      (singleLocked && !draft.includes(person.id))
    )
      return;
    setDraft((previous) =>
      multiple
        ? previous.includes(person.id)
          ? previous.filter((personId) => personId !== person.id)
          : [...previous, person.id]
        : [person.id],
    );
  };
  const chips = (ids: string[], remove: (personId: string) => void) => (
    <ul className="cheese-pattern-chips" aria-label="선택한 사람">
      {ids.map((personId) => {
        const person = byId.get(personId);
        return (
          <li key={personId} className="cheese-pattern-chip">
            <span title={person ? accessibleName(person) : personId}>
              {person?.name ?? personId}
            </span>
            <button
              type="button"
              aria-label={`${person ? accessibleName(person) : personId} 선택 해제`}
              disabled={disabled || person?.disabled}
              onClick={() => remove(personId)}
            >
              <X size={14} aria-hidden="true" />
            </button>
          </li>
        );
      })}
    </ul>
  );
  const peopleList = (
    <ul className="cheese-people-list">
      {visible.map((person, position) => {
        const personDisabled =
          disabled ||
          !!person.disabled ||
          (singleLocked && !draft.includes(person.id));
        return (
          <li
            key={person.id}
            className="cheese-person-row"
            role={multiple ? undefined : "none"}
            data-selected={draft.includes(person.id)}
            data-disabled={personDisabled}
          >
            <label
              className="cheese-person-option"
              htmlFor={`${id}-person-${position}`}
            >
              {multiple ? (
                <CheckboxRoot
                  id={`${id}-person-${position}`}
                  checked={draft.includes(person.id)}
                  disabled={personDisabled}
                  aria-label={accessibleName(person)}
                  onCheckedChange={() => toggle(person)}
                />
              ) : (
                <RadioPrimitive.Item
                  className="cheese-radio"
                  id={`${id}-person-${position}`}
                  value={person.id}
                  disabled={personDisabled}
                  aria-label={accessibleName(person)}
                >
                  <RadioPrimitive.Indicator className="cheese-radio-indicator" />
                </RadioPrimitive.Item>
              )}
              <span className="cheese-person-copy">
                <strong>
                  {person.name}
                  {person.disabled && <span> · 선택 불가</span>}
                </strong>
                <span>
                  {index.paths.get(person.organizationId) ??
                    person.organizationId}
                </span>
                {person.description && <small>{person.description}</small>}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
  return (
    <div className="cheese-people-picker">
      <span className="cheese-label">{label}</span>
      <DialogRoot open={open} onOpenChange={changeOpen}>
        <DialogTrigger asChild>
          <Button variant="weak" disabled={disabled}>
            <Users size={16} aria-hidden="true" />
            {label} 선택
            {current.length > 0 && <span> · {current.length}명</span>}
          </Button>
        </DialogTrigger>
        <DialogContent
          className="cheese-people-dialog"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            searchInput.current?.focus();
          }}
        >
          <div className="cheese-people-dialog-header">
            <DialogTitle>{label} 선택</DialogTitle>
            <DialogDescription>
              조직을 탐색하거나 이름과 설명으로 검색하세요. 선택 적용을 눌러야
              변경 사항이 반영됩니다.
            </DialogDescription>
          </div>
          <SearchInput
            ref={searchInput}
            label="사람 검색"
            value={search}
            onValueChange={setSearch}
            onSearch={() => {}}
            disabled={disabled}
          />
          <div className="cheese-people-browser">
            <aside
              className="cheese-people-organizations"
              aria-label="조직 필터"
            >
              <h3>조직</h3>
              <Button
                variant={organization ? "ghost" : "accent"}
                size="sm"
                disabled={disabled}
                aria-pressed={!organization}
                onClick={() => setOrganization("")}
              >
                전체 조직
              </Button>
              <Tree
                nodes={organizations}
                label="조직 탐색"
                defaultExpanded={organizations.map((item) => item.id)}
                selected={organization}
                onSelect={(node) => {
                  if (!disabled) setOrganization(node.id);
                }}
              />
            </aside>
            <section
              className="cheese-people-results"
              aria-label="사람 검색 결과"
            >
              <p className="cheese-pattern-count" role="status">
                검색 결과 {visible.length}명
              </p>
              {visible.length ? (
                multiple ? (
                  peopleList
                ) : (
                  <RadioPrimitive.Root
                    asChild
                    value={draft[0] ?? ""}
                    disabled={disabled}
                    aria-label="선택할 사람"
                    onValueChange={(personId) => {
                      const person = byId.get(personId);
                      if (person) toggle(person);
                    }}
                  >
                    {peopleList}
                  </RadioPrimitive.Root>
                )
              ) : (
                <EmptyState
                  title="검색 결과가 없습니다"
                  description="다른 이름으로 검색하거나 전체 조직을 확인해 주세요."
                />
              )}
            </section>
          </div>
          <div className="cheese-people-selection">
            <p className="cheese-pattern-count" role="status">
              {draft.length}명 선택
            </p>
            {chips(draft, (personId) =>
              setDraft((previous) =>
                previous.filter((item) => item !== personId),
              ),
            )}
          </div>
          <div className="cheese-dialog-actions">
            <Button variant="weak" onClick={() => changeOpen(false)}>
              취소
            </Button>
            <Button
              disabled={disabled}
              onClick={() => {
                if (disabled) return;
                // A person who became unavailable while open cannot be newly added.
                onValueChange(
                  unique(
                    draft.filter(
                      (personId) =>
                        value.includes(personId) ||
                        (byId.has(personId) && !byId.get(personId)?.disabled),
                    ),
                  ),
                );
                changeOpen(false);
              }}
            >
              선택 적용
            </Button>
          </div>
        </DialogContent>
      </DialogRoot>
      {current.length > 0 &&
        chips(current, (personId) =>
          onValueChange(current.filter((item) => item !== personId)),
        )}
    </div>
  );
}

export interface DescriptionListProps {
  items: { label: string; value: React.ReactNode }[];
}

export function DescriptionList({ items }: DescriptionListProps) {
  return (
    <dl className="cheese-description-list">
      {items.map((item, index) => (
        <div key={index}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export interface ActivityTimelineItem {
  id: string;
  title: string;
  description?: string;
  actor?: string;
  time?: string;
  status?: "done" | "current" | "pending" | "error";
}

export interface ActivityTimelineProps {
  label?: string;
  items: ActivityTimelineItem[];
}

const activityLabels = {
  done: "완료",
  current: "진행 중",
  pending: "대기",
  error: "실패",
};

export function ActivityTimeline({ label, items }: ActivityTimelineProps) {
  const id = React.useId();
  return (
    <section
      className="cheese-activity-timeline"
      aria-labelledby={label ? id : undefined}
      aria-label={label ? undefined : "처리 이력"}
    >
      {label && <h2 id={id}>{label}</h2>}
      <ol>
        {items.map(({ status = "pending", ...item }) => (
          <li
            key={item.id}
            data-status={status}
            aria-current={status === "current" ? "step" : undefined}
          >
            <span className="cheese-activity-marker" aria-hidden="true">
              {status === "done" ? (
                <Check size={14} />
              ) : status === "error" ? (
                <CircleAlert size={14} />
              ) : (
                <Circle size={10} />
              )}
            </span>
            <div className="cheese-activity-copy">
              <strong>
                {item.title}
                <span className="cheese-sr-only">
                  {" "}
                  · {activityLabels[status]}
                </span>
              </strong>
              {item.description && <p>{item.description}</p>}
              {(item.actor || item.time) && (
                <div className="cheese-activity-meta">
                  {item.actor && <span>{item.actor}</span>}
                  {item.time && <time>{item.time}</time>}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export interface SaveStatusProps {
  status: "idle" | "dirty" | "saving" | "saved" | "error";
  label?: string;
  onRetry?: () => void;
}

const saveLabels = {
  idle: "저장할 변경 사항이 없습니다",
  dirty: "저장하지 않은 변경 사항",
  saving: "저장 중",
  saved: "저장됨",
  error: "저장에 실패했습니다",
};
const saveIcons = {
  idle: Circle,
  dirty: CircleDot,
  saving: LoaderCircle,
  saved: CircleCheck,
  error: CircleAlert,
};

export function SaveStatus({ status, label, onRetry }: SaveStatusProps) {
  const Icon = saveIcons[status];
  return (
    <div
      className="cheese-save-status"
      data-status={status}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <Icon size={16} aria-hidden="true" />
      <span>{label ?? saveLabels[status]}</span>
      {status === "error" && onRetry && (
        <Button size="sm" variant="ghost" onClick={onRetry}>
          다시 시도
        </Button>
      )}
    </div>
  );
}
