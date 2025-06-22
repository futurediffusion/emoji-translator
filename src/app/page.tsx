"use client";

import { useState } from "react";
import EmojiGrid from "@/components/EmojiGrid";
import { toEmojiMatrix } from "@/lib/toEmojiMatrix";

export default function Home() {
  const [text, setText] = useState("");
  const [grid, setGrid] = useState<string[][] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      const matrix = toEmojiMatrix(content);
      setGrid(matrix);
    } catch (err) {
      console.error(err);
      setError("No se pudo generar el diagnóstico");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col min-h-screen items-center justify-center p-6 space-y-4">
      {grid && (
        <div className="bg-white rounded-lg shadow p-6">
          <EmojiGrid grid={grid} className="text-4xl" />
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
      <div className="w-full max-w-md mt-auto flex">
        <textarea
          className="flex-1 p-3 border rounded-l resize-none"
          rows={3}
          placeholder="Escribe algo..."
          value={text}
          onChange={(e) => setText(e.target.value)}
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
