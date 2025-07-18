// components/HandArea.tsx
'use client';

import React from 'react';
import { Card } from '../types/card';
import CardImage from './CardImage';

interface HandAreaProps {
  hand: Card[];
  onDragStart: (index: number) => void;
  energyUrl: string | null;
}

const HandArea: React.FC<HandAreaProps> = ({ hand, onDragStart, energyUrl }) => (
  <div className="mt-10 flex items-center justify-center gap-6 flex-wrap">
    {/* Deck sleeve */}
    <div
      className="w-20 h-28 bg-contain bg-no-repeat bg-center"
      style={{
        backgroundImage:
          'url(https://static.dotgg.gg/pokepocket/accessories/sleeves/sleeves-deckshield-100030-nyarth-meowth.webp)',
      }}
    />

    {/* Hand */}
    <div className="flex flex-wrap justify-center gap-4">
      {hand.map((card, i) => (
        <div
          key={`${card.id}-${i}`}
          draggable
          onDragStart={() => onDragStart(i)}
          className="cursor-move"
        >
          <CardImage card={card} size={{ width: 80, height: 110 }} showRarity={false} />
        </div>
      ))}
    </div>

    {/* Energy */}
    {energyUrl && (
      <div className="flex flex-col items-center">
        <span className="text-sm text-gray-700">Energy</span>
        <img src={energyUrl} alt="Energy" width={50} height={50} />
      </div>
    )}
  </div>
);

export default HandArea;
