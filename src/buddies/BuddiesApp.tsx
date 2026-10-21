import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Scene from "./Scene";
import { SKINS } from "./characters";
import { cn } from "./utils/cn";
import { useUI } from "../game/store";
import { engine } from "../game/engine";
import { sfx, unlockAudio } from "../game/audio";
import { missionStatus, snapshotCtx } from "../game/skinMissions";

type Category = "char" | "skate";

function toPigeonSkinId(buddyId: string): string {
  return buddyId === "pigeon" ? "classic" : `buddy-${buddyId}`;
}

function toBuddyCharId(pigeonSkinId: string): string {
  if (pigeonSkinId === "classic") return "pigeon";
  if (pigeonSkinId.startsWith("buddy-")) return pigeonSkinId.slice("buddy-".length);
  return "pigeon";
}

function ShirtIcon() {
  return (
    <svg viewBox="0 0 24 24" width="62%" height="62%" fill="currentColor" aria-hidden="true" className="drop-shadow-sm">
      <path d="M12 4.5c1.1 0 2 .5 2.7 1.2.6-.4 1.3-.7 2.1-.7H19l3 6-3 1.5-1.5-3V20c0 .6-.4 1-1 1H7.5c-.6 0-1-.4-1-1V9.5L5 12.5 2 11l3-6h2.2c.8 0 1.5.3 2.1.7.7-.7 1.6-1.2 2.7-1.2z" />
    </svg>
  );
}

function SkateboardIcon() {
  return (
    <svg viewBox="0 0 24 24" width="66%" height="66%" fill="currentColor" aria-hidden="true" className="drop-shadow-sm" style={{ transform: "rotate(-25deg)" }}>
      {/* Board deck */}
      <rect x="2" y="9.5" width="20" height="5" rx="2.5" />
      {/* Wheels */}
      <circle cx="6" cy="17" r="2.2" />
      <circle cx="18" cy="17" r="2.2" />
    </svg>
  );
}

