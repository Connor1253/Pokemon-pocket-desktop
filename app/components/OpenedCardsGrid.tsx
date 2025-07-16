// /components/OpenedCardsGrid.tsx
import CardImage from './CardImage';

type Card = {
  id: string;
  name: string;
  rarity: string;
  number?: string;
  setId?: string;
};

type OpenedCardsGridProps = {
  cards: Card[];
};

export default function OpenedCardsGrid({ cards }: OpenedCardsGridProps) {
  return (
    <div className="grid grid-cols-5 gap-4 mt-6">
      {cards.map((card, index) => (
        <div key={`${card.id}-${index}`} className="text-center">
          <CardImage card={card} />
        </div>
      ))}
    </div>
  );
}
