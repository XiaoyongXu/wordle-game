const API_BASE_URL = 'http://localhost:3001';

export interface NewGameResponse {
  gameId: string;
  wordLength: number;
  maxGuesses: number;
}

export type LetterState = 'hit' | 'present' | 'miss';
export type GameStatus = 'playing' | 'win' | 'loss';

export interface GameStateResponse {
  id: string;
  guesses: string[];
  results: LetterState[][];
  status: GameStatus;
  answer?: string;
  // Only sent when game is over
}

export interface ErrorResponse {
  message: string;
}

export type GuessResponse = GameStateResponse | ErrorResponse;

export interface CreateRoomResponse {
  roomId: string;
}

export interface JoinRoomResponse {
  message: string;
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


export async function startNewGame(isCheating: boolean): Promise<NewGameResponse> {
  const response = await fetch(`${API_BASE_URL}/games`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isCheating }),
  });
  if (!response.ok) {
    throw new Error('Failed to start a new game.');
  }
  return response.json();
}

export async function submitGuess(
  gameId: string,
  guess: string
): Promise<GuessResponse> {
  const response = await fetch(`${API_BASE_URL}/games/${gameId}/guesses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guess }),
  });
  // The server sends detailed error messages, so we'll pass them along.
  return response.json();
}

export async function createMultiplayerGame(word: string): Promise<CreateRoomResponse> {
  const response = await fetch(`${API_BASE_URL}/multiplayer/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ word }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create room.');
  }
  return response.json();
}

export async function joinMultiplayerGame(roomId: string, word: string): Promise<JoinRoomResponse> {
  const response = await fetch(`${API_BASE_URL}/multiplayer/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ roomId, word }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to join room.');
  }
  return response.json();
}