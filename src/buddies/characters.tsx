import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ---------- Voxel box helper ---------- */
type BProps = {
  p: [number, number, number];
  s: [number, number, number];
  c: string;
  r?: [number, number, number];
};

export function B({ p, s, c, r = [0, 0, 0] }: BProps) {
  return (
    <mesh position={p} rotation={r} castShadow receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} roughness={0.85} flatShading />
    </mesh>
  );
}

/* render mirrored pair on x axis */
function Pair({
  x,
  p,
  s,
  c,
}: {
  x: number;
  p: [number, number, number];
  s: [number, number, number];
  c: string;
}) {
  return (
    <>
      <B p={[x, p[1], p[2]]} s={s} c={c} />
      <B p={[-x, p[1], p[2]]} s={s} c={c} />
    </>
  );
}

/* ================= BEBEK KUNING (gaya Crossy Road) ================= */
export function Duck() {
  const yellow = "#FFD83D";
  const wing = "#Eec01f";
  const orange = "#F58220";
  const bill = "#FFC21E";
  return (
    <group>
      {/* kaki oranye pendek */}
      <Pair x={0.5} p={[0, 0.45, 0.1]} s={[0.4, 0.9, 0.4]} c={orange} />
      <Pair x={0.5} p={[0, 0.14, 0.4]} s={[0.7, 0.28, 1.0]} c={orange} />
      {/* badan kotak kecil */}
      <B p={[0, 1.7, -0.1]} s={[2.0, 1.7, 2.4]} c={yellow} />
      {/* sayap kotak menonjol keluar di sisi belakang */}
      <Pair x={1.15} p={[0, 1.85, -0.55]} s={[0.5, 0.9, 1.5]} c={wing} />
      <B p={[0, 1.95, -1.45]} s={[1.6, 0.8, 0.5]} c={wing} />
      {/* KEPALA seukuran kepala ayam (menyatu dengan badan) */}
      <B p={[0, 3.3, 0.2]} s={[1.7, 1.8, 1.7]} c={yellow} />
      {/* patch mata putih di sisi kepala */}
      <Pair x={0.8} p={[0, 3.4, 0.45]} s={[0.24, 0.85, 0.85]} c="#ffffff" />
      {/* pupil hitam kotak di tengah patch */}
      <Pair x={0.94} p={[0, 3.4, 0.45]} s={[0.1, 0.35, 0.35]} c="#1d1d1f" />
      {/* paruh pipih menonjol di depan */}
      <B p={[0, 3.1, 1.35]} s={[0.85, 0.5, 0.8]} c={bill} />
    </group>
  );
}

/* ================= AYAM JAGO PUTIH (struktur gaya bebek) ================= */
export function Chicken() {
  const white = "#F7F7F2";
  const wing = "#E3E3DA";
  const red = "#E8352C";
  const orange = "#FF9516";
  return (
    <group>
      {/* kaki oranye pendek */}
      <Pair x={0.5} p={[0, 0.45, 0.1]} s={[0.4, 0.9, 0.4]} c={orange} />
      <Pair x={0.5} p={[0, 0.14, 0.4]} s={[0.7, 0.28, 1.0]} c={orange} />
      {/* badan kotak kecil */}
      <B p={[0, 1.7, -0.1]} s={[2.0, 1.7, 2.4]} c={white} />
      {/* sayap kotak menonjol keluar di sisi belakang */}
      <Pair x={1.15} p={[0, 1.85, -0.55]} s={[0.5, 0.9, 1.5]} c={wing} />
      {/* ekor jago naik di belakang */}
      <B p={[0, 2.35, -1.45]} s={[1.0, 1.0, 0.55]} c={wing} />
      <B p={[0, 3.0, -1.6]} s={[0.6, 0.7, 0.45]} c={white} />
      {/* KEPALA (menyatu dengan badan) */}
      <B p={[0, 3.3, 0.2]} s={[1.7, 1.8, 1.7]} c={white} />
      {/* patch mata putih abu di sisi kepala */}
      <Pair x={0.8} p={[0, 3.4, 0.45]} s={[0.24, 0.85, 0.85]} c="#ffffff" />
      {/* pupil hitam kotak di tengah patch */}
      <Pair x={0.94} p={[0, 3.4, 0.45]} s={[0.1, 0.35, 0.35]} c="#1d1d1f" />
      {/* jengger merah di atas kepala */}
      <B p={[0, 4.4, 0.25]} s={[0.55, 0.55, 1.2]} c={red} />
      <B p={[0, 4.75, 0.05]} s={[0.45, 0.4, 0.5]} c={red} />
      {/* paruh pipih menonjol di depan */}
      <B p={[0, 3.3, 1.35]} s={[0.75, 0.5, 0.8]} c={orange} />
      {/* pial merah menggantung di bawah paruh */}
      <B p={[0, 2.8, 1.3]} s={[0.45, 0.6, 0.45]} c={red} />
    </group>
  );
}

/* ================= PIGEON (merpati kota) ================= */
export function Pigeon() {
  const white = "#F2EEEA";
  const grey = "#C9C4BE";
  const greyD = "#A8A29B";
  const dark = "#6E6862";
  const teal = "#6BC4B4";
  const pink = "#F08A8A";
  const pinkD = "#E8A0A8";
  return (
    <group>
      {/* kaki pink pendek */}
      <Pair x={0.5} p={[0, 0.4, 0.1]} s={[0.38, 0.8, 0.38]} c={pinkD} />
      <Pair x={0.5} p={[0, 0.13, 0.38]} s={[0.65, 0.26, 0.9]} c={pinkD} />
      {/* BADAN abu-abu kotak besar */}
      <B p={[0, 1.85, -0.2]} s={[2.2, 2.0, 2.7]} c={grey} />
      {/* gradasi bawah badan lebih gelap */}
      <B p={[0, 1.05, -0.2]} s={[2.22, 0.5, 2.72]} c={greyD} />
      {/* sayap di sisi: patch teal + ujung gelap bertingkat */}
      <Pair x={1.15} p={[0, 2.1, -0.5]} s={[0.26, 1.1, 1.3]} c={grey} />
      <Pair x={1.18} p={[0, 2.15, -0.75]} s={[0.26, 0.75, 0.6]} c={teal} />
      <Pair x={1.15} p={[0, 2.0, -1.45]} s={[0.26, 0.9, 0.5]} c={dark} />
      <Pair x={1.0} p={[0, 2.3, -1.7]} s={[0.26, 0.55, 0.45]} c={dark} />
      {/* ekor abu gelap ke belakang */}
      <B p={[0, 1.7, -1.75]} s={[1.3, 0.7, 0.7]} c={greyD} />
      {/* LEHER teal (cincin antara badan & kepala) */}
      <B p={[0, 3.1, 0.45]} s={[1.5, 0.75, 1.5]} c={teal} />
      {/* KEPALA putih kotak */}
      <B p={[0, 4.15, 0.45]} s={[1.45, 1.6, 1.45]} c={white} />
      {/* patch mata putih di sisi kepala (100% gaya mallard) */}
      <Pair x={0.68} p={[0, 4.2, 0.65]} s={[0.24, 0.85, 0.85]} c="#ffffff" />
      {/* pupil hitam kotak di tengah patch */}
      <Pair x={0.82} p={[0, 4.2, 0.65]} s={[0.1, 0.35, 0.35]} c="#1d1d1f" />
      {/* paruh pink 2 tingkat menonjol di depan */}
      <B p={[0, 4.1, 1.5]} s={[0.75, 0.45, 0.95]} c={pink} />
      <B p={[0, 3.82, 1.3]} s={[0.5, 0.22, 0.5]} c={pink} />
    </group>
  );
}

/* ================= SHIBA INU (berdiri) ================= */
export function Shiba() {
  const tan = "#E89A3C";
  const cream = "#FBF0DC";
  return (
    <group>
      {/* kaki pendek bayi + telapak */}
      <Pair x={0.46} p={[0, 0.42, 0]} s={[0.56, 0.84, 0.62]} c={tan} />
      <Pair x={0.46} p={[0, 0.14, 0.2]} s={[0.58, 0.28, 0.85]} c={cream} />
      {/* badan mungil */}
      <B p={[0, 1.55, 0]} s={[1.8, 1.8, 1.5]} c={tan} />
      {/* belly patch */}
      <B p={[0, 1.45, 0.76]} s={[1.2, 1.25, 0.12]} c={cream} />
      {/* lengan pendek */}
      <Pair x={1.05} p={[0, 1.7, 0.1]} s={[0.44, 1.0, 0.52]} c={tan} />
      <Pair x={1.05} p={[0, 1.15, 0.16]} s={[0.46, 0.3, 0.56]} c={cream} />
      {/* kepala ekstra besar bayi (menyatu dengan badan) */}
      <B p={[0, 3.3, 0.1]} s={[2.5, 2.0, 2.15]} c={tan} />
      {/* moncong gembul */}
      <B p={[0, 2.85, 1.3]} s={[1.15, 0.85, 0.5]} c={cream} />
      <B p={[0, 3.1, 1.58]} s={[0.4, 0.3, 0.2]} c="#2b2420" />
      {/* mata bayi besar berbinar + alis khas shiba */}
      <Pair x={0.66} p={[0, 3.6, 1.22]} s={[0.46, 0.55, 0.12]} c="#2b2420" />
      <Pair x={0.55} p={[0, 3.77, 1.29]} s={[0.15, 0.15, 0.06]} c="#ffffff" />
      <Pair x={0.66} p={[0, 4.07, 1.22]} s={[0.3, 0.16, 0.1]} c={cream} />
      {/* cheeks cream */}
      <Pair x={1.28} p={[0, 3.15, 1.0]} s={[0.12, 0.5, 0.5]} c={cream} />
      {/* pipi merona pink */}
      <Pair x={1.0} p={[0, 3.1, 1.22]} s={[0.3, 0.24, 0.08]} c="#F4A4B0" />
      {/* telinga */}
      <Pair x={0.85} p={[0, 4.6, 0.05]} s={[0.6, 0.75, 0.52]} c={tan} />
      <Pair x={0.85} p={[0, 4.6, 0.32]} s={[0.36, 0.45, 0.1]} c={cream} />
      {/* ekor cinnamon roll: satu gumpalan bulat nempel pantat + ujung krem */}
      <B p={[0, 1.85, -0.95]} s={[0.95, 0.95, 0.8]} c={tan} />
      <B p={[0, 2.25, -0.85]} s={[0.6, 0.45, 0.6]} c={cream} />
    </group>
  );
}

/* ================= PENGUIN ================= */
export function Penguin() {
  const black = "#23242B";
  const white = "#F2F2F0";
  const yellow = "#F5A91E";
  return (
    <group>
      {/* telapak kaki kuning kecil */}
      <Pair x={0.5} p={[0, 0.11, 0.3]} s={[0.55, 0.22, 0.7]} c={yellow} />
      {/* kaki kuning pendek (overlap dalam ke badan) */}
      <Pair x={0.5} p={[0, 0.4, 0.08]} s={[0.42, 0.65, 0.42]} c={yellow} />
      {/* BADAN putih pendek (depan) */}
      <B p={[0, 1.2, 0.25]} s={[2.1, 1.55, 1.55]} c={white} />
      {/* punggung hitam di belakang badan */}
      <B p={[0, 1.25, -0.75]} s={[2.1, 1.65, 0.85]} c={black} />
      {/* sayap/ekor hitam bertingkat di belakang (overlap dalam) */}
      <B p={[0, 1.05, -1.25]} s={[1.6, 1.1, 0.75]} c={black} />
      <B p={[0, 0.6, -1.65]} s={[1.3, 0.85, 0.7]} c={black} />
      {/* tangan/sirip khas penguin (overlap dalam ke badan) */}
      <B p={[1.15, 1.25, 0.1]} s={[0.5, 1.25, 1.0]} c={black} r={[0, 0, -0.12]} />
      <B p={[-1.15, 1.25, 0.1]} s={[0.5, 1.25, 1.0]} c={black} r={[0, 0, 0.12]} />
      {/* KEPALA hitam seukuran kepala ayam (overlap dalam ke badan) */}
      <B p={[0, 2.7, 0.1]} s={[1.7, 1.8, 1.7]} c={black} />
      {/* patch mata putih di sisi kepala */}
      <Pair x={0.8} p={[0, 2.75, 0.35]} s={[0.3, 0.85, 0.85]} c={white} />
      {/* mata hitam menonjol keluar dari patch */}
      <Pair x={0.98} p={[0, 2.7, 0.35]} s={[0.3, 0.45, 0.45]} c={black} />
      {/* highlight putih kecil rapi di pojok atas-depan pupil */}
      <Pair x={1.16} p={[0, 2.82, 0.46]} s={[0.12, 0.18, 0.18]} c={white} />
      {/* paruh kuning menonjol di depan */}
      <B p={[0, 2.45, 1.1]} s={[0.7, 0.4, 0.7]} c={yellow} />
    </group>
  );
}

/* ================= PANDA ================= */
export function Panda() {
  const white = "#F6F4EE";
  const black = "#2A2A30";
  return (
    <group>
      {/* legs */}
      <Pair x={0.52} p={[0, 0.55, 0]} s={[0.75, 1.1, 0.85]} c={black} />
      {/* body */}
      <B p={[0, 2.1, 0]} s={[2.35, 2.1, 1.85]} c={white} />
      {/* shoulder band */}
      <B p={[0, 2.92, 0]} s={[2.37, 0.55, 1.87]} c={black} />
      {/* arms */}
      <Pair x={1.33} p={[0, 2.35, 0.15]} s={[0.52, 1.4, 0.72]} c={black} />
      {/* head (menyatu dengan badan) */}
      <B p={[0, 3.9, 0.1]} s={[2.45, 1.95, 2.05]} c={white} />
      {/* ears */}
      <Pair x={0.95} p={[0, 5.05, 0.05]} s={[0.62, 0.62, 0.52]} c={black} />
      {/* eye patches + eyes */}
      <Pair x={0.62} p={[0, 4.07, 1.14]} s={[0.62, 0.74, 0.12]} c={black} />
      <Pair x={0.56} p={[0, 4.13, 1.22]} s={[0.2, 0.26, 0.06]} c={white} />
      {/* nose + mouth */}
      <B p={[0, 3.57, 1.16]} s={[0.42, 0.32, 0.12]} c={black} />
      <B p={[0, 3.3, 1.14]} s={[0.16, 0.3, 0.08]} c={black} />
      {/* tail */}
      <B p={[0, 1.4, -1.0]} s={[0.7, 0.7, 0.4]} c={black} />
    </group>
  );
}

/* ================= DINO HIJAU ================= */
export function Dino() {
  const green = "#53C14E";
  const lite = "#B4E8A5";
  const dark = "#2F8F3C";
  return (
    <group>
      {/* legs */}
      <Pair x={0.52} p={[0, 0.55, 0.1]} s={[0.65, 1.1, 0.75]} c={green} />
      {/* body */}
      <B p={[0, 2.35, 0]} s={[1.95, 2.5, 1.6]} c={green} />
      {/* belly */}
      <B p={[0, 2.2, 0.81]} s={[1.3, 1.8, 0.12]} c={lite} />
      {/* tail */}
      <B p={[0, 1.55, -1.3]} s={[1.05, 1.05, 1.4]} c={green} />
      <B p={[0, 1.4, -2.25]} s={[0.65, 0.65, 0.9]} c={green} />
      {/* tiny arms */}
      <Pair x={1.07} p={[0, 2.95, 0.45]} s={[0.36, 0.85, 0.42]} c={green} />
      {/* head with long snout (menyatu dengan badan) */}
      <B p={[0, 4.1, 0.45]} s={[1.9, 1.75, 2.4]} c={green} />
      {/* nostrils */}
      <Pair x={0.38} p={[0, 4.1, 1.68]} s={[0.16, 0.16, 0.1]} c={dark} />
      {/* mata gaya penguin: patch putih tebal di sisi + pupil hitam menonjol */}
      <Pair x={0.9} p={[0, 4.45, 0.65]} s={[0.26, 0.8, 0.8]} c="#ffffff" />
      <Pair x={1.08} p={[0, 4.45, 0.65]} s={[0.12, 0.34, 0.34]} c="#1d1d1f" />
      {/* rosy cheeks */}
      <Pair x={0.97} p={[0, 3.9, 0.9]} s={[0.1, 0.28, 0.34]} c="#F4A4B0" />
      {/* back spikes */}
      <B p={[0, 5.2, 0.1]} s={[0.42, 0.55, 0.65]} c={dark} />
      <B p={[0, 3.85, -0.95]} s={[0.42, 0.6, 0.6]} c={dark} />
      <B p={[0, 2.75, -1.1]} s={[0.42, 0.55, 0.55]} c={dark} />
      <B p={[0, 2.2, -1.75]} s={[0.38, 0.5, 0.5]} c={dark} />
    </group>
  );
}

