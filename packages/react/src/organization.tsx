"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  Building2,
  Check,
  ChevronRight,
  X,
} from "lucide-react";
import {
  Button,
  CheckboxRoot,
  DialogContent,
  DialogDescription,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "./index.js";
import { SearchInput } from "./SearchInput.js";
import { useFormLock } from "./form-state.js";

export interface OrganizationNode {
  id: string;
  label: string;
  description?: string;
  /** Locks this node only; selectable descendants remain available. */
  disabled?: boolean;
  children?: OrganizationNode[];
}
export interface OrganizationTreeSelectProps {
  label: string;
  nodes: OrganizationNode[];
  value: string[];
  onValueChange: (ids: string[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  description?: string;
}

function organizationIndex(nodes: OrganizationNode[]) {
  const result = new Map<string, { node: OrganizationNode; path: string }>();
  const visit = (items: OrganizationNode[], path = "") =>
    items.forEach((node) => {
      const current = path ? `${path} / ${node.label}` : node.label;
      result.set(node.id, { node, path: current });
      if (node.children) visit(node.children, current);
    });
  visit(nodes);
  return result;
}

/** A controlled UI selector, not an authorization or recursive membership rule. */
export function OrganizationTreeSelect({
  label,
  nodes,
  value,
  onValueChange,
  multiple = false,
  disabled: ownDisabled,
  description,
}: OrganizationTreeSelectProps) {
  const disabled = useFormLock() || !!ownDisabled;
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<string[]>([]);
  const [search, setSearch] = React.useState("");
  const [expanded, setExpanded] = React.useState<string[]>([]);
  const [focused, setFocused] = React.useState<string>();
  const tree = React.useRef<HTMLUListElement>(null);
  const searchInput = React.useRef<HTMLInputElement>(null);
  const index = organizationIndex(nodes);
  const current = [...new Set(value)];
  const query = search.trim().toLocaleLowerCase();
  const filter = (items: OrganizationNode[]): OrganizationNode[] =>
    items.flatMap((node) => {
      const children = node.children ? filter(node.children) : [];
      const match = `${node.label} ${node.description ?? ""}`
        .toLocaleLowerCase()
        .includes(query);
      return !query || match || children.length
        ? [{ ...node, children: query && !match ? children : node.children }]
        : [];
    });
  const filtered = filter(nodes);
  const isExpanded = (id: string) => !!query || expanded.includes(id);
  const visible: { node: OrganizationNode; parent?: string }[] = [];
  const visit = (items: OrganizationNode[], parent?: string) =>
    items.forEach((node) => {
      visible.push({ node, parent });
      if (node.children && isExpanded(node.id)) visit(node.children, node.id);
    });
  visit(filtered);
  const focusedId = visible.some(({ node }) => node.id === focused)
    ? focused
    : visible[0]?.node.id;
  const lockedSingle =
    !multiple && current.some((id) => index.get(id)?.node.disabled);
  const selectionDisabled = (node: OrganizationNode) =>
    !!(disabled || node.disabled || lockedSingle);
  const setDialogOpen = (next: boolean) => {
    if (next && disabled) return;
    if (next) {
      setDraft(multiple ? current : current.slice(0, 1));
      setSearch("");
      setExpanded(nodes.map((node) => node.id));
      setFocused(undefined);
    }
    setOpen(next);
  };
  const select = (node: OrganizationNode) => {
    if (selectionDisabled(node)) return;
    setDraft((previous) =>
      multiple
        ? previous.includes(node.id)
          ? previous.filter((id) => id !== node.id)
          : [...previous, node.id]
        : [node.id],
    );
  };
  const moveFocus = (id?: string) => {
    if (!id) return;
    setFocused(id);
    tree.current
      ?.querySelectorAll<HTMLElement>("[role=treeitem]")
      .forEach((item) => {
        if (item.dataset.id === id) item.focus();
      });
  };
  const toggle = (id: string) => {
    if (query) return;
    setExpanded((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  };
  const keyDown = (event: React.KeyboardEvent, node: OrganizationNode) => {
    const navigationKey = [
      "ArrowDown",
      "ArrowUp",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
      "Enter",
      " ",
    ].includes(event.key);
    const typeaheadKey =
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey;
    // Escape and Tab belong to the enclosing dialog, not the tree.
    if (!navigationKey && !typeaheadKey) return;
    event.stopPropagation();
    const position = visible.findIndex((item) => item.node.id === node.id);
    const branch = !!node.children?.length;
    if (navigationKey) event.preventDefault();
    if (event.key === "ArrowDown")
      moveFocus(visible[Math.min(position + 1, visible.length - 1)]?.node.id);
    else if (event.key === "ArrowUp")
      moveFocus(visible[Math.max(position - 1, 0)]?.node.id);
    else if (event.key === "Home") moveFocus(visible[0]?.node.id);
    else if (event.key === "End") moveFocus(visible.at(-1)?.node.id);
    else if (event.key === "ArrowRight" && branch) {
      if (!isExpanded(node.id)) toggle(node.id);
      else moveFocus(node.children?.[0]?.id);
    } else if (event.key === "ArrowLeft") {
      if (branch && isExpanded(node.id) && !query) toggle(node.id);
      else moveFocus(visible[position]?.parent);
    } else if (event.key === "Enter" || event.key === " ") select(node);
    else if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      moveFocus(
        [
          ...visible.slice(position + 1),
          ...visible.slice(0, position + 1),
        ].find((item) =>
          item.node.label
            .toLocaleLowerCase()
            .startsWith(event.key.toLocaleLowerCase()),
        )?.node.id,
      );
    }
  };
  const remove = (id: string, staged: boolean) => {
    if (disabled || index.get(id)?.node.disabled) return;
    if (staged) setDraft((previous) => previous.filter((item) => item !== id));
    else onValueChange(current.filter((item) => item !== id));
  };
  const apply = () => {
    if (disabled) return;
    // Re-evaluate constraints at commit time, including prop updates while open.
    const locked = current.filter((id) => index.get(id)?.node.disabled);
    const editable = draft.filter(
      (id) => index.has(id) && !index.get(id)?.node.disabled,
    );
    const unknown = draft.filter(
      (id) => !index.has(id) && current.includes(id),
    );
    const next = [...new Set([...locked, ...editable, ...unknown])];
    onValueChange(multiple ? next : next.slice(0, 1));
    setOpen(false);
  };
  const chips = (ids: string[], staged: boolean) =>
    ids.length > 0 && (
      <ul
        className="cheese-org-chips"
        aria-label={staged ? "적용할 조직" : "선택한 조직"}
      >
        {ids.map((id) => (
          <li key={id} className="cheese-org-chip">
            <span title={index.get(id)?.path}>
              {index.get(id)?.node.label ?? id}
            </span>
            <button
              type="button"
              disabled={disabled || index.get(id)?.node.disabled}
              aria-label={`${index.get(id)?.path ?? id} 선택 해제`}
              onClick={() => remove(id, staged)}
            >
              <X size={14} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    );
  const renderNodes = (items: OrganizationNode[]): React.ReactNode =>
    items.map((node) => (
      <li
        key={node.id}
        className="cheese-org-node"
        role="treeitem"
        data-id={node.id}
        tabIndex={focusedId === node.id ? 0 : -1}
        aria-label={`${node.label}${node.disabled ? " · 선택 불가" : ""}`}
        aria-selected={draft.includes(node.id)}
        aria-disabled={selectionDisabled(node)}
        aria-expanded={node.children?.length ? isExpanded(node.id) : undefined}
        onFocus={(event) => {
          if (event.target === event.currentTarget) setFocused(node.id);
        }}
        onKeyDown={(event) => keyDown(event, node)}
      >
        <div
          className="cheese-org-row"
          data-selected={draft.includes(node.id)}
          data-disabled={selectionDisabled(node) || undefined}
          onClick={() => {
            moveFocus(node.id);
            select(node);
          }}
        >
          <span
            className="cheese-org-caret"
            data-expanded={isExpanded(node.id)}
            aria-hidden="true"
            onClick={(event) => {
              if (node.children?.length) {
                event.stopPropagation();
                moveFocus(node.id);
                toggle(node.id);
              }
            }}
          >
            {node.children?.length ? <ChevronRight size={16} /> : null}
          </span>
          <span
            className="cheese-org-check"
            data-checked={draft.includes(node.id)}
            data-multiple={multiple}
            aria-hidden="true"
          >
            {draft.includes(node.id) && <Check size={13} />}
          </span>
          <span className="cheese-org-copy">
            <strong>
              {node.label}
              {node.disabled && <small> · 선택 불가</small>}
            </strong>
            {node.description && <small>{node.description}</small>}
          </span>
        </div>
        {node.children?.length && isExpanded(node.id) ? (
          <ul role="group" className="cheese-org-branch">
            {renderNodes(node.children)}
          </ul>
        ) : null}
      </li>
    ));
  return (
    <div className="cheese-org-select">
      <span className="cheese-label">{label}</span>
      {description && <p className="cheese-org-hint">{description}</p>}
      <DialogRoot open={open} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="weak" disabled={disabled}>
            <Building2 size={16} aria-hidden="true" />
            {label} 선택{current.length ? ` · ${current.length}개` : ""}
          </Button>
        </DialogTrigger>
        <DialogContent
          className="cheese-org-dialog"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            searchInput.current?.focus();
          }}
        >
          <div className="cheese-org-dialog-heading">
            <DialogTitle>{label} 선택</DialogTitle>
            <DialogDescription>
              선택한 조직만 적용됩니다. 하위 조직은 자동으로 선택되지 않습니다.
            </DialogDescription>
          </div>
          <SearchInput
            ref={searchInput}
            label="조직 검색"
            value={search}
            onValueChange={setSearch}
            onSearch={() => {}}
            disabled={disabled}
          />
          {visible.length ? (
            <ul
              ref={tree}
              className="cheese-org-tree"
              role="tree"
              aria-label="선택할 조직"
              aria-multiselectable={multiple}
            >
              {renderNodes(filtered)}
            </ul>
          ) : (
            <p className="cheese-org-empty">
              검색 결과가 없습니다. 다른 조직명으로 검색해 주세요.
            </p>
          )}
          {chips(draft, true)}
          <div className="cheese-org-footer">
            <span className="cheese-org-hint" role="status">
              {draft.length}개 선택
            </span>
            <div className="cheese-dialog-actions">
              <Button variant="weak" onClick={() => setOpen(false)}>
                취소
              </Button>
              <Button disabled={disabled} onClick={apply}>
                선택 적용
              </Button>
            </div>
          </div>
        </DialogContent>
      </DialogRoot>
      {chips(current, false)}
    </div>
  );
}

export interface PermissionAction {
  id: string;
  label: string;
}
export interface PermissionResource {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
  /** Unsupported cells are never selectable, even through row selection. */
  unavailableActions?: string[];
}
export interface PermissionGrant {
  resourceId: string;
  actionId: string;
}
export interface PermissionMatrixProps {
  label: string;
  resources: PermissionResource[];
  actions: PermissionAction[];
  value: PermissionGrant[];
  onValueChange: (grants: PermissionGrant[]) => void;
  readOnly?: boolean;
  disabled?: boolean;
}

/** Presents a permission draft. Actual enforcement always belongs to the server. */
export function PermissionMatrix({
  label,
  resources,
  actions,
  value,
  onValueChange,
  readOnly,
  disabled: ownDisabled,
}: PermissionMatrixProps) {
  const disabled = useFormLock() || !!ownDisabled;
  const hintId = React.useId();
  const selected = (resourceId: string, actionId: string) =>
    value.some(
      (grant) => grant.resourceId === resourceId && grant.actionId === actionId,
    );
  const available = (resource: PermissionResource, action: PermissionAction) =>
    !resource.unavailableActions?.includes(action.id);
  const toggle = (
    resource: PermissionResource,
    targets: PermissionAction[],
    checked: boolean,
  ) => {
    if (readOnly || disabled || resource.disabled) return;
    const eligible = targets.filter((action) => available(resource, action));
    const ids = new Set(eligible.map((action) => action.id));
    const next = value.filter(
      (grant) => grant.resourceId !== resource.id || !ids.has(grant.actionId),
    );
    if (checked)
      next.push(
        ...eligible.map((action) => ({
          resourceId: resource.id,
          actionId: action.id,
        })),
      );
    onValueChange(next);
  };
  return (
    <div className="cheese-permission-matrix">
      <p id={hintId} className="cheese-org-hint">
        {readOnly
          ? "조회 전용입니다. "
          : "행 선택은 사용 가능한 항목에만 적용됩니다. "}
        이 화면은 권한 설정 UI이며, 실제 접근 통제는 서버에서 검증해야 합니다.
      </p>
      <div
        className="cheese-permission-scroll"
        role="region"
        aria-label={`${label} 표`}
        aria-describedby={hintId}
        tabIndex={0}
      >
        <table className="cheese-permission-table">
          <caption>{label}</caption>
          <thead>
            <tr>
              <th scope="col">대상</th>
              <th scope="col">행 선택</th>
              {actions.map((action) => (
                <th scope="col" key={action.id}>
                  {action.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resources.map((resource) => {
              const eligible = actions.filter((action) =>
                available(resource, action),
              );
              const count = eligible.filter((action) =>
                selected(resource.id, action.id),
              ).length;
              const state =
                eligible.length && count === eligible.length
                  ? true
                  : count > 0
                    ? "indeterminate"
                    : false;
              return (
                <tr key={resource.id}>
                  <th scope="row">
                    <span className="cheese-permission-resource">
                      <strong>{resource.label}</strong>
                      {resource.description && (
                        <small>{resource.description}</small>
                      )}
                    </span>
                  </th>
                  <td>
                    <CheckboxRoot
                      aria-label={`${resource.label} 사용 가능한 권한 전체`}
                      checked={state}
                      disabled={
                        readOnly ||
                        disabled ||
                        resource.disabled ||
                        !eligible.length
                      }
                      onCheckedChange={(checked) =>
                        toggle(resource, eligible, checked === true)
                      }
                    />
                  </td>
                  {actions.map((action) => (
                    <td key={action.id}>
                      {available(resource, action) ? (
                        <CheckboxRoot
                          aria-label={`${resource.label} ${action.label}`}
                          checked={selected(resource.id, action.id)}
                          disabled={readOnly || disabled || resource.disabled}
                          onCheckedChange={(checked) =>
                            toggle(resource, [action], checked === true)
                          }
                        />
                      ) : (
                        <span
                          className="cheese-permission-unavailable"
                          aria-label={`${resource.label} ${action.label} 제공하지 않음`}
                        >
                          —
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        {!resources.length && (
          <p className="cheese-org-empty">설정할 대상이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export interface SortableListItem {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
}
export interface SortableListProps<
  T extends SortableListItem = SortableListItem,
> {
  label: string;
  items: T[];
  onItemsChange: (items: T[]) => void;
  disabled?: boolean;
  description?: string;
}

/** Accessible button/keyboard reordering. Locked items form immovable boundaries. */
export function SortableList<T extends SortableListItem>({
  label,
  items,
  onItemsChange,
  disabled: ownDisabled,
  description,
}: SortableListProps<T>) {
  const disabled = useFormLock() || !!ownDisabled;
  const root = React.useRef<HTMLOListElement>(null);
  const pendingFocus = React.useRef<
    { id: string; position: number } | undefined
  >(undefined);
  const [announcement, setAnnouncement] = React.useState("");
  const hintId = React.useId();
  React.useLayoutEffect(() => {
    const pending = pendingFocus.current;
    if (!pending) return;
    pendingFocus.current = undefined;
    if (items[pending.position]?.id !== pending.id) return;
    root.current
      ?.querySelectorAll<HTMLElement>("[data-sort-id]")
      .forEach((element) => {
        if (element.dataset.sortId === pending.id) element.focus();
      });
    setAnnouncement(
      `${items[pending.position].label}, ${items.length}개 중 ${pending.position + 1}번째로 이동했습니다.`,
    );
  }, [items]);
  const canMove = (position: number, offset: number) =>
    !disabled &&
    !items[position]?.disabled &&
    position + offset >= 0 &&
    position + offset < items.length &&
    !items[position + offset]?.disabled;
  const move = (position: number, offset: number) => {
    if (!canMove(position, offset)) return;
    const next = [...items];
    [next[position], next[position + offset]] = [
      next[position + offset],
      next[position],
    ];
    pendingFocus.current = {
      id: items[position].id,
      position: position + offset,
    };
    onItemsChange(next);
  };
  return (
    <div className="cheese-sortable">
      <span className="cheese-label">{label}</span>
      <p id={hintId} className="cheese-org-hint">
        {description ? `${description} ` : ""}이동 버튼 또는 Alt + 위·아래
        방향키로 순서를 바꿀 수 있습니다.
      </p>
      <ol
        ref={root}
        className="cheese-sortable-list"
        aria-label={label}
        aria-describedby={hintId}
      >
        {items.map((item, position) => (
          <li
            key={item.id}
            className="cheese-sortable-item"
            data-sort-id={item.id}
            data-disabled={disabled || item.disabled || undefined}
            tabIndex={disabled || item.disabled ? -1 : 0}
            aria-label={`${position + 1}. ${item.label}${item.disabled ? " · 위치 고정" : ""}`}
            onKeyDown={(event) => {
              if (
                event.altKey &&
                ["ArrowUp", "ArrowDown"].includes(event.key)
              ) {
                event.preventDefault();
                move(position, event.key === "ArrowUp" ? -1 : 1);
              }
            }}
          >
            <span className="cheese-sortable-index" aria-hidden="true">
              {position + 1}
            </span>
            <span className="cheese-sortable-copy">
              <strong>
                {item.label}
                {item.disabled ? " · 위치 고정" : ""}
              </strong>
              {item.description && <small>{item.description}</small>}
            </span>
            <div className="cheese-sortable-controls">
              <Button
                variant="ghost"
                size="sm"
                disabled={!canMove(position, -1)}
                aria-label={`${item.label} 위로 이동`}
                onClick={() => move(position, -1)}
              >
                <ArrowUp size={16} aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={!canMove(position, 1)}
                aria-label={`${item.label} 아래로 이동`}
                onClick={() => move(position, 1)}
              >
                <ArrowDown size={16} aria-hidden="true" />
              </Button>
            </div>
          </li>
        ))}
      </ol>
      {!items.length && (
        <p className="cheese-org-empty">순서를 정할 항목이 없습니다.</p>
      )}
      <span
        role="status"
        className="cheese-sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </span>
    </div>
  );
}
