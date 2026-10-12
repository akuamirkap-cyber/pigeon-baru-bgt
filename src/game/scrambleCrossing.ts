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
 *  2. Penyeberang visual hanya melintasi PARUH JAUH: median (lat 4.3) ↔ trotoar jauh (12.9).
 *     Jalur pemain (|lat| ≤ 2.4, saat bebas terbang ±2.9) karena itu TIDAK pernah ditempati
 *     penyeberang visual — jalur pemain tetap hanya berisi penyeberang sungguhan (mover),
 *     persis seperti rancangan aslinya.
 *  3. SATU penyeberang per kolom (4 kolom = 4 penyeberang). Jadi tidak ada yang bisa menyusul,
 *     berpapasan, atau berdiri bertumpuk: setiap orang punya kolomnya sendiri (0.75 m) dan
 *     ujung jalurnya sendiri. Ini pilihan paling sederhana yang pasti RAPI (terukur, lihat
 *     .arena-tmp/probe130.ts).
 *  4. Tinggi kaki selalu dari scramblePedH(): median 0.18, dek trotoar 0.175, apron 0.03.
 *  5. TUJUAN JELAS (anti "mondar-mandir tanpa arah"): satu siklus = menyeberang ke median,
 *     menunggu di pulau median (bukan langsung berputar di tengah zebra), menyeberang balik
 *     ke trotoar, lalu MENYUSURI TROTOAR jauh (7-10 m) dan kembali. Titik balik ada di
 *     trotoar/median, bukan di tengah jalan. Kaki yang sudah mulai menyeberang MENYELESAIKAN
 *     langkahnya (tidak berhenti jadi patung di tengah zebra kalau lampu berubah).
 *  6. Mulai menyeberang tetap menunggu lampu kendaraan MERAH (inter.lightState === "red").
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
/** Ujung/tempat tunggu di trotoar jauh (masih di atas dek trotoar 12.6..16.1).
 *  Ditaruh di 12.9 (jalur trotoar yang BEBAS dekorasi: vending 13.75+, lampu 12.55,
 *  pengunjung toko ~15.05, pohon 16.2 — lihat .arena-tmp/probe141.ts). Dulu 15.2:
 *  penyeberang berdiri/berjalan DI ANTARA lampion, pengunjung toko, dan vending. */
export const SCRAMBLE_FAR_WALK = 12.9;

/** Panjang langkah menyusuri trotoar jauh (m) tiap kolom sebelum kembali ke perempatan.
 *  Membuat penyeberang visual punya TUJUAN yang jelas (pergi & pulang menyusuri trotoar),
 *  dan titik baliknya jauh dari zebra — bukan berputar di tengah penyeberangan. */
export const SCRAMBLE_SIDEWALK_LEG = [7, 9, 8, 10] as const;

/** Yaw menyusuri trotoar: searah s (+) atau berlawanan (-). Rig voxel menghadap +x lokal
 *  (probe140: +x lokal = +s dunia), jadi yaw 0 = +s dan pi = -s. */
export function scrambleSidewalkYaw(dir: 1 | -1): number {
  return dir > 0 ? 0 : Math.PI;
}

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
  /** panjang langkah menyusuri trotoar jauh (m) */
  sidewalkLeg: number;
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
        sidewalkLeg: SCRAMBLE_SIDEWALK_LEG[col] ?? 8,
      });
      col++;
    }
  }
  return out;
})();

export type ScrambleWalkerLeg = "wait" | "toMedian" | "medWait" | "toFar" | "walkAway" | "walkBack";

/** Status satu penyeberang visual (dipakai World.tsx; bisa diuji lewat .arena-tmp/probe142.ts). */
export interface ScrambleWalkerState {
  leg: ScrambleWalkerLeg;
  /** posisi di jalur penyeberangan: 0 = trotoar jauh, len = median */
  dist: number;
  dir: 1 | -1;
  /** posisi menyusuri trotoar jauh (m dari kolom zebranya) */
  sidewalk: number;
  sidewalkDir: 1 | -1;
  wait: number;
  /** fase animasi kaki */
  t0: number;
}

export function createScrambleWalkerState(): ScrambleWalkerState {
  return {
    leg: "wait",
    dist: 0,
    dir: 1,
    sidewalk: 0,
    sidewalkDir: Math.random() < 0.5 ? 1 : -1,
    wait: 0.4 + Math.random() * 1.6,
    t0: Math.random() * 20,
  };
}

/**
 * Satu langkah siklus hidup penyeberang visual. SATU-SATUNYA tempat perilakunya ditentukan,
 * jadi bisa diuji tanpa render (probe142): tidak ada langkah yang berjalan di tempat, tidak ada
 * arah yang berbalik di tengah penyeberangan, dan setiap ujung langkah punya jeda menunggu.
 * `lightRed` = lampu kendaraan MERAH (penyeberangan dibuka).
 */
export function stepScrambleWalker(
  st: ScrambleWalkerState,
  path: ScramblePath,
  dt: number,
  lightRed: boolean,
): { sLocal: number; lat: number; yaw: number; walking: boolean } {
  const len = scramblePathLength(path);
  const step = path.speed * dt;
  if (st.leg === "toMedian" || st.leg === "toFar") {
    const dir: 1 | -1 = st.leg === "toMedian" ? 1 : -1;
    st.dir = dir;
    st.dist += step * dir;
    if (st.leg === "toMedian" && st.dist >= len) {
      st.dist = len; // tiba di pulau median
      st.leg = "medWait";
      st.wait = 0.5 + Math.random() * 1.3;
    } else if (st.leg === "toFar" && st.dist <= 0) {
      st.dist = 0; // tiba di trotoar jauh -> lanjut menyusuri trotoar
      st.leg = "walkAway";
    }
  } else if (st.leg === "medWait") {
    st.wait -= dt;
    if (st.wait <= 0) {
      st.leg = "toFar";
      st.dist -= step; // langsung melangkah di frame ini
    }
  } else if (st.leg === "walkAway") {
    st.sidewalk += step;
    if (st.sidewalk >= path.sidewalkLeg) {
      st.sidewalk = path.sidewalkLeg;
      st.leg = "walkBack";
      st.sidewalkDir = -st.sidewalkDir as 1 | -1; // pulang lewat sisi lain
    }
  } else if (st.leg === "walkBack") {
    st.sidewalk -= step;
    if (st.sidewalk <= 0) {
      st.sidewalk = 0;
      st.leg = "wait";
      st.wait = 0.4 + Math.random() * 1.2;
    }
  } else {
    // "wait": berdiri di trotoar jauh sampai lampu kendaraan merah
    st.wait -= dt;
    if (st.wait <= 0 && lightRed) {
      // Mulai melangkah DI FRAME INI juga (jangan ada satu frame diam sambil animasi jalan).
      st.leg = "toMedian";
      st.dist += step;
    }
  }

  st.dist = Math.min(len, Math.max(0, st.dist));
  const walking = st.leg === "toMedian" || st.leg === "toFar" || st.leg === "walkAway" || st.leg === "walkBack";
  if (st.leg === "walkAway" || st.leg === "walkBack") {
    // menyusuri trotoar jauh (lat tetap di ujung jalur)
    return {
      sLocal: path.xA + st.sidewalk * st.sidewalkDir,
      lat: path.latA,
      yaw: scrambleSidewalkYaw(st.sidewalkDir),
      walking,
    };
  }
  const pose = scrambleWalkerPose(path, st.dist, st.leg === "toMedian" ? 1 : st.dir);
  return { sLocal: pose.x, lat: pose.lat, yaw: pose.yaw, walking };
}

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
