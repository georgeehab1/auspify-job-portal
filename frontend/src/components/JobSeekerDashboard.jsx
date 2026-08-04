import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, DollarSign, Clock, CheckCircle, XCircle, X, Loader2, Filter } from 'lucide-react';

export default function JobSeekerDashboard() {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [titleFilter, setTitleFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [salaryFilter, setSalaryFilter] = useState('');
  
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationData, setApplicationData] = useState({
    resumeLink: '',
    coverLetter: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchAllJobs();
      fetchMyApplications(); 
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchAllJobs = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/jobs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) setJobs(data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        const jobIds = data.map(app => app.jobId._id ? app.jobId._id : app.jobId);
        setAppliedJobs(jobIds);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    }
  };

  const openApplyModal = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
    setApplicationData({ resumeLink: '', coverLetter: '' });
  };

  const handleInputChange = (e) => {
    setApplicationData({ ...applicationData, [e.target.name]: e.target.value });
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          jobId: selectedJob._id,
          resumeLink: applicationData.resumeLink,
          coverLetter: applicationData.coverLetter
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsModalOpen(false);
        setToastMessage(`Successfully applied for the ${selectedJob.title} position!`);
        
        if (!appliedJobs.includes(selectedJob._id)) {
          setAppliedJobs([...appliedJobs, selectedJob._id]);
        }
        
        setTimeout(() => setToastMessage(''), 3000);
      } else {
        setIsModalOpen(false);
        setErrorMessage(data.message || 'Failed to apply for job');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    } catch (err) {
      setIsModalOpen(false);
      setErrorMessage('Cannot connect to the server. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setTitleFilter('');
    setLocationFilter('');
    setSalaryFilter('');
  };

  // Extract unique options dynamically for dropdowns
  const uniqueTitles = [...new Set(jobs.map(job => job.title))].filter(Boolean);
  const uniqueLocations = [...new Set(jobs.map(job => job.location))].filter(Boolean);
  const uniqueSalaries = [...new Set(jobs.map(job => job.salary))].filter(Boolean);

  // Multi-field Filtering Logic
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTitle = titleFilter === '' || job.title === titleFilter;
    const matchesLocation = locationFilter === '' || job.location === locationFilter;
    const matchesSalary = salaryFilter === '' || job.salary === salaryFilter;
    
    return matchesSearch && matchesTitle && matchesLocation && matchesSalary;
  });

  const hasActiveFilters = searchTerm || titleFilter || locationFilter || salaryFilter;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-12 relative">
      
      {toastMessage && (
        <div className="fixed top-24 right-4 sm:right-8 z-50 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <p className="font-semibold text-sm">{toastMessage}</p>
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-24 right-4 sm:right-8 z-50 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <XCircle className="h-5 w-5 text-red-500" />
          <p className="font-semibold text-sm">{errorMessage}</p>
        </div>
      )}

      {/* HERO SECTION */}
      <div className="bg-blue-600 pb-28 pt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Find your next dream job, {user.name.split(' ')[0]}! 🚀
          </h1>
          <p className="mt-4 text-blue-100 text-lg max-w-2xl mx-auto">
            Search and filter through available opportunities from top companies.
          </p>

          {/* SEARCH & FILTER CONTROLS */}
          <div className="mt-8 max-w-5xl mx-auto bg-white p-4 rounded-2xl shadow-xl space-y-3">
            
            {/* Search Input Row */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                placeholder="Search by keywords, job title, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Dropdown Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Job Title Filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={titleFilter}
                  onChange={(e) => setTitleFilter(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium cursor-pointer"
                >
                  <option value="">All Job Titles</option>
                  {uniqueTitles.map((title, index) => (
                    <option key={index} value={title}>{title}</option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium cursor-pointer"
                >
                  <option value="">All Locations</option>
                  {uniqueLocations.map((location, index) => (
                    <option key={index} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              {/* Salary Filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={salaryFilter}
                  onChange={(e) => setSalaryFilter(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium cursor-pointer"
                >
                  <option value="">All Salaries</option>
                  {uniqueSalaries.map((salary, index) => (
                    <option key={index} value={salary}>{salary}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition-colors"
                >
                  <X className="h-3.5 w-3.5" /> Clear active filters
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* JOB FEED */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl shadow-sm">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">
                {jobs.length === 0 ? "No jobs posted yet" : "No jobs match your selected filters"}
              </h3>
              {hasActiveFilters && (
                <button 
                  onClick={clearAllFilters}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            filteredJobs.map((job) => {
              const hasApplied = appliedJobs.includes(job._id);

              return (
                <div key={job._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {job.title}
                      </h2>
                      <p className="text-lg text-gray-600 font-medium mt-1">{job.company}</p>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
                          <MapPin className="h-4 w-4" /> {job.location}
                        </span>
                        {job.salary && (
                          <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">
                            <DollarSign className="h-4 w-4" /> {job.salary}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 text-gray-400">
                          <Clock className="h-4 w-4" /> 
                          {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="mt-4 text-gray-600 line-clamp-2">{job.description}</p>
                    </div>

                    <div className="flex-shrink-0 pt-2 md:pt-0">
                      <button 
                        onClick={() => openApplyModal(job)} 
                        className={`w-full md:w-auto px-6 py-2.5 font-semibold rounded-lg transition-colors border ${
                          hasApplied 
                            ? 'bg-green-50 text-green-700 hover:bg-green-600 hover:text-white border-green-200 hover:border-transparent' 
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border-blue-200 hover:border-transparent'
                        }`}
                      >
                        {hasApplied ? 'Applied ✓' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* APPLICATION MODAL */}
      {isModalOpen && selectedJob && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
              <h2 className="text-xl font-bold text-gray-900">Apply for {selectedJob.title}</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={submitApplication} className="p-6 space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-blue-800 font-medium">
                  Applying to <span className="font-bold">{selectedJob.company}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link to your Resume / CV <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  name="resumeLink"
                  value={applicationData.resumeLink}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="e.g. Google Drive, Dropbox, or Portfolio link"
                />
                <p className="text-xs text-gray-500 mt-1">Make sure permissions are set to "Anyone with the link can view".</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Letter / Note to Employer (Optional)
                </label>
                <textarea
                  name="coverLetter"
                  value={applicationData.coverLetter}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  placeholder="Why are you a great fit for this role?"
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 flex items-center justify-center text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Sending...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}