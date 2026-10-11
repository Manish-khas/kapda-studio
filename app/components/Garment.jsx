"use client";
import { createContext, useContext, useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { CAT, BASE_LEN } from "../lib/catalog";

/* ---------- textures (ek baar bante hain, cache hote hain) ---------- */
const Ctx = createContext(null);
const TC = new Map();
const memo = (k, f) => {
  if (!TC.has(k)) TC.set(k, f());
  return TC.get(k);
};
const cv = () => {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  return c;
};
const mk = (c, rep, srgb) => {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rep, rep);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

// Kapde ki bunai (weave) ka bump: cotton=plain, denim=twill, linen=slub
const weaveTex = (type) =>
  memo("w" + type, () => {
    const c = cv(), g = c.getContext("2d");
    g.fillStyle = "#808080";
    g.fillRect(0, 0, 128, 128);
    if (type === "plain")
      for (let i = 0; i < 128; i += 4) { g.fillStyle = "#c8c8c8"; g.fillRect(i, 0, 2, 128); g.fillStyle = "#505050"; g.fillRect(0, i, 128, 2); }
    if (type === "twill") {
      g.strokeStyle = "#dcdcdc"; g.lineWidth = 2;
      for (let i = -128; i < 256; i += 8) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 128, 128); g.stroke(); }
    }
    if (type === "slub")
      for (let i = 0; i < 500; i++) { g.fillStyle = Math.random() > 0.5 ? "#b4b4b4" : "#606060"; g.fillRect(Math.random() * 128, Math.floor(Math.random() * 128), 4 + Math.random() * 14, 1); }
    return mk(c, 14, false);
  });

const printTex = (print, hex) =>
  memo(`p${print}${hex}`, () => {
    const c = cv(), g = c.getContext("2d");
    g.fillStyle = hex; g.fillRect(0, 0, 128, 128);
    g.fillStyle = "rgba(255,255,255,0.5)";
    if (print === "stripes") for (let x = 0; x < 128; x += 32) g.fillRect(x, 0, 12, 128);
    if (print === "checks") {
      g.fillStyle = "rgba(255,255,255,0.3)";
      for (let x = 0; x < 128; x += 64) g.fillRect(x, 0, 32, 128);
      for (let y = 0; y < 128; y += 64) g.fillRect(0, y, 128, 32);
    }
    if (print === "dots") for (let x = 16; x < 128; x += 32) for (let y = 16; y < 128; y += 32) { g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); }
    if (print === "floral")
      [[32, 32], [96, 96]].forEach(([x, y]) => {
        for (let a = 0; a < 5; a++) { g.beginPath(); g.arc(x + Math.cos(a * 1.257) * 11, y + Math.sin(a * 1.257) * 11, 8, 0, 7); g.fill(); }
        g.fillStyle = "rgba(255,200,60,0.95)"; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,0.5)";
      });
    return mk(c, 3, true);
  });

// Upload ki hui ya public/materials ki photo -> texture
const imgTex = (url, rep) =>
  memo(`i${url}${rep}`, () => {
    const t = new THREE.TextureLoader().load(url);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rep, rep);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  });

/* ---------- material: har area ka apna color/fabric/print/photo ---------- */
function Mat({ part }) {
  const { d, sel } = useContext(Ctx);
  const p = d.parts[part];
  const isBtn = part === "buttons";
  const o = (isBtn ? CAT.btnColor : CAT.color)[p.color];
  const f = CAT.fabric[p.fabric];
  const map = p.img ? imgTex(p.img, isBtn ? 1 : 2) : p.print !== "none" && !isBtn ? printTex(p.print, o.hex) : null;
  const weave = !isBtn && f.w ? weaveTex(f.w) : null;
  const on = sel === part;
  return (
    <meshPhysicalMaterial
      color={map ? "#ffffff" : o.hex}
      map={map}
      bumpMap={weave}
      bumpScale={0.8}
      roughness={isBtn ? (o.metal ? 0.3 : 0.6) : f.r}
      metalness={isBtn ? (o.metal ? 0.9 : 0) : f.m}
      sheen={isBtn ? 0 : f.s}
      sheenRoughness={0.5}
      sheenColor="#ffffff"
      emissive={on ? "#4f46e5" : "#000000"}
      emissiveIntensity={on ? 0.45 : 0}
      side={THREE.DoubleSide}
    />
  );
}

