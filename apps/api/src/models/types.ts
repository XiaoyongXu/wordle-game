export type LetterState = 'hit' | 'present' | 'miss';
export type GameStatus = 'playing' | 'win' | 'loss';

export interface IGuessResult {
  guess: string;
  score: LetterState[];
}

export interface GameStateResponse {
  guesses: string[];
  results: LetterState[][];
  status: GameStatus;
  answer?: string;
}

export type MatchStatus = 'waiting' | 'playing' | 'finished';

export interface PlayerState {
  id: string;
  guesses: string[];
  results: LetterState[][];
  status: GameStatus;
  answer?: string;
}

export interface MultiplayerGameState {
  roomId: string;
  status: MatchStatus;
  players: PlayerState[];
  gameType: 'race' | 'head-to-head';
}