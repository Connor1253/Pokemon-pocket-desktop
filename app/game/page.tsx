'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '../components/NavBar';
import CardImage from '../components/CardImage';

type Card = {
  id: string;
  name: string;
  rarity: string;
  number: string;
  setId: string;
  stage?: string; // 'Basic', 'Stage 1', 'Stage 2' etc.
  prew_stage_name?: string; // previous evolution name from JSON
};

type SavedDeck = {
  name: string;
  cards: Card[];
  energyTypes?: string[];
};

type BoardSlot = {
  card: Card;
  placedTurn: number;
} | null;

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

  useEffect(() => {
    const decksStr = localStorage.getItem('savedDecks');
    if (decksStr) {
      const decks: SavedDeck[] = JSON.parse(decksStr);
      setSavedDecks(decks);
    }
  }, []);

  useEffect(() => {
    if (selectedDeck) {
      // Shuffle full deck
      const shuffled = [...selectedDeck.cards].sort(() => Math.random() - 0.5);
      // Draw initial hand of 5 cards
      const initialHand = shuffled.slice(0, 5);
      // Remaining cards form the deck
      const remainingDeck = shuffled.slice(5);

      setHand(initialHand);
      setDeck(remainingDeck);
      setPlayerBoard(Array(4).fill(null));
      setDraggedIndex(null);
      setTurn(1);

      // ENERGY DETECTION - your original logic preserved exactly
      if (selectedDeck.energyTypes && selectedDeck.energyTypes.length > 0) {
        const randomEnergyType =
          selectedDeck.energyTypes[
            Math.floor(Math.random() * selectedDeck.energyTypes.length)
          ].toLowerCase();

        const energyTypeMap: { [key: string]: string } = {
          darkness: 'darkness',
          fire: 'fire',
          water: 'water',
          grass: 'grass',
          lightning: 'lightning',
          psychic: 'psychic',
          fighting: 'fighting',
          metal: 'metal',
          dragon: 'dragon',
          fairy: 'fairy',
          colorless: 'colorless',
        };

        const matchedType = Object.keys(energyTypeMap).find((type) =>
          randomEnergyType.includes(type)
        );

        if (matchedType) {
          setEnergyUrl(`https://static.dotgg.gg/pokemon/icons/${energyTypeMap[matchedType]}.png`);
        } else {
          setEnergyUrl('https://static.dotgg.gg/pokemon/icons/colorless.png');
        }
      } else {
        setEnergyUrl(null);
      }
    }
  }, [selectedDeck]);

  // Normalize stage string for comparison
  const normalizeStage = (stage?: string) =>
    (stage ?? 'Basic').toLowerCase().replace(/\s+/g, '');

  const canPlaceCardAtSlot = (
    newCard: Card,
    slot: BoardSlot | null,
    currentTurn: number
  ): boolean => {
    const newStage = normalizeStage(newCard.stage);

    if (!slot) {
      // Empty slot: only allow Basic cards
      if (newStage !== 'basic') {
        console.log(`Cannot place ${newCard.name} (${newStage}) on empty slot. Only Basic allowed.`);
        return false;
      }
      return true;
    }

    const existingCard = slot.card;
    const existingStage = normalizeStage(existingCard.stage);
    const existingTurn = slot.placedTurn;

    // Check evolution condition:
    // - newCard.prew_stage_name must match existingCard.name exactly (case-sensitive)
    // - new card stage must be exactly one stage higher than existing card stage (optional, can be enforced if you want)
    // - at least one turn has passed since existing card was placed

    if (newCard.prew_stage_name !== existingCard.name) {
      console.log(
        `Cannot evolve ${existingCard.name} into ${newCard.name}: prew_stage_name mismatch.`
      );
      return false;
    }

    if (currentTurn - existingTurn < 1) {
      console.log(
        `Cannot evolve ${existingCard.name} into ${newCard.name}: must wait at least one turn after placing.`
      );
      return false;
    }

    // Optionally: you can validate stages order here, but since prew_stage_name matches, this is probably enough

    return true;
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
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
    updatedBoard[index] = { card: cardToPlace, placedTurn: turn };
    setPlayerBoard(updatedBoard);

    const updatedHand = [...hand];
    updatedHand.splice(draggedIndex, 1);
    setHand(updatedHand);
    setDraggedIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Draw one random card from deck (if available)
  const drawCard = () => {
    if (deck.length === 0) return; // no cards left

    // Pick random card index
    const randomIndex = Math.floor(Math.random() * deck.length);
    const cardDrawn = deck[randomIndex];

    // Remove drawn card from deck
    const newDeck = [...deck];
    newDeck.splice(randomIndex, 1);
    setDeck(newDeck);

    // Add card to hand
    setHand((prevHand) => [...prevHand, cardDrawn]);
  };

  // Advance turn and draw a card
  const nextTurn = () => {
    setTurn((t) => t + 1);
    drawCard();
  };

  const CardSlot = ({
    index,
    slot,
    isDroppable,
  }: {
    index: number;
    slot: BoardSlot | null;
    isDroppable: boolean;
  }) => (
    <div
      className="w-20 h-28 bg-white border-2 border-gray-400 rounded-md shadow-md flex items-center justify-center"
      onDrop={() => isDroppable && handleDrop(index)}
      onDragOver={isDroppable ? handleDragOver : undefined}
    >
      {slot ? (
        <CardImage card={slot.card} size={{ width: 70, height: 100 }} showRarity={false} />
      ) : (
        <span className="text-gray-400">Slot</span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-green-100 p-6 space-y-8">
      <NavBar />
      <h1 className="text-3xl font-bold text-center">Game Board</h1>

      {/* Deck Selector */}
      <div className="flex justify-center gap-4">
        <select
          className="px-4 py-2 border rounded"
          onChange={(e) => {
            const deck = savedDecks.find((d) => d.name === e.target.value) || null;
            setSelectedDeck(deck);
          }}
          value={selectedDeck?.name || ''}
        >
          <option value="">Select a deck...</option>
          {savedDecks.map((deck) => (
            <option key={deck.name} value={deck.name}>
              {deck.name}
            </option>
          ))}
        </select>
      </div>

      {/* Opponent Board (visual only) */}
      <div className="flex flex-col items-center space-y-4">
        <div className="flex gap-4">
          {[...Array(3)].map((_, i) => (
            <CardSlot key={`opp-back-${i}`} index={-1} slot={null} isDroppable={false} />
          ))}
        </div>
        <CardSlot index={-1} slot={null} isDroppable={false} />
      </div>

      {/* Your Board */}
      <div className="flex flex-col items-center space-y-4 mt-10">
        <CardSlot index={0} slot={playerBoard[0]} isDroppable={true} />
        <div className="flex gap-4">
          {playerBoard.slice(1).map((slot, i) => (
            <CardSlot key={`back-${i}`} index={i + 1} slot={slot} isDroppable={true} />
          ))}
        </div>
      </div>

      {/* Hand, Deck Sleeve, and Energy */}
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
              onDragStart={() => handleDragStart(i)}
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

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => router.push('/battle')}
          className="mt-10 px-6 py-3 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
        >
          Back to Battle
        </button>
        <button
          onClick={nextTurn}
          className="mt-10 px-6 py-3 bg-blue-700 text-white rounded hover:bg-blue-600 transition"
        >
          Next Turn (Draw Card)
        </button>
      </div>

      {/* Turn Display */}
      <div className="text-center mt-6 text-xl font-semibold">
        Current Turn: {turn}
      </div>
    </div>
  );
}