/* ================= KATAK HIJAU ================= */
export function Frog() {
  const green = "#5FBF4A";
  const dark = "#45A338";
  const lite = "#C9EFA9";
  return (
    <group>
      {/* back haunches */}
      <Pair x={1.42} p={[0, 0.75, -0.45]} s={[0.65, 1.3, 1.45]} c={dark} />
      <Pair x={1.42} p={[0, 0.16, 0.3]} s={[0.68, 0.32, 1.1]} c={dark} />
      {/* front legs */}
      <Pair x={0.85} p={[0, 0.5, 0.95]} s={[0.5, 1.0, 0.5]} c={green} />
      <Pair x={0.85} p={[0, 0.16, 1.2]} s={[0.62, 0.32, 0.85]} c={green} />
      {/* body */}
      <B p={[0, 1.55, 0]} s={[2.65, 1.85, 2.45]} c={green} />
      {/* belly */}
      <B p={[0, 1.3, 1.23]} s={[1.9, 1.1, 0.12]} c={lite} />
      {/* mouth */}
      <B p={[0, 1.78, 1.24]} s={[1.3, 0.12, 0.08]} c="#2e5c22" />
      {/* cheeks */}
      <Pair x={1.05} p={[0, 1.5, 1.24]} s={[0.36, 0.26, 0.08]} c="#F4A4B0" />
      {/* eye bumps */}
      <Pair x={0.82} p={[0, 2.85, 0.55]} s={[0.85, 0.85, 0.85]} c={green} />
      <Pair x={0.82} p={[0, 2.85, 1.0]} s={[0.55, 0.55, 0.14]} c="#ffffff" />
      <Pair x={0.78} p={[0, 2.82, 1.1]} s={[0.26, 0.32, 0.08]} c="#1d1d1f" />
      {/* nostrils */}
      <Pair x={0.3} p={[0, 2.25, 1.24]} s={[0.12, 0.12, 0.08]} c="#2e5c22" />
    </group>
  );
}

/* ================= BAYI KURA-KURA (berdiri) ================= */
export function BabyTurtle() {
  const skin = "#8FD977";
  const skinD = "#6FBF5C";
  const shell = "#4E9E4A";
  const shellD = "#3A7D38";
  const cream = "#F5EFC9";
  return (
    <group>
      {/* kaki pendek gemuk + telapak */}
      <Pair x={0.52} p={[0, 0.5, 0.05]} s={[0.62, 1.0, 0.68]} c={skin} />
      <Pair x={0.52} p={[0, 0.16, 0.28]} s={[0.66, 0.32, 0.92]} c={skinD} />
      {/* badan */}
      <B p={[0, 1.95, 0.15]} s={[1.85, 2.0, 1.35]} c={skin} />
      {/* perut plastron krem */}
      <B p={[0, 1.85, 0.84]} s={[1.35, 1.6, 0.14]} c={cream} />
      <B p={[0, 1.85, 0.92]} s={[1.0, 0.1, 0.06]} c="#E0D5A8" />
      <B p={[0, 2.25, 0.92]} s={[1.0, 0.1, 0.06]} c="#E0D5A8" />
      {/* tempurung di punggung */}
      <B p={[0, 2.15, -0.75]} s={[2.25, 2.3, 0.95]} c={shell} />
      <B p={[0, 2.15, -1.3]} s={[1.6, 1.7, 0.4]} c={shellD} />
      {/* pola kotak tempurung */}
      <B p={[0, 2.6, -1.52]} s={[0.55, 0.55, 0.08]} c={shell} />
      <B p={[0, 1.7, -1.52]} s={[0.55, 0.55, 0.08]} c={shell} />
      <Pair x={0.62} p={[0, 2.15, -1.52]} s={[0.5, 0.5, 0.08]} c={shell} />
      {/* lengan pendek */}
      <Pair x={1.12} p={[0, 2.15, 0.25]} s={[0.44, 1.15, 0.52]} c={skin} />
      <Pair x={1.12} p={[0, 1.52, 0.3]} s={[0.46, 0.32, 0.56]} c={skinD} />
      {/* kepala besar bayi (menyatu dengan badan) */}
      <B p={[0, 3.75, 0.3]} s={[2.0, 1.8, 1.75]} c={skin} />
      {/* mata besar berbinar */}
      <Pair x={0.55} p={[0, 3.95, 1.12]} s={[0.56, 0.68, 0.12]} c="#ffffff" />
      <Pair x={0.52} p={[0, 3.92, 1.2]} s={[0.32, 0.42, 0.07]} c="#1d1d1f" />
      <Pair x={0.44} p={[0, 4.08, 1.25]} s={[0.12, 0.12, 0.04]} c="#ffffff" />
      {/* pipi merona */}
      <Pair x={0.98} p={[0, 3.5, 1.12]} s={[0.32, 0.26, 0.08]} c="#F4A4B0" />
      {/* mulut senyum kecil */}
      <B p={[0, 3.4, 1.19]} s={[0.4, 0.1, 0.06]} c="#3E7D3A" />
      {/* ubun-ubun hijau tua kecil */}
      <B p={[0, 4.68, 0.1]} s={[0.8, 0.2, 0.8]} c={skinD} />
      {/* ekor mungil */}
      <B p={[0, 0.85, -1.1]} s={[0.4, 0.4, 0.45]} c={skin} />
    </group>
  );
}

/* ================= MANEKI NEKO (kucing toko putih) ================= */
export function ManekiNeko() {
  const white = "#F8F6F0";
  const pink = "#F2A0B5";
  const red = "#D6362B";
  const gold = "#F2C230";
  const goldD = "#C99B1E";
  const brown = "#C4763A";
  return (
    <group>
      {/* kaki berdiri + telapak */}
      <Pair x={0.5} p={[0, 0.5, 0]} s={[0.62, 1.0, 0.68]} c={white} />
      <Pair x={0.5} p={[0, 0.16, 0.22]} s={[0.66, 0.32, 0.9]} c={white} />
      {/* badan */}
      <B p={[0, 1.95, 0]} s={[2.1, 2.0, 1.7]} c={white} />
      {/* koin emas di perut */}
      <B p={[0, 1.8, 0.88]} s={[1.05, 1.05, 0.2]} c={gold} />
      <B p={[0, 1.8, 0.99]} s={[0.6, 0.6, 0.06]} c={goldD} />
      {/* kalung merah + lonceng emas */}
      <B p={[0, 2.85, 0]} s={[2.14, 0.4, 1.74]} c={red} />
      <B p={[0, 2.55, 0.88]} s={[0.42, 0.42, 0.28]} c={gold} />
      {/* kepala besar cute (menyatu dengan badan) */}
      <B p={[0, 4.0, 0.05]} s={[2.4, 1.9, 1.95]} c={white} />
      {/* tangan turun di samping badan (pose berdiri) */}
      <Pair x={1.3} p={[0, 1.95, 0.15]} s={[0.55, 1.4, 0.6]} c={white} />
      {/* telapak bawah dengan bantalan pink menghadap depan */}
      <Pair x={1.3} p={[0, 1.2, 0.2]} s={[0.58, 0.5, 0.62]} c={white} />
      <Pair x={1.3} p={[0, 1.22, 0.54]} s={[0.36, 0.36, 0.08]} c={pink} />
      {/* telinga segitiga + dalam pink */}
      <Pair x={0.85} p={[0, 5.2, 0.0]} s={[0.6, 0.65, 0.45]} c={white} />
      <Pair x={0.85} p={[0, 5.2, 0.24]} s={[0.34, 0.36, 0.1]} c={pink} />
      {/* mata besar berbinar cute */}
      <Pair x={0.58} p={[0, 4.25, 1.06]} s={[0.42, 0.5, 0.14]} c="#1d1d1f" />
      <Pair x={0.48} p={[0, 4.4, 1.16]} s={[0.14, 0.14, 0.07]} c="#ffffff" />
      {/* hidung pink kecil */}
      <B p={[0, 3.85, 1.08]} s={[0.28, 0.2, 0.14]} c={pink} />
      {/* bercak calico di kepala */}
      <B p={[0.6, 4.88, 0.1]} s={[0.8, 0.25, 1.0]} c={brown} />
      <B p={[-0.7, 4.86, -0.3]} s={[0.6, 0.22, 0.7]} c="#2e2b28" />
      {/* ekor melingkar kecil nempel punggung */}
      <B p={[0, 1.5, -0.95]} s={[0.6, 0.6, 0.55]} c={white} />
      <B p={[0, 2.05, -1.05]} s={[0.5, 0.5, 0.45]} c={brown} />
    </group>
  );
}

/* ================= TANUKI ================= */
export function Tanuki() {
  const brown = "#8C6239";
  const dark = "#4A3324";
  const cream = "#F2E3C8";
  return (
    <group>
      {/* legs + paws */}
      <Pair x={0.5} p={[0, 0.55, 0]} s={[0.62, 1.1, 0.68]} c={brown} />
      <Pair x={0.5} p={[0, 0.16, 0.22]} s={[0.64, 0.32, 0.9]} c={dark} />
      {/* body */}
      <B p={[0, 2.25, 0]} s={[2.15, 2.3, 1.7]} c={brown} />
      {/* big round belly */}
      <B p={[0, 2.0, 0.86]} s={[1.55, 1.7, 0.14]} c={cream} />
      {/* arms */}
      <Pair x={1.25} p={[0, 2.5, 0.1]} s={[0.48, 1.35, 0.58]} c={brown} />
      <Pair x={1.25} p={[0, 1.78, 0.16]} s={[0.5, 0.34, 0.62]} c={dark} />
      {/* head (menyatu dengan badan) */}
      <B p={[0, 3.9, 0.1]} s={[2.25, 1.8, 1.9]} c={brown} />
      {/* face mask (bandit eyes) */}
      <Pair x={0.6} p={[0, 4.05, 1.06]} s={[0.78, 0.6, 0.12]} c={dark} />
      <Pair x={0.56} p={[0, 4.08, 1.14]} s={[0.22, 0.26, 0.06]} c="#ffffff" />
      {/* muzzle */}
      <B p={[0, 3.5, 1.12]} s={[1.0, 0.7, 0.35]} c={cream} />
      <B p={[0, 3.7, 1.34]} s={[0.36, 0.28, 0.18]} c={dark} />
      {/* ears */}
      <Pair x={0.85} p={[0, 5.05, 0.0]} s={[0.55, 0.6, 0.45]} c={brown} />
      <Pair x={0.85} p={[0, 5.05, 0.24]} s={[0.3, 0.32, 0.1]} c={dark} />
      {/* striped tail */}
      <B p={[0, 2.3, -1.25]} s={[0.85, 0.85, 0.9]} c={brown} />
      <B p={[0, 2.95, -1.55]} s={[0.75, 0.6, 0.75]} c={dark} />
      <B p={[0, 3.5, -1.55]} s={[0.65, 0.5, 0.65]} c={brown} />
      {/* topi kasa petani Jepang (kerucut jerami bertingkat) */}
      <B p={[0, 4.95, 0.1]} s={[3.1, 0.22, 2.7]} c="#D9B86A" />
      <B p={[0, 5.15, 0.1]} s={[2.3, 0.25, 2.0]} c="#C9A552" />
      <B p={[0, 5.38, 0.1]} s={[1.5, 0.28, 1.3]} c="#D9B86A" />
      <B p={[0, 5.6, 0.1]} s={[0.75, 0.3, 0.65]} c="#C9A552" />
      {/* tali topi merah di dagu */}
      <Pair x={1.14} p={[0, 4.4, 0.8]} s={[0.1, 1.0, 0.1]} c="#C0392B" />
    </group>
  );
}

/* ================= SAPU TERBANG ================= */
export function Broom() {
  const wood = "#A9743F";
  const woodDark = "#7E5429";
  const straw = "#E8C25A";
  const strawD = "#C99B33";
  const gold = "#F5D042";
  const sparkleRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (sparkleRef.current) {
      sparkleRef.current.position.y = Math.sin(t * 5) * 0.05;
    }
  });

  return (
    <group position={[0, 2.6, 0]}>
      {/* Sedikit mendongak ke depan: gagang naik (+Z, +Y), ijuk turun (-Z, -Y) */}
      <group rotation={[-0.18, 0, 0]}>
        {/* handle */}
        <B p={[0, 0, 1.4]} s={[0.4, 0.4, 4.2]} c={wood} />
        <B p={[0, 0, 3.6]} s={[0.55, 0.55, 0.5]} c={woodDark} />
        {/* grip rings */}
        <B p={[0, 0, 2.5]} s={[0.5, 0.5, 0.25]} c={gold} />
        {/* binding */}
        <B p={[0, 0, -0.7]} s={[0.8, 0.8, 0.5]} c={woodDark} />
        <B p={[0, 0, -1.0]} s={[1.0, 1.0, 0.25]} c={gold} />
        {/* straw bristles (layered pyramid) */}
        <B p={[0, 0, -1.5]} s={[1.3, 1.3, 0.8]} c={straw} />
        <B p={[0, 0, -2.2]} s={[1.65, 1.65, 0.7]} c={strawD} />
        <B p={[0, 0, -2.85]} s={[1.9, 1.9, 0.65]} c={straw} />
        {/* bristle tips (split ends) */}
        <Pair x={0.6} p={[0, 0, -3.4]} s={[0.5, 0.5, 0.5]} c={strawD} />
        <B p={[0, 0.6, -3.4]} s={[0.5, 0.5, 0.5]} c={strawD} />
        <B p={[0, -0.6, -3.4]} s={[0.5, 0.5, 0.5]} c={strawD} />
        <B p={[0, 0, -3.5]} s={[0.45, 0.45, 0.45]} c={straw} />
        {/* little magic sparkles */}
        <group ref={sparkleRef}>
          <mesh position={[1.4, 0.9, -3.9]}>
            <boxGeometry args={[0.22, 0.22, 0.22]} />
            <meshStandardMaterial color="#FFF3B0" emissive="#FFE066" emissiveIntensity={0.9} />
          </mesh>
          <mesh position={[-1.2, -0.6, -4.2]}>
            <boxGeometry args={[0.18, 0.18, 0.18]} />
            <meshStandardMaterial color="#FFF3B0" emissive="#FFE066" emissiveIntensity={0.9} />
          </mesh>
          <mesh position={[0.8, -1.1, -4.0]}>
            <boxGeometry args={[0.15, 0.15, 0.15]} />
            <meshStandardMaterial color="#FFE066" emissive="#FFD700" emissiveIntensity={0.9} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* ================= UFO MINI ================= */
export function Ufo() {
  const silver = "#B9C4CE";
  const silverD = "#8D99A6";
  const dome = "#7FDBFF";
  const glow = "#B4F04A";
  const beamRef = useRef<THREE.Group>(null);
  const lightsRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (beamRef.current) {
      beamRef.current.scale.y = 1 + Math.sin(t * 5) * 0.12;
    }
    if (lightsRef.current) {
      lightsRef.current.rotation.y += 0.02;
    }
  });

  return (
    <group position={[0, 2.3, 0]}>
      {/* saucer body (stacked discs) */}
      <B p={[0, 0, 0]} s={[4.0, 0.55, 4.0]} c={silver} />
      <B p={[0, 0.35, 0]} s={[3.0, 0.5, 3.0]} c={silverD} />
      <B p={[0, -0.35, 0]} s={[2.9, 0.45, 2.9]} c={silverD} />
      {/* glass dome in front cockpit */}
      <group position={[0, 0, 0.6]}>
        <mesh position={[0, 0.95, 0]} castShadow>
          <boxGeometry args={[1.5, 1.0, 1.5]} />
          <meshStandardMaterial
            color={dome}
            roughness={0.1}
            transparent
            opacity={0.65}
          />
        </mesh>
        {/* tiny alien pilot inside */}
        <B p={[0, 0.85, 0]} s={[0.65, 0.7, 0.55]} c={glow} />
        <Pair x={0.16} p={[0, 0.98, 0.29]} s={[0.14, 0.2, 0.06]} c="#1d1d1f" />
        <Pair x={0.15} p={[0, 1.35, 0]} s={[0.08, 0.28, 0.08]} c={glow} />
        <Pair x={0.15} p={[0, 1.52, 0]} s={[0.15, 0.15, 0.15]} c="#8FE03A" />
      </group>
      {/* rim lights revolving */}
      <group ref={lightsRef}>
        <B p={[1.75, 0, 0]} s={[0.3, 0.3, 0.3]} c="#FF5A5A" />
        <B p={[-1.75, 0, 0]} s={[0.3, 0.3, 0.3]} c="#FFD93D" />
        <B p={[0, 0, 1.75]} s={[0.3, 0.3, 0.3]} c="#5AC8FF" />
        <B p={[0, 0, -1.75]} s={[0.3, 0.3, 0.3]} c="#9B5AFF" />
      </group>
      {/* tractor beam underneath */}
      <group ref={beamRef} position={[0, -1.3, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.6, 1.6, 1.6]} />
          <meshStandardMaterial
            color="#BFFF7A"
            transparent
            opacity={0.3}
            emissive="#9AE84A"
            emissiveIntensity={0.8}
          />
        </mesh>
        <mesh position={[0, -0.8, 0]}>
          <boxGeometry args={[2.3, 0.8, 2.3]} />
          <meshStandardMaterial
            color="#BFFF7A"
            transparent
            opacity={0.18}
            emissive="#9AE84A"
            emissiveIntensity={0.6}
          />
        </mesh>
      </group>
      {/* landing feet */}
      <Pair x={1.35} p={[0, -0.75, 0]} s={[0.3, 0.5, 0.3]} c={silverD} />
    </group>
  );
}

