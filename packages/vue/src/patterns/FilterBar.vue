<script setup lang="ts">
import { computed } from "vue";
import { X } from "@lucide/vue";
import Button from "../Button.vue";
import SearchInput from "../SearchInput.vue";
import Select from "../Select.vue";
import type { FilterBarFilter } from "./types";

const props = withDefaults(
  defineProps<{
    label?: string;
    search: string;
    searchLabel?: string;
    filters: FilterBarFilter[];
    resultCount?: number;
  }>(),
  { label: "검색 및 필터", searchLabel: "검색" },
);
const emit = defineEmits<{
  "update:search": [value: string];
  "filter-change": [id: string, value: string];
  reset: [];
}>();
const activeFilters = computed(() =>
  props.filters.filter(
    (filter) => filter.value !== (filter.options[0]?.value ?? ""),
  ),
);
// Reka reserves the empty value for a placeholder; application values can be empty.
function optionToken(filter: FilterBarFilter) {
  const index = filter.options.findIndex(
    (option) => option.value === filter.value,
  );
  return index < 0 ? "" : `option-${index}`;
}
function updateFilter(filter: FilterBarFilter, token: string) {
  const option = filter.options[Number(token.slice("option-".length))];
  if (option) emit("filter-change", filter.id, option.value);
}
function filterValueLabel(filter: FilterBarFilter) {
  return (
    filter.options.find((option) => option.value === filter.value)?.label ??
    filter.value
  );
}
</script>

<template>
  <section class="cheese-filter-bar" :aria-label="label">
    <div class="cheese-filter-controls">
      <SearchInput
        :label="searchLabel"
        :model-value="search"
        @update:model-value="emit('update:search', $event)"
        @search="() => {}"
      />
      <Select
        v-for="filter in filters"
        :key="filter.id"
        :label="filter.label"
        :model-value="optionToken(filter)"
        :options="
          filter.options.map((option, index) => ({
            value: `option-${index}`,
            label: option.label,
          }))
        "
        :disabled="!filter.options.length"
        @update:model-value="updateFilter(filter, $event)"
      />
      <Button
        variant="ghost"
        :disabled="!search && !activeFilters.length"
        @click="emit('reset')"
      >
        초기화
      </Button>
    </div>
    <div class="cheese-filter-summary">
      <ul class="cheese-pattern-chips" aria-label="적용된 필터">
        <li v-if="search" class="cheese-pattern-chip">
          <span>{{ searchLabel }}: {{ search }}</span>
          <button
            type="button"
            :aria-label="`${searchLabel} 필터 해제`"
            @click="emit('update:search', '')"
          >
            <X :size="14" aria-hidden="true" />
          </button>
        </li>
        <li
          v-for="filter in activeFilters"
          :key="filter.id"
          class="cheese-pattern-chip"
        >
          <span>{{ filter.label }}: {{ filterValueLabel(filter) }}</span>
          <button
            type="button"
            :aria-label="`${filter.label} 필터 해제`"
            @click="
              emit('filter-change', filter.id, filter.options[0]?.value ?? '')
            "
          >
            <X :size="14" aria-hidden="true" />
          </button>
        </li>
      </ul>
      <p
        v-if="resultCount !== undefined"
        class="cheese-pattern-count"
        role="status"
        aria-live="polite"
      >
        검색 결과 {{ resultCount }}건
      </p>
    </div>
  </section>
</template>
