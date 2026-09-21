import { defineComponent, h, ref, type PropType } from 'vue'

export interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
}

export const Tree = defineComponent({
  name: 'CheeseTree',
  props: {
    nodes: { type: Array as PropType<TreeNode[]>, required: true },
    defaultExpanded: { type: Array as PropType<string[]>, default: () => [] },
  },
  emits: { select: (_node: TreeNode) => true },
  setup(props, { emit }) {
    const expanded = ref(new Set(props.defaultExpanded))
    const selected = ref<string>()
    const toggle = (id: string) => {
      const next = new Set(expanded.value)
      next.has(id) ? next.delete(id) : next.add(id)
      expanded.value = next
    }
    const renderNodes = (nodes: TreeNode[], level = 1): ReturnType<typeof h>[] => nodes.map((node) => {
      const hasChildren = Boolean(node.children?.length)
      const isExpanded = expanded.value.has(node.id)
      return h('div', { role: 'none', key: node.id }, [
        h('button', {
          class: 'cheese-tree-item', role: 'treeitem', 'aria-level': level,
          'aria-selected': selected.value === node.id,
          'aria-expanded': hasChildren ? isExpanded : undefined,
          style: { paddingLeft: `${10 + (level - 1) * 20}px` },
          onClick: () => { if (hasChildren) toggle(node.id); selected.value = node.id; emit('select', node) },
        }, [h('span', { 'aria-hidden': 'true' }, hasChildren ? (isExpanded ? '⌄' : '›') : '·'), node.label]),
        hasChildren && isExpanded ? h('div', { role: 'group' }, renderNodes(node.children!, level + 1)) : null,
      ])
    })
    const onKeydown = (event: KeyboardEvent) => {
      const root = event.currentTarget as HTMLElement
      const items = [...root.querySelectorAll<HTMLButtonElement>('[role="treeitem"]')]
      const index = items.indexOf(document.activeElement as HTMLButtonElement)
      if (event.key === 'ArrowDown' && items[index + 1]) { event.preventDefault(); items[index + 1].focus() }
      if (event.key === 'ArrowUp' && items[index - 1]) { event.preventDefault(); items[index - 1].focus() }
      if (event.key === 'Home' && items[0]) { event.preventDefault(); items[0].focus() }
      if (event.key === 'End' && items.at(-1)) { event.preventDefault(); items.at(-1)!.focus() }
    }
    return () => h('div', { class: 'cheese-tree', role: 'tree', onKeydown }, renderNodes(props.nodes))
  },
})
