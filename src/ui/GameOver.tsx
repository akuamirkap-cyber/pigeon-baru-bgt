import { useState, useEffect, useRef } from "react";
import { useUI } from "../game/store";
import { engine } from "../game/engine";
import { sfx, SOUNDS, playSound, type SoundId } from "../game/audio";
import { AchievementsPanel } from "./AchievementsPanel";

/* ================= Ikon koin pixel ================= */
function CoinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* lingkaran koin gaya pixel */}
      <rect x="3" y="0" width="6" height="12" fill="#f6b000" />
      <rect x="1" y="1" width="10" height="10" fill="#f6b000" />
      <rect x="0" y="3" width="12" height="6" fill="#f6b000" />
      {/* highlight */}
      <rect x="3" y="1" width="3" height="2" fill="#ffe14d" />
      <rect x="1" y="3" width="2" height="3" fill="#ffe14d" />
      {/* bagian dalam */}
      <rect x="4" y="3" width="4" height="6" fill="#c97f00" />
      <rect x="5" y="4" width="2" height="4" fill="#f6b000" />
    </svg>
  );
}

/* ================= Ikon podium leaderboard pixel ================= */
function PodiumIcon() {
  return (
    <svg
      width="40"
      height="32"
      viewBox="0 0 30 24"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* podium 2 (kiri) */}
      <rect x="1" y="10" width="9" height="13" fill="#ffffff" />
      <rect x="1" y="10" width="9" height="2" fill="#e8f8ff" />
      {/* podium 1 (tengah, paling tinggi) */}
      <rect x="10" y="4" width="10" height="19" fill="#ffffff" />
      <rect x="10" y="4" width="10" height="2" fill="#e8f8ff" />
      {/* podium 3 (kanan) */}
      <rect x="20" y="14" width="9" height="9" fill="#ffffff" />
      <rect x="20" y="14" width="9" height="2" fill="#e8f8ff" />
      {/* angka 2 */}
      <g fill="#1e9ec9">
        <rect x="3" y="14" width="5" height="1.6" />
        <rect x="6.4" y="15.6" width="1.6" height="1.6" />
        <rect x="3" y="17.2" width="5" height="1.6" />
        <rect x="3" y="18.8" width="1.6" height="1.6" />
        <rect x="3" y="20.4" width="5" height="1.6" />
      </g>
      {/* angka 1 */}
      <g fill="#1e9ec9">
        <rect x="14" y="8" width="2" height="1.8" />
        <rect x="13" y="9.8" width="3" height="1.8" />
        <rect x="14" y="9.8" width="2" height="8" />
        <rect x="12.5" y="17.8" width="5" height="1.8" />
      </g>
      {/* angka 3 */}
      <g fill="#1e9ec9">
        <rect x="22" y="16.5" width="5" height="1.4" />
        <rect x="25.6" y="17.9" width="1.4" height="1.2" />
        <rect x="23" y="19.1" width="4" height="1.4" />
        <rect x="25.6" y="20.5" width="1.4" height="1.2" />
        <rect x="22" y="21.7" width="5" height="1.4" />
      </g>
    </svg>
  );
}

/* ================= Ikon rumah pixel (simbol home tengah) ================= */
function PixelHomeIcon() {
  return (
    <svg
      width="32"
      height="30"
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* Atap segitiga & dinding pixel putih */}
      <path
        d="M7 1h2v2H7z M5 3h6v2H5z M3 5h10v2H3z M1 7h14v2H1z M2 9h12v6H2z"
        fill="#ffffff"
      />
      {/* Pintu rumah tengah */}
      <rect x="6" y="10" width="4" height="5" fill="#1b8eb5" />
    </svg>
  );
}

