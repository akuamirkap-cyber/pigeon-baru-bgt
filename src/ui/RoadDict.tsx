/**
 * KAMUS VISUAL ASET JALAN & TROTOAR
 * ----------------------------------
 * Catalog 1:1 dari semua bentuk permukaan jalan yang dibangun kode game ini.
 * Semua warna, lebar lateral (m) dan tinggi (m) DITULAR langsung dari sumbernya:
 *   - src/game/ground.ts   -> stripsFor() cross-section per kota + marka + pagar pipa
 *   - src/game/models.ts   -> intersectionRoadParts() (zebra, stop line, taktil, curb return)
 *                            & railParts() (grind rail)
 * Jadi kamus ini tidak akan "bohong" walau asetnya berubah — cukup sinkronkan datanya.
 */
import type { JSX, ReactNode } from "react";

/* ---------- renderer dasar: TOP = tampak atas sepanjang jalan (x = arah laju s, y = lateral) ---------- */

interface Band {
  lat0: number;
  lat1: number;
  color: string;
  /** warna selang-seling tiap ~6m (kerikil/rumput) */
  alt?: string;
  /** tinggi permukaan (m) — digambar sebagai garis tepi gelap bila > 0 */
  top?: number;
}

function Top({
  from,
  to,
  bands,
  h = 110,
  children,
}: {
  from: number;
  to: number;
  bands: Band[];
  h?: number;
  children?: (y: (lat: number) => number, u: number) => ReactNode;
}) {
  const W = 260;
  const span = to - from;
  const u = h / span; // px per meter
  const y = (lat: number) => (lat - from) * u;
  return (
    <svg viewBox={`0 0 ${W} ${h}`} className="block w-full" role="img" aria-label="potongan melintang">
      {bands.map((b, i) => {
        const y0 = y(b.lat0);
        const y1 = y(b.lat1);
        const bh = Math.max(1, y1 - y0);
        return (
          <g key={i}>
            <rect x={0} y={y0} width={W} height={bh} fill={b.color} />
            {b.alt &&
              Array.from({ length: Math.ceil(W / 26) }, (_, k) => (
                <rect key={k} x={k * 26 + (k % 2 ? 0 : 13)} y={y0} width={13} height={bh} fill={b.alt} opacity={0.9} />
              ))}
            {(b.top ?? 0) > 0 && (
              <>
                <rect x={0} y={y0} width={W} height={Math.min(2, bh)} fill="#00000055" />
                <rect x={0} y={y1 - Math.min(1.6, bh)} width={W} height={Math.min(1.6, bh)} fill="#00000030" />
              </>
            )}
          </g>
        );
      })}
      {children ? children(y, u) : null}
    </svg>
  );
}

/** garis marka memanjang searah jalan (y = posisi lateral tengah) */
function Line({ y, w, color }: { y: number; w: number; color: string }) {
  return <rect x={0} y={y - w / 2} width={260} height={w} fill={color} />;
}

function DashRow({ yc, w, color, period = 34, seg = 18 }: { yc: number; w: number; color: string; period?: number; seg?: number }) {
  return (
    <g>
      {Array.from({ length: Math.ceil(260 / period) }, (_, k) => (
        <rect key={k} x={k * period + 4} y={yc - w / 2} width={seg} height={w} fill={color} />
      ))}
    </g>
  );
}

/** pita zebra: strip putih melebar lateral, berulang searah jalan */
function Zebra({ y0, y1, period = 26, seg = 12, color = "#f8fafc" }: { y0: number; y1: number; period?: number; seg?: number; color?: string }) {
  return (
    <g>
      {Array.from({ length: Math.ceil(260 / period) }, (_, k) => (
        <rect key={k} x={k * period + 3} y={y0} width={seg} height={y1 - y0} fill={color} />
      ))}
    </g>
  );
}

/* ---------- renderer dasar: FRONT = tampak samping/depan ---------- */

