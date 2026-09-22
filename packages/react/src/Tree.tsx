import * as React from "react";
import { ChevronRight, File, Folder, FolderOpen } from "lucide-react";
export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}
export interface TreeProps {
  nodes: TreeNode[];
  label?: string;
  defaultExpanded?: string[];
  expanded?: string[];
  onExpandedChange?: (ids: string[]) => void;
  selected?: string;
  onSelect?: (node: TreeNode) => void;
}
export function Tree({
  nodes,
  label = "탐색",
  defaultExpanded = [],
  expanded: controlled,
  onExpandedChange,
  selected: controlledSelected,
  onSelect,
}: TreeProps) {
  const [local, setLocal] = React.useState(defaultExpanded),
    [selection, setSelection] = React.useState<string>(),
    [focus, setFocus] = React.useState(nodes[0]?.id);
  const root = React.useRef<HTMLUListElement>(null);
  const expanded = controlled ?? local,
    selected = controlledSelected ?? selection;
  const visible: { node: TreeNode; parent?: string }[] = [];
  const visit = (items: TreeNode[], parent?: string) =>
    items.forEach((node) => {
      visible.push({ node, parent });
      if (expanded.includes(node.id) && node.children)
        visit(node.children, node.id);
    });
  visit(nodes);
  const focusId = visible.some((i) => i.node.id === focus)
    ? focus
    : visible[0]?.node.id;
  const move = (id?: string) => {
    if (!id) return;
    setFocus(id);
    root.current
      ?.querySelectorAll<HTMLElement>("[role=treeitem]")
      .forEach((el) => {
        if (el.dataset.id === id) el.focus();
      });
  };
  const toggle = (id: string) => {
    const next = expanded.includes(id)
      ? expanded.filter((v) => v !== id)
      : [...expanded, id];
    if (controlled === undefined) setLocal(next);
    onExpandedChange?.(next);
  };
  const select = (node: TreeNode) => {
    setSelection(node.id);
    onSelect?.(node);
  };
  const key = (e: React.KeyboardEvent, node: TreeNode) => {
    e.stopPropagation();
    const index = visible.findIndex((i) => i.node.id === node.id);
    const open = expanded.includes(node.id),
      branch = !!node.children?.length;
    if (
      [
        "ArrowDown",
        "ArrowUp",
        "Home",
        "End",
        "ArrowRight",
        "ArrowLeft",
        "Enter",
        " ",
      ].includes(e.key)
    )
      e.preventDefault();
    if (e.key === "ArrowDown")
      move(visible[Math.min(visible.length - 1, index + 1)]?.node.id);
    else if (e.key === "ArrowUp")
      move(visible[Math.max(0, index - 1)]?.node.id);
    else if (e.key === "Home") move(visible[0]?.node.id);
    else if (e.key === "End") move(visible.at(-1)?.node.id);
    else if (e.key === "ArrowRight" && branch) {
      if (!open) toggle(node.id);
      else move(node.children?.[0]?.id);
    } else if (e.key === "ArrowLeft") {
      if (branch && open) toggle(node.id);
      else move(visible[index]?.parent);
    } else if (e.key === "Enter" || e.key === " ") select(node);
    else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      const after = [
        ...visible.slice(index + 1),
        ...visible.slice(0, index + 1),
      ];
      move(
        after.find((i) =>
          i.node.label
            .toLocaleLowerCase()
            .startsWith(e.key.toLocaleLowerCase()),
        )?.node.id,
      );
    }
  };
  const render = (items: TreeNode[]): React.ReactNode =>
    items.map((node) => (
      <li
        key={node.id}
        className="cheese-tree-node"
        role="treeitem"
        data-id={node.id}
        aria-label={node.label}
        aria-expanded={
          node.children?.length ? expanded.includes(node.id) : undefined
        }
        aria-selected={selected === node.id}
        tabIndex={focusId === node.id ? 0 : -1}
        onFocus={(e) => {
          if (e.target === e.currentTarget) setFocus(node.id);
        }}
        onKeyDown={(e) => key(e, node)}
      >
        <div
          className="cheese-tree-row"
          onClick={() => {
            move(node.id);
            select(node);
          }}
        >
          <span
            className="cheese-tree-caret"
            data-open={expanded.includes(node.id)}
            aria-hidden="true"
            onClick={(e) => {
              if (node.children?.length) {
                e.stopPropagation();
                move(node.id);
                toggle(node.id);
              }
            }}
          >
            {node.children?.length ? <ChevronRight size={16} /> : null}
          </span>
          {node.children?.length ? (
            expanded.includes(node.id) ? (
              <FolderOpen className="cheese-tree-icon" aria-hidden="true" />
            ) : (
              <Folder className="cheese-tree-icon" aria-hidden="true" />
            )
          ) : (
            <File className="cheese-tree-icon" aria-hidden="true" />
          )}
          {node.label}
        </div>
        {node.children?.length && expanded.includes(node.id) ? (
          <ul role="group">{render(node.children)}</ul>
        ) : null}
      </li>
    ));
  return (
    <ul
      ref={root}
      role="tree"
      aria-label={label}
      className="cheese-tree"
      style={{ listStyle: "none", padding: 0, margin: 0 }}
    >
      {render(nodes)}
    </ul>
  );
}
