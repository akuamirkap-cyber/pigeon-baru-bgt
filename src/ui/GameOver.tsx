import { useState, useEffect } from "react";
import { useUI } from "../game/store";
import { engine } from "../game/engine";
import { sfx } from "../game/audio";
import { BreadIcon } from "./BreadIcon";
import { AchievementsPanel } from "./AchievementsPanel";

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true" className="drop-shadow-sm">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

function ShirtIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true" className="drop-shadow-sm">
      <path d="M12 4.5c1.1 0 2 .5 2.7 1.2.6-.4 1.3-.7 2.1-.7H19l3 6-3 1.5-1.5-3V20c0 .6-.4 1-1 1H7.5c-.6 0-1-.4-1-1V9.5L5 12.5 2 11l3-6h2.2c.8 0 1.5.3 2.1.7.7-.7 1.6-1.2 2.7-1.2z" />
    </svg>
  );
}

function SkateboardIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true" className="drop-shadow-sm" style={{ transform: "rotate(-25deg)" }}>
      <rect x="2" y="9.5" width="20" height="5" rx="2.5" />
      <circle cx="6" cy="17" r="2.2" />
      <circle cx="18" cy="17" r="2.2" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true" className="drop-shadow-sm">
      <path d="M6.5 2h11a1 1 0 0 1 1 1v5.2a6.5 6.5 0 0 1-13 0V3a1 1 0 0 1 1-1z" />
      <path d="M5.5 3.5H3A1.5 1.5 0 0 0 1.5 5v1A4.5 4.5 0 0 0 6 10.5h.6A8 8 0 0 1 5.5 7V3.5zM3.5 5.5h2V7a6 6 0 0 0 .5 2.4A2.5 2.5 0 0 1 3.5 6v-.5z" />
      <path d="M18.5 3.5H21A1.5 1.5 0 0 1 22.5 5v1a4.5 4.5 0 0 1-4.5 4.5h-.6a8 8 0 0 0 1.1-3.5V3.5zm2 2h-2V7a6 6 0 0 1-.5 2.4A2.5 2.5 0 0 0 20.5 6v-.5z" />
      <path d="M11 13h2v4h3.2a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H7.8a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1H11v-4z" />
      <path d="M12 4.2l.9 1.8 2 .3-1.45 1.4.35 2L12 8.75 10.2 9.7l.35-2L9.1 6.3l2-.3.9-1.8z" fill="#ffd23f" />
    </svg>
  );
}

/**
 * Layar GAME OVER autentik bergaya Retro Arcade 8-bit (Pigeon Mode):
 *  - 3D Ribbon Banner merah berlapis (sayap kiri-kanan & lipatan 3D) dengan teks 8-bit GAME OVER
 *  - Board kartu arcade berbingkai tebal 3.5px dan drop-shadow tebal
 *  - Tampilan skor utama besar dengan font 8-bit
 *  - Stat box kembar: Rekor Terbaik (🏆 BEST) & Roti hasil lari (🍞 ROTI)
 *  - Tombol aksi utama: MAIN LAGI ↺ (Hijau arcade 3D + efek kilau shine)
 *  - 4 Tombol squircle persis seperti Main Menu Pigeon SK8:
 *      1. MENU 🏠 (Navy)
 *      2. SKIN 👕 (Kuning)
 *      3. SKATE 🛹 (Biru langit)
 *      4. PRESTASI 🏆 (Ungu)
 *  - 100% Tipografi arcade 8-BIT WONDER
 */
