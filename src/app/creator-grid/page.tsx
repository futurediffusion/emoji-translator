"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type Cell = {
  emoji: string;
  meaning: string;
  index: number;
  positionLabel: string;
};

function createEmptyGrid(size: number): (Cell | null)[][] {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

function ringIndex(r: number, c: number, center: number) {
  return Math.max(Math.abs(r - center), Math.abs(c - center));
}

function getPositionLabel(r: number, c: number, size: number): string {
  const center = Math.floor(size / 2);
  if (r === center && c === center) return "Centro";
  const vertical = r < center ? "Norte" : r > center ? "Sur" : "";
  const horizontal = c < center ? "Oeste" : c > center ? "Este" : "";
  if (vertical && horizontal) {
    if (vertical === "Norte" && horizontal === "Oeste") return "Noroeste";
    if (vertical === "Norte" && horizontal === "Este") return "Noreste";
    if (vertical === "Sur" && horizontal === "Oeste") return "Suroeste";
    return "Sureste";
  }
  return vertical || horizontal || "Centro";
}

function cleanResponse(text: string) {
  const trimmed = text.trim();
  if (/^[{[]/.test(trimmed)) {
    try {
      const obj = JSON.parse(trimmed);
      if (typeof obj === "string") return obj;
      if (obj && typeof obj === "object") {
        const record = obj as Record<string, unknown>;
        for (const key of [
          "global_meaning",
          "globalMeaning",
          "meaning",
          "text",
        ]) {
          const val = record[key];
          if (typeof val === "string") return val;
        }
        const first = Object.values(record).find(
          (v): v is string => typeof v === "string",
        );
        if (first) return first;
      }
    } catch {
      // ignore JSON parse errors
    }
  }
  return trimmed
    .replace(/^["']+|["']+$/g, "")
    .replace(/^(?:emoji|meaning|global_?interpretaci\u00f3?n)[:\-]\s*/i, "")
    .trim();
}

export default function CreatorGridPage() {
  const [size, setSize] = useState(3);
  const [grid, setGrid] = useState<(Cell | null)[][]>(() => createEmptyGrid(3));
  const [unlocked, setUnlocked] = useState(0); // how many rings unlocked
  const [counter, setCounter] = useState(0);
  const [globalMeaning, setGlobalMeaning] = useState("");
  const [globalLoading, setGlobalLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState(0);
  const center = Math.floor(size / 2);
  const globalTimeout = useRef<NodeJS.Timeout | null>(null);

  // load from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("creatorGrid");
    if (raw) {
      try {
        const data = JSON.parse(raw);
        setSize(data.size || 3);
        setGrid(data.grid || createEmptyGrid(data.size || 3));
        setUnlocked(data.unlocked ?? 0);
        setCounter(data.counter ?? 0);
        setGlobalMeaning(data.globalMeaning || "");
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  useEffect(() => {
    const data = { size, grid, unlocked, counter, globalMeaning };
    localStorage.setItem("creatorGrid", JSON.stringify(data));
  }, [size, grid, unlocked, counter, globalMeaning]);

  const callGemini = async (prompt: string) => {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    return data.result as string;
  };

  const updateGlobal = async (newGrid: (Cell | null)[][]) => {
    const placed: Cell[] = [];
    newGrid.forEach((row) =>
      row.forEach((cell) => {
        if (cell) placed.push(cell);
      }),
    );
    if (!placed.length) return;
    const list = placed
      .map(
        (c) =>
          `Emoji: ${c.emoji}\nSignificado individual: ${c.meaning}.\nPosición simbólica: ${c.positionLabel}.`,
      )
      .join("\n\n");
    const prompt = `${list}\n\nCon base en estos elementos y sus posiciones en el mandala simbólico, genera una interpretación global coherente.`;
    setGlobalLoading(true);
    try {
      const raw = await callGemini(prompt);
      setGlobalMeaning(cleanResponse(raw));
    } finally {
      setGlobalLoading(false);
    }
  };

  const [editing, setEditing] = useState<{ r: number; c: number; value: string } | null>(null);

  useEffect(() => {
    if (globalLoading) {
      const id = setInterval(() => {
        setLoadingDots((d) => (d + 1) % 4);
      }, 500);
      return () => clearInterval(id);
    }
    setLoadingDots(0);
  }, [globalLoading]);

  const startEdit = (r: number, c: number) => {
    const ring = ringIndex(r, c, center);
    if (ring > unlocked) return;
    const existing = grid[r][c];
    setEditing({ r, c, value: existing?.emoji || "" });
  };

  const confirmEdit = async (override?: string) => {
    if (!editing) return;
    const { r, c, value } = editing;
    const emoji = (override ?? value).trim();
    setEditing(null);
    if (!emoji) return;
    const newGrid = grid.map((row) => row.slice());
    const positionLabel = getPositionLabel(r, c, size);
    let cell = newGrid[r][c];
    if (!cell) {
      cell = { emoji, meaning: "", index: counter + 1, positionLabel };
      newGrid[r][c] = cell;
      setCounter((p) => p + 1);
    } else {
      cell.emoji = emoji;
      cell.positionLabel = positionLabel;
    }
    // show the emoji immediately
    setGrid(newGrid);

    const meaningPrompt = `¿Qué representa este emoji en términos simbólicos, emocionales o espirituales? Responde de forma concisa sin etiquetas ni comillas.\nLa posición simbólica del emoji es: '${positionLabel}'. Considera también esto en la interpretación.\nEmoji: ${emoji}`;
    const raw = await callGemini(meaningPrompt);
    cell.meaning = cleanResponse(raw);

    // force rerender with the meaning and check expansion afterwards
    setGrid(newGrid.map((row) => row.slice()));
    checkExpansion(newGrid);
    if (globalTimeout.current) clearTimeout(globalTimeout.current);
    globalTimeout.current = setTimeout(() => {
      updateGlobal(newGrid);
    }, 600);
  };

  const checkExpansion = (currentGrid: (Cell | null)[][]): boolean => {
    const filledCurrentRing = currentGrid.every((row, r) =>
      row.every((cell, c) => {
        return ringIndex(r, c, center) > unlocked || cell !== null;
      }),
    );
    if (filledCurrentRing) {
      const nextRing = unlocked + 1;
      const neededSize = nextRing * 2 + 1;
      if (size < neededSize) {
        // expand grid
        const newGrid = createEmptyGrid(neededSize);
        const offset = Math.floor(neededSize / 2) - center;
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            newGrid[r + offset][c + offset] = currentGrid[r][c];
          }
        }
        setSize(neededSize);
        setGrid(newGrid);
      }
      setUnlocked(nextRing);
      return true;
    }
    return false;
  };


  const copyMeaning = async () => {
    try {
      await navigator.clipboard.writeText(globalMeaning);
    } catch (err) {
      console.error(err);
    }
  };

  const interpretAll = async () => {
    await updateGlobal(grid);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen w-screen bg-white p-4 gap-4">
      <h1 className="text-3xl font-bold">NEOGLIPHO Creator Grid</h1>
      <div
        className="grid gap-1 p-2 rounded-[20px] border-2 bg-white shadow"
        style={{ gridTemplateColumns: `repeat(${size}, 5rem)` }}
      >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const ring = ringIndex(r, c, center);
              const locked = ring > unlocked;
              const isCenter = r === center && c === center;
              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => !locked && startEdit(r, c)}
                  className={`w-20 h-20 flex items-center justify-center text-2xl select-none transition-colors border-2 ${locked ? "bg-white border-gray-500 text-gray-400 pointer-events-none" : "bg-white border-black cursor-pointer hover:bg-gray-100"} ${isCenter ? "brightness-95" : ""}`}
                  title={cell?.meaning || ""}
                >
                  {editing && editing.r === r && editing.c === c ? (
                    <input
                      autoFocus={editing.value === ""}
                      value={editing.value}
                      onChange={(e) => {
                        const val = e.target.value.slice(0, 2);
                        setEditing({ ...editing, value: val });
                        if (Array.from(val).length >= 1) {
                          setTimeout(() => confirmEdit(val), 0);
                        }
                      }}
                      onBlur={() => confirmEdit()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          confirmEdit();
                        }
                      }}
                      className="w-full h-full bg-transparent border-none outline-none text-3xl text-center p-0"
                    />
                  ) : (
                    cell ? cell.emoji : ""
                  )}
                </div>
              );
            }),
          )}
        </div>
      <div className="relative w-full max-w-[32rem]">
        <div className="p-3 border-2 border-gray-200 rounded bg-white min-h-[4rem] w-full">
          <div className="whitespace-pre-wrap text-sm text-left">
            {globalLoading ? (
              <span className="animate-pulse">Esperando Respuesta{".".repeat(loadingDots)}</span>
            ) : (
              globalMeaning
            )}
          </div>
        </div>
        <button
          onClick={copyMeaning}
          title="Copiar texto"
          className="absolute bottom-0 -right-4 pl-2 pr-1 py-1 text-xl rounded bg-white shadow hover:bg-gray-100"
        >
          📋
        </button>
      </div>
      <button
        onClick={interpretAll}
        className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
      >
        Interpretar Todo
      </button>
      <Link
        href="/"
        className="fixed bottom-4 right-4 z-50 text-3xl p-4 bg-white rounded-full shadow-md hover:shadow-lg"
      >
        🏠
      </Link>
    </main>
  );
}
