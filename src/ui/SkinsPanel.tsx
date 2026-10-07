import BuddiesApp from "../buddies/BuddiesApp";
import { useUI } from "../game/store";

export function SkinsPanel() {
  const setMenuView = useUI((s) => s.setMenuView);
  return (
    <div className="pointer-events-auto fixed inset-0 z-50">
      <BuddiesApp onBackToPigeon={() => setMenuView("main")} />
    </div>
  );
}