/* ================= SURFBOARD SILVER SURFER ================= */
export function SurferBoard() {
  const chrome = "#D9DEE6";
  const chromeD = "#AAB4C2";
  const chromeL = "#F2F5F9";
  return (
    <group position={[0, 1.6, 0]} rotation={[0, 0, 0]}>
      {/* main deck (long voxel board) */}
      <B p={[0, 0, 0]} s={[1.9, 0.35, 4.6]} c={chrome} />
      {/* nose taper */}
      <B p={[0, 0.05, 2.6]} s={[1.3, 0.3, 0.8]} c={chromeL} />
      <B p={[0, 0.12, 3.2]} s={[0.75, 0.26, 0.6]} c={chrome} />
      {/* tail taper */}
      <B p={[0, 0, -2.6]} s={[1.4, 0.32, 0.6]} c={chromeD} />
      <B p={[0, 0, -3.05]} s={[0.9, 0.3, 0.4]} c={chrome} />
      {/* deck shine stripe */}
      <B p={[0, 0.19, 0]} s={[0.6, 0.06, 3.8]} c={chromeL} />
      {/* underside keel/fin */}
      <B p={[0, -0.45, -1.6]} s={[0.25, 0.65, 1.1]} c={chromeD} />
      {/* cosmic energy trail */}
      <mesh position={[0, -0.15, -3.9]}>
        <boxGeometry args={[0.9, 0.5, 1.2]} />
        <meshStandardMaterial
          color="#BFE3FF"
          transparent
          opacity={0.5}
          emissive="#7FC4FF"
          emissiveIntensity={0.8}
        />
      </mesh>
      <mesh position={[0, -0.2, -4.9]}>
        <boxGeometry args={[0.55, 0.35, 0.9]} />
        <meshStandardMaterial
          color="#DFF1FF"
          transparent
          opacity={0.3}
          emissive="#7FC4FF"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

/* ================= SHAUN THE SHEEP ================= */
export function ShaunSheep() {
  const wool = "#F5F2E8";
  const woolD = "#E5E0D0";
  const skin = "#2E2A28";
  const skinL = "#4A4440";
  return (
    <group>
      {/* kaki hitam kurus */}
      <Pair x={0.55} p={[0, 0.6, 0.1]} s={[0.4, 1.2, 0.45]} c={skin} />
      <Pair x={0.55} p={[0, 0.14, 0.2]} s={[0.46, 0.28, 0.65]} c={skinL} />
      {/* badan wol gemuk bertumpuk */}
      <B p={[0, 2.3, -0.1]} s={[2.4, 2.2, 2.6]} c={wool} />
      {/* gumpalan wol biar fluffy */}
      <B p={[0, 3.4, -0.2]} s={[1.9, 0.6, 2.1]} c={woolD} />
      <Pair x={1.3} p={[0, 2.5, -0.1]} s={[0.4, 1.5, 2.0]} c={woolD} />
      <B p={[0, 2.4, -1.5]} s={[1.8, 1.6, 0.4]} c={woolD} />
      {/* ekor kecil */}
      <B p={[0, 2.9, -1.7]} s={[0.5, 0.5, 0.4]} c={wool} />
      {/* kepala hitam (menyatu dengan badan wol) */}
      <B p={[0, 3.95, 0.85]} s={[1.5, 1.7, 1.5]} c={skin} />
      {/* mata putih besar + pupil */}
      <Pair x={0.45} p={[0, 4.25, 1.52]} s={[0.5, 0.6, 0.14]} c="#ffffff" />
      <Pair x={0.38} p={[0, 4.2, 1.62]} s={[0.22, 0.28, 0.07]} c="#1d1d1f" />
      {/* lubang hidung */}
      <Pair x={0.22} p={[0, 3.6, 1.62]} s={[0.12, 0.14, 0.06]} c="#1a1715" />
      {/* mulut */}
      <B p={[0, 3.35, 1.61]} s={[0.5, 0.08, 0.06]} c="#1a1715" />
      {/* jambul wol di atas kepala */}
      <B p={[0, 4.95, 0.75]} s={[1.1, 0.6, 1.1]} c={wool} />
      <B p={[0.3, 5.35, 0.8]} s={[0.6, 0.4, 0.6]} c={woolD} />
      <B p={[-0.35, 5.25, 0.6]} s={[0.5, 0.35, 0.5]} c={wool} />
      {/* telinga hitam ke samping */}
      <Pair x={1.05} p={[0, 4.5, 0.7]} s={[0.7, 0.35, 0.4]} c={skin} />
      <Pair x={1.35} p={[0, 4.5, 0.7]} s={[0.25, 0.28, 0.32]} c={skinL} />
    </group>
  );
}

/* ================= BEBEK MALLARD (gaya Crossy Road) ================= */
export function Mallard() {
  const green = "#52C68A";
  const plum = "#9E5472";
  const plumD = "#B8638A";
  const bill = "#F2E03A";
  const orange = "#F58220";
  const white = "#F5F2EA";
  return (
    <group>
      {/* kaki oranye pendek */}
      <Pair x={0.5} p={[0, 0.45, 0.1]} s={[0.4, 0.9, 0.4]} c={orange} />
      <Pair x={0.5} p={[0, 0.14, 0.4]} s={[0.7, 0.28, 1.0]} c={orange} />
      {/* badan plum kotak kecil */}
      <B p={[0, 1.7, -0.1]} s={[2.0, 1.7, 2.4]} c={plum} />
      {/* sayap kotak menonjol keluar di sisi belakang */}
      <Pair x={1.15} p={[0, 1.85, -0.55]} s={[0.5, 0.9, 1.5]} c={plumD} />
      <B p={[0, 1.95, -1.45]} s={[1.6, 0.8, 0.5]} c={plumD} />
      {/* cincin leher putih */}
      <B p={[0, 2.62, 0.2]} s={[1.9, 0.45, 1.9]} c={white} />
      {/* KEPALA hijau seukuran kepala ayam (menyatu lewat cincin) */}
      <B p={[0, 3.6, 0.2]} s={[1.7, 1.8, 1.7]} c={green} />
      {/* patch mata putih di sisi kepala */}
      <Pair x={0.8} p={[0, 3.65, 0.45]} s={[0.24, 0.85, 0.85]} c="#ffffff" />
      {/* pupil hitam kotak di tengah patch */}
      <Pair x={0.94} p={[0, 3.65, 0.45]} s={[0.1, 0.35, 0.35]} c="#1d1d1f" />
      {/* paruh kuning pipih menonjol di depan */}
      <B p={[0, 3.35, 1.35]} s={[0.85, 0.5, 0.8]} c={bill} />
    </group>
  );
}

/* ================= BABY POLAR BEAR (berdiri) ================= */
export function PolarBear() {
  const white = "#F6F4EE";
  const whiteD = "#E3E0D4";
  const nose = "#2B2824";
  return (
    <group>
      {/* kaki gemuk pendek */}
      <Pair x={0.52} p={[0, 0.5, 0]} s={[0.72, 1.0, 0.8]} c={white} />
      <Pair x={0.52} p={[0, 0.16, 0.22]} s={[0.74, 0.32, 0.95]} c={whiteD} />
      {/* badan bulat bayi */}
      <B p={[0, 2.0, 0]} s={[2.25, 2.1, 1.85]} c={white} />
      {/* lengan pendek */}
      <Pair x={1.3} p={[0, 2.2, 0.1]} s={[0.52, 1.25, 0.62]} c={white} />
      <Pair x={1.3} p={[0, 1.55, 0.15]} s={[0.54, 0.35, 0.64]} c={whiteD} />
      {/* kepala besar bayi (menyatu dengan badan) */}
      <B p={[0, 3.85, 0.1]} s={[2.4, 1.95, 2.0]} c={white} />
      {/* moncong pendek */}
      <B p={[0, 3.4, 1.12]} s={[1.0, 0.75, 0.4]} c={whiteD} />
      {/* hidung hitam besar */}
      <B p={[0, 3.62, 1.36]} s={[0.44, 0.3, 0.16]} c={nose} />
      {/* mata bayi besar berbinar */}
      <Pair x={0.6} p={[0, 4.2, 1.11]} s={[0.38, 0.46, 0.1]} c="#1d1d1f" />
      <Pair x={0.5} p={[0, 4.33, 1.17]} s={[0.13, 0.13, 0.05]} c="#ffffff" />
      {/* pipi merona */}
      <Pair x={1.0} p={[0, 3.65, 1.08]} s={[0.3, 0.24, 0.07]} c="#F4B8C0" />
      {/* mulut kecil */}
      <B p={[0, 3.25, 1.34]} s={[0.3, 0.1, 0.08]} c={nose} />
      {/* telinga bulat kecil */}
      <Pair x={0.92} p={[0, 4.95, 0.05]} s={[0.55, 0.55, 0.45]} c={white} />
      <Pair x={0.92} p={[0, 4.95, 0.28]} s={[0.3, 0.3, 0.1]} c={whiteD} />
      {/* ekor mungil */}
      <B p={[0, 1.3, -1.0]} s={[0.5, 0.5, 0.35]} c={whiteD} />
    </group>
  );
}

/* ================= BABY BEAVER (berdiri) ================= */
export function BabyBeaver() {
  const fur = "#9C6B3F";
  const furD = "#7E5329";
  const belly = "#C99E6B";
  const tail = "#5C4027";
  return (
    <group>
      {/* kaki pendek */}
      <Pair x={0.5} p={[0, 0.5, 0.05]} s={[0.62, 1.0, 0.68]} c={furD} />
      <Pair x={0.5} p={[0, 0.16, 0.26]} s={[0.66, 0.32, 0.9]} c={furD} />
      {/* badan bulat */}
      <B p={[0, 1.95, 0]} s={[2.05, 2.0, 1.65]} c={fur} />
      {/* perut terang */}
      <B p={[0, 1.85, 0.84]} s={[1.4, 1.5, 0.12]} c={belly} />
      {/* lengan kecil memeluk */}
      <Pair x={1.15} p={[0, 2.1, 0.25]} s={[0.44, 1.05, 0.52]} c={fur} />
      {/* pangkal ekor nyambung ke pantat */}
      <B p={[0, 1.0, -0.95]} s={[1.2, 0.8, 0.6]} c={tail} />
      {/* EKOR PIPIH LEBAR khas beaver (menyatu dengan pangkal) */}
      <B p={[0, 0.75, -1.65]} s={[1.5, 0.35, 1.4]} c={tail} />
      <B p={[0, 0.75, -2.45]} s={[1.1, 0.32, 0.6]} c={tail} />
      {/* pola grid ekor */}
      <B p={[0, 0.95, -1.65]} s={[0.12, 0.06, 1.3]} c="#4A3220" />
      <Pair x={0.45} p={[0, 0.95, -1.65]} s={[0.1, 0.06, 1.2]} c="#4A3220" />
      {/* kepala bulat bayi (menyatu dengan badan) */}
      <B p={[0, 3.55, 0.1]} s={[2.2, 1.8, 1.85]} c={fur} />
      {/* moncong gembul */}
      <B p={[0, 3.1, 1.12]} s={[1.05, 0.8, 0.4]} c={belly} />
      {/* hidung cokelat gelap */}
      <B p={[0, 3.4, 1.34]} s={[0.4, 0.28, 0.16]} c="#3A2A1A" />
      {/* GIGI DEPAN BESAR khas beaver */}
      <B p={[0, 2.82, 1.3]} s={[0.46, 0.5, 0.12]} c="#ffffff" />
      <B p={[0, 2.82, 1.37]} s={[0.08, 0.5, 0.06]} c="#D8D2C0" />
      {/* mata bayi besar berbinar */}
      <Pair x={0.58} p={[0, 3.9, 1.04]} s={[0.36, 0.44, 0.1]} c="#1d1d1f" />
      <Pair x={0.48} p={[0, 4.02, 1.1]} s={[0.12, 0.12, 0.05]} c="#ffffff" />
      {/* pipi merona */}
      <Pair x={0.98} p={[0, 3.35, 1.02]} s={[0.28, 0.22, 0.07]} c="#F4A4B0" />
      {/* telinga bulat kecil */}
      <Pair x={0.85} p={[0, 4.6, 0.1]} s={[0.4, 0.4, 0.35]} c={furD} />
    </group>
  );
}

/* ================= BABY TEDDY BEAR (berdiri) ================= */
export function TeddyBear() {
  const fur = "#D49A5E";
  const furD = "#B77F44";
  const muzzle = "#F2D9AE";
  return (
    <group>
      {/* kaki pendek gemuk bayi */}
      <Pair x={0.5} p={[0, 0.45, 0]} s={[0.72, 0.9, 0.8]} c={fur} />
      <Pair x={0.5} p={[0, 0.14, 0.22]} s={[0.74, 0.28, 0.92]} c={furD} />
      {/* badan mungil bulat */}
      <B p={[0, 1.75, 0]} s={[2.05, 1.9, 1.75]} c={fur} />
      {/* perut terang */}
      <B p={[0, 1.65, 0.89]} s={[1.35, 1.3, 0.12]} c={muzzle} />
      {/* lengan pendek terbuka minta gendong */}
      <Pair x={1.2} p={[0, 2.0, 0.2]} s={[0.5, 1.1, 0.58]} c={fur} />
      <Pair x={1.2} p={[0, 1.4, 0.24]} s={[0.52, 0.34, 0.6]} c={furD} />
      {/* kepala ekstra besar bayi (menyatu dengan badan) */}
      <B p={[0, 3.6, 0.05]} s={[2.6, 2.1, 2.15]} c={fur} />
      {/* moncong gembul */}
      <B p={[0, 3.1, 1.18]} s={[1.05, 0.8, 0.4]} c={muzzle} />
      {/* hidung bulat */}
      <B p={[0, 3.35, 1.4]} s={[0.4, 0.3, 0.16]} c="#4A352A" />
      {/* senyum kecil */}
      <B p={[0, 2.92, 1.4]} s={[0.34, 0.09, 0.08]} c="#4A352A" />
      {/* mata bayi besar berbinar */}
      <Pair x={0.62} p={[0, 3.95, 1.14]} s={[0.42, 0.5, 0.1]} c="#2B2017" />
      <Pair x={0.52} p={[0, 4.1, 1.2]} s={[0.14, 0.14, 0.05]} c="#ffffff" />
      {/* pipi merona */}
      <Pair x={1.05} p={[0, 3.35, 1.12]} s={[0.32, 0.26, 0.07]} c="#F4A4B0" />
      {/* telinga bulat besar */}
      <Pair x={1.0} p={[0, 4.8, 0.0]} s={[0.7, 0.7, 0.5]} c={fur} />
      <Pair x={1.0} p={[0, 4.8, 0.26]} s={[0.4, 0.4, 0.1]} c={muzzle} />
    </group>
  );
}

/* ================= AXOLOTL (berdiri) ================= */
export function Axolotl() {
  const pink = "#F8C8D4";
  const pinkD = "#F0A8BC";
  const gill = "#F06292";
  const belly = "#FDE8EE";
  return (
    <group>
      {/* kaki pendek */}
      <Pair x={0.5} p={[0, 0.5, 0.05]} s={[0.6, 1.0, 0.65]} c={pink} />
      <Pair x={0.5} p={[0, 0.16, 0.26]} s={[0.64, 0.32, 0.88]} c={pinkD} />
      {/* badan */}
      <B p={[0, 1.9, 0]} s={[1.85, 1.95, 1.45]} c={pink} />
      {/* perut */}
      <B p={[0, 1.8, 0.74]} s={[1.3, 1.5, 0.12]} c={belly} />
      {/* lengan kecil */}
      <Pair x={1.1} p={[0, 2.05, 0.2]} s={[0.42, 1.1, 0.5]} c={pink} />
      {/* ekor pipih di belakang */}
      <B p={[0, 1.6, -1.0]} s={[0.45, 1.5, 0.8]} c={pinkD} />
      <B p={[0, 1.5, -1.6]} s={[0.35, 1.1, 0.6]} c={pink} />
      {/* kepala lebar (menyatu dengan badan) */}
      <B p={[0, 3.55, 0.15]} s={[2.2, 1.7, 1.8]} c={pink} />
      {/* mata kecil hitam */}
      <Pair x={0.68} p={[0, 3.75, 1.06]} s={[0.26, 0.3, 0.1]} c="#1d1d1f" />
      {/* senyum lebar khas axolotl */}
      <B p={[0, 3.25, 1.07]} s={[0.9, 0.1, 0.07]} c="#D4708C" />
      <Pair x={0.5} p={[0, 3.33, 1.07]} s={[0.12, 0.14, 0.06]} c="#D4708C" />
      {/* pipi merona */}
      <Pair x={0.95} p={[0, 3.4, 1.05]} s={[0.3, 0.24, 0.07]} c="#F48FB1" />
      {/* insang 3 pasang (kiri-kanan kepala) */}
      <Pair x={1.3} p={[0, 4.1, 0.5]} s={[0.55, 0.28, 0.28]} c={gill} />
      <Pair x={1.4} p={[0, 3.7, 0.2]} s={[0.65, 0.28, 0.28]} c={gill} />
      <Pair x={1.3} p={[0, 3.3, -0.1]} s={[0.55, 0.28, 0.28]} c={gill} />
      {/* ujung insang bulat */}
      <Pair x={1.65} p={[0, 4.1, 0.5]} s={[0.22, 0.36, 0.36]} c="#E84A7F" />
      <Pair x={1.8} p={[0, 3.7, 0.2]} s={[0.22, 0.36, 0.36]} c="#E84A7F" />
      <Pair x={1.65} p={[0, 3.3, -0.1]} s={[0.22, 0.36, 0.36]} c="#E84A7F" />
    </group>
  );
}

/* ================= RED PANDA (berdiri) ================= */
export function RedPanda() {
  const rust = "#C45A2E";
  const rustD = "#9E4423";
  const dark = "#3D2B22";
  const cream = "#F2E0C8";
  return (
    <group>
      {/* kaki gelap */}
      <Pair x={0.5} p={[0, 0.55, 0]} s={[0.62, 1.1, 0.68]} c={dark} />
      <Pair x={0.5} p={[0, 0.16, 0.22]} s={[0.64, 0.32, 0.9]} c={dark} />
      {/* badan */}
      <B p={[0, 2.2, 0]} s={[2.05, 2.2, 1.65]} c={rust} />
      {/* dada gelap */}
      <B p={[0, 2.0, 0.84]} s={[1.4, 1.7, 0.12]} c={dark} />
      {/* lengan gelap */}
      <Pair x={1.2} p={[0, 2.4, 0.1]} s={[0.46, 1.3, 0.56]} c={dark} />
      {/* kepala (menyatu dengan badan) */}
      <B p={[0, 3.95, 0.1]} s={[2.3, 1.8, 1.9]} c={rust} />
      {/* alis putih + pipi putih khas red panda (menonjol keluar dari muka) */}
      <Pair x={0.6} p={[0, 4.55, 1.04]} s={[0.5, 0.35, 0.12]} c={cream} />
      <Pair x={1.0} p={[0, 3.85, 1.04]} s={[0.42, 0.6, 0.12]} c={cream} />
      {/* moncong putih */}
      <B p={[0, 3.6, 1.1]} s={[0.85, 0.7, 0.35]} c={cream} />
      <B p={[0, 3.82, 1.32]} s={[0.34, 0.26, 0.14]} c={dark} />
      {/* mata besar berbinar */}
      <Pair x={0.58} p={[0, 4.2, 1.06]} s={[0.36, 0.44, 0.1]} c="#1d1d1f" />
      <Pair x={0.48} p={[0, 4.33, 1.12]} s={[0.13, 0.13, 0.05]} c="#ffffff" />
      {/* pipi merona (lapisan paling depan, tidak menembus patch putih) */}
      <Pair x={0.95} p={[0, 3.6, 1.14]} s={[0.26, 0.2, 0.06]} c="#F4A4B0" />
      {/* telinga putih-rust */}
      <Pair x={0.88} p={[0, 5.05, 0.05]} s={[0.55, 0.6, 0.45]} c={rust} />
      <Pair x={0.88} p={[0, 5.05, 0.29]} s={[0.3, 0.34, 0.1]} c={cream} />
      {/* ekor gemuk belang melengkung naik (cute, nempel badan) */}
      <B p={[0, 1.35, -1.05]} s={[1.0, 1.0, 0.75]} c={rust} />
      <B p={[0, 2.15, -1.3]} s={[0.9, 0.9, 0.7]} c={cream} />
      <B p={[0, 2.95, -1.35]} s={[0.8, 0.8, 0.65]} c={rust} />
      <B p={[0, 3.6, -1.3]} s={[0.65, 0.6, 0.55]} c={rustD} />
    </group>
  );
}

/* ================= RUBAH FENNEC (berdiri) ================= */
export function FennecFox() {
  const sand = "#EFD9A8";
  const sandD = "#DCBC7E";
  const cream = "#FBF4E2";
  return (
    <group>
      {/* kaki */}
      <Pair x={0.48} p={[0, 0.55, 0]} s={[0.56, 1.1, 0.62]} c={sand} />
      <Pair x={0.48} p={[0, 0.16, 0.22]} s={[0.6, 0.32, 0.85]} c={sandD} />
      {/* badan ramping */}
      <B p={[0, 2.15, 0]} s={[1.85, 2.1, 1.5]} c={sand} />
      {/* perut krem */}
      <B p={[0, 2.0, 0.76]} s={[1.25, 1.55, 0.12]} c={cream} />
      {/* lengan */}
      <Pair x={1.1} p={[0, 2.35, 0.1]} s={[0.44, 1.25, 0.52]} c={sand} />
      {/* kepala (menyatu dengan badan) */}
      <B p={[0, 3.85, 0.1]} s={[2.0, 1.7, 1.75]} c={sand} />
      {/* moncong kecil lancip */}
      <B p={[0, 3.5, 1.1]} s={[0.8, 0.65, 0.45]} c={cream} />
      <B p={[0, 3.7, 1.37]} s={[0.3, 0.24, 0.14]} c="#3A2E24" />
      {/* mata besar gelap */}
      <Pair x={0.55} p={[0, 4.1, 1.0]} s={[0.3, 0.42, 0.1]} c="#1d1d1f" />
      <Pair x={0.48} p={[0, 4.22, 1.06]} s={[0.1, 0.12, 0.05]} c="#ffffff" />
      {/* pipi krem */}
      <Pair x={0.95} p={[0, 3.65, 0.95]} s={[0.3, 0.55, 0.1]} c={cream} />
      {/* TELINGA RAKSASA khas fennec */}
      <Pair x={0.72} p={[0, 5.45, 0.0]} s={[0.75, 1.5, 0.45]} c={sand} />
      <Pair x={0.72} p={[0, 5.35, 0.24]} s={[0.45, 1.1, 0.1]} c="#E8A8A0" />
      <Pair x={0.72} p={[0, 6.3, 0.0]} s={[0.5, 0.35, 0.4]} c={sandD} />
      {/* ekor tebal ujung gelap */}
      <B p={[0, 1.45, -1.1]} s={[0.7, 0.7, 0.95]} c={sand} />
      <B p={[0, 1.35, -1.9]} s={[0.62, 0.62, 0.7]} c={sandD} />
      <B p={[0, 1.3, -2.5]} s={[0.55, 0.55, 0.55]} c="#6B5640" />
    </group>
  );
}

/* ================= TUPAI TERBANG SIBERIA (berdiri) ================= */
export function FlyingSquirrel() {
  const grey = "#A8AEB8";
  const greyD = "#8A909C";
  const white = "#F2F2EE";
  return (
    <group>
      {/* kaki */}
      <Pair x={0.45} p={[0, 0.5, 0]} s={[0.54, 1.0, 0.6]} c={grey} />
      <Pair x={0.45} p={[0, 0.16, 0.2]} s={[0.58, 0.32, 0.8]} c={greyD} />
      {/* badan */}
      <B p={[0, 1.95, 0]} s={[1.8, 2.0, 1.45]} c={grey} />
      {/* perut putih */}
      <B p={[0, 1.85, 0.74]} s={[1.2, 1.5, 0.12]} c={white} />
      {/* lengan normal di samping badan */}
      <Pair x={1.1} p={[0, 2.05, 0.1]} s={[0.42, 1.2, 0.5]} c={grey} />
      <Pair x={1.1} p={[0, 1.4, 0.15]} s={[0.44, 0.32, 0.54]} c={greyD} />
      {/* kepala bulat (menyatu dengan badan) */}
      <B p={[0, 3.5, 0.1]} s={[2.05, 1.65, 1.7]} c={grey} />
      {/* MATA SUPER BESAR khas tupai terbang siberia */}
      <Pair x={0.56} p={[0, 3.7, 1.0]} s={[0.56, 0.62, 0.1]} c="#1d1d1f" />
      <Pair x={0.44} p={[0, 3.85, 1.06]} s={[0.16, 0.16, 0.05]} c="#ffffff" />
      {/* lingkar mata putih */}
      <Pair x={0.56} p={[0, 3.7, 0.96]} s={[0.72, 0.78, 0.06]} c={white} />
      {/* hidung kecil + mulut */}
      <B p={[0, 3.25, 1.0]} s={[0.24, 0.2, 0.12]} c="#8C6A72" />
      <B p={[0, 3.05, 0.98]} s={[0.4, 0.08, 0.08]} c={greyD} />
      {/* telinga kecil bulat */}
      <Pair x={0.75} p={[0, 4.45, 0.1]} s={[0.42, 0.45, 0.35]} c={grey} />
      {/* ekor pipih panjang */}
      <B p={[0, 1.3, -1.05]} s={[0.8, 0.5, 0.9]} c={greyD} />
      <B p={[0, 1.25, -1.85]} s={[0.9, 0.4, 0.8]} c={grey} />
      <B p={[0, 1.2, -2.55]} s={[0.8, 0.35, 0.6]} c={greyD} />
    </group>
  );
}

/* ================= LANDAK KERDIL / HEDGEHOG (berdiri) ================= */
export function Hedgehog() {
  const spike = "#A67C4E";
  const spikeD = "#8C6238";
  const face = "#F8E8D0";
  const faceD = "#EBD4B0";
  return (
    <group>
      {/* kaki kecil */}
      <Pair x={0.45} p={[0, 0.45, 0.05]} s={[0.5, 0.9, 0.55]} c={faceD} />
      <Pair x={0.45} p={[0, 0.16, 0.24]} s={[0.54, 0.32, 0.75]} c={faceD} />
      {/* badan krem depan */}
      <B p={[0, 1.95, 0.2]} s={[1.85, 2.0, 1.3]} c={face} />
      {/* punggung duri bulat lembut */}
      <B p={[0, 2.15, -0.55]} s={[2.15, 2.5, 1.1]} c={spike} />
      {/* bumps duri lembut (pendek & membulat) */}
      <B p={[0, 3.5, -0.5]} s={[0.55, 0.4, 0.55]} c={spikeD} />
      <Pair x={0.75} p={[0, 3.3, -0.35]} s={[0.5, 0.35, 0.5]} c={spikeD} />
      <Pair x={1.15} p={[0, 2.5, -0.5]} s={[0.4, 0.5, 0.55]} c={spikeD} />
      <Pair x={0.6} p={[0, 2.8, -1.12]} s={[0.5, 0.45, 0.3]} c={spikeD} />
      <B p={[0, 2.2, -1.15]} s={[0.55, 0.5, 0.3]} c={spikeD} />
      <B p={[0, 1.45, -1.05]} s={[0.9, 0.5, 0.3]} c={spikeD} />
      {/* lengan kecil */}
      <Pair x={1.05} p={[0, 2.1, 0.35]} s={[0.4, 1.0, 0.48]} c={faceD} />
      {/* kepala krem (menyatu dengan badan) */}
      <B p={[0, 3.4, 0.35]} s={[1.9, 1.55, 1.5]} c={face} />
      {/* poni duri lembut di kepala */}
      <B p={[0, 4.25, -0.05]} s={[1.95, 0.55, 0.95]} c={spike} />
      <Pair x={0.55} p={[0, 4.55, 0.0]} s={[0.5, 0.35, 0.5]} c={spikeD} />
      <B p={[0, 4.6, 0.3]} s={[0.45, 0.35, 0.4]} c={spikeD} />
      {/* moncong kecil */}
      <B p={[0, 3.05, 1.2]} s={[0.75, 0.6, 0.4]} c={faceD} />
      {/* hidung pink kecil */}
      <B p={[0, 3.22, 1.44]} s={[0.26, 0.22, 0.12]} c="#E8909C" />
      {/* mata besar berbinar */}
      <Pair x={0.52} p={[0, 3.65, 1.12]} s={[0.4, 0.48, 0.1]} c="#1d1d1f" />
      <Pair x={0.44} p={[0, 3.78, 1.18]} s={[0.14, 0.14, 0.05]} c="#ffffff" />
      {/* senyum kecil */}
      <B p={[0, 2.95, 1.42]} s={[0.35, 0.08, 0.06]} c="#C47A6A" />
      {/* pipi merona */}
      <Pair x={0.85} p={[0, 3.25, 1.1]} s={[0.3, 0.24, 0.07]} c="#F4A4B0" />
      {/* telinga kecil bulat */}
      <Pair x={0.7} p={[0, 4.15, 0.68]} s={[0.35, 0.35, 0.25]} c={faceD} />
    </group>
  );
}

/* ================= CAPYBARA (berdiri) ================= */
export function Capybara() {
  const fur = "#B08A54";
  const furD = "#92703F";
  const muzzle = "#C9A66B";
  return (
    <group>
      {/* kaki */}
      <Pair x={0.55} p={[0, 0.55, 0]} s={[0.68, 1.1, 0.75]} c={furD} />
      <Pair x={0.55} p={[0, 0.16, 0.2]} s={[0.7, 0.32, 0.9]} c={furD} />
      {/* badan kekar */}
      <B p={[0, 2.3, 0]} s={[2.25, 2.4, 1.85]} c={fur} />
      {/* perut sedikit terang */}
      <B p={[0, 2.0, 0.94]} s={[1.5, 1.5, 0.12]} c={muzzle} />
      {/* lengan santai */}
      <Pair x={1.3} p={[0, 2.5, 0.1]} s={[0.5, 1.4, 0.6]} c={fur} />
      {/* kepala kotak panjang khas capybara (menyatu dengan badan) */}
      <B p={[0, 4.15, 0.25]} s={[2.1, 1.8, 2.1]} c={fur} />
      {/* moncong besar tumpul */}
      <B p={[0, 3.85, 1.45]} s={[1.5, 1.15, 0.6]} c={muzzle} />
      {/* hidung khas capybara: satu kotak gelap di tengah puncak moncong */}
      <B p={[0, 4.25, 1.6]} s={[0.75, 0.45, 0.45]} c="#4A3826" />
      {/* mulut datar santai */}
      <B p={[0, 3.45, 1.77]} s={[0.7, 0.1, 0.08]} c="#4A3826" />
      {/* mata sayu (menonjol di muka, terlihat jelas) */}
      <Pair x={0.75} p={[0, 4.55, 1.32]} s={[0.36, 0.26, 0.1]} c="#1d1d1f" />
      <Pair x={0.68} p={[0, 4.62, 1.38]} s={[0.1, 0.08, 0.05]} c="#ffffff" />
      {/* telinga kecil di atas */}
      <Pair x={0.8} p={[0, 5.15, -0.1]} s={[0.42, 0.4, 0.35]} c={furD} />
      {/* jeruk yuzu di kepala (ikonik capybara onsen!) */}
      <B p={[0, 5.3, 0.55]} s={[0.65, 0.55, 0.65]} c="#F5A623" />
      <B p={[0, 5.62, 0.55]} s={[0.15, 0.15, 0.15]} c="#5B8C3E" />
    </group>
  );
}

/* ================= BABY KIRIN (biru Kaido) ================= */
export function Kirin() {
  const body = "#6FA8C9";
  const bodyD = "#4E7FA6";
  const cream = "#F0E8D8";
  const gold = "#F2C230";
  const mane = "#F08A3C";
  const bolt = "#FFE43A";
  return (
    <group>
      {/* kaki pendek bayi dengan teracak emas */}
      <Pair x={0.46} p={[0, 0.42, 0.05]} s={[0.52, 0.84, 0.58]} c={body} />
      <Pair x={0.46} p={[0, 0.14, 0.1]} s={[0.56, 0.28, 0.66]} c={gold} />
      {/* badan mungil */}
      <B p={[0, 1.5, 0]} s={[1.75, 1.75, 1.45]} c={body} />
      {/* perut krem */}
      <B p={[0, 1.4, 0.74]} s={[1.15, 1.2, 0.12]} c={cream} />
      {/* lengan pendek */}
      <Pair x={1.0} p={[0, 1.65, 0.1]} s={[0.4, 0.95, 0.48]} c={body} />
      <Pair x={1.0} p={[0, 1.13, 0.14]} s={[0.42, 0.26, 0.52]} c={gold} />
      {/* kepala besar bayi (menyatu dengan badan) */}
      <B p={[0, 3.2, 0.1]} s={[2.3, 1.95, 2.0]} c={body} />
      {/* moncong kecil mungil (bukan babi) */}
      <B p={[0, 2.75, 1.15]} s={[0.8, 0.6, 0.35]} c={cream} />
      {/* hidung kecil satu titik */}
      <B p={[0, 2.95, 1.36]} s={[0.26, 0.18, 0.12]} c={bodyD} />
      {/* mata bayi besar berbinar */}
      <Pair x={0.6} p={[0, 3.5, 1.12]} s={[0.44, 0.52, 0.12]} c="#1d1d1f" />
      <Pair x={0.49} p={[0, 3.66, 1.19]} s={[0.15, 0.15, 0.06]} c="#ffffff" />
      {/* pipi merona */}
      <Pair x={1.0} p={[0, 3.0, 1.1]} s={[0.3, 0.24, 0.08]} c="#F4A4B0" />
      {/* TANDUK emas bercabang mungil */}
      <Pair x={0.55} p={[0, 4.45, 0.0]} s={[0.24, 0.7, 0.24]} c={gold} />
      <Pair x={0.75} p={[0, 4.8, -0.12]} s={[0.2, 0.4, 0.2]} c={gold} />
      {/* surai api oranye kecil di kepala-punggung */}
      <B p={[0, 4.3, -0.65]} s={[0.8, 0.5, 0.6]} c={mane} />
      <B p={[0, 3.6, -1.0]} s={[0.65, 0.8, 0.45]} c={mane} />
      <B p={[0, 2.7, -0.95]} s={[0.5, 0.75, 0.35]} c="#E06A28" />
      {/* telinga kecil di samping tanduk */}
      <Pair x={0.95} p={[0, 4.25, 0.15]} s={[0.3, 0.4, 0.26]} c={bodyD} />
      {/* ekor berumbai api kecil nempel pantat */}
      <B p={[0, 1.2, -0.85]} s={[0.45, 0.45, 0.6]} c={body} />
      <B p={[0, 1.55, -1.2]} s={[0.5, 0.5, 0.45]} c={mane} />
      {/* percikan petir kecil di tanduk */}
      <B p={[1.0, 4.65, 0.25]} s={[0.14, 0.35, 0.1]} c={bolt} r={[0, 0, 0.4]} />
      <B p={[-1.05, 4.5, 0.1]} s={[0.12, 0.3, 0.1]} c={bolt} r={[0, 0, -0.4]} />
    </group>
  );
}

/* ================= BIKSU ZEN (berdiri) ================= */
export function ZenMonk() {
  const robe = "#D97B2E";
  const robeD = "#B5611F";
  const skin = "#F0C8A0";
  const skinD = "#DDB48C";
  return (
    <group>
      {/* kaki dengan sandal */}
      <Pair x={0.48} p={[0, 0.5, 0]} s={[0.56, 1.0, 0.62]} c={robeD} />
      <Pair x={0.48} p={[0, 0.14, 0.2]} s={[0.6, 0.28, 0.85]} c="#8C6A4A" />
      {/* rok jubah bawah melebar */}
      <B p={[0, 1.25, 0]} s={[2.1, 0.9, 1.7]} c={robeD} />
      {/* badan berjubah */}
      <B p={[0, 2.35, -0.05]} s={[1.95, 1.8, 1.5]} c={robe} />
      {/* lipatan selempang diagonal */}
      <B p={[0.45, 2.5, 0.67]} s={[0.85, 1.4, 0.2]} c={robeD} r={[0, 0, 0.35]} />
      {/* bahu kanan terbuka (kulit) */}
      <B p={[-0.7, 3.05, 0.05]} s={[0.55, 0.5, 1.2]} c={skin} />
      {/* lengan turun di samping, telapak tangan menyatu di depan dada (anjali) */}
      <Pair x={1.08} p={[0, 2.3, 0.1]} s={[0.45, 1.3, 0.5]} c={robe} />
      <B p={[0, 2.45, 0.85]} s={[0.5, 0.75, 0.35]} c={skin} />
      <B p={[0, 2.85, 0.85]} s={[0.35, 0.3, 0.3]} c={skinD} />
      {/* kepala gundul (menyatu dengan badan) */}
      <B p={[0, 4.0, -0.05]} s={[1.75, 1.6, 1.6]} c={skin} />
      {/* kilau kepala gundul */}
      <B p={[0.35, 4.7, 0.25]} s={[0.4, 0.12, 0.4]} c="#FBE0C0" />
      {/* mata terpejam damai */}
      <Pair x={0.48} p={[0, 4.15, 0.76]} s={[0.4, 0.09, 0.1]} c="#5C4430" />
      {/* alis */}
      <Pair x={0.48} p={[0, 4.4, 0.76]} s={[0.36, 0.1, 0.08]} c="#8C6A4A" />
      {/* senyum damai kecil */}
      <B p={[0, 3.65, 0.76]} s={[0.35, 0.08, 0.08]} c="#5C4430" />
      {/* telinga panjang (lambang kebijaksanaan) */}
      <Pair x={0.93} p={[0, 3.9, 0.05]} s={[0.16, 0.7, 0.35]} c={skinD} />
      {/* tasbih di leher */}
      <B p={[0, 3.2, 0.5]} s={[1.1, 0.18, 0.5]} c="#6B4A2F" />
      <B p={[0, 2.95, 0.68]} s={[0.22, 0.3, 0.22]} c="#4A3220" />
    </group>
  );
}

/* ================= KEI TRUCK MINI ================= */
export function KeiTruck() {
  const bodyC = "#F2F2EE";
  const bodyD = "#D8D8D2";
  const glass = "#8FD4F0";
  const bed = "#B8BEC4";
  const tire = "#2E2E32";
  const hub = "#C9CDD2";
  return (
    <group position={[0, 1.15, 0]} scale={0.9}>
      {/* KABIN depan (kotak tinggi khas kei truck) */}
      <B p={[0, 1.15, 1.55]} s={[2.3, 1.9, 1.7]} c={bodyC} />
      {/* kaca depan */}
      <B p={[0, 1.55, 2.41]} s={[1.8, 0.95, 0.1]} c={glass} />
      {/* kaca samping */}
      <Pair x={1.16} p={[0, 1.55, 1.7]} s={[0.1, 0.85, 1.1]} c={glass} />
      {/* bumper + lampu */}
      <B p={[0, 0.35, 2.45]} s={[2.3, 0.4, 0.25]} c={bodyD} />
      <Pair x={0.85} p={[0, 0.75, 2.44]} s={[0.4, 0.25, 0.12]} c="#FFE48A" />
      {/* BAK belakang terbuka */}
      <B p={[0, 0.55, -0.9]} s={[2.3, 0.5, 3.1]} c={bed} />
      {/* dinding bak */}
      <Pair x={1.08} p={[0, 1.0, -0.9]} s={[0.14, 0.5, 3.1]} c={bodyC} />
      <B p={[0, 1.0, -2.38]} s={[2.3, 0.5, 0.14]} c={bodyC} />
      {/* muatan: kotak sayur + jeruk */}
      <B p={[-0.5, 1.05, -0.6]} s={[0.85, 0.5, 0.85]} c="#A8763E" />
      <B p={[0.55, 1.0, -1.4]} s={[0.7, 0.4, 0.7]} c="#C9934E" />
      <B p={[-0.45, 1.42, -0.6]} s={[0.3, 0.3, 0.3]} c="#F5A623" />
      {/* roda 4 */}
      <Pair x={1.15} p={[0, 0.0, 1.35]} s={[0.35, 0.8, 0.8]} c={tire} />
      <Pair x={1.15} p={[0, 0.0, -1.55]} s={[0.35, 0.8, 0.8]} c={tire} />
      <Pair x={1.34} p={[0, 0.0, 1.35]} s={[0.06, 0.35, 0.35]} c={hub} />
      <Pair x={1.34} p={[0, 0.0, -1.55]} s={[0.06, 0.35, 0.35]} c={hub} />
      {/* spion */}
      <Pair x={1.3} p={[0, 1.9, 2.1]} s={[0.12, 0.3, 0.2]} c={bodyD} />
    </group>
  );
}

/* ================= KOI KOHAKU (elegan merah-putih) ================= */
export function Koi() {
  const white = "#FAF7F0";
  const red = "#E8402E";
  const redD = "#C92E20";
  const finT = "#FBE8E0";
  const tailRef = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 4.5) * 0.5;
    }
    if (body.current) {
      // badan meliuk halus seperti berenang
      body.current.rotation.y = Math.sin(t * 4.5 + 1.2) * 0.08;
    }
  });
  return (
    <group position={[0, 1.7, 0]}>
      <group ref={body}>
        {/* MULUT + kepala membulat bertingkat */}
        <B p={[0, -0.08, 2.95]} s={[0.85, 0.65, 0.45]} c={white} />
        <B p={[0, 0, 2.5]} s={[1.3, 0.95, 0.8]} c={white} />
        {/* patch merah hi tebal menonjol jelas (anti-jitter) */}
        <B p={[0, 0.5, 2.45]} s={[0.95, 0.35, 0.75]} c={red} />
        {/* kumis barbel koi */}
        <Pair x={0.5} p={[0, -0.35, 3.05]} s={[0.09, 0.35, 0.09]} c={finT} />
        {/* mata hitam kecil di sisi */}
        <Pair x={0.68} p={[0, 0.18, 2.6]} s={[0.14, 0.24, 0.24]} c="#1d1d1f" />
        {/* BADAN utuh meruncing 3 tingkat (gemuk tengah) */}
        <B p={[0, 0, 1.3]} s={[1.65, 1.2, 1.7]} c={white} />
        <B p={[0, 0, -0.1]} s={[1.5, 1.1, 1.3]} c={white} />
        {/* pola kohaku: patch merah tebal menonjol (anti-jitter) */}
        <B p={[0, 0.55, 1.1]} s={[1.3, 0.4, 1.2]} c={red} />
        <B p={[0.3, 0.5, 0.0]} s={[0.8, 0.35, 0.9]} c={redD} />
        <B p={[-0.35, 0.52, 1.85]} s={[0.55, 0.32, 0.6]} c={redD} />
        {/* sirip dada sepasang simetris rapi */}
        <Pair x={0.95} p={[0, -0.4, 1.9]} s={[0.45, 0.16, 0.6]} c={finT} />
        {/* sirip punggung berlayar */}
        <B p={[0, 0.95, 0.5]} s={[0.22, 0.7, 1.2]} c={finT} />
      </group>
      {/* EKOR kipas rapi simetris (pivot pangkal) */}
      <group ref={tailRef} position={[0, 0, -0.7]}>
        {/* badan belakang menyempit nyambung badan */}
        <B p={[0, 0, -0.4]} s={[1.1, 0.9, 0.9]} c={white} />
        <B p={[0, 0.48, -0.4]} s={[0.75, 0.32, 0.7]} c={red} />
        <B p={[0, 0, -1.0]} s={[0.7, 0.7, 0.6]} c={white} />
        {/* kipas ekor: lembar tengah + 2 sisi lurus simetris */}
        <B p={[0, 0, -1.5]} s={[0.24, 1.25, 0.65]} c={finT} />
        <Pair x={0.38} p={[0, 0, -1.6]} s={[0.22, 0.95, 0.6]} c={finT} />
        {/* ujung kipas melebar atas-bawah */}
        <B p={[0, 0.55, -1.95]} s={[0.2, 0.55, 0.5]} c={finT} />
        <B p={[0, -0.55, -1.95]} s={[0.2, 0.55, 0.5]} c={finT} />
      </group>
    </group>
  );
}

