// src/app/stats/layout.tsx
import type { ReactNode } from "react";
import StatsTabs from "./_tabs";

export default function StatsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <StatsTabs />
      <main>{children}</main>
    </>
  );
}
