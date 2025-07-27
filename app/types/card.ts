export type Card = {
  id: string;
  name: string;
  rarity: string;
  number: string;
  setId: string;
  stage?: string;
  prew_stage_name?: string;
  hp?: string;
  attack?: {
    info: string;
    effect: string;
    cost?: string;
    name?: string;
    damage?: string;
  }[];
  weakness?: string;
  retreat?: string;
};

  
  export type SavedDeck = {
    name: string;
    cards: Card[];
    energyTypes?: string[];
  };