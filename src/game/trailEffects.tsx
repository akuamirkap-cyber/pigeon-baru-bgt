import { useRef, useMemo, useEffect } from "react";
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
  wave?: number; // Tingkat kelengkungan gelombang & flow delay (0.0 = lurus kaku, 1.0 = normal, 2.5 = sangat lentur & bergelombang)
}

/* =========================================================================
   TRAIL FLOW DYNAMICS ENGINE (ELEVASI & PINDAH JALUR LATERAL)
   Melacak ketinggian lompatan (h, vh) dan posisi lateral pindah jalur (lat, latVel)
   secara real-time dengan interpolasi Cubic Hermite (C1-smooth).
   
   Saat pemain berpindah jalur atau melompat:
   - Titik ekor papan menempel presisi di skateboard
   - Garis motion line meliuk dengan transisi kontinuitas C1/C2 (Hermite & Quintic Smootherstep)
   - Multi-pass Laplacian curve smoothing menghilangkan segala getaran diskrit
   - Dynamic ripple dampening saat bermanuver membuat S-curve & arc lompat tampak mulus sutra
   ========================================================================= */

interface TrailHistorySample {
  t: number;
  h: number;
  vh: number;
  lat: number;
  latVel: number;
}

class TrailPhysicsHistory {
  private samples: TrailHistorySample[] = [];
  private maxSamples = 240;
  private currentH = 0;
  private currentVh = 0;
  private currentLat = 0;
  private currentLatVel = 0;
  private currentSpeed = 14;

  public reset() {
    this.samples = [];
    this.currentH = 0;
    this.currentVh = 0;
    this.currentLat = 0;
    this.currentLatVel = 0;
    this.currentSpeed = 14;
  }

  public update(now: number, h: number, vh: number, lat: number, latVel: number, speed: number) {
    this.currentH = h;
    this.currentVh = vh;
    this.currentLat = lat;
    this.currentLatVel = latVel;
    this.currentSpeed = Math.max(speed, 6.0);

    const last = this.samples[this.samples.length - 1];
    if (last && Math.abs(last.t - now) < 0.0001) {
      last.h = h;
      last.vh = vh;
      last.lat = lat;
      last.latVel = latVel;
      return;
    }

    this.samples.push({ t: now, h, vh, lat, latVel });
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
  }

