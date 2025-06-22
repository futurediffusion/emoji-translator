"use client";

import { useState, useEffect } from "react";
import EmojiGrid from "@/components/EmojiGrid";
import { extractEmojis } from "@/lib/toEmojiMatrix";
import { generateSymmetricPatternSymmetric } from "@/lib/generateSymmetricPatternSymmetric";

export default function Home() {
  const [text, setText] = useState("");
  const [grid, setGrid] = useState<string[][] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const sizeOptions = [3, 5, 7];
  const [sizeIndex, setSizeIndex] = useState(1); // default 5x5
  const size = sizeOptions[sizeIndex];
  const [emojis, setEmojis] = useState<string[]>([]);

  const toggleSize = () => {
    setSizeIndex((prev) => (prev + 1) % sizeOptions.length);
  };

  useEffect(() => {
    if (emojis.length) {
      const matrix = generateSymmetricPatternSymmetric(emojis, size);
      setGrid(matrix);
    }
  }, [size, emojis]);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDnO8MO4qFgkOcSO2eHVZkfQ7cZ2KhrA5I",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Traduce el siguiente texto a la mayor cantidad posible de emojis apropiados. No expliques nada. Solo responde con emojis separados por espacios:\n\nTexto: ${text}`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.5,
              maxOutputTokens: 100,
            },
          }),
        }
      );
      const data = await res.json();
      console.log("📡 Gemini raw response:", data);
      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      console.log("🔍 Contenido recibido:\n", content);
      if (!content) {
        throw new Error("Respuesta vacía del modelo");
      }
      const base = extractEmojis(content);
      setEmojis(base);
      const matrix = generateSymmetricPatternSymmetric(base.length ? base : ['🧿'], size);
      setGrid(matrix);
    } catch (err) {
      console.error(err);
      setError("No se pudo generar el diagnóstico");
    } finally {
      setLoading(false);
    }
  };

  const gridSizeRem = size * 3 + (size - 1) * 0.5;

  return (
    <main className="flex flex-col min-h-screen items-center p-6">
      <div className="flex flex-col items-center justify-center flex-1 space-y-4 w-full">
        {grid && (
          <div
            className="p-4 shadow-xl bg-gray-50 rounded-2xl flex items-center justify-center"
            style={{ width: `${gridSizeRem}rem`, height: `${gridSizeRem}rem` }}
          >
            <EmojiGrid grid={grid} className="gap-2 text-5xl leading-none w-full h-full" />
          </div>
        )}
        <button
          onClick={toggleSize}
          className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          Cambiar tamaño: {size}x{size}
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </div>
      <div className="w-full max-w-md mx-auto flex mt-4">
        <textarea
          className="flex-1 p-3 border rounded-l resize-none"
          rows={3}
          placeholder="Escribe algo..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleGenerate();
            }
          }}
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-4 bg-blue-600 text-white rounded-r disabled:opacity-50"
        >
          {loading ? "..." : "⬆️"}
        </button>
      </div>
    </main>
  );
}
