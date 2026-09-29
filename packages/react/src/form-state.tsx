"use client";

import * as React from "react";

/** Internal context: unlike a disabled fieldset, this also crosses React portals. */
export const internalFormLockContext = React.createContext(false);

export function useFormLock(): boolean {
  return React.useContext(internalFormLockContext);
}
