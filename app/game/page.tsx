'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '../components/NavBar';
import CardImage from '../components/CardImage';
import DeckSelector from '../components/DeckSelector';
import CardSlot from '../components/CardSlot';
import GameBoard from '../components/GameBoard';
import HandArea from '../components/HandArea';
import GameControls from '../components/GameControls';

import { Card, SavedDeck } from '../types/card';
import {
  BoardSlot,
  canPlaceCardAtSlot,
  getRandomEnergyUrl,
} from '../utils/gameUtils';

export default function GamePage() {
  const router = useRouter();

  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<SavedDeck | null>(null);
  const [hand, setHand] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerBoard, setPlayerBoard] = useState<BoardSlot[]>(Array(4).fill(null));
  const [opponentHand, setOpponentHand] = useState<Card[]>([]);
  const [opponentBoard, setOpponentBoard] = useState<BoardSlot[]>(Array(4).fill(null));
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [energyUrl, setEnergyUrl] = useState<string | null>(null);
  const [turn, setTurn] = useState(1);
  const [hasPlacedEnergy, setHasPlacedEnergy] = useState(false);
  const [playerDefeatedCount, setPlayerDefeatedCount] = useState(0);
  const [opponentDefeatedCount, setOpponentDefeatedCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Load saved decks from localStorage
  useEffect(() => {
    const decksStr = localStorage.getItem('savedDecks');
    if (decksStr) {
      const decks: SavedDeck[] = JSON.parse(decksStr);
      setSavedDecks(decks);
    }
  }, []);

  // Initialize game state when a deck is selected
  useEffect(() => {
    if (selectedDeck) {
      const shuffled = [...selectedDeck.cards].sort(() => Math.random() - 0.5);
      setHand(shuffled.slice(0, 5));
      setDeck(shuffled.slice(5));
      setPlayerBoard(Array(4).fill(null));
      setDraggedIndex(null);
      setTurn(1);

      if (selectedDeck.energyTypes && selectedDeck.energyTypes.length > 0) {
        const url = getRandomEnergyUrl(selectedDeck.energyTypes);
        setEnergyUrl(url);
      } else {
        setEnergyUrl(null);
      }

      // Opponent setup
      const opponentShuffled = [...selectedDeck.cards].sort(() => Math.random() - 0.5);
      setOpponentHand(opponentShuffled);

      // Find first basic card in opponent hand
      const basicCardIndex = opponentShuffled.findIndex(card => card.stage === 'Basic');
      if (basicCardIndex >= 0) {
        const basicCard = opponentShuffled[basicCardIndex];
        const newOpponentBoard: BoardSlot[] = Array(4).fill(null);
        newOpponentBoard[0] = {
          card: basicCard,
          placedTurn: 1,
          energy: 0,
          currentHp: basicCard.hp ? parseInt(basicCard.hp, 10) : 0,
        };
        setOpponentBoard(newOpponentBoard);

        // Remove placed card from opponent hand
        setOpponentHand(prev => prev.filter((_, i) => i !== basicCardIndex));
      } else {
        setOpponentBoard(Array(4).fill(null));
      }
    }
  }, [selectedDeck]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  

  const handleDropEnergy = (index: number) => {
    if (hasPlacedEnergy) return;

    const slot = playerBoard[index];
    if (!slot) return;

    const updatedBoard = [...playerBoard];
    updatedBoard[index] = {
      ...slot,
      energy: (slot.energy || 0) + 1,
    };

    setPlayerBoard(updatedBoard);
    setHasPlacedEnergy(true);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null) return;

    const cardToPlace = hand[draggedIndex];
    const slot = playerBoard[index];

    if (!canPlaceCardAtSlot(cardToPlace, slot, turn)) {
      alert(`You cannot place a ${cardToPlace.stage || 'Basic'} card here yet!`);
      return;
    }

    const updatedBoard = [...playerBoard];

    // Preserve existing energy if any, otherwise 0
    const existingEnergy = slot?.energy || 0;

    updatedBoard[index] = {
      card: cardToPlace,
      placedTurn: turn,
      energy: existingEnergy,
      currentHp: cardToPlace.hp ? parseInt(cardToPlace.hp, 10) : 0,
    };

    setPlayerBoard(updatedBoard);

    // Remove placed card from hand
    const updatedHand = [...hand];
    updatedHand.splice(draggedIndex, 1);
    setHand(updatedHand);

    setDraggedIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const drawCard = () => {
    if (deck.length === 0) return;

    const randomIndex = Math.floor(Math.random() * deck.length);
    const cardDrawn = deck[randomIndex];

    const newDeck = [...deck];
    newDeck.splice(randomIndex, 1);
    setDeck(newDeck);
    setHand((prevHand) => [...prevHand, cardDrawn]);
  };

  const nextTurn = () => {
    setTurn((t) => t + 1);
    setHasPlacedEnergy(false);
    drawCard();
  };

  // Update: show all attacks next to the player's frontline pokemon
  // Handle attack on opponent frontline with selected attack index
  const handleAttackOpponentFrontline = (attackIndex: number) => {
    const attackerSlot = playerBoard[0];
    const defenderSlot = opponentBoard[0];

    if (!attackerSlot || !attackerSlot.card.attack?.[attackIndex]) {
      alert('No attacker or attack available!');
      return;
    }
    if (!defenderSlot) {
      alert('No opponent card in frontline to attack!');
      return;
    }

    const attack = attackerSlot.card.attack[attackIndex];

    // Calculate required energy
    const energyMatches = attack.info.match(/\{([A-Z]+)\}/g) || [];
    const requiredEnergy = energyMatches.reduce((sum, token) => {
      const inner = token.replace(/[{}]/g, '');
      return sum + inner.length;
    }, 0);

    const attachedEnergy = attackerSlot.energy || 0;

    if (attachedEnergy < requiredEnergy) {
      alert(`Not enough energy! Requires ${requiredEnergy}, but has ${attachedEnergy}.`);
      return;
    }

    // Parse damage from attack info (assumes damage number at end)
    const damageMatch = attack.info.match(/\d+$/);
    const damage = damageMatch ? parseInt(damageMatch[0], 10) : 0;

    // Calculate new HP for opponent's card
    const newHp = (defenderSlot.currentHp ?? (defenderSlot.card.hp ? parseInt(defenderSlot.card.hp, 10) : 0)) - damage;

    alert(`${attackerSlot.card.name} attacked ${defenderSlot.card.name} dealing ${damage} damage!`);

    // Update opponent board slot with new HP (remove card if HP <= 0)
    setOpponentBoard((prev) => {
      const newBoard = [...prev];
      if (newHp <= 0) {
        newBoard[0] = null; // card defeated
        alert(`${defenderSlot.card.name} was defeated!`);
      } else {
        newBoard[0] = {
          ...defenderSlot,
          currentHp: newHp,
        };
      }
      return newBoard;
    });

    // *** Remove energy reduction, so energy stays the same ***
    // setPlayerBoard((prev) => {
    //   const newBoard = [...prev];
    //   newBoard[0] = {
    //     ...attackerSlot,
    //     energy: (attackerSlot.energy ?? 0) - requiredEnergy,
    //   };
    //   return newBoard;
    // });
  };

  return (
    <div className="min-h-screen bg-green-100 p-6 space-y-8">
      <NavBar />
      <h1 className="text-3xl font-bold text-center">Game Board</h1>

      <DeckSelector
        savedDecks={savedDecks}
        selectedDeck={selectedDeck}
        onSelectDeck={setSelectedDeck}
      />

      {/* Opponent Hand at top */}
      <div className="flex gap-2 justify-center mb-4">
        {opponentHand.map((card, i) => (
          <CardImage key={`opp-hand-${i}`} card={card} faceDown={true} />
        ))}
      </div>

      {/* Opponent Board */}
      <div className="flex flex-col items-center space-y-4">
        <div className="flex gap-4">
          {opponentBoard.slice(1).map((slot, i) => (
            <CardSlot key={`opp-back-${i + 1}`} index={i + 1} slot={slot} isDroppable={false} />
          ))}
        </div>
        {/* Frontline slot at index 0 */}
        <CardSlot index={0} slot={opponentBoard[0]} isDroppable={false} />
      </div>

      {/* Player Board */}
      <div className="flex flex-col items-center space-y-4">
        <GameBoard
          playerBoard={playerBoard}
          onDropCard={handleDrop}
          onDropEnergy={handleDropEnergy}
          onDragOver={handleDragOver}
        />

        {/* Show attacks next to player's frontline card */}
        {playerBoard[0]?.card?.attack && (
          <div className="mt-2 flex gap-2">
            {playerBoard[0].card.attack.map((attack, i) => (
              <button
                key={`attack-btn-${i}`}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                onClick={() => handleAttackOpponentFrontline(i)}
              >
                {attack.name} ({attack.info})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Player Hand, Deck, Energy */}
      <HandArea
        hand={hand}
        onDragStart={handleDragStart}
        energyUrl={energyUrl}
        hasPlacedEnergy={hasPlacedEnergy}
      />

      {/* Controls */}
      <GameControls onNextTurn={nextTurn} currentTurn={turn} />
    </div>
  );
}

