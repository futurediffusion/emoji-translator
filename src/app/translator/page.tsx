"use client";

import { useState } from "react";
import { cleanEmojiLine } from "@/lib/cleanEmojiLine";
import Link from "next/link";

export default function TranslatorPage() {
  const [text, setText] = useState("");
  const [lines, setLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const prompt = text.trim();
    if (!prompt) return;
    setLoading(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (res.ok && data.result) {
        const cleaned = cleanEmojiLine(String(data.result));
        setLines((prev) => [...prev, cleaned]);
      } else {
        console.error(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setText("");
    }
  };

  const allLines = lines.join("\n");

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(allLines);
    } catch (err) {
      console.error(err);
    }
  };

  const downloadAll = () => {
    const blob = new Blob([allLines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "emojis.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-8 pb-24 relative bg-white">
      <h1 className="text-2xl font-bold mb-4">Emoji Translator</h1>
      <div className="flex flex-col items-center w-full px-4 gap-4">
        {lines.map((line, idx) => (
          <div key={idx} className="text-center text-3xl leading-relaxed">
            {line}
          </div>
        ))}
      </div>
      <div className="fixed bottom-4 left-0 right-0 px-4">
        <div className="max-w-xl mx-auto flex bg-white shadow rounded-full overflow-hidden">
          <input
            type="text"
            className="flex-1 px-4 py-2 outline-none rounded-l-full"
            placeholder="Escribe algo..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                send();
              }
            }}
          />
          <button
            onClick={send}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-r-full disabled:opacity-50"
          >
            {loading ? "..." : "Enviar"}
          </button>
        </div>
      </div>
      <div className="fixed bottom-4 right-4 flex space-x-2">
        <button
          onClick={copyAll}
          className="text-2xl p-2 bg-white rounded-full shadow hover:shadow-lg"
          title="Copiar"
        >
          🗒️
        </button>
        <button
          onClick={downloadAll}
          className="text-2xl p-2 bg-white rounded-full shadow hover:shadow-lg"
          title="Descargar"
        >
          📝
        </button>
        <Link
          href="/"
          className="text-2xl p-2 bg-white rounded-full shadow hover:shadow-lg"
        >
          🏠
        </Link>
      </div>
    </div>
  );
}
