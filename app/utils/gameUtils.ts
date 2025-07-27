// utils/gameUtils.ts
import { Card } from '../types/card';

export type BoardSlot = {
  card: Card;
  placedTurn: number;
  energy: number;
  currentHp?: number;
} | null;

export const normalizeStage = (stage?: string) =>
  (stage ?? 'Basic').toLowerCase().replace(/\s+/g, '');

export const canPlaceCardAtSlot = (
  newCard: Card,
  slot: BoardSlot | null,
  currentTurn: number
): boolean => {
  const newStage = normalizeStage(newCard.stage);

  if (!slot) {
    if (newStage !== 'basic') return false;
    return true;
  }

  const existingCard = slot.card;
  const existingTurn = slot.placedTurn;

  if (newCard.prew_stage_name !== existingCard.name) return false;
  if (currentTurn - existingTurn < 1) return false;

  return true;
};

export const getRandomEnergyUrl = (energyTypes: string[]): string => {
  const energyTypeMap: { [key: string]: string } = {
    darkness: 'darkness',
    fire: 'fire',
    water: 'water',
    grass: 'grass',
    lightning: 'lightning',
    psychic: 'psychic',
    fighting: 'fighting',
    metal: 'metal',
    dragon: 'dragon',
    fairy: 'fairy',
    colorless: 'colorless',
  };

  const randomEnergy = energyTypes[Math.floor(Math.random() * energyTypes.length)].toLowerCase();

  const matchedType = Object.keys(energyTypeMap).find((type) =>
    randomEnergy.includes(type)
  );

  return `https://static.dotgg.gg/pokemon/icons/${
    matchedType ? energyTypeMap[matchedType] : 'colorless'
  }.png`;
  
  
};
