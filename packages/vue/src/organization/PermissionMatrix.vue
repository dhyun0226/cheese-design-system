<script setup lang="ts">
import { computed } from "vue";
import { Check, Minus } from "@lucide/vue";
import { useFormLock } from "../form-state";
import { CheckboxRoot, CheckboxIndicator } from "../styled";
import type {
  PermissionAction,
  PermissionGrant,
  PermissionResource,
} from "./types";

const props = defineProps<{
  label: string;
  resources: PermissionResource[];
  actions: PermissionAction[];
  modelValue: PermissionGrant[];
  readOnly?: boolean;
  disabled?: boolean;
}>();
const emit = defineEmits<{ "update:modelValue": [value: PermissionGrant[]] }>();
const formLock = useFormLock();
const effectiveDisabled = computed(() => !!props.disabled || formLock.value);
function granted(resourceId: string, actionId: string) {
  return props.modelValue.some(
    (grant) => grant.resourceId === resourceId && grant.actionId === actionId,
  );
}
function available(resource: PermissionResource, actionId: string) {
  return !resource.unavailableActions?.includes(actionId);
}
function mutable(resource: PermissionResource) {
  return !props.readOnly && !effectiveDisabled.value && !resource.disabled;
}
function availableActions(resource: PermissionResource) {
  return props.actions.filter((action) => available(resource, action.id));
}
function rowState(resource: PermissionResource): boolean | "indeterminate" {
  const actions = availableActions(resource);
  const count = actions.filter((action) =>
    granted(resource.id, action.id),
  ).length;
  return count === 0
    ? false
    : count === actions.length
      ? true
      : "indeterminate";
}
function emitUnique(grants: PermissionGrant[]) {
  const seen = new Set<string>();
  emit(
    "update:modelValue",
    grants.filter((grant) => {
      const key = JSON.stringify([grant.resourceId, grant.actionId]);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }),
  );
}
function updateCell(
  resource: PermissionResource,
  action: PermissionAction,
  checked: boolean,
) {
  if (!mutable(resource) || !available(resource, action.id)) return;
  const next = props.modelValue.filter(
    (grant) =>
      !(grant.resourceId === resource.id && grant.actionId === action.id),
  );
  if (checked) next.push({ resourceId: resource.id, actionId: action.id });
  emitUnique(next);
}
function updateRow(resource: PermissionResource, checked: boolean) {
  if (!mutable(resource)) return;
  const actions = availableActions(resource);
  const ids = new Set(actions.map((action) => action.id));
  const next = props.modelValue.filter(
    (grant) => !(grant.resourceId === resource.id && ids.has(grant.actionId)),
  );
  if (checked)
    for (const action of actions)
      next.push({ resourceId: resource.id, actionId: action.id });
  emitUnique(next);
}
</script>

<template>
  <div class="cheese-permission-matrix">
    <div
      class="cheese-permission-scroll"
      role="region"
      :aria-label="`${label} 권한 표`"
      tabindex="0"
    >
      <table class="cheese-permission-table">
        <caption>
          {{
            label
          }}
        </caption>
        <thead>
          <tr>
            <th scope="col">대상</th>
            <th scope="col">전체 선택</th>
            <th v-for="action in actions" :key="action.id" scope="col">
              {{ action.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="resource in resources" :key="resource.id">
            <th scope="row">
              <span class="cheese-permission-resource"
                ><strong>{{ resource.label }}</strong
                ><small v-if="resource.description">{{
                  resource.description
                }}</small></span
              >
            </th>
            <td>
              <CheckboxRoot
                :model-value="rowState(resource)"
                :disabled="
                  !mutable(resource) || !availableActions(resource).length
                "
                :aria-label="`${resource.label} 사용 가능한 권한 전체 선택`"
                @update:model-value="updateRow(resource, $event === true)"
                ><CheckboxIndicator
                  ><Minus
                    v-if="rowState(resource) === 'indeterminate'"
                    :size="14"
                    aria-hidden="true" /><Check
                    v-else
                    :size="14"
                    aria-hidden="true" /></CheckboxIndicator
              ></CheckboxRoot>
            </td>
            <td v-for="action in actions" :key="action.id">
              <CheckboxRoot
                v-if="available(resource, action.id)"
                :model-value="granted(resource.id, action.id)"
                :disabled="!mutable(resource)"
                :aria-label="`${resource.label} ${action.label}`"
                @update:model-value="
                  updateCell(resource, action, $event === true)
                "
                ><CheckboxIndicator
                  ><Check :size="14" aria-hidden="true" /></CheckboxIndicator
              ></CheckboxRoot>
              <span
                v-else
                class="cheese-permission-unavailable"
                :aria-label="`${resource.label} ${action.label} 권한 사용 불가`"
                >—</span
              >
            </td>
          </tr>
          <tr v-if="!resources.length">
            <td :colspan="actions.length + 2" class="cheese-org-empty">
              설정할 권한 대상이 없습니다.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="cheese-org-hint">
      {{
        readOnly
          ? "읽기 전용 권한 정보입니다."
          : "선택 상태는 권한 설정값입니다. 실제 접근 권한 검사는 서비스에서 수행해야 합니다."
      }}
    </p>
  </div>
</template>
