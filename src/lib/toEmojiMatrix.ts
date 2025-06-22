import { generateSymmetricPatternSymmetric } from './generateSymmetricPatternSymmetric';

export function extractEmojis(rawText: string): string[] {
  // Eliminar símbolos no deseados
  const clean = rawText.replace(/["\[\]{}',]/g, '').trim();
  // Separar emojis por espacios
  return clean.split(/\s+/).filter((e) => e.length > 0);
}

export function toEmojiMatrix(rawText: string, size = 5): string[][] {
  const emojis = extractEmojis(rawText);
  const base = emojis.length > 0 ? emojis : ['🧿'];
  
  return generateSymmetricPatternSymmetric(base, size);
}
