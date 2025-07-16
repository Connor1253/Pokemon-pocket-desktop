import Image from 'next/image';
import { getRarityIconUrl } from '../utils/cardUtils';

type Card = {
  id: string;
  name: string;
  rarity: string;
};

type CardImageProps = {
  card: Card;
  count?: number;
  size?: { width: number; height: number };
  showRarity?: boolean;
};

export default function CardImage({
  card,
  count,
  size = { width: 140, height: 196 },
  showRarity = true,
}: CardImageProps) {
  return (
    <div className="flex flex-col items-center">
      <Image
        src={`https://static.dotgg.gg/pokepocket/card/${card.id}.webp`}
        alt={card.name}
        width={size.width}
        height={size.height}
        className="rounded shadow-lg mx-auto"
      />
      {showRarity && (
        <div className="mt-1 flex justify-center items-center gap-1 text-sm text-gray-200">
          <Image src={getRarityIconUrl(card.rarity)} alt={card.rarity} width={16} height={16} />
          {card.rarity}
        </div>
      )}
      {count && <div className="text-xs text-gray-400">x{count}</div>}
    </div>
  );
}



