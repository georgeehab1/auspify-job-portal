import express from 'express';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// ==========================================
// Apply for a job
// POST /api/applications
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'seeker') {
      return res.status(403).json({ message: 'Only job seekers can apply for jobs.' });
    }

    // Extract the new fields from the request body
    const { jobId, resumeLink, coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const newApplication = new Application({
      jobId,
      applicantId: req.user.id,
      employerId: job.employerId,
      resumeLink,    // Save the CV link
      coverLetter    // Save the cover letter
    });

    const savedApplication = await newApplication.save();
    res.status(201).json(savedApplication);

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error while submitting application' });
  }
});

// ==========================================
// Get applications for a specific user (Seeker or Employer)
// GET /api/applications
// ==========================================
router.get('/', protect, async (req, res) => {
  try {
    let applications;
    
    if (req.user.role === 'employer') {
      // Employers see applications sent to them, populated with job and applicant details
      applications = await Application.find({ employerId: req.user.id })
        .populate('jobId', 'title company location')
        .populate('applicantId', 'name email');
    } else {
      // Seekers see applications they submitted
      applications = await Application.find({ applicantId: req.user.id })
        .populate('jobId', 'title company location status');
    }

    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching applications' });
  }
});

// ==========================================
// Update Application Status (Employer only)
// PUT /api/applications/:id/status
// ==========================================
router.put('/:id/status', protect, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Security check: Make sure this employer actually owns the job!
    if (application.employerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to update this application.' });
    }

    application.status = status;
    const updatedApplication = await application.save();
    
    res.json(updatedApplication);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating status' });
  }
});

export default router;