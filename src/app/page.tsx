"use client";

import { useState } from "react";
import EmojiGrid from "@/components/EmojiGrid";
import ExplanationBox from "@/components/ExplanationBox";

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
                    text: `A partir del siguiente texto emocional, genera:\n1. Un patrón cuadrado 5x5 de emojis simétrico.\n2. Una tabla con el significado de cada emoji usado (1 línea por emoji).\n3. Un diagnóstico breve con título: \"¿Cómo leer esto?\".\n\nTexto emocional: ${text}`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.8,
              maxOutputTokens: 500,
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
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (parseErr) {
        console.error(parseErr);
        throw new Error("Formato de respuesta no válido");
      }
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
