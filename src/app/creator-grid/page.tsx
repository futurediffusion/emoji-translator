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


  const copyMeaning = async () => {
    try {
      await navigator.clipboard.writeText(globalMeaning);
    } catch (err) {
      console.error(err);
    }
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
    <main className="flex items-center justify-center min-h-screen w-screen bg-white p-4">
      <div className="flex flex-row items-start gap-8">
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
                  onClick={() => !locked && handleCellClick(r, c)}
                  className={`w-20 h-20 flex items-center justify-center text-2xl select-none transition-colors border-2 ${locked ? "bg-white border-gray-500 text-gray-400 pointer-events-none" : "bg-white border-black cursor-pointer hover:bg-gray-100"} ${isCenter ? "brightness-95" : ""}`}
                  title={cell?.meaning || ""}
                >
                  {cell ? cell.emoji : ""}
                </div>
              );
            }),
          )}
        </div>
        <div className="flex flex-col gap-4 w-64">
          <h1 className="text-3xl font-bold text-left">NEOGLIPHO Creator Grid</h1>
          <div className="relative p-3 border-2 border-gray-200 rounded bg-white min-h-[4rem]">
            <div className="whitespace-pre-wrap text-sm text-left">{globalMeaning}</div>
            <button
              onClick={copyMeaning}
              title="Copiar texto"
              className="absolute bottom-1.5 right-1.5 text-xl p-1 rounded hover:bg-gray-100"
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
        </div>
      </div>
      <Link
        href="/"
        className="fixed bottom-4 right-4 z-50 text-3xl p-4 bg-white rounded-full shadow-md hover:shadow-lg"
      >
        🏠
      </Link>
    </main>
  );
}