function Front({ children, h = 110, ground = "#474f60" }: { children: ReactNode; h?: number; ground?: string }) {
  return (
    <svg viewBox={`0 0 260 ${h}`} className="block w-full" role="img" aria-label="tampak depan">
      <rect x={0} y={h - 18} width={260} height={18} fill={ground} />
      <rect x={0} y={h - 18} width={260} height={2.5} fill="#ffffff22" />
      {children}
    </svg>
  );
}

/* ---------- data kamus (DITULIS ULANG persis dari ground.ts / models.ts) ---------- */

interface Entry {
  id: string;
  name: string;
  visual: ReactNode;
}

const STR = "#1f2430";

const STREET = "#474f60";
const CURB = "#d8d3c5";
const WALK = "#e9e3d4";
const PLAZA = "#b7b2a6";
const G1 = "#95e055";
const G2 = "#89d64c";

const SEC_NEAR = "#343a4c";
const SEC_CURB = "#9aa2b5";
const SEC_PLAZA = "#41465c";
const SEC_GRANITE = "#575d75";
const SEC_MEDIAN = "#484e66";
const SEC_FAR = "#31374a";
const SEAM_NIGHT = "#454b62";

const HRN_ASPHALT = "#383d47";
const HRN_GUTTER = "#717884";
const HRN_GRAVEL1 = "#4a3f32";
const HRN_GRAVEL2 = "#56493a";
const HRN_FOREST1 = "#2c4620";
const HRN_FOREST2 = "#365427";
const YELLOW = "#f59e0b";
const WHITE = "#ffffff";

const CROSS_ASPHALT = "#555a66";
const CROSS_CURB = "#b8b4aa";
const CROSS_WALK = "#dcd7cb";

