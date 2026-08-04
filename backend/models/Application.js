import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job', 
    required: true 
  },
  applicantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  employerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // NEW FIELDS ADDED HERE
  resumeLink: {
    type: String,
    required: true
  },
  coverLetter: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Accepted', 'Rejected'],
    default: 'Pending'
  }
}, { timestamps: true });

applicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });

export default mongoose.model('Application', applicationSchema);