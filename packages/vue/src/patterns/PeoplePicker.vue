<script setup lang="ts">
import { computed, ref, useId, watch } from "vue";
import { Check, Users, X } from "@lucide/vue";
import { DialogRoot, DialogTrigger } from "reka-ui";
import Button from "../Button.vue";
import SearchInput from "../SearchInput.vue";
import {
  CheckboxRoot,
  CheckboxIndicator,
  DialogContent,
  DialogDescription,
  DialogTitle,
  RadioGroupRoot,
  RadioGroupItem,
  RadioGroupIndicator,
} from "../styled";
import { Tree } from "../Tree";
import type { PickerOrganization, PickerPerson } from "./types";

const props = withDefaults(
  defineProps<{
    label: string;
    people: PickerPerson[];
    organizations: PickerOrganization[];
    modelValue: string[];
    multiple?: boolean;
    disabled?: boolean;
  }>(),
  { multiple: true },
);
const emit = defineEmits<{ "update:modelValue": [value: string[]] }>();
const id = useId();
const open = ref(false);
const draft = ref<string[]>([]);
const search = ref("");
const organization = ref("");
const searchInput = ref<InstanceType<typeof SearchInput>>();
const current = computed(() => [...new Set(props.modelValue)]);

const organizationPaths = computed(() => {
  const result = new Map<string, string>();
  const visit = (nodes: PickerOrganization[], parent = "") => {
    for (const node of nodes) {
      const path = parent ? `${parent} / ${node.label}` : node.label;
      result.set(node.id, path);
      if (node.children) visit(node.children, path);
    }
  };
  visit(props.organizations);
  return result;
});

