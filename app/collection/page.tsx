'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import NavBar from '../components/NavBar';
import CollectionView from '../components/CollectionView';

type Card = {
  id: string;
  name: string;
  rarity: string;
  dex: string;
  number: string;
  setId: string;
};

type Collection = { [id: string]: number };

export default function CollectionPage() {
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [collection, setCollection] = useState<Collection>({});
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    fetch('/data/cards.json')
      .then((res) => res.json())
      .then((data) => {
        const cardsArray: Card[] = [];

        for (const id in data) {
          cardsArray.push(data[id]);
        }

        setAllCards(cardsArray);

        const savedCollection = localStorage.getItem('collection');
        if (savedCollection) {
          setCollection(JSON.parse(savedCollection));
        }

        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Loading collection...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <NavBar />
      <CollectionView
        allCards={allCards}
        collection={collection}
        onBack={() => router.push('/packopener')}
      />
    </div>
  );
}

