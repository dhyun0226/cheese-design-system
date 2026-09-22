import {
  defineComponent,
  h,
  ref,
  computed,
  type PropType,
  type VNode,
} from "vue";
export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}
export const Tree = defineComponent({
  props: {
    nodes: { type: Array as PropType<TreeNode[]>, required: true },
    label: { type: String, default: "탐색" },
    defaultExpanded: { type: Array as PropType<string[]>, default: () => [] },
    expanded: Array as PropType<string[]>,
    selected: String,
  },
  emits: {
    select: (_node: TreeNode) => true,
    "update:expanded": (_ids: string[]) => true,
  },
  setup(props, { emit }) {
    const local = ref([...props.defaultExpanded]),
      selected = ref<string>(),
      focus = ref(props.nodes[0]?.id),
      root = ref<HTMLElement>();
    const expanded = computed(() => props.expanded ?? local.value);
    const visible = computed(() => {
      const rows: { node: TreeNode; parent?: string }[] = [];
      const visit = (nodes: TreeNode[], parent?: string) =>
        nodes.forEach((node) => {
          rows.push({ node, parent });
          if (expanded.value.includes(node.id) && node.children)
            visit(node.children, node.id);
        });
      visit(props.nodes);
      return rows;
    });
    const move = (id?: string) => {
      if (!id) return;
      focus.value = id;
      root.value
        ?.querySelectorAll<HTMLElement>("[role=treeitem]")
        .forEach((el) => {
          if (el.dataset.id === id) el.focus();
        });
    };
    const toggle = (id: string) => {
      const next = expanded.value.includes(id)
        ? expanded.value.filter((v) => v !== id)
        : [...expanded.value, id];
      if (props.expanded === undefined) local.value = next;
      emit("update:expanded", next);
    };
    const select = (node: TreeNode) => {
      selected.value = node.id;
      emit("select", node);
    };
    const key = (e: KeyboardEvent, node: TreeNode) => {
      e.stopPropagation();
      const rows = visible.value,
        index = rows.findIndex((i) => i.node.id === node.id),
        open = expanded.value.includes(node.id),
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
        move(rows[Math.min(rows.length - 1, index + 1)]?.node.id);
      else if (e.key === "ArrowUp") move(rows[Math.max(0, index - 1)]?.node.id);
      else if (e.key === "Home") move(rows[0]?.node.id);
      else if (e.key === "End") move(rows.at(-1)?.node.id);
      else if (e.key === "ArrowRight" && branch) {
        if (!open) toggle(node.id);
        else move(node.children?.[0]?.id);
      } else if (e.key === "ArrowLeft") {
        if (open && branch) toggle(node.id);
        else move(rows[index]?.parent);
      } else if (e.key === "Enter" || e.key === " ") select(node);
      else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey)
        move(
          [...rows.slice(index + 1), ...rows.slice(0, index + 1)].find((i) =>
            i.node.label
              .toLocaleLowerCase()
              .startsWith(e.key.toLocaleLowerCase()),
          )?.node.id,
        );
    };
    const render = (nodes: TreeNode[]): VNode[] =>
      nodes.map((node) =>
        h(
          "li",
          {
            key: node.id,
            role: "treeitem",
            class: "cheese-tree-node",
            "data-id": node.id,
            "aria-label": node.label,
            "aria-expanded": node.children?.length
              ? expanded.value.includes(node.id)
              : undefined,
            "aria-selected": (props.selected ?? selected.value) === node.id,
            tabindex:
              (visible.value.some((i) => i.node.id === focus.value)
                ? focus.value
                : visible.value[0]?.node.id) === node.id
                ? 0
                : -1,
            onFocus: (e: FocusEvent) => {
              if (e.target === e.currentTarget) focus.value = node.id;
            },
            onKeydown: (e: KeyboardEvent) => key(e, node),
          },
          [
            h(
              "div",
              {
                class: "cheese-tree-row",
                onClick: () => {
                  move(node.id);
                  select(node);
                },
              },
              [
                h(
                  "span",
                  {
                    class: "cheese-tree-caret",
                    "aria-hidden": true,
                    onClick: (e: MouseEvent) => {
                      if (node.children?.length) {
                        e.stopPropagation();
                        move(node.id);
                        toggle(node.id);
                      }
                    },
                  },
                  node.children?.length
                    ? expanded.value.includes(node.id)
                      ? "⌄"
                      : "›"
                    : "·",
                ),
                node.label,
              ],
            ),
            node.children?.length && expanded.value.includes(node.id)
              ? h("ul", { role: "group" }, render(node.children))
              : null,
          ],
        ),
      );
    return () =>
      h(
        "ul",
        {
          ref: root,
          role: "tree",
          "aria-label": props.label,
          class: "cheese-tree",
          style: { listStyle: "none", padding: 0, margin: 0 },
        },
        render(props.nodes),
      );
  },
});
