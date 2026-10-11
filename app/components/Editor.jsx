"use client";
import { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Garment, { Exporter } from "./Garment";
import { CAT, COL, TITLE, PART_LABEL, LIB, newDesign, availParts, priceLines, techPack } from "../lib/catalog";
import { useHistory } from "../lib/history";

const TOOLS = [["color", "🎨 Color"], ["fabric", "🧵 Fabric"], ["print", "🖌️ Print"], ["image", "🖼️ Image"], ["button", "🔘 Button"], ["shape", "✂️ Shape"]];

const Pill = ({ on, onClick, children }) => (
  <button onClick={onClick} className={`px-3 py-1.5 rounded-lg border text-sm ${on ? "bg-indigo-700 text-white border-indigo-700" : "bg-white text-slate-800 border-slate-300"}`}>
    {children}
  </button>
);
const Sw = ({ o, on, onClick }) => (
  <button title={o.label} onClick={onClick} style={{ background: o.hex }}
    className={`w-9 h-9 rounded-full border-2 ${on ? "border-indigo-700 ring-2 ring-indigo-300" : "border-slate-300"}`} />
);
const Group = ({ title, children }) => (
  <div className="mb-5">
    <h3 className="font-semibold mb-2 text-slate-800 text-sm">{title}</h3>
    <div className="flex flex-wrap gap-2 items-center">{children}</div>
  </div>
);
const Thumb = ({ m, on, onClick }) => (
  <button title={m.label} onClick={onClick} className={`w-14 h-14 rounded-lg border-2 overflow-hidden ${on ? "border-indigo-700" : "border-slate-300"}`}>
    <img src={m.url} alt={m.label} className="w-full h-full object-cover" />
  </button>
);
const Upload = ({ label, onFile }) => (
  <label className="px-3 py-1.5 rounded-lg border border-dashed border-slate-400 text-sm cursor-pointer text-slate-700">
    {label}
    <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files[0]; if (f) onFile(URL.createObjectURL(f)); e.target.value = ""; }} />
  </label>
);

