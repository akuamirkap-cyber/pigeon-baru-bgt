/**
 * Glow (halo) roti — SATU SUMBER KEBENARAN untuk bentuk & kecerahannya, supaya tidak "aneh":
 *
 * Masalah desain lama (terlihat di game):
 *   • halo = bulatan emas 1 m dengan INTI paling terang (alpha 1.0) tepat di tengah roti →
 *     warna roti (krem #f6dfae) tertimpa cahaya additive sampai putih, jadi roti terlihat
 *     pucat/blur, bukan roti yang bercahaya.
 *   • garis roti berjarak 1 m dan formasi roti langit berjarak 1.2 m → bulatan-bulatan itu
 *     saling tumpuk dan bagian yang bertumpuk jadi 2x lebih terang (bintik/garis terang).
 *   • skala halo berdenyut (pulse) → bulatan terlihat "bernafas" seperti blob.
 *   • saat pemain terbang membelah formasi, halo yang sangat dekat kamera memutihkan layar.
 *
 * Desain baru:
 *   • Inti halo TRANSPARAN (cincin lembut di pinggir siluet roti) → roti tetap tajam & berwarna,
 *     glow terbaca sebagai aura, bukan noda.
 *   • Kontribusi additive puncak sengaja kecil (BREAD_HALO_PEAK) sehingga dua roti yang
 *     tumpuk masih enak dilihat (<= ~0.65) dan tidak melewati ambang bloom 1.0 di mode malam.
 *   • Kecerahan per butir roti: memudar saat sangat dekat kamera (tidak memutihkan layar saat
 *     terbang melewatinya) dan memudar di kejauhan (formasi jauh tidak jadi kabut emas).
 *   • Denyutnya halus di KECERAHAN (bukan skala), supaya bentuknya tetap rapi.
 */

/** Ukuran bidang halo (m). Roti sendiri ~0.56 m lebar × 0.68 m tinggi (skala 0.9). */
export const BREAD_HALO_SIZE = 1.05;
/** Titik tengah visual roti (geometri roti bertitik asal di alas 0.03..0.75). */
export const BREAD_HALO_Y = 0.37;
/** Opacity material halo. Kontribusi additive puncak = 0.34 (cincin) x 0.85 = ~0.29,
 *  jauh di bawah ambang bloom 1.0 → halo sendiri tidak pernah jadi blob besar di malam hari;
 *  kilau malam tetap datang dari bagian roti yang memang `glow: true` (mentega & garis crumb). */
export const BREAD_HALO_PEAK = 0.85;

/** Bentuk halo (emas hangat). Inti alpha 0 → roti tidak tertimpa; cincin paling kuat di
 *  r 0.56, yaitu tepat di pinggir siluet roti (roti selebar 0.56 m di bidang 1.05 m). */
export const BREAD_HALO_STOPS: [number, string][] = [
  [0.0, "rgba(255,206,120,0)"],
  [0.34, "rgba(255,214,132,0.10)"],
  [0.56, "rgba(255,224,152,0.34)"],
  [0.74, "rgba(255,196,96,0.15)"],
  [1.0, "rgba(255,170,40,0)"],
];

/**
 * Kecerahan satu halo roti (0..1) — dipakai sebagai instanceColor pada instanced mesh.
 * `dist` = jarak halo ke kamera (m), `t` = waktu (s), `phase` = fase per butir roti.
 */
export function breadHaloBrightness(dist: number, t: number, phase: number): number {
  const near = Math.min(1, Math.max(0, (dist - 1.6) / 1.6)); // 0 di <=1.6 m, 1 di >=3.2 m
  const far = Math.min(1, Math.max(0, (48 - dist) / 14)); // 0 di >=48 m, 1 di <=34 m
  const pulse = 0.92 + 0.08 * Math.sin(t * 2.2 + phase); // denyut halus di kecerahan
  return near * far * pulse;
}

/** Kontribusi additive satu halo pada radius relatif `r` (0..1) setelah kecerahan & opacity. */
export function breadHaloContribution(r: number, opacity: number, brightness: number): number {
  const stop = (x: number) => {
    const stops = BREAD_HALO_STOPS;
    if (x <= stops[0][0]) return alphaOf(stops[0][1]);
    for (let i = 1; i < stops.length; i++) {
      if (x <= stops[i][0]) {
        const [x0, c0] = stops[i - 1];
        const [x1, c1] = stops[i];
        const u = (x - x0) / (x1 - x0);
        return alphaOf(c0) + (alphaOf(c1) - alphaOf(c0)) * u;
      }
    }
    return alphaOf(stops[stops.length - 1][1]);
  };
  return stop(r) * opacity * brightness;
}

function alphaOf(rgba: string): number {
  const m = rgba.match(/rgba\(([^)]+)\)/);
  if (!m) return 0;
  const parts = m[1].split(",").map((v) => parseFloat(v.trim()));
  return parts[3] ?? 1;
}
