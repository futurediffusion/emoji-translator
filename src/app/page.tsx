"use client";

import { useState } from "react";
import EmojiGrid from "@/components/EmojiGrid";
import ExplanationBox from "@/components/ExplanationBox";
import { parseGeminiResponse } from "@/lib/parseGeminiResponse";

export default function Home() {
  const [text, setText] = useState("");
  const [grid, setGrid] = useState<string[][] | null>(null);
  const [explanations, setExplanations] = useState<Record<string, string> | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyCnnwnkEtqt3JGKsqo82EHeVg2E4vDO7AI",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `A partir del siguiente texto emocional, genera:\n1. Un patrón cuadrado 5x5 de emojis simétrico.\n2. Una tabla con el significado de cada emoji usado (1 línea por emoji).\n3. Un diagnóstico breve con título: \"¿Cómo leer esto?\".\n\nTexto emocional: "${text}"`,
                  },
                ],
              },
            ],
          }),
        }
      );
      const data = await res.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!content) {
        throw new Error("Respuesta vacía del modelo");
      }
      const parsed = parseGeminiResponse(content);
      setGrid(parsed.emojiGrid);
      setExplanations(parsed.emojiExplanation);
      setDiagnosis(parsed.diagnosis);
    } catch (err) {
      console.error(err);
      setError("No se pudo generar el diagnóstico");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto space-y-6">
      <textarea
        className="w-full p-3 border rounded"
        rows={4}
        placeholder="¿Cómo te sientes hoy?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? "Generando..." : "Generar diagnóstico"}
      </button>
      {error && <p className="text-red-500">{error}</p>}
      {grid && <EmojiGrid grid={grid} />}
      {explanations && <ExplanationBox explanations={explanations} />}
      {diagnosis && <p className="mt-4 text-center">{diagnosis}</p>}
    </main>
  );
}
