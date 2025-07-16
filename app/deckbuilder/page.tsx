'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import NavBar from '../components/NavBar';
import CardImage from '../components/CardImage';

type Card = {
  id: string;
  name: string;
  rarity: string;
  number: string;
  setId: string;
};

type Collection = { [id: string]: number };
type SavedDeck = { name: string; cards: Card[]; energyTypes?: string[] };

const energyTypes = [
  { name: 'dragon', icon: 'https://static.dotgg.gg/pokemon/icons/dragon.png' },
  { name: 'steel', icon: 'https://static.dotgg.gg/pokemon/icons/metal.png' },
  { name: 'darkness', icon: 'https://static.dotgg.gg/pokemon/icons/darkness.png' },
  { name: 'fighting', icon: 'https://static.dotgg.gg/pokemon/icons/fighting.png' },
  { name: 'fire', icon: 'https://static.dotgg.gg/pokemon/icons/fire.png' },
  { name: 'electric', icon: 'https://static.dotgg.gg/pokemon/icons/lightning.png' },
  { name: 'grass', icon: 'https://static.dotgg.gg/pokemon/icons/grass.png' },
  { name: 'psychic', icon: 'https://static.dotgg.gg/pokemon/icons/psychic.png' },
  { name: 'water', icon: 'https://static.dotgg.gg/pokemon/icons/water.png' },
];


