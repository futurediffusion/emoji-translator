export function toEmojiMatrix(emojiText: string, size = 5): string[][] {
  const emojis = emojiText
    .trim()
    .split(/\s+/)
    .filter((e) => e.length > 0);

  // Rellenar con 🟦 si faltan, cortar si sobran
  const total = size * size;
  const padded = [...emojis.slice(0, total)];
  while (padded.length < total) padded.push("🟦");

  // Crear matriz
  const matrix = [] as string[][];
  for (let i = 0; i < size; i++) {
    matrix.push(padded.slice(i * size, (i + 1) * size));
  }

  return matrix;
}
