'use client';

import React from 'react';
import { BoardSlot } from '../utils/gameUtils';
import CardImage from './CardImage';

interface CardSlotProps {
  index: number;
  slot: BoardSlot | null;
  isDroppable: boolean;
  onDropCard?: (index: number) => void;
  onDropEnergy?: (index: number) => void;
  onDragOver?: (e: React.DragEvent) => void;
}

const CardSlot: React.FC<CardSlotProps> = ({
  index,
  slot,
  isDroppable,
  onDropCard,
  onDropEnergy,
  onDragOver,
}) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type');

    if (!isDroppable) return;

    if (type === 'energy' && onDropEnergy) {
      onDropEnergy(index);
    } else if (type !== 'energy' && onDropCard) {
      onDropCard(index);
    }
  };

  return (
    <div
      className="relative w-20 h-28 bg-white border-2 border-gray-400 rounded-md shadow-md flex items-center justify-center"
      onDrop={handleDrop}
      onDragOver={isDroppable ? onDragOver : undefined}
    >
      {slot ? (
        <>
          <CardImage card={slot.card} size={{ width: 70, height: 100 }} showRarity={false} />

          {/* Current HP badge */}
          <div className="absolute top-1 left-1 bg-red-600 text-white text-xs px-1 rounded shadow">
            HP: {slot.currentHp ?? (slot.card.hp ? parseInt(slot.card.hp, 10) : '??')}
          </div>

          {slot.energy > 0 && (
            <div className="absolute bottom-1 right-1 bg-black text-xs px-1 rounded shadow">
              ⚡ {slot.energy}
            </div>
          )}
        </>
      ) : (
        <span className="text-gray-400">Slot</span>
      )}
    </div>
  );
};

export default CardSlot;


