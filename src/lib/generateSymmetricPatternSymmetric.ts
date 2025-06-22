export function generateSymmetricPatternSymmetric(emojis: string[], size = 5): string[][] {
  const clean = emojis.filter(e => e.length > 0);
  if (clean.length === 0) return Array.from({ length: size }, () => Array(size).fill('❔'));

  const matrix = Array.from({ length: size }, () => Array(size).fill(''));
  const visited = Array.from({ length: size }, () => Array(size).fill(false));
  const center = Math.floor(size / 2);

  // Helper to get symmetric positions of a given coordinate
  function getGroup(r: number, c: number): [number, number][] {
    const coords: [number, number][] = [
      [r, c],
      [c, r],
      [size - 1 - r, c],
      [r, size - 1 - c],
      [size - 1 - r, size - 1 - c],
      [c, size - 1 - r],
      [size - 1 - c, r],
      [size - 1 - c, size - 1 - r],
    ];

    const set = new Set<string>();
    for (const [x, y] of coords) {
      if (x >= 0 && x < size && y >= 0 && y < size) {
        set.add(`${x},${y}`);
      }
    }
    const arr = Array.from(set).map(str => str.split(',').map(Number) as [number, number]);
    for (const [x, y] of arr) {
      visited[x][y] = true;
    }
    return arr;
  }

  const groups: [number, number][][] = [];

  // First group: the center
  visited[center][center] = true;
  groups.push([[center, center]]);

  // Build remaining groups
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!visited[r][c]) {
        groups.push(getGroup(r, c));
      }
    }
  }

  // Assign emojis to each symmetric group
  let idx = 0;
  for (const group of groups) {
    const emoji = clean[idx % clean.length];
    for (const [r, c] of group) {
      matrix[r][c] = emoji;
    }
    idx++;
  }

  return matrix;
}
