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