/* ================= GOLDFISH (rapi & bersih) ================= */
export function Goldfish() {
  const gold = "#FF9F2E";
  const goldL = "#FFBE5C";
  const goldD = "#F07818";
  const tailRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 5) * 0.4;
    }
  });
  return (
    <group position={[0, 1.8, 0]}>
      {/* BADAN bulat utuh satu blok besar */}
      <B p={[0, 0, 0.3]} s={[1.7, 1.6, 2.4]} c={gold} />
      {/* punggung terang menyatu rapi */}
      <B p={[0, 0.55, 0.3]} s={[1.3, 0.6, 2.0]} c={goldL} />
      {/* perut gelap menyatu rapi */}
      <B p={[0, -0.65, 0.3]} s={[1.3, 0.4, 2.0]} c={goldD} />
      {/* KEPALA menyatu di depan badan (sedikit lebih kecil) */}
      <B p={[0, -0.05, 1.7]} s={[1.4, 1.3, 0.8]} c={gold} />
      {/* mata bersih: panel putih + pupil hitam di sisi kepala */}
      <Pair x={0.71} p={[0, 0.2, 1.75]} s={[0.14, 0.44, 0.44]} c="#ffffff" />
      <Pair x={0.79} p={[0, 0.2, 1.75]} s={[0.1, 0.24, 0.24]} c="#1d1d1f" />
      {/* mulut kecil */}
      <B p={[0, -0.3, 2.15]} s={[0.5, 0.3, 0.2]} c={goldD} />
      {/* sirip punggung tunggal rapi */}
      <B p={[0, 1.1, 0.2]} s={[0.18, 0.75, 1.1]} c={goldD} />
      {/* sirip dada sepasang simetris */}
      <Pair x={0.95} p={[0, -0.4, 1.1]} s={[0.4, 0.14, 0.6]} c={goldL} />
      {/* EKOR kipas rapi menyambung badan (pivot pangkal) */}
      <group ref={tailRef} position={[0, 0, -0.9]}>
        {/* pangkal menyempit nyambung badan */}
        <B p={[0, 0, -0.2]} s={[0.9, 0.9, 0.7]} c={gold} />
        {/* kipas ekor: 3 lembar vertikal bertingkat simetris */}
        <B p={[0, 0, -0.75]} s={[0.22, 1.3, 0.6]} c={goldL} />
        <Pair x={0.35} p={[0, 0, -0.85]} s={[0.2, 1.0, 0.55]} c={goldD} />
        {/* ujung kipas melebar */}
        <B p={[0, 0.55, -1.2]} s={[0.2, 0.55, 0.5]} c={goldL} />
        <B p={[0, -0.55, -1.2]} s={[0.2, 0.55, 0.5]} c={goldL} />
      </group>
    </group>
  );
}

