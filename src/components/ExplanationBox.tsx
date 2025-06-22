import React from "react";

export interface ExplanationBoxProps {
  explanations: Record<string, string>;
}

export default function ExplanationBox({ explanations }: ExplanationBoxProps) {
  const entries = Object.entries(explanations);
  if (!entries.length) return null;
  return (
    <table className="table-auto border-collapse mt-4 text-sm">
      <thead>
        <tr>
          <th className="px-2 py-1 border">Emoji</th>
          <th className="px-2 py-1 border">Significado</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(([emoji, meaning]) => (
          <tr key={emoji}>
            <td className="px-2 py-1 border text-center">{emoji}</td>
            <td className="px-2 py-1 border">{meaning}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
