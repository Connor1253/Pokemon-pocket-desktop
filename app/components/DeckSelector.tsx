// components/DeckSelector.tsx
'use client';

import React from 'react';
import { SavedDeck } from '../types/card';

interface DeckSelectorProps {
  savedDecks: SavedDeck[];
  selectedDeck: SavedDeck | null;
  onSelectDeck: (deck: SavedDeck | null) => void;
}

const DeckSelector: React.FC<DeckSelectorProps> = ({
  savedDecks,
  selectedDeck,
  onSelectDeck,
}) => (
  <div className="flex justify-center gap-4">
    <select
      className="px-4 py-2 border rounded"
      onChange={(e) => {
        const deck = savedDecks.find((d) => d.name === e.target.value) || null;
        onSelectDeck(deck);
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
);

export default DeckSelector;