/* ================= Tombol pixel biru 3D ================= */
function PixelButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="group relative h-[62px] w-[76px] cursor-pointer select-none outline-none transition-transform duration-75 active:translate-y-[3px]"
    >
      {/* bayangan bawah */}
      <span className="pixel-corners-sm absolute inset-0 translate-y-[5px] bg-[#0f7fa8] transition-transform duration-75 group-active:translate-y-[2px]" />
      {/* badan tombol */}
      <span className="pixel-corners-sm absolute inset-0 bg-[#39c1ea]">
        {/* highlight atas */}
        <span className="absolute left-[7px] right-[7px] top-[4px] h-[9px] bg-[#8fe3ff]" />
        <span className="absolute left-[5px] top-[7px] h-[18px] w-[6px] bg-[#8fe3ff]" />
        {/* shading bawah */}
        <span className="absolute bottom-[4px] left-[7px] right-[7px] h-[6px] bg-[#1fa3cf]" />
      </span>
      {/* isi ikon */}
      <span className="relative z-10 flex h-full w-full items-center justify-center">
        {children}
      </span>
    </button>
  );
}

/* ================= Pita GAME OVER Merah ================= */
function GameOverRibbon() {
  return (
    <div className="anim-pop relative flex w-full max-w-[340px] justify-center">
      {/* ujung pita kiri */}
      <div className="ribbon-end-left absolute left-[2px] top-[23px] h-[62px] w-[92px] bg-[#c0272d]">
        <div className="absolute inset-x-0 top-0 h-[8px] bg-[#d8363c]" />
      </div>
      {/* ujung pita kanan */}
      <div className="ribbon-end-right absolute right-[2px] top-[23px] h-[62px] w-[92px] bg-[#c0272d]">
        <div className="absolute inset-x-0 top-0 h-[8px] bg-[#d8363c]" />
      </div>
      {/* lipatan segitiga bawah */}
      <div className="absolute left-[62px] top-[72px] h-0 w-0 border-l-[18px] border-t-[15px] border-l-transparent border-t-[#8c1b20]" />
      <div className="absolute right-[62px] top-[72px] h-0 w-0 border-r-[18px] border-t-[15px] border-r-transparent border-t-[#8c1b20]" />
      {/* badan utama pita */}
      <div className="pixel-corners relative z-10 mx-[62px] w-full bg-[#e8403f] px-2 py-5 text-center">
        {/* highlight atas */}
        <div className="absolute inset-x-[8px] top-[5px] h-[8px] bg-[#f2635c]" />
        {/* shading bawah */}
        <div className="absolute inset-x-[8px] bottom-[5px] h-[8px] bg-[#c9302f]" />
        <h1 className="pixel-outline-sm whitespace-nowrap font-display text-[20px] leading-none tracking-[1px] text-white sm:text-[23px]">
          GAME OVER
        </h1>
      </div>
    </div>
  );
}

