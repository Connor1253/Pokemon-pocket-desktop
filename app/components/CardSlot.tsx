// components/CardSlot.tsx
'use client';

import React from 'react';
import { Card } from '../types/card';
import CardImage from './CardImage';
import { BoardSlot } from '../utils/gameUtils';

interface CardSlotProps {
  index: number;
  slot: BoardSlot;
  isDroppable: boolean;
  onDrop?: (index: number) => void;
  onDragOver?: (e: React.DragEvent) => void;
}

const CardSlot: React.FC<CardSlotProps> = ({ index, slot, isDroppable, onDrop, onDragOver }) => (
  <div
    className="w-20 h-28 bg-white border-2 border-gray-400 rounded-md shadow-md flex items-center justify-center"
    onDrop={() => isDroppable && onDrop?.(index)}
    onDragOver={isDroppable ? onDragOver : undefined}
  >
    {slot ? (
      <CardImage card={slot.card} size={{ width: 70, height: 100 }} showRarity={false} />
    ) : (
      <span className="text-gray-400">Slot</span>
    )}
  </div>
);

export default CardSlot;
