import { defineComponent, h } from 'vue'

export const Textarea = defineComponent({
  name: 'CheeseTextarea',
  inheritAttrs: false,
  setup(_, { attrs }) {
    return () => h('textarea', { ...attrs, class: ['cheese-input', 'cheese-textarea', attrs.class] })
  },
})

export const NativeSelect = defineComponent({
  name: 'CheeseNativeSelect',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h('select', { ...attrs, class: ['cheese-input', 'cheese-select', attrs.class] }, slots.default?.())
  },
})

export const Card = defineComponent({
  name: 'CheeseCard',
  setup(_, { attrs, slots }) {
    return () => h('article', { ...attrs, class: ['cheese-card', attrs.class] }, slots.default?.())
  },
})

export const Badge = defineComponent({
  name: 'CheeseBadge',
  props: { tone: { type: String, default: 'neutral' } },
  setup(props, { attrs, slots }) {
    return () => h('span', { ...attrs, 'data-tone': props.tone, class: ['cheese-badge', attrs.class] }, slots.default?.())
  },
})
