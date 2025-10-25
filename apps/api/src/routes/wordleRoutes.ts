import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { WordleGame } from '../controllers/wordleController';
// The list of 5-letter words is sourced from:
// https://darkermango.github.io/5-Letter-words/words.json
import { words as WORDS } from '../utils/wordsWith5Letters.json'

const games = new Map<string, WordleGame>();

const router = Router();

router.post('/',(req, res) => {
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
})


router.post('/:gameId/guesses', (req, res) => {
  try {
    const { gameId } = req.params;
    const { guess } = req.body;

    // 1. Find the game session
    const game = games.get(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found. Please start a new game.' });
    }

    // 2. Client must not know the answer
    // (This is guaranteed as `game` only exists on the server)

    // 3. Submit the guess to the game engine
    // The WordleGame class will throw an error if the guess is invalid
    game.submitGuess(guess);

    // 4. Get the updated state and send it to the client
    const state = game.getGameState(gameId);
    res.status(200).json(state);

  } catch (err) {
    // Handle errors thrown by game.submitGuess (e.g., "Game is over")
    // This provides the specific error message to the React client
    res.status(400).json({ message: (err as Error).message });
  }
});

export default router;