/* ================= BAMBU TERBANG (satu batang panjang rapi) ================= */
export function Bamboo() {
  const green = "#6FB54E";
  const greenD = "#4E8C36";
  const leaf = "#8FD96A";
  return (
    <group position={[0, 2.0, 0]}>
      {/* satu batang bambu panjang (4 ruas sedang) */}
      <B p={[0, 0, 2.3]} s={[0.65, 0.65, 1.4]} c={green} />
      <B p={[0, 0, 0.8]} s={[0.65, 0.65, 1.4]} c={greenD} />
      <B p={[0, 0, -0.7]} s={[0.65, 0.65, 1.4]} c={green} />
      <B p={[0, 0, -2.2]} s={[0.65, 0.65, 1.4]} c={greenD} />
      {/* node ruas menonjol rapi */}
      <B p={[0, 0, 1.55]} s={[0.78, 0.78, 0.18]} c={greenD} />
      <B p={[0, 0, 0.05]} s={[0.78, 0.78, 0.18]} c={green} />
      <B p={[0, 0, -1.45]} s={[0.78, 0.78, 0.18]} c={greenD} />
      <B p={[0, 0, 3.0]} s={[0.78, 0.78, 0.18]} c={greenD} />
      {/* daun bambu rapi di ujung belakang */}
      <B p={[0, 0.3, -3.1]} s={[0.16, 0.1, 0.85]} c={leaf} r={[0.25, 0.25, 0]} />
      <B p={[0.3, 0.22, -3.15]} s={[0.16, 0.1, 0.75]} c={leaf} r={[0.15, -0.35, 0]} />
      <B p={[-0.3, 0.2, -3.1]} s={[0.14, 0.1, 0.7]} c={greenD} r={[0.1, 0.4, 0]} />
    </group>
  );
}

