import * as React from 'react'
import { Checkbox, Dialog, Switch, Tabs } from 'radix-ui'

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
