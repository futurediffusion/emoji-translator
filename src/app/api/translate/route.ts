import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // If no key, return simple mock to keep demo working
      return NextResponse.json({ result: '🤖❓' });
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Traduce la siguiente frase a una línea de emojis apropiados. No agregues texto, solo emojis separados por espacios.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
      }),
    });

    if (!res.ok) {
      const message = await res.text();
      return NextResponse.json({ error: message }, { status: res.status });
    }

    const data = await res.json();
    const result = data.choices?.[0]?.message?.content?.trim() ?? '';
    return NextResponse.json({ result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
