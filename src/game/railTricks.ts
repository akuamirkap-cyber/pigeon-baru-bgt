/**
 * Trik rel (rail tricks) — dijalankan OTOMATIS saat karakter mendarat di rel (startGrind).
 * Setiap pendaratan di rel memainkan trik ACAK, dan tidak pernah sama dengan trik sebelumnya.
 */

export type RailTrickKind =
  | "fiftyFifty"
  | "boardslide"
  | "lipslide"
  | "noseslide"
  | "tailslide"
  | "bluntslide"
  | "crooked"
  | "smith"
  | "feeble";

export interface RailTrickDef {
  kind: RailTrickKind;
  name: string;
  short: string;
  /** bonus poin yang ditambahkan saat grind selesai (sebelum dikali combo) */
  pts: number;
  color: string;
  /** deskripsi singkat posisi papan di rel */
  desc: string;
}

export const RAIL_TRICKS: RailTrickDef[] = [
  {
    kind: "fiftyFifty",
    name: "50-50 GRIND",
    short: "50-50",
    pts: 60,
    color: "#ff9f1c",
    desc: "Kedua truck berada di atas rel",
  },
  {
    kind: "boardslide",
    name: "BOARDSLIDE",
    short: "Boardslide",
    pts: 90,
    color: "#ffd60a",
    desc: "Papan melintang tegak lurus terhadap rel",
  },
  {
    kind: "lipslide",
    name: "LIPSLIDE",
    short: "Lipslide",
    pts: 120,
    color: "#ff5c8a",
    desc: "Papan melintang di rel setelah melompati rel",
  },
  {
    kind: "noseslide",
    name: "NOSESLIDE",
    short: "Noseslide",
    pts: 100,
    color: "#4cc9f0",
    desc: "Ujung depan papan bergesekan dengan rel",
  },
  {
    kind: "tailslide",
    name: "TAILSLIDE",
    short: "Tailslide",
    pts: 100,
    color: "#c77dff",
    desc: "Ujung belakang papan bergesekan dengan rel",
  },
  {
    kind: "bluntslide",
    name: "BLUNTSLIDE",
    short: "Bluntslide",
    pts: 130,
    color: "#80ed99",
    desc: "Bagian tail papan bertumpu pada rel, roda berada di luar",
  },
  {
    kind: "crooked",
    name: "CROOKED GRIND",
    short: "Crooked",
    pts: 110,
    color: "#ff9f1c",
    desc: "Truck depan mengunci rel dengan posisi papan miring",
  },
  {
    kind: "smith",
    name: "SMITH GRIND",
    short: "Smith",
    pts: 110,
    color: "#38bdf8",
    desc: "Truck belakang bertumpu pada rel, depan papan miring ke bawah",
  },
  {
    kind: "feeble",
    name: "FEEBLE GRIND",
    short: "Feeble",
    pts: 110,
    color: "#ff85a1",
    desc: "Truck belakang di rel, bagian depan papan menjulur ke sisi luar",
  },
];

/** Peluang 50-50 ikut dalam satu kocokan (0.05 = muncul kira-kira 1 dari 20 kocokan, jauh lebih jarang dari trik lain). */
export const RAIL_FIFTY_CHANCE = 0.05;

/**
 * Kantong trik (deck): semua trik dikocok, dimainkan satu per satu sampai habis, baru dikocok ulang.
 * Dengan begitu setiap trik kebagian giliran yang sama rata, dan trik yang sama tidak muncul
 * dua kali berturut-turut (termasuk di perbatasan kocokan).
 */
export class RailTrickDeck {
  private bag: RailTrickKind[] = [];
  private last: RailTrickKind | null = null;

  reset() {
    this.bag = [];
    this.last = null;
  }

  next(): RailTrickDef {
    if (this.bag.length === 0) {
      // 50-50 dibuat lebih jarang: hanya masuk ke sebagian kocokan (RAIL_FIFTY_CHANCE)
      const kinds = RAIL_TRICKS.map((t) => t.kind).filter(
        (k) => k !== "fiftyFifty" || Math.random() < RAIL_FIFTY_CHANCE,
      );
      for (let i = kinds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [kinds[i], kinds[j]] = [kinds[j], kinds[i]];
      }
      // jangan biarkan trik terakhir dari kocokan sebelumnya jadi yang pertama lagi
      if (this.last !== null && kinds[kinds.length - 1] === this.last) {
        [kinds[0], kinds[kinds.length - 1]] = [kinds[kinds.length - 1], kinds[0]];
      }
      this.bag = kinds; // diambil dari belakang (pop)
    }
    const kind = this.bag.pop() as RailTrickKind;
    this.last = kind;
    return RAIL_TRICKS.find((t) => t.kind === kind) as RailTrickDef;
  }
}

