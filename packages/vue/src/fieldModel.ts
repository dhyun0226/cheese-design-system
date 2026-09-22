import { computed, ref, shallowRef, watch } from "vue";
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
  form?: string;
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
  getForm?: () => string | undefined,
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
  watch(
    [root, () => getForm?.()],
    (_, __, cleanup) => {
      if (!root.value) return;
      const formId = getForm?.();
      const form = formId
        ? (document.getElementById(formId) as HTMLFormElement | null)
        : root.value?.closest("form");
      const timers = new Set<ReturnType<typeof setTimeout>>();
      const reset = (event: Event) => {
        const timer = setTimeout(() => {
          timers.delete(timer);
          if (!event.defaultPrevented) value.value = defaults();
        }, 0);
        timers.add(timer);
      };
      form?.addEventListener("reset", reset);
      cleanup(() => {
        form?.removeEventListener("reset", reset);
        timers.forEach(clearTimeout);
      });
    },
    { flush: "post" },
  );
  return { root, value };
}
