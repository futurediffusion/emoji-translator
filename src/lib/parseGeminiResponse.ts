export function parseGeminiResponse(content: string) {
  const lines = content
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const emojiGrid = lines.slice(0, 5).map((line) => line.split(' '));

  const explanationStart = lines.findIndex((line) =>
    line.toLowerCase().includes('explicación de los símbolos')
  );

  const diagnosisStart = lines.findIndex(
    (line) =>
      line.toLowerCase().includes('¿cómo leer esto?') || line.startsWith('🧠')
  );

  const explanationLines =
    explanationStart >= 0 && diagnosisStart > explanationStart
      ? lines.slice(explanationStart + 1, diagnosisStart)
      : [];

  const emojiExplanation: Record<string, string> = {};
  explanationLines.forEach((line) => {
    const [emoji, ...meaningParts] = line.split(/\s{1,}|\t/);
    if (emoji && meaningParts.length) {
      emojiExplanation[emoji] = meaningParts.join(' ').trim();
    }
  });

  const diagnosis =
    diagnosisStart >= 0 ? lines.slice(diagnosisStart).join(' ') : '';

  return {
    emojiGrid,
    emojiExplanation,
    diagnosis,
  };
}