/* ================= ZABUTON (bantal cute) ================= */
export function Zabuton() {
  const top = "#F7A8BC";
  const topL = "#FBC4D2";
  const side = "#E88AA2";
  const cream = "#FDF2E0";
  return (
    <group position={[0, 1.6, 0]}>
      {/* bantal utama gembul pink lembut */}
      <B p={[0, 0, 0]} s={[2.9, 0.85, 2.9]} c={top} />
      {/* gembungan atas empuk 2 tingkat */}
      <B p={[0, 0.4, 0]} s={[2.4, 0.4, 2.4]} c={topL} />
      <B p={[0, 0.62, 0]} s={[1.7, 0.25, 1.7]} c={topL} />
      {/* sisi bawah */}
      <B p={[0, -0.35, 0]} s={[2.7, 0.3, 2.7]} c={side} />
      {/* sudut gembul membulat (bukan terjepit) */}
      <Pair x={1.5} p={[0, 0.05, 1.5]} s={[0.55, 0.65, 0.55]} c={topL} />
      <Pair x={1.5} p={[0, 0.05, -1.5]} s={[0.55, 0.65, 0.55]} c={topL} />
      {/* kancing tengah krem bulat cute */}
      <B p={[0, 0.78, 0]} s={[0.5, 0.22, 0.5]} c={cream} />
      <B p={[0, 0.9, 0]} s={[0.28, 0.14, 0.28]} c="#F5D9A8" />
      {/* muka cute di sisi depan: mata tidur + senyum */}
      <Pair x={0.55} p={[0, 0.12, 1.47]} s={[0.34, 0.1, 0.1]} c="#8C5A6A" />
      <B p={[0, -0.14, 1.47]} s={[0.3, 0.09, 0.1]} c="#8C5A6A" />
      {/* pipi merona di muka */}
      <Pair x={0.98} p={[0, -0.05, 1.47]} s={[0.26, 0.18, 0.08]} c="#F06A8C" />
    </group>
  );
}

/* ================= JET MINI (dengan afterburner) ================= */
export function MiniJet() {
  const body = "#D8DEE6";
  const bodyD = "#A8B4C2";
  const red = "#D6453A";
  const glass = "#7FD4FF";
  const flameRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (flameRef.current) {
      // api afterburner bergetar
      const pulse = 0.8 + Math.abs(Math.sin(t * 18)) * 0.5;
      flameRef.current.scale.set(1, 1, pulse);
    }
  });
  return (
    <group position={[0, 2.0, 0]} scale={0.85}>
      {/* badan jet runcing */}
      <B p={[0, 0, 2.6]} s={[0.7, 0.7, 1.0]} c={bodyD} />
      <B p={[0, 0, 1.4]} s={[1.1, 0.95, 1.6]} c={body} />
      <B p={[0, 0, -0.4]} s={[1.3, 1.1, 2.2]} c={body} />
      {/* hidung merah runcing */}
      <B p={[0, 0, 3.3]} s={[0.45, 0.45, 0.5]} c={red} />
      {/* kokpit kaca */}
      <B p={[0, 0.65, 0.9]} s={[0.8, 0.5, 1.3]} c={glass} />
      {/* sayap delta */}
      <Pair x={1.55} p={[0, -0.15, -0.5]} s={[1.9, 0.18, 1.5]} c={body} />
      <Pair x={2.3} p={[0, -0.15, -0.9]} s={[0.6, 0.16, 0.8]} c={red} />
      {/* ekor vertikal */}
      <B p={[0, 0.85, -1.4]} s={[0.18, 1.1, 0.9]} c={red} />
      {/* sayap ekor kecil */}
      <Pair x={0.95} p={[0, 0.2, -1.4]} s={[0.9, 0.14, 0.7]} c={bodyD} />
      {/* knalpot/nozzle */}
      <B p={[0, 0, -1.7]} s={[0.85, 0.85, 0.5]} c="#5C636E" />
      <B p={[0, 0, -1.95]} s={[0.65, 0.65, 0.2]} c="#3A3F47" />
      {/* API AFTERBURNER (NOS) bergetar */}
      <group ref={flameRef} position={[0, 0, -2.05]}>
        <mesh position={[0, 0, -0.5]}>
          <boxGeometry args={[0.55, 0.55, 1.0]} />
          <meshStandardMaterial
            color="#7FD4FF"
            emissive="#4FA9FF"
            emissiveIntensity={1.4}
            transparent
            opacity={0.85}
          />
        </mesh>
        <mesh position={[0, 0, -1.2]}>
          <boxGeometry args={[0.38, 0.38, 0.8]} />
          <meshStandardMaterial
            color="#FFE43A"
            emissive="#FFB400"
            emissiveIntensity={1.2}
            transparent
            opacity={0.7}
          />
        </mesh>
        <mesh position={[0, 0, -1.8]}>
          <boxGeometry args={[0.22, 0.22, 0.6]} />
          <meshStandardMaterial
            color="#FF8A3C"
            emissive="#FF6A1E"
            emissiveIntensity={1.0}
            transparent
            opacity={0.5}
          />
        </mesh>
      </group>
    </group>
  );
}

/* ================= KARPET TERBANG ALADDIN ================= */
export function MagicCarpet() {
  const purple = "#6B3FA0";
  const purpleD = "#4F2B7A";
  const gold = "#F2C230";
  const red = "#C0392B";
  return (
    <group position={[0, 2.2, 0]}>
      {/* badan utama datar (satu lempeng utuh) */}
      <B p={[0, 0, 0]} s={[3.2, 0.25, 3.7]} c={purple} />
      {/* lekukan ujung depan: naik halus, overlap dengan badan */}
      <B p={[0, 0.1, 1.95]} s={[3.2, 0.25, 0.9]} c={purple} r={[0.2, 0, 0]} />
      <B p={[0, 0.34, 2.62]} s={[3.2, 0.25, 0.75]} c={purpleD} r={[0.42, 0, 0]} />
      {/* lekukan ujung belakang: simetris */}
      <B p={[0, 0.1, -1.95]} s={[3.2, 0.25, 0.9]} c={purple} r={[-0.2, 0, 0]} />
      <B p={[0, 0.34, -2.62]} s={[3.2, 0.25, 0.75]} c={purpleD} r={[-0.42, 0, 0]} />
      {/* trim emas tipis di permukaan (bukan batang terpisah) */}
      <Pair x={1.3} p={[0, 0.14, 0]} s={[0.28, 0.06, 3.2]} c={gold} />
      <B p={[0, 0.14, 1.45]} s={[2.9, 0.06, 0.28]} c={gold} />
      <B p={[0, 0.14, -1.45]} s={[2.9, 0.06, 0.28]} c={gold} />
      {/* motif permata tengah */}
      <B p={[0, 0.15, 0]} s={[1.25, 0.07, 1.25]} c={gold} />
      <B p={[0, 0.2, 0]} s={[0.65, 0.07, 0.65]} c={red} />
      {/* rumbai emas menempel di 4 ujung sudut lekukan */}
      <Pair x={1.38} p={[0, 0.28, 2.98]} s={[0.2, 0.55, 0.2]} c={gold} />
      <Pair x={1.38} p={[0, 0.28, -2.98]} s={[0.2, 0.55, 0.2]} c={gold} />
    </group>
  );
}

/* ================= AWAN KINTON (Goku) ================= */
export function KintonCloud() {
  const y1 = "#FFD84D";
  const y2 = "#FFC527";
  const y3 = "#FFE78A";
  return (
    <group position={[0, 2.2, 0]}>
      {/* gumpalan utama */}
      <B p={[0, 0, 0]} s={[2.6, 1.4, 2.4]} c={y1} />
      {/* gumpalan samping */}
      <Pair x={1.7} p={[0, -0.15, 0.2]} s={[1.2, 1.1, 1.5]} c={y2} />
      {/* gumpalan depan-belakang */}
      <B p={[0, -0.1, 1.6]} s={[1.6, 1.1, 1.0]} c={y2} />
      <B p={[0, -0.05, -1.55]} s={[1.4, 1.0, 1.0]} c={y2} />
      {/* bumps atas empuk */}
      <B p={[0.6, 0.85, 0.4]} s={[1.1, 0.8, 1.0]} c={y3} />
      <B p={[-0.7, 0.8, -0.3]} s={[1.0, 0.7, 0.9]} c={y3} />
      <B p={[0.2, 0.75, -0.9]} s={[0.9, 0.6, 0.8]} c={y1} />
      <B p={[-0.4, 0.75, 0.9]} s={[0.8, 0.6, 0.7]} c={y1} />
      {/* bumps bawah */}
      <B p={[0.8, -0.8, 0.6]} s={[0.9, 0.6, 0.8]} c={y2} />
      <B p={[-0.8, -0.75, -0.5]} s={[0.8, 0.55, 0.7]} c={y2} />
      {/* ekor awan kecil */}
      <B p={[0, -0.3, -2.35]} s={[0.8, 0.6, 0.6]} c={y3} />
      <B p={[0, -0.4, -2.95]} s={[0.5, 0.4, 0.4]} c={y1} />
    </group>
  );
}

/* ================= DAUN RAKSASA ================= */
export function GiantLeaf() {
  const leaf = "#5CB544";
  const leafD = "#44933A";
  const vein = "#8FD96A";
  const stem = "#6B8F3E";
  return (
    <group position={[0, 2.2, 0]}>
      {/* badan daun (melebar di tengah, lancip di ujung) */}
      <B p={[0, 0, 1.9]} s={[1.2, 0.25, 0.9]} c={leaf} r={[0.12, 0, 0]} />
      <B p={[0, 0, 1.0]} s={[2.2, 0.25, 1.1]} c={leaf} />
      <B p={[0, -0.05, -0.1]} s={[2.8, 0.25, 1.3]} c={leafD} />
      <B p={[0, 0, -1.3]} s={[2.2, 0.25, 1.1]} c={leaf} />
      <B p={[0, 0.08, -2.3]} s={[1.3, 0.25, 0.9]} c={leafD} r={[-0.12, 0, 0]} />
      {/* tulang daun tengah */}
      <B p={[0, 0.16, 0]} s={[0.3, 0.1, 4.6]} c={vein} />
      {/* tulang daun samping */}
      <Pair x={0.75} p={[0, 0.14, 0.8]} s={[1.2, 0.08, 0.2]} c={vein} />
      <Pair x={0.85} p={[0, 0.12, -0.2]} s={[1.4, 0.08, 0.2]} c={vein} />
      <Pair x={0.7} p={[0, 0.14, -1.2]} s={[1.1, 0.08, 0.2]} c={vein} />
      {/* tangkai melengkung di belakang */}
      <B p={[0, -0.1, -3.0]} s={[0.35, 0.3, 0.8]} c={stem} r={[-0.3, 0, 0]} />
      <B p={[0, -0.45, -3.6]} s={[0.3, 0.3, 0.7]} c={stem} r={[-0.6, 0, 0]} />
    </group>
  );
}

/* ================= KERIS / PEDANG TERBANG ================= */
export function FlyingSword() {
  const blade = "#D4DCE6";
  const bladeL = "#F0F4F8";
  const bladeD = "#A8B4C2";
  const gold = "#D9A930";
  const handle = "#7A3B2E";
  const jade = "#4FAE7E";
  return (
    <group position={[0, 2.3, 0]}>
      {/* bilah keris berkelok (luk) */}
      <B p={[0, 0, 2.6]} s={[0.5, 0.18, 0.9]} c={bladeL} />
      <B p={[0.18, 0, 1.8]} s={[0.75, 0.2, 0.9]} c={blade} />
      <B p={[-0.15, 0, 1.0]} s={[0.85, 0.2, 0.9]} c={bladeD} />
      <B p={[0.15, 0, 0.2]} s={[0.95, 0.2, 0.9]} c={blade} />
      <B p={[-0.12, 0, -0.6]} s={[1.05, 0.2, 0.9]} c={bladeL} />
      <B p={[0.1, 0, -1.4]} s={[1.15, 0.2, 0.9]} c={blade} />
      {/* garis tengah bilah */}
      <B p={[0, 0.12, 0.6]} s={[0.18, 0.06, 4.2]} c={bladeL} />
      {/* gagang emas (ganja + hulu) */}
      <B p={[0, 0, -2.05]} s={[1.5, 0.35, 0.5]} c={gold} />
      <B p={[0, 0.1, -2.6]} s={[0.55, 0.55, 0.7]} c={handle} />
      <B p={[0.15, 0.3, -3.1]} s={[0.5, 0.5, 0.5]} c={handle} r={[0, 0, 0.4]} />
      {/* permata jade di gagang */}
      <B p={[0, 0.25, -2.05]} s={[0.35, 0.3, 0.35]} c={jade} />
      {/* aura energi wuxia */}
      <mesh position={[0, -0.25, 0.5]}>
        <boxGeometry args={[1.6, 0.12, 4.0]} />
        <meshStandardMaterial
          color="#9FD8FF"
          transparent
          opacity={0.3}
          emissive="#6FB8FF"
          emissiveIntensity={0.7}
        />
      </mesh>
    </group>
  );
}

/* ================= PIZZA SLICE ================= */
export function PizzaSlice() {
  const crust = "#D9933F";
  const crustD = "#B5742C";
  const cheese = "#FFCF52";
  const cheeseD = "#F0B93A";
  const pep = "#C43B2E";
  return (
    <group position={[0, 2.2, 0]}>
      {/* badan segitiga (lebar di belakang, lancip di depan) */}
      <B p={[0, 0, 2.2]} s={[0.7, 0.35, 0.9]} c={cheese} />
      <B p={[0, 0, 1.3]} s={[1.5, 0.35, 1.0]} c={cheeseD} />
      <B p={[0, 0, 0.3]} s={[2.3, 0.35, 1.0]} c={cheese} />
      <B p={[0, 0, -0.7]} s={[3.1, 0.35, 1.0]} c={cheeseD} />
      <B p={[0, 0, -1.65]} s={[3.9, 0.35, 0.9]} c={cheese} />
      {/* crust pinggir belakang */}
      <B p={[0, 0.25, -2.35]} s={[4.1, 0.75, 0.6]} c={crust} />
      <B p={[0, 0.45, -2.35]} s={[3.7, 0.4, 0.45]} c={crustD} />
      {/* pepperoni */}
      <B p={[0.7, 0.22, -1.3]} s={[0.75, 0.14, 0.75]} c={pep} />
      <B p={[-1.0, 0.22, -1.6]} s={[0.7, 0.14, 0.7]} c={pep} />
      <B p={[-0.3, 0.22, -0.1]} s={[0.65, 0.14, 0.65]} c={pep} />
      <B p={[0.6, 0.22, 1.0]} s={[0.55, 0.14, 0.55]} c={pep} />
      <B p={[0, 0.22, 1.9]} s={[0.45, 0.14, 0.45]} c={pep} />
      {/* keju meleleh netes di pinggir */}
      <Pair x={1.5} p={[0, -0.35, -0.8]} s={[0.3, 0.5, 0.35]} c={cheese} />
      <B p={[0.9, -0.4, 0.5]} s={[0.28, 0.55, 0.3]} c={cheeseD} />
      <B p={[-1.1, -0.3, -0.2]} s={[0.25, 0.4, 0.28]} c={cheese} />
      <B p={[0.2, -0.38, 1.6]} s={[0.22, 0.45, 0.25]} c={cheese} />
      {/* basil */}
      <B p={[1.3, 0.22, -0.5]} s={[0.3, 0.1, 0.3]} c="#4E9E3C" />
      <B p={[-0.9, 0.22, 0.8]} s={[0.26, 0.1, 0.26]} c="#4E9E3C" />
    </group>
  );
}

