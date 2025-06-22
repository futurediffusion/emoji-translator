import { generateSymmetricPatternSymmetric } from './generateSymmetricPatternSymmetric';

export function toEmojiMatrix(rawText: string, size = 5): string[][] {
  // Eliminar símbolos no deseados
  const clean = rawText.replace(/["\[\]{}',]/g, '').trim();

  // Separar emojis por espacios
  const emojis = clean.split(/\s+/).filter((e) => e.length > 0);

  // Usar 🧿 como comodín si no se encontró ningún emoji
  const base = emojis.length > 0 ? emojis : ['🧿'];

  return generateSymmetricPatternSymmetric(base, size);
}
