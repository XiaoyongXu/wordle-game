import type {
  GameStatus,
  LetterState,
  MultiplayerGameState,
  PlayerStats,
} from './api-client';
import { loadStats } from './statsService';

export type View = 'menu' | 'sp-game' | 'mp-menu' | 'mp-waiting' | 'mp-game';
export type GameMode = 'normal' | 'cheating' | 'multiplayer' | null;

export interface AppState {
  view: View;
  gameId: string | null;
  guesses: string[];
  results: LetterState[][];
  currentGuess: string;
  status: GameStatus | 'loading' | null;
  error: string | null;
  answer: string | null;
  gameMode: GameMode;
  roomId: string | null;
  mpWord: string;
  isJoiningRoom: boolean;
  roomIdInput: string;
  socket: WebSocket | null;
  playerId: string | null;
  mpGameState: MultiplayerGameState | null;
  stats: PlayerStats;
  isStatsModalOpen: boolean;
  wordLength: number;
  maxGuesses: number;
}

export const initialState: AppState = {
  view: 'menu',
  gameId: null,
  guesses: [],
  results: [],
  currentGuess: '',
  status: null,
  error: null,
  answer: null,
  gameMode: null,
  roomId: null,
  mpWord: '',
  isJoiningRoom: false,
  roomIdInput: '',
  socket: null,
  playerId: null,
  mpGameState: null,
  stats: loadStats(),
  isStatsModalOpen: false,
  wordLength: 5,
  maxGuesses: 6,
};

export type AppAction =
  | { type: 'SET_VIEW'; payload: View }
  | { type: 'SET_GAME_MODE'; payload: GameMode }
  | { type: 'START_SP_GAME'; payload: { gameMode: 'normal' | 'cheating' } }
  | {
      type: 'START_SP_GAME_SUCCESS';
      payload: { gameId: string; wordLength: number; maxGuesses: number };
    }
  | { type: 'GAME_API_ERROR'; payload: string }
  | {
      type: 'SUBMIT_SP_GUESS_SUCCESS';
      payload: {
        guesses: string[];
        results: LetterState[][];
        status: GameStatus;
        answer: string | null;
      };
    }
  | { type: 'UPDATE_CURRENT_GUESS'; payload: string }
  | { type: 'RESET_SP_GAME' }
  | { type: 'RESET_MP_GAME' }
  | { type: 'SET_MP_WORD'; payload: string }
  | { type: 'SET_IS_JOINING_ROOM'; payload: boolean }
  | { type: 'SET_ROOM_ID_INPUT'; payload: string }
  | { type: 'SET_ROOM_ID'; payload: string | null }
  | { type: 'SET_SOCKET'; payload: WebSocket | null }
  | { type: 'MP_CONNECTED'; payload: string }
  | { type: 'MP_GAME_UPDATE'; payload: MultiplayerGameState }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_STATS'; payload: PlayerStats }
  | { type: 'SET_STATS_MODAL_OPEN'; payload: boolean };

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, view: action.payload, error: null };
    case 'SET_GAME_MODE':
      return { ...state, gameMode: action.payload };
    case 'START_SP_GAME':
      return {
        ...state,
        status: 'loading',
        error: null,
        guesses: [],
        results: [],
        currentGuess: '',
        answer: null,
        gameMode: action.payload.gameMode,
      };
    case 'START_SP_GAME_SUCCESS':
      return {
        ...state,
        gameId: action.payload.gameId,
        wordLength: action.payload.wordLength,
        maxGuesses: action.payload.maxGuesses,
        view: 'sp-game',
        status: 'playing',
      };
    case 'GAME_API_ERROR':
      return { ...state, error: action.payload, status: null, gameMode: null };
    case 'SUBMIT_SP_GUESS_SUCCESS':
      return {
        ...state,
        error: null,
        guesses: action.payload.guesses,
        results: action.payload.results,
        status: action.payload.status,
        currentGuess: '',
        answer: action.payload.answer,
      };
    case 'UPDATE_CURRENT_GUESS':
      return { ...state, currentGuess: action.payload, error: null };
    case 'RESET_SP_GAME':
      return {
        ...initialState,
        stats: state.stats, // Preserve stats
      };
    case 'RESET_MP_GAME':
      return {
        ...initialState,
        stats: state.stats, // Preserve stats
        view: 'menu',
      };
    case 'SET_MP_WORD':
      return { ...state, mpWord: action.payload };
    case 'SET_IS_JOINING_ROOM':
      return { ...state, isJoiningRoom: action.payload };
    case 'SET_ROOM_ID_INPUT':
      return { ...state, roomIdInput: action.payload };
    case 'SET_ROOM_ID':
      return { ...state, roomId: action.payload };
    case 'SET_SOCKET':
      return { ...state, socket: action.payload };
    case 'MP_CONNECTED':
      return { ...state, playerId: action.payload };
    case 'MP_GAME_UPDATE':
      return { ...state, mpGameState: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_STATS_MODAL_OPEN':
      return { ...state, isStatsModalOpen: action.payload };
    default:
      return state;
  }
}