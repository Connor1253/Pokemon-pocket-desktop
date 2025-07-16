'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import NavBar from '../components/NavBar';
import CardImage from '../components/CardImage';

type Card = {
  id: string;
  name: string;
  rarity: string;
  number: string;
  setId: string;
};

type SavedDeck = {
  name: string;
  cards: Card[];
  energyTypes?: string[];
};

export default function DeckList() {
  const router = useRouter();
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('savedDecks');
    if (saved) {
      setSavedDecks(JSON.parse(saved));
    }
  }, []);

  const maxDecks = 20;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <NavBar />

      <h1 className="text-3xl font-bold mb-6 text-center">Your Decks</h1>

      <div className="grid grid-cols-10 gap-4">
        {Array.from({ length: maxDecks }).map((_, i) => {
          const deck = savedDecks[i];

          return (
            <div
              key={i}
              onClick={() => {
                if (deck) {
                  // Edit existing deck by index
                  router.push(`/deckbuilder?editIndex=${i}`);
                } else {
                  // Create new deck
                  router.push('/deckbuilder');
                }
              }}
              className={`relative w-[100px] h-[140px] rounded cursor-pointer border ${
                deck ? 'border-gray-500' : 'border-gray-500 bg-gray-700 hover:bg-gray-600'
              } flex items-center justify-center`}
            >
              {deck ? (
                <>
                  <CardImage card={deck.cards[0]} size={{ width: 100, height: 140 }} />
                  <div className="absolute bottom-0 w-full bg-black bg-opacity-70 text-white text-xs py-1 px-1 truncate">
                    {deck.name}
                  </div>
                </>
              ) : (
                <span className="text-white text-4xl select-none">+</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}





