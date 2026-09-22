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
    // Safari does not focus mouse-clicked buttons: relatedTarget is then null.
    // Other outside clicks still validate; only actual owner-form actions defer.
    return (
      !node ||
      !(
        formAction(event.relatedTarget, node) ||
        (!event.relatedTarget && fromPointer)
      )
    );
  };
}
