/* ===== KAPDA STUDIO: catalog + collections + pricing ===== */

// Apni material photos public/materials/ folder mein rakho, phir yahan line jodo (uncomment karke).
// kind: "fabric" (kapde ki photo) | "button" (button ki photo) | "print" (logo/design png)
export const LIB = [
  // { id: "cotton1", kind: "fabric", label: "Block-print cotton", url: "/materials/cotton.jpg", price: 150, cols: ["summer", "festive"] },
  // { id: "btn1", kind: "button", label: "Shell button", url: "/materials/button1.png", price: 40, cols: ["summer"] },
  // { id: "art1", kind: "print", label: "Peacock art", url: "/materials/design.png", price: 150, cols: ["festive"] },
];
export const libPrice = (url, fallback) => LIB.find((m) => m.url === url)?.price ?? fallback;

export const CAT = {
  garment: { shirt: { label: "Shirt", price: 500 }, kurta: { label: "Kurta", price: 700 }, pant: { label: "Pant", price: 800 } },
  fabric: {
    cotton: { label: "Cotton", price: 0, r: 0.9, m: 0, s: 0.6, w: "plain" },
    linen: { label: "Linen", price: 200, r: 1, m: 0, s: 0.3, w: "slub" },
    denim: { label: "Denim", price: 150, r: 0.85, m: 0, s: 0.2, w: "twill" },
    silk: { label: "Silk", price: 500, r: 0.3, m: 0.1, s: 1, w: null },
  },
  color: {
    navy: { label: "Navy", hex: "#1f3a6e" }, white: { label: "White", hex: "#f2f2f2" }, sky: { label: "Sky blue", hex: "#7fb2e0" },
    olive: { label: "Olive", hex: "#6b7a3a" }, sand: { label: "Sand", hex: "#d8c3a0" }, maroon: { label: "Maroon", hex: "#7a1f2b" },
    gold: { label: "Mustard", hex: "#d9a826" }, emerald: { label: "Emerald", hex: "#1f7a5a" }, pink: { label: "Rose pink", hex: "#c98ba8" },
    black: { label: "Black", hex: "#1c1c1c" }, grey: { label: "Charcoal", hex: "#4a4f57" },
  },
  collar: {
    none: { label: "No collar", price: 0 }, round: { label: "Round", price: 40 }, v: { label: "V-neck", price: 40 },
    spread: { label: "Spread", price: 80 }, mandarin: { label: "Mandarin", price: 50 },
  },
  sleeve: { half: { label: "Half", price: 0 }, threeq: { label: "3/4", price: 30 }, full: { label: "Full", price: 60 } },
  cuff: { none: { label: "No cuff", price: 0 }, plain: { label: "Plain", price: 40 }, wide: { label: "Wide", price: 70 } },
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
    XL: { label: "XL", price: 0, s: 1.16 }, XXL: { label: "XXL", price: 0, s: 1.24 }, custom: { label: "Custom (apna naap)", price: 150 },
  },
};
export const TITLE = {
  collar: "Collar", sleeve: "Sleeves", cuff: "Cuffs", button: "Button style", stitch: "Stitching", pocket: "Pocket", fit: "Fit", size: "Size",
};
export const PART_LABEL = {
  front: "Front panel", back: "Back panel", sleeves: "Sleeves", collar: "Collar", cuffs: "Cuffs",
  pocket: "Pocket", buttons: "Buttons", waist: "Waistband", legs: "Legs",
};
const ALL = Object.keys(PART_LABEL);
export const BASE_LEN = { shirt: 72, kurta: 100, pant: 105 };

/* ===== COLLECTIONS: customer sirf yahi options chun sakta hai ===== */
const SIZES = ["S", "M", "L", "XL", "XXL", "custom"];
export const COL = {
  summer: {
    label: "Summer Casual", garment: ["shirt", "pant"], fabric: ["cotton", "linen"],
    color: ["navy", "white", "sky", "olive", "sand"], collar: ["round", "spread", "mandarin", "v"],
    sleeve: ["half", "threeq", "full"], cuff: ["none", "plain", "wide"], button: ["round", "square"],
    btnColor: ["white", "black", "wood"], stitch: ["none", "tone", "white"], print: ["none", "stripes", "checks", "dots"],
    pocket: ["none", "single", "double"], fit: ["slim", "regular", "loose"], size: SIZES,
  },
  festive: {
    label: "Festive Ethnic", garment: ["kurta", "pant"], fabric: ["cotton", "silk", "linen"],
    color: ["maroon", "gold", "emerald", "pink", "black"], collar: ["none", "mandarin", "round"],
    sleeve: ["threeq", "full"], cuff: ["none", "plain"], button: ["round", "toggle"],
    btnColor: ["gold", "white", "wood"], stitch: ["none", "gold", "white"], print: ["none", "floral", "dots"],
    pocket: ["none", "single"], fit: ["regular", "loose"], size: SIZES,
  },
  formal: {
    label: "Office Formal", garment: ["shirt", "pant"], fabric: ["cotton", "denim", "silk"],
    color: ["white", "sky", "grey", "black", "navy"], collar: ["spread", "mandarin"],
    sleeve: ["half", "full"], cuff: ["plain", "wide"], button: ["round", "square"],
    btnColor: ["white", "black", "gold"], stitch: ["none", "tone", "white"], print: ["none", "stripes", "checks"],
    pocket: ["none", "single"], fit: ["slim", "regular"], size: SIZES,
  },
};

