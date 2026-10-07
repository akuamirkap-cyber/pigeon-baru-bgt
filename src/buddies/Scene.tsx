import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { SKINS } from "./characters";
import { EFFECTS } from "./effects";

/* Kamera responsif: layar portrait (mobile) zoom out biar proporsional */
function ResponsiveCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / size.height;
    const z =
      aspect < 0.5 ? 38 : aspect < 0.65 ? 33 : aspect < 0.8 ? 27 : aspect < 1.1 ? 19 : 13;
    const y = aspect < 0.8 ? 6.5 : 5.2;
    camera.position.set(0, y, z);
    camera.lookAt(0, 2.6, 0);
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

/* ===== Spring fisik stabil: meluncur mulus tanpa getaran ===== */
function SpringDriver({
  target,
  currentRef,
  velRef,
}: {
  target: number;
  currentRef: React.MutableRefObject<number>;
  velRef: React.MutableRefObject<number>;
}) {
  useFrame((_, rawDt) => {
    // Batasi dt untuk mencegah lonjakan saat frame rate turun
    const dt = Math.min(rawDt, 0.033);
    const x = currentRef.current;
    const diff = target - x;
    // Parameter spring yang sangat mulus dan stabil (kritis teredam dengan sedikit overshoot manis)
    const stiffness = 125;
    const damping = 16.5;
    velRef.current += diff * stiffness * dt;
    velRef.current *= Math.exp(-damping * dt);
    const nextX = x + velRef.current * dt;
    // Bersihkan floating point saat hampir diam agar tidak bergetar mikroskopis
    if (Math.abs(target - nextX) < 0.001 && Math.abs(velRef.current) < 0.005) {
      currentRef.current = target;
      velRef.current = 0;
    } else {
      currentRef.current = nextX;
    }
  });
  return null;
}

/* Kurva posisi & skala berdasarkan jarak dari tengah */
const XS = [0, 3.2, 5.3, 7.1, 8.8];
const SCS = [1, 0.45, 0.35, 0.28, 0.22];

// Interpolasi smoothstep (C1 kontinu) untuk menghilangkan patahan turunan saat bergeser
function smoothCurve(curve: number[], ad: number): number {
  if (ad <= 0) return curve[0];
  if (ad >= curve.length - 1) return curve[curve.length - 1];
  const lo = Math.floor(ad);
  const frac = ad - lo;
  // Smoothstep s-curve: 3x^2 - 2x^3
  const smoothFrac = frac * frac * (3 - 2 * frac);
  return curve[lo] + (curve[lo + 1] - curve[lo]) * smoothFrac;
}

