import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { multiplayerGames } from './routes/multiplayerRoutes';
import { PlayerState, MultiplayerGameState, MatchStatus } from './models/types';
import { Room } from './controllers/multiplayerController';

export function initializeWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket, req) => {
    // Expected URL: ws://.../?roomId=...
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const roomId = url.searchParams.get('roomId');

    if (!roomId) {
      ws.send(JSON.stringify({ type: 'error', message: 'Room ID is required.' }));
      ws.close();
      return;
    }

    const room = multiplayerGames.get(roomId);
    if (!room) {
      ws.send(JSON.stringify({ type: 'error', message: 'Room not found.' }));
      ws.close();
      return;
    }

    const playerId = uuidv4();
    // Immediately send the newly connected client their unique ID.
    // The client needs this to identify itself in the game state.
    ws.send(JSON.stringify({ type: 'connected', playerId }));

    try {
      if (room.players.size === 0) {
        // This is the first player (creator)
        room.addPlayer1(playerId, ws);
        // The client will now wait for the 'game-start' event.
        ws.send(JSON.stringify({ type: 'waiting', message: 'Waiting for opponent...' }));
      } else if (room.players.size === 1) {
        // This is the second player (joiner)
        room.addPlayer2(playerId, ws);

        // Both players are in, start the game and notify both.
        broadcastGameState(room);
      } else {
        ws.send(JSON.stringify({ type: 'error', message: 'Room is full.' }));
        ws.close();
      }
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: (error as Error).message }));
      ws.close();
    }

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === 'guess' && room) {
          const player = room.players.get(playerId);
          if (player) {
            try {
              // Process the guess using the player's game instance
              player.game.submitGuess(data.payload.guess);
              // If successful, broadcast the updated state to everyone
              broadcastGameState(room, 'game-update');
            } catch (err) {
              // If the guess is invalid, send an error message back only to the sender.
              ws.send(JSON.stringify({ type: 'error', message: (err as Error).message }));
            }
          }
        }
      } catch (error) {
        console.error('Failed to process message or broadcast game state:', error);
      }
    });

    ws.on('close', () => {
      // Handle player disconnection (optional, but good practice)
      console.log(`Player ${playerId} disconnected from room ${roomId}`);
      // You could add logic here to notify the other player.
    });
  });
}

/**
* Constructs the full game state and sends it to all players in the room.
*/
function broadcastGameState(room: Room, type: 'game-start' | 'game-update' = 'game-start') {
  const playerStates: PlayerState[] = [];
  for (const player of room.players.values()) {
    const gameState = player.game.getGameState(player.id);
    playerStates.push({
      id: player.id,
      guesses: gameState.guesses,
      results: gameState.results,
      status: gameState.status,
      answer: gameState.answer,
    });
  }

  // Determine the overall match status
  const isFinished = playerStates.every(p => p.status === 'win' || p.status === 'loss');
  const matchStatus: MatchStatus = isFinished ? 'finished' : 'playing';

  const multiplayerState: MultiplayerGameState = {
    roomId: room.id,
    status: matchStatus,
    players: playerStates,
  };

  const message = JSON.stringify({
    type: type,
    payload: multiplayerState,
  });

  for (const player of room.players.values()) {
    if (player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(message);
    }
  }
}