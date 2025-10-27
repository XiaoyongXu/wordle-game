import { useEffect } from 'react';
import type { AppAction } from '../state';

interface UseMultiplayerSocketOptions {
  roomId: string | null;
  dispatch: React.Dispatch<AppAction>;
}

/**
 * A custom hook to manage the WebSocket connection for multiplayer games.
 * It connects when a roomId is provided and handles incoming messages by
 * dispatching the appropriate state actions.
 */
export function useMultiplayerSocket({ roomId, dispatch }: UseMultiplayerSocketOptions) {
  useEffect(() => {
    // This effect manages the WebSocket connection.
    // It runs when the roomId changes.
    if (!roomId) {
      // If a socket existed and roomId is now null, it will be cleaned up
      // by the previous run's cleanup function.
      return;
    }

    // Connect to the WebSocket server
    const ws = new WebSocket(`ws://localhost:3001?roomId=${roomId}`);
    dispatch({ type: 'SET_SOCKET', payload: ws });

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'connected') {
        dispatch({ type: 'MP_CONNECTED', payload: message.playerId });
      } else if (message.type === 'game-update') {
        dispatch({ type: 'MP_GAME_UPDATE', payload: message.payload });
      } else if (message.type === 'game-start') {
        dispatch({ type: 'MP_GAME_UPDATE', payload: message.payload });
        dispatch({ type: 'SET_VIEW', payload: 'mp-game' });
      } else if (message.type === 'error') {
        dispatch({ type: 'SET_ERROR', payload: message.message });
      }
    };

    // Cleanup on unmount or when roomId changes
    return () => {
      dispatch({ type: 'SET_SOCKET', payload: null });
      ws.close();
    };
  }, [roomId, dispatch]);
}