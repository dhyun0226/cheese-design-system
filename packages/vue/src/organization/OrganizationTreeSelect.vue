<script setup lang="ts">
import { computed, ref } from "vue";
import { Building2, X } from "@lucide/vue";
import { DialogRoot, DialogTrigger } from "reka-ui";
import Button from "../Button.vue";
import SearchInput from "../SearchInput.vue";
import { DialogContent, DialogDescription, DialogTitle } from "../styled";
import OrganizationSelectionTree from "./OrganizationSelectionTree";
import type { OrganizationNode } from "./types";
import { useFormLock } from "../form-state";

const props = withDefaults(
  defineProps<{
    label: string;
    nodes: OrganizationNode[];
    modelValue: string[];
    multiple?: boolean;
    disabled?: boolean;
    description?: string;
  }>(),
  { multiple: false },
);
const emit = defineEmits<{ "update:modelValue": [value: string[]] }>();
const formLock = useFormLock();
const effectiveDisabled = computed(() => !!props.disabled || formLock.value);
const open = ref(false);
const draft = ref<string[]>([]);
const search = ref("");
const expanded = ref<string[]>([]);
const searchInput = ref<InstanceType<typeof SearchInput>>();
const nodeMap = computed(() => {
  const map = new Map<string, OrganizationNode>();
  const visit = (nodes: OrganizationNode[]) => {
    for (const node of nodes) {
      map.set(node.id, node);
      if (node.children) visit(node.children);
    }
  };
  visit(props.nodes);
  return map;
});
const nodePaths = computed(() => {
  const paths = new Map<string, string>();
  const visit = (nodes: OrganizationNode[], parent = "") => {
    for (const node of nodes) {
      const path = parent ? `${parent} / ${node.label}` : node.label;
      paths.set(node.id, path);
      if (node.children) visit(node.children, path);
    }
  };
  visit(props.nodes);
  return paths;
});
const current = computed(() => [...new Set(props.modelValue)]);
const filteredNodes = computed(() => {
  const query = search.value.trim().toLocaleLowerCase();
  if (!query) return props.nodes;
  const filter = (nodes: OrganizationNode[]): OrganizationNode[] =>
    nodes.flatMap((node) => {
      const children = node.children ? filter(node.children) : [];
      const matches = `${node.label} ${node.description ?? ""}`
        .toLocaleLowerCase()
        .includes(query);
      return matches || children.length
        ? [{ ...node, children: matches ? node.children : children }]
        : [];
    });
  return filter(props.nodes);
});
const visibleExpanded = computed(() => {
  if (!search.value.trim()) return expanded.value;
  // Search expansion follows refreshed results without replacing the user's
  // ordinary browsing state, which is restored when the query is cleared.
  const ids: string[] = [];
  const visit = (nodes: OrganizationNode[]) => {
    for (const node of nodes)
      if (node.children?.length) {
        ids.push(node.id);
        visit(node.children);
      }
  };
  visit(filteredNodes.value);
  return ids;
});
function updateExpanded(ids: string[]) {
  if (!search.value.trim()) expanded.value = ids;
}
const lockedSingle = computed(
  () =>
    !props.multiple &&
    current.value.some((id) => nodeMap.value.get(id)?.disabled),
);
function isDisabled(node: OrganizationNode): boolean {
  return (
    effectiveDisabled.value ||
    !!node.disabled ||
    (lockedSingle.value && !draft.value.includes(node.id))
  );
}
function updateOpen(next: boolean) {
  if (next && effectiveDisabled.value) return;
  draft.value = props.multiple ? current.value : current.value.slice(0, 1);
  search.value = "";
  expanded.value = props.nodes
    .filter((node) => node.children?.length)
    .map((node) => node.id);
  open.value = next;
}
function selectNode(node: OrganizationNode) {
  if (isDisabled(node)) return;
  if (!props.multiple) draft.value = [node.id];
  else
    draft.value = draft.value.includes(node.id)
      ? draft.value.filter((id) => id !== node.id)
      : [...draft.value, node.id];
}
function remove(id: string, committed: boolean) {
  if (effectiveDisabled.value || nodeMap.value.get(id)?.disabled) return;
  if (committed)
    emit(
      "update:modelValue",
      props.modelValue.filter((value) => value !== id),
    );
  else draft.value = draft.value.filter((value) => value !== id);
}
function apply() {
  if (effectiveDisabled.value) return;
  const locked = current.value.filter((id) => nodeMap.value.get(id)?.disabled);
  const eligible = draft.value.filter(
    (id) =>
      current.value.includes(id) ||
      (nodeMap.value.has(id) && !nodeMap.value.get(id)?.disabled),
  );
  const result = [...new Set([...locked, ...eligible])];
  emit("update:modelValue", props.multiple ? result : result.slice(0, 1));
  updateOpen(false);
}
function nodeLabel(id: string) {
  return nodeMap.value.get(id)?.label ?? id;
}
function focusSearch(event: Event) {
  event.preventDefault();
  searchInput.value?.focus();
}
</script>

