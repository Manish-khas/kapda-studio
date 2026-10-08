// @ts-nocheck
"use client";
import { useState, useMemo, useEffect } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, RoundedBox } from "@react-three/drei";

/* ---------- 1. CATALOG: har option ka naam + price (yahan se price aata hai) ---------- */
const CAT = {
  garment: { shirt: { label: "Shirt", price: 500 }, kurta: { label: "Kurta", price: 700 }, pant: { label: "Pant", price: 800 } },
  fabric: {
    cotton: { label: "Cotton", price: 0, r: 0.9, m: 0 },
    linen: { label: "Linen", price: 200, r: 1, m: 0 },
    denim: { label: "Denim", price: 150, r: 0.8, m: 0 },
    silk: { label: "Silk", price: 500, r: 0.25, m: 0.15 },
  },
  color: {
    navy: { label: "Navy", hex: "#1f3a6e", price: 0 }, white: { label: "White", hex: "#f2f2f2", price: 0 },
    sky: { label: "Sky blue", hex: "#7fb2e0", price: 0 }, olive: { label: "Olive", hex: "#6b7a3a", price: 0 },
    sand: { label: "Sand", hex: "#d8c3a0", price: 0 }, maroon: { label: "Maroon", hex: "#7a1f2b", price: 0 },
    gold: { label: "Mustard", hex: "#d9a826", price: 0 }, emerald: { label: "Emerald", hex: "#1f7a5a", price: 0 },
    pink: { label: "Rose pink", hex: "#c98ba8", price: 0 }, black: { label: "Black", hex: "#1c1c1c", price: 0 },
    grey: { label: "Charcoal", hex: "#4a4f57", price: 0 },
  },
  collar: {
    none: { label: "No collar", price: 0 }, round: { label: "Round", price: 40 }, v: { label: "V-neck", price: 40 },
    spread: { label: "Spread", price: 80 }, mandarin: { label: "Mandarin", price: 50 },
  },
  sleeve: { half: { label: "Half", price: 0 }, threeq: { label: "3/4", price: 30 }, full: { label: "Full", price: 60 } },
  cuff: { none: { label: "No cuff", price: 0 }, plain: { label: "Plain", price: 40 }, wide: { label: "Wide", price: 70 }, contrast: { label: "Contrast", price: 90 } },
  button: { round: { label: "Round", price: 0 }, square: { label: "Square", price: 20 }, toggle: { label: "Toggle", price: 40 } },
  btnColor: {
    white: { label: "White", hex: "#f4f4f4", price: 0 }, black: { label: "Black", hex: "#111111", price: 0 },
    gold: { label: "Gold", hex: "#d4af37", price: 30, metal: true }, wood: { label: "Wood", hex: "#8b5a2b", price: 20 },
  },
  stitch: {
    none: { label: "No stitching", price: 0 }, tone: { label: "Tone-on-tone", price: 0 },
    white: { label: "White thread", price: 40, hex: "#ffffff" }, gold: { label: "Gold thread", price: 60, hex: "#d4af37" },
  },
  print: {
    none: { label: "Plain", price: 0 }, stripes: { label: "Stripes", price: 120 }, checks: { label: "Checks", price: 150 },
    dots: { label: "Polka dots", price: 100 }, floral: { label: "Floral", price: 200 },
  },
  pocket: { none: { label: "No pocket", price: 0 }, single: { label: "Single", price: 40 }, double: { label: "Double", price: 70 } },
  fit: { slim: { label: "Slim", price: 0 }, regular: { label: "Regular", price: 0 }, loose: { label: "Loose", price: 30 } },
  size: {
    S: { label: "S", price: 0, s: 0.92 }, M: { label: "M", price: 0, s: 1 }, L: { label: "L", price: 0, s: 1.08 },
    XL: { label: "XL", price: 0, s: 1.16 }, XXL: { label: "XXL", price: 0, s: 1.24 },
    custom: { label: "Custom (apna naap)", price: 150 },
  },
};
const TITLE = {
  garment: "Style", fabric: "Fabric", color: "Color", collar: "Collar", sleeve: "Sleeves", cuff: "Cuffs",
  button: "Button style", btnColor: "Button color", stitch: "Stitching", print: "Print / pattern",
  pocket: "Pockets", fit: "Fit", size: "Size",
};
const KEYS = Object.keys(TITLE);

