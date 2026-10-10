import { lazy, Suspense } from "react";
import { useUI } from "../game/store";

// BuddiesApp (drei + three-stdlib) sengaja LAZY: baru diunduh saat panel skins dibuka.
const BuddiesApp = lazy(() => import("../buddies/BuddiesApp"));

export function SkinsPanel() {
  const setMenuView = useUI((s) => s.setMenuView);
  return (
    <div className="pointer-events-auto fixed inset-0 z-50">
      <Suspense fallback={null}>
        <BuddiesApp onBackToPigeon={() => setMenuView("main")} />
      </Suspense>
    </div>
  );
}
