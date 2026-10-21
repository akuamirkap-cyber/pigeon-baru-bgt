/**
 * MISI SYARAT BUKA SKIN — tiap skin karakter & papan skate (kecuali starter gratis)
 * punya satu syarat yang harus dipenuhi dulu. Teks syarat ditampilkan di bawah skin
 * pada carousel Voxel Buddies, dan progression-nya dihitung dari statistik seumur
 * hidup (stats.ts) + state UI (skor terbaik & dompet roti), jadi tidak ada state baru
 * yang perlu disimpan khusus per skin.
 */
import { getStats, type LifeStats } from "./stats";

export type MissionKind = "runs" | "dist" | "bread" | "score" | "rockets" | "shibuya" | "price";

export interface SkinMission {
  kind: MissionKind;
  /** Angka target (roti / meter / skor / jumlah run / harga tukar). */
  goal: number;
}

export interface MissionCtx {
  best: number;
  wallet: number;
  stats: LifeStats;
}

export interface MissionStatus {
  done: boolean;
  label: string;
  /** Progres saat ini vs target (untuk label "12/25"). */
  cur: number;
  goal: number;
  /** true = misi "tukar roti": dompet dipotong saat membuka skin. */
  purchase: boolean;
}

export const SKIN_MISSION_KIND_LABEL: Record<MissionKind, string> = {
  runs: "Selesaikan {n} run",
  dist: "Tempuh {n} m dalam satu run",
  bread: "Kumpulkan {n} roti dalam satu run",
  score: "Raih skor {n} dalam satu run",
  rockets: "Ambil {n} roket langka",
  shibuya: "Main {n} run di Kota Shibuya",
  price: "Tukar {n} roti 🍞 untuk membukanya",
};

export function missionLabel(kind: MissionKind, goal: number): string {
  return SKIN_MISSION_KIND_LABEL[kind].replace("{n}", goal.toLocaleString("id-ID"));
}

/* ---------- Penetapan misi (deterministik, urutan carousel) ----------
 * Kulit starter di bawah ini gratis dan langsung terbuka; sisanya digilir
 * lewat tabel di bawah supaya tiap skin punya syarat yang berbeda-beda.
 */
export const FREE_CHARACTER_IDS = new Set<string>(["classic", "buddy-duck", "buddy-chicken", "friend-monkey"]);
export const FREE_DECK_IDS = new Set<string>(["default", "baguette", "hoverboard"]);

/** Urutan skin karakter pada carousel (sinkron dengan SKINS di buddies/characters.tsx). */
const CHAR_ORDER = [
  "duck", "chicken", "mallard", "shiba", "penguin", "panda", "dino", "frog",
  "babyturtle", "manekineko", "tanuki", "shaun", "polarbear", "beaver", "teddy",
  "axolotl", "redpanda", "fennec", "squirrel", "hedgehog", "capybara", "kirin", "monk",
];

/** Urutan papan skate pada carousel (float SKINS + papan legacy dari DECKS). */
const DECK_ORDER = [
  "default", "baguette", "hoverboard", "koi", "goldfish", "bamboo", "zabuton",
  "minijet", "keitruck", "broom", "ufo", "surfboard", "carpet", "kinton", "leaf",
  "sword", "pizza", "sushi", "banana", "icecream", "drone",
];

const CHAR_CYCLE: MissionKind[] = ["bread", "dist", "runs", "score", "rockets", "shibuya", "price"];
const DECK_CYCLE: MissionKind[] = ["dist", "bread", "score", "rockets", "runs", "shibuya", "price"];

const goalFor = (kind: MissionKind, i: number): number => {
  switch (kind) {
    case "bread": return 20 + i * 5;
    case "dist": return 120 + i * 70;
    case "score": return 80 + i * 60;
    case "runs": return 1 + Math.floor(i / 2);
    case "rockets": return 1 + Math.floor(i / 3);
    case "shibuya": return 1 + Math.floor(i / 3);
    case "price": return 50 + i * 15;
  }
};

const buildTable = (order: string[], cycle: MissionKind[], free: Set<string>, prefix = "") => {
  const map = new Map<string, SkinMission>();
  let tier = 0;
  for (const id of order) {
    const full = prefix + id;
    if (free.has(full)) continue;
    const kind = cycle[tier % cycle.length];
    map.set(full, { kind, goal: goalFor(kind, tier) });
    tier += 1;
  }
  return map;
};

const CHAR_MISSIONS = buildTable(
  CHAR_ORDER.filter((id) => !FREE_CHARACTER_IDS.has(`buddy-${id}`)),
  CHAR_CYCLE,
  FREE_CHARACTER_IDS,
  "buddy-"
);
const DECK_MISSIONS = buildTable(
  DECK_ORDER.filter((id) => !FREE_DECK_IDS.has(id)),
  DECK_CYCLE,
  FREE_DECK_IDS
);

/** Skin pinky tetap memakai harga legacy (80 roti) agar konsisten dgn Menu. */
CHAR_MISSIONS.set("pinky", { kind: "price", goal: 80 });

/** Kembalikan misi untuk satu skin/deck id; null = gratis selamanya. */
export function getMission(id: string): SkinMission | null {
  if (FREE_CHARACTER_IDS.has(id) || FREE_DECK_IDS.has(id)) return null;
  return CHAR_MISSIONS.get(id) ?? DECK_MISSIONS.get(id) ?? null;
}

export function missionStatus(id: string, ctx: MissionCtx): { mission: SkinMission | null; status: MissionStatus | null } {
  const mission = getMission(id);
  if (!mission) {
    return { mission: null, status: { done: true, label: "Gratis — langsung terbuka", cur: 1, goal: 1, purchase: false } };
  }
  const { kind, goal } = mission;
  let cur = 0;
  switch (kind) {
    case "runs": cur = ctx.stats.runs; break;
    case "dist": cur = ctx.stats.maxDist; break;
    case "bread": cur = ctx.stats.maxBread; break;
    case "score": cur = ctx.best; break;
    case "rockets": cur = ctx.stats.rockets; break;
    case "shibuya": cur = ctx.stats.shibuyaRuns; break;
    case "price": cur = ctx.wallet; break;
  }
  return {
    mission,
    status: {
      done: cur >= goal,
      label: missionLabel(kind, goal),
      cur: Math.min(cur, goal),
      goal,
      purchase: kind === "price",
    },
  };
}

/** true bila syarat skin sudah terpenuhi (atau skin memang gratis). */
export function missionDone(id: string, ctx: MissionCtx): boolean {
  return missionStatus(id, ctx).status?.done ?? true;
}

export function snapshotCtx(best: number, wallet: number): MissionCtx {
  return { best, wallet, stats: getStats() };
}