export function buildRoadDict(): { group: string; entries: Entry[] }[] {
  return [
    {
      group: "JALAN RAYA — POTONGAN MELINTANG (ground.ts stripsFor)",
      entries: [
        {
          id: "street",
          name: "Jalan Tokyo — aspal + kerb + plaza/rumput rata (trotoar dihapus)",
          visual: (
            <Top from={-9.5} to={9} bands={[
              { lat0: -9.5, lat1: -4, color: PLAZA, top: 0.1 },
              { lat0: -4, lat1: -3.7, color: CURB, top: 0.14 },
              { lat0: -3.75, lat1: 3.75, color: STREET },
              { lat0: 3.7, lat1: 4, color: CURB, top: 0.14 },
              { lat0: 4, lat1: 9, color: G1, alt: G2, top: 0.1 },
            ]}>
              {(y) => (
                <g>
                  <DashRow yc={y(-1.2)} w={2} color={WHITE} />
                  <DashRow yc={y(1.2)} w={2} color={WHITE} />
                </g>
              )}
            </Top>
          ),
        },
        {
          id: "shibuya",
          name: "Boulevard Shibuya — 6 lajur + median + granit malam",
          visual: (
            <Top from={-13} to={20} bands={[
              { lat0: -13, lat1: -8.2, color: SEC_PLAZA, top: 0.1 },
              { lat0: -8.2, lat1: -4, color: SEC_GRANITE, top: 0.12 },
              { lat0: -4, lat1: -3.7, color: SEC_CURB, top: 0.14 },
              { lat0: -3.75, lat1: 3.75, color: SEC_NEAR },
              { lat0: 3.7, lat1: 5, color: SEC_MEDIAN, top: 0.16 },
              { lat0: 5, lat1: 12.3, color: SEC_FAR },
              { lat0: 12.3, lat1: 12.6, color: SEC_CURB, top: 0.14 },
              { lat0: 12.6, lat1: 16.1, color: SEC_GRANITE, top: 0.12 },
              { lat0: 16.1, lat1: 20, color: SEC_PLAZA, top: 0.1 },
            ]}>
              {(y) => (
                <g>
                  <DashRow yc={y(-1.2)} w={1.8} color={WHITE} />
                  <DashRow yc={y(1.2)} w={1.8} color={WHITE} />
                  <DashRow yc={y(7.43)} w={1.8} color={WHITE} />
                  <DashRow yc={y(9.87)} w={1.8} color={WHITE} />
                  <Line y={y(5.19)} w={1.8} color={WHITE} />
                  <Line y={y(12.11)} w={1.8} color={WHITE} />
                </g>
              )}
            </Top>
          ),
        },
        {
          id: "haruna",
          name: "Touge Haruna — aspal gunung + got + kerikil + hutan",
          visual: (
            <Top from={-9} to={9} bands={[
              { lat0: -9, lat1: -6.4, color: HRN_FOREST1, alt: HRN_FOREST2, top: 0.08 },
              { lat0: -6.4, lat1: -4.1, color: HRN_GRAVEL1, alt: HRN_GRAVEL2, top: 0.1 },
              { lat0: -4.1, lat1: -3.75, color: HRN_GUTTER, top: 0.12 },
              { lat0: -3.75, lat1: 3.75, color: HRN_ASPHALT },
              { lat0: 3.75, lat1: 4.1, color: HRN_GUTTER, top: 0.12 },
              { lat0: 4.1, lat1: 6.4, color: HRN_GRAVEL1, alt: HRN_GRAVEL2, top: 0.1 },
              { lat0: 6.4, lat1: 9, color: HRN_FOREST1, alt: HRN_FOREST2, top: 0.08 },
            ]}>
              {(y) => (
                <g>
                  <Line y={y(-0.11)} w={1.6} color={YELLOW} />
                  <Line y={y(0.11)} w={1.6} color={YELLOW} />
                  <Line y={y(-3.585)} w={1.6} color={WHITE} />
                  <Line y={y(3.585)} w={1.6} color={WHITE} />
                </g>
              )}
            </Top>
          ),
        },
        {
          id: "park",
          name: "Jalan Taman — asping sama, plaza kiri jadi rumput",
          visual: (
            <Top from={-9.5} to={9} bands={[
              { lat0: -9.5, lat1: -7, color: G1, alt: G2, top: 0.1 },
              { lat0: -7, lat1: -4, color: WALK, top: 0.12 },
              { lat0: -4, lat1: -3.7, color: CURB, top: 0.14 },
              { lat0: -3.75, lat1: 3.75, color: STREET },
              { lat0: 3.7, lat1: 4, color: CURB, top: 0.14 },
              { lat0: 4, lat1: 6.3, color: WALK, top: 0.12 },
              { lat0: 6.3, lat1: 9, color: G1, alt: G2, top: 0.1 },
            ]} />
          ),
        },
      ],
    },
    {
      group: "MARKA JALAN (dicat di ground.ts di atas aspal)",
      entries: [
        {
          id: "lane-dash",
          name: "Marka putus-putus pemisah lajur — lat ±1.2 m",
          visual: (
            <Top from={-3.75} to={3.75} h={90} bands={[{ lat0: -3.75, lat1: 3.75, color: STREET }]}>
              {(y) => (
                <g>
                  <DashRow yc={y(-1.2)} w={2.4} color={WHITE} />
                  <DashRow yc={y(1.2)} w={2.4} color={WHITE} />
                </g>
              )}
            </Top>
          ),
        },
        {
          id: "edge-solid",
          name: "Garis tepi utuh Shibuya — lat 5.19 & 12.11 m",
          visual: (
            <Top from={3.7} to={12.6} h={90} bands={[
              { lat0: 3.7, lat1: 5, color: SEC_MEDIAN, top: 0.16 },
              { lat0: 5, lat1: 12.3, color: SEC_FAR },
              { lat0: 12.3, lat1: 12.6, color: SEC_CURB, top: 0.14 },
            ]}>
              {(y) => (
                <g>
                  <Line y={y(5.19)} w={2.2} color={WHITE} />
                  <Line y={y(12.11)} w={2.2} color={WHITE} />
                </g>
              )}
            </Top>
          ),
        },
        {
          id: "hrn-center",
          name: "Garis tengah double-yellow Touge — lat ±0.11 m",
          visual: (
            <Top from={-1.6} to={1.6} h={70} bands={[{ lat0: -1.6, lat1: 1.6, color: HRN_ASPHALT }]}>
              {(y) => (
                <g>
                  <Line y={y(-0.11)} w={2.6} color={YELLOW} />
                  <Line y={y(0.11)} w={2.6} color={YELLOW} />
                </g>
              )}
            </Top>
          ),
        },
        {
          id: "hrn-edge",
          name: "Garis putih tepi Touge — lat ±3.585 m",
          visual: (
            <Top from={-4.1} to={4.1} h={70} bands={[
              { lat0: -4.1, lat1: -3.75, color: HRN_GUTTER },
              { lat0: -3.75, lat1: 3.75, color: HRN_ASPHALT },
              { lat0: 3.75, lat1: 4.1, color: HRN_GUTTER },
            ]}>
              {(y) => (
                <g>
                  <Line y={y(-3.585)} w={2.6} color={WHITE} />
                  <Line y={y(3.585)} w={2.6} color={WHITE} />
                </g>
              )}
            </Top>
          ),
        },
        {
          id: "skid",
          name: "Skid mark ban — muncul di tikungan (|kappa|>0.005)",
          visual: (
            <Top from={-3.2} to={3.2} h={80} bands={[{ lat0: -3.2, lat1: 3.2, color: HRN_ASPHALT }]}>
              {(y) => (
                <g opacity={0.75}>
                  <path d={`M0 ${y(-1.6)} C 90 ${y(-2.3)}, 150 ${y(-0.8)}, 260 ${y(-1.7)}`} stroke="#1f2227" strokeWidth={3} fill="none" />
                  <path d={`M0 ${y(-2.4)} C 90 ${y(-3.1)}, 150 ${y(-1.6)}, 260 ${y(-2.5)}`} stroke="#1f2227" strokeWidth={3.4} fill="none" />
                  <path d={`M0 ${y(1.7)} C 100 ${y(0.9)}, 170 ${y(2.4)}, 260 ${y(1.6)}`} stroke="#1f2227" strokeWidth={3} fill="none" />
                </g>
              )}
            </Top>
          ),
        },
        {
          id: "speed40",
          name: "Road marking angka \"40\" — tiap blok ke-7 (mod 7 == 2)",
          visual: (
            <Top from={-2.4} to={2.4} h={76} bands={[{ lat0: -2.4, lat1: 2.4, color: HRN_ASPHALT }]}>
              {(y) => (
                <g>
                  <text x={130} y={y(0) + 13} textAnchor="middle" fontFamily="'8-BIT WONDER',monospace" fontSize={36} fontWeight={700} fill="#e8ecf2" opacity={0.92}>
                    40
                  </text>
                </g>
              )}
            </Top>
          ),
        },
        {
          id: "seams-night",
          name: "Nat granit Shibuya malam — seam #454b62",
          visual: (
            <Top from={0} to={4.2} h={80} bands={[{ lat0: 0, lat1: 4.2, color: SEC_GRANITE }]}>
              {(y, u) => (
                <g>
                  {Array.from({ length: 8 }, (_, k) => (
                    <rect key={k} x={k * 34 + 10} y={y(0.05)} width={1.4} height={(4.2 - 0.1) * u - 3} fill={SEAM_NIGHT} />
                  ))}
                </g>
              )}
            </Top>
          ),
        },
        {
          id: "junction",
          visual: (
            <Top from={-11} to={11} bands={[
              { lat0: -11, lat1: -9.5, color: CROSS_CURB, top: 0.125 },
              { lat0: -9.5, lat1: -7.9, color: CROSS_WALK, top: 0.205 },
              { lat0: -7.9, lat1: 7.9, color: CROSS_ASPHALT },
              { lat0: 7.9, lat1: 9.5, color: CROSS_WALK, top: 0.205 },
              { lat0: 9.5, lat1: 11, color: CROSS_CURB, top: 0.125 },
            ]}>
              {(y) => (
                <g>
                  <Zebra y0={y(-7.9)} y1={y(-5.7)} />
                  <Zebra y0={y(5.7)} y1={y(7.9)} />
                  <Line y={y(-0.15)} w={1.6} color={YELLOW} />
                  <Line y={y(0.15)} w={1.6} color={YELLOW} />
                  <rect x={228} y={y(-4.6)} width={9} height={(1.1) * (110 / 22)} fill={WHITE} />
                  <polygon points={`220,${y(-3.2)} 232,${y(-2.6)} 220,${y(-2.0)}`} fill={WHITE} />
                </g>
              )}
            </Top>
          ),
          name: "Aspal junction 4 arah + trotoar + curb return",
        },
        {
          id: "zebra",
          name: "Zebra cross — strip putih 0.46 m tiap 0.82 m, pita 2.2 m",
          visual: (
            <Top from={-1.4} to={1.4} h={84} bands={[{ lat0: -1.4, lat1: 1.4, color: CROSS_ASPHALT }]}>
              {(y) => <Zebra y0={y(-1.15)} y1={y(1.15)} period={30} seg={16} />}
            </Top>
          ),
        },
        {
          id: "stopline",
          name: "Stop line sebelum zebra — 1 garis per lajur (Jepang kiri)",
          visual: (
            <Top from={-5} to={5} h={84} bands={[{ lat0: -5, lat1: 5, color: CROSS_ASPHALT }]}>
              {(y) => (
                <g>
                  <rect x={150} y={y(-4.1)} width={26} height={y(-0.9) - y(-4.1)} fill={WHITE} />
                  <text x={96} y={y(-2.5)} fontSize={11} fontFamily="monospace" fill={WHITE} opacity={0.8}>◀ jalur</text>
                  <rect x={150} y={y(0.9)} width={26} height={y(4.1) - y(0.9)} fill={WHITE} opacity={0.35} />
                  <text x={60} y={y(2.6)} fontSize={11} fontFamily="monospace" fill={WHITE} opacity={0.4}>bukan lajur ini</text>
                </g>
              )}
            </Top>
          ),
        },
        {
          id: "tactile",
          name: "Paving taktil kuning — pad 0.54 m @0.232 m di curb return",
          visual: (
            <Front ground={CURB}>
              <g>
                <rect x={20} y={60} width={220} height={32} fill={CURB} />
                <rect x={92} y={44} width={76} height={76} fill={YELLOW} />
                {Array.from({ length: 4 }, (_, r) =>
                  Array.from({ length: 4 }, (_, c) => <circle key={`${r}-${c}`} cx={104 + c * 18} cy={54 + r * 14} r={3.4} fill="#c97c05" opacity={0.9} />)
                )}
              </g>
            </Front>
          ),
        },
        {
          id: "arrow",
          name: "Panah arah lajur (white arrow) di cross-street",
          visual: (
            <Top from={-2} to={2} h={64} bands={[{ lat0: -2, lat1: 2, color: CROSS_ASPHALT }]}>
              {(y) => (
                <g fill={WHITE}>
                  <rect x={118} y={y(-0.11)} width={34} height={2.2 * (64 / 4) * 0.16 + 2.4} rx={1} />
                  <polygon points={`110,${y(0)} ${124},${y(-0.55)} 124,${y(0.55)}`} />
                </g>
              )}
            </Top>
          ),
        },
      ],
    },
    {
      group: "PEMEREN JALAN & REL (ground.ts railing + models.ts railParts)",
      entries: [
        {
          id: "pipe-fence",
          name: 'Pagar pipa putih anti-menyeberang (横断防止柵) + reflektor amber',
          visual: (
            <Front ground={WALK}>
              <g>
                {Array.from({ length: 6 }, (_, k) => (
                  <rect key={k} x={16 + k * 46} y={26} width={9} height={72} fill="#f1f5f9" />
                ))}
                <rect x={8} y={30} width={244} height={7} rx={3.5} fill="#f8fafd" />
                <rect x={8} y={34.5} width={244} height={2.5} fill="#cbd5e1" opacity={0.8} />
                <rect x={8} y={58} width={244} height={6} rx={3} fill="#e2e8f2" />
                {Array.from({ length: 6 }, (_, k) => (
                  <rect key={`r${k}`} x={17.5 + k * 46} y={46} width={6} height={8} rx={2} fill={YELLOW} stroke="#b45309" strokeWidth={0.8} />
                ))}
              </g>
            </Front>
          ),
        },
        {
          id: "wbeam",
          name: "Guardrail W-Beam Touge — gelombang ganda + reflektor merah",
          visual: (
            <Front ground={HRN_GRAVEL1}>
              <g>
                {Array.from({ length: 6 }, (_, k) => (
                  <rect key={k} x={20 + k * 46} y={40} width={7} height={58} fill="#64748b" />
                ))}
                <rect x={6} y={34} width={248} height={11} rx={2} fill="#dce3ec" />
                <rect x={6} y={45} width={248} height={9} rx={2} fill="#94a3b8" />
                <rect x={6} y={42} width={248} height={3.5} fill="#eef2f8" opacity={0.9} />
                {Array.from({ length: 6 }, (_, k) => (
                  <circle key={`r${k}`} cx={23.5 + k * 46} cy={40} r={4} fill="#ef4444" />
                ))}
              </g>
            </Front>
          ),
        },
        {
          id: "grind",
          name: "Grind rail skateboard — pipa baja 0.14 m + post & base",
          visual: (
            <Front ground={STREET}>
              <g>
                <rect x={40} y={70} width={180} height={10} fill="#6e747c" rx={2} />
                <rect x={58} y={44} width={9} height={34} fill="#8d949c" />
                <rect x={192} y={44} width={9} height={34} fill="#8d949c" />
                <rect x={30} y={36} width={200} height={9} rx={4.5} fill="#dfe3e8" />
                <rect x={30} y={36} width={200} height={3} rx={1.5} fill="#ffffff" opacity={0.85} />
              </g>
            </Front>
          ),
        },
        {
          id: "gutter",
          name: "Got/gutter beton Touge — lat ±3.75..4.1 m, tinggi 0.12",
          visual: (
            <Front ground={HRN_ASPHALT}>
              <g>
                <rect x={70} y={64} width={120} height={26} fill={HRN_GUTTER} />
                <rect x={70} y={64} width={120} height={4} fill="#aeb6c2" />
                <rect x={94} y={68} width={72} height={22} fill="#4a5160" opacity={0.85} />
              </g>
            </Front>
          ),
        },
      ],
    },
  ];
}