function Logo({ L, z, flip }) {
  if (!L) return null;
  const w = 0.6 * L.s;
  return (
    <mesh position={[flip ? -L.x : L.x, L.y, z]} rotation={[0, flip ? Math.PI : 0, 0]}>
      <planeGeometry args={[w, w / L.a]} />
      <meshStandardMaterial map={imgTex(L.url, 1)} transparent roughness={0.7} depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
    </mesh>
  );
}

/* ---------- export: front + back ki high-res image ---------- */
export function Exporter({ api }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    api.current = () => {
      const old = gl.getPixelRatio(), pos = camera.position.clone();
      const shot = (z) => {
        camera.position.set(0, 0.3, z);
        camera.lookAt(0, 0, 0);
        gl.setPixelRatio(3);
        gl.render(scene, camera);
        return gl.domElement.toDataURL("image/png");
      };
      const out = { front: shot(5.8), back: shot(-5.8) };
      camera.position.copy(pos);
      gl.setPixelRatio(old);
      return out;
    };
  }, [gl, scene, camera, api]);
  return null;
}

/* ---------- garment ---------- */
export default function Garment({ d, sel, setSel }) {
  const pick = (k) => ({ onClick: (e) => { e.stopPropagation(); setSel(k); } });
  const isPant = d.garment === "pant", isKurta = d.garment === "kurta";
  const clamp = (v) => Math.min(1.4, Math.max(0.8, v));
  const custom = d.size === "custom";
  const sx = custom ? clamp(d.meas.chest / 100) : CAT.size[d.size].s;
  const sy = custom ? clamp(d.meas.length / BASE_LEN[d.garment]) : 1;

  const baseHex = CAT.color[d.parts[isPant ? "legs" : "front"].color].hex;
  const st = CAT.stitch[d.stitch];
  const threadHex = d.stitch === "tone" ? "#" + new THREE.Color(baseHex).multiplyScalar(0.6).getHexString() : st.hex;
  const thread = d.stitch !== "none" ? <meshStandardMaterial color={threadHex} /> : null;

  const Button = ({ y, z = 0.37, x = 0 }) => (
    <mesh position={[x, y, z]} rotation={d.button === "toggle" ? [0, 0, Math.PI / 2] : [0, 0, 0]} {...pick("buttons")}>
      {d.button === "round" && <sphereGeometry args={[0.04, 16, 16]} />}
      {d.button === "square" && <boxGeometry args={[0.07, 0.07, 0.03]} />}
      {d.button === "toggle" && <cylinderGeometry args={[0.025, 0.025, 0.13, 12]} />}
      <Mat part="buttons" />
    </mesh>
  );
  const Pocket = ({ x, y, z, w, h }) => (
    <mesh position={[x, y, z]} {...pick("pocket")}>
      <boxGeometry args={[w, h, 0.04]} />
      <Mat part="pocket" />
    </mesh>
  );

  if (isPant) {
    const [rt, rb] = { slim: [0.36, 0.2], regular: [0.38, 0.28], loose: [0.42, 0.38] }[d.fit];
    return (
      <Ctx.Provider value={{ d, sel }}>
        <group scale={[sx, sy, sx]}>
          <RoundedBox args={[1.5, 0.35, 0.7]} radius={0.08} smoothness={4} position={[0, 0.9, 0]} {...pick("waist")}>
            <Mat part="waist" />
          </RoundedBox>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.38, -0.5, 0]} scale={[1, 1, 0.9]} {...pick("legs")}>
              <cylinderGeometry args={[rt, rb, 2.7, 32]} />
              <Mat part="legs" />
            </mesh>
          ))}
          {d.pocket !== "none" && <Pocket x={0.4} y={0.2} z={0.33} w={0.3} h={0.35} />}
          {d.pocket === "double" && <Pocket x={-0.4} y={0.2} z={0.33} w={0.3} h={0.35} />}
          <Button y={0.9} z={0.36} />
          {thread && <mesh position={[0, 0.76, 0.353]}><boxGeometry args={[1.5, 0.02, 0.012]} />{thread}</mesh>}
        </group>
      </Ctx.Provider>
    );
  }

  const h = isKurta ? 2.9 : 1.9;
  const bottom = 0.95 - h;
  const sl = { half: 0.7, threeq: 1.1, full: 1.5 }[d.sleeve];
  const ch = { none: 0, plain: 0.08, wide: 0.16 }[d.cuff];
  const nBtn = isKurta ? 4 : 5;
  const bTop = 0.8, bBot = isKurta ? -0.2 : -0.8;

  return (
    <Ctx.Provider value={{ d, sel }}>
      <group scale={[sx, sy, sx]} position={[0, isKurta ? 0.5 : 0, 0]}>
        {/* front aur back panel alag-alag select hote hain */}
        <RoundedBox args={[1.55, h, 0.35]} radius={0.1} smoothness={4} position={[0, 0.95 - h / 2, 0.175]} {...pick("front")}>
          <Mat part="front" />
        </RoundedBox>
        <RoundedBox args={[1.55, h, 0.35]} radius={0.1} smoothness={4} position={[0, 0.95 - h / 2, -0.175]} {...pick("back")}>
          <Mat part="back" />
        </RoundedBox>

        <Logo L={d.logo.front} z={0.352} />
        <Logo L={d.logo.back} z={-0.352} flip />

        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.82, 0.78, 0]} rotation={[0, 0, s * 0.5]} {...pick("sleeves")}>
            <mesh position={[0, -sl / 2, 0]}>
              <cylinderGeometry args={[0.29, 0.25, sl, 32]} />
              <Mat part="sleeves" />
            </mesh>
            {ch > 0 && (
              <mesh position={[0, -sl + ch / 2, 0]} {...pick("cuffs")}>
                <cylinderGeometry args={[0.265, 0.265, ch, 32]} />
                <Mat part="cuffs" />
              </mesh>
            )}
          </group>
        ))}

        {d.collar === "round" && (
          <mesh position={[0, 0.98, 0]} rotation={[Math.PI / 2, 0, 0]} {...pick("collar")}>
            <torusGeometry args={[0.27, 0.06, 12, 32]} />
            <Mat part="collar" />
          </mesh>
        )}
        {d.collar === "mandarin" && (
          <mesh position={[0, 1.0, 0]} {...pick("collar")}>
            <cylinderGeometry args={[0.27, 0.27, 0.14, 24, 1, true]} />
            <Mat part="collar" />
          </mesh>
        )}
        {d.collar === "v" &&
          [-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.12, 0.86, 0.36]} rotation={[0, 0, -s * 0.9]} {...pick("collar")}>
              <boxGeometry args={[0.4, 0.06, 0.04]} />
              <Mat part="collar" />
            </mesh>
          ))}
        {d.collar === "spread" &&
          [-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.27, 0.93, 0.3]} rotation={[0.35, 0, s * 0.5]} {...pick("collar")}>
              <boxGeometry args={[0.5, 0.05, 0.3]} />
              <Mat part="collar" />
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
                <boxGeometry args={[0.012, 0.85 - (bottom + 0.1), 0.012]} />
                {thread}
              </mesh>
            ))}
          </>
        )}
      </group>
    </Ctx.Provider>
  );
}
