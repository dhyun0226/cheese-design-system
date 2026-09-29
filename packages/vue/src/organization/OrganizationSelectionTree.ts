import {
  computed,
  defineComponent,
  h,
  ref,
  type PropType,
  type VNode,
} from "vue";
import { Check, ChevronRight } from "@lucide/vue";
import type { OrganizationNode } from "./types";

/** Internal tree: focus/navigation and selection are intentionally independent. */
export default defineComponent({
  props: {
    nodes: { type: Array as PropType<OrganizationNode[]>, required: true },
    label: { type: String, required: true },
    selected: { type: Array as PropType<string[]>, required: true },
    expanded: { type: Array as PropType<string[]>, required: true },
    multiple: Boolean,
    nodeDisabled: {
      type: Function as PropType<(node: OrganizationNode) => boolean>,
      required: true,
    },
  },
  emits: {
    select: (_node: OrganizationNode) => true,
    "update:expanded": (_ids: string[]) => true,
  },
  setup(props, { emit }) {
    const root = ref<HTMLElement>();
    const focused = ref<string>();
    const visible = computed(() => {
      const rows: { node: OrganizationNode; parent?: string }[] = [];
      const visit = (nodes: OrganizationNode[], parent?: string) => {
        for (const node of nodes) {
          rows.push({ node, parent });
          if (props.expanded.includes(node.id) && node.children?.length)
            visit(node.children, node.id);
        }
      };
      visit(props.nodes);
      return rows;
    });
    const move = (id?: string) => {
      if (!id) return;
      focused.value = id;
      root.value
        ?.querySelectorAll<HTMLElement>("[role=treeitem]")
        .forEach((item) => {
          if (item.dataset.organizationId === id) item.focus();
        });
    };
    const toggle = (id: string) =>
      emit(
        "update:expanded",
        props.expanded.includes(id)
          ? props.expanded.filter((item) => item !== id)
          : [...props.expanded, id],
      );
    const select = (node: OrganizationNode) => {
      if (!props.nodeDisabled(node)) emit("select", node);
    };
    const keydown = (event: KeyboardEvent, node: OrganizationNode) => {
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
      // Escape and Tab must reach the enclosing dialog's dismiss/focus handling.
      if (!navigationKey && !typeaheadKey) return;
      event.stopPropagation();
      const rows = visible.value;
      const index = rows.findIndex((row) => row.node.id === node.id);
      const expanded = props.expanded.includes(node.id);
      const branch = !!node.children?.length;
      if (navigationKey) event.preventDefault();
      if (event.key === "ArrowDown")
        move(rows[Math.min(rows.length - 1, index + 1)]?.node.id);
      else if (event.key === "ArrowUp")
        move(rows[Math.max(0, index - 1)]?.node.id);
      else if (event.key === "Home") move(rows[0]?.node.id);
      else if (event.key === "End") move(rows.at(-1)?.node.id);
      else if (event.key === "ArrowRight" && branch) {
        if (!expanded) toggle(node.id);
        else move(node.children?.[0]?.id);
      } else if (event.key === "ArrowLeft") {
        if (expanded && branch) toggle(node.id);
        else move(rows[index]?.parent);
      } else if (event.key === "Enter" || event.key === " ") select(node);
      else if (
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey
      )
        move(
          [...rows.slice(index + 1), ...rows.slice(0, index + 1)].find((row) =>
            row.node.label
              .toLocaleLowerCase()
              .startsWith(event.key.toLocaleLowerCase()),
          )?.node.id,
        );
    };
    const renderNodes = (nodes: OrganizationNode[]): VNode[] =>
      nodes.map((node) => {
        const expanded = props.expanded.includes(node.id);
        const selected = props.selected.includes(node.id);
        const disabled = props.nodeDisabled(node);
        const hasChildren = !!node.children?.length;
        const tabStop = visible.value.some(
          (row) => row.node.id === focused.value,
        )
          ? focused.value
          : visible.value[0]?.node.id;
        return h(
          "li",
          {
            key: node.id,
            role: "treeitem",
            class: "cheese-org-node",
            "data-organization-id": node.id,
            "aria-label": node.label,
            "aria-selected": selected,
            "aria-disabled": disabled,
            "aria-expanded": hasChildren ? expanded : undefined,
            tabindex: node.id === tabStop ? 0 : -1,
            onFocus: (event: FocusEvent) => {
              if (event.target === event.currentTarget) focused.value = node.id;
            },
            onKeydown: (event: KeyboardEvent) => keydown(event, node),
          },
          [
            h(
              "div",
              {
                class: "cheese-org-row",
                "data-selected": selected,
                "data-disabled": disabled || undefined,
                onClick: () => {
                  move(node.id);
                  select(node);
                },
              },
              [
                h(
                  "span",
                  {
                    class: "cheese-org-caret",
                    "data-expanded": expanded,
                    "aria-hidden": true,
                    onClick: (event: MouseEvent) => {
                      if (hasChildren) {
                        event.stopPropagation();
                        move(node.id);
                        toggle(node.id);
                      }
                    },
                  },
                  hasChildren ? [h(ChevronRight, { size: 16 })] : [],
                ),
                h(
                  "span",
                  {
                    class: "cheese-org-check",
                    "data-checked": selected,
                    "data-multiple": props.multiple,
                    "aria-hidden": true,
                  },
                  selected ? [h(Check, { size: 13 })] : [],
                ),
                h("span", { class: "cheese-org-copy" }, [
                  h("strong", node.label),
                  node.description ? h("small", node.description) : null,
                ]),
              ],
            ),
            hasChildren && expanded
              ? h(
                  "ul",
                  { role: "group", class: "cheese-org-branch" },
                  renderNodes(node.children!),
                )
              : null,
          ],
        );
      });
    return () =>
      h(
        "ul",
        {
          ref: root,
          role: "tree",
          class: "cheese-org-tree",
          "aria-label": props.label,
          "aria-multiselectable": props.multiple,
        },
        renderNodes(props.nodes),
      );
  },
});
