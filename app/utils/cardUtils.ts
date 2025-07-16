// /utils/cardUtils.ts

export const rarityChances4 = [
    { rarity: 'Crown Rare', chance: 0.0004 },
    { rarity: 'Immersive Rare', chance: 0.00222 },
    { rarity: 'Special Art Rare', chance: 0.005 },
    { rarity: 'Super Rare', chance: 0.005 },
    { rarity: 'Art Rare', chance: 0.02572 },
    { rarity: 'Double Rare', chance: 0.01666 },
    { rarity: 'Rare', chance: 0.05 },
    { rarity: 'Uncommon', chance: 0.9 },
  ];
  
  export const rarityChances5 = [
    { rarity: 'Crown Rare', chance: 0.0016 },
    { rarity: 'Immersive Rare', chance: 0.00888 },
    { rarity: 'Special Art Rare', chance: 0.02 },
    { rarity: 'Super Rare', chance: 0.02 },
    { rarity: 'Art Rare', chance: 0.10288 },
    { rarity: 'Double Rare', chance: 0.06664 },
    { rarity: 'Rare', chance: 0.2 },
    { rarity: 'Uncommon', chance: 0.6 },
  ];
  
  export function getRarity(chances: { rarity: string; chance: number }[]) {
    const rand = Math.random();
    let total = 0;
    for (const item of chances) {
      total += item.chance;
      if (rand <= total) return item.rarity;
    }
    return 'Uncommon';
  }
  
  export function pickRandom<T>(arr: T[], count = 1): T[] {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
  
  export function getRandomCardOfRarity(cards: Card[], rarity: string): Card | null {
    const filtered = cards.filter((c) => c.rarity === rarity);
    if (filtered.length === 0) return null;
    return filtered[Math.floor(Math.random() * filtered.length)];
  }
  
  export function getRarityIconUrl(rarity: string): string {
    if (rarity === 'Crown Rare') return 'https://static.dotgg.gg/pokepocket/icons/UltraRare.png';
    return `https://static.dotgg.gg/pokepocket/icons/${rarity.replace(/\s+/g, '')}.png`;
  }
  