import Link from 'next/link';

const options = [
  {
    title: 'Emoji Grids',
    href: '/emojigrids',
    emojis: ['😊', '☀️', '🔁', '📒'],
  },
  {
    title: 'Emoji Translator',
    href: '/translator',
    emojis: ['💬', '✍️', '🌐', '🧠'],
  },
  {
    title: 'NEOGLIPHO Creator Grid',
    href: '/creator-grid',
    emojis: ['🌀', '✨', '🧩', '🖌️'],
  },
];

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="flex flex-col gap-6 max-w-md w-full">
        {options.map(({ title, href, emojis }) => (
          <Link key={title} href={href} passHref>
            <div className="flex items-center gap-4 border rounded-xl p-4 shadow hover:shadow-lg transition cursor-pointer bg-gray-50">
              <div className="grid grid-cols-2 gap-1 text-2xl">
                {emojis.map((emoji, idx) => (
                  <div key={idx}>{emoji}</div>
                ))}
              </div>
              <div className="text-xl font-semibold">{title}</div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
