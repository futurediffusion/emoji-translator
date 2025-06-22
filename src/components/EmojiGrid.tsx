import React from "react";

export interface EmojiGridProps {
  grid: string[][];
  className?: string;
}

export default function EmojiGrid({ grid, className }: EmojiGridProps) {
  if (!grid?.length) return null;
  const flat = grid.flat();
  const cols = grid[0].length;
  return (
    <div
      className={`grid text-center ${className ?? ""}`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {flat.map((emoji, i) => (
        <span key={i}>{emoji}</span>
      ))}
    </div>
  );
}