export default function Editor() {
  const [col, setCol] = useState("summer");
  const h = useHistory(newDesign("summer"));
  const d = h.d;
  const [selRaw, setSel] = useState(null);
  const [tool, setTool] = useState("color");
  const [spin, setSpin] = useState(true);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const exp = useRef(null);

  const parts = availParts(d);
  const sel = selRaw && parts.includes(selRaw) ? selRaw : null;
  const isPant = d.garment === "pant";
  const cur = d.parts[sel || (isPant ? "legs" : "front")];
  const lines = priceLines(d);
  const total = lines.reduce((a, l) => a + l.price, 0);
  const lib = (kind) => LIB.filter((m) => m.kind === kind && m.cols.includes(col));

  /* ----- actions ----- */
  const setG = (k, v) => h.set((x) => ({ ...x, [k]: v }));
  const targets = () => (sel ? [sel] : parts.filter((k) => k !== "buttons"));
  const patch = (p, only) =>
    h.set((x) => ({ ...x, parts: { ...x.parts, ...Object.fromEntries((only ? [only] : targets()).map((k) => [k, { ...x.parts[k], ...p }])) } }));
  const applyAll = () => h.set((x) => ({ ...x, parts: Object.fromEntries(Object.entries(x.parts).map(([k, p]) => [k, k === "buttons" ? p : { ...x.parts[sel] }])) }));
  const changeCol = (c) => { setCol(c); h.reset(newDesign(c)); setSel(null); };
  const side = sel === "back" ? "back" : "front";
  const setLogo = (p) => h.set((x) => ({ ...x, logo: { ...x.logo, [side]: p && { ...x.logo[side], ...p } } }));
  const addLogo = (url) => {
    const im = new Image();
    im.onload = () => h.set((x) => ({ ...x, logo: { ...x.logo, [side]: { url, a: im.width / im.height, x: 0, y: 0.3, s: 1 } } }));
    im.src = url;
  };

  /* ----- save / export ----- */
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("kapda-v2") || "null");
      if (s && COL[s.col]) { setCol(s.col); h.reset(s.d); }
    } catch (e) {}
  }, []);
  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(""), 2000); };
  const save = () => {
    const clean = JSON.parse(JSON.stringify(d, (k, v) => (typeof v === "string" && v.startsWith("blob:") ? null : v)));
    try { localStorage.setItem("kapda-v2", JSON.stringify({ col, d: clean })); flash("Design save ho gaya"); } catch (e) { flash("Save nahi hua"); }
  };
  const capture = (cb) => {
    const prev = selRaw;
    setSel(null);
    setTimeout(() => { const img = exp.current(); setSel(prev); cb(img); }, 150);
  };
  const png = () => capture((img) => { const a = document.createElement("a"); a.href = img.front; a.download = "kapda-design.png"; a.click(); });
  const pdf = () => {
    const w = window.open("", "_blank");
    capture((img) => {
      w.document.write(`<html><head><title>Kapda Studio design</title><style>body{font-family:sans-serif;padding:24px}img{width:48%;border:1px solid #ddd}table{border-collapse:collapse;margin-top:16px;width:100%}td{border-bottom:1px solid #eee;padding:4px 8px}</style></head><body><h2>Kapda Studio - ${COL[col].label}</h2><img src="${img.front}"/> <img src="${img.back}"/><table>${lines.map((l) => `<tr><td>${l.label}</td><td align=right>₹${l.price}</td></tr>`).join("")}<tr><td><b>Total</b></td><td align=right><b>₹${total}</b></td></tr></table></body></html>`);
      w.document.close();
      setTimeout(() => w.print(), 700);
    });
  };
  const pack = techPack(d, col, lines, total);

  const Row = ({ k }) => (
    <Group title={`${TITLE[k]}: ${CAT[k][d[k]].label}`}>
      {COL[col][k].map((v) => (
        <Pill key={v} on={d[k] === v} onClick={() => setG(k, v)}>
          {CAT[k][v].label}{CAT[k][v].price > 0 && <span className="opacity-70"> +₹{CAT[k][v].price}</span>}
        </Pill>
      ))}
    </Group>
  );

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 pb-24">
      <header className="px-4 pt-4 md:px-6">
        <h1 className="text-2xl font-bold text-indigo-900">Kapda Studio</h1>
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {Object.entries(COL).map(([id, c]) => (
            <button key={id} onClick={() => changeCol(id)} className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap ${col === id ? "bg-indigo-900 text-white" : "bg-white"}`}>{c.label}</button>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          {COL[col].garment.map((g) => (
            <Pill key={g} on={d.garment === g} onClick={() => setG("garment", g)}>{CAT.garment[g].label}</Pill>
          ))}
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-5 p-4 md:p-6">
        {/* ---- 3D canvas ---- */}
        <section className="bg-white rounded-xl p-2 md:sticky md:top-4 self-start">
          <div className="flex gap-1 px-1 pb-2">
            <button disabled={!h.canUndo} onClick={h.undo} className="px-3 py-1 rounded border text-sm disabled:opacity-40">↩️ Undo</button>
            <button disabled={!h.canRedo} onClick={h.redo} className="px-3 py-1 rounded border text-sm disabled:opacity-40">↪️ Redo</button>
            <button onClick={() => { h.reset(newDesign(col)); setSel(null); }} className="px-3 py-1 rounded border text-sm">🔄 Reset</button>
            <button onClick={() => setSpin(!spin)} className="ml-auto text-sm underline text-slate-500">{spin ? "Rotate band" : "Rotate chalu"}</button>
          </div>
          <div style={{ height: 460 }}>
            <Canvas camera={{ position: [0, 0.3, 5.8], fov: 40 }} gl={{ preserveDrawingBuffer: true }} dpr={[1, 2]} onPointerMissed={() => setSel(null)}>
              <color attach="background" args={["#f3f4f8"]} />
              <hemisphereLight args={["#ffffff", "#aaaaaa", 0.9]} />
              <directionalLight position={[3, 5, 4]} intensity={1.6} />
              <directionalLight position={[-3, 2, -4]} intensity={0.8} />
              <Garment d={d} sel={sel} setSel={setSel} />
              <Exporter api={exp} />
              <OrbitControls enablePan={false} minDistance={3} maxDistance={9} autoRotate={spin && !sel} autoRotateSpeed={2} />
            </Canvas>
          </div>
          <div className="px-1 pt-2">
            <p className="text-xs text-slate-500 mb-1">Kapde par click karo ya neeche se area chuno:</p>
            <div className="flex flex-wrap gap-1.5">
              <Pill on={!sel} onClick={() => setSel(null)}>Sab</Pill>
              {parts.map((k) => <Pill key={k} on={sel === k} onClick={() => setSel(k)}>{PART_LABEL[k]}</Pill>)}
            </div>
          </div>
        </section>

        {/* ---- tools ---- */}
        <section className="bg-white rounded-xl p-4">
          <div className="flex gap-1 mb-3 overflow-x-auto border-b">
            {TOOLS.map(([id, label]) => (
              <button key={id} onClick={() => setTool(id)} className={`px-3 py-2 text-sm font-medium whitespace-nowrap -mb-px border-b-2 ${tool === id ? "border-indigo-700 text-indigo-800" : "border-transparent text-slate-500"}`}>{label}</button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Edit ho raha hai: <b className="text-indigo-800">{sel ? PART_LABEL[sel] : "Poora kapda (buttons ko chhodkar)"}</b>
          </p>

          {tool === "color" && (
            <>
              <Group title={`Color: ${(sel === "buttons" ? CAT.btnColor : CAT.color)[cur.color].label}`}>
                {COL[col][sel === "buttons" ? "btnColor" : "color"].map((k) => {
                  const o = (sel === "buttons" ? CAT.btnColor : CAT.color)[k];
                  return <Sw key={k} o={o} on={cur.color === k && !cur.img} onClick={() => patch({ color: k, img: null })} />;
                })}
              </Group>
              {sel && sel !== "buttons" && <button onClick={applyAll} className="text-sm underline text-indigo-800">Is area ka material poore kapde par lagao</button>}
            </>
          )}

          {tool === "fabric" && (
            sel === "buttons" ? <p className="text-sm text-slate-500">Buttons ke liye 🔘 Button tool use karo.</p> : (
              <>
                <Group title={`Fabric: ${cur.img ? "Custom photo" : CAT.fabric[cur.fabric].label}`}>
                  {COL[col].fabric.map((k) => (
                    <Pill key={k} on={cur.fabric === k && !cur.img} onClick={() => patch({ fabric: k, img: null })}>
                      {CAT.fabric[k].label}{CAT.fabric[k].price > 0 && <span className="opacity-70"> +₹{CAT.fabric[k].price}</span>}
                    </Pill>
                  ))}
                </Group>
                <Group title="Collection ke fabric photos">
                  {lib("fabric").map((m) => <Thumb key={m.id} m={m} on={cur.img === m.url} onClick={() => patch({ img: m.url })} />)}
                  <Upload label="+ Apni fabric photo" onFile={(u) => patch({ img: u })} />
                </Group>
              </>
            )
          )}

          {tool === "print" && (
            sel === "buttons" ? <p className="text-sm text-slate-500">Buttons par print nahi hota.</p> : (
              <Group title={`Print: ${CAT.print[cur.print].label}`}>
                {COL[col].print.map((k) => (
                  <Pill key={k} on={cur.print === k && !cur.img} onClick={() => patch({ print: k, img: null })}>
                    {CAT.print[k].label}{CAT.print[k].price > 0 && <span className="opacity-70"> +₹{CAT.print[k].price}</span>}
                  </Pill>
                ))}
              </Group>
            )
          )}

          {tool === "image" && (
            isPant ? <p className="text-sm text-slate-500">Logo/image abhi sirf shirt aur kurta ke front/back par lagta hai.</p> : (
              <>
                <Group title={`Logo / artwork: ${side === "front" ? "Front" : "Back"} (Back chunne ke liye Back panel select karo)`}>
                  {lib("print").map((m) => <Thumb key={m.id} m={m} on={d.logo[side]?.url === m.url} onClick={() => addLogo(m.url)} />)}
                  <Upload label="+ Apna logo / design (PNG)" onFile={addLogo} />
                </Group>
                {d.logo[side] && (
                  <div className="space-y-2 text-sm">
                    {[["x", "Left-Right", -0.6, 0.6], ["y", "Upar-Neeche", -0.8, 0.8], ["s", "Size", 0.3, 2]].map(([k, lab, mn, mx]) => (
                      <label key={k} className="flex items-center gap-3">
                        <span className="w-24">{lab}</span>
                        <input type="range" min={mn} max={mx} step="0.02" value={d.logo[side][k]} onChange={(e) => setLogo({ [k]: Number(e.target.value) })} className="flex-1" />
                      </label>
                    ))}
                    <button onClick={() => setLogo(null)} className="underline text-red-600">Logo hatao</button>
                  </div>
                )}
              </>
            )
          )}

          {tool === "button" && (
            <>
              <Row k="button" />
              <Group title={`Button color: ${CAT.btnColor[d.parts.buttons.color].label}`}>
                {COL[col].btnColor.map((k) => <Sw key={k} o={CAT.btnColor[k]} on={d.parts.buttons.color === k && !d.parts.buttons.img} onClick={() => patch({ color: k, img: null }, "buttons")} />)}
              </Group>
              <Group title="Button photo (accessory)">
                {lib("button").map((m) => <Thumb key={m.id} m={m} on={d.parts.buttons.img === m.url} onClick={() => patch({ img: m.url }, "buttons")} />)}
                <Upload label="+ Apni button photo" onFile={(u) => patch({ img: u }, "buttons")} />
              </Group>
            </>
          )}

          {tool === "shape" && (
            <>
              {!isPant && <Row k="collar" />}
              {!isPant && <Row k="sleeve" />}
              {!isPant && <Row k="cuff" />}
              {isPant && <Row k="fit" />}
              <Row k="pocket" />
              <Row k="stitch" />
              <Row k="size" />
              {d.size === "custom" && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[["chest", "Chest / kamar (cm)"], ["length", "Lambai (cm)"]].map(([k, lab]) => (
                    <label key={k} className="text-sm text-slate-700">{lab}
                      <input type="number" min={60} max={160} value={d.meas[k]} onChange={(e) => setG("meas", { ...d.meas, [k]: Number(e.target.value) || 0 })} className="mt-1 w-full border rounded-lg px-3 py-2" />
                    </label>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="border-t pt-3 mt-4 text-sm">
            <h3 className="font-semibold mb-2">Price breakup</h3>
            {lines.map((l, i) => (
              <div key={i} className="flex justify-between py-0.5 text-slate-600"><span>{l.label}</span><span>₹{l.price}</span></div>
            ))}
            <div className="flex justify-between pt-2 mt-2 border-t font-bold text-base"><span>Total</span><span>₹{total}</span></div>
          </div>
        </section>
      </div>

      <footer className="fixed bottom-0 inset-x-0 bg-white border-t px-4 py-3 flex items-center gap-2">
        <div className="mr-auto">
          <div className="text-xs text-slate-500">{msg || "Live price"}</div>
          <div className="text-xl font-bold">₹{total}</div>
        </div>
        <button onClick={save} className="px-3 py-2 rounded-lg border text-sm">Save</button>
        <button onClick={() => setOpen(true)} className="px-4 py-2 rounded-lg bg-indigo-700 text-white text-sm font-medium">Export / Order</button>
      </footer>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center p-4 z-50" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-xl p-5 w-full max-w-md max-h-[85vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-1">Final design</h2>
            <p className="text-sm text-slate-600 mb-3">Sample milne aur approve karne ke baad hi design marketplace par publish hoga.</p>
            <pre className="text-xs bg-slate-100 rounded-lg p-3 whitespace-pre-wrap mb-4">{pack}</pre>
            <div className="flex gap-2 flex-wrap">
              <button onClick={png} className="px-3 py-2 rounded-lg border text-sm">PNG (high-res)</button>
              <button onClick={pdf} className="px-3 py-2 rounded-lg border text-sm">Print / PDF</button>
              <a href={"https://wa.me/?text=" + encodeURIComponent(pack)} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm">WhatsApp par bhejo</a>
              <button onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm ml-auto">Band karo</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
