import { watch, type Ref } from "vue";

function formAction(target: EventTarget | null, input: HTMLInputElement) {
  if (!input.form || !(target instanceof Element)) return false;
  const action = target.closest("button, input") as
    HTMLButtonElement | HTMLInputElement | null;
  return (
    !!action &&
    !action.disabled &&
    action.form === input.form &&
    ["submit", "reset"].includes(action.type)
  );
}

/** Keep submit/reset hit targets stable while pointer focus leaves a field. */
export function useFieldBlur(input: Ref<HTMLInputElement | undefined>) {
  let pointerFormAction = false;
  watch(
    input,
    (node, _, cleanup) => {
      if (!node) return;
      const document = node.ownerDocument;
      const pointer = (event: PointerEvent) => {
        pointerFormAction =
          document.activeElement === node && formAction(event.target, node);
      };
      document.addEventListener("pointerdown", pointer, true);
      cleanup(() => document.removeEventListener("pointerdown", pointer, true));
    },
    { flush: "post" },
  );
  return (event: FocusEvent) => {
    const node = input.value;
    const fromPointer = pointerFormAction;
    pointerFormAction = false;
    // Safari may focus an ancestor instead of the mouse-clicked form action.
    // Trust the actual pointer target; other outside clicks still validate.
    return !node || !(formAction(event.relatedTarget, node) || fromPointer);
  };
}
