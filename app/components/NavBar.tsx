'use client';

import { useRouter } from 'next/navigation';

export default function NavBar() {
  const router = useRouter();
  const items = [
    { label: 'Pack Opener', path: '/' },
    { label: 'View Collection', path: '/collection' },
    { label: 'Battle', path: '/battle' },
    { label: 'Marketplace', path: '/marketplace' },
    { label: 'Events', path: '/events' },
  ];

  return (
    <nav className="bg-gray-800 text-white px-4 py-2 rounded flex gap-4 justify-center mb-6 flex-wrap">
      {items.map(({ label, path }) => (
        <button
          key={path}
          onClick={() => router.push(path)}
          className="hover:text-yellow-300 transition-colors"
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
