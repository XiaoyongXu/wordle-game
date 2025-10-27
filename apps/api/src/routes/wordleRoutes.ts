import { Router } from 'express';
import { createGame, submitGuess } from '../controllers/wordleController';

const router = Router();

router.post('/', createGame);

router.post('/:gameId/guesses', submitGuess);

export default router;