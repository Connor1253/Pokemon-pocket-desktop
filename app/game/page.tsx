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
import { normalizeCard } from '../utils/cardUtils';

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
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [hasPlacedEnergy, setHasPlacedEnergy] = useState(false);
  const [playerDefeatedCount, setPlayerDefeatedCount] = useState(0);
  const [opponentDefeatedCount, setOpponentDefeatedCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const decksStr = localStorage.getItem('savedDecks');
    if (decksStr) {
      const decks: SavedDeck[] = JSON.parse(decksStr);
      setSavedDecks(decks);
    }
  }, []);

  useEffect(() => {
    if (selectedDeck) {
      const normalizedCards = selectedDeck.cards.map(normalizeCard);

      const shuffled = [...normalizedCards].sort(() => Math.random() - 0.5);
      setHand(shuffled.slice(0, 5));
      setDeck(shuffled.slice(5));
      setPlayerBoard(Array(4).fill(null));
      setDraggedIndex(null);
      setTurn(1);
      setIsPlayerTurn(true);

      if (selectedDeck.energyTypes && selectedDeck.energyTypes.length > 0) {
        const url = getRandomEnergyUrl(selectedDeck.energyTypes);
        setEnergyUrl(url);
      } else {
        setEnergyUrl(null);
      }

      const opponentShuffled = [...selectedDeck.cards].sort(() => Math.random() - 0.5);
      setOpponentHand(opponentShuffled);

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
        setOpponentHand(prev => prev.filter((_, i) => i !== basicCardIndex));
      } else {
        setOpponentBoard(Array(4).fill(null));
      }
    }
  }, [selectedDeck]);

  const handleDragStart = (index: number) => {
    if (!isPlayerTurn) return;
    setDraggedIndex(index);
  };

  const handleDropEnergy = (index: number) => {
    if (!isPlayerTurn || hasPlacedEnergy) return;

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
    if (!isPlayerTurn || draggedIndex === null) return;

    const cardToPlace = hand[draggedIndex];
    const slot = playerBoard[index];

    if (!canPlaceCardAtSlot(cardToPlace, slot, turn)) {
      alert(`You cannot place a ${cardToPlace.stage || 'Basic'} card here yet!`);
      return;
    }

    const updatedBoard = [...playerBoard];
    const existingEnergy = slot?.energy || 0;

    updatedBoard[index] = {
      card: cardToPlace,
      placedTurn: turn,
      energy: existingEnergy,
      currentHp: cardToPlace.hp ? parseInt(cardToPlace.hp, 10) : 0,
    };

    const updatedHand = [...hand];
    updatedHand.splice(draggedIndex, 1);
    setHand(updatedHand);
    setPlayerBoard(updatedBoard);
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

  const runOpponentTurn = () => {
    const newOpponentBoard = [...opponentBoard];
    const opponentDeck = [...opponentHand];
    const drawnCard = opponentDeck.pop();
    if (drawnCard) {
      setOpponentHand([drawnCard, ...opponentHand]);
    }

    if (newOpponentBoard[0]?.card?.attack?.[0] && playerBoard[0]) {
      const attack = newOpponentBoard[0].card.attack[0];
      const damage = attack.damage ?? 0;
      const newHp =
        (playerBoard[0].currentHp ?? parseInt(playerBoard[0].card.hp || '0', 10)) - damage;

      alert(`Opponent's ${newOpponentBoard[0].card.name} attacks for ${damage} damage!`);

      const newPlayerBoard = [...playerBoard];
      if (newHp <= 0) {
        alert(`${playerBoard[0].card.name} was defeated!`);
        newPlayerBoard[0] = null;
      } else {
        newPlayerBoard[0] = {
          ...playerBoard[0],
          currentHp: newHp,
        };
      }
      setPlayerBoard(newPlayerBoard);
    }

    setTimeout(() => {
      setIsPlayerTurn(true);
      drawCard();
      setTurn((t) => t + 1);
    }, 1500);
  };

  const nextTurn = () => {
    setHasPlacedEnergy(false);
    setIsPlayerTurn((prev) => !prev);

    if (isPlayerTurn) {
      setTimeout(() => {
        runOpponentTurn();
      }, 1000);
    }
  };

  const handleAttackOpponentFrontline = (attackIndex: number) => {
    if (!isPlayerTurn) {
      alert("It's not your turn!");
      return;
    }

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

    const damage = attack.damage ?? 0;
    const newHp = (defenderSlot.currentHp ?? parseInt(defenderSlot.card.hp || '0', 10)) - damage;

    alert(`${attackerSlot.card.name} attacked ${defenderSlot.card.name} dealing ${damage} damage!`);

    setOpponentBoard((prev) => {
      const newBoard = [...prev];
      if (newHp <= 0) {
        newBoard[0] = null;
        alert(`${defenderSlot.card.name} was defeated!`);
      } else {
        newBoard[0] = {
          ...defenderSlot,
          currentHp: newHp,
        };
      }
      return newBoard;
    });
  };

  return (
    <div className="min-h-screen bg-green-100 p-6 space-y-8">
      <NavBar />
      <h1 className="text-3xl font-bold text-center">Game Board</h1>
      <h2 className="text-xl text-center font-semibold">
        {isPlayerTurn ? "Your Turn" : "Opponent's Turn"}
      </h2>

      <DeckSelector
        savedDecks={savedDecks}
        selectedDeck={selectedDeck}
        onSelectDeck={setSelectedDeck}
      />

      <div className="flex gap-2 justify-center mb-4">
        {opponentHand.map((card, i) => (
          <CardImage key={`opp-hand-${i}`} card={card} faceDown={true} />
        ))}
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="flex gap-4">
          {opponentBoard.slice(1).map((slot, i) => (
            <CardSlot key={`opp-back-${i + 1}`} index={i + 1} slot={slot} isDroppable={false} />
          ))}
        </div>
        <CardSlot index={0} slot={opponentBoard[0]} isDroppable={false} />
      </div>

      <div className="flex flex-col items-center space-y-4">
        <GameBoard
          playerBoard={playerBoard}
          onDropCard={handleDrop}
          onDropEnergy={handleDropEnergy}
          onDragOver={handleDragOver}
        />

        {playerBoard[0]?.card?.attack && (
          <div className="mt-2 flex gap-2">
            {playerBoard[0].card.attack.map((attack, i) => (
              <button
                key={`attack-btn-${i}`}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                onClick={() => handleAttackOpponentFrontline(i)}
              >
                {attack.cost} {attack.name} {attack.damage}
              </button>
            ))}
          </div>
        )}
      </div>

      <HandArea
        hand={hand}
        onDragStart={handleDragStart}
        energyUrl={energyUrl}
        hasPlacedEnergy={hasPlacedEnergy}
      />

      <GameControls
        onNextTurn={isPlayerTurn ? nextTurn : undefined}
        currentTurn={turn}
      />
    </div>
  );
}