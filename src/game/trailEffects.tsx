import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { engine } from "./engine";

/* ============ util: deterministic pseudo-random per index ============ */
function rnd(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

interface EffectProps {
  width?: number;
  length?: number;
  wave?: number; // Tingkat gelombang & delay flow telat naik (0.0 = lurus kaku/instan, 1.0 = normal flow, 2.5 = sangat bergelombang & telat)
}

/* =========================================================================
   TRAIL PHYSICS HISTORY & ELEVATION FLOW ENGINE
   Melacak ketinggian lompatan (p.h), kecepatan vertikal (p.vh), dan laju gerak
   secara real-time agar saat melompat atau air jump, efek trail tidak kaku
   naik sekaligus bersama papan, melainkan MENGALIR TELAT NAIK (flow delay)
   seperti fisika fluida/pita aerodinamis yang menjuntai alami dari aspal ke udara!
   Dapat diatur tingkat gelombang & delay-nya lewat parameter waveMultiplier!
   ========================================================================= */

interface HeightSample {
  t: number;   // Timestamp (detik)
  h: number;   // Ketinggian lompat pemain di atas jalan raya (p.h)
  vh: number;  // Kecepatan vertikal (p.vh)
}

class TrailPhysicsHistory {
  private samples: HeightSample[] = [];
  private maxSamples = 240;
  private currentH = 0;
  private currentVh = 0;
  private currentSpeed = 14;

  public reset() {
    this.samples = [];
    this.currentH = 0;
    this.currentVh = 0;
    this.currentSpeed = 14;
  }

  public update(now: number, h: number, vh: number, speed: number) {
    this.currentH = h;
    this.currentVh = vh;
    this.currentSpeed = Math.max(speed, 6.0);

    this.samples.push({ t: now, h, vh });
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
  }

  /**
   * Menghitung offset Y lokal untuk titik trail pada jarak xDist di belakang papan.
   * Parameter waveMultiplier (0.0 s/d 3.0):
   * - 0.0: Tidak ada keterlambatan elevasi (langsung 0, pita rata lurus mengikuti tinggi papan)
   * - 1.0: Efek flow delay fisik alami
   * - 2.5: Gelombang segment telat lebih lambat menyusul (delay bertambah & amplitudo lebih dramatis)
   */
  public getLagY(xDist: number, now: number, _lengthScale = 1.0, waveMultiplier = 1.0): number {
    if (this.samples.length < 2) return 0;
    const wave = Math.max(0, waveMultiplier);
    if (wave <= 0.01) return 0; // Mode lurus / tanpa keterlambatan segment

    // Semakin tinggi wave, semakin lambat segment di belakang menyusul naik (delaySec membesar)
    const effSpeed = Math.max(this.currentSpeed / (0.45 + wave * 0.55), 3.0);
    const delaySec = xDist / effSpeed;
    const targetTime = now - delaySec;

    let pastH = this.samples[0].h;

    // Cari sampel di masa lalu secara efisien
    for (let i = this.samples.length - 1; i >= 0; i--) {
      const s = this.samples[i];
      if (s.t <= targetTime) {
        if (i === this.samples.length - 1) {
          pastH = s.h;
        } else {
          const next = this.samples[i + 1];
          const span = next.t - s.t;
          const ratio = span > 0.0001 ? Math.min(1, Math.max(0, (targetTime - s.t) / span)) : 0;
          pastH = s.h + (next.h - s.h) * ratio;
        }
        break;
      }
    }

    const rawOffset = (pastH - this.currentH) * Math.min(1.8, wave);
    // Batasi agar tidak pernah melenceng ekstrem di luar batas geometris yang wajar
    return Math.max(-5.5, Math.min(4.5, rawOffset));
  }

  /** Kemiringan kurva elevasi (slope) untuk rotasi pitch segmen pita */
  public getSlopeY(xDist: number, step: number, now: number, lengthScale = 1.0, waveMultiplier = 1.0): number {
    const y1 = this.getLagY(xDist, now, lengthScale, waveMultiplier);
    const y2 = this.getLagY(xDist + step, now, lengthScale, waveMultiplier);
    return y1 - y2;
  }

  public getCurrentH(): number {
    return this.currentH;
  }

  public getCurrentVh(): number {
    return this.currentVh;
  }
}

export const trailHistory = new TrailPhysicsHistory();

/* ================= 1. RAINBOW TRAIL (Pelangi Nyan Cat Mengalir Dinamis) ================= */
const RAINBOW_COLORS = [
  "#FF1E1E", // Merah
  "#FF8800", // Jingga
  "#FFDD00", // Kuning
  "#00E676", // Hijau
  "#00B0FF", // Biru Cerah
  "#AA00FF", // Ungu
];

export function InGameRainbowTrail({ width = 1.0, length = 1.0, wave = 1.0 }: EffectProps) {
  const group = useRef<THREE.Group>(null);
  const sparklesGroup = useRef<THREE.Group>(null);
  const SEG = 20;
  const SPARKLES = 10;

  const w = Math.max(0.3, Math.min(3.0, width));
  const l = Math.max(0.3, Math.min(3.0, length));
  const wav = Math.max(0.0, Math.min(3.0, wave));

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (group.current) {
      const segLength = (9.8 * l) / SEG;
      group.current.children.forEach((seg, s) => {
        const progress = s / SEG;
        const xDist = 0.68 + s * segLength;

        // Fisika flow telat naik saat lompat & air jump sesuai tingkat gelombang
        const lagY = trailHistory.getLagY(xDist, t, l, wav);
        const slopeY = trailHistory.getSlopeY(xDist, segLength, t, l, wav);

        // Posisi X membentang ke belakang skateboard (-X)
        seg.position.x = -xDist;

        // Gelombang sinusoidal vertikal alami yang ter-scale oleh wav + delay flow elevasi lompat
        const waveY = Math.sin(t * (7.0 + wav * 2.0) - progress * (7.0 + wav * 3.0)) * (0.055 * wav) * (0.4 + progress * 0.8);
        seg.position.y = 0.11 + lagY + waveY;

        // Rotasi pitch agar pita menyambung mulus mengikuti busur kurva lompatan
        seg.rotation.z = Math.atan2(slopeY, segLength) * 0.82;

        // Gelombang lateral serpentine halus ke kiri-kanan sesuai lebar w & tingkat gelombang
        seg.position.z = Math.sin(t * (3.4 + wav * 1.2) - progress * (5.0 + wav * 2.2)) * (0.12 * w * Math.min(1.5, 0.3 + wav * 0.7));

        // Tapering lembut ke ujung belakang
        const taperY = Math.max(0.2, 1 - progress * 0.42);
        const taperZ = Math.max(0.25, 1 - progress * 0.32);
        seg.scale.set(l * 1.05, taperY, w * taperZ);
      });
    }

    if (sparklesGroup.current) {
      sparklesGroup.current.children.forEach((sp, i) => {
        const cycle = 1.25;
        const life = ((t * 1.2 + rnd(i, 8) * 10) % cycle) / cycle;
        const xDist = 0.65 + life * (9.0 * l);
        const lagY = trailHistory.getLagY(xDist, t, l, wav);

        const waveY = Math.sin(t * (7.0 + wav * 2.0) - life * (7.0 + wav * 3.0)) * (0.06 * wav);
        const side = (rnd(i, 9) * 2 - 1) * (0.42 * w);

        sp.position.set(
          -xDist,
          0.14 + lagY + waveY + Math.sin(life * Math.PI) * 0.18,
          side
        );
        sp.rotation.set(t * 4 + i, t * 5 + i * 2, t * 3);
        const sz = Math.sin(life * Math.PI) * (0.75 + rnd(i, 10) * 0.5);
        sp.scale.setScalar(sz);
      });
    }
  });

  return (
    <group>
      {/* Pita 6 warna pelangi bergelombang & meliuk aerodinamis */}
      <group ref={group}>
        {Array.from({ length: SEG }, (_, s) => (
          <group key={s}>
            {RAINBOW_COLORS.map((c, i) => {
              const zOffset = (i - 2.5) * 0.125;
              return (
                <mesh key={c} position={[0, 0, zOffset]}>
                  <boxGeometry args={[0.54, 0.042, 0.12]} />
                  <meshStandardMaterial
                    color={c}
                    emissive={c}
                    emissiveIntensity={0.92}
                    roughness={0.35}
                  />
                </mesh>
              );
            })}
          </group>
        ))}
      </group>

      {/* Bintang-bintang berkilau mengikuti arus pita yang mengalir */}
      <group ref={sparklesGroup}>
        {Array.from({ length: SPARKLES }, (_, i) => {
          const col = RAINBOW_COLORS[i % RAINBOW_COLORS.length];
          return (
            <mesh key={i}>
              <octahedronGeometry args={[0.075, 0]} />
              <meshStandardMaterial
                color={col}
                emissive={col}
                emissiveIntensity={1.6}
                roughness={0.2}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/* ================= 2. WATER TRAIL (Air Mengalir & Ombak Selancar Voxel) ================= */
export function InGameWaterTrail({ width = 1.0, length = 1.0, wave = 1.0 }: EffectProps) {
  const riverGroup = useRef<THREE.Group>(null);
  const foamGroup = useRef<THREE.Group>(null);
  const splashGroup = useRef<THREE.Group>(null);

  const SEG = 20;
  const FOAM = 22;
  const SPLASH = 18;

  const w = Math.max(0.3, Math.min(3.0, width));
  const l = Math.max(0.3, Math.min(3.0, length));
  const wav = Math.max(0.0, Math.min(3.0, wave));

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (riverGroup.current) {
      const segLength = (9.8 * l) / SEG;
      riverGroup.current.children.forEach((seg, s) => {
        const progress = s / SEG;
        const xDist = 0.68 + s * segLength;
        const lagY = trailHistory.getLagY(xDist, t, l, wav);
        const slopeY = trailHistory.getSlopeY(xDist, segLength, t, l, wav);

        seg.position.x = -xDist;
        // Gelombang air mengalir mundur dengan ritme ombak dinamis + delay flow lompat
        const waterUndulation = Math.sin(t * (6.0 + wav * 2.5) - progress * (7.0 + wav * 3.5)) * (0.042 * wav);
        seg.position.y = 0.08 + lagY + waterUndulation;
        seg.rotation.z = Math.atan2(slopeY, segLength) * 0.85;
        seg.position.z = Math.sin(t * (3.0 + wav * 1.0) - progress * (4.5 + wav * 2.0)) * (0.14 * w * Math.min(1.5, 0.4 + wav * 0.6));

        const taper = Math.max(0.2, 1 - progress * 0.35);
        seg.scale.set(l * 1.05, 1, w * taper);
      });
    }

    if (foamGroup.current) {
      foamGroup.current.children.forEach((child, i) => {
        const speed = 0.95 + rnd(i, 11) * 0.45;
        const life = ((t * speed + rnd(i, 12) * 10) % 1.6) / 1.6;
        const xDist = 0.65 + life * (9.2 * l);
        const lagY = trailHistory.getLagY(xDist, t, l, wav);
        const side = (rnd(i, 13) * 2 - 1) * (0.42 * w);

        child.position.set(
          -xDist,
          0.095 + lagY + Math.sin(t * 7.5 - life * 9.5) * (0.045 * wav),
          Math.sin(t * 3.6 - life * 6.0) * (0.14 * w * Math.min(1.5, 0.4 + wav * 0.6)) + side
        );
        const sz = (1 - life * 0.6) * (0.8 + rnd(i, 14) * 0.4) * Math.min(1.5, w);
        child.scale.setScalar(sz);

        const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        m.opacity = 0.88 * (1 - life * 0.7);
      });
    }

    if (splashGroup.current) {
      splashGroup.current.children.forEach((drop, i) => {
        const life = ((t * 1.8 + rnd(i, 21) * 10) % 1.1) / 1.1;
        const xDist = 0.62 + life * (4.5 * l);
        const lagY = trailHistory.getLagY(xDist, t, l, wav);
        const wheelSide = (i % 2 === 0 ? 0.24 : -0.24) * w;
        const spread = (rnd(i, 22) - 0.5) * 0.4 * w;

        drop.position.set(
          -xDist,
          0.08 + lagY + Math.sin(life * Math.PI) * 0.42 * (0.6 + rnd(i, 23) * 0.6) * Math.min(1.5, 0.4 + wav * 0.6),
          wheelSide + spread * life
        );
        drop.scale.setScalar(((1 - life) * 0.8 + 0.25) * Math.min(1.6, w));
      });
    }
  });

  return (
    <group>
      {/* Aliran sungai berlapis biru transparan */}
      <group ref={riverGroup}>
        {Array.from({ length: SEG }, (_, s) => (
          <group key={s}>
            {/* Dasar laut biru tua */}
            <mesh position={[0, -0.015, 0]}>
              <boxGeometry args={[0.56, 0.04, 0.88]} />
              <meshStandardMaterial
                color="#0288D1"
                emissive="#01579B"
                emissiveIntensity={0.35}
                transparent
                opacity={0.78}
                roughness={0.12}
              />
            </mesh>
            {/* Arus tengah biru toska */}
            <mesh position={[0, 0.0, 0]}>
              <boxGeometry args={[0.56, 0.038, 0.62]} />
              <meshStandardMaterial
                color="#29B6F6"
                emissive="#0288D1"
                emissiveIntensity={0.5}
                transparent
                opacity={0.84}
                roughness={0.08}
              />
            </mesh>
            {/* Puncak buih putih/cyan cerah */}
            <mesh position={[0, 0.015, 0]}>
              <boxGeometry args={[0.56, 0.032, 0.36]} />
              <meshStandardMaterial
                color="#E1F5FE"
                emissive="#4FC3F7"
                emissiveIntensity={0.7}
                transparent
                opacity={0.9}
                roughness={0.05}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Buih ombak putih yang berbusa */}
      <group ref={foamGroup}>
        {Array.from({ length: FOAM }, (_, i) => (
          <mesh key={i}>
            <boxGeometry args={[0.22, 0.045, 0.22]} />
            <meshStandardMaterial
              color="#FFFFFF"
              emissive="#E0F7FA"
              emissiveIntensity={0.25}
              transparent
              opacity={0.85}
              roughness={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* Percikan air melompat ke atas */}
      <group ref={splashGroup}>
        {Array.from({ length: SPLASH }, (_, i) => (
          <mesh key={i}>
            <boxGeometry args={[0.11, 0.11, 0.11]} />
            <meshStandardMaterial
              color="#E0F7FA"
              emissive="#80DEEA"
              emissiveIntensity={0.85}
              transparent
              opacity={0.82}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ================= 3. SMOKE TRAIL (Asap Ban Drifting & Voxel Puff) ================= */
const SMOKE_PALETTE = ["#DCDCDC", "#C0C0C0", "#EAEAEA", "#A8A8A8", "#B5B5B5"];

export function InGameSmokeTrail({ width = 1.0, length = 1.0, wave = 1.0 }: EffectProps) {
  const group = useRef<THREE.Group>(null);
  const N = 28;

  const w = Math.max(0.3, Math.min(3.0, width));
  const l = Math.max(0.3, Math.min(3.0, length));
  const wav = Math.max(0.0, Math.min(3.0, wave));

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();

    group.current.children.forEach((child, i) => {
      const speed = 0.85 + rnd(i, 3) * 0.35;
      const life = ((t * speed + rnd(i, 4) * 10) % 1.7) / 1.7;
      const xDist = 0.65 + life * (8.5 * l);
      const lagY = trailHistory.getLagY(xDist, t, l, wav);

      const wheelSide = (i % 2 === 0 ? 0.22 : -0.22) * w;
      const drift = (rnd(i, 5) * 2 - 1) * (0.16 + life * 0.75 * w);

      child.position.set(
        -xDist,
        0.08 + lagY + life * 1.15 + Math.sin(t * (1.8 + wav * 1.0) + i) * (0.1 * wav),
        wheelSide + drift
      );
      child.rotation.set(t * 1.2 + i, t * 1.5 + i * 0.7, i * 2);

      const s = (0.35 + life * 1.45) * (0.8 + rnd(i, 6) * 0.4) * (0.8 + w * 0.2);
      child.scale.setScalar(s);

      const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      m.opacity = Math.sin(life * Math.PI) * 0.68;
    });
  });

  return (
    <group ref={group}>
      {Array.from({ length: N }, (_, i) => (
        <mesh key={i}>
          <boxGeometry args={[0.38, 0.38, 0.38]} />
          <meshStandardMaterial
            color={SMOKE_PALETTE[i % SMOKE_PALETTE.length]}
            transparent
            opacity={0.65}
            roughness={1}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ================= 4. FIRE TRAIL (Api Ghost Rider & Bara Aspal) ================= */
const FIRE_COLORS = ["#FFE600", "#FF9900", "#FF4500", "#D50000"];

export function InGameFireTrail({ width = 1.0, length = 1.0, wave = 1.0 }: EffectProps) {
  const group = useRef<THREE.Group>(null);
  const emberGroup = useRef<THREE.Group>(null);
  const N = 30;
  const EMBERS = 14;

  const w = Math.max(0.3, Math.min(3.0, width));
  const l = Math.max(0.3, Math.min(3.0, length));
  const wav = Math.max(0.0, Math.min(3.0, wave));

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (group.current) {
      group.current.children.forEach((child, i) => {
        const speed = 1.0 + rnd(i, 11) * 0.4;
        const life = ((t * speed + rnd(i, 12) * 10) % 1.5) / 1.5;
        const xDist = 0.65 + life * (8.5 * l);
        const lagY = trailHistory.getLagY(xDist, t, l, wav);

        const wheelSide = (i % 2 === 0 ? 0.22 : -0.22) * w;
        const side = wheelSide + (rnd(i, 13) * 2 - 1) * (0.16 + life * 0.45 * w);
        const flick = Math.sin(t * 18 + i * 3) * (0.09 * (0.5 + wav * 0.5));

        child.position.set(
          -xDist,
          0.08 + lagY + life * 1.05 * (0.4 + rnd(i, 14) * 0.6) + flick,
          side
        );
        child.rotation.y = t * 4 + i;

        const s = (1 - life * 0.65) * (0.8 + rnd(i, 15) * 0.4) * (0.8 + w * 0.2);
        child.scale.set(s, s * (1.2 + flick * 3), s);

        const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        m.opacity = 0.92 * (1 - life * 0.65);
      });
    }

    if (emberGroup.current) {
      emberGroup.current.children.forEach((ember, i) => {
        const side = (i % 2 === 0 ? 0.22 : -0.22) * w;
        const xDist = 0.68 + Math.floor(i / 2) * (1.3 * l);
        const lagY = trailHistory.getLagY(xDist, t, l, wav);

        ember.position.set(-xDist, 0.035 + lagY, side);
        const flicker = 1.3 + Math.sin(t * 14 + i * 2) * 0.5;
        const m = (ember as THREE.Mesh).material as THREE.MeshStandardMaterial;
        m.emissiveIntensity = flicker;
      });
    }
  });

  return (
    <group>
      {/* Lidah api yang membara */}
      <group ref={group}>
        {Array.from({ length: N }, (_, i) => {
          const c = FIRE_COLORS[i % FIRE_COLORS.length];
          return (
            <mesh key={i}>
              <boxGeometry args={[0.34, 0.48, 0.34]} />
              <meshStandardMaterial
                color={c}
                emissive={c}
                emissiveIntensity={1.35}
                transparent
                opacity={0.88}
                roughness={0.4}
              />
            </mesh>
          );
        })}
      </group>

      {/* Bara api menyala di aspal jalan */}
      <group ref={emberGroup}>
        {Array.from({ length: EMBERS }, (_, i) => (
          <mesh key={`ember-${i}`}>
            <boxGeometry args={[0.42 * l, 0.035, 0.26 * w]} />
            <meshStandardMaterial
              color="#FF5722"
              emissive="#FF3D00"
              emissiveIntensity={1.8}
              transparent
              opacity={0.85}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ================= 5. LIGHTNING TRAIL (Petir Kirin Menyengat) ================= */
export function InGameLightningTrail({ width = 1.0, length = 1.0, wave = 1.0 }: EffectProps) {
  const group = useRef<THREE.Group>(null);
  const N = 24;

  const w = Math.max(0.3, Math.min(3.0, width));
  const l = Math.max(0.3, Math.min(3.0, length));
  const wav = Math.max(0.0, Math.min(3.0, wave));

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();

    group.current.children.forEach((child, i) => {
      const life = ((t * 1.6 + rnd(i, 21) * 10) % 1.2) / 1.2;
      const xDist = 0.65 + life * (8.2 * l);
      const lagY = trailHistory.getLagY(xDist, t, l, wav);

      const wheelSide = (i % 2 === 0 ? 0.22 : -0.22) * w;
      const jolt = Math.floor(t * 26 + i) % 2 === 0 ? 0.38 : -0.38;

      child.position.set(
        -xDist,
        0.1 + lagY + life * 1.2 * rnd(i, 23),
        wheelSide + (rnd(i, 22) * 2 - 1) * (0.42 * w) + jolt * 0.22 * w * Math.min(1.5, 0.4 + wav * 0.6)
      );
      child.rotation.z = (rnd(i, 24) - 0.5) * 1.3 + jolt;

      const s = ((1 - life) * 0.85 + 0.25) * (0.8 + w * 0.2);
      child.scale.set(s * 0.6, s * 1.5, s * 0.6);

      const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      m.opacity = (0.5 + 0.5 * Math.abs(Math.sin(t * 30 + i * 5))) * (1 - life * 0.55);
    });
  });

  return (
    <group ref={group}>
      {Array.from({ length: N }, (_, i) => {
        const c = i % 3 === 0 ? "#FFFFFF" : i % 3 === 1 ? "#FFEB3B" : "#00E5FF";
        const em = i % 3 === 1 ? "#FFD700" : "#00E5FF";
        return (
          <mesh key={i}>
            <boxGeometry args={[0.18, 0.55, 0.18]} />
            <meshStandardMaterial
              color={c}
              emissive={em}
              emissiveIntensity={2.2}
              transparent
              opacity={0.92}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/* ================= 6. FIREWORKS TRAIL (Kembang Api Gemerlap) ================= */
const FW_PALETTE = ["#FF1493", "#FFD700", "#00E5FF", "#76FF03", "#D500F9", "#FF6D00"];

export function InGameFireworksTrail({ width = 1.0, length = 1.0, wave = 1.0 }: EffectProps) {
  const group = useRef<THREE.Group>(null);
  const BURSTS = 6;
  const SPARKS = 8;

  const w = Math.max(0.3, Math.min(3.0, width));
  const l = Math.max(0.3, Math.min(3.0, length));
  const wav = Math.max(0.0, Math.min(3.0, wave));

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();

    group.current.children.forEach((burst, b) => {
      const cycle = 1.5;
      const life = ((t * 0.95 + b * (cycle / BURSTS) * 1.7) % cycle) / cycle;
      const xDist = 0.65 + b * (1.7 * l) + life * (2.4 * l);
      const lagY = trailHistory.getLagY(xDist, t, l, wav);

      const cy = 0.16 + lagY + rnd(b, 31) * 0.85;
      const cz = (rnd(b, 32) * 2 - 1) * (0.68 * w);

      burst.children.forEach((spark, i) => {
        const ang = (i / SPARKS) * Math.PI * 2;
        const spread = life * 0.95;
        spark.position.set(
          -xDist + Math.cos(ang) * spread * 0.6 * l,
          cy + Math.sin(ang) * spread - life * life * 0.45,
          cz + Math.sin(ang) * spread * w
        );
        spark.rotation.set(ang + t * 2, t * 3, ang);

        const s = ((1 - life) * 0.65 + 0.12) * (0.8 + w * 0.2);
        spark.scale.setScalar(s);

        const m = (spark as THREE.Mesh).material as THREE.MeshStandardMaterial;
        m.opacity = life < 0.12 ? life / 0.12 : 1 - (life - 0.12) / 0.88;
      });
    });
  });

  return (
    <group ref={group}>
      {Array.from({ length: BURSTS }, (_, b) => (
        <group key={b}>
          {Array.from({ length: SPARKS }, (_, i) => {
            const color = FW_PALETTE[(b * 3 + i) % FW_PALETTE.length];
            return (
              <mesh key={i}>
                <boxGeometry args={[0.18, 0.18, 0.18]} />
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={1.85}
                  transparent
                  opacity={1}
                />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
}

/* ================= 7. SAKURA TRAIL (Kelopak Bunga Sakura Berguguran) ================= */
const SAKURA_COLORS = ["#FFB7C5", "#FF9EAA", "#FFD1DC", "#FF80BF"];

export function InGameSakuraTrail({ width = 1.0, length = 1.0, wave = 1.0 }: EffectProps) {
  const group = useRef<THREE.Group>(null);
  const N = 32;

  const w = Math.max(0.3, Math.min(3.0, width));
  const l = Math.max(0.3, Math.min(3.0, length));
  const wav = Math.max(0.0, Math.min(3.0, wave));

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();

    group.current.children.forEach((child, i) => {
      const speed = 0.65 + rnd(i, 1) * 0.45;
      const life = ((t * speed + rnd(i, 2) * 10) % 1.7) / 1.7;
      const xDist = 0.65 + life * (8.2 * l);
      const lagY = trailHistory.getLagY(xDist, t, l, wav);

      const side = rnd(i, 3) * 2 - 1;

      // Gerakan pusaran heliks di balik skateboard yang dipengaruhi tingkat gelombang
      const vortexZ = Math.cos(t * (2.5 + wav * 0.9) + life * 5) * (0.22 * w * Math.min(1.5, 0.3 + wav * 0.7));
      const vortexY = Math.sin(t * (2.5 + wav * 0.9) + life * 5) * (0.18 * wav);

      child.position.set(
        -xDist,
        0.12 + lagY + life * 1.35 + vortexY,
        side * (0.34 + life * 1.3) * w + vortexZ
      );
      child.rotation.set(t * 2.5 + i, t * 1.8 + i * 0.7, t * 3.0 + i * 1.3);

      const s = (1 - life * 0.5) * (0.8 + w * 0.2);
      child.scale.setScalar(s);
    });
  });

  return (
    <group ref={group}>
      {Array.from({ length: N }, (_, i) => (
        <mesh key={i}>
          <boxGeometry args={[0.22, 0.035, 0.16]} />
          <meshStandardMaterial
            color={SAKURA_COLORS[i % SAKURA_COLORS.length]}
            roughness={0.75}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ================= Component Dispatcher Utama In-Game ================= */
export function InGameTrailEffect({
  effectId,
  width = 1.0,
  length = 1.0,
  wave = 1.0,
}: {
  effectId: string | null;
  width?: number;
  length?: number;
  wave?: number;
}) {
  // Update histori fisika lompatan pemain per frame untuk semua efek trail
  useFrame(({ clock }) => {
    const now = clock.getElapsedTime();
    const p = engine?.player;
    const h = p ? p.h : 0;
    const vh = p ? p.vh : 0;
    const sp = engine?.speed ? engine.speed : 14;
    trailHistory.update(now, h, vh, sp);
  });

  if (!effectId) return null;

  switch (effectId) {
    case "rainbow":
      return <InGameRainbowTrail width={width} length={length} wave={wave} />;
    case "water":
      return <InGameWaterTrail width={width} length={length} wave={wave} />;
    case "smoke":
      return <InGameSmokeTrail width={width} length={length} wave={wave} />;
    case "fire":
      return <InGameFireTrail width={width} length={length} wave={wave} />;
    case "lightning":
      return <InGameLightningTrail width={width} length={length} wave={wave} />;
    case "fireworks":
      return <InGameFireworksTrail width={width} length={length} wave={wave} />;
    case "sakura":
      return <InGameSakuraTrail width={width} length={length} wave={wave} />;
    default:
      return null;
  }
}