export default function BuddiesApp({ onBackToPigeon }: { onBackToPigeon?: () => void } = {}) {
  const initialCategory = useUI((s) => s.skinsCategory);
  const setSkinsCategory = useUI((s) => s.setSkinsCategory);
  const currentEquippedSkin = useUI((s) => s.skin);
  const currentEquippedDeck = useUI((s) => s.deckOverride);
  const selectSkin = useUI((s) => s.selectSkin);
  const selectDeck = useUI((s) => s.selectDeck);
  const trailEffect = useUI((s) => s.trailEffect);
  // Data untuk kartu syarat buka skin: progres dihitung dari statistik + dompet roti.
  const wallet = useUI((s) => s.wallet);
  const bestScore = useUI((s) => s.best);
  const unlocked = useUI((s) => s.unlocked);
  const unlockedDecks = useUI((s) => s.unlockedDecks);
  const addPopup = useUI((s) => s.addPopup);

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
  const [effectId, setEffectId] = useState<string | null>(trailEffect);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    setEffectId(trailEffect);
  }, [trailEffect]);

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

  // ── Info syarat buka skin (misi) untuk skin yang lagi dilihat ──
  const isSkate = category === "skate";
  const entryId = isSkate ? skin.id : toPigeonSkinId(skin.id);
  const isUnlocked = isSkate ? unlockedDecks.includes(entryId) : unlocked.includes(entryId);
  const { mission, status } = useMemo(
    () => missionStatus(entryId, snapshotCtx(bestScore, wallet)),
    [entryId, bestScore, wallet]
  );
  const missionDone = status?.done ?? true;
  const canOpen = isUnlocked || missionDone;
  const pct = status ? Math.max(0, Math.min(100, Math.round((status.cur / Math.max(1, status.goal)) * 100))) : 100;
  const missionHint = mission && mission.kind !== "price"
    ? "Progres tercatat otomatis — skin terbuka sendiri begitu syarat tercapai."
    : "Terbeli otomatis dari dompet roti begitu jumlahmu cukup.";

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
        background: "linear-gradient(180deg, #3ec6f0 0%, #12a5e4 100%)",
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
          <div className="relative rounded-md bg-gradient-to-b from-[#4DC4DE] to-[#35AECB] px-8 sm:px-10 py-2 sm:py-2.5 shadow-lg">
            <h1
              className="font-display text-base sm:text-xl font-black uppercase tracking-wider text-white"
              style={{ textShadow: "0 2px 0 rgba(0,0,0,0.25)" }}
            >
              {category === "char" ? "CHARACTERS" : "SKATES"}
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
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-xl font-display font-black text-white backdrop-blur-md transition hover:scale-110 hover:bg-white/40 active:scale-95 sm:right-5 sm:top-5"
          style={{ textShadow: "0 2px 0 rgba(0,0,0,0.2)" }}
        >
          ✕
        </button>
      )}

      {/* ===== PANAH KIRI-KANAN (Huruf < dan > putih tanpa panel lingkaran) ===== */}
      <button
        type="button"
        onClick={prev}
        aria-label="Sebelumnya"
        className="pointer-events-auto absolute left-2 sm:left-5 top-1/2 z-10 -translate-y-1/2 p-2 sm:p-4 font-display text-4xl sm:text-5xl font-black text-white transition hover:scale-125 active:scale-90"
        style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5), 0 4px 14px rgba(0,0,0,0.3)" }}
      >
        &lt;
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Berikutnya"
        className="pointer-events-auto absolute right-2 sm:right-5 top-1/2 z-10 -translate-y-1/2 p-2 sm:p-4 font-display text-4xl sm:text-5xl font-black text-white transition hover:scale-125 active:scale-90"
        style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5), 0 4px 14px rgba(0,0,0,0.3)" }}
      >
        &gt;
      </button>

      {/* ===== NAMA KARAKTER + KARTU SYARAT BUKA (tepat di bawah model) ===== */}
      <div className="pointer-events-none absolute bottom-[13.25rem] sm:bottom-[15.25rem] left-0 right-0 z-10 flex flex-col items-center gap-1.5 px-4">
        <h2
          key={skin.id}
          className="animate-[popIn_0.3s_ease] font-display text-base sm:text-xl font-black uppercase tracking-wider text-white drop-shadow-md text-center max-w-full"
          style={{ textShadow: "0 2px 0 rgba(0,0,0,0.3)" }}
        >
          {skin.name}
        </h2>

        {/* Info syarat terbuka: misi apa yang harus dikerjakan supaya skin ini bisa dipakai */}
        <div
          key={`${skin.id}-req`}
          className={cn(
            "animate-[popIn_0.3s_ease] w-full max-w-md rounded-xl px-3.5 py-2 text-center backdrop-blur-sm ring-1",
            isUnlocked
              ? "bg-[#1b7a43]/85 ring-[#2ecc71]/60"
              : missionDone
                ? "bg-[#c96f00]/85 ring-[#ffd60a]/70"
                : "bg-[#1f2430]/80 ring-white/25"
          )}
        >
          {isUnlocked ? (
            <span className="font-display text-[11px] sm:text-[13px] font-black uppercase tracking-wide text-white">
              ✓ TERBUKA {isSelected ? "· SEKARANG DIPAKAI" : "· SIAP DIPAKAI"}
            </span>
          ) : missionDone ? (
            <span className="font-display text-[11px] sm:text-[13px] font-black uppercase tracking-wide text-white">
              🎉 SYARAT TERPENUHI — TEKAN &quot;{status?.purchase ? `BUKA · ${status.goal} 🍞` : "BUKA SKIN"}&quot;!
            </span>
          ) : (
            <div className="flex flex-col gap-1">
              <span className="font-display text-[10px] sm:text-[11px] font-black uppercase tracking-wide text-[#ffd60a]">
                🔒 SYARAT TERBUKA
              </span>
              <span className="font-body text-[11px] sm:text-[13px] font-bold leading-snug text-white">
                {status?.label ?? "Gratis — langsung terbuka"}
              </span>
              {status && (
                <div className="mx-auto mt-0.5 h-1.5 w-full max-w-[16rem] overflow-hidden rounded-full bg-black/40">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#ffd60a] to-[#ff9500] transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
              <span className="font-body text-[9.5px] sm:text-[11px] font-semibold text-white/75">
                {status?.purchase
                  ? `Dompetmu: ${status.cur.toLocaleString("id-ID")} / ${status.goal.toLocaleString("id-ID")} roti`
                  : `${status ? status.cur.toLocaleString("id-ID") : 0} / ${status ? status.goal.toLocaleString("id-ID") : 1} — ${missionHint}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ===== KONTROL BAWAH (Kembali ke bawah normal, tidak ikut naik) ===== */}
      <div className="absolute bottom-9 sm:bottom-12 left-0 right-0 z-10 flex flex-col items-center gap-2.5 sm:gap-3">
        {/* tombol kategori: Skin Baju (Kuning) & Skin Skate (Biru) bergaya Main Menu */}
        <div className="flex items-center gap-3">
          {/* Tombol Skin Baju (Kuning dengan ShirtIcon) */}
          <button
            type="button"
            onClick={() => switchCategory("char")}
            title="Karakter / Skin Baju"
            aria-label="Pilih Karakter"
            className={cn(
              "pointer-events-auto flex h-13 w-13 sm:h-15 sm:w-15 items-center justify-center rounded-2xl bg-[#ffd60a] text-white transition-all active:translate-y-[2px] active:shadow-none",
              category === "char"
                ? "scale-105 shadow-[0_5px_0_#c9a400] ring-3 ring-white"
                : "opacity-60 shadow-[0_3px_0_#c9a400] hover:opacity-90"
            )}
          >
            <ShirtIcon />
          </button>

          {/* Tombol Skin Skate (Biru dengan SkateboardIcon) */}
          <button
            type="button"
            onClick={() => switchCategory("skate")}
            title="Skateboard / Skin Skate"
            aria-label="Pilih Skateboard"
            className={cn(
              "pointer-events-auto flex h-13 w-13 sm:h-15 sm:w-15 items-center justify-center rounded-2xl bg-[#38bdf8] text-white transition-all active:translate-y-[2px] active:shadow-none",
              category === "skate"
                ? "scale-105 shadow-[0_5px_0_#0284c7] ring-3 ring-white"
                : "opacity-60 shadow-[0_3px_0_#0284c7] hover:opacity-90"
            )}
          >
            <SkateboardIcon />
          </button>
        </div>

        {/* tombol SELECT / BUKA SKIN / TERKUNCI (font 8-bit bergaya main menu) */}
        <button
          type="button"
          onClick={() => {
            unlockAudio();
            if (!isUnlocked && !canOpen) {
              // Misi belum selesai: beri tahu syaratnya, jangan equip.
              sfx.deny();
              if (status) addPopup(`🔒 ${status.label}`, "#ff6b6b");
              return;
            }
            const ok = isSkate ? selectDeck(skin.id) : selectSkin(skin.id);
            if (!ok) {
              sfx.deny();
              if (status?.purchase) addPopup(`🍞 ROTI KURANG — PERLU ${status.goal}`, "#ff6b6b");
              return;
            }
            sfx.unlock();
            setBump((b) => b + 1);
            if (!isUnlocked) {
              addPopup(isSkate ? `🛹 PAPAN ${skin.name.toUpperCase()} TERBUKA!` : `🎉 SKIN ${skin.name.toUpperCase()} TERBUKA!`, "#ffd60a");
            }
            engine.skinPop();
          }}
          key={bump}
          className={cn(
            "pointer-events-auto animate-[popIn_0.25s_ease] rounded-2xl px-10 py-3 sm:py-3.5 sm:px-14 font-display text-base sm:text-xl font-black uppercase tracking-wider text-white transition-all active:translate-y-1",
            isSelected
              ? "bg-gradient-to-b from-[#2ecc71] to-[#27ae60] shadow-[0_6px_0_#1b7a43] active:shadow-[0_2px_0_#1b7a43]"
              : canOpen
                ? "bg-gradient-to-b from-[#ffd166] to-[#ffb400] shadow-[0_6px_0_#c96f00] active:shadow-[0_2px_0_#c96f00]"
                : "bg-gradient-to-b from-[#7b8494] to-[#5b6472] shadow-[0_6px_0_#414a57] active:shadow-[0_2px_0_#414a57]"
          )}
          style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
        >
          {isSelected
            ? "SELECTED"
            : !canOpen
              ? "🔒 TERKUNCI"
              : !isUnlocked && status?.purchase
                ? `BUKA · ${status.goal} 🍞`
                : !isUnlocked
                  ? "BUKA SKIN!"
                  : isSkate
                    ? "PAKAI PAPAN"
                    : "SELECT"}
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
