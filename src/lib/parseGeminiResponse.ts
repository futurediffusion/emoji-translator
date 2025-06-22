export function parseGeminiResponse(content: string) {
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);

  const emojiGrid = lines.slice(0, 5).map((line) => line.split(/\s+/));

  const explanationStart = lines.findIndex((line) =>
    line.toLowerCase().includes('explicaci\u00f3n de los s\u00edmbolos')
  );

  const diagnosisStart = lines.findIndex(
    (line) =>
      line.toLowerCase().includes('¿c\u00f3mo leer esto?') || line.startsWith('🧠')
  );

  const explanationLines = lines.slice(explanationStart + 1, diagnosisStart);
  const emojiExplanation: Record<string, string> = {};
  explanationLines.forEach((line) => {
    const [emoji, ...meaningParts] = line.split(/\s{2,}|\t+/);
    if (emoji && meaningParts.length) {
      emojiExplanation[emoji] = meaningParts.join(' ').trim();
    }
  });

  const diagnosis = lines.slice(diagnosisStart).join(' ');

  return {
    emojiGrid,
    emojiExplanation,
    diagnosis,
  };
}
