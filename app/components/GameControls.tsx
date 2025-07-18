// components/GameControls.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface GameControlsProps {
  onNextTurn: () => void;
  currentTurn: number;
}

const GameControls: React.FC<GameControlsProps> = ({ onNextTurn, currentTurn }) => {
  const router = useRouter();

  return (
    <>
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => router.push('/battle')}
          className="mt-10 px-6 py-3 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
        >
          Back to Battle
        </button>
        <button
          onClick={onNextTurn}
          className="mt-10 px-6 py-3 bg-blue-700 text-white rounded hover:bg-blue-600 transition"
        >
          Next Turn (Draw Card)
        </button>
      </div>
      <div className="text-center mt-6 text-xl font-semibold">
        Current Turn: {currentTurn}
      </div>
    </>
  );
};

export default GameControls;
