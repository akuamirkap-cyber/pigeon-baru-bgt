import { lazy, Suspense } from "react";
import { useUI } from "../game/store";
import { PanelBoundary } from "./PanelBoundary";

// BuddiesApp (drei + three-stdlib) sengaja LAZY: baru diunduh saat panel skins dibuka.
const BuddiesApp = lazy(() => import("../buddies/BuddiesApp"));

export function SkinsPanel() {
  const setMenuView = useUI((s) => s.setMenuView);
  const back = () => setMenuView("main");
  return (
    <PanelBoundary onBack={back}>
      <div className="pointer-events-auto fixed inset-0 z-50">
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center bg-[#72D4EC] font-display text-white">MEMUAT…</div>
          }
        >
          <BuddiesApp onBackToPigeon={back} />
        </Suspense>
      </div>
    </PanelBoundary>
  );
}
