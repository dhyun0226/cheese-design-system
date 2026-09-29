<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Menu, X } from "@lucide/vue";
import { DialogClose, DialogRoot, DialogTrigger } from "reka-ui";
import Button from "../Button.vue";
import { DialogContent, DialogTitle } from "../styled";
import NavigationList from "../workspace/NavigationList.vue";
import type { AppShellItem } from "./types";

defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    items: AppShellItem[];
    activeId?: string;
    navigationLabel?: string;
    variant?: "embedded" | "application";
  }>(),
  { navigationLabel: "주 메뉴", variant: "embedded" },
);
const emit = defineEmits<{ navigate: [id: string, event: MouseEvent] }>();
const navigationOpen = ref(false);
// Accepted router navigation closes the drawer even when its native click was cancelled.
watch(
  () => props.activeId,
  () => {
    navigationOpen.value = false;
  },
);
let desktop: MediaQueryList | undefined;
const closeOnDesktop = () => {
  if (desktop?.matches) navigationOpen.value = false;
};
onMounted(() => {
  desktop = window.matchMedia("(min-width: 721px)");
  desktop.addEventListener("change", closeOnDesktop);
});
onBeforeUnmount(() => desktop?.removeEventListener("change", closeOnDesktop));
function navigate(id: string, event: MouseEvent) {
  emit("navigate", id, event);
  if (!event.defaultPrevented) navigationOpen.value = false;
}
</script>

<template>
  <DialogRoot v-model:open="navigationOpen">
    <div
      v-bind="$attrs"
      class="cheese-app-shell cheese-root"
      :data-variant="variant"
    >
      <header class="cheese-app-shell-header">
        <div class="cheese-app-shell-header-start">
          <DialogTrigger as-child>
            <Button
              class="cheese-app-shell-menu-button"
              variant="ghost"
              :aria-label="`${navigationLabel} 열기`"
            >
              <Menu aria-hidden="true" />
            </Button>
          </DialogTrigger>
          <div class="cheese-app-shell-brand"><slot name="brand" /></div>
        </div>
        <div
          v-if="$slots['header-actions'] || $slots.user"
          class="cheese-app-shell-header-end"
        >
          <div
            v-if="$slots['header-actions']"
            class="cheese-app-shell-header-actions"
          >
            <slot name="header-actions" />
          </div>
          <div v-if="$slots.user" class="cheese-app-shell-user">
            <slot name="user" />
          </div>
        </div>
      </header>
      <div class="cheese-app-shell-body">
        <aside class="cheese-app-shell-sidebar" :aria-label="navigationLabel">
          <NavigationList
            class="cheese-app-shell-nav"
            :items="items"
            :active-id="activeId"
            :label="navigationLabel"
            @navigate="navigate"
          />
          <div
            v-if="$slots.footer || $slots['sidebar-user']"
            class="cheese-app-shell-sidebar-end"
          >
            <div v-if="$slots.footer" class="cheese-app-shell-footer">
              <slot name="footer" />
            </div>
            <div
              v-if="$slots['sidebar-user']"
              class="cheese-app-shell-sidebar-user"
            >
              <slot name="sidebar-user" />
            </div>
          </div>
        </aside>
        <div class="cheese-app-shell-content"><slot /></div>
      </div>
    </div>
    <DialogContent
      class="cheese-app-shell-mobile-navigation"
      placement="right"
      :aria-describedby="undefined"
    >
      <div class="cheese-app-shell-mobile-header">
        <DialogTitle>{{ navigationLabel }}</DialogTitle>
        <DialogClose as-child>
          <Button variant="ghost" :aria-label="`${navigationLabel} 닫기`"
            ><X aria-hidden="true"
          /></Button>
        </DialogClose>
      </div>
      <NavigationList
        class="cheese-app-shell-nav"
        :items="items"
        :active-id="activeId"
        :label="navigationLabel"
        @navigate="navigate"
      />
      <div
        v-if="$slots.footer || $slots['sidebar-user']"
        class="cheese-app-shell-sidebar-end"
      >
        <div v-if="$slots.footer" class="cheese-app-shell-footer">
          <slot name="footer" />
        </div>
        <div
          v-if="$slots['sidebar-user']"
          class="cheese-app-shell-sidebar-user"
        >
          <slot name="sidebar-user" />
        </div>
      </div>
    </DialogContent>
  </DialogRoot>
</template>
