import { useRouter } from 'next/navigation';
import CardImage from './CardImage';

type Card = {
  id: string;
  name: string;
  rarity: string;
  number: string;
  setId: string;
};

type CollectionViewProps = {
  allCards: Card[];
  collection: { [id: string]: number };
  onBack: () => void;
};

export default function CollectionView({ allCards, collection, onBack }: CollectionViewProps) {
  const totalCards = 286;
  const router = useRouter();

  return (
    <>
      <button
        onClick={() => router.push('/decklist')}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
          Go to Deck Builder
      </button>
      <div className="grid grid-cols-5 gap-4 max-w-4xl mx-auto">
        {Array.from({ length: totalCards }, (_, i) => {
          const cardNumber = (i + 1).toString();
          const match = allCards.find(
            (c) => c.setId === 'A1' && c.number === cardNumber
          );

          if (match) {
            const ownedCount = collection[match.id] || 0;

            if (ownedCount > 0) {
              return (
                <div key={`${match.id}-${ownedCount}`} className="text-center">
                  <CardImage card={match} count={ownedCount} size={{ width: 100, height: 140 }} />
                </div>
              );
            } else {
              return (
                <div
                  key={`${match.id}-empty`}
                  className="w-[100px] h-[140px] bg-gray-800 rounded flex items-center justify-center text-gray-400 border border-gray-600 text-sm"
                >
                  #{match.number.padStart(3, '0')}
                </div>
              );
            }
          }

          // Placeholder for cards that don’t exist in data
          return (
            <div
              key={`empty-${i}`}
              className="w-[100px] h-[140px] bg-gray-900 rounded flex items-center justify-center text-gray-600 border border-gray-700 text-sm italic"
            >
              #{(i + 1).toString().padStart(3, '0')}
            </div>
          );
        })}
      </div>
    </>
  );
}

