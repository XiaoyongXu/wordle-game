import { Router } from 'express';
import { createRoom, joinRoom } from '../controllers/multiplayerController';

const router = Router();

// Endpoint to create a new multiplayer room
router.post('/create', createRoom);

// Endpoint to join an existing multiplayer room
router.post('/join', joinRoom);

export default router;