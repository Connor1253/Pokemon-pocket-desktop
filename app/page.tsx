'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import NavBar from './components/NavBar';
import OpenedCardsGrid from './components/OpenedCardsGrid';
import {
  rarityChances4,
  rarityChances5,
  getRarity,
  pickRandom,
  getRandomCardOfRarity,
} from './utils/cardUtils';

// Types
type Card = {
  id: string;
  name: string;
  rarity: string;
  dex: string;
  number: string;
  setId: string;
};

type Collection = { [id: string]: number };
type PackKey = 'A1_1' | 'A1_2' | 'A1_3';

export default function PackOpener() {
  const router = useRouter();

  const [cardsBySet, setCardsBySet] = useState<{ [key: string]: Card[] }>({});
  const [openedCards, setOpenedCards] = useState<Card[]>([]);
  const [collection, setCollection] = useState<Collection>({});
  const [loading, setLoading] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [showCarousel, setShowCarousel] = useState(false);

  const packKeys: PackKey[] = ['A1_1', 'A1_2', 'A1_3'];

  useEffect(() => {
    fetch('/data/cards.json')
      .then((res) => res.json())
      .then((data) => {
        const grouped: { [key: string]: Card[] } = {
          A1_1: [],
          A1_2: [],
          A1_3: [],
        };

        for (const id in data) {
          const card = data[id];
          const dexList = card.dex.split(',').map((d: string) => d.trim().toUpperCase());
          for (const dex of dexList) {
            if (grouped[dex]) {
              grouped[dex].push(card);
            }
          }
        }

        setCardsBySet(grouped);

        const saved = localStorage.getItem('collection');
        if (saved) setCollection(JSON.parse(saved));

        setLoading(false);
      });
  }, []);

  const openPack = (setKey: PackKey) => {
    const cards = cardsBySet[setKey] || [];
    const commons = cards.filter((c) => c.rarity === 'Common');
    const pulls: Card[] = [];

    pulls.push(...pickRandom(commons, 3));

    const rarity4 = getRarity(rarityChances4);
    const card4 = getRandomCardOfRarity(cards, rarity4);
    if (card4) pulls.push(card4);

    const rarity5 = getRarity(rarityChances5);
    const card5 = getRandomCardOfRarity(cards, rarity5);
    if (card5) pulls.push(card5);

    setOpenedCards(pulls);

    setCollection((prev) => {
      const updated = { ...prev };
      pulls.forEach((c) => {
        updated[c.id] = (updated[c.id] || 0) + 1;
      });
      localStorage.setItem('collection', JSON.stringify(updated));
      return updated;
    });
  };

  const rotateLeft = () => setRotation((prev) => prev + 120);
  const rotateRight = () => setRotation((prev) => prev - 120);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />

      <div className="max-w-5xl mx-auto p-6 pt-24 flex flex-col items-center space-y-10">

        {!showCarousel ? (
          // The preview box showing all 3 packs side by side inside a clickable box
          <div
            onClick={() => setShowCarousel(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') setShowCarousel(true); }}
            className="cursor-pointer select-none rounded-xl shadow-lg bg-white p-6 flex gap-6 items-center justify-center hover:shadow-xl transition-shadow max-w-[800px]"
            aria-label="Click to open pack carousel"
          >
            {packKeys.map((setKey) => (
              <Image
                key={setKey}
                src={`https://static.dotgg.gg/pokepocket/set-logo/${setKey}.webp`}
                alt={`Pack ${setKey}`}
                width={160}
                height={213}
                className="rounded-lg shadow-md"
                draggable={false}
              />
            ))}
          </div>
        ) : (
          <>
            {/* Carousel */}
            <div className="relative w-[300px] h-[360px] [perspective:1000px]">
              <div
                className="relative w-full h-full transition-transform duration-700 ease-in-out [transform-style:preserve-3d]"
                style={{ transform: `rotateY(${rotation}deg)` }}
              >
                {packKeys.map((setKey, i) => (
                  <div
                    key={setKey}
                    className="absolute w-[240px] h-[320px] top-0 left-1/2 -translate-x-1/2"
                    style={{
                      transform: `rotateY(${i * 120}deg) translateZ(400px)`,
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <button
                      onClick={() => openPack(setKey)}
                      className="w-full h-full p-0 m-0 bg-transparent border-none cursor-pointer"
                      aria-label={`Open pack ${setKey}`}
                      type="button"
                    >
                      <Image
                        src={`https://static.dotgg.gg/pokepocket/set-logo/${setKey}.webp`}
                        alt={setKey}
                        width={240}
                        height={320}
                        className="rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
                        draggable={false}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
              <button
                onClick={rotateLeft}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition"
                aria-label="Rotate Left"
                type="button"
              >
                ←
              </button>
              <button
                onClick={rotateRight}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition"
                aria-label="Rotate Right"
                type="button"
              >
                →
              </button>
              <button
                onClick={() => router.push('/collection')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition"
                type="button"
              >
                View Collection
              </button>
              <button
                onClick={() => setShowCarousel(false)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                type="button"
              >
                Close Carousel
              </button>
            </div>

            <p className="text-sm text-gray-500">Click a pack to open cards</p>

            <div className="w-full">
              <OpenedCardsGrid cards={openedCards} />
            </div>
          </>
        )}

      </div>
    </div>
  );
}



