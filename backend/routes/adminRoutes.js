import express from 'express';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// ==========================================
// Get Admin Stats & Data
// GET /api/admin/stats
// ==========================================
router.get('/stats', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Fetch full arrays of data for the admin to view
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    const jobs = await Job.find().sort({ createdAt: -1 });
    const applications = await Application.find()
      .populate('jobId', 'title company')
      .populate('applicantId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      stats: {
        totalUsers: users.length,
        totalSeekers: users.filter(u => u.role === 'seeker').length,
        totalEmployers: users.filter(u => u.role === 'employer').length,
        totalJobs: jobs.length,
        totalApplications: applications.length
      },
      users,
      jobs,
      applications
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching admin stats' });
  }
});

// ==========================================
// Delete a user (Admin only)
// DELETE /api/admin/users/:id
// ==========================================
router.delete('/users/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

export default router;