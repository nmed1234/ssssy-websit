"use client";

import React, { createContext, useContext } from "react";

/**
 * BuilderModeContext — signals that components are rendered inside
 * the admin page builder canvas. Feed blocks check this to suppress
 * live API calls during editing (replace with skeleton placeholders).
 *
 * Default value is false — safe for public pages where no provider wraps the tree.
 */
const BuilderModeContext = createContext<boolean>(false);

export function BuilderModeProvider({ children }: { children: React.ReactNode }) {
  return (
    <BuilderModeContext.Provider value={true}>
      {children}
    </BuilderModeContext.Provider>
  );
}

export function useIsBuilderMode(): boolean {
  return useContext(BuilderModeContext);
}