  /**
   * Mengambil sampel historis pada targetTime dengan interpolasi Cubic Hermite
   * yang menjaga kontinuitas turunan pertama (C1 continuous) menggunakan vh dan latVel.
   */
  private sampleAt(targetTime: number): { h: number; lat: number } {
    if (this.samples.length === 0) {
      return { h: this.currentH, lat: this.currentLat };
    }
    const newest = this.samples[this.samples.length - 1];
    if (targetTime >= newest.t) {
      return { h: newest.h, lat: newest.lat };
    }
    const oldest = this.samples[0];
    if (targetTime <= oldest.t) {
      return { h: oldest.h, lat: oldest.lat };
    }

    let low = 0;
    let high = this.samples.length - 1;
    while (low <= high) {
      const mid = (low + high) >> 1;
      const tMid = this.samples[mid].t;
      if (tMid <= targetTime) {
        if (mid === this.samples.length - 1 || this.samples[mid + 1].t > targetTime) {
          const s0 = this.samples[mid];
          const s1 = this.samples[mid + 1];
          const dt = Math.max(s1.t - s0.t, 1e-5);
          const u = Math.min(1.0, Math.max(0.0, (targetTime - s0.t) / dt));

          // Cubic Hermite basis functions
          const u2 = u * u;
          const u3 = u2 * u;
          const h00 = 2 * u3 - 3 * u2 + 1;
          const h10 = u3 - 2 * u2 + u;
          const h01 = -2 * u3 + 3 * u2;
          const h11 = u3 - u2;

          const hInterp = h00 * s0.h + h10 * dt * s0.vh + h01 * s1.h + h11 * dt * s1.vh;
          const latInterp = h00 * s0.lat + h10 * dt * s0.latVel + h01 * s1.lat + h11 * dt * s1.latVel;

          return { h: hInterp, lat: latInterp };
        }
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return { h: newest.h, lat: newest.lat };
  }

  /**
   * Menghitung offset Y lokal untuk titik trail pada jarak xDist di belakang papan.
   * Sangat mulus (smooth) saat melompat dan mendarat.
   */
  public getLagY(xDist: number, now: number, _lengthScale = 1.0, waveMultiplier = 1.0): number {
    if (this.samples.length < 2 || xDist <= 0.001) return 0;
    const wave = Math.max(0, waveMultiplier);
    if (wave <= 0.01) return 0;

    const effSpeed = Math.max(this.currentSpeed * 0.96, 4.0);
    const delaySec = xDist / effSpeed;
    const targetTime = now - delaySec;

    const sample = this.sampleAt(targetTime);
    const rawDiff = sample.h - this.currentH;

    // Smooth quintic blend (C2 continuous) agar sambungan di ekor papan mulus tanpa patahan sudut
    const blendNorm = Math.min(1.0, xDist / 0.85);
    const entryBlend = blendNorm * blendNorm * blendNorm * (blendNorm * (blendNorm * 6 - 15) + 10);

    const lagFactor = Math.min(1.0, 0.78 + wave * 0.14);
    const offset = rawDiff * lagFactor * entryBlend;

    // Soft clamping dengan tanh agar kurva lentur alami dan tidak kaku
    const maxSpan = 3.6;
    return Math.tanh(offset / maxSpan) * maxSpan;
  }

  /**
   * Menghitung offset Z (lateral) lokal untuk titik trail pada jarak xDist di belakang papan.
   * Memberikan liukan S-curve yang sangat luwes dan mengalir lembut saat berpindah jalur.
   */
  public getLagZ(xDist: number, now: number, _lengthScale = 1.0, waveMultiplier = 1.0): number {
    if (this.samples.length < 2 || xDist <= 0.001) return 0;
    const wave = Math.max(0, waveMultiplier);
    if (wave <= 0.01) return 0;

    const effSpeed = Math.max(this.currentSpeed * 0.96, 4.0);
    const delaySec = xDist / effSpeed;
    const targetTime = now - delaySec;

    const sample = this.sampleAt(targetTime);
    const rawDiff = sample.lat - this.currentLat;

    // Smooth quintic blend (C2 continuous) dari ekor skateboard
    const blendNorm = Math.min(1.0, xDist / 0.85);
    const entryBlend = blendNorm * blendNorm * blendNorm * (blendNorm * (blendNorm * 6 - 15) + 10);

    const lagFactor = Math.min(1.0, 0.84 + wave * 0.12);
    const offset = rawDiff * lagFactor * entryBlend;

    // Soft-clamping dengan tanh untuk transisi lateral yang sangat halus
    const maxSpan = 3.4;
    return Math.tanh(offset / maxSpan) * maxSpan;
  }

  public getCurrentH(): number {
    return this.currentH;
  }

  public getCurrentVh(): number {
    return this.currentVh;
  }

  public getCurrentLat(): number {
    return this.currentLat;
  }

  public getCurrentLatVel(): number {
    return this.currentLatVel;
  }
}

export const trailHistory = new TrailPhysicsHistory();

/* ============ Helper: Multi-pass Smoothing Filter pada Spine Curve ============ */
function smoothSpineCurve(
  spine: { x: number; y: number; z: number }[],
  segCount: number,
  passes = 2
) {
  for (let p = 0; p < passes; p++) {
    // Pertahankan titik index 0 (ekor papan) tepat di posisinya (x=0, y=0, z=0)
    for (let i = 1; i < segCount; i++) {
      const s = i / segCount;
      // Bobot smoothing bertahap: lembut di awal dan luwes lentur di ekor belakang
      const smoothWeight = 0.28 * Math.min(1.0, s * 2.2);
      spine[i].y =
        spine[i].y * (1 - 2 * smoothWeight) +
        (spine[i - 1].y + spine[i + 1].y) * smoothWeight;
      spine[i].z =
        spine[i].z * (1 - 2 * smoothWeight) +
        (spine[i - 1].z + spine[i + 1].z) * smoothWeight;
    }
  }
}

/* ============ Helper: Membuat BufferGeometry Ribbon Kontinu ============ */
function createRibbonGeometry(segments: number): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  const vertCount = (segments + 1) * 2;
  const positions = new Float32Array(vertCount * 3);
  const uvs = new Float32Array(vertCount * 2);
  const indices = new Uint16Array(segments * 6);

  for (let i = 0; i <= segments; i++) {
    const v = i / segments;
    uvs[i * 4 + 0] = 0;
    uvs[i * 4 + 1] = v;
    uvs[i * 4 + 2] = 1;
    uvs[i * 4 + 3] = v;
  }

  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    const b = i * 2 + 1;
    const c = (i + 1) * 2;
    const d = (i + 1) * 2 + 1;

    const idx = i * 6;
    indices[idx + 0] = a;
    indices[idx + 1] = b;
    indices[idx + 2] = c;
    indices[idx + 3] = b;
    indices[idx + 4] = d;
    indices[idx + 5] = c;
  }

  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geom.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geom.setIndex(new THREE.BufferAttribute(indices, 1));
  return geom;
}

/* ================= 1. RAINBOW TRAIL (Pita Pelangi Kontinu dengan S-Curve & Jump Arc Halus) ================= */
const RAINBOW_COLORS = [
  "#FF1E1E", // Merah
  "#FF8800", // Jingga
  "#FFDD00", // Kuning
  "#00E676", // Hijau
  "#00B0FF", // Biru Cerah
  "#AA00FF", // Ungu
];