/* ===== Slot karakter: posisi dihitung tiap frame dari spring ===== */
function Slot({
  i,
  skinIdx,
  currentRef,
  velRef,
}: {
  i: number;
  skinIdx: number;
  currentRef: React.MutableRefObject<number>;
  velRef: React.MutableRefObject<number>;
}) {
  const ref = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const { Comp, float } = SKINS[skinIdx];

  useFrame(({ clock }) => {
    if (!ref.current || !inner.current) return;
    const d = i - currentRef.current;
    const ad = Math.abs(d);
    if (ad > 4.3) {
      ref.current.visible = false;
      return;
    }
    ref.current.visible = true;

    // Posisi dan skala halus
    const x = Math.sign(d) * smoothCurve(XS, ad);
    const sc = smoothCurve(SCS, ad);
    const lift = 2.6 * (1 - sc);
    const z = -0.6 * Math.min(ad, 1);
    ref.current.position.set(x, lift, z);
    ref.current.scale.setScalar(sc);

    const t = clock.getElapsedTime();
    // Bobot tengah (1 jika tepat di tengah, 0 jika di pinggir)
    const centerWeight = Math.max(0, 1 - ad);
    // Kecepatan geser saat ini: redam idle-hop saat bergeser agar transisi meluncur licin tanpa getar
    const speed = Math.abs(velRef.current);
    const glideDamp = Math.max(0, 1 - Math.min(speed * 0.45, 0.9));

    if (float) {
      // Kendaraan / Skate melayang tenang
      const base = 0.6 + centerWeight * 0.6;
      // Frekuensi waktu dibuat KONSTAN (t * 2.0) tanpa modulasi cw untuk mencegah getar fase
      const bob = Math.sin(t * 2.0) * (0.08 + centerWeight * 0.18) * glideDamp;
      inner.current.position.y = base + bob;
      // Kemiringan halus mengikuti arah luncur
      const tiltZ = -velRef.current * 0.035 * centerWeight;
      inner.current.rotation.z = Math.sin(t * 1.2) * 0.04 * centerWeight + tiltZ;
      inner.current.rotation.x = Math.sin(t * 1.0) * 0.03 * centerWeight;
      inner.current.scale.set(1, 1, 1);
    } else {
      // Karakter binatang: Hop mantap dengan frekuensi KONSTAN t * 3.0
      // TIDAK ADA modulasi frekuensi dinamis, sehingga nol getaran saat bergeser
      const hop = Math.abs(Math.sin(t * 3.0));
      inner.current.position.y = hop * (0.08 + centerWeight * 0.22) * glideDamp;
      // Squash hanya aktif saat diam di tengah
      const squashFactor = centerWeight * glideDamp * 0.025;
      const squash = 1 + Math.sin(t * 6.0) * squashFactor;
      inner.current.scale.set(1 / squash, squash, 1 / squash);
      // Kemiringan dinamis (lean) saat meluncur kiri-kanan seperti di game Crossy Road asli
      const leanZ = -velRef.current * 0.05 * centerWeight;
      inner.current.rotation.z = leanZ;
      inner.current.rotation.x = 0;
    }

    // Rotasi Y: Tatap depan dengan goyangan lembut di tengah, bukan putar kencang yang membingungkan mata
    inner.current.rotation.y = Math.sin(t * 0.8) * 0.12 * centerWeight;
  });

  return (
    <group ref={ref}>
      <group ref={inner}>
        <Comp />
      </group>
    </group>
  );
}

/* Efek trail hanya tampil saat carousel hampir diam */
function EffectHolder({
  effectId,
  pos,
  currentRef,
}: {
  effectId: string | null;
  pos: number;
  currentRef: React.MutableRefObject<number>;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    const settled = Math.abs(pos - currentRef.current) < 0.2;
    ref.current.visible = settled;
  });

  const effect = EFFECTS.find((e) => e.id === effectId);
  if (!effect) return null;

  return (
    <group ref={ref}>
      <effect.Comp key={effect.id} />
    </group>
  );
}

export default function Scene({
  pos,
  listIndices,
  effectId,
}: {
  pos: number;
  listIndices: number[];
  effectId: string | null;
}) {
  const currentRef = useRef(pos);
  const velRef = useRef(0);
  const n = listIndices.length;

  // Window 9 slot di sekitar target
  const slots: { i: number; skinIdx: number }[] = [];
  for (let off = -4; off <= 4; off++) {
    const i = pos + off;
    slots.push({ i, skinIdx: listIndices[((i % n) + n) % n] });
  }

  return (
    <Canvas
      shadows
      camera={{ position: [0, 5.2, 13], fov: 40 }}
      gl={{ antialias: true }}
      className="!touch-none"
    >
      <ResponsiveCamera />
      <SpringDriver target={pos} currentRef={currentRef} velRef={velRef} />
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[8, 14, 6]}
        intensity={1.6}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <directionalLight position={[-6, 6, -6]} intensity={0.35} color="#bcd9ff" />

      <Suspense fallback={null}>
        {slots.map((s) => (
          <Slot
            key={s.i}
            i={s.i}
            skinIdx={s.skinIdx}
            currentRef={currentRef}
            velRef={velRef}
          />
        ))}
        <EffectHolder effectId={effectId} pos={pos} currentRef={currentRef} />
        <ContactShadows
          position={[0, 0.02, 0]}
          opacity={0.25}
          scale={20}
          blur={2.4}
          far={5}
        />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableDamping={true}
        dampingFactor={0.08}
        minAzimuthAngle={-Math.PI / 8}
        maxAzimuthAngle={Math.PI / 8}
        minPolarAngle={0.6}
        maxPolarAngle={Math.PI / 2.15}
        target={[0, 2.6, 0]}
      />
    </Canvas>
  );
}
