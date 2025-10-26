import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Room } from '../controllers/multiplayerController';
import { words as WORDS } from '../utils/wordsWith5Letters.json';

export const multiplayerGames = new Map<string, Room>();

const router = Router();

// Endpoint to create a new multiplayer room
router.post('/create', (req, res) => {
  const { word } = req.body;

  if (!word || word.length !== 5 || !WORDS.includes(word.toLowerCase())) {
    return res.status(400).json({ message: 'A valid 5-letter word is required.' });
  }

  const roomId = uuidv4().slice(0, 6); // A shorter, more shareable ID
  const room = new Room(roomId, WORDS);
  multiplayerGames.set(roomId, room);

  // Set the word that Player 2 will have to guess.
  room.setWordForPlayer2(word.toLowerCase());

  res.status(201).json({ roomId });
});

// Endpoint to join an existing multiplayer room
router.post('/join', (req, res) => {
  const { roomId, word } = req.body;

  if (!word || word.length !== 5 || !WORDS.includes(word.toLowerCase())) {
    return res.status(400).json({ message: 'A valid 5-letter word is required.' });
  }

  const room = multiplayerGames.get(roomId);
  if (!room) {
    return res.status(404).json({ message: 'Room not found.' });
  }

  if (room.players.size >= 2) {
    return res.status(400).json({ message: 'This room is already full.' });
  }

  // Set the word that Player 1 will have to guess.
  room.setWordForPlayer1(word.toLowerCase());

  res.status(200).json({ message: 'Room is valid. Establish WebSocket connection to start.' });
});

export default router;