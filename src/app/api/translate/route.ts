import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY ?? 'AIzaSyDnO8MO4qFgkOcSO2eHVZkfQ7cZ2KhrA5I';
    if (!apiKey) {
      // If no key, return simple mock to keep demo working
      return NextResponse.json({ result: '🤖❓' });
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Traduce la siguiente frase a una línea de emojis apropiados. No agregues texto, solo emojis separados por espacios.\n\nFrase: ${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.5,
            maxOutputTokens: 100,
          },
        }),
      },
    );

    if (!res.ok) {
      const message = await res.text();
      return NextResponse.json({ error: message }, { status: res.status });
    }

    const data = await res.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
    return NextResponse.json({ result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
