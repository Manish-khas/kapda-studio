import { useReducer } from "react";

function reducer(s, a) {
  switch (a.t) {
    case "set": {
      const now = typeof a.v === "function" ? a.v(s.now) : a.v;
      return { past: [...s.past.slice(-49), s.now], now, future: [] };
    }
    case "undo":
      return s.past.length ? { past: s.past.slice(0, -1), now: s.past[s.past.length - 1], future: [s.now, ...s.future] } : s;
    case "redo":
      return s.future.length ? { past: [...s.past, s.now], now: s.future[0], future: s.future.slice(1) } : s;
    case "reset":
      return { past: [], now: a.v, future: [] };
    default:
      return s;
  }
}

export function useHistory(init) {
  const [s, dispatch] = useReducer(reducer, undefined, () => ({ past: [], now: init, future: [] }));
  return {
    d: s.now,
    set: (v) => dispatch({ t: "set", v }),
    undo: () => dispatch({ t: "undo" }),
    redo: () => dispatch({ t: "redo" }),
    reset: (v) => dispatch({ t: "reset", v }),
    canUndo: s.past.length > 0,
    canRedo: s.future.length > 0,
  };
}