/**
 * Pose lengkap karakter untuk tiap trik rel.
 *  yaw / pitch / roll : orientasi PAPAN relatif rel (rad). pitch + = hidung naik / ekor turun.
 *  crouch             : tekukan lutut 0..1 (0 = berdiri, 1 = jongkok dalam)
 *  bodyYaw            : badan (dada & kepala) memutar mengikuti arah papan (rad)
 *  lean               : badan condong; + = ke belakang, - = ke depan (rad)
 *  bodyRoll           : badan miring ke samping (rad)
 *  arms               : lengan. rx = ayun depan/belakang, sp = membuka ke samping (kiri & kanan)
 */
export interface RailPose {
  yaw: number;
  pitch: number;
  roll: number;
  crouch: number;
  bodyYaw: number;
  lean: number;
  bodyRoll: number;
  arms: { rxL: number; rxR: number; spL: number; spR: number };
}

const NEUTRAL_ARMS = { rxL: 0.12, rxR: 0.12, spL: 0.42, spR: 0.42 };

export const RAIL_POSE: Record<RailTrickKind, RailPose> = {
  // 1. 50-50: papan sejajar rel, kedua truck di rel, lutut sedikit menekuk, badan seimbang
  fiftyFifty: { yaw: 0, pitch: 0, roll: 0, crouch: 0.5, bodyYaw: 0, lean: 0, bodyRoll: 0, arms: NEUTRAL_ARMS },
  // 2. Boardslide: papan 90° tegak lurus rel, badan ikut arah papan, lutut menekuk, tangan terbuka
  boardslide: {
    yaw: Math.PI / 2, pitch: 0, roll: 0, crouch: 0.7, bodyYaw: 0.35, lean: 0, bodyRoll: 0,
    arms: { rxL: -0.1, rxR: -0.1, spL: 0.85, spR: 0.85 },
  },
  // 3. Lipslide: papan tegak lurus dari sisi berlawanan, hidung sedikit naik, badan condong
  lipslide: {
    yaw: -Math.PI / 2, pitch: 0.22, roll: 0.2, crouch: 0.6, bodyYaw: -0.3, lean: 0.08, bodyRoll: 0.15,
    arms: { rxL: -0.1, rxR: -0.1, spL: 0.7, spR: 0.7 },
  },
  // 4. Noseslide: hidung papan di rel, ekor sedikit terangkat, badan condong ke depan
  noseslide: {
    yaw: 0.12, pitch: -0.6, roll: 0, crouch: 0.6, bodyYaw: 0, lean: -0.3, bodyRoll: 0,
    arms: { rxL: 0.5, rxR: 0.5, spL: 0.5, spR: 0.5 },
  },
  // 5. Tailslide: ekor papan di rel, hidung terangkat, badan condong ke belakang
  tailslide: {
    yaw: -0.12, pitch: 0.6, roll: 0, crouch: 0.6, bodyYaw: 0, lean: 0.3, bodyRoll: 0,
    arms: { rxL: -0.5, rxR: -0.5, spL: 0.6, spR: 0.6 },
  },
  // 6. Bluntslide: ekor bertumpu di rel, papan miring menyamping, hidung naik tinggi, lutut menekuk dalam
  bluntslide: {
    yaw: 0.4, pitch: 0.45, roll: 0.4, crouch: 0.9, bodyYaw: 0.1, lean: 0.12, bodyRoll: -0.1,
    arms: { rxL: 0.1, rxR: 0.1, spL: 0.6, spR: 0.6 },
  },
  // 7. Crooked: papan menyerong, truck depan mengunci rel, hidung sedikit turun, bahu ikut arah
  crooked: {
    yaw: 0.6, pitch: -0.2, roll: 0.08, crouch: 0.6, bodyYaw: 0.3, lean: 0, bodyRoll: 0,
    arms: { rxL: 0, rxR: 0, spL: 0.5, spR: 0.5 },
  },
  // 8. Smith: truck belakang di rel, depan papan menjulur ke samping & miring ke bawah, badan condong belakang
  smith: {
    yaw: 0, pitch: -0.45, roll: 0, crouch: 0.6, bodyYaw: 0, lean: 0.25, bodyRoll: 0,
    arms: { rxL: -0.2, rxR: -0.2, spL: 0.8, spR: 0.8 },
  },
  // 9. Feeble: truck belakang di rel, papan menyerong ke sisi luar, badan condong menjaga keseimbangan
  feeble: {
    yaw: -0.7, pitch: 0.18, roll: -0.08, crouch: 0.7, bodyYaw: -0.25, lean: 0.15, bodyRoll: -0.15,
    arms: { rxL: 0.2, rxR: -0.1, spL: 0.2, spR: 0.9 },
  },
};

export const RAIL_POSE_NONE: RailPose = {
  yaw: 0, pitch: 0, roll: 0, crouch: 0, bodyYaw: 0, lean: 0, bodyRoll: 0,
  arms: { rxL: -0.24, rxR: -0.24, spL: 0.16, spR: 0.16 },
};
