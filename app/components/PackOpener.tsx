'use client';

import Image from 'next/image';
import { useState } from 'react';

type PackKey = 'A1_1' | 'A1_2' | 'A1_3';

type PackSelectorProps = {
  onOpenPack: (setKey: PackKey) => void;
  onViewCollection: () => void;
};

const packKeys: PackKey[] = ['A1_1', 'A1_2', 'A1_3'];

export default function PackSelector({ onOpenPack, onViewCollection }: PackSelectorProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const rotateLeft = () => {
    setSelectedIndex((prev) => (prev + packKeys.length - 1) % packKeys.length);
  };

  const rotateRight = () => {
    setSelectedIndex((prev) => (prev + 1) % packKeys.length);
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Carousel Container */}
      <div className="relative w-[300px] h-[360px] [perspective:1000px]">
        <div
          className="relative w-full h-full transition-transform duration-700 ease-in-out [transform-style:preserve-3d]"
          style={{
            transform: `rotateY(-${selectedIndex * 120}deg)`,
          }}
        >
          {packKeys.map((setKey, i) => {
            const angle = i * 120;
            return (
              <div
                key={setKey}
                className="absolute top-0 left-1/2 w-[240px] h-[320px] -translate-x-1/2"
                style={{
                  transform: `rotateY(${angle}deg) translateZ(400px)`,
                  transformStyle: 'preserve-3d',
                }}
                onClick={() => onOpenPack(setKey)}
              >
                <Image
                  src={`https://static.dotgg.gg/pokepocket/set-logo/${setKey}.webp`}
                  alt={`Open ${setKey}`}
                  width={240}
                  height={320}
                  className="rounded-xl shadow-xl hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex space-x-4">
        <button onClick={rotateLeft} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
          ←
        </button>
        <button onClick={rotateRight} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
          →
        </button>
        <button
          onClick={onViewCollection}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
        >
          View Collection
        </button>
      </div>
    </div>
  );
}



