import mongoose from 'mongoose';

const JobApplicationSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  city: String,
  jobTitle: String,
  jobCategory: String,
  noticePeriod: String,
  experience: String,
  currentCompany: String,
  currentCTC: String,
  expectedCTC: String,
  resumeUrl: String,
  position: String,
  status: { type: String, default: 'Pending' },
  appliedAt: { type: Date, default: Date.now }
});

export default mongoose.models.JobApplication || mongoose.model('JobApplication', JobApplicationSchema);