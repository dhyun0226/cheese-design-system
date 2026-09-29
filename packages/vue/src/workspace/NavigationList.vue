<script setup lang="ts">
import { computed, useId } from "vue";
import type { NavigationItem } from "./types";

const props = withDefaults(
  defineProps<{
    items: NavigationItem[];
    activeId?: string;
    label?: string;
  }>(),
  { label: "주 메뉴" },
);

const emit = defineEmits<{
  navigate: [id: string, event: MouseEvent];
}>();

const id = useId();

function safeNavigationHref(value?: string): string | undefined {
  if (!value) return undefined;
  const href = value.trim();
  const compact = href.replace(/[\u0000-\u0020\u007f]/g, "");
  if (!compact) return undefined;
  if (
    /^[a-z][a-z\d+.-]*:/i.test(compact) &&
    !/^(https?|mailto|tel):/i.test(compact)
  )
    return undefined;
  return href;
}

const groups = computed(() => {
  const result = new Map<
    string,
    {
      label: string;
      items: { item: NavigationItem; href?: string; disabled: boolean }[];
    }
  >();

  for (const item of props.items) {
    const label = item.group ?? "";
    let group = result.get(label);
    if (!group) {
      group = { label, items: [] };
      result.set(label, group);
    }
    const href = safeNavigationHref(item.href);
    group.items.push({
      item,
      href,
      disabled: !!item.disabled || (!!item.href && !href),
    });
  }

  return [...result.values()];
});

function navigate(
  entry: { item: NavigationItem; disabled: boolean },
  event: MouseEvent,
) {
  if (entry.disabled) {
    event.preventDefault();
    return;
  }
  emit("navigate", entry.item.id, event);
}
</script>

<template>
  <nav class="cheese-workspace-navigation" :aria-label="label">
    <div
      v-for="(group, groupIndex) in groups"
      :key="group.label"
      class="cheese-navigation-group"
    >
      <p
        v-if="group.label"
        :id="`${id}-group-${groupIndex}`"
        class="cheese-navigation-group-label"
      >
        {{ group.label }}
      </p>
      <ul
        :aria-labelledby="group.label ? `${id}-group-${groupIndex}` : undefined"
      >
        <li v-for="entry in group.items" :key="entry.item.id">
          <component
            :is="entry.href !== undefined && !entry.disabled ? 'a' : 'button'"
            :href="!entry.disabled ? entry.href : undefined"
            :type="
              entry.href === undefined || entry.disabled ? 'button' : undefined
            "
            :disabled="entry.disabled || undefined"
            :aria-disabled="entry.disabled || undefined"
            :aria-current="entry.item.id === activeId ? 'page' : undefined"
            class="cheese-workspace-navigation-link"
            @click="navigate(entry, $event)"
          >
            <span
              v-if="entry.item.icon"
              class="cheese-navigation-icon"
              aria-hidden="true"
            >
              <component :is="entry.item.icon" />
            </span>
            <span class="cheese-navigation-label">{{ entry.item.label }}</span>
          </component>
        </li>
      </ul>
    </div>
  </nav>
</template>
