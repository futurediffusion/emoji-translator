import { extractEmojis } from './toEmojiMatrix';

export function cleanEmojiLine(raw: string): string {
  return extractEmojis(raw).join('');
}
