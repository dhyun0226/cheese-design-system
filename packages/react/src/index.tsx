import * as React from 'react'
import { Checkbox, Dialog, Switch, Tabs } from 'radix-ui'
export { Search, Plus, X, Check, ChevronDown, ChevronLeft, ChevronRight, Calendar, Clock, User, Users, Settings, Bell, Upload, Download, Trash2, Pencil, MoreHorizontal, Info, CircleAlert, CircleCheck, Eye, EyeOff, Lock, LogOut, Menu } from 'lucide-react'
export type { LucideIcon, LucideProps } from 'lucide-react'

export type ButtonVariant = 'primary' | 'accent' | 'weak' | 'critical'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', className = '', type = 'button', ...props },
  ref,
) {
  return <button ref={ref} type={type} data-variant={variant} className={`cheese-button ${className}`.trim()} {...props} />
})

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className = '', ...props },
  ref,
) {
  return <input ref={ref} className={`cheese-input ${className}`.trim()} {...props} />
})

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className = '', ...props },
  ref,
) {
  return <textarea ref={ref} className={`cheese-input cheese-textarea ${className}`.trim()} {...props} />
})

export const NativeSelect = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function NativeSelect(
  { className = '', ...props },
  ref,
) {
  return <select ref={ref} className={`cheese-input cheese-select ${className}`.trim()} {...props} />
})

export function Field({ label, description, error, children }: { label: string; description?: string; error?: string; children: React.ReactNode }) {
  return <label className="cheese-field"><span className="cheese-label">{label}</span>{children}<small data-error={Boolean(error)}>{error || description}</small></label>
}

export function Card({ className = '', ...props }: React.HTMLAttributes<HTMLElement>) {
  return <article className={`cheese-card ${className}`.trim()} {...props} />
}

export function Badge({ tone = 'neutral', className = '', ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: 'neutral' | 'brand' | 'positive' | 'critical' }) {
  return <span data-tone={tone} className={`cheese-badge ${className}`.trim()} {...props} />
}

export interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
}

export function Tree({ nodes, defaultExpanded = [], onSelect }: { nodes: TreeNode[]; defaultExpanded?: string[]; onSelect?: (node: TreeNode) => void }) {
  const [expanded, setExpanded] = React.useState(() => new Set(defaultExpanded))
  const [selected, setSelected] = React.useState<string>()
  const toggle = (id: string) => setExpanded((current) => {
    const next = new Set(current)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })
  const renderNodes = (items: TreeNode[], level = 1): React.ReactNode => items.map((node) => {
    const hasChildren = Boolean(node.children?.length)
    const isExpanded = expanded.has(node.id)
    return <div key={node.id} role="none">
      <button className="cheese-tree-item" role="treeitem" aria-level={level} aria-selected={selected === node.id} aria-expanded={hasChildren ? isExpanded : undefined} style={{ paddingLeft: `${10 + (level - 1) * 20}px` }} onClick={() => { if (hasChildren) toggle(node.id); setSelected(node.id); onSelect?.(node) }}>
        <span aria-hidden="true">{hasChildren ? (isExpanded ? '⌄' : '›') : '·'}</span>{node.label}
      </button>
      {hasChildren && isExpanded && <div role="group">{renderNodes(node.children!, level + 1)}</div>}
    </div>
  })
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const items = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="treeitem"]')]
    const index = items.indexOf(document.activeElement as HTMLButtonElement)
    if (event.key === 'ArrowDown' && items[index + 1]) { event.preventDefault(); items[index + 1].focus() }
    if (event.key === 'ArrowUp' && items[index - 1]) { event.preventDefault(); items[index - 1].focus() }
    if (event.key === 'Home' && items[0]) { event.preventDefault(); items[0].focus() }
    if (event.key === 'End' && items.at(-1)) { event.preventDefault(); items.at(-1)!.focus() }
  }
  return <div className="cheese-tree" role="tree" onKeyDown={onKeyDown}>{renderNodes(nodes)}</div>
}

export const CheckboxRoot = Checkbox.Root
export const CheckboxIndicator = Checkbox.Indicator
export const SwitchRoot = Switch.Root
export const SwitchThumb = Switch.Thumb
export const TabsRoot = Tabs.Root
export const TabsList = Tabs.List
export const TabsTrigger = Tabs.Trigger
export const TabsContent = Tabs.Content

export const DialogRoot = Dialog.Root
export const DialogTrigger = Dialog.Trigger
export const DialogClose = Dialog.Close
export const DialogTitle = Dialog.Title
export const DialogDescription = Dialog.Description

export function DialogContent({ className = '', children, ...props }: React.ComponentPropsWithoutRef<typeof Dialog.Content>) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay style={{ position: 'fixed', inset: 0, background: 'rgb(0 0 0 / 46%)' }} />
      <Dialog.Content className={`cheese-dialog ${className}`.trim()} style={{ position: 'fixed', inset: '50% auto auto 50%', transform: 'translate(-50%, -50%)' }} {...props}>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  )
}

export * from 'radix-ui'