/* ================= SUSHI SALMON ================= */
export function Sushi() {
  const rice = "#F8F6EE";
  const riceD = "#E8E4D4";
  const salmon = "#F28A5C";
  const salmonL = "#F8AD85";
  const nori = "#1F2B20";
  return (
    <group position={[0, 2.2, 0]}>
      {/* nasi (bawah, membulat) */}
      <B p={[0, -0.2, 0]} s={[2.3, 0.9, 3.4]} c={rice} />
      <B p={[0, -0.55, 0]} s={[2.0, 0.4, 3.0]} c={riceD} />
      {/* tekstur butir nasi */}
      <Pair x={1.18} p={[0, -0.1, 0.8]} s={[0.12, 0.3, 0.4]} c={riceD} />
      <Pair x={1.18} p={[0, -0.3, -0.9]} s={[0.12, 0.3, 0.4]} c="#ffffff" />
      {/* salmon di atas (lebih panjang dari nasi) */}
      <B p={[0, 0.45, 0]} s={[2.5, 0.45, 3.9]} c={salmon} />
      <B p={[0, 0.55, 0]} s={[2.52, 0.2, 3.5]} c={salmonL} />
      {/* ujung salmon turun */}
      <B p={[0, 0.25, 2.0]} s={[2.4, 0.4, 0.5]} c={salmon} r={[0.25, 0, 0]} />
      <B p={[0, 0.25, -2.0]} s={[2.4, 0.4, 0.5]} c={salmon} r={[-0.25, 0, 0]} />
      {/* garis lemak salmon */}
      <B p={[0, 0.69, 0.7]} s={[2.1, 0.06, 0.22]} c="#FBD9C4" />
      <B p={[0, 0.69, -0.4]} s={[2.1, 0.06, 0.22]} c="#FBD9C4" />
      <B p={[0, 0.69, -1.4]} s={[2.1, 0.06, 0.22]} c="#FBD9C4" />
      {/* ikat nori */}
      <B p={[0, 0.1, 0.15]} s={[2.6, 1.7, 0.8]} c={nori} />
      {/* wasabi kecil nempel */}
      <B p={[1.1, 0.85, 0.15]} s={[0.35, 0.3, 0.35]} c="#7CB83E" />
    </group>
  );
}

/* ================= PISANG KUPAS ================= */
export function Banana() {
  const peel = "#FFD83D";
  const peelD = "#E8BC22";
  const flesh = "#FBF3D0";
  const tip = "#8C6A2E";
  return (
    <group position={[0, 2.1, 0]}>
      {/* dasar kulit (mangkuk bawah utuh) */}
      <B p={[0, -0.45, 0]} s={[1.7, 0.55, 3.2]} c={peel} />
      {/* bibir kulit depan-belakang sedikit naik */}
      <B p={[0, -0.25, 1.7]} s={[1.7, 0.5, 0.5]} c={peelD} />
      <B p={[0, -0.25, -1.7]} s={[1.7, 0.5, 0.5]} c={peelD} />
      {/* daging pisang (tempat duduk) menyatu dengan kulit */}
      <B p={[0, -0.05, 0]} s={[1.35, 0.65, 2.8]} c={flesh} />
      <B p={[0, 0.28, 0]} s={[1.1, 0.3, 2.4]} c="#F5EBC0" />
      {/* kulit samping terkupas, simetris kiri-kanan, pangkal menempel badan */}
      <B p={[1.25, -0.02, 0]} s={[1.2, 0.22, 2.5]} c={peel} r={[0, 0, -0.9]} />
      <B p={[-1.25, -0.02, 0]} s={[1.2, 0.22, 2.5]} c={peel} r={[0, 0, 0.9]} />
      {/* kulit belakang menjuntai turun, pangkal menempel badan */}
      <B p={[0, -0.12, -1.95]} s={[1.15, 0.22, 1.1]} c={peel} r={[-0.9, 0, 0]} />
      <B p={[0, -0.75, -2.35]} s={[1.0, 0.2, 0.8]} c={peelD} r={[-1.25, 0, 0]} />
      {/* tangkai depan */}
      <B p={[0, -0.25, 1.95]} s={[0.5, 0.5, 0.6]} c={peelD} r={[0.3, 0, 0]} />
      <B p={[0, -0.02, 2.35]} s={[0.35, 0.35, 0.45]} c={tip} r={[0.3, 0, 0]} />
    </group>
  );
}

/* ================= ES KRIM STIK LELEH ================= */
export function IceCream() {
  const pink = "#F58FB0";
  const pinkD = "#E06A94";
  const pinkL = "#FBB8CE";
  const stick = "#D9B380";
  const bite = "#FBE4EC";
  const tilt = -0.3;
  return (
    <group position={[0, 2.5, -0.5]}>
      {/* pivot point di pangkal batang stik; seluruh es krim miring mengitari stik */}
      <group rotation={[tilt, 0, 0]}>
        {/* stik kayu di titik pivot */}
        <B p={[0, 0, -0.7]} s={[0.8, 0.35, 1.5]} c={stick} />
        <B p={[0, 0, -1.5]} s={[0.6, 0.32, 0.5]} c={stick} />
        {/* badan es krim memanjang ke depan dari stik */}
        <B p={[0, 0, 1.9]} s={[2.4, 0.6, 3.4]} c={pink} />
        {/* sudut atas membulat */}
        <B p={[0, 0.05, 3.7]} s={[1.9, 0.55, 0.5]} c={pinkD} />
        {/* bekas gigitan di pojok */}
        <B p={[0.85, 0.05, 3.45]} s={[0.75, 0.62, 0.8]} c={bite} />
        <B p={[1.1, 0.05, 3.05]} s={[0.4, 0.62, 0.5]} c={bite} />
        {/* lapisan glossy atas */}
        <B p={[0, 0.32, 1.7]} s={[2.0, 0.1, 2.6]} c={pinkL} />
        {/* lelehan mengalir ke sisi rendah (dekat stik), tetesan tegak lurus dunia */}
        <B p={[1.1, -0.5, 0.5]} s={[0.35, 0.75, 0.4]} c={pinkD} r={[-tilt, 0, 0]} />
        <B p={[-1.05, -0.6, 0.7]} s={[0.3, 0.95, 0.35]} c={pink} r={[-tilt, 0, 0]} />
        <B p={[0.3, -0.5, 0.35]} s={[0.28, 0.65, 0.3]} c={pinkD} r={[-tilt, 0, 0]} />
        {/* lelehan menetes ke batang stik */}
        <B p={[0, -0.18, 0.1]} s={[0.5, 0.45, 0.5]} c={pink} />
        <B p={[0, -0.3, -0.35]} s={[0.32, 0.35, 0.45]} c={pinkD} />
        {/* tetesan jatuh */}
        <B p={[1.1, -1.15, 0.65]} s={[0.22, 0.3, 0.22]} c={pinkD} r={[-tilt, 0, 0]} />
        <B p={[-1.05, -1.4, 0.95]} s={[0.2, 0.28, 0.2]} c={pink} r={[-tilt, 0, 0]} />
        {/* sprinkles */}
        <B p={[0.5, 0.4, 2.4]} s={[0.14, 0.1, 0.3]} c="#5AC8FF" />
        <B p={[-0.7, 0.4, 1.8]} s={[0.3, 0.1, 0.14]} c="#FFE066" />
        <B p={[0.2, 0.4, 0.9]} s={[0.14, 0.1, 0.3]} c="#7CE07C" />
        <B p={[-0.3, 0.4, 2.9]} s={[0.26, 0.1, 0.13]} c="#ffffff" />
      </group>
    </group>
  );
}

/* ================= DRONE QUADCOPTER ================= */
export function Drone() {
  const r0 = useRef<THREE.Group>(null);
  const r1 = useRef<THREE.Group>(null);
  const r2 = useRef<THREE.Group>(null);
  const r3 = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    const spd = 28;
    if (r0.current) r0.current.rotation.y += dt * spd;
    if (r1.current) r1.current.rotation.y -= dt * spd;
    if (r2.current) r2.current.rotation.y -= dt * spd;
    if (r3.current) r3.current.rotation.y += dt * spd;
  });

  const whiteBody = "#FFFFFF";
  const whiteTrim = "#F1F5F9";
  const silverD = "#CBD5E1";
  const redSport = "#EF4444";
  const redSeat = "#E63946";
  const redSeatDark = "#B91C1C";
  const tipRed = "#FF3B30";

  return (
    <group position={[0, 2.2, 0]} scale={0.8}>
      {/* Central fuselage / bodi utama drone putih bersih aerodinamis */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.85, 0.5, 3.8]} />
        <meshStandardMaterial color={whiteBody} roughness={0.25} metalness={0.08} />
      </mesh>
      {/* Cangkang bawah drone (silver-white) */}
      <mesh position={[0, -0.28, 0]} receiveShadow>
        <boxGeometry args={[1.4, 0.24, 3.1]} />
        <meshStandardMaterial color={silverD} roughness={0.3} metalness={0.12} />
      </mesh>
      {/* Strip racing merah sporty di sepanjang bodi */}
      <mesh position={[0, 0.26, 0]}>
        <boxGeometry args={[0.35, 0.04, 3.7]} />
        <meshStandardMaterial color={redSport} roughness={0.2} />
      </mesh>
      <mesh position={[0.7, 0.12, 0]}>
        <boxGeometry args={[0.06, 0.16, 2.8]} />
        <meshStandardMaterial color={redSport} roughness={0.2} />
      </mesh>
      <mesh position={[-0.7, 0.12, 0]}>
        <boxGeometry args={[0.06, 0.16, 2.8]} />
        <meshStandardMaterial color={redSport} roughness={0.2} />
      </mesh>

      {/* KURSI MERAH MINI (tempat duduk / pijakan rider) */}
      <mesh position={[0, 0.25, -0.1]} castShadow>
        <boxGeometry args={[1.15, 0.08, 1.3]} />
        <meshStandardMaterial color={redSeat} roughness={0.4} />
      </mesh>
      {/* Sandaran kursi merah mini */}
      <mesh position={[0, 0.48, -0.72]} castShadow>
        <boxGeometry args={[0.95, 0.42, 0.14]} />
        <meshStandardMaterial color={redSeatDark} roughness={0.4} />
      </mesh>
      {/* Pelindung sisi kursi */}
      <mesh position={[0.55, 0.35, -0.15]}>
        <boxGeometry args={[0.08, 0.22, 1.0]} />
        <meshStandardMaterial color={redSeatDark} roughness={0.4} />
      </mesh>
      <mesh position={[-0.55, 0.35, -0.15]}>
        <boxGeometry args={[0.08, 0.22, 1.0]} />
        <meshStandardMaterial color={redSeatDark} roughness={0.4} />
      </mesh>

      {/* Kamera gimbal 4K di hidung depan */}
      <mesh position={[0, -0.06, 2.02]} castShadow>
        <boxGeometry args={[0.55, 0.4, 0.35]} />
        <meshStandardMaterial color={silverD} roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[0, -0.06, 2.21]}>
        <boxGeometry args={[0.32, 0.28, 0.08]} />
        <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={0.8} />
      </mesh>

      {/* Lampu Navigasi Depan (Hijau Neon Menyala) */}
      <mesh position={[0.65, 0.12, 1.95]}>
        <boxGeometry args={[0.2, 0.16, 0.1]} />
        <meshStandardMaterial color="#22C55E" emissive="#22C55E" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[-0.65, 0.12, 1.95]}>
        <boxGeometry args={[0.2, 0.16, 0.1]} />
        <meshStandardMaterial color="#22C55E" emissive="#22C55E" emissiveIntensity={1.2} />
      </mesh>

      {/* Lampu Navigasi Belakang (Merah Ruby Menyala) */}
      <mesh position={[0.65, 0.12, -1.95]}>
        <boxGeometry args={[0.2, 0.16, 0.1]} />
        <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[-0.65, 0.12, -1.95]}>
        <boxGeometry args={[0.2, 0.16, 0.1]} />
        <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1.2} />
      </mesh>

      {/* 4 Lengan diagonal aerodinamis putih */}
      <mesh position={[1.1, 0.02, 1.7]} rotation-y={-0.785} castShadow>
        <boxGeometry args={[1.5, 0.22, 0.38]} />
        <meshStandardMaterial color={whiteTrim} roughness={0.3} />
      </mesh>
      <mesh position={[-1.1, 0.02, 1.7]} rotation-y={0.785} castShadow>
        <boxGeometry args={[1.5, 0.22, 0.38]} />
        <meshStandardMaterial color={whiteTrim} roughness={0.3} />
      </mesh>
      <mesh position={[1.1, 0.02, -1.7]} rotation-y={0.785} castShadow>
        <boxGeometry args={[1.5, 0.22, 0.38]} />
        <meshStandardMaterial color={whiteTrim} roughness={0.3} />
      </mesh>
      <mesh position={[-1.1, 0.02, -1.7]} rotation-y={-0.785} castShadow>
        <boxGeometry args={[1.5, 0.22, 0.38]} />
        <meshStandardMaterial color={whiteTrim} roughness={0.3} />
      </mesh>

      {/* 4 Rotor & Baling-Baling Terang */}
      <group position={[1.7, 0.22, 2.3]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.42, 0.35, 0.42]} />
          <meshStandardMaterial color={silverD} metalness={0.2} roughness={0.3} />
        </mesh>
        <group ref={r0} position={[0, 0.24, 0]}>
          <mesh castShadow>
            <boxGeometry args={[2.1, 0.07, 0.28]} />
            <meshStandardMaterial color={whiteBody} roughness={0.2} />
          </mesh>
          <mesh castShadow>
            <boxGeometry args={[0.28, 0.07, 2.1]} />
            <meshStandardMaterial color={whiteBody} roughness={0.2} />
          </mesh>
          <mesh position={[0.95, 0.005, 0]}><boxGeometry args={[0.22, 0.075, 0.28]} /><meshStandardMaterial color={tipRed} /></mesh>
          <mesh position={[-0.95, 0.005, 0]}><boxGeometry args={[0.22, 0.075, 0.28]} /><meshStandardMaterial color={tipRed} /></mesh>
          <mesh position={[0, 0.005, 0.95]}><boxGeometry args={[0.28, 0.075, 0.22]} /><meshStandardMaterial color={tipRed} /></mesh>
          <mesh position={[0, 0.005, -0.95]}><boxGeometry args={[0.28, 0.075, 0.22]} /><meshStandardMaterial color={tipRed} /></mesh>
          <mesh position={[0, 0.06, 0]}><boxGeometry args={[0.26, 0.08, 0.26]} /><meshStandardMaterial color={silverD} metalness={0.3} /></mesh>
        </group>
      </group>

      <group position={[-1.7, 0.22, 2.3]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.42, 0.35, 0.42]} />
          <meshStandardMaterial color={silverD} metalness={0.2} roughness={0.3} />
        </mesh>
        <group ref={r1} position={[0, 0.24, 0]}>
          <mesh castShadow>
            <boxGeometry args={[2.1, 0.07, 0.28]} />
            <meshStandardMaterial color={whiteBody} roughness={0.2} />
          </mesh>
          <mesh castShadow>
            <boxGeometry args={[0.28, 0.07, 2.1]} />
            <meshStandardMaterial color={whiteBody} roughness={0.2} />
          </mesh>
          <mesh position={[0.95, 0.005, 0]}><boxGeometry args={[0.22, 0.075, 0.28]} /><meshStandardMaterial color={tipRed} /></mesh>
          <mesh position={[-0.95, 0.005, 0]}><boxGeometry args={[0.22, 0.075, 0.28]} /><meshStandardMaterial color={tipRed} /></mesh>
          <mesh position={[0, 0.005, 0.95]}><boxGeometry args={[0.28, 0.075, 0.22]} /><meshStandardMaterial color={tipRed} /></mesh>
          <mesh position={[0, 0.005, -0.95]}><boxGeometry args={[0.28, 0.075, 0.22]} /><meshStandardMaterial color={tipRed} /></mesh>
          <mesh position={[0, 0.06, 0]}><boxGeometry args={[0.26, 0.08, 0.26]} /><meshStandardMaterial color={silverD} metalness={0.3} /></mesh>
        </group>
      </group>

      <group position={[1.7, 0.22, -2.3]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.42, 0.35, 0.42]} />
          <meshStandardMaterial color={silverD} metalness={0.2} roughness={0.3} />
        </mesh>
        <group ref={r2} position={[0, 0.24, 0]}>
          <mesh castShadow>
            <boxGeometry args={[2.1, 0.07, 0.28]} />
            <meshStandardMaterial color={whiteBody} roughness={0.2} />
          </mesh>
          <mesh castShadow>
            <boxGeometry args={[0.28, 0.07, 2.1]} />
            <meshStandardMaterial color={whiteBody} roughness={0.2} />
          </mesh>
          <mesh position={[0.95, 0.005, 0]}><boxGeometry args={[0.22, 0.075, 0.28]} /><meshStandardMaterial color={tipRed} /></mesh>
          <mesh position={[-0.95, 0.005, 0]}><boxGeometry args={[0.22, 0.075, 0.28]} /><meshStandardMaterial color={tipRed} /></mesh>
          <mesh position={[0, 0.005, 0.95]}><boxGeometry args={[0.28, 0.075, 0.22]} /><meshStandardMaterial color={tipRed} /></mesh>
          <mesh position={[0, 0.005, -0.95]}><boxGeometry args={[0.28, 0.075, 0.22]} /><meshStandardMaterial color={tipRed} /></mesh>
          <mesh position={[0, 0.06, 0]}><boxGeometry args={[0.26, 0.08, 0.26]} /><meshStandardMaterial color={silverD} metalness={0.3} /></mesh>
        </group>
      </group>

      <group position={[-1.7, 0.22, -2.3]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.42, 0.35, 0.42]} />
          <meshStandardMaterial color={silverD} metalness={0.2} roughness={0.3} />
        </mesh>
        <group ref={r3} position={[0, 0.24, 0]}>
          <mesh castShadow>
            <boxGeometry args={[2.1, 0.07, 0.28]} />
            <meshStandardMaterial color={whiteBody} roughness={0.2} />
          </mesh>
          <mesh castShadow>
            <boxGeometry args={[0.28, 0.07, 2.1]} />
            <meshStandardMaterial color={whiteBody} roughness={0.2} />
          </mesh>
          <mesh position={[0.95, 0.005, 0]}><boxGeometry args={[0.22, 0.075, 0.28]} /><meshStandardMaterial color={tipRed} /></mesh>
          <mesh position={[-0.95, 0.005, 0]}><boxGeometry args={[0.22, 0.075, 0.28]} /><meshStandardMaterial color={tipRed} /></mesh>
          <mesh position={[0, 0.005, 0.95]}><boxGeometry args={[0.28, 0.075, 0.22]} /><meshStandardMaterial color={tipRed} /></mesh>
          <mesh position={[0, 0.005, -0.95]}><boxGeometry args={[0.28, 0.075, 0.22]} /><meshStandardMaterial color={tipRed} /></mesh>
          <mesh position={[0, 0.06, 0]}><boxGeometry args={[0.26, 0.08, 0.26]} /><meshStandardMaterial color={silverD} metalness={0.3} /></mesh>
        </group>
      </group>
    </group>
  );
}

