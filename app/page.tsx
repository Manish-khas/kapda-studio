// @ts-nocheck
"use client";
import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, RoundedBox } from "@react-three/drei";

const GARMENTS = {
  shirt: { label: "Shirt", price: 500 },
  kurta: { label: "Kurta", price: 700 },
  pant: { label: "Pant", price: 800 },
};
const FABRICS = {
  cotton: { label: "Cotton", price: 0, roughness: 0.9, metalness: 0 },
  linen: { label: "Linen", price: 200, roughness: 1, metalness: 0 },
  denim: { label: "Denim", price: 150, roughness: 0.8, metalness: 0 },
  silk: { label: "Silk", price: 500, roughness: 0.25, metalness: 0.15 },
};
const COLLARS = {
  none: { label: "No collar", price: 0 },
  mandarin: { label: "Mandarin", price: 50 },
  classic: { label: "Classic", price: 80 },
};
const SLEEVES = {
  half: { label: "Half", price: 0 },
  full: { label: "Full", price: 60 },
};
const POCKETS = {
  none: { label: "No pocket", price: 0 },
  single: { label: "Single", price: 40 },
  double: { label: "Double", price: 70 },
};
const FITS = {
  slim: { label: "Slim", price: 0 },
  regular: { label: "Regular", price: 0 },
  loose: { label: "Loose", price: 30 },
};
const COLORS = ["#2a4d8f", "#8f2a2a", "#2a8f5a", "#e8c547", "#222222", "#f2f2f2", "#c98ba8"];

function Mat({ d }) {
  const f = FABRICS[d.fabric];
  return (
    <meshStandardMaterial color={d.color} roughness={f.roughness} metalness={f.metalness} />
  );
}

function Sleeve({ d, side }) {
  const len = d.sleeves === "full" ? 1.5 : 0.7;
  return (
    <group position={[side * 0.82, 0.78, 0]} rotation={[0, 0, side * 0.5]}>
      <mesh position={[0, -len / 2, 0]}>
        <cylinderGeometry args={[0.29, 0.25, len, 24]} />
        <Mat d={d} />
      </mesh>
    </group>
  );
}

function Collar({ d }) {
  if (d.collar === "none") return null;
  if (d.collar === "mandarin") {
    return (
      <mesh position={[0, 0.98, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.27, 0.07, 12, 32]} />
        <Mat d={d} />
      </mesh>
    );
  }
  return (
    <>
      <mesh position={[-0.2, 0.92, 0.33]} rotation={[0.3, 0, 0.6]}>
        <boxGeometry args={[0.42, 0.06, 0.3]} />
        <Mat d={d} />
      </mesh>
      <mesh position={[0.2, 0.92, 0.33]} rotation={[0.3, 0, -0.6]}>
        <boxGeometry args={[0.42, 0.06, 0.3]} />
        <Mat d={d} />
      </mesh>
    </>
  );
}

function Buttons({ top, bottom }) {
  const n = 5;
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <mesh key={i} position={[0, top - ((top - bottom) / (n - 1)) * i, 0.37]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color="#eeeeee" roughness={0.3} />
        </mesh>
      ))}
    </>
  );
}

function TopGarment({ d }) {
  const isKurta = d.garment === "kurta";
  const h = isKurta ? 2.9 : 1.9;
  const cy = 0.95 - h / 2;
  return (
    <group position={[0, isKurta ? 0.5 : 0, 0]}>
      <RoundedBox args={[1.55, h, 0.7]} radius={0.1} smoothness={4} position={[0, cy, 0]}>
        <Mat d={d} />
      </RoundedBox>
      <Sleeve d={d} side={-1} />
      <Sleeve d={d} side={1} />
      <Collar d={d} />
      <Buttons top={0.8} bottom={isKurta ? -0.2 : -0.8} />
      {d.pocket !== "none" && (
        <mesh position={[0.4, 0.3, 0.37]}>
          <boxGeometry args={[0.36, 0.4, 0.04]} />
          <Mat d={d} />
        </mesh>
      )}
      {d.pocket === "double" && (
        <mesh position={[-0.4, 0.3, 0.37]}>
          <boxGeometry args={[0.36, 0.4, 0.04]} />
          <Mat d={d} />
        </mesh>
      )}
    </group>
  );
}

