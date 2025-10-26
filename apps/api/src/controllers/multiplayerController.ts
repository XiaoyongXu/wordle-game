import type { WebSocket } from 'ws';
import { WordleGame } from './wordleController';

/**
* Represents a player in a multiplayer room.
*/
export class Player {
  public readonly id: string;
  public game: WordleGame;
  public ws: WebSocket;

  constructor(id: string, ws: WebSocket, opponentWord: string | undefined, wordList: string[]) {
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
  private wordForPlayer2: string | null;
  private wordForPlayer1: string | null;
  private wordList: string[];
  public gameType: 'race' | 'head-to-head' | 'pending' = 'pending';

  constructor(id: string, wordList: string[]) {
    this.id = id;
    this.wordList = wordList;
    // Initialize as null to be explicit
    this.wordForPlayer1 = null;
    this.wordForPlayer2 = null;
  }

  private selectRandomWord(): string {
    const index = Math.floor(Math.random() * this.wordList.length);
    return this.wordList[index];
  }

  public setWordForPlayer2(word: string | null) {
    this.wordForPlayer2 = word;
  }

  public setWordForPlayer1(word: string | null) {
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
    if (this.players.size !== 1) {
      throw new Error("Room is not in a valid state to add a second player.");
    }

    let answerForP1: string | undefined;
    let answerForP2: string | undefined;

    if (this.wordForPlayer1 && this.wordForPlayer2) {
      // Scenario 1: Both players provided words (Head-to-Head)
      answerForP1 = this.wordForPlayer1;
      answerForP2 = this.wordForPlayer2;
      this.gameType = 'head-to-head';
    } else if (!this.wordForPlayer1 && !this.wordForPlayer2) {
      // Scenario 2: Neither player provided a word (Race Mode)
      const sharedWord = this.selectRandomWord();
      answerForP1 = sharedWord;
      answerForP2 = sharedWord;
      this.gameType = 'race';
    } else {
      // Scenario 3: One player provided a word
      // The word for Player 1 to guess is the one provided by Player 2.
      // If Player 2 provided nothing, this will be undefined, and WordleGame will pick a random word.
      answerForP1 = this.wordForPlayer1 ?? undefined;
      // The word for Player 2 to guess is the one provided by Player 1.
      answerForP2 = this.wordForPlayer2 ?? undefined;
      this.gameType = 'head-to-head';
    }

    const player1 = this.players.values().next().value;
    if (!player1) {
      throw new Error("Could not find the original player in the room.");
    }
    player1.game = new WordleGame(this.wordList, 6, false, answerForP1);

    const player2 = new Player(playerId, ws, answerForP2, this.wordList);
    this.players.set(playerId, player2);
  }
}
