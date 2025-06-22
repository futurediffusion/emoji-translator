export function generateSymmetricPatternSymmetric(
  emojis: string[],
  size = 5,
): string[][] {
  const clean = emojis.filter((e) => e.length > 0);
  if (clean.length === 0) {
    return Array.from({ length: size }, () => Array(size).fill('❔'));
  }

  const matrix = Array.from({ length: size }, () => Array(size).fill(''));
  const inside = (r: number, c: number) => r >= 0 && r < size && c >= 0 && c < size;
  const center = Math.floor(size / 2);

  // --- capa base: posiciones dominantes ---
  const priority: [number, number][][] = [
    [[center, center]],
    [
      [center, center - 1],
      [center, center + 1],
      [center - 1, center],
      [center + 1, center],
    ],
    [
      [center - 1, center - 1],
      [center - 1, center + 1],
      [center + 1, center - 1],
      [center + 1, center + 1],
    ],
    [
      [center - 2, center],
      [center + 2, center],
      [center, center - 2],
      [center, center + 2],
    ],
    [
      [0, 0],
      [0, size - 1],
      [size - 1, 0],
      [size - 1, size - 1],
    ],
  ];

  let idx = 0;
  for (const group of priority) {
    const emoji = clean[idx % clean.length];
    for (const [r, c] of group) {
      if (inside(r, c)) {
        matrix[r][c] = emoji;
      }
    }
    idx++;
  }

  // --- capa satélite: posiciones restantes ---
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!matrix[r][c]) {
        matrix[r][c] = clean[idx % clean.length];
        idx++;
      }
    }
  }

  return matrix;
}