export function InGameRainbowTrail({ width = 0.4, length = 1.0, wave = 2.5 }: EffectProps) {
  const sparklesGroup = useRef<THREE.Group>(null);
  const SEG = 64; // Resolusi ultra tinggi untuk kurva S-curve dan elevasi lompat super halus
  const SPARKLES = 14;

  const w = Math.max(0.3, Math.min(3.0, width));
  const l = Math.max(0.3, Math.min(3.0, length));
  const wav = Math.max(0.0, Math.min(3.0, wave));

  // 6 Geometri pita kontinu bersambung (satu untuk tiap garis warna)
  const ribbonGeoms = useMemo(() => {
    return RAINBOW_COLORS.map(() => createRibbonGeometry(SEG));
  }, [SEG]);

  useEffect(() => {
    return () => {
      ribbonGeoms.forEach((g) => g.dispose());
    };
  }, [ribbonGeoms]);

  // Array titik kurva tulang belakang (spine) kontinu
  const spinePoints = useMemo(() => {
    return Array.from({ length: SEG + 1 }, () => ({ x: 0, y: 0, z: 0 }));
  }, [SEG]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const totalDist = 9.8 * l;

    const latVel = trailHistory.getCurrentLatVel();
    const vh = trailHistory.getCurrentVh();
    // Intensitas gerakan manuver (pindah jalur atau lompat)
    const maneuverActivity = Math.min(1.0, Math.abs(latVel) * 0.35 + Math.abs(vh) * 0.25);
    // Redam ripple getaran saat manuver agar kurva liukan utama tampil bersih, megah, dan bebas getar
    const rippleDamp = 1.0 - maneuverActivity * 0.65;

    // 1. Evaluasi kurva kontinu 3D dengan inersia lateral & elevasi Hermite
    for (let i = 0; i <= SEG; i++) {
      const s = i / SEG; // 0.0 = ekor papan, 1.0 = ujung belakang pita
      const xDist = s * totalDist;

      // Fisika elevasi lompatan (Y) & inersia lateral pindah jalur (Z)
      const lagY = trailHistory.getLagY(xDist, t, l, wav);
      const lagZ = trailHistory.getLagZ(xDist, t, l, wav);

      // Amplitudo kurva gelombang 0 di ekor skateboard agar menempel presisi, lalu melengkung lembut ke belakang
      const waveAmp = Math.pow(s, 1.35) * rippleDamp;

      // Kurva gelombang sinusoidal 3D lembut
      const freqY = 5.8 + wav * 1.5;
      const waveLenY = 4.8 + wav * 1.8;
      const waveY = Math.sin(t * freqY - s * waveLenY) * (0.042 * wav) * waveAmp;

      const freqZ = 3.0 + wav * 0.9;
      const waveLenZ = 3.8 + wav * 1.4;
      const waveZ = Math.sin(t * freqZ - s * waveLenZ) * (0.08 * w * Math.min(1.5, 0.35 + wav * 0.65)) * waveAmp;

      spinePoints[i].x = -xDist;
      spinePoints[i].y = lagY + waveY;
      spinePoints[i].z = lagZ + waveZ;
    }

    // Terapkan multi-pass smoothing filter untuk menghilangkan getaran dan menghasilkan garis kurva sutra
    smoothSpineCurve(spinePoints, SEG, 2);

    // 2. Bentuk 6 pita berdampingan tanpa celah/pisah (zero gap antara warna)
    const baseWidth = 0.52 * w;

    for (let c = 0; c < RAINBOW_COLORS.length; c++) {
      const geom = ribbonGeoms[c];
      const posAttr = geom.attributes.position as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;

      for (let i = 0; i <= SEG; i++) {
        const s = i / SEG;
        const pt = spinePoints[i];

        // Hitung vektor tangen di kurva untuk orientasi normal pita
        let dx = 0;
        let dz = 0;
        if (i === 0) {
          dx = spinePoints[1].x - spinePoints[0].x;
          dz = spinePoints[1].z - spinePoints[0].z;
        } else if (i === SEG) {
          dx = spinePoints[SEG].x - spinePoints[SEG - 1].x;
          dz = spinePoints[SEG].z - spinePoints[SEG - 1].z;
        } else {
          dx = spinePoints[i + 1].x - spinePoints[i - 1].x;
          dz = spinePoints[i + 1].z - spinePoints[i - 1].z;
        }

        const len = Math.sqrt(dx * dx + dz * dz) || 1;
        const tx = dx / len;
        const tz = dz / len;

        // Vektor samping tegak lurus terhadap kelengkungan kurva
        const sx = -tz;
        const sz = tx;

        // Tapering lembut di ujung belakang pita
        const taper = Math.max(0.18, 1.0 - Math.pow(s, 2.2) * 0.55);
        const curTotalW = baseWidth * taper;
        const stripeW = curTotalW / 6;

        const stripeCenter = (c - 2.5) * stripeW;
        const leftOff = stripeCenter - stripeW * 0.5;
        const rightOff = stripeCenter + stripeW * 0.5;

        // Vertex Kiri
        posArr[i * 6 + 0] = pt.x + sx * leftOff;
        posArr[i * 6 + 1] = pt.y;
        posArr[i * 6 + 2] = pt.z + sz * leftOff;

        // Vertex Kanan
        posArr[i * 6 + 3] = pt.x + sx * rightOff;
        posArr[i * 6 + 4] = pt.y;
        posArr[i * 6 + 5] = pt.z + sz * rightOff;
      }

      posAttr.needsUpdate = true;
      geom.computeVertexNormals();
    }

    // 3. Sparkles melayang mengikuti liukan kurva pita kontinu
    if (sparklesGroup.current) {
      sparklesGroup.current.children.forEach((sp, i) => {
        const cycle = 1.35;
        const life = ((t * 1.1 + rnd(i, 8) * 10) % cycle) / cycle;
        const segIdx = Math.min(SEG - 1, Math.floor(life * SEG));
        const rem = life * SEG - segIdx;

        const p0 = spinePoints[segIdx];
        const p1 = spinePoints[segIdx + 1] || p0;

        const px = p0.x + (p1.x - p0.x) * rem;
        const py = p0.y + (p1.y - p0.y) * rem + Math.sin(life * Math.PI) * 0.14;
        const pz = p0.z + (p1.z - p0.z) * rem + (rnd(i, 9) * 2 - 1) * (0.28 * w);

        sp.position.set(px, py, pz);
        sp.rotation.set(t * 4 + i, t * 5 + i * 2, t * 3);
        const sz = Math.sin(life * Math.PI) * (0.7 + rnd(i, 10) * 0.45);
        sp.scale.setScalar(sz);
      });
    }
  });

  return (
    <group>
      {/* 6 Pita Pelangi Kontinu Bersambung Utuh Tanpa Terpisah */}
      {RAINBOW_COLORS.map((color, idx) => (
        <mesh key={color} geometry={ribbonGeoms[idx]}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.35}
            roughness={0.25}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Partikel bintang berkilau melayang di sepanjang pita */}
      <group ref={sparklesGroup}>
        {Array.from({ length: SPARKLES }, (_, i) => {
          const col = RAINBOW_COLORS[i % RAINBOW_COLORS.length];
          return (
            <mesh key={i}>
              <octahedronGeometry args={[0.075, 0]} />
              <meshStandardMaterial
                color={col}
                emissive={col}
                emissiveIntensity={1.8}
                roughness={0.2}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/* ================= 2. WATER TRAIL (Aliran Sungai & Ombak Kontinu Halus) ================= */
export function InGameWaterTrail({ width = 0.4, length = 1.0, wave = 2.5 }: EffectProps) {
  const foamGroup = useRef<THREE.Group>(null);
  const splashGroup = useRef<THREE.Group>(null);
  const SEG = 64;
  const FOAM = 22;
  const SPLASH = 18;

  const w = Math.max(0.3, Math.min(3.0, width));
  const l = Math.max(0.3, Math.min(3.0, length));
  const wav = Math.max(0.0, Math.min(3.0, wave));

  // 3 Geometri sungai kontinu: dasar laut, arus tengah toska, dan buih puncak
  const riverGeom = useMemo(() => createRibbonGeometry(SEG), [SEG]);
  const midstreamGeom = useMemo(() => createRibbonGeometry(SEG), [SEG]);
  const crestGeom = useMemo(() => createRibbonGeometry(SEG), [SEG]);

  useEffect(() => {
    return () => {
      riverGeom.dispose();
      midstreamGeom.dispose();
      crestGeom.dispose();
    };
  }, [riverGeom, midstreamGeom, crestGeom]);

  const spinePoints = useMemo(() => {
    return Array.from({ length: SEG + 1 }, () => ({ x: 0, y: 0, z: 0 }));
  }, [SEG]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const totalDist = 9.8 * l;

    const latVel = trailHistory.getCurrentLatVel();
    const vh = trailHistory.getCurrentVh();
    const maneuverActivity = Math.min(1.0, Math.abs(latVel) * 0.35 + Math.abs(vh) * 0.25);
    const rippleDamp = 1.0 - maneuverActivity * 0.65;

    // Evaluasi spine kurva air dengan inersia lateral saat pindah jalur & elevasi saat lompat
    for (let i = 0; i <= SEG; i++) {
      const s = i / SEG;
      const xDist = s * totalDist;
      const lagY = trailHistory.getLagY(xDist, t, l, wav);
      const lagZ = trailHistory.getLagZ(xDist, t, l, wav);

      const waveAmp = Math.pow(s, 1.35) * rippleDamp;
      const waterUndulation = Math.sin(t * (5.8 + wav * 1.8) - s * (5.2 + wav * 2.0)) * (0.038 * wav) * waveAmp;
      const waveZ = Math.sin(t * (2.8 + wav * 0.8) - s * (4.0 + wav * 1.6)) * (0.10 * w * Math.min(1.5, 0.35 + wav * 0.65)) * waveAmp;

      spinePoints[i].x = -xDist;
      spinePoints[i].y = lagY + waterUndulation;
      spinePoints[i].z = lagZ + waveZ;
    }

    smoothSpineCurve(spinePoints, SEG, 2);

    const updateWaterRibbon = (
      geom: THREE.BufferGeometry,
      widthMultiplier: number,
      yOffset: number
    ) => {
      const posAttr = geom.attributes.position as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;

      for (let i = 0; i <= SEG; i++) {
        const s = i / SEG;
        const pt = spinePoints[i];

        let dx = 0;
        let dz = 0;
        if (i === 0) {
          dx = spinePoints[1].x - spinePoints[0].x;
          dz = spinePoints[1].z - spinePoints[0].z;
        } else if (i === SEG) {
          dx = spinePoints[SEG].x - spinePoints[SEG - 1].x;
          dz = spinePoints[SEG].z - spinePoints[SEG - 1].z;
        } else {
          dx = spinePoints[i + 1].x - spinePoints[i - 1].x;
          dz = spinePoints[i + 1].z - spinePoints[i - 1].z;
        }

        const len = Math.sqrt(dx * dx + dz * dz) || 1;
        const sx = -dz / len;
        const sz = dx / len;

        const taper = Math.max(0.2, 1.0 - Math.pow(s, 2.0) * 0.5);
        const halfW = 0.5 * widthMultiplier * w * taper;

        posArr[i * 6 + 0] = pt.x - sx * halfW;
        posArr[i * 6 + 1] = pt.y + yOffset;
        posArr[i * 6 + 2] = pt.z - sz * halfW;

        posArr[i * 6 + 3] = pt.x + sx * halfW;
        posArr[i * 6 + 4] = pt.y + yOffset;
        posArr[i * 6 + 5] = pt.z + sz * halfW;
      }

      posAttr.needsUpdate = true;
      geom.computeVertexNormals();
    };

    updateWaterRibbon(riverGeom, 0.72, -0.015);
    updateWaterRibbon(midstreamGeom, 0.50, 0.0);
    updateWaterRibbon(crestGeom, 0.26, 0.012);

    // Partikel buih ombak
    if (foamGroup.current) {
      foamGroup.current.children.forEach((child, i) => {
        const speed = 0.95 + rnd(i, 11) * 0.45;
        const life = ((t * speed + rnd(i, 12) * 10) % 1.6) / 1.6;
        const segIdx = Math.min(SEG - 1, Math.floor(life * SEG));
        const pt = spinePoints[segIdx];
        const side = (rnd(i, 13) * 2 - 1) * (0.35 * w);

        child.position.set(pt.x, pt.y + 0.02, pt.z + side);
        const sz = (1 - life * 0.55) * (0.75 + rnd(i, 14) * 0.4) * Math.min(1.5, w);
        child.scale.setScalar(sz);

        const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        m.opacity = 0.88 * (1 - life * 0.7);
      });
    }

    // Percikan cipratan air
    if (splashGroup.current) {
      splashGroup.current.children.forEach((drop, i) => {
        const life = ((t * 1.8 + rnd(i, 21) * 10) % 1.1) / 1.1;
        const segIdx = Math.min(SEG - 1, Math.floor(life * 0.45 * SEG));
        const pt = spinePoints[segIdx];
        const wheelSide = (i % 2 === 0 ? 0.22 : -0.22) * w;
        const spread = (rnd(i, 22) - 0.5) * 0.35 * w;

        drop.position.set(
          pt.x,
          pt.y + Math.sin(life * Math.PI) * 0.38 * (0.6 + rnd(i, 23) * 0.6),
          pt.z + wheelSide + spread * life
        );
        drop.scale.setScalar(((1 - life) * 0.75 + 0.25) * Math.min(1.5, w));
      });
    }
  });

  return (
    <group>
      {/* Aliran sungai kontinu 3 lapis kedalaman */}
      <mesh geometry={riverGeom}>
        <meshStandardMaterial
          color="#0288D1"
          emissive="#01579B"
          emissiveIntensity={0.45}
          transparent
          opacity={0.8}
          roughness={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh geometry={midstreamGeom}>
        <meshStandardMaterial
          color="#29B6F6"
          emissive="#0288D1"
          emissiveIntensity={0.65}
          transparent
          opacity={0.86}
          roughness={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh geometry={crestGeom}>
        <meshStandardMaterial
          color="#E1F5FE"
          emissive="#4FC3F7"
          emissiveIntensity={0.95}
          transparent
          opacity={0.92}
          roughness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Buih ombak putih berbusa */}
      <group ref={foamGroup}>
        {Array.from({ length: FOAM }, (_, i) => (
          <mesh key={i}>
            <boxGeometry args={[0.2, 0.04, 0.2]} />
            <meshStandardMaterial
              color="#FFFFFF"
              emissive="#E0F7FA"
              emissiveIntensity={0.3}
              transparent
              opacity={0.85}
              roughness={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* Percikan air melompat */}
      <group ref={splashGroup}>
        {Array.from({ length: SPLASH }, (_, i) => (
          <mesh key={i}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
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

/* ================= 3. SMOKE TRAIL (Asap Ban Drifting Kontinu dengan S-Curve & Arc Halus) ================= */
const SMOKE_PALETTE = ["#DCDCDC", "#C0C0C0", "#EAEAEA", "#A8A8A8", "#B5B5B5"];

export function InGameSmokeTrail({ width = 0.4, length = 1.0, wave = 2.5 }: EffectProps) {
  const group = useRef<THREE.Group>(null);
  const N = 32;

  const w = Math.max(0.3, Math.min(3.0, width));
  const l = Math.max(0.3, Math.min(3.0, length));
  const wav = Math.max(0.0, Math.min(3.0, wave));

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();

    group.current.children.forEach((child, i) => {
      const speed = 0.85 + rnd(i, 3) * 0.35;
      const life = ((t * speed + (i / N) * 1.8) % 1.7) / 1.7;
      const xDist = life * (8.5 * l);
      const lagY = trailHistory.getLagY(xDist, t, l, wav);
      const lagZ = trailHistory.getLagZ(xDist, t, l, wav);

      const wheelSide = (i % 2 === 0 ? 0.22 : -0.22) * w;
      const drift = (rnd(i, 5) * 2 - 1) * (0.10 + life * 0.55 * w);

      child.position.set(
        -xDist,
        0.05 + lagY + life * 1.1 + Math.sin(t * (1.8 + wav * 1.0) + i) * (0.06 * wav) * Math.min(1, life * 2),
        wheelSide + lagZ + drift
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

/* ================= 4. FIRE TRAIL (Api Ghost Rider & Pita Bara Aspal Kontinu Halus) ================= */
const FIRE_COLORS = ["#FFE600", "#FF9900", "#FF4500", "#D50000"];

export function InGameFireTrail({ width = 0.4, length = 1.0, wave = 2.5 }: EffectProps) {
  const flamesGroup = useRef<THREE.Group>(null);
  const SEG = 56;
  const N_FLAMES = 28;

  const w = Math.max(0.3, Math.min(3.0, width));
  const l = Math.max(0.3, Math.min(3.0, length));
  const wav = Math.max(0.0, Math.min(3.0, wave));

  // Pita aspal membara kontinu yang terpatri di jalan raya
  const emberStripGeom = useMemo(() => createRibbonGeometry(SEG), [SEG]);

  useEffect(() => {
    return () => {
      emberStripGeom.dispose();
    };
  }, [emberStripGeom]);

  const spinePoints = useMemo(() => {
    return Array.from({ length: SEG + 1 }, () => ({ x: 0, y: 0, z: 0 }));
  }, [SEG]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const totalDist = 8.5 * l;

    const latVel = trailHistory.getCurrentLatVel();
    const vh = trailHistory.getCurrentVh();
    const maneuverActivity = Math.min(1.0, Math.abs(latVel) * 0.35 + Math.abs(vh) * 0.25);
    const rippleDamp = 1.0 - maneuverActivity * 0.65;

    // Evaluasi spine kurva bara dengan inersia lateral saat pindah jalur & elevasi saat lompat
    for (let i = 0; i <= SEG; i++) {
      const s = i / SEG;
      const xDist = s * totalDist;
      const lagY = trailHistory.getLagY(xDist, t, l, wav);
      const lagZ = trailHistory.getLagZ(xDist, t, l, wav);

      const waveAmp = Math.pow(s, 1.3) * rippleDamp;
      const waveZ = Math.sin(t * 4.6 - s * 5.4) * (0.05 * w) * waveAmp;

      spinePoints[i].x = -xDist;
      spinePoints[i].y = lagY;
      spinePoints[i].z = lagZ + waveZ;
    }

    smoothSpineCurve(spinePoints, SEG, 2);

    // Update pita bara kontinu
    const posAttr = emberStripGeom.attributes.position as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;

    for (let i = 0; i <= SEG; i++) {
      const s = i / SEG;
      const pt = spinePoints[i];

      let dx = 0;
      let dz = 0;
      if (i === 0) {
        dx = spinePoints[1].x - spinePoints[0].x;
        dz = spinePoints[1].z - spinePoints[0].z;
      } else if (i === SEG) {
        dx = spinePoints[SEG].x - spinePoints[SEG - 1].x;
        dz = spinePoints[SEG].z - spinePoints[SEG - 1].z;
      } else {
        dx = spinePoints[i + 1].x - spinePoints[i - 1].x;
        dz = spinePoints[i + 1].z - spinePoints[i - 1].z;
      }

      const len = Math.sqrt(dx * dx + dz * dz) || 1;
      const sx = -dz / len;
      const sz = dx / len;

      const taper = Math.max(0.18, 1.0 - Math.pow(s, 1.8) * 0.65);
      const halfW = 0.5 * 0.38 * w * taper;

      posArr[i * 6 + 0] = pt.x - sx * halfW;
      posArr[i * 6 + 1] = pt.y + 0.015;
      posArr[i * 6 + 2] = pt.z - sz * halfW;

      posArr[i * 6 + 3] = pt.x + sx * halfW;
      posArr[i * 6 + 4] = pt.y + 0.015;
      posArr[i * 6 + 5] = pt.z + sz * halfW;
    }

    posAttr.needsUpdate = true;
    emberStripGeom.computeVertexNormals();

    // Lidah api menjilat ke atas di sepanjang kurva
    if (flamesGroup.current) {
      flamesGroup.current.children.forEach((child, i) => {
        const speed = 1.0 + rnd(i, 11) * 0.4;
        const life = ((t * speed + rnd(i, 12) * 10) % 1.5) / 1.5;
        const segIdx = Math.min(SEG - 1, Math.floor(life * SEG));
        const pt = spinePoints[segIdx];

        const wheelSide = (i % 2 === 0 ? 0.2 : -0.2) * w;
        const side = wheelSide + (rnd(i, 13) * 2 - 1) * (0.14 + life * 0.4 * w);
        const flick = Math.sin(t * 18 + i * 3) * (0.08 * (0.5 + wav * 0.5));

        child.position.set(
          pt.x,
          pt.y + 0.04 + life * 1.05 * (0.4 + rnd(i, 14) * 0.6) + flick,
          pt.z + side
        );
        child.rotation.y = t * 4 + i;

        const s = (1 - life * 0.65) * (0.8 + rnd(i, 15) * 0.4) * (0.8 + w * 0.2);
        child.scale.set(s, s * (1.2 + flick * 3), s);

        const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        m.opacity = 0.92 * (1 - life * 0.65);
      });
    }
  });

  return (
    <group>
      {/* Pita bara aspal menyala kontinu */}
      <mesh geometry={emberStripGeom}>
        <meshStandardMaterial
          color="#FF3D00"
          emissive="#FF5722"
          emissiveIntensity={2.1}
          transparent
          opacity={0.88}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Lidah api membara */}
      <group ref={flamesGroup}>
        {Array.from({ length: N_FLAMES }, (_, i) => {
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
    </group>
  );
}

/* ================= 5. LIGHTNING TRAIL (Pita Petir Listrik Bersambung Halus) ================= */
export function InGameLightningTrail({ width = 0.4, length = 1.0, wave = 2.5 }: EffectProps) {
  const sparksGroup = useRef<THREE.Group>(null);
  const SEG = 48;
  const SPARKS = 18;

  const w = Math.max(0.3, Math.min(3.0, width));
  const l = Math.max(0.3, Math.min(3.0, length));
  const wav = Math.max(0.0, Math.min(3.0, wave));

  // Pita petir kontinu bersambung utuh dari ekor skateboard
  const boltGeom = useMemo(() => createRibbonGeometry(SEG), [SEG]);

  useEffect(() => {
    return () => {
      boltGeom.dispose();
    };
  }, [boltGeom]);

  const spinePoints = useMemo(() => {
    return Array.from({ length: SEG + 1 }, () => ({ x: 0, y: 0, z: 0 }));
  }, [SEG]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const totalDist = 8.5 * l;

    // Evaluasi spine kilatan petir kontinu dengan inersia lateral
    for (let i = 0; i <= SEG; i++) {
      const s = i / SEG;
      const xDist = s * totalDist;
      const lagY = trailHistory.getLagY(xDist, t, l, wav);
      const lagZ = trailHistory.getLagZ(xDist, t, l, wav);

      const waveAmp = Math.pow(s, 1.25);
      const joltZ = Math.sin(t * 24 + i * 4.0) * (0.12 * w * Math.min(1.5, 0.4 + wav * 0.6)) * waveAmp;
      const joltY = Math.cos(t * 26 + i * 4.5) * (0.05 * wav) * waveAmp;

      spinePoints[i].x = -xDist;
      spinePoints[i].y = lagY + joltY;
      spinePoints[i].z = lagZ + joltZ;
    }

    smoothSpineCurve(spinePoints, SEG, 1);

    const posAttr = boltGeom.attributes.position as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;

    for (let i = 0; i <= SEG; i++) {
      const s = i / SEG;
      const pt = spinePoints[i];
      const taper = Math.max(0.15, 1.0 - Math.pow(s, 2.0) * 0.6);
      const halfW = 0.5 * 0.22 * w * taper;

      posArr[i * 6 + 0] = pt.x;
      posArr[i * 6 + 1] = pt.y - 0.05;
      posArr[i * 6 + 2] = pt.z - halfW;

      posArr[i * 6 + 3] = pt.x;
      posArr[i * 6 + 4] = pt.y + 0.05;
      posArr[i * 6 + 5] = pt.z + halfW;
    }

    posAttr.needsUpdate = true;
    boltGeom.computeVertexNormals();

    // Percikan loncatan muatan listrik
    if (sparksGroup.current) {
      sparksGroup.current.children.forEach((spark, i) => {
        const life = ((t * 2.2 + rnd(i, 21) * 10) % 1.0) / 1.0;
        const segIdx = Math.min(SEG - 1, Math.floor(life * SEG));
        const pt = spinePoints[segIdx];
        const jolt = (rnd(i, 22) * 2 - 1) * 0.25 * w;

        spark.position.set(pt.x, pt.y + 0.04, pt.z + jolt);
        const sz = ((1 - life) * 0.7 + 0.2) * (0.8 + w * 0.2);
        spark.scale.setScalar(sz);

        const m = (spark as THREE.Mesh).material as THREE.MeshStandardMaterial;
        m.opacity = Math.random() > 0.3 ? 0.95 : 0.4;
      });
    }
  });

  return (
    <group>
      {/* Busur petir listrik kontinu */}
      <mesh geometry={boltGeom}>
        <meshStandardMaterial
          color="#00E5FF"
          emissive="#FFFFFF"
          emissiveIntensity={2.5}
          side={THREE.DoubleSide}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Percikan ion listrik */}
      <group ref={sparksGroup}>
        {Array.from({ length: SPARKS }, (_, i) => (
          <mesh key={i}>
            <octahedronGeometry args={[0.08, 0]} />
            <meshStandardMaterial
              color="#FFEB3B"
              emissive="#FFD700"
              emissiveIntensity={2.8}
              transparent
              opacity={0.95}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ================= 6. FIREWORKS TRAIL (Kembang Api Gemerlap Kontinu Halus) ================= */
const FW_PALETTE = ["#FF1493", "#FFD700", "#00E5FF", "#76FF03", "#D500F9", "#FF6D00"];

export function InGameFireworksTrail({ width = 0.4, length = 1.0, wave = 2.5 }: EffectProps) {
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
      const xDist = b * (1.7 * l) + life * (2.4 * l);
      const lagY = trailHistory.getLagY(xDist, t, l, wav);
      const lagZ = trailHistory.getLagZ(xDist, t, l, wav);

      const cy = 0.1 + lagY + rnd(b, 31) * 0.85;
      const cz = lagZ + (rnd(b, 32) * 2 - 1) * (0.68 * w);

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

/* ================= 7. SAKURA TRAIL (Kelopak Bunga Sakura Mengalir di Kurva Heliks Halus) ================= */
const SAKURA_COLORS = ["#FFB7C5", "#FF9EAA", "#FFD1DC", "#FF80BF"];

export function InGameSakuraTrail({ width = 0.4, length = 1.0, wave = 2.5 }: EffectProps) {
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
      const xDist = life * (8.2 * l);
      const lagY = trailHistory.getLagY(xDist, t, l, wav);
      const lagZ = trailHistory.getLagZ(xDist, t, l, wav);

      const side = rnd(i, 3) * 2 - 1;

      // Gerakan pusaran heliks melengkung lembut
      const vortexZ = Math.cos(t * (2.5 + wav * 0.9) + life * 5) * (0.20 * w * Math.min(1.5, 0.35 + wav * 0.65));
      const vortexY = Math.sin(t * (2.5 + wav * 0.9) + life * 5) * (0.15 * wav);

      child.position.set(
        -xDist,
        0.06 + lagY + life * 1.35 + vortexY,
        lagZ + side * (0.34 + life * 1.3) * w + vortexZ
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
  width = 0.4,
  length = 1.0,
  wave = 2.5,
}: {
  effectId: string | null;
  width?: number;
  length?: number;
  wave?: number;
}) {
  // Update histori fisika elevasi & posisi lateral pemain per frame untuk flow delay kontinu saat melompat & pindah jalur
  const fadeRef = useRef<THREE.Group>(null);
  const fadeVal = useRef(1);
  useFrame(({ clock }, dt) => {
    const now = clock.getElapsedTime();
    const p = engine?.player;
    const h = p ? p.h : 0;
    const vh = p ? p.vh : 0;
    const lat = p ? p.lat : 0;
    const latVel = p ? p.latVel : 0;
    const sp = engine?.speed ? engine.speed : 14;
    trailHistory.update(now, h, vh, lat, latVel, sp);
    // Jatuh / nabrak / game over: trail auto mengecil ke 0, lalu kembali saat main lagi
    const down = engine.phase === "crashed" || engine.phase === "gameover" || engine.trailDown;
    fadeVal.current += ((down ? 0 : 1) - fadeVal.current) * Math.min(1, dt * (down ? 14 : 4));
    const g = fadeRef.current;
    if (g) {
      const s = Math.max(0, fadeVal.current);
      g.scale.setScalar(s);
      g.visible = s > 0.005;
    }
  });

  if (!effectId) return null;
  return <group ref={fadeRef}>{trailBody(effectId, width, length, wave)}</group>;
}

function trailBody(effectId: string, width: number, length: number, wave: number) {
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