/* ---------- 2. COLLECTIONS: sirf yahi options customer ko dikhenge ---------- */
const ALL_SIZES = ["S", "M", "L", "XL", "XXL", "custom"];
const COL = {
  summer: {
    label: "Summer Casual", garment: ["shirt", "pant"], fabric: ["cotton", "linen"],
    color: ["navy", "white", "sky", "olive", "sand"], collar: ["round", "spread", "mandarin", "v"],
    sleeve: ["half", "threeq", "full"], cuff: ["none", "plain", "wide"], button: ["round", "square"],
    btnColor: ["white", "black", "wood"], stitch: ["none", "tone", "white"], print: ["none", "stripes", "checks", "dots"],
    pocket: ["none", "single", "double"], fit: ["slim", "regular", "loose"], size: ALL_SIZES,
  },
  festive: {
    label: "Festive Ethnic", garment: ["kurta", "pant"], fabric: ["cotton", "silk", "linen"],
    color: ["maroon", "gold", "emerald", "pink", "black"], collar: ["none", "mandarin", "round"],
    sleeve: ["threeq", "full"], cuff: ["none", "plain", "contrast"], button: ["round", "toggle"],
    btnColor: ["gold", "white", "wood"], stitch: ["none", "gold", "white"], print: ["none", "floral", "dots"],
    pocket: ["none", "single"], fit: ["regular", "loose"], size: ALL_SIZES,
  },
  formal: {
    label: "Office Formal", garment: ["shirt", "pant"], fabric: ["cotton", "denim", "silk"],
    color: ["white", "sky", "grey", "black", "navy"], collar: ["spread", "mandarin"],
    sleeve: ["half", "full"], cuff: ["plain", "wide", "contrast"], button: ["round", "square"],
    btnColor: ["white", "black", "gold"], stitch: ["none", "tone", "white"], print: ["none", "stripes", "checks"],
    pocket: ["none", "single"], fit: ["slim", "regular"], size: ALL_SIZES,
  },
};
const pick = (list, pref) => (list.includes(pref) ? pref : list[0]);
const defaults = (c) => Object.fromEntries(KEYS.map((k) => [k, pick(COL[c][k], k === "size" ? "M" : k === "fit" ? "regular" : null)]));
const BASE_LEN = { shirt: 72, kurta: 100, pant: 105 };

/* ---------- 3. PRINT TEXTURE (canvas se bante hain) ---------- */
function usePrintTex(print, hex) {
  return useMemo(() => {
    if (print === "none" || typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    g.fillStyle = hex;
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = "rgba(255,255,255,0.5)";
    if (print === "stripes") for (let x = 0; x < 128; x += 32) g.fillRect(x, 0, 12, 128);
    if (print === "checks") {
      g.fillStyle = "rgba(255,255,255,0.3)";
      for (let x = 0; x < 128; x += 64) g.fillRect(x, 0, 32, 128);
      for (let y = 0; y < 128; y += 64) g.fillRect(0, y, 128, 32);
    }
    if (print === "dots")
      for (let x = 16; x < 128; x += 32) for (let y = 16; y < 128; y += 32) { g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); }
    if (print === "floral")
      [[32, 32], [96, 96]].forEach(([x, y]) => {
        for (let a = 0; a < 5; a++) { g.beginPath(); g.arc(x + Math.cos(a * 1.257) * 11, y + Math.sin(a * 1.257) * 11, 8, 0, 7); g.fill(); }
        g.fillStyle = "rgba(255,200,60,0.95)"; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,0.5)";
      });
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 3);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [print, hex]);
}

