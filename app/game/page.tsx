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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [energyUrl, setEnergyUrl] = useState<string | null>(null);
  const [turn, setTurn] = useState(1);
  const [hasPlacedEnergy, setHasPlacedEnergy] = useState(false)

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
    }
  }, [selectedDeck]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDropEnergy = (index: number) => {
    if (hasPlacedEnergy) return;
  
    const slot = playerBoard[index];
    if (!slot) return; // No card at that slot
  
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
    setHasPlacedEnergy(false)
    drawCard();
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

      {/* Opponent board (static placeholder) */}
      <div className="flex flex-col items-center space-y-4">
        <div className="flex gap-4">
          {[...Array(3)].map((_, i) => (
            <CardSlot key={`opp-${i}`} index={-1} slot={null} isDroppable={false} />
          ))}
        </div>
        <CardSlot index={-1} slot={null} isDroppable={false} />
      </div>

      {/* Player Board */}
      <GameBoard
  playerBoard={playerBoard}
  onDropCard={handleDrop}
  onDropEnergy={handleDropEnergy}  
  onDragOver={handleDragOver}
/>

      {/* Player Hand, Deck, Energy */}
      <HandArea hand={hand} onDragStart={handleDragStart} energyUrl={energyUrl} hasPlacedEnergy={hasPlacedEnergy}/>

      {/* Controls */}
      <GameControls onNextTurn={nextTurn} currentTurn={turn}/>
    </div>
  );
}
























