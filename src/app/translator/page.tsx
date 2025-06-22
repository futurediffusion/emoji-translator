import Link from 'next/link';

export default function TranslatorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative text-center">
      <h1 className="text-2xl font-bold mb-2">Emoji Translator</h1>
      <p className="text-gray-500">Muy pronto podrás traducir cualquier texto a emojis.</p>
      <Link
        href="/"
        className="fixed bottom-4 right-4 text-2xl p-2 bg-white rounded-full shadow hover:shadow-lg"
      >
        🏠
      </Link>
    </div>
  );
}
