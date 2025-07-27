import React, { useEffect, useState } from 'react';
import { Card } from '../types/card'; 
import { normalizeCard } from '../utils/cardUtils';
import { BoardSlot } from '../utils/gameUtils';
import CardImage from './CardImage';

interface OpponentAIProps {
  initialCards: Card[];
  turn: number;
  playerBoard: BoardSlot[];
  onAttack: (damage: number) => void;
}

export default function OpponentAI({ initialCards, turn, playerBoard, onAttack }: OpponentAIProps) {
  const [opponentHand, setOpponentHand] = useState<Card[]>([]);
  const [opponentBoard, setOpponentBoard] = useState<BoardSlot[]>(Array(4).fill(null));

  // Initialize hand and board on mount or when initialCards change
  useEffect(() => {
    const normalizedCards = initialCards.map(normalizeCard);
    const shuffled = [...normalizedCards].sort(() => Math.random() - 0.5);
    setOpponentHand(shuffled);

    // Place up to 2 Basic cards on board front slots initially
    const newOpponentBoard: BoardSlot[] = Array(4).fill(null);
    let placedCount = 0;
    for (let i = 0; i < shuffled.length && placedCount < 2; i++) {
      if (shuffled[i].stage === 'Basic') {
        newOpponentBoard[placedCount] = {
          card: shuffled[i],
          placedTurn: 1,
          energy: 0,
          currentHp: shuffled[i].hp ? parseInt(shuffled[i].hp, 10) : 0,
        };
        placedCount++;
      }
    }
    setOpponentBoard(newOpponentBoard);

    // Remove placed cards from hand
    setOpponentHand((prev) =>
      prev.filter((card) => !newOpponentBoard.some((slot) => slot?.card.id === card.id))
    );
  }, [initialCards]);

  // AI turn logic - call this when it's opponent's turn
  const playTurn = () => {
    // 1. Draw a card if any
    if (opponentHand.length > 0) {
      const newCard = opponentHand[0];
      setOpponentHand((prev) => prev.slice(1));
      setOpponentHand((prev) => [...prev, newCard]);
    }

    // 2. Place Basic cards on empty board slots
    setOpponentBoard((prevBoard) => {
      const newBoard = [...prevBoard];
      const emptySlotIndex = newBoard.findIndex((slot) => slot === null);
      if (emptySlotIndex !== -1) {
        const basicCardIndex = opponentHand.findIndex((card) => card.stage === 'Basic');
        if (basicCardIndex !== -1) {
          const cardToPlace = opponentHand[basicCardIndex];
          newBoard[emptySlotIndex] = {
            card: cardToPlace,
            placedTurn: turn,
            energy: 0,
            currentHp: cardToPlace.hp ? parseInt(cardToPlace.hp, 10) : 0,
          };
          // Remove placed card from hand
          setOpponentHand((prev) => {
            const copy = [...prev];
            copy.splice(basicCardIndex, 1);
            return copy;
          });
        }
      }
      return newBoard;
    });

    // 3. Place energy on a card that has less than 3 energy
    setOpponentBoard((prevBoard) => {
      const newBoard = [...prevBoard];
      for (let i = 0; i < newBoard.length; i++) {
        if (newBoard[i] && (newBoard[i]!.energy ?? 0) < 3) {
          newBoard[i] = { ...newBoard[i]!, energy: (newBoard[i]!.energy ?? 0) + 1, currentHp: newBoard[i]!.currentHp };
          break;
        }
      }
      return newBoard;
    });

    // 4. Attack player's frontline if possible
    const opponentFrontline = opponentBoard[0];
    const playerFrontline = playerBoard[0];

    if (opponentFrontline && opponentFrontline.card.attack && playerFrontline) {
      // Filter attacks AI can afford based on energy cost (rough calculation)
      const possibleAttacks = opponentFrontline.card.attack.filter((attack) => {
        const energyMatches = attack.info.match(/\{[A-Z]+\}/g) || [];
        const requiredEnergy = energyMatches.reduce((sum, token) => sum + token.length - 2, 0);
        return (opponentFrontline.energy ?? 0) >= requiredEnergy;
      });

      if (possibleAttacks.length > 0) {
        // Pick attack with highest damage
        const bestAttack = possibleAttacks.reduce((max, attack) => {
          const damageMatch = attack.info.match(/\d+$/);
          const damage = damageMatch ? parseInt(damageMatch[0], 10) : 0;
          return damage > max.damage ? { attack, damage } : max;
        }, { attack: possibleAttacks[0], damage: 0 }).attack;

        const damageMatch = bestAttack.info.match(/\d+$/);
        const damage = damageMatch ? parseInt(damageMatch[0], 10) : 0;

        onAttack(damage);
      }
    }
  };

  return (
    <div>
      {/* Render opponent hand as face-down cards */}
      <div className="flex gap-2 justify-center mb-4">
        {opponentHand.map((card, i) => (
          <img
            key={`opp-hand-${i}`}
            src="/card-back.png"
            alt="Opponent Card"
            className="w-16 h-24"
          />
        ))}
      </div>

      {/* Render opponent board */}
      <div className="flex flex-col items-center space-y-4">
        <div className="flex gap-4">
          {opponentBoard.slice(1).map((slot, i) =>
            slot ? (
              <CardImage card={opponentBoard[0].card} size={{ width: 96, height: 128 }} showRarity={false} />
            ) : (
              <div key={`opp-back-${i + 1}`} className="w-20 h-28 border-2 border-gray-400 rounded"></div>
            )
          )}
        </div>
        {/* Frontline slot at index 0 */}
        {opponentBoard[0] ? (
          <CardImage card={opponentBoard[0].card} size={{ width: 96, height: 128 }} showRarity={false} />
        ) : (
          <div className="w-24 h-32 border-2 border-gray-600 rounded"></div>
        )}
      </div>
    </div>
  );
}