/* ---------- panel ---------- */

export function RoadDictPanel({ onClose }: { onClose: () => void }): JSX.Element {
  const groups = buildRoadDict();
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#0e1018]/92 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mx-auto flex h-full w-full max-w-[560px] flex-col p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 pb-2">
          <h2 className="font-display text-[15px] tracking-wide text-[#ffd21f] drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]">
            📖 KAMUS ASET JALAN
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[38px] rounded-xl bg-[#1f2430] px-3 font-display text-[12px] text-white ring-2 ring-white/20 active:translate-y-[2px]"
          >
            TUTUP ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-2xl bg-[#151823]/80 p-2 ring-1 ring-white/10">
          {groups.map((g) => (
            <section key={g.group} className="mb-3">
              <h3 className="sticky top-0 z-10 my-1 rounded-lg bg-[#39c1ea] px-2 py-1 font-display text-[10px] leading-tight text-[#083040] shadow">
                {g.group.toUpperCase()}
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {g.entries.map((en) => (
                  <figure key={en.id} className="overflow-hidden rounded-xl bg-white shadow-[0_3px_0_rgba(0,0,0,0.25)]">
                    <div className="bg-[#dfe6f2]">{en.visual}</div>
                    <figcaption className="px-2 py-1.5 font-body text-[11px] font-extrabold leading-snug" style={{ color: STR }}>
                      {en.name}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          ))}
          <p className="px-1 pb-2 text-center font-body text-[10px] text-white/45">
            Warna &amp; dimensi ditular dari ground.ts / models.ts — kamus = spesifikasi asli aset di game.
          </p>
        </div>
      </div>
    </div>
  );
}