/* ================= Bagian skor terapung (Formula perhitungan dari ZIP) ================= */
function ScorePanel({
  score,
  best,
  bread,
  isNewBest,
  runId,
}: {
  score: number;
  best: number;
  bread: number;
  isNewBest: boolean;
  runId: number;
}) {
  const [displayedScore, setDisplayedScore] = useState(0);
  const [displayedBread, setDisplayedBread] = useState(0);
  const [done, setDone] = useState(false);
  const [localRun, setLocalRun] = useState(0);
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef(0);
  const soundProfile = useUI((s) => s.soundProfile);

  useEffect(() => {
    setDone(false);
    setDisplayedScore(0);
    setDisplayedBread(0);
    lastTickRef.current = 0;

    if (score <= 0 && bread <= 0) {
      setDisplayedScore(0);
      setDisplayedBread(0);
      setDone(true);
      sfx.countDone();
      return;
    }

    const start = performance.now();
    // Durasi berhitung (1300 ms sesuai formula ZIP)
    const TALLY_DURATION = 1300;

    const frame = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / TALLY_DURATION, 1);
      // Easing cubic-out: cepat di awal, melambat di akhir
      const eased = 1 - Math.pow(1 - t, 3);
      const valScore = Math.round(score * eased);
      const valBread = Math.round(bread * eased);

      setDisplayedScore(valScore);
      setDisplayedBread(valBread);

      // Suara tick tiap ~55ms dengan pitch naik seiring progres (formula persis ZIP)
      if (now - lastTickRef.current > 55 && t < 1) {
        lastTickRef.current = now;
        sfx.countTick(eased);
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        setDisplayedScore(score);
        setDisplayedBread(bread);
        setDone(true);
        sfx.countDone();
        if (isNewBest && score > 0) {
          setTimeout(() => sfx.fanfare(), 120);
        }
      }
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [runId, localRun, score, bread, isNewBest, soundProfile]);

  return (
    <div className="anim-slide relative w-[88%] max-w-[320px] px-2 pb-2 pt-2 text-center [animation-delay:0.15s]">
      <p className="pixel-outline-sm font-display text-[15px] tracking-[2px] text-white sm:text-[16px]">
        SCORE
      </p>

      {/* Klik angka untuk mengulang perhitungan skor (persis fitur ZIP) */}
      <button
        type="button"
        onClick={() => setLocalRun((r) => r + 1)}
        title="Klik untuk ulangi perhitungan skor"
        className={`mt-3.5 cursor-pointer font-display text-[50px] leading-none outline-none sm:text-[56px] transition-transform duration-75 ${
          done
            ? "anim-score pixel-outline text-[#ffcc00]"
            : "pixel-outline text-[#ffe066] scale-[1.03]"
        }`}
      >
        {displayedScore.toLocaleString()}
      </button>

      {/* Badge Rekor Baru muncul saat hitungan tuntas */}
      {isNewBest && score > 0 && done && (
        <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#ffd21f] to-[#ff9f1c] px-3.5 py-1 font-display text-[9px] font-bold text-[#181d27] shadow-[0_2px_0_#d5a92e] animate-bounce">
          ★ REKOR BARU! ★
        </div>
      )}

      <div className="mt-5 flex items-center justify-center gap-4">
        <span className="pixel-outline-sm whitespace-nowrap font-display text-[15px] text-white sm:text-[16px]">
          BEST {best.toLocaleString()}
        </span>
        <span className="flex items-center gap-2">
          <CoinIcon size={22} />
          <span
            className={`pixel-outline-sm font-display text-[15px] sm:text-[16px] transition-colors ${
              done ? "text-[#ffcc00]" : "text-[#ffe57f]"
            }`}
          >
            +{displayedBread}
          </span>
        </span>
      </div>
    </div>
  );
}

