import { useState } from "react";
import { useUI } from "../game/store";
import { BreadIcon } from "./BreadIcon";
import { engine, NOS_MAX } from "../game/engine";
import { unlockAudio, sfx } from "../game/audio";

function SpeakerIcon({ muted }: { muted: boolean }) {
  if (muted) {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}

export function HUD() {
  const phase = useUI((s) => s.phase);
  const score = useUI((s) => s.score);
  const bread = useUI((s) => s.bread);
  const dist = useUI((s) => s.dist);
  const popups = useUI((s) => s.popups);
  const muted = useUI((s) => s.muted);
  const toggleMute = useUI((s) => s.toggleMute);
  const nos = useUI((s) => s.nos);
  const nosActive = useUI((s) => s.nosActive);
  const trackMode = useUI((s) => s.trackMode);
  const shibuyaTime = useUI((s) => s.shibuyaTime);
  const wordHunt = useUI((s) => s.wordHunt);
  const setShowMysteryBox = useUI((s) => s.setShowMysteryBox);
  const camAdjusting = useUI((s) => s.camAdjusting);
  const camHeight = useUI((s) => s.camHeight);
  const camAngle = useUI((s) => s.camAngle);
  const camDist = useUI((s) => s.camDist);
  const setCamHeight = useUI((s) => s.setCamHeight);
  const setCamAngle = useUI((s) => s.setCamAngle);
  const setCamDist = useUI((s) => s.setCamDist);
  const setCamAdjusting = useUI((s) => s.setCamAdjusting);
  const resetCamView = useUI((s) => s.resetCamView);
  const pigeonSize = useUI((s) => s.pigeonSize);
  const pigeonPosY = useUI((s) => s.pigeonPosY);
  const pigeonPosX = useUI((s) => s.pigeonPosX);
  const pigeonAdjusting = useUI((s) => s.pigeonAdjusting);
  const setPigeonSize = useUI((s) => s.setPigeonSize);
  const setPigeonPosY = useUI((s) => s.setPigeonPosY);
  const setPigeonPosX = useUI((s) => s.setPigeonPosX);
  const setPigeonAdjusting = useUI((s) => s.setPigeonAdjusting);
  const resetPigeonAdjust = useUI((s) => s.resetPigeonAdjust);
  const buddyScale = useUI((s) => s.buddyScale);
  const setBuddyScale = useUI((s) => s.setBuddyScale);
  const deckOverride = useUI((s) => s.deckOverride);
  const setDeckAdjustOpen = useUI((s) => s.setDeckAdjustOpen);
  const setAdjustTargetDeck = useUI((s) => s.setAdjustTargetDeck);
  const trailEffect = useUI((s) => s.trailEffect);
  const setTrailEffect = useUI((s) => s.setTrailEffect);
  const cycleTrailEffect = useUI((s) => s.cycleTrailEffect);
  const trailWidth = useUI((s) => s.trailWidth);
  const setTrailWidth = useUI((s) => s.setTrailWidth);
  const trailLength = useUI((s) => s.trailLength);
  const setTrailLength = useUI((s) => s.setTrailLength);
  const trailWave = useUI((s) => s.trailWave);
  const setTrailWave = useUI((s) => s.setTrailWave);
  const resetTrailAdjustments = useUI((s) => s.resetTrailAdjustments);
  const [trailAdjusting, setTrailAdjusting] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const trailEffectEmoji =
    trailEffect === "rainbow"
      ? "🌈"
      : trailEffect === "water"
        ? "💧"
        : trailEffect === "smoke"
          ? "💨"
          : trailEffect === "fire"
            ? "🔥"
            : trailEffect === "lightning"
              ? "⚡"
              : trailEffect === "fireworks"
                ? "🎆"
                : trailEffect === "sakura"
                  ? "🌸"
                  : "✨";
  const inRun = phase === "playing" || phase === "crashed";
  const nosReady = nos >= NOS_MAX * 0.99 && !nosActive;
  const sprint = useUI((s) => s.sprint);
  const sprintLevel = useUI((s) => s.sprintLevel);
  const sprinting = sprint > 0.02 || sprintLevel > 0;

  return (
    <div
      className={`pointer-events-none absolute inset-0 select-none ${camAdjusting || pigeonAdjusting || trailAdjusting ? "z-50" : "z-20"}`}
      style={{ inset: "env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)" }}
    >
      {/* bread counter (top-left) in vibrant royal blue pill */}
      {inRun && (
        <div className="pointer-events-auto absolute left-[3.5%] top-[3%] flex items-center gap-2">
          <div
            className="flex h-[9.5cqw] min-h-[38px] items-center gap-2 rounded-full border-2 border-white/20 bg-[#0b66e4] px-3.5 shadow-[0_3px_0_#0748a3]"
          >
            <BreadIcon size={24} />
            <span className="font-display text-[4.8cqw] leading-none text-white txt-outline-sm">{bread}</span>
          </div>
        </div>
      )}

      {/* score + distance minimalis + Daily Word Hunt "SKATE" berhadiah (top-center, pandangan jalur balap lapang & bersih) */}
      {inRun && (
        <div className="absolute left-0 right-0 top-[2%] flex flex-col items-center gap-1 z-30">
          <div className="font-display txt-outline text-[12.5cqw] leading-none text-white drop-shadow-md">{score}</div>

          {/* Indikator Jarak Minimalis & Elegan (bebas dari balok tebal yang memblokir pandangan) */}
          <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/45 px-3 py-0.5 backdrop-blur-[3px] shadow-sm">
            <span className="font-display text-[3.2cqw] font-bold text-white tracking-wide">{dist} M</span>
            <span className="h-2 w-[1px] bg-white/25" />
            <span className="font-display text-[2.3cqw] tracking-wider text-white/75">
              {trackMode === "shibuya" ? `SHIBUYA ${shibuyaTime.toUpperCase()}` : trackMode === "haruna" ? "MT. HARUNA" : "TOKYO"}
            </span>
          </div>

          {/* Daily Word Hunt letter bar (SKATE berhadiah) — ramping, kompak & rapi */}
          <button
            type="button"
            onClick={() => {
              unlockAudio();
              setShowMysteryBox(true);
            }}
            className="pointer-events-auto mt-0.5 flex items-center gap-1 rounded-full border border-white/20 bg-black/40 px-2 py-0.5 backdrop-blur-[3px] shadow transition-transform active:scale-95"
            aria-label="Daily Word Hunt progress"
          >
            {wordHunt.word.split("").map((ch, idx) => {
              const isDone = wordHunt.collected[idx];
              return (
                <div
                  key={idx}
                  className={`flex h-[5cqw] w-[5cqw] min-h-[20px] min-w-[20px] items-center justify-center rounded-md border text-[2.7cqw] font-display leading-none transition-all ${
                    isDone
                      ? "border-[#ffd21f] bg-gradient-to-b from-[#ffd60a] to-[#ff9f1c] text-[#1c1400] shadow-[0_0_6px_rgba(255,214,10,0.8)] scale-105 font-bold"
                      : "border-white/15 bg-white/10 text-white/45"
                  }`}
                >
                  {ch}
                </div>
              );
            })}
            <span
              className={`ml-0.5 flex items-center text-[3.6cqw] leading-none ${
                wordHunt.pendingBox || (wordHunt.collected.every(Boolean) && !wordHunt.claimed)
                  ? "animate-bounce filter drop-shadow-[0_0_6px_#ffd21f]"
                  : "opacity-75"
              }`}
            >
              🎁
            </span>
          </button>
        </div>
      )}

      {/* top-right controls: Tombol MUTE [🔊] dan PENGATURAN [⚙️] bersebelahan rapi & bersih */}
      {inRun && (
        <div className="pointer-events-auto absolute right-[3.5%] top-[3%] flex items-center gap-2 z-40">
          <button
            type="button"
            onClick={toggleMute}
            className="flex h-[9.5cqw] w-[9.5cqw] min-h-[38px] min-w-[38px] items-center justify-center rounded-full border-2 border-white/20 bg-[#ff9500] text-white shadow-[0_3px_0_#c96f00] active:translate-y-[2px] active:shadow-none"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            <SpeakerIcon muted={muted} />
          </button>

          {phase === "playing" && !camAdjusting && !pigeonAdjusting && !trailAdjusting && (
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => {
                unlockAudio();
                sfx.click();
                setSettingsOpen((prev) => !prev);
              }}
              className={`flex h-[9.5cqw] w-[9.5cqw] min-h-[38px] min-w-[38px] items-center justify-center rounded-full border-2 text-white shadow-[0_3px_0_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-none transition-all ${
                settingsOpen
                  ? "border-[#ffd60a] bg-[#ffd60a] text-[#1f2430] rotate-45 shadow-[0_0_12px_rgba(255,214,10,0.6)]"
                  : "border-white/20 bg-[#3a86ff] hover:bg-[#2563eb]"
              }`}
              aria-label="Pengaturan & Penyetelan Alat"
              title="Pengaturan & Penyetelan Alat"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Pop-up Menu Pengaturan Ringkas (dibuka saat tombol ⚙️ ditekan) */}
      {inRun && settingsOpen && phase === "playing" && !camAdjusting && !pigeonAdjusting && !trailAdjusting && (
        <>
          <div
            className="pointer-events-auto absolute inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setSettingsOpen(false)}
          />
          <div
            className="pointer-events-auto absolute right-[3.5%] top-[11%] z-50 flex w-[260px] max-w-[85vw] flex-col gap-2 rounded-2xl border border-white/20 bg-[#161a2b]/95 p-3 shadow-2xl backdrop-blur-md"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-display text-[3.2cqw] text-white flex items-center gap-1.5 font-bold">
                <span>⚙️</span>
                <span>PENGATURAN ALAT</span>
              </span>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 active:scale-95"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => {
                  unlockAudio();
                  sfx.click();
                  setSettingsOpen(false);
                  setCamAdjusting(true);
                }}
                className="flex items-center gap-2.5 rounded-xl bg-white/10 hover:bg-white/15 px-3 py-2 text-left font-display text-[2.9cqw] text-white transition-colors"
              >
                <span className="text-[3.8cqw]">📷</span>
                <div className="flex flex-col">
                  <span className="font-bold">Sudut Kamera</span>
                  <span className="text-[2.1cqw] text-white/60">Tinggi, sudut & jarak zoom</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  unlockAudio();
                  sfx.click();
                  setSettingsOpen(false);
                  setPigeonAdjusting(true);
                }}
                className="flex items-center gap-2.5 rounded-xl bg-white/10 hover:bg-white/15 px-3 py-2 text-left font-display text-[2.9cqw] text-white transition-colors"
              >
                <span className="text-[3.8cqw]">🐦</span>
                <div className="flex flex-col">
                  <span className="font-bold">Ukuran Karakter</span>
                  <span className="text-[2.1cqw] text-white/60">Skala & posisi tubuh pigeon</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  unlockAudio();
                  sfx.click();
                  setSettingsOpen(false);
                  setAdjustTargetDeck(deckOverride);
                  setDeckAdjustOpen(true);
                }}
                className="flex items-center gap-2.5 rounded-xl bg-white/10 hover:bg-white/15 px-3 py-2 text-left font-display text-[2.9cqw] text-white transition-colors"
              >
                <span className="text-[3.8cqw]">🛹</span>
                <div className="flex flex-col">
                  <span className="font-bold">Ukuran Skateboard</span>
                  <span className="text-[2.1cqw] text-white/60">Panjang, lebar & tebal deck</span>
                </div>
              </button>

              <div className="flex items-center gap-1.5 pt-1 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    unlockAudio();
                    sfx.click();
                    cycleTrailEffect();
                  }}
                  className="flex-1 flex items-center justify-between rounded-xl bg-white/10 hover:bg-white/15 px-2.5 py-1.5 text-left font-display text-[2.7cqw] text-white transition-colors"
                  title="Ganti jenis trail"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{trailEffectEmoji}</span>
                    <span>Trail</span>
                  </div>
                  <span className="text-white/40 text-xs">➔</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    unlockAudio();
                    sfx.click();
                    setSettingsOpen(false);
                    setTrailAdjusting(true);
                  }}
                  className="flex items-center justify-center rounded-xl bg-[#9b5aff] hover:bg-[#8644ea] px-3 py-1.5 font-display text-[2.7cqw] text-white shadow active:scale-95"
                  title="Buka panel slider lebar & panjang trail"
                >
                  <span>📐 Slider</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* trick / info popups (ditempatkan di bawah tulisan SKATE berhadiah agar tidak pernah menutupi) */}
      <div className="pointer-events-none absolute left-0 right-0 top-[23%] flex flex-col items-center gap-1 z-10">
        {popups.slice(-1).map((p) => {
          const len = p.text.length;
          const fontClass = len > 20 ? "text-[3.3cqw]" : len > 15 ? "text-[3.8cqw]" : len > 11 ? "text-[4.3cqw]" : "text-[4.8cqw]";
          return (
            <div key={p.id} className="popup flex max-w-[96%] flex-col items-center text-center">
              <div
                className={`font-display txt-outline whitespace-nowrap ${fontClass} leading-tight tracking-wide drop-shadow-md`}
                style={{ color: p.color === "#ff5c8a" ? "#ff2e93" : p.color }}
              >
                {p.text}
              </div>
              {p.sub && (
                <div className="mt-1 max-w-[96%] whitespace-nowrap rounded-full bg-black/45 px-3 py-0.5 font-display text-[2.5cqw] leading-tight text-white/95 backdrop-blur-[2px]">
                  {p.sub}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* NOS meter + boost button (bottom-right) — SATU-SATUNYA TOMBOL DI BAWAH SEPERTI PERMINTAAN
          (disembunyikan sementara saat panel atur kamera atau atur pigeon terbuka) */}
      {phase === "playing" && !camAdjusting && !pigeonAdjusting && !trailAdjusting && (
        <div className="pointer-events-auto absolute bottom-[4.5%] right-[4%] flex flex-col items-center gap-2">
          {/* NOS vertical capsule */}
          <div className="relative h-[25cqw] w-[6.8cqw] overflow-hidden rounded-full border-[3.5px] border-[#0091ff] bg-[#001838]/90 p-[2px] shadow-[0_0_14px_rgba(0,145,255,0.65)]">
            <div
              className={`absolute bottom-0 left-[2px] right-[2px] rounded-full transition-[height] duration-150 ${
                nosActive ? "nos-burn" : nosReady ? "nos-ready" : "bg-gradient-to-t from-[#00d2ff] to-[#38ef7d]"
              }`}
              style={{ height: `${nosActive ? 100 : nos}%` }}
            />
          </div>
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              unlockAudio();
              engine.input("boost");
            }}
            className={`flex h-[15cqw] w-[15cqw] flex-col items-center justify-center rounded-full font-display leading-none border-[3px] shadow-[0_4px_0_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-none transition-all duration-150 ${
              nosReady
                ? "border-[#ffd60a] bg-gradient-to-b from-[#ffd60a] to-[#ff9f1c] text-[#1f2430] animate-pulse"
                : nosActive
                  ? "border-white bg-[#00e5ff] text-white"
                  : sprintLevel >= 3
                    ? "border-[#ffd60a] bg-[#ff9f1c] text-white"
                    : sprintLevel === 2
                      ? "border-[#64b5f6] bg-[#0b66e4] text-white"
                      : sprintLevel === 1
                        ? "border-[#4dd0e1] bg-[#00b4d8] text-white"
                        : "border-[#0091ff] bg-[#0066cc] text-white"
            }`}
            style={{
              boxShadow: nosReady || nosActive
                ? "0 0 16px rgba(0, 229, 255, 0.8), 0 4px 0 rgba(0,0,0,0.25)"
                : sprinting
                  ? `0 0 ${Math.round(8 + sprint * 18)}px ${
                      sprintLevel >= 3 ? "rgba(255,159,28,0.7)" : sprintLevel === 2 ? "rgba(58,134,255,0.7)" : "rgba(46,196,182,0.7)"
                    }, 0 4px 0 rgba(0,0,0,0.25)`
                  : undefined,
            }}
            aria-label={nosReady || nosActive ? "Aktifkan NOS" : "Sprint kick"}
          >
            {nosReady || nosActive ? (
              <span className="text-[4.2cqw]">NOS</span>
            ) : sprintLevel > 0 ? (
              <>
                <span className="text-[3.8cqw] font-black tracking-tight drop-shadow-md">
                  {sprintLevel === 1 ? "+40" : sprintLevel === 2 ? "+50" : sprintLevel === 3 ? "+70" : `+${Math.min(110, 70 + (sprintLevel - 3) * 15)}`}
                </span>
                <span className="mt-[0.4cqw] text-[1.9cqw] font-extrabold uppercase tracking-wider text-white/90">SPRINT</span>
              </>
            ) : (
              <>
                <span className="text-[3.2cqw]">SPRINT</span>
                <span className="mt-[0.6cqw] hidden font-body text-[1.9cqw] font-extrabold tracking-wider opacity-80 [@media(hover:hover)]:block">SHIFT</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ── Panel ATUR KAMERA: game dijeda, bar tipis transparan di tepi bawah
             supaya pemandangan game tidak tertutup; kamera bergerak LIVE mengikuti slider ── */}
      {camAdjusting && (
        <>
          <div className="pointer-events-none absolute left-0 right-0 top-[15%] z-30 flex justify-center">
            <div className="rounded-full border border-white/25 bg-black/55 px-4 py-1.5 font-display text-[3.1cqw] tracking-wider text-[#ffd23f] backdrop-blur-[2px]">
              ⏸ DIJEDA · ATUR KAMERA
            </div>
          </div>
          <div
            className="pointer-events-auto absolute inset-x-[3%] bottom-[2%] z-40 flex flex-col gap-1.5 rounded-2xl border border-white/20 bg-black/55 p-2.5 backdrop-blur-md"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="w-[14cqw] shrink-0 font-display text-[2.9cqw] leading-none text-white/95">⬆️ TINGGI</span>
              <input
                type="range"
                min={-3}
                max={7}
                step={0.1}
                value={camHeight}
                onChange={(e) => setCamHeight(parseFloat(e.target.value))}
                className="h-2.5 flex-1 cursor-pointer accent-[#ffd60a]"
                aria-label="Ketinggian kamera"
              />
              <span className="w-[8.5cqw] shrink-0 text-right font-display text-[2.9cqw] leading-none text-[#ffd60a]">
                {camHeight > 0 ? `+${camHeight.toFixed(1)}` : camHeight.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-[14cqw] shrink-0 font-display text-[2.9cqw] leading-none text-white/95">📐 SUDUT</span>
              <input
                type="range"
                min={-3}
                max={5}
                step={0.1}
                value={camAngle}
                onChange={(e) => setCamAngle(parseFloat(e.target.value))}
                className="h-2.5 flex-1 cursor-pointer accent-[#2ec4b6]"
                aria-label="Sudut pandang kamera"
              />
              <span className="w-[8.5cqw] shrink-0 text-right font-display text-[2.9cqw] leading-none text-[#2ec4b6]">
                {camAngle > 0 ? `+${camAngle.toFixed(1)}` : camAngle.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-[14cqw] shrink-0 font-display text-[2.9cqw] leading-none text-white/95">🔍 JARAK</span>
              <input
                type="range"
                min={-3}
                max={6}
                step={0.1}
                value={camDist}
                onChange={(e) => setCamDist(parseFloat(e.target.value))}
                className="h-2.5 flex-1 cursor-pointer accent-[#ff9500]"
                aria-label="Jarak kamera (zoom dekat-jauh)"
              />
              <span className="w-[8.5cqw] shrink-0 text-right font-display text-[2.9cqw] leading-none text-[#ff9500]">
                {camDist > 0 ? `+${camDist.toFixed(1)}` : camDist.toFixed(1)}
              </span>
            </div>
            <div className="mt-0.5 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  sfx.click();
                  resetCamView();
                }}
                className="flex-1 rounded-xl bg-white/15 py-1.5 font-display text-[3cqw] leading-none text-white active:scale-95"
              >
                RESET
              </button>
              <button
                type="button"
                onClick={() => {
                  sfx.click();
                  setCamAdjusting(false);
                }}
                className="flex-[2] rounded-xl bg-[#2ec46b] py-1.5 font-display text-[3cqw] leading-none text-white shadow-[0_3px_0_#1c7a3e] active:translate-y-[2px] active:shadow-none"
              >
                ✓ SELESAI · LANJUT MAIN
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Panel Penyetelan Ukuran & Posisi Tubuh Pigeon (Live real-time preview) ── */}
      {pigeonAdjusting && (
        <>
          <div
            className="pointer-events-auto absolute inset-0 z-30 bg-black/45 backdrop-blur-[2px]"
            onClick={() => setPigeonAdjusting(false)}
          >
            <div className="absolute top-[8%] left-1/2 -translate-x-1/2 rounded-full border border-white/25 bg-black/70 px-4 py-1.5 font-display text-[3.2cqw] text-white shadow-xl whitespace-nowrap">
              🐦 ATUR UKURAN & POSISI PIGEON
            </div>
          </div>
          <div
            className="pointer-events-auto absolute inset-x-[3%] bottom-[2%] z-40 flex flex-col gap-2 rounded-2xl border border-white/25 bg-black/75 p-3 backdrop-blur-md shadow-2xl"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Slider 1: Ukuran Pigeon */}
            <div className="flex items-center gap-2">
              <span className="w-[17cqw] shrink-0 font-display text-[2.7cqw] leading-none text-white/95">📏 UKURAN</span>
              <input
                type="range"
                min={0.5}
                max={2.0}
                step={0.05}
                value={pigeonSize}
                onChange={(e) => setPigeonSize(parseFloat(e.target.value))}
                className="h-2.5 flex-1 cursor-pointer accent-[#ffd60a]"
                aria-label="Ukuran pigeon"
              />
              <span className="w-[8.5cqw] shrink-0 text-right font-display text-[2.9cqw] leading-none text-[#ffd60a]">
                {pigeonSize.toFixed(2)}x
              </span>
            </div>

            {/* Slider 2: Naik / Turun (Y) */}
            <div className="flex items-center gap-2">
              <span className="w-[17cqw] shrink-0 font-display text-[2.7cqw] leading-none text-white/95">↕️ TINGGI Y</span>
              <input
                type="range"
                min={-0.3}
                max={0.5}
                step={0.02}
                value={pigeonPosY}
                onChange={(e) => setPigeonPosY(parseFloat(e.target.value))}
                className="h-2.5 flex-1 cursor-pointer accent-[#2ec4b6]"
                aria-label="Tinggi naik-turun tubuh pigeon"
              />
              <span className="w-[8.5cqw] shrink-0 text-right font-display text-[2.9cqw] leading-none text-[#2ec4b6]">
                {pigeonPosY > 0 ? `+${pigeonPosY.toFixed(2)}` : pigeonPosY.toFixed(2)}
              </span>
            </div>

            {/* Slider 3: Maju / Mundur (X) */}
            <div className="flex items-center gap-2">
              <span className="w-[17cqw] shrink-0 font-display text-[2.7cqw] leading-none text-white/95">↔️ MAJU X</span>
              <input
                type="range"
                min={-0.3}
                max={0.3}
                step={0.02}
                value={pigeonPosX}
                onChange={(e) => setPigeonPosX(parseFloat(e.target.value))}
                className="h-2.5 flex-1 cursor-pointer accent-[#ff9500]"
                aria-label="Posisi maju-mundur tubuh pigeon"
              />
              <span className="w-[8.5cqw] shrink-0 text-right font-display text-[2.9cqw] leading-none text-[#ff9500]">
                {pigeonPosX > 0 ? `+${pigeonPosX.toFixed(2)}` : pigeonPosX.toFixed(2)}
              </span>
            </div>

            {/* Slider 4: Skala Voxel Buddies (semua 33 karakter serentak) */}
            <div className="flex items-center gap-2">
              <span className="w-[17cqw] shrink-0 font-display text-[2.7cqw] leading-none text-white/95">🦊 BUDDIES</span>
              <input
                type="range"
                min={0.4}
                max={2.2}
                step={0.02}
                value={buddyScale}
                onChange={(e) => setBuddyScale(parseFloat(e.target.value))}
                className="h-2.5 flex-1 cursor-pointer accent-[#ff9f1c]"
                aria-label="Skala ukuran semua Voxel Buddies"
              />
              <span className="w-[8.5cqw] shrink-0 text-right font-display text-[2.9cqw] leading-none text-[#ff9f1c]">
                {buddyScale.toFixed(2)}x
              </span>
            </div>

            {/* Keterangan: Kaki tetap stabil */}
            <div className="flex items-center justify-between px-1 font-body text-[2.3cqw] font-bold text-white/70">
              <span>* Berlaku serentak untuk semua 33 Voxel Buddies</span>
            </div>

            {/* Tombol Reset & Selesai */}
            <div className="mt-0.5 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  sfx.click();
                  resetPigeonAdjust();
                }}
                className="flex-1 rounded-xl bg-white/15 py-1.5 font-display text-[3cqw] leading-none text-white active:scale-95"
              >
                RESET
              </button>
              <button
                type="button"
                onClick={() => {
                  sfx.click();
                  setPigeonAdjusting(false);
                }}
                className="flex-[2] rounded-xl bg-[#2ec46b] py-1.5 font-display text-[3cqw] leading-none text-white shadow-[0_3px_0_#1c7a3e] active:translate-y-[2px] active:shadow-none"
              >
                ✓ SELESAI
              </button>
            </div>
          </div>
        </>
      )}

      {/* Panel Atur Lebar & Panjang Efek Trail live in-game */}
      {phase === "playing" && trailAdjusting && (
        <>
          <div
            className="pointer-events-auto absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setTrailAdjusting(false)}
          />
          <div
            className="pointer-events-auto absolute bottom-3 left-1/2 flex w-[94%] max-w-[460px] -translate-x-1/2 flex-col gap-2 rounded-3xl border-2 border-[#9b5aff]/60 bg-[#16132b]/95 p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md"
            style={{ touchAction: "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <div className="flex items-center gap-1.5 font-display text-[3.4cqw] leading-none text-white">
                <span className="text-[#3fa9f5]">✨</span>
                <span>ATUR EFEK TRAIL MOTION</span>
              </div>
              <button
                type="button"
                onClick={() => setTrailAdjusting(false)}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-[2.8cqw] text-white hover:bg-white/25 active:scale-95"
              >
                ✕
              </button>
            </div>

            {/* Quick Effect Switcher */}
            <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
              {[
                { id: null, emoji: "🚫", name: "Off" },
                { id: "rainbow", emoji: "🌈", name: "Pelangi" },
                { id: "water", emoji: "💧", name: "Air" },
                { id: "smoke", emoji: "💨", name: "Asap" },
                { id: "fire", emoji: "🔥", name: "Api" },
                { id: "lightning", emoji: "⚡", name: "Petir" },
                { id: "fireworks", emoji: "🎆", name: "Kembang Api" },
                { id: "sakura", emoji: "🌸", name: "Sakura" },
              ].map((eff) => (
                <button
                  key={eff.id ?? "none"}
                  type="button"
                  onClick={() => {
                    sfx.click();
                    setTrailEffect(eff.id);
                  }}
                  className={`flex shrink-0 items-center gap-1 rounded-xl px-2.5 py-1 text-[2.6cqw] font-display transition-all ${
                    trailEffect === eff.id
                      ? "bg-gradient-to-r from-[#9b5aff] to-[#3fa9f5] text-white shadow-md scale-105"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  <span>{eff.emoji}</span>
                  <span>{eff.name}</span>
                </button>
              ))}
            </div>

            {/* Slider 1: Lebar Efek (Width) */}
            <div className="flex items-center gap-2">
              <span className="w-[17cqw] shrink-0 font-display text-[2.7cqw] leading-none text-white/95">↔️ LEBAR</span>
              <input
                type="range"
                min={0.4}
                max={2.5}
                step={0.05}
                value={trailWidth}
                onChange={(e) => setTrailWidth(parseFloat(e.target.value))}
                className="h-2.5 flex-1 cursor-pointer accent-[#3fa9f5]"
                aria-label="Lebar efek trail"
              />
              <span className="w-[8.5cqw] shrink-0 text-right font-display text-[2.9cqw] leading-none text-[#3fa9f5]">
                {trailWidth.toFixed(2)}x
              </span>
            </div>

            {/* Slider 2: Panjang Jangkauan (Length) */}
            <div className="flex items-center gap-2">
              <span className="w-[17cqw] shrink-0 font-display text-[2.7cqw] leading-none text-white/95">↕️ PANJANG</span>
              <input
                type="range"
                min={0.4}
                max={2.5}
                step={0.05}
                value={trailLength}
                onChange={(e) => setTrailLength(parseFloat(e.target.value))}
                className="h-2.5 flex-1 cursor-pointer accent-[#9b5aff]"
                aria-label="Panjang jangkauan efek trail"
              />
              <span className="w-[8.5cqw] shrink-0 text-right font-display text-[2.9cqw] leading-none text-[#9b5aff]">
                {trailLength.toFixed(2)}x
              </span>
            </div>

            {/* Slider 3: Tingkat Gelombang & Segment Telat (Wave / Delayed Flow) */}
            <div className="flex items-center gap-2">
              <span className="w-[17cqw] shrink-0 font-display text-[2.7cqw] leading-none text-white/95" title="Tingkat gelombang liukan & keterlambatan segmen saat melompat">🌊 GELOMBANG</span>
              <input
                type="range"
                min={0.0}
                max={2.5}
                step={0.05}
                value={trailWave}
                onChange={(e) => setTrailWave(parseFloat(e.target.value))}
                className="h-2.5 flex-1 cursor-pointer accent-[#00f2fe]"
                aria-label="Tingkat gelombang dan segmen telat flow motion"
              />
              <span className="w-[8.5cqw] shrink-0 text-right font-display text-[2.9cqw] leading-none text-[#00f2fe]">
                {trailWave.toFixed(2)}x
              </span>
            </div>

            {/* Tombol Reset & Selesai */}
            <div className="mt-0.5 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  sfx.click();
                  resetTrailAdjustments();
                }}
                className="flex-1 rounded-xl bg-white/15 py-1.5 font-display text-[3cqw] leading-none text-white active:scale-95"
              >
                RESET 1.0x
              </button>
              <button
                type="button"
                onClick={() => {
                  sfx.click();
                  setTrailAdjusting(false);
                }}
                className="flex-[2] rounded-xl bg-[#2ec46b] py-1.5 font-display text-[3cqw] leading-none text-white shadow-[0_3px_0_#1c7a3e] active:translate-y-[2px] active:shadow-none"
              >
                ✓ SELESAI
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