/* ---------- 4. 3D GARMENT ---------- */
function Garment({ d, meas }) {
  const hex = CAT.color[d.color].hex;
  const f = CAT.fabric[d.fabric];
  const tex = usePrintTex(d.print, hex);
  const mat = <meshStandardMaterial color={tex ? "#ffffff" : hex} map={tex} roughness={f.r} metalness={f.m} side={THREE.DoubleSide} />;
  const white = <meshStandardMaterial color="#f2f2f2" roughness={0.8} />;
  const bc = CAT.btnColor[d.btnColor];
  const btnMat = <meshStandardMaterial color={bc.hex} roughness={bc.metal ? 0.3 : 0.6} metalness={bc.metal ? 0.9 : 0} />;
  const st = CAT.stitch[d.stitch];
  const threadHex = d.stitch === "tone" ? "#" + new THREE.Color(hex).multiplyScalar(0.6).getHexString() : st.hex;
  const thread = d.stitch !== "none" ? <meshStandardMaterial color={threadHex} /> : null;

  const isPant = d.garment === "pant", isKurta = d.garment === "kurta";
  const sz = CAT.size[d.size];
  const clamp = (v) => Math.min(1.4, Math.max(0.8, v));
  const sx = d.size === "custom" ? clamp(meas.chest / 100) : sz.s;
  const sy = d.size === "custom" ? clamp(meas.length / BASE_LEN[d.garment]) : 1;

  const Button = ({ y, z = 0.37, x = 0 }) => (
    <mesh position={[x, y, z]} rotation={d.button === "toggle" ? [0, 0, Math.PI / 2] : [0, 0, 0]}>
      {d.button === "round" && <sphereGeometry args={[0.04, 14, 14]} />}
      {d.button === "square" && <boxGeometry args={[0.07, 0.07, 0.03]} />}
      {d.button === "toggle" && <cylinderGeometry args={[0.025, 0.025, 0.13, 12]} />}
      {btnMat}
    </mesh>
  );
  const Pocket = ({ x, y, z, w, h }) => (
    <mesh position={[x, y, z]}><boxGeometry args={[w, h, 0.04]} />{mat}</mesh>
  );

  if (isPant) {
    const [rt, rb] = { slim: [0.36, 0.2], regular: [0.38, 0.28], loose: [0.42, 0.38] }[d.fit];
    return (
      <group scale={[sx, sy, sx]}>
        <RoundedBox args={[1.5, 0.35, 0.7]} radius={0.08} smoothness={4} position={[0, 0.9, 0]}>{mat}</RoundedBox>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.38, -0.5, 0]} scale={[1, 1, 0.9]}>
            <cylinderGeometry args={[rt, rb, 2.7, 24]} />{mat}
          </mesh>
        ))}
        {d.pocket !== "none" && <Pocket x={0.4} y={0.2} z={0.33} w={0.3} h={0.35} />}
        {d.pocket === "double" && <Pocket x={-0.4} y={0.2} z={0.33} w={0.3} h={0.35} />}
        <Button y={0.9} z={0.36} />
        {thread && <mesh position={[0, 0.76, 0.353]}><boxGeometry args={[1.5, 0.02, 0.012]} />{thread}</mesh>}
      </group>
    );
  }

  const h = isKurta ? 2.9 : 1.9;
  const bottom = 0.95 - h;
  const sl = { half: 0.7, threeq: 1.1, full: 1.5 }[d.sleeve];
  const ch = { none: 0, plain: 0.08, wide: 0.16, contrast: 0.1 }[d.cuff];
  const nBtn = isKurta ? 4 : 5;
  const bTop = 0.8, bBot = isKurta ? -0.2 : -0.8;
  const dark = <meshStandardMaterial color="#ffffff" roughness={0.8} opacity={0.0} transparent />;

  return (
    <group scale={[sx, sy, sx]} position={[0, isKurta ? 0.5 : 0, 0]}>
      <RoundedBox args={[1.55, h, 0.7]} radius={0.1} smoothness={4} position={[0, 0.95 - h / 2, 0]}>{mat}</RoundedBox>

      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.82, 0.78, 0]} rotation={[0, 0, s * 0.5]}>
          <mesh position={[0, -sl / 2, 0]}><cylinderGeometry args={[0.29, 0.25, sl, 24]} />{mat}</mesh>
          {ch > 0 && (
            <mesh position={[0, -sl + ch / 2, 0]}>
              <cylinderGeometry args={[0.265, 0.265, ch, 24]} />
              {d.cuff === "contrast" ? white : mat}
            </mesh>
          )}
          {d.cuff === "wide" && (
            <mesh position={[0.0, -sl + ch / 2, 0.27]}><sphereGeometry args={[0.025, 10, 10]} />{btnMat}</mesh>
          )}
        </group>
      ))}

      {d.collar === "round" && <mesh position={[0, 0.98, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.27, 0.06, 12, 32]} />{mat}</mesh>}
      {d.collar === "mandarin" && <mesh position={[0, 1.0, 0]}><cylinderGeometry args={[0.27, 0.27, 0.14, 24, 1, true]} />{mat}</mesh>}
      {d.collar === "v" &&
        [-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.12, 0.86, 0.36]} rotation={[0, 0, -s * 0.9]}>
            <boxGeometry args={[0.4, 0.06, 0.04]} />{mat}
          </mesh>
        ))}
      {d.collar === "spread" &&
        [-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.27, 0.93, 0.3]} rotation={[0.35, 0, s * 0.5]}>
            <boxGeometry args={[0.5, 0.05, 0.3]} />{mat}
          </mesh>
        ))}

      {Array.from({ length: nBtn }).map((_, i) => (
        <Button key={i} y={bTop - ((bTop - bBot) / (nBtn - 1)) * i} />
      ))}

      {d.pocket !== "none" && <Pocket x={0.4} y={0.3} z={0.37} w={0.36} h={0.4} />}
      {d.pocket === "double" && <Pocket x={-0.4} y={0.3} z={0.37} w={0.36} h={0.4} />}

      {thread && (
        <>
          <mesh position={[0, bottom + 0.08, 0.353]}><boxGeometry args={[1.5, 0.02, 0.012]} />{thread}</mesh>
          {[-0.1, 0.1].map((x) => (
            <mesh key={x} position={[x, (0.85 + bottom + 0.1) / 2, 0.353]}>
              <boxGeometry args={[0.012, 0.85 - (bottom + 0.1), 0.012]} />{thread}
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

/* ---------- 5. UI ---------- */
function Options({ k, d, col, set }) {
  const cur = CAT[k][d[k]];
  return (
    <div className="mb-5">
      <h3 className="font-semibold mb-2 text-slate-800">
        {TITLE[k]}: <span className="font-normal text-slate-500">{cur.label}</span>
      </h3>
      <div className="flex flex-wrap gap-2">
        {COL[col][k].map((key) => {
          const o = CAT[k][key], on = d[k] === key;
          if (o.hex && (k === "color" || k === "btnColor"))
            return (
              <button key={key} title={o.label + (o.price ? ` (+₹${o.price})` : "")} onClick={() => set(k, key)}
                style={{ background: o.hex }}
                className={`w-9 h-9 rounded-full border-2 ${on ? "border-indigo-700 ring-2 ring-indigo-300" : "border-slate-300"}`} />
            );
          return (
            <button key={key} onClick={() => set(k, key)}
              className={`px-3 py-1.5 rounded-lg border text-sm ${on ? "bg-indigo-700 text-white border-indigo-700" : "bg-white text-slate-800 border-slate-300"}`}>
              {o.label} {o.price > 0 && <span className="opacity-70">+₹{o.price}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const TABS = { Style: ["garment", "collar", "sleeve", "cuff", "fit", "pocket"], Fabric: ["fabric", "color", "print"], Details: ["button", "btnColor", "stitch"], Size: ["size"] };

export default function Home() {
  const [col, setCol] = useState("summer");
  const [d, setD] = useState(defaults("summer"));
  const [tab, setTab] = useState("Style");
  const [spin, setSpin] = useState(true);
  const [meas, setMeas] = useState({ chest: 100, length: 72 });
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("kapda-design") || "null");
      if (s && COL[s.col]) { setCol(s.col); setD(s.d); setMeas(s.meas); }
    } catch (e) {}
  }, []);

  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));
  const changeCol = (c) => { setCol(c); setD(defaults(c)); };
  const isPant = d.garment === "pant";
  const skip = isPant ? ["collar", "sleeve", "cuff"] : ["fit"];
  const visible = (k) => !skip.includes(k);

  const lines = KEYS.filter(visible).map((k) => ({ k, label: CAT[k][d[k]].label, price: CAT[k][d[k]].price || 0 }));
  const total = lines.reduce((a, l) => a + l.price, 0);

  const onSize = d.size === "custom";
  const techPack = () =>
    `KAPDA STUDIO - SAMPLE ORDER\nCollection: ${COL[col].label}\n\n` +
    lines.map((l) => `${TITLE[l.k]}: ${l.label}${l.price ? ` (Rs ${l.price})` : ""}`).join("\n") +
    (onSize ? `\n\nMeasurements: Chest ${meas.chest} cm, Length ${meas.length} cm` : "") +
    `\n\nTOTAL: Rs ${total}`;

  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([techPack()], { type: "text/plain" }));
    a.download = "tech-pack.txt";
    a.click();
  };
  const save = () => {
    try { localStorage.setItem("kapda-design", JSON.stringify({ col, d, meas })); setMsg("Design save ho gaya"); } catch (e) { setMsg("Save nahi hua"); }
    setTimeout(() => setMsg(""), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 pb-24">
      <header className="px-4 pt-4 md:px-6">
        <h1 className="text-2xl font-bold text-indigo-900">Kapda Studio</h1>
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {Object.entries(COL).map(([id, c]) => (
            <button key={id} onClick={() => changeCol(id)}
              className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap ${col === id ? "bg-indigo-900 text-white" : "bg-white"}`}>
              {c.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-1">Is collection mein jo options hain, sirf wahi chun sakte ho.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-5 p-4 md:p-6">
        <section className="bg-white rounded-xl p-2 md:sticky md:top-4 self-start">
          <div style={{ height: 460 }}>
            <Canvas camera={{ position: [0, 0.3, 5.8], fov: 40 }}>
              <color attach="background" args={["#f3f4f8"]} />
              <hemisphereLight args={["#ffffff", "#aaaaaa", 0.9]} />
              <directionalLight position={[3, 5, 4]} intensity={1.6} />
              <directionalLight position={[-3, 2, -4]} intensity={0.6} />
              <Garment d={d} meas={meas} />
              <OrbitControls enablePan={false} minDistance={3} maxDistance={9} autoRotate={spin} autoRotateSpeed={2} />
            </Canvas>
          </div>
          <div className="flex justify-between px-2 pb-1 text-sm text-slate-500">
            <span>Drag se ghumao, pinch se zoom</span>
            <button onClick={() => setSpin(!spin)} className="underline">{spin ? "Rotate band" : "Rotate chalu"}</button>
          </div>
        </section>

        <section className="bg-white rounded-xl p-4">
          <div className="flex gap-1 mb-4 border-b">
            {Object.keys(TABS).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-2 text-sm font-medium -mb-px border-b-2 ${tab === t ? "border-indigo-700 text-indigo-800" : "border-transparent text-slate-500"}`}>
                {t}
              </button>
            ))}
          </div>

          {TABS[tab].filter(visible).map((k) => <Options key={k} k={k} d={d} col={col} set={set} />)}

          {tab === "Size" && onSize && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[["chest", "Chest / kamar (cm)"], ["length", "Lambai (cm)"]].map(([key, lab]) => (
                <label key={key} className="text-sm text-slate-700">
                  {lab}
                  <input type="number" value={meas[key]} min={60} max={160}
                    onChange={(e) => setMeas({ ...meas, [key]: Number(e.target.value) || 0 })}
                    className="mt-1 w-full border rounded-lg px-3 py-2" />
                </label>
              ))}
              <p className="col-span-2 text-xs text-slate-500">3D model aapke naap ke hisaab se badlega. Naapne ka sahi tarika baad mein video mein jodenge.</p>
            </div>
          )}

          <div className="border-t pt-3 mt-2 text-sm">
            <h3 className="font-semibold mb-2">Price breakup</h3>
            {lines.filter((l) => l.price > 0).map((l) => (
              <div key={l.k} className="flex justify-between py-0.5 text-slate-600">
                <span>{TITLE[l.k]}: {l.label}</span><span>₹{l.price}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 mt-2 border-t font-bold text-base">
              <span>Total</span><span>₹{total}</span>
            </div>
          </div>
        </section>
      </div>

      <footer className="fixed bottom-0 inset-x-0 bg-white border-t px-4 py-3 flex items-center gap-2">
        <div className="mr-auto">
          <div className="text-xs text-slate-500">{msg || "Live price"}</div>
          <div className="text-xl font-bold">₹{total}</div>
        </div>
        <button onClick={() => setD(defaults(col))} className="px-3 py-2 rounded-lg border text-sm">Reset</button>
        <button onClick={save} className="px-3 py-2 rounded-lg border text-sm">Save</button>
        <button onClick={() => setOpen(true)} className="px-4 py-2 rounded-lg bg-indigo-700 text-white text-sm font-medium">Order sample</button>
      </footer>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center p-4 z-50" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-xl p-5 w-full max-w-md max-h-[85vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-1">Sample order</h2>
            <p className="text-sm text-slate-600 mb-3">Sample milne aur approve karne ke baad hi design marketplace par publish hoga.</p>
            <pre className="text-xs bg-slate-100 rounded-lg p-3 whitespace-pre-wrap mb-4">{techPack()}</pre>
            <div className="flex gap-2 flex-wrap">
              <button onClick={download} className="px-3 py-2 rounded-lg border text-sm">Tech pack download</button>
              <a href={"https://wa.me/?text=" + encodeURIComponent(techPack())} target="_blank" rel="noreferrer"
                className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm">WhatsApp par bhejo</a>
              <button onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm ml-auto">Band karo</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
