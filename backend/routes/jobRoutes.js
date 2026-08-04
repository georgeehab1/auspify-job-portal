import express from 'express';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// ==========================================
// 1. Get all jobs (For Job Seekers & General Feed)
// GET /api/jobs
// ==========================================
router.get('/', protect, async (req, res) => {
  try {
    // This fetches all active jobs and sends them to the seeker dashboard
    const jobs = await Job.find({ status: 'Active' }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs for feed:', error);
    res.status(500).json({ message: 'Server error fetching jobs' });
  }
});

// ==========================================
// 2. Create a Job
// POST /api/jobs
// ==========================================
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Access denied. Only employers can post jobs.' });
    }

    const newJob = new Job({
      ...req.body,
      employerId: req.user.id 
    });

    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while creating job' });
  }
});

// ==========================================
// 3. Get Employer Dashboard Data
// GET /api/jobs/employer-dashboard
// ==========================================
router.get('/employer-dashboard', protect, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Employer access required' });
    }

    // FIXED: Changed "employer" to "employerId" to match your Job.js schema perfectly
    const jobs = await Job.find({ employerId: req.user._id || req.user.id }).sort({ createdAt: -1 });
    const jobIds = jobs.map(job => job._id);

    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('jobId', 'title location')
      .populate('applicantId', 'name email')
      .sort({ createdAt: -1 });

    const stats = {
      activePostings: jobs.length,
      totalApplicants: applications.length,
      acceptedCandidates: applications.filter(app => app.status === 'Accepted').length
    };

    const jobsWithCounts = jobs.map(job => {
      const applicantCount = applications.filter(app => app.jobId && app.jobId._id.toString() === job._id.toString()).length;
      return { ...job.toObject(), applicantCount };
    });

    res.json({ 
      stats, 
      jobs: jobsWithCounts, 
      applications 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching employer data' });
  }
});

// ==========================================
// 4. Delete a Job
// DELETE /api/jobs/:id
// ==========================================
router.delete('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employerId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to delete this job' });
    }

    await job.deleteOne();
    res.json({ message: 'Job removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting job' });
  }
});

export default router;