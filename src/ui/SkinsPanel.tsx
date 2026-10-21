import { lazy, Suspense } from "react";
import { useUI } from "../game/store";
import { PanelBoundary } from "./PanelBoundary";

// Muat 3D carousel secara lazy, tetapi izinkan menu utama menghangatkan modul lebih awal.
type BuddiesAppModule = typeof import("../buddies/BuddiesApp");
let buddiesAppPromise: Promise<BuddiesAppModule> | null = null;
function loadBuddiesApp() {
  if (!buddiesAppPromise) {
    buddiesAppPromise = import("../buddies/BuddiesApp").catch((error) => {
      buddiesAppPromise = null;
      throw error;
    });
  }
  return buddiesAppPromise;
}

const BuddiesApp = lazy(loadBuddiesApp);

/** Start downloading/compiling the skin carousel before the player opens it. */
export function preloadSkinsPanel() {
  void loadBuddiesApp().catch(() => {
    // React.lazy + PanelBoundary will report an error if the player opens a failed load.
  });
}

export function SkinsPanel() {
  const setMenuView = useUI((s) => s.setMenuView);
  const back = () => setMenuView("main");
  return (
    <PanelBoundary onBack={back}>
      <div className="pointer-events-auto fixed inset-0 z-50">
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center bg-[#3ec6f0] font-display text-white">MEMUAT…</div>
          }
        >
          <BuddiesApp onBackToPigeon={back} />
        </Suspense>
      </div>
    </PanelBoundary>
  );
}
