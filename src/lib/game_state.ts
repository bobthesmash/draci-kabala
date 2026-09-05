import { CharacterArchetype, ARCHETYPES } from '@/data/classes';
import { RollResult } from './drd_engine';

export interface TrapCheck {
  stat: 'SIL' | 'OBR' | 'ODL' | 'INT' | 'VUL';
  target: number;
  description: string;
}

export interface StoryMessage {
  id: string;
  sender: 'gm' | 'player' | 'system' | 'dice';
  text: string;
  imageUrl?: string;
  asciiArt?: string;
  rollResult?: RollResult;
  timestamp: number;
  checkRequired?: TrapCheck;
  choices?: string[];
}

export interface PlayerCharacter {
  name: string;
  archetypeId: string;
  archetypeTitle: string;
  sefiraAffinity: string;
  hp: number;
  maxHp: number;
  kavana: number;
  maxKavana: number;
  sparks: number; // Božské jiskry (Nicanot)
  stats: {
    sil: number;
    obr: number;
    odl: number;
    int: number;
    vul: number;
  };
  inventory: string[];
  currentSphereLevel: number; // 1 (Nahemoth) až 10 (Thaumiel)
}

export interface GameState {
  character: PlayerCharacter;
  messages: StoryMessage[];
  pendingCheck?: TrapCheck;
  currentChoices: string[];
  isThinking: boolean;
  gameStarted: boolean;
}

export const INITIAL_CHARACTER: PlayerCharacter = {
  name: 'Moše ze Safedu',
  archetypeId: ARCHETYPES[0].id,
  archetypeTitle: ARCHETYPES[0].title,
  sefiraAffinity: ARCHETYPES[0].sefiraAffinity,
  hp: ARCHETYPES[0].maxHp,
  maxHp: ARCHETYPES[0].maxHp,
  kavana: ARCHETYPES[0].maxKavana,
  maxKavana: ARCHETYPES[0].maxKavana,
  sparks: 0,
  stats: { ...ARCHETYPES[0].stats },
  inventory: [...ARCHETYPES[0].startingEquipment],
  currentSphereLevel: 1
};

export const STORAGE_KEY = 'draci_kabala_game_state_v1';

export function saveGameState(state: GameState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save game state to localStorage', e);
  }
}

export function loadGameState(): GameState | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as GameState;
  } catch (e) {
    console.error('Failed to load game state from localStorage', e);
    return null;
  }
}

export function clearSavedGame() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
