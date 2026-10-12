/**
 * Jalur penyeberang ambient Scramble Crossing (Shibuya) — SATU SUMBER KEBENARAN untuk
 * "orang menyeberang di mana", supaya perempatan tempat orang menyeberang di zebra cross
 * benar-benar RAPI dan bisa diukur (lihat .arena-tmp/probe130.ts).
 *
 * ATURAN (semuanya angka pasti, bukan kira-kira):
 *  1. Dua pita zebra avenue (pusat x = ±5.0, lebar 2.25 m → x 3.875..6.125) dibagi TIGA kolom
 *     berjarak 0.75 m: kolom LUAR (|x| = 4.25 dan 5.75) untuk penyeberang visual, kolom TENGAH
 *     (|x| = 5.0) untuk penyeberang sungguhan dari sistem mover (engine). Dua sistem itu jadi
 *     tidak pernah berdiri di titik yang sama (jarak kolom 0.75 m > lebar badan ~0.45 m).
 *  2. Penyeberang visual hanya melintasi PARUH JAUH: median (lat 4.3) ↔ trotoar jauh (15.2).
 *     Jalur pemain (|lat| ≤ 2.4, saat bebas terbang ±2.9) karena itu TIDAK pernah ditempati
 *     penyeberang visual — jalur pemain tetap hanya berisi penyeberang sungguhan (mover),
 *     persis seperti rancangan aslinya.
 *  3. SATU penyeberang per kolom (4 kolom = 4 penyeberang). Jadi tidak ada yang bisa menyusul,
 *     berpapasan, atau berdiri bertumpuk: setiap orang punya kolomnya sendiri (0.75 m) dan
 *     ujung jalurnya sendiri. Ini pilihan paling sederhana yang pasti RAPI (terukur, lihat
 *     .arena-tmp/probe130.ts).
 *  4. Tinggi kaki selalu dari scramblePedH(): median 0.18, dek trotoar 0.175, apron 0.03.
 */

/** Kolom visual: jarak kolom dari pusat pita zebra (m). */
const COL_OFF = 0.75;

/** Pusat pita zebra avenue (m dari pusat perempatan). */
export const SCRAMBLE_BAND_X = 4.7;
/** Setengah lebar pita zebra avenue (m). */
export const SCRAMBLE_BAND_HALF = 1.45; // setengah lebar pita zebra = setengah lebar marka (2.9 m)
/** Tepi dalam trotoar dekat (batas badan jalan). */
export const SCRAMBLE_NEAR_LAT = -4.55;
/** Tepi dalam trotoar jauh (batas badan jalan). */
export const SCRAMBLE_FAR_LAT = 12.3;
/** Tempat tunggu di median (sisi dalam, masih di atas pulau median 3.55..5.15). */
export const SCRAMBLE_MED_LAT = 4.3;
/** Tujuan/tempat tunggu di trotoar jauh (masih di atas dek 12.3..30). */
export const SCRAMBLE_FAR_WALK = 15.2;

export type ScramblePath = {
  xA: number;
  latA: number;
  xB: number;
  latB: number;
  /** nama kolom (satu kolom = satu penyeberang) */
  column: string;
  speed: number;
  variant: number;
  kid?: boolean;
};

const COL_SPEED = [1.45, 1.38, 1.5, 1.42] as const;
const COL_VARIANT = [5, 0, 7, 3] as const; // 5..7 = berjas (salaryman), 0..4 = kasual
const COL_KID = [false, true, false, false] as const;

/** Semua jalur penyeberang visual scramble (4 kolom: 2 kolom × 2 pita zebra, 1 orang per kolom). */
export const SCRAMBLE_PATHS: ScramblePath[] = (() => {
  const out: ScramblePath[] = [];
  let col = 0;
  for (const side of [-1, 1] as const) {
    for (const off of [-COL_OFF, COL_OFF] as const) {
      const x = side * SCRAMBLE_BAND_X + off;
      out.push({
        column: `col${x.toFixed(2)}`,
        xA: x,
        latA: SCRAMBLE_FAR_WALK, // ujung 0 = trotoar jauh
        xB: x,
        latB: SCRAMBLE_MED_LAT, // ujung len = median
        speed: COL_SPEED[col],
        variant: COL_VARIANT[col],
        kid: COL_KID[col],
      });
      col++;
    }
  }
  return out;
})();

/** Panjang jalur (m) sebuah penyeberang. */
export function scramblePathLength(path: ScramblePath): number {
  return Math.hypot(path.xB - path.xA, path.latB - path.latA);
}

/**
 * Pose penyeberang pada jarak `dist` di sepanjang jalurnya (dist 0 = trotoar jauh, len = median).
 * `dir` = 1 kalau berjalan menuju median, -1 kalau berjalan ke trotoar jauh.
 */
export function scrambleWalkerPose(
  path: ScramblePath,
  dist: number,
  dir: 1 | -1,
): { u: number; x: number; lat: number; yaw: number } {
  const len = scramblePathLength(path);
  const u = len > 0 ? Math.min(1, Math.max(0, dist / len)) : 0;
  const dx = path.xB - path.xA;
  const dz = path.latB - path.latA;
  return {
    u,
    x: path.xA + u * dx,
    lat: path.latA + u * dz,
    yaw: Math.atan2(-dz * dir, dx * dir),
  };
}
