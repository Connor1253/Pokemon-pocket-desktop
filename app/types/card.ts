export type Card = {
    id: string;
    name: string;
    rarity: string;
    number: string;
    setId: string;
    stage?: string; // 'Basic', 'Stage 1', 'Stage 2' etc.
    prew_stage_name?: string; // previous evolution name from JSON
  };
  
  export type SavedDeck = {
    name: string;
    cards: Card[];
    energyTypes?: string[];
  };