export function GameOver() {
  const phase = useUI((s) => s.phase);
  const score = useUI((s) => s.score);
  const best = useUI((s) => s.best);
  const bread = useUI((s) => s.bread);
  const isNewBest = useUI((s) => s.isNewBest);
  const wordHunt = useUI((s) => s.wordHunt);
  const setShowMysteryBox = useUI((s) => s.setShowMysteryBox);
  const [showAch, setShowAch] = useState(false);

  // Efek suara instan saat layar game over muncul
  useEffect(() => {
    if (phase !== "gameover") return;
    try {
      if (isNewBest && score > 0) {
        sfx.fanfare();
      } else {
        sfx.countDone();
      }
    } catch {
      // ignore
    }
  }, [phase, isNewBest, score]);

  if (phase !== "gameover") return null;

  const canOpen = wordHunt.pendingBox || (wordHunt.collected.every(Boolean) && !wordHunt.claimed);

  const handleRetry = () => {
    sfx.click();
    engine.startRun();
  };

  const handleMenu = () => {
    sfx.click();
    engine.toMenu();
  };

  const handleSkins = () => {
    sfx.click();
    useUI.getState().setSkinsCategory("char");
    useUI.getState().setMenuView("skins");
    engine.toMenu();
  };

  const handleSkates = () => {
    sfx.click();
    useUI.getState().setSkinsCategory("skate");
    useUI.getState().setMenuView("skins");
    engine.toMenu();
  };

  const handleAchievements = () => {
    sfx.click();
    setShowAch(true);
  };

  return (
    <>
      <div className="card-in pointer-events-auto absolute inset-0 z-30 flex select-none items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
        {/* Kontainer Utama Dialog */}
        <div className="relative flex w-[90%] max-w-[340px] flex-col items-center">
          
          {/* ── 3D ARCADE RIBBON BANNER: GAME OVER ── */}
          <div className="relative z-10 -mb-5 flex items-center justify-center">
            {/* Sayap Pita Kiri (Folded behind main plate) */}
            <div
              className="absolute -left-6 top-3 h-10 w-12 border-y-[3.5px] border-l-[3.5px] border-[#181d27] bg-[#b91c1c] shadow-md"
              style={{
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 25% 50%)",
              }}
            />
            {/* Segitiga Lipatan Pita Kiri (Efek Kedalaman 3D) */}
            <div
              className="absolute -left-1.5 top-9.5 h-3.5 w-4.5 bg-[#6b0f0f]"
              style={{
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%)",
              }}
            />

            {/* Pelat Utama Pita Merah Tengah */}
            <div className="relative z-10 flex items-center justify-center rounded-2xl border-[3.5px] border-[#181d27] bg-gradient-to-b from-[#ff4d4f] via-[#e02424] to-[#b91c1c] px-6 py-2.5 shadow-[0_6px_0_#7f1d1d,0_10px_20px_rgba(0,0,0,0.45)]">
              <span className="font-display text-[clamp(18px,5.2cqw,25px)] font-black tracking-widest text-white drop-shadow-[0_2.5px_0_#7f1d1d]">
                GAME OVER
              </span>
              {/* Highlight glossy pita atas */}
              <div className="pointer-events-none absolute inset-x-2 top-1 h-[32%] rounded-t-lg bg-white/20" />
            </div>

            {/* Segitiga Lipatan Pita Kanan (Efek Kedalaman 3D) */}
            <div
              className="absolute -right-1.5 top-9.5 h-3.5 w-4.5 bg-[#6b0f0f]"
              style={{
                clipPath: "polygon(0% 0%, 100% 0%, 0% 100%)",
              }}
            />
            {/* Sayap Pita Kanan (Folded behind main plate) */}
            <div
              className="absolute -right-6 top-3 h-10 w-12 border-y-[3.5px] border-r-[3.5px] border-[#181d27] bg-[#b91c1c] shadow-md"
              style={{
                clipPath: "polygon(0% 0%, 100% 0%, 75% 50%, 100% 100%, 0% 100%)",
              }}
            />
          </div>

          {/* ── KOTAK KARTU UTAMA ARCADE (Rounded Board) ── */}
          <div className="w-full rounded-[28px] border-[3.5px] border-[#181d27] bg-white p-4.5 pt-8 text-center shadow-[0_8px_0_#181d27,0_20px_35px_rgba(0,0,0,0.4)]">
            
            {/* Kotak Skor Utama */}
            <div className="relative rounded-2xl border-2 border-[#e2e8f0] bg-[#f8fafc] p-3 text-center shadow-inner">
              <div className="font-display text-[10px] tracking-[0.2em] text-[#64748b]">
                SCORE
              </div>
              <div className="my-1 font-display text-[clamp(34px,8.6cqw,46px)] leading-none text-[#181d27] drop-shadow-sm font-black">
                {score.toLocaleString()}
              </div>
              {isNewBest && (
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#ffd21f] to-[#ff9f1c] px-3 py-0.5 font-display text-[8.5px] font-bold text-[#181d27] shadow-[0_2px_0_#d5a92e] animate-bounce">
                  ★ REKOR BARU! ★
                </div>
              )}
            </div>

            {/* Baris Statistik Sub: BEST & ROTI */}
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              {/* BEST SCORE */}
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-[#e2e8f0] bg-[#f8fafc] p-2">
                <div className="flex items-center gap-1 font-display text-[8.5px] tracking-wider text-[#64748b]">
                  <span className="text-[11px]">🏆</span> BEST
                </div>
                <div className="mt-1 font-display text-[clamp(14px,3.8cqw,17px)] leading-tight text-[#181d27]">
                  {best.toLocaleString()}
                </div>
              </div>

              {/* BREAD / ROTI */}
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-[#fef08a] bg-[#fefce8] p-2">
                <div className="flex items-center gap-1 font-display text-[8.5px] tracking-wider text-[#b45309]">
                  <BreadIcon size={13} /> ROTI
                </div>
                <div className="mt-1 font-display text-[clamp(14px,3.8cqw,17px)] leading-tight text-[#d97706]">
                  +{bread}
                </div>
              </div>
            </div>

            {/* Word Hunt Bonus Banner (Jika siap dibuka) */}
            {canOpen && (
              <button
                type="button"
                onClick={() => {
                  sfx.click();
                  setShowMysteryBox(true);
                }}
                className="mt-2.5 flex w-full animate-pulse items-center justify-between rounded-xl bg-gradient-to-r from-[#ffd21f] to-[#ff9f1c] px-3 py-2 text-[#1a1f2c] shadow-[0_3px_0_#d5a92e] transition-transform active:translate-y-[2px]"
              >
                <span className="font-display text-[9px] font-bold tracking-wide">WORD HUNT SELESAI!</span>
                <span className="font-display text-[9px] font-bold">BUKA BOX 🎁</span>
              </button>
            )}

            {/* ── TOMBOL UTAMA: MAIN LAGI ↺ (Hijau Arcade 3D + Kilau Shine) ── */}
            <button
              type="button"
              onClick={handleRetry}
              className="relative overflow-hidden mt-3.5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#2ecc71] to-[#27ae60] py-3.5 font-display text-[clamp(15px,4cqw,18px)] text-white shadow-[0_6px_0_#1b7a43] transition-transform active:translate-y-[3px] active:shadow-[0_2px_0_#1b7a43]"
            >
              <span className="relative z-10">MAIN LAGI</span>
              <span className="relative z-10 text-lg leading-none font-black">↺</span>
              <span className="shine pointer-events-none absolute inset-y-0 w-[22%] -rotate-12 bg-white/30 blur-[2px]" />
            </button>

            {/* ── BARIS TOMBOL SQUIRCLE LENGKAP ALA PIGEON MODE ── */}
            <div className="mt-2.5 grid grid-cols-4 gap-2">
              {/* 1. Menu Utama (Navy) */}
              <button
                type="button"
                onClick={handleMenu}
                title="Kembali ke Menu Utama"
                className="flex aspect-square flex-col items-center justify-center rounded-2xl bg-[#2a3447] p-1 text-white shadow-[0_4px_0_#18202d] transition-transform active:translate-y-[2px] active:shadow-none"
              >
                <HomeIcon />
                <span className="mt-1 font-display text-[7.5px] tracking-wide">MENU</span>
              </button>

              {/* 2. Skin / Karakter (Kuning) */}
              <button
                type="button"
                onClick={handleSkins}
                title="Pilih Skin Karakter 3D"
                className="flex aspect-square flex-col items-center justify-center rounded-2xl bg-[#ffd60a] p-1 text-[#1f2430] shadow-[0_4px_0_#c9a400] transition-transform active:translate-y-[2px] active:shadow-none"
              >
                <ShirtIcon />
                <span className="mt-1 font-display text-[7.5px] font-black text-[#1f2430] tracking-wide">SKIN</span>
              </button>

              {/* 3. Skate / Papan (Biru Langit) */}
              <button
                type="button"
                onClick={handleSkates}
                title="Pilih Papan Skate 3D"
                className="flex aspect-square flex-col items-center justify-center rounded-2xl bg-[#38bdf8] p-1 text-white shadow-[0_4px_0_#0284c7] transition-transform active:translate-y-[2px] active:shadow-none"
              >
                <SkateboardIcon />
                <span className="mt-1 font-display text-[7.5px] font-black text-white tracking-wide">SKATE</span>
              </button>

              {/* 4. Prestasi (Ungu) */}
              <button
                type="button"
                onClick={handleAchievements}
                title="Pencapaian & Prestasi"
                className="flex aspect-square flex-col items-center justify-center rounded-2xl bg-[#a855f7] p-1 text-white shadow-[0_4px_0_#7e22ce] transition-transform active:translate-y-[2px] active:shadow-none"
              >
                <TrophyIcon />
                <span className="mt-1 font-display text-[7.5px] tracking-wide">PRESTASI</span>
              </button>
            </div>

            {/* Petunjuk Keyboard */}
            <div className="mt-2.5 font-display text-[8px] tracking-wider text-[#94a3b8]">
              [TEKAN SPASI UNTUK MAIN LAGI]
            </div>
          </div>
        </div>
      </div>

      {/* Modal Prestasi jika dibuka langsung dari Game Over */}
      {showAch && <AchievementsPanel onClose={() => setShowAch(false)} />}
    </>
  );
}
