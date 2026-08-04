import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Helper function to generate a JWT token
// ADDED 'role' as a parameter and packed it into the token payload
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d', // The user will stay logged in for 30 days
  });
};

// ==========================================
// Register a new user
// POST /api/auth/register
// ==========================================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // 2. Create the new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'seeker', // Default to job seeker if no role is provided
    });

    // 3. Send back the user data along with their token
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role), // <-- UPDATED to pass the role
      });
    } else {
      res.status(400).json({ message: 'Invalid user data provided' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==========================================
// Authenticate a user (Login)
// POST /api/auth/login
// ==========================================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user in the database (we explicitly select the password because we hid it in the model)
    const user = await User.findOne({ email }).select('+password');

    // 2. Check if user exists AND the password matches
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role), // <-- UPDATED to pass the role
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};