export default function DeckBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editIndexParam = searchParams.get('editIndex');

  const [allCards, setAllCards] = useState<Card[]>([]);
  const [collection, setCollection] = useState<Collection>({});
  const [deck, setDeck] = useState<Card[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'rarity'>('id');
  const [deckName, setDeckName] = useState('');
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([]);
  const [selectedEnergyTypes, setSelectedEnergyTypes] = useState<string[]>([]);

  useEffect(() => {
    fetch('/data/cards.json')
      .then((res) => res.json())
      .then((data) => {
        const all: Card[] = Object.values(data);
        setAllCards(all);

        const saved = localStorage.getItem('collection');
        if (saved) setCollection(JSON.parse(saved));

        const savedDecksStr = localStorage.getItem('savedDecks');
        if (savedDecksStr) {
          const decks: SavedDeck[] = JSON.parse(savedDecksStr);
          setSavedDecks(decks);

          if (editIndexParam !== null) {
            const idx = parseInt(editIndexParam, 10);
            if (!isNaN(idx) && decks[idx]) {
              setDeckName(decks[idx].name);
              setDeck(decks[idx].cards);
              setSelectedEnergyTypes(decks[idx].energyTypes || []);
            }
          }
        }
      });
  }, [editIndexParam]);

  const filteredCards = useMemo(() => {
    let cards = allCards.filter((card) => collection[card.id]);
    if (searchQuery.trim()) {
      cards = cards.filter((card) =>
        card.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (sortBy === 'id') {
      cards.sort((a, b) => a.id.localeCompare(b.id));
    } else {
      const rarityOrder = { Common: 1, Uncommon: 2, Rare: 3, Epic: 4, Legendary: 5 };
      cards.sort((a, b) => (rarityOrder[a.rarity] || 99) - (rarityOrder[b.rarity] || 99));
    }
    return cards;
  }, [allCards, collection, searchQuery, sortBy]);

  const addToDeck = (card: Card) => {
    const countInDeck = deck.filter((c) => c.id === card.id).length;
    if (countInDeck >= 2 || deck.length >= 20) return;
    setDeck([...deck, card]);
  };

  const removeFromDeck = (index: number) => {
    const newDeck = [...deck];
    newDeck.splice(index, 1);
    setDeck(newDeck);
  };

  const saveDeck = () => {
    if (!deckName.trim() || deck.length !== 20) return;

    const deckIndex = savedDecks.findIndex((d) => d.name === deckName);
    const deckToSave: SavedDeck = {
      name: deckName,
      cards: deck,
      energyTypes: selectedEnergyTypes,
    };

    let updatedDecks;
    if (deckIndex !== -1) {
      updatedDecks = [...savedDecks];
      updatedDecks[deckIndex] = deckToSave;
    } else {
      updatedDecks = [...savedDecks, deckToSave];
    }

    setSavedDecks(updatedDecks);
    localStorage.setItem('savedDecks', JSON.stringify(updatedDecks));
    setDeckName('');
    setDeck([]);
    setSelectedEnergyTypes([]);
  };

  const deleteDeck = () => {
    const updatedDecks = savedDecks.filter((d) => d.name !== deckName);
    setSavedDecks(updatedDecks);
    localStorage.setItem('savedDecks', JSON.stringify(updatedDecks));
    setDeckName('');
    setDeck([]);
    setSelectedEnergyTypes([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <NavBar />

      <h1 className="text-3xl font-bold text-center">Deck Builder</h1>

      {/* Deck Display */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Your Deck ({deck.length}/20)</h2>
        <div className="grid grid-cols-10 gap-4 mb-4">
          {deck.map((card, idx) => (
            <div key={`${card.id}-${idx}`} className="relative">
              <CardImage card={card} size={{ width: 100, height: 140 }} />
              <button
                onClick={() => removeFromDeck(idx)}
                className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-bl"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Energy Selection */}
        <div className="flex flex-wrap gap-2 items-center mb-4">
          <span className="font-semibold">Energy Types:</span>
          {energyTypes.map((type) => (
            <img
              key={type.name}
              src={type.icon}
              alt={type.name}
              title={type.name}
              onClick={() =>
                setSelectedEnergyTypes((prev) =>
                  prev.includes(type.name)
                    ? prev.filter((t) => t !== type.name)
                    : [...prev, type.name]
                )
              }
              className={`w-8 h-8 cursor-pointer rounded ${
                selectedEnergyTypes.includes(type.name)
                  ? 'ring-2 ring-blue-500'
                  : 'opacity-50 hover:opacity-80'
              }`}
            />
          ))}
        </div>

        {/* Display Selected Energy Icons */}
        {selectedEnergyTypes.length > 0 && (
          <div className="flex gap-2 items-center mb-4">
            <span className="font-semibold">Selected Energies:</span>
            {selectedEnergyTypes.map((type) => {
              const icon = energyTypes.find((t) => t.name === type)?.icon;
              return (
                <img key={type} src={icon} alt={type} className="w-6 h-6" title={type} />
              );
            })}
          </div>
        )}

        {/* Save/Delete Controls */}
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Deck name"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            className="px-3 py-2 border border-gray-400 rounded w-64"
          />
          <button
            onClick={saveDeck}
            disabled={!deckName.trim() || deck.length !== 20}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            Save Deck
          </button>
          <button
            onClick={deleteDeck}
            disabled={!deckName.trim() || !savedDecks.some((d) => d.name === deckName)}
            className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
          >
            Delete Deck
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 justify-center">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-2 rounded border border-gray-400 w-64"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'id' | 'rarity')}
          className="px-3 py-2 rounded border border-gray-400"
        >
          <option value="id">Sort by ID</option>
          <option value="rarity">Sort by Rarity</option>
        </select>
        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Return home
        </button>
      </div>

      {/* Collection Cards */}
      <div className="grid grid-cols-6 gap-4">
        {filteredCards.map((card) => {
          const ownedCount = collection[card.id];
          const deckCount = deck.filter((c) => c.id === card.id).length;
          const canAdd = deckCount < Math.min(2, ownedCount);

          return (
            <div
              key={card.id}
              onClick={() => canAdd && addToDeck(card)}
              className={`cursor-pointer transition-transform hover:scale-105 ${
                canAdd ? '' : 'opacity-40 pointer-events-none'
              }`}
            >
              <CardImage card={card} size={{ width: 100, height: 140 }} />
              <p className="text-center text-xs mt-1">
                {deckCount}/{Math.min(2, ownedCount)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}





