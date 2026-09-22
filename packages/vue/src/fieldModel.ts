import { computed, onMounted, onBeforeUnmount, ref, shallowRef } from "vue";
export interface ChoiceOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}
export interface RangeFieldValue {
  start: string;
  end: string;
}
export interface RangeFieldProps {
  label: string;
  modelValue?: RangeFieldValue;
  defaultValue?: RangeFieldValue;
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  min?: string;
  max?: string;
  step?: number;
}
export function useFieldModel<T>(
  get: () => T | undefined,
  defaults: () => T,
  emit: (value: T) => void,
) {
  const root = ref<HTMLDivElement>(),
    local = shallowRef<T>(defaults());
  const value = computed<T>({
    get: () => (get() ?? local.value) as T,
    set: (next) => {
      if (get() === undefined) local.value = next;
      emit(next);
    },
  });
  let form: HTMLFormElement | null | undefined,
    timer: ReturnType<typeof setTimeout> | undefined;
  const reset = (event: Event) => {
    timer = setTimeout(() => {
      if (!event.defaultPrevented) value.value = defaults();
    }, 0);
  };
  onMounted(() => {
    form = root.value?.closest("form");
    form?.addEventListener("reset", reset);
  });
  onBeforeUnmount(() => {
    form?.removeEventListener("reset", reset);
    clearTimeout(timer);
  });
  return { root, value };
}
