import * as React from "react";

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
export function useFieldBlur(input: React.RefObject<HTMLInputElement | null>) {
  const pointerFormAction = React.useRef(false);
  React.useEffect(() => {
    const node = input.current;
    if (!node) return;
    const document = node.ownerDocument;
    const pointer = (event: PointerEvent) => {
      pointerFormAction.current =
        document.activeElement === node && formAction(event.target, node);
    };
    document.addEventListener("pointerdown", pointer, true);
    return () => document.removeEventListener("pointerdown", pointer, true);
  }, [input]);
  return (event: React.FocusEvent<HTMLInputElement>) => {
    const fromPointer = pointerFormAction.current;
    pointerFormAction.current = false;
    // Safari does not focus mouse-clicked buttons: relatedTarget is then null.
    // Other outside clicks still validate; only actual owner-form actions defer.
    return !(
      formAction(event.relatedTarget, event.currentTarget) ||
      (!event.relatedTarget && fromPointer)
    );
  };
}
