import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to parse incoming JSON requests

// Routes
app.use('/api/auth', authRoutes);

app.use('/api/jobs', jobRoutes);


app.use('/api/applications', applicationRoutes);

app.use('/api/admin', adminRoutes);


// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Job Portal API is running smoothly!' });
});

// Database connection and server start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });