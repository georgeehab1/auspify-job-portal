import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

// Route to register a new user
// POST /api/auth/register
router.post('/register', registerUser);

// Route to login an existing user
// POST /api/auth/login
router.post('/login', loginUser);

export default router;