/* ================= Panel 30 Sound FX (dari file ZIP) ================= */
export function SoundPanelModal({
  selected,
  onSelect,
  onClose,
}: {
  selected: SoundId;
  onSelect: (id: SoundId) => void;
  onClose: () => void;
}) {
  return (
    <div className="anim-slide pixel-corners relative w-full max-w-[330px] border-2 border-white/20 bg-[#10263f]/90 p-4 shadow-2xl backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between">
        <p className="pixel-outline-sm font-display text-[12px] tracking-[1.5px] text-white">
          🔊 30 SOUND FX (ZIP)
        </p>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded bg-black/40 px-2 py-0.5 font-display text-[10px] text-white/80 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="grid max-h-[260px] grid-cols-2 gap-2 overflow-y-auto pr-1">
        {SOUNDS.map((s) => {
          const active = s.id === selected;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                onSelect(s.id);
                playSound(s.id);
              }}
              className={`pixel-corners-sm relative flex cursor-pointer items-center gap-2 px-2.5 py-2 text-left transition-transform duration-75 active:translate-y-[2px] ${
                active ? "bg-[#39c1ea]" : "bg-[#1b3a5c]/80 hover:bg-[#24507d]/90"
              }`}
            >
              <span className="text-[14px]">{s.emoji}</span>
              <span
                className={`pixel-outline-sm font-display text-[8.5px] leading-tight truncate ${
                  active ? "text-white" : "text-[#bcd6ea]"
                }`}
              >
                {s.label}
              </span>
              {active && (
                <span className="pixel-outline-sm absolute right-1.5 top-1/2 -translate-y-1/2 text-[8px] text-[#ffcc00]">
                  ▶
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-center font-display text-[8px] leading-relaxed text-white/70">
        KLIK UNTUK TES & PUTAR SOUND 8-BIT
      </p>
    </div>
  );
}

export function GameOver() {
  const phase = useUI((s) => s.phase);
  const score = useUI((s) => s.score);
  const best = useUI((s) => s.best);
  const bread = useUI((s) => s.bread);
  const isNewBest = useUI((s) => s.isNewBest);
  const wordHunt = useUI((s) => s.wordHunt);
  const setShowMysteryBox = useUI((s) => s.setShowMysteryBox);

  const soundProfile = useUI((s) => s.soundProfile);
  const toggleSoundProfile = useUI((s) => s.toggleSoundProfile);

  const [replayKey, setReplayKey] = useState(0);
  const [showAch, setShowAch] = useState(false);
  const [soundOpen, setSoundOpen] = useState(false);
  const [selectedSound, setSelectedSound] = useState<SoundId>("gameover");

  const handleRetry = () => {
    sfx.click();
    setReplayKey((k) => k + 1);
    engine.startRun();
  };

  const handleAchievements = () => {
    sfx.click();
    setShowAch(true);
  };

  const handleMenu = () => {
    sfx.click();
    engine.toMenu();
  };

  // Keyboard shortcut: Space / Enter untuk main lagi, Esc untuk kembali ke menu
  useEffect(() => {
    if (phase !== "gameover") return;
    const onKey = (e: KeyboardEvent) => {
      if (soundOpen) {
        if (e.key === "Escape") setSoundOpen(false);
        return;
      }
      if (showAch) {
        if (e.key === "Escape") setShowAch(false);
        return;
      }
      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        handleRetry();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleMenu();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, showAch, soundOpen]);

  useEffect(() => {
    if (phase === "gameover") {
      sfx.gameover();
    }
  }, [phase]);

  if (phase !== "gameover") return null;

  const canOpen = wordHunt.pendingBox || (wordHunt.collected.every(Boolean) && !wordHunt.claimed);

  return (
    <>
      <div className="pointer-events-auto absolute inset-0 z-30 flex select-none flex-col items-center justify-center overflow-hidden bg-transparent p-4">
        {/* Bingkai UI Game Over terpusat */}
        <div className="relative flex w-full max-w-[340px] flex-col items-center">
          {/* 1. Pita GAME OVER Merah Pixel */}
          <GameOverRibbon />

          {/* 2. Bagian Skor Terapung (Formula hitung skor dari ZIP) */}
          <div className="mt-6 flex w-full justify-center">
            <ScorePanel
              key={replayKey}
              runId={replayKey}
              score={score}
              best={best}
              bread={bread}
              isNewBest={isNewBest}
            />
          </div>

          {/* Banner Word Hunt jika selesai & siap dibuka */}
          {canOpen && (
            <button
              type="button"
              onClick={() => {
                sfx.click();
                setShowMysteryBox(true);
              }}
              className="anim-slide mt-4 flex w-full max-w-[264px] animate-pulse items-center justify-between rounded-xl bg-gradient-to-r from-[#ffd21f] to-[#ff9f1c] px-3.5 py-2 text-[#1a1f2c] shadow-[0_3px_0_#d5a92e] transition-transform active:translate-y-[2px]"
            >
              <span className="font-display text-[9px] font-bold tracking-wide">WORD HUNT SELESAI!</span>
              <span className="font-display text-[9px] font-bold">BUKA BOX 🎁</span>
            </button>
          )}

          {/* 
            3. Baris 3 Tombol Pixel Biru:
               [ Restart / Play ]  [ Rumah / Menu ]  [ Podium / Leaderboard ]
               Panjang total 3 tombol (max-w-[264px]) LEBIH PENDEK dari pita GAME OVER (max-w-[340px]).
          */}
          <div className="anim-slide mt-7 flex w-full max-w-[264px] items-center justify-between gap-2.5 [animation-delay:0.3s]">
            {/* Tombol Restart / Main lagi */}
            <PixelButton label="Main lagi" onClick={handleRetry}>
              <svg
                width="28"
                height="30"
                viewBox="0 0 10 11"
                shapeRendering="crispEdges"
                aria-hidden="true"
              >
                <g fill="#ffffff">
                  <rect x="0" y="0" width="2" height="11" />
                  <rect x="2" y="1" width="2" height="9" />
                  <rect x="4" y="2.5" width="2" height="6" />
                  <rect x="6" y="4" width="2" height="3" />
                  <rect x="8" y="5" width="1.4" height="1" />
                </g>
              </svg>
            </PixelButton>

            {/* Tombol Rumah / Menu (di tengah) */}
            <PixelButton label="Menu utama" onClick={handleMenu}>
              <PixelHomeIcon />
            </PixelButton>

            {/* Tombol Podium / Leaderboard */}
            <PixelButton label="Papan peringkat" onClick={handleAchievements}>
              <PodiumIcon />
            </PixelButton>
          </div>

          {/* 
            4. TOMBOL PENGALIHAN SUARA: AFTER (UPDATE DARI ZIP) ⇄ BEFORE (KLASIK)
               Memenuhi permintaan eksplisit user untuk beralih antara suara sebelum dan sesudah update!
          */}
          <div className="mt-4 flex w-full max-w-[264px] items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                sfx.click();
                toggleSoundProfile();
              }}
              title="Klik untuk beralih profil suara BEFORE / AFTER"
              className={`pixel-corners-sm flex flex-1 items-center justify-center py-2 px-2 transition-transform duration-75 active:translate-y-[2px] ${
                soundProfile === "after"
                  ? "bg-[#39c1ea] text-white shadow-[0_2px_0_#0f7fa8]"
                  : "bg-[#2a3447] text-white/90 shadow-[0_2px_0_#18202d]"
              }`}
            >
              <span className="pixel-outline-sm font-display text-[8px] tracking-wide">
                {soundProfile === "after" ? "🔊 SUARA: AFTER (ZIP)" : "🔊 SUARA: BEFORE"}
              </span>
            </button>

            {/* Tombol Buka Panel 30 Sound FX dari ZIP */}
            <button
              type="button"
              onClick={() => {
                sfx.click();
                setSoundOpen((o) => !o);
              }}
              title="Buka panel daftar 30 Sound FX"
              className="pixel-corners-sm flex items-center justify-center bg-[#10263f]/60 hover:bg-[#10263f]/90 py-2 px-2.5 transition-transform duration-75 active:translate-y-[2px]"
            >
              <span className="pixel-outline-sm font-display text-[8px] text-white">
                {soundOpen ? "✕ TUTUP" : "🎵 30 SOUNDS"}
              </span>
            </button>
          </div>

          {/* Modal Sound Panel jika dibuka */}
          {soundOpen && (
            <div className="mt-3 flex w-full justify-center">
              <SoundPanelModal
                selected={selectedSound}
                onSelect={setSelectedSound}
                onClose={() => setSoundOpen(false)}
              />
            </div>
          )}

          {/* Hint keyboard halus di bawah */}
          {!soundOpen && (
            <div className="mt-4 font-display text-[8.5px] tracking-wider text-white/70 pixel-outline-sm">
              [SPASI: MAIN LAGI · ESC: MENU]
            </div>
          )}
        </div>
      </div>

      {/* Modal Prestasi jika diklik dari tombol podium */}
      {showAch && <AchievementsPanel onClose={() => setShowAch(false)} />}
    </>
  );
}
