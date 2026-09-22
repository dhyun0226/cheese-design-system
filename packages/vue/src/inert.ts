/** Native inert state kept separate from Radix/Reka's aria-hidden counters. */
const locks = new WeakMap<
  HTMLElement,
  { count: number; original: string | null }
>();
export function inertOutside(target: HTMLElement): () => void {
  const owned: HTMLElement[] = [];
  let current: HTMLElement | null = target;
  while (current?.parentElement) {
    const parent: HTMLElement = current.parentElement;
    for (const sibling of Array.from(parent.children)) {
      if (sibling === current || !(sibling instanceof HTMLElement)) continue;
      const lock = locks.get(sibling) ?? {
        count: 0,
        original: sibling.getAttribute("inert"),
      };
      lock.count++;
      locks.set(sibling, lock);
      sibling.inert = true;
      owned.push(sibling);
    }
    if (parent === target.ownerDocument.body) break;
    current = parent;
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    for (const node of owned) {
      const lock = locks.get(node);
      if (!lock || --lock.count > 0) continue;
      if (lock.original === null) node.removeAttribute("inert");
      else node.setAttribute("inert", lock.original);
      locks.delete(node);
    }
  };
}
