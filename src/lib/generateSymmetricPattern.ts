export function generateSymmetricPattern(emojis: string[], size = 5): string[][] {
  const clean = emojis.filter(e => e.length > 0);
  if (clean.length === 0) return Array(size).fill([]).map(() => Array(size).fill('❔'));

  const matrix = Array(size).fill(null).map(() => Array(size).fill(''));
  const center = Math.floor(size / 2);

  // 1. Poner el primer emoji en el centro
  matrix[center][center] = clean[0];

  // 2. Posiciones por capas simétricas alrededor del centro
  const layers: [number, number][][] = [
    // Capa 1: cruz
    [[center-1,center], [center+1,center], [center,center-1], [center,center+1]],
    // Capa 2: diagonales
    [[center-1,center-1], [center-1,center+1], [center+1,center-1], [center+1,center+1]],
    // Capa 3: borde intermedio
    [[center-2,center], [center+2,center], [center,center-2], [center,center+2]],
    // Capa 4: borde externo
    [
      [0,0],[0,1],[0,2],[0,3],[0,4],
      [1,0],[2,0],[3,0],[4,0],
      [4,1],[4,2],[4,3],[4,4],
      [1,4],[2,4],[3,4]
    ]
  ];

  let i = 1;
  for (const layer of layers) {
    for (const [r, c] of layer) {
      if (r >= 0 && r < size && c >= 0 && c < size) {
        matrix[r][c] = clean[i % clean.length];
        i++;
      }
    }
  }

  return matrix;
}
