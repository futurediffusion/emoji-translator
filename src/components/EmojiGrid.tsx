import React from "react";

export interface EmojiGridProps {
  grid: string[][];
}

export default function EmojiGrid({ grid }: EmojiGridProps) {
  if (!grid?.length) return null;
  const flat = grid.flat();
  const cols = grid[0].length;
  return (
    <div
      className="grid gap-1 text-2xl text-center"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {flat.map((emoji, i) => (
        <span key={i}>{emoji}</span>
      ))}
    </div>
  );
}
