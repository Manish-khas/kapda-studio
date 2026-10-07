// @ts-nocheck
"use client";
import { useState } from "react";

const FABRICS = {
  cotton: { label: "Cotton", price: 400 },
  linen: { label: "Linen", price: 600 },
  silk: { label: "Silk", price: 900 },
};
const COLLARS = {
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
};
const COLORS = ["#2a4d8f", "#8f2a2a", "#2a8f5a", "#e8c547", "#222222", "#f2f2f2"];

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
    fabric: "cotton",
    color: "#2a4d8f",
    collar: "mandarin",
    sleeves: "half",
    pocket: "none",
  });
  const set = (k) => (v) => setD({ ...d, [k]: v });

  const total =
    FABRICS[d.fabric].price +
    COLLARS[d.collar].price +
    SLEEVES[d.sleeves].price +
    POCKETS[d.pocket].price;

  const sleeveW = d.sleeves === "full" ? 120 : 55;

  return (
    <main className="min-h-screen p-6 bg-gray-100 text-black">
      <h1 className="text-2xl font-bold mb-6">Kapda Studio</h1>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Preview */}
        <div className="bg-white rounded-lg p-4 flex flex-col items-center">
          <svg viewBox="0 0 300 320" className="w-full max-w-sm">
            {/* sleeves */}
            <rect x={100 - sleeveW} y="60" width={sleeveW} height="50" rx="10" fill={d.color} stroke="#0003" />
            <rect x="200" y="60" width={sleeveW} height="50" rx="10" fill={d.color} stroke="#0003" />
            {/* body */}
            <rect x="80" y="50" width="140" height="240" rx="12" fill={d.color} stroke="#0003" />
            {/* collar */}
            {d.collar === "mandarin" ? (
              <rect x="125" y="40" width="50" height="14" rx="4" fill="#fff" stroke="#0004" />
            ) : (
              <polygon points="120,45 150,75 180,45 165,40 150,55 135,40" fill="#fff" stroke="#0004" />
            )}
            {/* pocket */}
            {d.pocket === "single" && (
              <rect x="160" y="110" width="40" height="45" rx="4" fill="none" stroke="#fff" strokeWidth="2" />
            )}
          </svg>
          <p className="text-sm text-gray-500 mt-2">{FABRICS[d.fabric].label} shirt</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg p-4">
          <Options title="Fabric" options={FABRICS} value={d.fabric} onChange={set("fabric")} />
          <div className="mb-5">
            <h3 className="font-semibold mb-2">Color</h3>
            <div className="flex gap-2">
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
          <Options title="Collar" options={COLLARS} value={d.collar} onChange={set("collar")} />
          <Options title="Sleeves" options={SLEEVES} value={d.sleeves} onChange={set("sleeves")} />
          <Options title="Pocket" options={POCKETS} value={d.pocket} onChange={set("pocket")} />

          <div className="border-t pt-4 mt-4 flex justify-between items-center">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold">₹{total}</span>
          </div>
        </div>
      </div>
    </main>
  );
}