/* ================= Registry ================= */
export type Skin = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bg: [string, string];
  desc: string;
  Comp: React.FC;
  float?: boolean;
};

export const SKINS: Skin[] = [
  {
    id: "duck",
    name: "Bebek Kuning",
    emoji: "🦆",
    color: "#FFD83D",
    bg: ["#FFE98A", "#FFB347"],
    desc: "Kwek kwek! Si bebek kuning klasik dengan paruh oranye lebar, siap nyebrang jalan.",
    Comp: Duck,
  },
  {
    id: "chicken",
    name: "Ayam Putih",
    emoji: "🐔",
    color: "#F7F7F2",
    bg: ["#BFE8FF", "#7CC6F2"],
    desc: "Legenda Crossy Road! Kenapa ayam nyebrang jalan? Karena dia skin original.",
    Comp: Chicken,
  },
  {
    id: "mallard",
    name: "Bebek Mallard",
    emoji: "🦆",
    color: "#3E8E6B",
    bg: ["#C8E8D8", "#88C4A8"],
    desc: "Bebek jantan kepala hijau dengan cincin leher putih. Skin klasik yang elegan!",
    Comp: Mallard,
  },
  {
    id: "pigeon",
    name: "Pigeon",
    emoji: "🕊️",
    color: "#C9C4BE",
    bg: ["#D8E4E8", "#A0B4BC"],
    desc: "Merpati kota dengan leher teal berkilau dan paruh pink. Kurr kurr!",
    Comp: Pigeon,
  },
  {
    id: "shiba",
    name: "Baby Shiba Inu",
    emoji: "🐕",
    color: "#E89A3C",
    bg: ["#FFD9A8", "#F2A65A"],
    desc: "Anak shiba berkepala besar dengan ekor melingkar mungil. Much baby, very wow!",
    Comp: Shiba,
  },
  {
    id: "penguin",
    name: "Penguin",
    emoji: "🐧",
    color: "#2E3038",
    bg: ["#C9E9FF", "#8FC8F2"],
    desc: "Penguin gembul bermata besar dengan pipi merona. Goyang-goyang gemas!",
    Comp: Penguin,
  },
  {
    id: "panda",
    name: "Panda",
    emoji: "🐼",
    color: "#2A2A30",
    bg: ["#D8F2D0", "#9BD68E"],
    desc: "Gemas maksimal, hobinya makan bambu dan rebahan 16 jam sehari.",
    Comp: Panda,
  },
  {
    id: "dino",
    name: "Dino Hijau",
    emoji: "🦖",
    color: "#53C14E",
    bg: ["#C8F2B0", "#7ED17A"],
    desc: "Dinosaurus hijau cute dengan pipi merona. Rawr artinya 'aku sayang kamu'.",
    Comp: Dino,
  },
  {
    id: "frog",
    name: "Katak Hijau",
    emoji: "🐸",
    color: "#5FBF4A",
    bg: ["#D4F2B8", "#8FD672"],
    desc: "Si katak hijau bermata besar. Hobinya lompat-lompat dan bilang 'ribbit'.",
    Comp: Frog,
  },
  {
    id: "babyturtle",
    name: "Bayi Kura-kura",
    emoji: "🐢",
    color: "#4E9E4A",
    bg: ["#C2F0D8", "#7ACCA0"],
    desc: "Bayi kura-kura berdiri dengan mata besar berbinar. Jalannya pelan tapi gemasnya cepat!",
    Comp: BabyTurtle,
  },
  {
    id: "manekineko",
    name: "Maneki Neko",
    emoji: "🐱",
    color: "#F8F6F0",
    bg: ["#FFE3E8", "#F2A8B8"],
    desc: "Kucing putih keberuntungan penjaga toko. Lambaian tangannya mengundang rezeki!",
    Comp: ManekiNeko,
  },
  {
    id: "tanuki",
    name: "Tanuki",
    emoji: "🦝",
    color: "#8C6239",
    bg: ["#F2DDB8", "#D9A86C"],
    desc: "Rakun ajaib Jepang dengan daun di kepala. Suka iseng dan bisa berubah wujud!",
    Comp: Tanuki,
  },
  {
    id: "shaun",
    name: "Shaun the Sheep",
    emoji: "🐑",
    color: "#F5F2E8",
    bg: ["#D8ECC8", "#A0CC88"],
    desc: "Domba paling pintar di peternakan! Wol fluffy, kepala hitam, penuh akal.",
    Comp: ShaunSheep,
  },
  {
    id: "polarbear",
    name: "Baby Polar Bear",
    emoji: "🐻‍❄️",
    color: "#F6F4EE",
    bg: ["#D8ECF5", "#A8CCE0"],
    desc: "Anak beruang kutub gembul dengan pipi merona. Putih, bulat, menggemaskan!",
    Comp: PolarBear,
  },
  {
    id: "beaver",
    name: "Baby Beaver",
    emoji: "🦫",
    color: "#9C6B3F",
    bg: ["#E8D9C0", "#C4A878"],
    desc: "Bayi berang-berang dengan gigi besar dan ekor pipih, meluk ranting kesayangan!",
    Comp: BabyBeaver,
  },
  {
    id: "teddy",
    name: "Baby Teddy Bear",
    emoji: "🧸",
    color: "#D49A5E",
    bg: ["#F5DCC0", "#DCAE7E"],
    desc: "Bayi boneka beruang dengan kepala besar dan tangan terbuka minta digendong!",
    Comp: TeddyBear,
  },
  {
    id: "axolotl",
    name: "Axolotl",
    emoji: "🦎",
    color: "#F8C8D4",
    bg: ["#FDE0EA", "#F2A8C4"],
    desc: "Salamander pink dengan insang bercabang dan senyum abadi. Selalu happy!",
    Comp: Axolotl,
  },
  {
    id: "redpanda",
    name: "Red Panda",
    emoji: "🦊",
    color: "#C45A2E",
    bg: ["#F5D0B8", "#DC9468"],
    desc: "Panda merah dengan ekor belang panjang dan pipi putih. Gemasnya kebangetan!",
    Comp: RedPanda,
  },
  {
    id: "fennec",
    name: "Rubah Fennec",
    emoji: "🦊",
    color: "#EFD9A8",
    bg: ["#F8ECC8", "#E0C488"],
    desc: "Rubah gurun mungil dengan telinga raksasa dan mata besar. Radar imut aktif!",
    Comp: FennecFox,
  },
  {
    id: "squirrel",
    name: "Tupai Terbang",
    emoji: "🐿️",
    color: "#A8AEB8",
    bg: ["#DDE4EC", "#A8B6C8"],
    desc: "Tupai terbang Siberia bermata super besar dengan membran meluncur terbuka!",
    Comp: FlyingSquirrel,
  },
  {
    id: "hedgehog",
    name: "Landak Kerdil",
    emoji: "🦔",
    color: "#7A5C3E",
    bg: ["#EADCC8", "#C8B090"],
    desc: "Hedgehog mungil berduri lembut dengan moncong lancip dan pipi merona!",
    Comp: Hedgehog,
  },
  {
    id: "capybara",
    name: "Capybara",
    emoji: "🦫",
    color: "#B08A54",
    bg: ["#EEDFC0", "#CBAD7E"],
    desc: "Raja santai dengan jeruk yuzu di kepala. Chill level: maksimal. Ok I pull up.",
    Comp: Capybara,
  },
  {
    id: "kirin",
    name: "Baby Kirin",
    emoji: "🐉",
    color: "#6FA8C9",
    bg: ["#C8E0F0", "#78A8C9"],
    desc: "Bayi kirin biru bertanduk emas dengan surai api. Pasangkan efek petir biar makin sakti!",
    Comp: Kirin,
  },
  {
    id: "monk",
    name: "Biksu Zen",
    emoji: "🧘",
    color: "#D97B2E",
    bg: ["#F0E4D0", "#C9B490"],
    desc: "Berdiri tenang dengan tangan anjali. Pikirannya kebal dari segala gangguan.",
    Comp: ZenMonk,
  },
  {
    id: "koi",
    name: "Koi",
    emoji: "🐟",
    color: "#F0622E",
    bg: ["#FFE0D0", "#F0A888"],
    desc: "Ikan koi putih-oranye yang berenang di udara, ekornya mengibas anggun!",
    Comp: Koi,
    float: true,
  },
  {
    id: "goldfish",
    name: "Goldfish",
    emoji: "🐠",
    color: "#F5A623",
    bg: ["#FFE8C0", "#F0C068"],
    desc: "Ikan mas koki gembul dengan ekor kipas ganda. Blub blub~",
    Comp: Goldfish,
    float: true,
  },
  {
    id: "bamboo",
    name: "Bambu Terbang",
    emoji: "🎋",
    color: "#6FB54E",
    bg: ["#D8F0C8", "#98CC78"],
    desc: "Batang bambu beruas dengan daun hijau segar. Terbang ala panda kungfu!",
    Comp: Bamboo,
    float: true,
  },
  {
    id: "zabuton",
    name: "Zabuton",
    emoji: "🩷",
    color: "#F7A8BC",
    bg: ["#FBE0E8", "#F0B0C4"],
    desc: "Bantal pink gembul dengan muka tidur damai. Mendarat selalu dengan pantulan lembut!",
    Comp: Zabuton,
    float: true,
  },
  {
    id: "minijet",
    name: "Jet Mini",
    emoji: "✈️",
    color: "#D8DEE6",
    bg: ["#C8D8F0", "#88A4CC"],
    desc: "Jet tempur mini dengan afterburner menyala biru-kuning. Full throttle!",
    Comp: MiniJet,
    float: true,
  },
  {
    id: "keitruck",
    name: "Kei Truck Mini",
    emoji: "🛻",
    color: "#F2F2EE",
    bg: ["#D8E0E8", "#A0AEBC"],
    desc: "Truk mini Jepang dengan bak terbuka berisi muatan sayur. Kawaii transport!",
    Comp: KeiTruck,
    float: true,
  },
  {
    id: "broom",
    name: "Sapu Terbang",
    emoji: "🧹",
    color: "#E8C25A",
    bg: ["#D8C2F0", "#A98BD6"],
    desc: "Sapu sihir dengan percikan ajaib. Siap terbang ke sekolah sihir!",
    Comp: Broom,
    float: true,
  },
  {
    id: "ufo",
    name: "UFO Mini",
    emoji: "🛸",
    color: "#B9C4CE",
    bg: ["#B8C8F2", "#7E92D9"],
    desc: "Piring terbang mungil dengan pilot alien hijau dan sinar traktor. Beep boop!",
    Comp: Ufo,
    float: true,
  },
  {
    id: "surfboard",
    name: "Papan Silver Surfer",
    emoji: "🏄",
    color: "#D9DEE6",
    bg: ["#C2D4E8", "#8FA8C9"],
    desc: "Papan selancar kosmik serba chrome dengan jejak energi. Power cosmic!",
    Comp: SurferBoard,
    float: true,
  },
  {
    id: "carpet",
    name: "Karpet Terbang",
    emoji: "🪄",
    color: "#6B3FA0",
    bg: ["#E8D4F2", "#A87BD0"],
    desc: "Karpet ajaib ungu-emas dari Agrabah. A whole new world menantimu!",
    Comp: MagicCarpet,
    float: true,
  },
  {
    id: "kinton",
    name: "Awan Kinton",
    emoji: "☁️",
    color: "#FFD84D",
    bg: ["#BFE4FF", "#7FC2F0"],
    desc: "Awan kuning empuk milik Goku. Hanya yang berhati murni bisa menaikinya!",
    Comp: KintonCloud,
    float: true,
  },
  {
    id: "leaf",
    name: "Daun Raksasa",
    emoji: "🍃",
    color: "#5CB544",
    bg: ["#DCF2C8", "#9AD47C"],
    desc: "Daun hijau lebar kendaraan para peri hutan. Ada embun seger di atasnya!",
    Comp: GiantLeaf,
    float: true,
  },
  {
    id: "sword",
    name: "Keris Terbang",
    emoji: "⚔️",
    color: "#D4DCE6",
    bg: ["#C8D8E8", "#8FA3C2"],
    desc: "Bilah keris berkelok dengan aura energi biru. Terbang ala pendekar wuxia!",
    Comp: FlyingSword,
    float: true,
  },
  {
    id: "pizza",
    name: "Pizza Slice",
    emoji: "🍕",
    color: "#FFCF52",
    bg: ["#FFE0B8", "#F0A868"],
    desc: "Potongan pizza pepperoni dengan keju meleleh di pinggir. Mamma mia!",
    Comp: PizzaSlice,
    float: true,
  },
  {
    id: "sushi",
    name: "Sushi Salmon",
    emoji: "🍣",
    color: "#F28A5C",
    bg: ["#FFD8C8", "#F0A088"],
    desc: "Nigiri salmon segar dengan ikat nori dan wasabi. Oishii desu~!",
    Comp: Sushi,
    float: true,
  },
  {
    id: "banana",
    name: "Pisang Kupas",
    emoji: "🍌",
    color: "#FFD83D",
    bg: ["#FFF0B8", "#F0CE68"],
    desc: "Duduk empuk di dalam pisang yang kulitnya terkupas. Potassium power!",
    Comp: Banana,
    float: true,
  },
  {
    id: "icecream",
    name: "Es Krim Leleh",
    emoji: "🍦",
    color: "#F58FB0",
    bg: ["#FFDCE8", "#F0A0C0"],
    desc: "Es krim stroberi digigit sebagian, netes-netes manis plus sprinkles!",
    Comp: IceCream,
    float: true,
  },
  {
    id: "drone",
    name: "Drone Quadcopter",
    emoji: "🚁",
    color: "#4A5568",
    bg: ["#C8D4E0", "#8A9BB0"],
    desc: "Drone 4 baling-baling berputar kencang dengan kursi merah mini. Siap take-off!",
    Comp: Drone,
    float: true,
  },
];
