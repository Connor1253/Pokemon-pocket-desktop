'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import NavBar from '../components/NavBar';

export default function BattlePage() {
  const router = useRouter();

  return (
    <>
      <div className="max-w-5xl mx-auto p-4">
        <NavBar />
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-6 bg-gray-100">
        <button
          className="w-40 p-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          aria-label="Versus"
          type="button"
          onClick={() => alert('Versus clicked!')}
        >
          Versus
        </button>
        <button
          className="w-40 p-3 bg-green-600 text-white rounded hover:bg-green-700 transition"
          aria-label="Local"
          type="button"
          onClick={() => router.push('/game')}
        >
          Local
        </button>
      </div>
    </>
  );
}

