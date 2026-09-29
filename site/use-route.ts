import { useEffect, useState } from "react";
import { canLeaveWorkflow } from "./workflow-navigation";

const positionKey = "__cheeseRoutePosition";
type Position = { session: string; index: number };

function readPosition(): Position | undefined {
  const value: unknown = window.history.state?.[positionKey];
  if (
    value &&
    typeof value === "object" &&
    "session" in value &&
    typeof value.session === "string" &&
    "index" in value &&
    typeof value.index === "number" &&
    Number.isSafeInteger(value.index)
  )
    return value as Position;
}

function stampPosition(position: Position) {
  // Query-state writers also use replaceState; retain their state fields.
  const state = window.history.state;
  window.history.replaceState(
    {
      ...(state && typeof state === "object" ? state : {}),
      [positionKey]: position,
    },
    "",
  );
}

function readRoute() {
  return (window.location.hash.slice(2) || "").replace(
    /^components\/native-select$/,
    "components/select-form",
  );
}

/** Indexed traversals recover their original entry; legacy entries retain the draft in place. */
export function useRoute() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const initial = readPosition() ?? {
      session: window.crypto.randomUUID(),
      index: 0,
    };
    stampPosition(initial);
    let accepted = {
      ...initial,
      href: window.location.href,
      route: readRoute(),
      state: window.history.state,
    };
    let restoring = false;

    const changed = () => {
      const href = window.location.href;
      const position = readPosition();

      if (restoring) {
        if (
          position?.session === accepted.session &&
          position.index === accepted.index
        ) {
          // A hash traversal emits both popstate and hashchange. Consume the
          // recovery without re-running the dirty guard or remounting its form.
          accepted.href = href;
          accepted.state = window.history.state;
          restoring = false;
        }
        return;
      }

      if (
        position?.session === accepted.session &&
        position.index === accepted.index &&
        href === accepted.href
      )
        return;

      const knownPosition = position?.session === accepted.session;
      const nextRoute = readRoute();
      if (nextRoute !== accepted.route && !canLeaveWorkflow(href)) {
        if (knownPosition && position) {
          const delta = accepted.index - position.index;
          if (delta !== 0) {
            restoring = true;
            window.history.go(delta);
          }
        } else {
          // An unstamped entry could be a direct hash edit or legacy history
          // from before this router mounted. Its direction is unknowable: keep
          // the draft and address in place instead of guessing a traversal.
          // Only this fallback cannot preserve the prior history position.
          window.history.replaceState(accepted.state, "", accepted.href);
        }
        return;
      }

      const nextPosition =
        knownPosition && position
          ? position
          : { session: accepted.session, index: accepted.index + 1 };
      if (!knownPosition) stampPosition(nextPosition);
      accepted = {
        ...nextPosition,
        href,
        route: nextRoute,
        state: window.history.state,
      };
      setRoute(nextRoute);
      window.scrollTo(0, 0);
    };

    const followLink = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const target = event.target;
      const link =
        target instanceof Element
          ? target.closest<HTMLAnchorElement>("a[href]")
          : null;
      if (!link || link.target || link.hasAttribute("download")) return;
      const destination = new URL(link.href);
      if (
        destination.origin !== window.location.origin ||
        destination.pathname !== window.location.pathname ||
        destination.search !== window.location.search ||
        !destination.hash.startsWith("#/") ||
        destination.hash === window.location.hash
      )
        return;
      // Bubble after feature-specific handlers, so an existing form dialog can
      // own its link. Ordinary links are guarded before adding a history entry.
      if (!canLeaveWorkflow(destination.href)) event.preventDefault();
    };

    window.addEventListener("popstate", changed);
    window.addEventListener("hashchange", changed);
    document.addEventListener("click", followLink);
    return () => {
      window.removeEventListener("popstate", changed);
      window.removeEventListener("hashchange", changed);
      document.removeEventListener("click", followLink);
    };
  }, []);
  return route;
}