<template>
  <div class="cheese-org-select">
    <span class="cheese-label">{{ label }}</span>
    <p v-if="description" class="cheese-org-hint">{{ description }}</p>
    <DialogRoot :open="open" @update:open="updateOpen">
      <DialogTrigger as-child>
        <Button variant="weak" :disabled="effectiveDisabled">
          <Building2 :size="16" aria-hidden="true" /> {{ label }} 선택<span
            v-if="current.length"
          >
            · {{ current.length }}개</span
          >
        </Button>
      </DialogTrigger>
      <DialogContent class="cheese-org-dialog" @open-auto-focus="focusSearch">
        <div class="cheese-org-dialog-heading">
          <DialogTitle>{{ label }} 선택</DialogTitle>
          <DialogDescription
            >방향키로 조직을 탐색하고 Enter 또는 Space로 선택하세요. 상위 조직을
            선택해도 하위 조직은 자동 선택되지 않습니다.</DialogDescription
          >
        </div>
        <SearchInput
          ref="searchInput"
          label="조직 검색"
          v-model="search"
          :disabled="effectiveDisabled"
          @search="() => {}"
        />
        <OrganizationSelectionTree
          v-if="filteredNodes.length"
          :nodes="filteredNodes"
          label="선택할 조직"
          :selected="draft"
          :expanded="visibleExpanded"
          :multiple="multiple"
          :node-disabled="isDisabled"
          @select="selectNode"
          @update:expanded="updateExpanded"
        />
        <p v-else class="cheese-org-empty" role="status">
          검색한 조직이 없습니다.
        </p>
        <ul
          v-if="draft.length"
          class="cheese-org-chips"
          aria-label="적용할 조직"
        >
          <li v-for="id in draft" :key="id" class="cheese-org-chip">
            <span :title="nodePaths.get(id)">{{ nodeLabel(id) }}</span>
            <button
              type="button"
              :disabled="effectiveDisabled || nodeMap.get(id)?.disabled"
              :aria-label="`${nodePaths.get(id) ?? id} 선택 해제`"
              @click="remove(id, false)"
            >
              <X :size="14" aria-hidden="true" />
            </button>
          </li>
        </ul>
        <div class="cheese-org-footer">
          <span class="cheese-org-hint" role="status"
            >{{ draft.length }}개 선택</span
          >
          <div class="cheese-dialog-actions">
            <Button variant="weak" @click="updateOpen(false)">취소</Button>
            <Button :disabled="effectiveDisabled" @click="apply"
              >선택 적용</Button
            >
          </div>
        </div>
      </DialogContent>
    </DialogRoot>
    <ul v-if="current.length" class="cheese-org-chips" aria-label="선택한 조직">
      <li v-for="id in current" :key="id" class="cheese-org-chip">
        <span :title="nodePaths.get(id)">{{ nodeLabel(id) }}</span>
        <button
          type="button"
          :disabled="effectiveDisabled || nodeMap.get(id)?.disabled"
          :aria-label="`${nodePaths.get(id) ?? id} 선택 해제`"
          @click="remove(id, true)"
        >
          <X :size="14" aria-hidden="true" />
        </button>
      </li>
    </ul>
  </div>
</template>
