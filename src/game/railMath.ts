/**
 * Profil REL GRIND KHUSUS — dipakai bersama oleh fisika (engine.ts) dan geometri (models.ts)
 * supaya bentuk rel yang dilihat selalu sama persis dengan tinggi saat nge-grind.
 *
 *  variant 2 = "ULAR"    : rel besi meliku kiri-kanan (kek garis kuning di jalan) + hop kecil.
 *                          Pemain yang nge-grind akan TERBAWA ayunan snake-nya.
 *  variant 3 = "ROLLERCOASTER" : rel dengan tanjakan besar, puncak, turunan, dan bukit kecil
 *                          (kek rollercoaster). Tiang dipasang di KEDUA SISI rel sehingga pemain
 *                          bisa lewat DI BAWAH bagian yang tinggi.
 */

/** Tinggi permukaan atas rel datar (sama dengan RAIL_H di engine). */
export const RAIL_TOP = 0.6;
/** Ketebalan kotak rel. */
export const RAIL_THICK = 0.14;

export const WAVE_VARIANT = 2;
export const COASTER_VARIANT = 3;

const TAU = Math.PI * 2;

/** Amplitudo ayunan lateral rel ular (m). 1.15 aman dari hitbox mobil di lajur sebelah (jarak lajur 2.4,
 *  dan masih di dalam badan jalan ±3.75). */
export const WAVE_AMP = 1.15;
/** Panjang satu gelombang ayunan lateral (m). */
export const WAVE_LEN = 18;
/** Tinggi lompatan kecil rel ular di atas RAIL_TOP (m). */
export const WAVE_HOP = 0.3;

/** Fase awal sinus — deterministik dari posisi rel di jalan (sCenter) supaya fisika & geometri
 *  memakai gelombang yang sama persis. */
export function railPhase(sCenter: number): number {
  return (((Math.abs(sCenter) * 0.6180339887) % 1) * TAU);
}

/**
 * Tinggi permukaan atas rel (grind height) untuk variant 2/3.
 *  half  = setengah panjang rel (m)
 *  sRel  = posisi relatif terhadap pusat rel: s - sCenter, berkisar [-half, +half]
 *  phase = railPhase(sCenter)
 */
export function railGrindHeight(variant: number, half: number, sRel: number, phase: number): number {
  if (variant === WAVE_VARIANT) {
    // hop kecil naik-turun, tidak pernah di bawah RAIL_TOP (supaya tabrakan tetap konsisten)
    const hop = WAVE_HOP * 0.5 * (1 + Math.sin((sRel / WAVE_LEN) * TAU + phase));
    return RAIL_TOP + hop;
  }
  if (variant === COASTER_VARIANT) {
    const u = half > 0 ? Math.max(-1, Math.min(1, sRel / half)) : 0;
    // keyframes [u, tinggi tambahan dari RAIL_TOP]: masuk datar -> tanjakan -> Puncak ->
    // turunan -> bukit kecil -> keluar datar. Interpolasi smoothstep (tanpa hentakan).
    const keys: ReadonlyArray<readonly [number, number]> = [
      [-1.0, 0.0],
      [-0.75, 0.0],
      [-0.25, 1.5],
      [0.2, 0.0],
      [0.6, 0.8],
      [1.0, 0.0],
    ];
    for (let i = 0; i < keys.length - 1; i++) {
      const [u0, h0] = keys[i];
      const [u1, h1] = keys[i + 1];
      if (u >= u0 && u <= u1) {
        const t = (u - u0) / (u1 - u0);
        const sm = t * t * (3 - 2 * t);
        return RAIL_TOP + h0 + (h1 - h0) * sm;
      }
    }
    return RAIL_TOP;
  }
  return RAIL_TOP;
}

/** Offset lateral garis tengah rel terhadap pusat lajur (0 untuk rel lurus / rollercoaster). */
export function railLatOffset(variant: number, sRel: number, phase: number): number {
  if (variant !== WAVE_VARIANT) return 0;
  return WAVE_AMP * Math.sin((sRel / WAVE_LEN) * TAU + phase);
}

/** Kemiringan rel dh/ds (positif = menanjak) — untuk pitch papan saat nge-grind. */
export function railSlope(variant: number, half: number, sRel: number, phase: number): number {
  const d = 0.4;
  return (railGrindHeight(variant, half, sRel + d, phase) - railGrindHeight(variant, half, sRel - d, phase)) / (2 * d);
}

/** Heading (rad) garis tengah rel — yaw papan mengikuti belokan saat nge-grind rel ular. */
export function railHeading(variant: number, sRel: number, phase: number): number {
  if (variant !== WAVE_VARIANT) return 0;
  const d = 0.4;
  const dz = railLatOffset(variant, sRel + d, phase) - railLatOffset(variant, sRel - d, phase);
  return Math.atan2(dz, 2 * d);
}
