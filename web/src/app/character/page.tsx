import { Suspense } from "react";
import CharacterClientPage from "./ClientPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="border rounded p-3">Carregando…</div>}>
      <CharacterClientPage />
    </Suspense>
  );
}
