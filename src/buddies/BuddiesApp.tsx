import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Scene from "./Scene";
import { SKINS } from "./characters";
import { EFFECTS } from "./effects";
import { cn } from "./utils/cn";
import { useUI } from "../game/store";
import { engine } from "../game/engine";
import { sfx, unlockAudio } from "../game/audio";

type Category = "char" | "skate";

function toPigeonSkinId(buddyId: string): string {
  return buddyId === "pigeon" ? "classic" : `buddy-${buddyId}`;
}

function toBuddyCharId(pigeonSkinId: string): string {
  if (pigeonSkinId === "classic") return "pigeon";
  if (pigeonSkinId.startsWith("buddy-")) return pigeonSkinId.slice("buddy-".length);
  return "pigeon";
}

export default function BuddiesApp({ onBackToPigeon }: { onBackToPigeon?: () => void } = {}) {
  const initialCategory = useUI((s) => s.skinsCategory);
  const setSkinsCategory = useUI((s) => s.setSkinsCategory);
  const currentEquippedSkin = useUI((s) => s.skin);
  const currentEquippedDeck = useUI((s) => s.deckOverride);
  const selectSkin = useUI((s) => s.selectSkin);
  const selectDeck = useUI((s) => s.selectDeck);

  const [category, setCategory] = useState<Category>(initialCategory);

  // Sync category if skinsCategory changes externally
  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

  // daftar skin per kategori
  const list = useMemo(
    () => SKINS.filter((s) => (category === "skate" ? s.float : !s.float)),
    [category]
  );
  const n = list.length;

  // Hitung posisi awal agar langsung menunjuk skin/skate yang sedang aktif di Pigeon SK8
  const getInitialPos = useCallback(
    (cat: Category) => {
      const items = SKINS.filter((s) => (cat === "skate" ? s.float : !s.float));
      if (cat === "char") {
        const targetId = toBuddyCharId(useUI.getState().skin);
        const idx = items.findIndex((s) => s.id === targetId);
        return idx >= 0 ? idx : 0;
      } else {
        const targetDeck = useUI.getState().deckOverride;
        const idx = items.findIndex((s) => s.id === targetDeck);
        return idx >= 0 ? idx : 0;
      }
    },
    []
  );

  const [pos, setPos] = useState(() => getInitialPos(initialCategory));
  const [effectId, setEffectId] = useState<string | null>(null);
  const [bump, setBump] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const skin = list[((pos % n) + n) % n];
  const listIndices = useMemo(() => list.map((s) => SKINS.indexOf(s)), [list]);

  const prev = useCallback(() => {
    sfx.click();
    setPos((p) => p - 1);
  }, []);

  const next = useCallback(() => {
    sfx.click();
    setPos((p) => p + 1);
  }, []);

  const switchCategory = (c: Category) => {
    if (c !== category) {
      sfx.click();
      setCategory(c);
      setSkinsCategory(c);
      setPos(getInitialPos(c));
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape" && onBackToPigeon) onBackToPigeon();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, onBackToPigeon]);

  const isSelected = useMemo(() => {
    if (!skin) return false;
    if (category === "char") {
      return currentEquippedSkin === toPigeonSkinId(skin.id) || currentEquippedSkin === skin.id;
    }
    return currentEquippedDeck === skin.id;
  }, [category, currentEquippedSkin, currentEquippedDeck, skin]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        prev();
      } else {
        next();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative h-screen w-screen overflow-hidden font-sans select-none"
      style={{
        background: "linear-gradient(180deg, #72D4EC 0%, #4FBCDC 100%)",
      }}
    >
      {/* 3D canvas */}
      <div className="absolute inset-0">
        <Scene pos={pos} listIndices={listIndices} effectId={effectId} />
      </div>

      {/* ===== RIBBON BANNER ===== */}
      <div className="pointer-events-none absolute left-0 right-0 top-12 flex justify-center sm:top-14">
        <div className="relative">
          {/* flag kiri */}
          <div
            className="absolute -left-7 top-2 h-10 w-10 bg-[#2A9BB5]"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%, 45% 50%)" }}
          />
          {/* flag kanan */}
          <div
            className="absolute -right-7 top-2 h-10 w-10 bg-[#2A9BB5]"
            style={{ clipPath: "polygon(0 0, 100% 0, 55% 50%, 100% 100%, 0 100%)" }}
          />
          {/* banner utama */}
          <div className="relative rounded-md bg-gradient-to-b from-[#4DC4DE] to-[#35AECB] px-10 py-2.5 shadow-lg">
            <h1
              className="text-2xl font-black uppercase tracking-widest text-white sm:text-3xl"
              style={{ textShadow: "0 2px 0 rgba(0,0,0,0.25)" }}
            >
              {category === "char" ? "Characters" : "Skates"}
            </h1>
          </div>
        </div>
      </div>

      {/* Tombol Kembali ke Pigeon SK8 (pojok kanan atas) */}
      {onBackToPigeon && (
        <button
          type="button"
          onClick={() => {
            sfx.click();
            onBackToPigeon();
          }}
          aria-label="Kembali ke Pigeon SK8"
          title="Kembali ke Pigeon SK8"
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/30 text-xl font-black text-white backdrop-blur-md transition hover:scale-110 hover:bg-white/50 active:scale-95 sm:right-5 sm:top-5"
          style={{ textShadow: "0 2px 0 rgba(0,0,0,0.2)" }}
        >
          ✕
        </button>
      )}

      {/* ===== PANAH KIRI-KANAN ===== */}
      <button
        onClick={prev}
        aria-label="Sebelumnya"
        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/30 p-3 text-2xl text-white backdrop-blur-md transition hover:scale-110 hover:bg-white/50 active:scale-95 sm:left-5"
        style={{ textShadow: "0 2px 0 rgba(0,0,0,0.2)" }}
      >
        ◀
      </button>
      <button
        onClick={next}
        aria-label="Berikutnya"
        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/30 p-3 text-2xl text-white backdrop-blur-md transition hover:scale-110 hover:bg-white/50 active:scale-95 sm:right-5"
        style={{ textShadow: "0 2px 0 rgba(0,0,0,0.2)" }}
      >
        ▶
      </button>

      {/* ===== EFFECT PANEL (kiri) ===== */}
      <div className="absolute left-2 top-24 z-10 flex flex-col gap-1.5 sm:left-5">
        <p className="text-center text-[9px] font-bold uppercase tracking-wider text-white/80">
          Efek
        </p>
        <button
          onClick={() => setEffectId(null)}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl text-base transition-all",
            effectId === null
              ? "scale-110 bg-white shadow-lg"
              : "bg-white/30 backdrop-blur-md hover:bg-white/50"
          )}
          title="Tanpa efek"
        >
          🚫
        </button>
        {EFFECTS.map((e) => (
          <button
            key={e.id}
            onClick={() => setEffectId(e.id)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl text-base transition-all",
              effectId === e.id
                ? "scale-110 bg-white shadow-lg"
                : "bg-white/30 backdrop-blur-md hover:bg-white/50"
            )}
            title={e.name}
          >
            {e.emoji}
          </button>
        ))}
      </div>

      {/* ===== BOTTOM UI (nama nempel dekat karakter) ===== */}
      <div className="absolute bottom-[20%] left-0 right-0 z-10 flex flex-col items-center gap-2.5">
        {/* nama karakter */}
        <h2
          key={skin.id}
          className="animate-[popIn_0.3s_ease] text-3xl font-black uppercase tracking-widest text-white sm:text-4xl"
          style={{ textShadow: "0 3px 0 rgba(0,0,0,0.22)" }}
        >
          {skin.name}
        </h2>

        {/* tombol kategori */}
        <div className="flex gap-3">
          <button
            onClick={() => switchCategory("char")}
            className={cn(
              "flex h-13 w-16 items-center justify-center rounded-2xl border-b-4 text-2xl transition-all active:translate-y-0.5 active:border-b-2",
              category === "char"
                ? "scale-110 border-[#D9A800] bg-gradient-to-b from-[#FFDE4D] to-[#FFC928] shadow-lg"
                : "border-black/20 bg-white/40 backdrop-blur-md hover:bg-white/60"
            )}
            style={{ height: "3.25rem" }}
            title="Karakter"
          >
            👕
          </button>
          <button
            onClick={() => switchCategory("skate")}
            className={cn(
              "flex w-16 items-center justify-center rounded-2xl border-b-4 text-2xl transition-all active:translate-y-0.5 active:border-b-2",
              category === "skate"
                ? "scale-110 border-[#1E88C9] bg-gradient-to-b from-[#5BC8F5] to-[#38ABE8] shadow-lg"
                : "border-black/20 bg-white/40 backdrop-blur-md hover:bg-white/60"
            )}
            style={{ height: "3.25rem" }}
            title="Skate / Kendaraan"
          >
            🛹
          </button>
        </div>

        {/* tombol SELECT */}
        <button
          onClick={() => {
            unlockAudio();
            sfx.unlock();
            setBump((b) => b + 1);
            if (category === "char") {
              selectSkin(skin.id);
              engine.skinPop();
            } else {
              selectDeck(skin.id);
              engine.skinPop();
            }
          }}
          key={bump}
          className={cn(
            "animate-[popIn_0.25s_ease] rounded-2xl border-b-8 px-16 py-3.5 text-3xl font-black uppercase tracking-wider text-white transition-all active:translate-y-1 active:border-b-4 sm:px-20",
            isSelected
              ? "border-[#2E8B3A] bg-gradient-to-b from-[#6FD96A] to-[#4CBF4A]"
              : "border-[#C96F00] bg-gradient-to-b from-[#FFB400] to-[#FF9500]"
          )}
          style={{ textShadow: "0 2px 0 rgba(0,0,0,0.25)" }}
        >
          {isSelected ? "Selected ✓" : "Select ▶"}
        </button>
      </div>

      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.7); }
          70% { transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
