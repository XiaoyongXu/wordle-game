import { useCallback, useEffect, useMemo } from 'react';
import type { AppAction, AppState } from '../state';
import type { LetterState } from '../api-client';
import { useGameActions } from './useGameActions';
import { useKeyboardInput } from './useKeyboardInput';
import { useMultiplayerSocket } from './useMultiplayerSocket';
import { saveStats, updateStats } from '../statsService';

/**
 * A comprehensive "controller" hook that encapsulates all game logic,
 * derived state, and effects. It acts as the primary interface between
 * the raw application state and the UI components.
 *
 * @param state - The current application state from the reducer.
 * @param dispatch - The dispatch function from the reducer.
 * @returns An object containing all derived data and action handlers needed by the UI.
 */
export function useGameController(
  state: AppState,
  dispatch: React.Dispatch<AppAction>
) {
  const {
    view,
    status,
    mpGameState,
    playerId,
    currentGuess,
    wordLength,
    socket,
    guesses,
    roomId,
    results,
    stats,
  } = state;

  // Get base action handlers
  const { handleGuessSubmit, ...actions } = useGameActions(state, dispatch);

  // Initialize effect hooks
  useMultiplayerSocket({ roomId, dispatch });

  // Memoize whether the game is in a state to accept input
  const isGameActive = useMemo(() => {
    const isSpPlaying = view === 'sp-game' && status === 'playing';
    const myMpPlayer = mpGameState?.players.find((p) => p.id === playerId);
    const isMpPlaying = view === 'mp-game' && myMpPlayer?.status === 'playing';
    return isSpPlaying || isMpPlaying;
  }, [view, status, mpGameState, playerId]);

  // Encapsulate the key press logic
  const handleVirtualKeyPress = useCallback(
    (key: string) => {
      if (!isGameActive) return;

      if (key === 'ENTER') {
        if (currentGuess.length === wordLength) {
          if (view === 'sp-game') {
            handleGuessSubmit();
          } else if (view === 'mp-game' && socket) {
            socket.send(
              JSON.stringify({
                type: 'guess',
                payload: { guess: currentGuess.toLowerCase() },
              })
            );
            dispatch({ type: 'UPDATE_CURRENT_GUESS', payload: '' });
          }
        }
      } else if (key === 'BACKSPACE') {
        dispatch({
          type: 'UPDATE_CURRENT_GUESS',
          payload: currentGuess.slice(0, -1),
        });
      } else if (currentGuess.length < wordLength && /^[a-zA-Z]$/.test(key)) {
        dispatch({
          type: 'UPDATE_CURRENT_GUESS',
          payload: currentGuess + key.toUpperCase(),
        });
      }
    },
    [isGameActive, currentGuess, wordLength, view, handleGuessSubmit, socket, dispatch]
  );

  // Initialize keyboard input listener
  useKeyboardInput({ isGameActive, onKeyPress: handleVirtualKeyPress });

  // Encapsulate the stats-updating effect
  useEffect(() => {
    if (view === 'sp-game' && (status === 'win' || status === 'loss')) {
      const newStats = updateStats(stats, status === 'win', guesses.length);
      dispatch({ type: 'SET_STATS', payload: newStats });
      saveStats(newStats);
      setTimeout(() => dispatch({ type: 'SET_STATS_MODAL_OPEN', payload: true }), 1500);
    }
  }, [status, view, guesses.length, stats, dispatch]);

  // Memoize the sorted player list
  const sortedPlayers = useMemo(() => {
    return mpGameState?.players.slice().sort((a, b) => {
      if (a.id === playerId) return -1;
      if (b.id === playerId) return 1;
      return 0;
    });
  }, [mpGameState, playerId]);

  // Memoize the keyboard key states
  const keyStates = useMemo(() => {
    const states: { [key: string]: LetterState } = {};
    const relevantResults = view === 'sp-game' ? results : (mpGameState?.players.find(p => p.id === playerId)?.results || []);
    const relevantGuesses = view === 'sp-game' ? guesses : (mpGameState?.players.find(p => p.id === playerId)?.guesses || []);

    for (let i = 0; i < relevantResults.length; i++) {
      for (let j = 0; j < relevantResults[i].length; j++) {
        const char = relevantGuesses[i][j];
        const result = relevantResults[i][j];
        if (states[char] === 'hit' || (states[char] === 'present' && result !== 'hit')) continue;
        states[char] = result;
      }
    }
    return states;
  }, [results, mpGameState, playerId, view, guesses]);

  return {
    ...actions,
    isGameActive,
    handleVirtualKeyPress,
    sortedPlayers,
    keyStates,
  };
}