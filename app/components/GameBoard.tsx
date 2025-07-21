// components/GameBoard.tsx
'use client';

import React from 'react';
import CardSlot from './CardSlot';
import { BoardSlot } from '../utils/gameUtils';

interface GameBoardProps {
  playerBoard: BoardSlot[];
  onDropCard: (index: number) => void;
  onDropEnergy: (index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  playerBoard,
  onDropCard,
  onDropEnergy,
  onDragOver,
}) => (
  <div className="flex flex-col items-center space-y-4 mt-10">
    {/* Player Frontline */}
    <CardSlot
      index={0}
      slot={playerBoard[0]}
      isDroppable={true}
      onDropCard={onDropCard}
      onDropEnergy={onDropEnergy}
      onDragOver={onDragOver}
    />

    {/* Backline */}
    <div className="flex gap-4">
      {playerBoard.slice(1).map((slot, i) => (
        <CardSlot
          key={`back-${i}`}
          index={i + 1}
          slot={slot}
          isDroppable={true}
          onDropCard={onDropCard}
          onDropEnergy={onDropEnergy}
          onDragOver={onDragOver}
        />
      ))}
    </div>
  </div>
);

export default GameBoard;