const organizationMap = computed(() => {
  const result = new Map<string, PickerOrganization>();
  const visit = (nodes: PickerOrganization[]) => {
    for (const node of nodes) {
      result.set(node.id, node);
      if (node.children) visit(node.children);
    }
  };
  visit(props.organizations);
  return result;
});
const personMap = computed(
  () => new Map(props.people.map((person) => [person.id, person])),
);
const visiblePeople = computed(() => {
  const allowed = new Set<string>();
  const add = (node: PickerOrganization) => {
    allowed.add(node.id);
    node.children?.forEach(add);
  };
  const selected = organizationMap.value.get(organization.value);
  if (selected) add(selected);
  const query = search.value.trim().toLocaleLowerCase();
  return props.people.filter((person) => {
    if (selected && !allowed.has(person.organizationId)) return false;
    const text = [
      person.name,
      person.description,
      organizationPaths.value.get(person.organizationId),
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();
    return !query || text.includes(query);
  });
});
const lockedSingleSelection = computed(
  () =>
    !props.multiple &&
    draft.value.some((personId) => personMap.value.get(personId)?.disabled),
);

function updateOpen(next: boolean) {
  if (next && props.disabled) return;
  // A dialog edit is a separate transaction until the user applies it.
  draft.value = [...new Set(props.modelValue)];
  search.value = "";
  organization.value = "";
  open.value = next;
}
watch(
  () => props.disabled,
  (disabled) => {
    if (disabled && open.value) updateOpen(false);
  },
);

function selectionDisabled(person: PickerPerson) {
  return (
    props.disabled ||
    person.disabled ||
    (lockedSingleSelection.value && !draft.value.includes(person.id))
  );
}
function selectPerson(person: PickerPerson, checked: boolean) {
  if (selectionDisabled(person)) return;
  if (!props.multiple) {
    if (checked) draft.value = [person.id];
    return;
  }
  draft.value = checked
    ? [...new Set([...draft.value, person.id])]
    : draft.value.filter((personId) => personId !== person.id);
}
function selectSingle(personId: string) {
  const person = personMap.value.get(personId);
  if (person) selectPerson(person, true);
}
function removeDraft(personId: string) {
  if (props.disabled || personMap.value.get(personId)?.disabled) return;
  draft.value = draft.value.filter((value) => value !== personId);
}
function removeCommitted(personId: string) {
  if (props.disabled || personMap.value.get(personId)?.disabled) return;
  emit(
    "update:modelValue",
    props.modelValue.filter((value) => value !== personId),
  );
}
function apply() {
  if (props.disabled) return;
  // Availability may change while the dialog is open. Do not newly add a
  // person who became disabled, but retain previously committed selections.
  emit(
    "update:modelValue",
    draft.value.filter(
      (personId) =>
        props.modelValue.includes(personId) ||
        (personMap.value.has(personId) &&
          !personMap.value.get(personId)?.disabled),
    ),
  );
  updateOpen(false);
}
function personName(personId: string) {
  return personMap.value.get(personId)?.name ?? personId;
}
function accessibleName(personId: string) {
  const person = personMap.value.get(personId);
  return person
    ? `${person.name} · ${organizationPaths.value.get(person.organizationId) ?? person.organizationId}`
    : personId;
}
function focusSearch(event: Event) {
  event.preventDefault();
  searchInput.value?.focus();
}
</script>

<template>
  <div class="cheese-people-picker">
    <span class="cheese-label">{{ label }}</span>
    <DialogRoot :open="open" @update:open="updateOpen">
      <DialogTrigger as-child>
        <Button variant="weak" :disabled="disabled">
          <Users :size="16" aria-hidden="true" /> {{ label }} 선택<span
            v-if="current.length"
          >
            · {{ current.length }}명</span
          >
        </Button>
      </DialogTrigger>
      <DialogContent
        class="cheese-people-dialog"
        @open-auto-focus="focusSearch"
      >
        <div class="cheese-people-dialog-header">
          <DialogTitle>{{ label }} 선택</DialogTitle>
          <DialogDescription>
            조직을 탐색하거나 이름과 설명으로 검색하세요. 선택 적용을 눌러야
            변경 사항이 반영됩니다.
          </DialogDescription>
        </div>
        <SearchInput
          ref="searchInput"
          label="사람 검색"
          v-model="search"
          :disabled="disabled"
          @search="() => {}"
        />
        <div class="cheese-people-browser">
          <aside class="cheese-people-organizations" aria-label="조직 필터">
            <h3>조직</h3>
            <Button
              :variant="organization ? 'ghost' : 'accent'"
              size="sm"
              :disabled="disabled"
              :aria-pressed="organization === ''"
              @click="organization = ''"
              >전체 조직</Button
            >
            <Tree
              :nodes="organizations"
              label="조직 탐색"
              :selected="organization"
              :default-expanded="organizations.map((node) => node.id)"
              @select="!disabled && (organization = $event.id)"
            />
          </aside>
          <section class="cheese-people-results" aria-label="사람 검색 결과">
            <p class="cheese-pattern-count" role="status">
              검색 결과 {{ visiblePeople.length }}명
            </p>
            <component
              :is="multiple ? 'ul' : RadioGroupRoot"
              v-if="visiblePeople.length"
              class="cheese-people-list"
              v-bind="
                multiple
                  ? {}
                  : {
                      modelValue: draft[0] ?? '',
                      disabled,
                      as: 'ul',
                      'aria-label': '선택할 사람',
                    }
              "
              @update:model-value="selectSingle"
            >
              <li
                v-for="(person, position) in visiblePeople"
                :key="person.id"
                class="cheese-person-row"
                :role="multiple ? undefined : 'none'"
                :data-selected="draft.includes(person.id)"
                :data-disabled="!!selectionDisabled(person)"
              >
                <label
                  class="cheese-person-option"
                  :for="`${id}-person-${position}`"
                >
                  <CheckboxRoot
                    v-if="multiple"
                    :id="`${id}-person-${position}`"
                    :model-value="draft.includes(person.id)"
                    :disabled="selectionDisabled(person)"
                    :aria-label="accessibleName(person.id)"
                    @update:model-value="selectPerson(person, $event === true)"
                  >
                    <CheckboxIndicator
                      ><Check :size="14" aria-hidden="true"
                    /></CheckboxIndicator>
                  </CheckboxRoot>
                  <RadioGroupItem
                    v-else
                    :id="`${id}-person-${position}`"
                    :value="person.id"
                    :disabled="selectionDisabled(person)"
                    :aria-label="accessibleName(person.id)"
                    ><RadioGroupIndicator
                  /></RadioGroupItem>
                  <span class="cheese-person-copy">
                    <strong
                      >{{ person.name
                      }}<span v-if="person.disabled"> · 선택 불가</span></strong
                    >
                    <span>{{
                      organizationPaths.get(person.organizationId) ??
                      person.organizationId
                    }}</span>
                    <small v-if="person.description">{{
                      person.description
                    }}</small>
                  </span>
                </label>
              </li>
            </component>
            <div v-else class="cheese-empty">
              <h2 class="cheese-empty-title">검색 결과가 없습니다</h2>
              <p>다른 이름으로 검색하거나 전체 조직을 확인해 주세요.</p>
            </div>
          </section>
        </div>
        <div class="cheese-people-selection">
          <p class="cheese-pattern-count" role="status">
            {{ draft.length }}명 선택
          </p>
          <ul class="cheese-pattern-chips" aria-label="선택한 사람">
            <li
              v-for="personId in draft"
              :key="personId"
              class="cheese-pattern-chip"
            >
              <span :title="accessibleName(personId)">{{
                personName(personId)
              }}</span>
              <button
                type="button"
                :disabled="disabled || personMap.get(personId)?.disabled"
                :aria-label="`${accessibleName(personId)} 선택 해제`"
                @click="removeDraft(personId)"
              >
                <X :size="14" aria-hidden="true" />
              </button>
            </li>
          </ul>
        </div>
        <div class="cheese-dialog-actions">
          <Button variant="weak" @click="updateOpen(false)">취소</Button>
          <Button :disabled="disabled" @click="apply">선택 적용</Button>
        </div>
      </DialogContent>
    </DialogRoot>
    <ul
      v-if="current.length"
      class="cheese-pattern-chips"
      aria-label="선택한 사람"
    >
      <li
        v-for="personId in current"
        :key="personId"
        class="cheese-pattern-chip"
      >
        <span :title="accessibleName(personId)">{{
          personName(personId)
        }}</span>
        <button
          type="button"
          :disabled="disabled || personMap.get(personId)?.disabled"
          :aria-label="`${accessibleName(personId)} 선택 해제`"
          @click="removeCommitted(personId)"
        >
          <X :size="14" aria-hidden="true" />
        </button>
      </li>
    </ul>
  </div>
</template>