const first = (c, k, pref) => (COL[c][k].includes(pref) ? pref : COL[c][k][0]);

export const newDesign = (c) => {
  const part = (k) => ({ color: k === "buttons" ? first(c, "btnColor") : first(c, "color"), fabric: first(c, "fabric"), print: "none", img: null });
  return {
    garment: first(c, "garment"), collar: first(c, "collar"), sleeve: first(c, "sleeve"), cuff: first(c, "cuff"),
    button: first(c, "button"), stitch: first(c, "stitch"), pocket: first(c, "pocket"), fit: first(c, "fit", "regular"),
    size: "M", meas: { chest: 100, length: 72 }, logo: { front: null, back: null },
    parts: Object.fromEntries(ALL.map((k) => [k, part(k)])),
  };
};

// Jo areas is design mein hain (click/select ho sakte hain)
export const availParts = (d) => {
  const keep = (k) => (k !== "collar" || d.collar !== "none") && (k !== "cuffs" || d.cuff !== "none") && (k !== "pocket" || d.pocket !== "none");
  const list = d.garment === "pant" ? ["waist", "legs", "pocket", "buttons"] : ["front", "back", "sleeves", "collar", "cuffs", "pocket", "buttons"];
  return list.filter(keep);
};

/* ===== PRICING ===== */
const PW = { front: 1, back: 1, legs: 1, sleeves: 0.6, waist: 0.3, collar: 0.3, cuffs: 0.3, pocket: 0.3, buttons: 1 };

export function priceLines(d) {
  const L = [];
  const add = (label, price) => price > 0 && L.push({ label, price });
  const pant = d.garment === "pant";
  add(`${CAT.garment[d.garment].label} (base)`, CAT.garment[d.garment].price);
  const main = d.parts[pant ? "legs" : "front"];
  add(`Fabric: ${CAT.fabric[main.fabric].label}`, CAT.fabric[main.fabric].price);
  const ps = availParts(d);
  const mixed = ps.filter((k) => k !== "buttons" && !d.parts[k].img && d.parts[k].fabric !== main.fabric).length;
  add(`Alag fabric (${mixed} area)`, mixed * 60);
  ps.forEach((k) => {
    const p = d.parts[k];
    if (p.print !== "none") add(`Print ${CAT.print[p.print].label}: ${PART_LABEL[k]}`, Math.round(CAT.print[p.print].price * PW[k]));
    if (p.img) add(`Image material: ${PART_LABEL[k]}`, Math.round(libPrice(p.img, 100) * PW[k]));
  });
  if (!pant) ["front", "back"].forEach((s) => d.logo[s] && add(`Logo (${s})`, libPrice(d.logo[s].url, 150)));
  (pant ? ["pocket", "fit", "stitch", "size"] : ["collar", "sleeve", "cuff", "pocket", "stitch", "size"]).forEach((k) =>
    add(`${TITLE[k]}: ${CAT[k][d[k]].label}`, CAT[k][d[k]].price)
  );
  add(`Button: ${CAT.button[d.button].label}`, CAT.button[d.button].price);
  add(`Button color: ${CAT.btnColor[d.parts.buttons.color].label}`, CAT.btnColor[d.parts.buttons.color].price);
  return L;
}

export function techPack(d, col, lines, total) {
  const mat = availParts(d).map((k) => {
    const p = d.parts[k];
    const c = (k === "buttons" ? CAT.btnColor : CAT.color)[p.color].label;
    return `${PART_LABEL[k]}: ${c}, ${p.img ? "custom image material" : CAT.fabric[p.fabric].label}${p.print !== "none" ? ", " + CAT.print[p.print].label : ""}`;
  });
  const style = (d.garment === "pant" ? ["pocket", "fit", "stitch", "size"] : ["collar", "sleeve", "cuff", "pocket", "stitch", "size"]).map(
    (k) => `${TITLE[k]}: ${CAT[k][d[k]].label}`
  );
  return [
    `KAPDA STUDIO - SAMPLE ORDER`, `Collection: ${COL[col].label}`, `Garment: ${CAT.garment[d.garment].label}`, ``,
    `-- Areas --`, ...mat, ``, `-- Style --`, ...style, `Button style: ${CAT.button[d.button].label}`,
    d.size === "custom" ? `Measurements: Chest ${d.meas.chest} cm, Length ${d.meas.length} cm` : "", ``,
    `-- Price --`, ...lines.map((l) => `${l.label}: Rs ${l.price}`), `TOTAL: Rs ${total}`,
  ].join("\n");
}
