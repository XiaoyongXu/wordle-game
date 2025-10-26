import type { WebSocket } from 'ws';
import { WordleGame } from './wordleController';

/**
* Represents a player in a multiplayer room.
*/
export class Player {
  public readonly id: string;
  public game: WordleGame;
  public ws: WebSocket;

  constructor(id: string, ws: WebSocket, opponentWord: string, wordList: string[]) {
    this.id = id;
    this.ws = ws;
    // Each player's game is an instance of WordleGame with the opponent's word.
    this.game = new WordleGame(wordList, 6, false, opponentWord);
  }
}

/**
* Represents a multiplayer game room.
*/
export class Room {
  public readonly id: string;
  public players: Map<string, Player> = new Map();

  // The word provided by the first player, to be used by the second.
  private wordForPlayer2: string;
  private wordForPlayer1: string;
  private wordList: string[];

  constructor(id: string, wordList: string[]) {
    this.id = id;
    this.wordList = wordList;
    this.wordForPlayer1 = '';
    this.wordForPlayer2 = '';
  }

  public setWordForPlayer2(word: string) {
    this.wordForPlayer2 = word;
  }

  public setWordForPlayer1(word: string) {
    this.wordForPlayer1 = word;
  }

  /**
  * Adds the first player (creator) to the room.
  */
  addPlayer1(playerId: string, ws: WebSocket) {
    // Player 1's game cannot be fully initialized yet, so we create a placeholder.
    // The word 'PENDING' is temporary and will be replaced.
    const player = new Player(playerId, ws, 'PENDING', this.wordList);
    this.players.set(playerId, player);
  }

  /**
  * Adds the second player (joiner) and finalizes the room setup.
  */
  addPlayer2(playerId: string, ws: WebSocket) {
    if (this.players.size !== 1 || !this.wordForPlayer1 || !this.wordForPlayer2) {
      throw new Error("Room is not in a valid state to add a second player.");
    }

    // 1. Finalize Player 1's game instance with the word provided by Player 2.
    const player1 = this.players.values().next().value;
    if (!player1) {
      throw new Error("Could not find the original player in the room.");
    }
    player1.game = new WordleGame(this.wordList, 6, false, this.wordForPlayer1);

    // 2. Create Player 2's game instance with the word provided by Player 1.
    const player2 = new Player(playerId, ws, this.wordForPlayer2, this.wordList);
    this.players.set(playerId, player2);
  }
}
