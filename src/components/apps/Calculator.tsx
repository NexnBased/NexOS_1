import { useState, useEffect, useCallback } from "react";
import { Delete, Percent, Divide, X, Minus, Plus, Equal } from "lucide-react";

function Calculator() {
  const [display, setDisplay] = useState<string>("0");
  const [expr, setExpr] = useState<string>("");
  const [done, setDone] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const calculate = useCallback((s: string): string => {
    try {
      const sanitized = s
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-");
      const res = new Function(`return ${sanitized}`)();
      if (typeof res !== "number" || !isFinite(res)) return "Error";
      return Number(Math.round(Number(res + "e10")) + "e-10").toString();
    } catch {
      return "Error";
    }
  }, []);

  const handleDigit = useCallback(
    (d: string) => {
      if (done) {
        setDisplay(d);
        setExpr("");
        setDone(false);
        return;
      }
      setDisplay((prev) => {
        if (prev === "0" && d !== ".") return d;
        if (d === "." && prev.includes(".")) return prev;
        return prev.length >= 12 ? prev : prev + d;
      });
    },
    [done],
  );

  const handleOp = useCallback(
    (op: string) => {
      if (done) {
        setExpr(display + " " + op + " ");
        setDone(false);
        setDisplay("0");
        return;
      }
      setExpr((prev) => prev + display + " " + op + " ");
      setDisplay("0");
    },
    [display, done],
  );

  const handleClear = useCallback(() => {
    setDisplay("0");
    setExpr("");
    setDone(false);
  }, []);

  const handleDelete = useCallback(() => {
    if (done) return handleClear();
    setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
  }, [done, handleClear]);

  const handleEquals = useCallback(() => {
    if (done) return;
    const fullExpr = expr + display;
    if (!fullExpr || fullExpr.trim() === "0") return;
    setExpr(fullExpr + " =");
    setDisplay(calculate(fullExpr));
    setDone(true);
  }, [expr, display, done, calculate]);

  const handleSign = useCallback(() => {
    const val = parseFloat(display);
    if (!isNaN(val) && val !== 0) setDisplay((val * -1).toString());
  }, [display]);

  const handlePercent = useCallback(() => {
    const val = parseFloat(display);
    if (!isNaN(val)) {
      setDisplay((val / 100).toString());
      setDone(true);
    }
  }, [display]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      const keyMap: Record<string, () => void> = {
        "0": () => handleDigit("0"),
        "1": () => handleDigit("1"),
        "2": () => handleDigit("2"),
        "3": () => handleDigit("3"),
        "4": () => handleDigit("4"),
        "5": () => handleDigit("5"),
        "6": () => handleDigit("6"),
        "7": () => handleDigit("7"),
        "8": () => handleDigit("8"),
        "9": () => handleDigit("9"),
        ".": () => handleDigit("."),
        "+": () => handleOp("+"),
        "-": () => handleOp("−"),
        "*": () => handleOp("×"),
        "/": () => handleOp("÷"),
        Enter: handleEquals,
        "=": handleEquals,
        Backspace: handleDelete,
        Escape: handleClear,
      };

      if (keyMap[e.key]) {
        if (e.key === "/" || e.key === "Enter") e.preventDefault();
        keyMap[e.key]();
        setActiveKey(e.key);
        setTimeout(() => setActiveKey(null), 150);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleDigit, handleOp, handleEquals, handleDelete, handleClear]);

  return (
    <div className="w-full h-full bg-zinc-950 text-zinc-100 font-mono select-none flex flex-col p-4 justify-between rounded-none">
      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-end text-right min-h-24 mb-4">
        <div className="text-xs text-zinc-500 min-h-4 overflow-x-auto whitespace-nowrap scrollbar-none">
          {expr}
        </div>
        <div className="text-3xl font-bold tracking-tight text-purple-400 overflow-x-auto whitespace-nowrap scrollbar-none mt-1">
          {display}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 flex-1">
        <button
          onClick={handleClear}
          className={`py-3.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
            activeKey === "Escape" ? "ring-2 ring-rose-500" : ""
          } bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20`}
        >
          AC
        </button>

        <button
          onClick={handleDelete}
          className={`py-3.5 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
            activeKey === "Backspace" ? "ring-2 ring-zinc-400" : ""
          } bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/50`}
        >
          <Delete className="w-4 h-4" />
        </button>

        <button
          onClick={handlePercent}
          className="py-3.5 rounded-xl flex items-center justify-center transition-all active:scale-95 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/50"
        >
          <Percent className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleOp("÷")}
          className={`py-3.5 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
            activeKey === "/" ? "ring-2 ring-purple-400" : ""
          } bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20`}
        >
          <Divide className="w-4 h-4" />
        </button>

        {["7", "8", "9"].map((num) => (
          <button
            key={num}
            onClick={() => handleDigit(num)}
            className={`py-3.5 rounded-xl text-base font-semibold transition-all active:scale-95 ${
              activeKey === num ? "ring-2 ring-purple-400" : ""
            } bg-zinc-800/40 hover:bg-zinc-800 text-zinc-100 border border-zinc-800`}
          >
            {num}
          </button>
        ))}

        <button
          onClick={() => handleOp("×")}
          className={`py-3.5 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
            activeKey === "*" ? "ring-2 ring-purple-400" : ""
          } bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20`}
        >
          <X className="w-4 h-4" />
        </button>

        {["4", "5", "6"].map((num) => (
          <button
            key={num}
            onClick={() => handleDigit(num)}
            className={`py-3.5 rounded-xl text-base font-semibold transition-all active:scale-95 ${
              activeKey === num ? "ring-2 ring-purple-400" : ""
            } bg-zinc-800/40 hover:bg-zinc-800 text-zinc-100 border border-zinc-800`}
          >
            {num}
          </button>
        ))}

        <button
          onClick={() => handleOp("−")}
          className={`py-3.5 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
            activeKey === "-" ? "ring-2 ring-purple-400" : ""
          } bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20`}
        >
          <Minus className="w-4 h-4" />
        </button>

        {["1", "2", "3"].map((num) => (
          <button
            key={num}
            onClick={() => handleDigit(num)}
            className={`py-3.5 rounded-xl text-base font-semibold transition-all active:scale-95 ${
              activeKey === num ? "ring-2 ring-purple-400" : ""
            } bg-zinc-800/40 hover:bg-zinc-800 text-zinc-100 border border-zinc-800`}
          >
            {num}
          </button>
        ))}

        <button
          onClick={() => handleOp("+")}
          className={`py-3.5 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
            activeKey === "+" ? "ring-2 ring-purple-400" : ""
          } bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20`}
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          onClick={handleSign}
          className="py-3.5 rounded-xl text-xs font-bold transition-all active:scale-95 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/50"
        >
          ±
        </button>

        <button
          onClick={() => handleDigit("0")}
          className={`py-3.5 rounded-xl text-base font-semibold transition-all active:scale-95 ${
            activeKey === "0" ? "ring-2 ring-purple-400" : ""
          } bg-zinc-800/40 hover:bg-zinc-800 text-zinc-100 border border-zinc-800`}
        >
          0
        </button>

        <button
          onClick={() => handleDigit(".")}
          className={`py-3.5 rounded-xl text-base font-semibold transition-all active:scale-95 ${
            activeKey === "." ? "ring-2 ring-purple-400" : ""
          } bg-zinc-800/40 hover:bg-zinc-800 text-zinc-100 border border-zinc-800`}
        >
          .
        </button>

        <button
          onClick={handleEquals}
          className={`py-3.5 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
            activeKey === "=" ? "ring-2 ring-purple-200" : ""
          } bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20`}
        >
          <Equal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default Calculator;
