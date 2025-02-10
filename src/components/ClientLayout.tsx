"use client";

import { SWRConfig } from "swr";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        provider: () => new Map(),
      }}
    >
      {children}
    </SWRConfig>
  );
}
