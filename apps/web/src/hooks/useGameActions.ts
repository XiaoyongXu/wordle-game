import { useCallback } from 'react';
import type { AppAction, AppState } from '../state';
import {
  createMultiplayerGame,
  joinMultiplayerGame,
  startNewGame,
  submitGuess,
} from '../api-client';

/**
 * A custom hook that encapsulates all game-related actions and API calls.
 * It centralizes the logic for starting games, handling rooms, and submitting guesses.
 *
 * @param state - The current application state from the reducer.
 * @param dispatch - The dispatch function from the reducer to update the state.
 * @returns An object containing all the handler functions for game actions.
 */
export function useGameActions(
  state: AppState,
  dispatch: React.Dispatch<AppAction>
) {
  const {
    gameId,
    currentGuess,
    mpWord,
    roomIdInput,
  } = state;

  const handleNewGame = useCallback(
    async (isCheating: boolean) => {
      dispatch({
        type: 'START_SP_GAME',
        payload: { gameMode: isCheating ? 'cheating' : 'normal' },
      });
      try {
        const newGame = await startNewGame(isCheating);
        dispatch({ type: 'START_SP_GAME_SUCCESS', payload: newGame });
      } catch (err) {
        console.log(err)
        dispatch({
          type: 'GAME_API_ERROR',
          payload: 'Failed to start a new game. Please try again.',
        });
      }
    },
    [dispatch]
  );

  const handleCreateRoom = useCallback(async () => {
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const { roomId } = await createMultiplayerGame(mpWord.toLowerCase());
      dispatch({ type: 'SET_ROOM_ID', payload: roomId });
      dispatch({ type: 'SET_VIEW', payload: 'mp-waiting' });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
    }
  }, [dispatch, mpWord]);

  const handleJoinRoom = useCallback(async () => {
    dispatch({ type: 'SET_ERROR', payload: null });
    if (!roomIdInput) return;
    try {
      // First, validate the room via HTTP
      await joinMultiplayerGame(roomIdInput, mpWord.toLowerCase());
      // If successful, set the real roomId to trigger the WebSocket connection
      dispatch({ type: 'SET_ROOM_ID', payload: roomIdInput });
      dispatch({ type: 'SET_VIEW', payload: 'mp-waiting' });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
    }
  }, [dispatch, roomIdInput, mpWord]);

  const handleGuessSubmit = useCallback(async () => {
    if (!gameId) return;
    const response = await submitGuess(gameId, currentGuess);
    // This "in" check is a type guard.
    if ('message' in response) {
      dispatch({ type: 'SET_ERROR', payload: response.message });
      return;
    }
    dispatch({
      type: 'SUBMIT_SP_GUESS_SUCCESS',
      payload: { ...response, answer: response.answer ?? null },
    });
  }, [dispatch, gameId, currentGuess]);

  return {
    handleNewGame,
    handleCreateRoom,
    handleJoinRoom,
    handleGuessSubmit,
  };
}