function Pant({ d }) {
  const fit = {
    slim: [0.36, 0.2],
    regular: [0.38, 0.28],
    loose: [0.42, 0.38],
  }[d.fit];
  return (
    <group>
      <RoundedBox args={[1.5, 0.35, 0.7]} radius={0.08} smoothness={4} position={[0, 0.9, 0]}>
        <Mat d={d} />
      </RoundedBox>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.38, -0.5, 0]} scale={[1, 1, 0.9]}>
          <cylinderGeometry args={[fit[0], fit[1], 2.7, 24]} />
          <Mat d={d} />
        </mesh>
      ))}
      {d.pocket !== "none" && (
        <mesh position={[0.4, 0.2, 0.33]}>
          <boxGeometry args={[0.3, 0.35, 0.04]} />
          <Mat d={d} />
        </mesh>
      )}
      {d.pocket === "double" && (
        <mesh position={[-0.4, 0.2, 0.33]}>
          <boxGeometry args={[0.3, 0.35, 0.04]} />
          <Mat d={d} />
        </mesh>
      )}
      <mesh position={[0, 0.9, 0.36]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial color="#cccccc" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Options({ title, options, value, onChange }) {
  return (
    <div className="mb-5">
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {Object.entries(options).map(([key, o]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`px-3 py-1 rounded border text-sm ${
              value === key ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            {o.label} {o.price > 0 && `(+₹${o.price})`}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [d, setD] = useState({
    garment: "shirt",
    fabric: "cotton",
    color: "#2a4d8f",
    collar: "mandarin",
    sleeves: "half",
    pocket: "none",
    fit: "regular",
  });
  const [spin, setSpin] = useState(true);
  const set = (k) => (v) => setD((prev) => ({ ...prev, [k]: v }));
  const isPant = d.garment === "pant";

  const total =
    GARMENTS[d.garment].price +
    FABRICS[d.fabric].price +
    POCKETS[d.pocket].price +
    (isPant
      ? FITS[d.fit].price
      : COLLARS[d.collar].price + SLEEVES[d.sleeves].price);

  return (
    <main className="min-h-screen p-4 md:p-6 bg-gray-100 text-black">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Kapda Studio</h1>
        <div className="text-2xl font-bold">₹{total}</div>
      </div>

      <div className="flex gap-2 mb-4">
        {Object.entries(GARMENTS).map(([k, g]) => (
          <button
            key={k}
            onClick={() => set("garment")(k)}
            className={`px-4 py-2 rounded-full border font-medium ${
              d.garment === k ? "bg-black text-white" : "bg-white"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-2">
          <div style={{ height: 480 }}>
            <Canvas camera={{ position: [0, 0.3, 5.5], fov: 40 }}>
              <color attach="background" args={["#f7f7f7"]} />
              <hemisphereLight args={["#ffffff", "#bbbbbb", 0.9]} />
              <directionalLight position={[3, 5, 4]} intensity={1.6} />
              <directionalLight position={[-3, 2, -4]} intensity={0.6} />
              {isPant ? <Pant d={d} /> : <TopGarment d={d} />}
              <OrbitControls
                enablePan={false}
                minDistance={3}
                maxDistance={9}
                autoRotate={spin}
                autoRotateSpeed={2}
              />
            </Canvas>
          </div>
          <div className="flex justify-between items-center px-2 pb-1 text-sm text-gray-500">
            <span>Drag karke ghumao, scroll/pinch se zoom</span>
            <button onClick={() => setSpin(!spin)} className="underline">
              {spin ? "Auto-rotate band" : "Auto-rotate chalu"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <Options title="Fabric" options={FABRICS} value={d.fabric} onChange={set("fabric")} />
          <div className="mb-5">
            <h3 className="font-semibold mb-2">Color</h3>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => set("color")(c)}
                  style={{ background: c }}
                  className={`w-8 h-8 rounded-full border-2 ${
                    d.color === c ? "border-black" : "border-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {isPant ? (
            <Options title="Fit" options={FITS} value={d.fit} onChange={set("fit")} />
          ) : (
            <>
              <Options title="Collar" options={COLLARS} value={d.collar} onChange={set("collar")} />
              <Options title="Sleeves" options={SLEEVES} value={d.sleeves} onChange={set("sleeves")} />
            </>
          )}
          <Options title="Pocket" options={POCKETS} value={d.pocket} onChange={set("pocket")} />

          <div className="border-t pt-4 mt-4 text-sm text-gray-600">
            {GARMENTS[d.garment].label} base ₹{GARMENTS[d.garment].price} + add-ons
          </div>
        </div>
      </div>
    </main>
  );
}