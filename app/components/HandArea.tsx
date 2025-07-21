'use client';

import React from 'react';
import { Card } from '../types/card';
import CardImage from './CardImage';

interface HandAreaProps {
  hand: Card[];
  onDragStart: (index: number) => void;
  energyUrl: string | null;
  hasPlacedEnergy: boolean;
}

const HandArea: React.FC<HandAreaProps> = ({
  hand,
  onDragStart,
  energyUrl,
  hasPlacedEnergy,
}) => (
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
        <span className="text-sm text-gray-700 mb-1">Energy</span>
        <div
          className={`w-14 h-14 rounded-full border-4 border-yellow-400 bg-yellow-200 shadow-lg flex items-center justify-center transition-transform duration-200 ${
            hasPlacedEnergy ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105 cursor-grab'
          }`}
          draggable={!hasPlacedEnergy}
          onDragStart={(e) => {
            if (!hasPlacedEnergy) {
              e.dataTransfer.setData('type', 'energy');
            }
          }}
          title={
            hasPlacedEnergy
              ? 'You can only place one energy per turn'
              : 'Drag to attach energy to a card'
          }
        >
          <img
            src={energyUrl}
            alt="Energy"
            className="w-10 h-10 object-contain"
          />
        </div>
      </div>
    )}
  </div>
);

export default HandArea;

