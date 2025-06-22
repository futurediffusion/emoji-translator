export function toEmojiMatrix(rawText: string, size = 5): string[][] {
  // Eliminar símbolos no deseados
  const clean = rawText.replace(/["\[\]{}',]/g, '').trim();

  // Separar emojis por espacios
  const emojis = clean.split(/\s+/).filter((e) => e.length > 0);

  const total = size * size;
  const centerIndex = Math.floor(total / 2);

  // Rellenar repitiendo en orden
  const filled = [...emojis];
  while (filled.length < total) {
    const repeatIndex = (filled.length - 1) % (emojis.length || 1);
    filled.push(emojis[repeatIndex] || '🧿');
  }

  // Forzar 🧿 en el centro
  filled[centerIndex] = '🧿';

  // Convertir a matriz cuadrada
  const matrix = [] as string[][];
  for (let i = 0; i < size; i++) {
    matrix.push(filled.slice(i * size, (i + 1) * size));
  }

  return matrix;
}
