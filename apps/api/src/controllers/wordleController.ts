import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { WordleGame } from '../models/wordleGame';
import { words as WORDS } from '../utils/wordsWith5Letters.json';

const games = new Map<string, WordleGame>();

export const createGame = (req: Request, res: Response) => {
  try {
    // 1. Get configurable settings from request body
    const MAX_GUESSES = 6;
    const { isCheating = false } = req.body; // Default to false if not provided

    // 2. Create new game instance
    const game = new WordleGame(WORDS, MAX_GUESSES, isCheating ?? false);
    const gameId = uuidv4();

    // 3. Store the game session
    games.set(gameId, game);

    // 4. Send response to client
    res.status(200).json({
      gameId: gameId,
      wordLength: game.wordLength,
      maxGuesses: game.maxGuesses,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to start a new game.' });
  }
};

export const submitGuess = (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { guess } = req.body;

    // 1. Find the game session
    const game = games.get(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found. Please start a new game.' });
    }

    // 3. Submit the guess to the game engine
    game.submitGuess(guess);

    // 4. Get the updated state and send it to the client
    res.status(200).json(game.getGameState(gameId));
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};