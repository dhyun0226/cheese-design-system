type RouteBlocker = (destination: string) => boolean;

let routeBlocker: RouteBlocker | null = null;

export function registerWorkflowRouteBlocker(blocker: RouteBlocker) {
  routeBlocker = blocker;
  return () => {
    if (routeBlocker === blocker) routeBlocker = null;
  };
}

export function canLeaveWorkflow(destination: string) {
  return routeBlocker?.(destination) ?? true;
}
