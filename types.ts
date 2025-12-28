export interface Player {
  id: string;
  name: string;
  isChameleon: boolean;
  score: number;
}

export interface Card {
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Champion';
  elixir: number;
  imageUrl?: string;
}

export type GamePhase = 
  | 'SETUP' 
  | 'LOADING' 
  | 'REVEAL_INTERSTITIAL' 
  | 'REVEAL_INFO' 
  | 'PLAYING' 
  | 'VOTING' 
  | 'GAME_OVER';

export type GameMode = 'classic' | 'impostor';

export interface GameState {
  players: Player[];
  currentPlayerIndex: number; // For reveal phase
  boardCards: Card[];
  secretCard: Card | null;
  phase: GamePhase;
  round: number;
  starterPlayerId: string;
  gameMode?: GameMode;
  hideBoard?: boolean;
  chameleonCard?: Card | null; // For impostor mode - the fake card shown to chameleon
}
