"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Cell = {
  emoji: string;
  meaning: string;
  index: number;
};

function createEmptyGrid(size: number): (Cell | null)[][] {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

function ringIndex(r: number, c: number, center: number) {
  return Math.max(Math.abs(r - center), Math.abs(c - center));
}

export default function CreatorGridPage() {
  const [size, setSize] = useState(3);
  const [grid, setGrid] = useState<(Cell | null)[][]>(() => createEmptyGrid(3));
  const [unlocked, setUnlocked] = useState(0); // how many rings unlocked
  const [counter, setCounter] = useState(0);
  const [globalMeaning, setGlobalMeaning] = useState("");
  const center = Math.floor(size / 2);

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
      .map((c) => `${c.emoji}: ${c.meaning}`)
      .join("; ");
    const prompt = `Dado el siguiente conjunto de emojis con sus significados: ${list}. ¿Cuál es la interpretación simbólica global actual? Responde de forma breve.`;
    const global = await callGemini(prompt);
    setGlobalMeaning(global);
  };

  const handleCellClick = async (r: number, c: number) => {
    const ring = ringIndex(r, c, center);
    if (ring > unlocked) return;
    const existing = grid[r][c];
    const emoji = window.prompt(existing ? "Editar emoji" : "Coloca un emoji", existing?.emoji || "");
    if (!emoji) return;
    const newGrid = grid.map((row) => row.slice());
    let cell = newGrid[r][c];
    if (!cell) {
      cell = { emoji: emoji, meaning: "", index: counter + 1 };
      newGrid[r][c] = cell;
      setCounter((p) => p + 1);
    } else {
      cell.emoji = emoji;
    }
    const meaningPrompt = `¿Qué representa este emoji en términos simbólicos, emocionales, espirituales o psicológicos? Responde de forma concisa. Emoji: ${emoji}`;
    cell.meaning = await callGemini(meaningPrompt);
    setGrid(newGrid);
    await updateGlobal(newGrid);
    checkExpansion(newGrid);
  };

  const checkExpansion = (currentGrid: (Cell | null)[][]) => {
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
    }
  };

  const downloadJSON = () => {
    const data = { size, grid, unlocked, counter, globalMeaning };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "creator-grid.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const interpretAll = async () => {
    const placed: Cell[] = [];
    grid.forEach((row) =>
      row.forEach((cell) => {
        if (cell) placed.push(cell);
      }),
    );
    if (!placed.length) return;
    const list = placed
      .map((c) => `${c.emoji}: ${c.meaning}`)
      .join("; ");
    const prompt = `Interpretación completa del conjunto de emojis y significados: ${list}. Resume de forma simbólica.`;
    const result = await callGemini(prompt);
    alert(result);
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-4 bg-white">
      <h1 className="text-2xl font-bold mb-4">NEOGLIPHO Creator Grid</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${size}, 3rem)` }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const ring = ringIndex(r, c, center);
              const locked = ring > unlocked;
              const isCenter = r === center && c === center;
              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`w-12 h-12 flex items-center justify-center border cursor-pointer text-2xl select-none ${locked ? "bg-gray-200 text-gray-400" : "bg-white"} ${isCenter ? "bg-gray-300" : ""}`}
                  title={cell?.meaning || ""}
                >
                  {cell ? cell.emoji : ""}
                </div>
              );
            }),
          )}
        </div>
        <div className="flex flex-col gap-2 max-w-xs">
          <div className="p-2 border rounded bg-gray-50 min-h-[4rem]">
            <strong>Significado global:</strong>
            <div className="mt-1 whitespace-pre-wrap text-sm">{globalMeaning}</div>
          </div>
          <button
            onClick={interpretAll}
            className="px-3 py-1 rounded bg-blue-500 text-white"
          >
            Interpretar Todo
          </button>
          <button
            onClick={downloadJSON}
            className="px-3 py-1 rounded bg-green-500 text-white"
          >
            Descargar JSON
          </button>
          <Link
            href="/"
            className="text-2xl p-2 bg-white rounded-full shadow hover:shadow-lg w-fit self-end"
          >
            🏠
          </Link>
        </div>
      </div>
    </main>
  );
}
