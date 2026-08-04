import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Users, TrendingUp, Plus, Trash2, Eye, Loader2, CheckCircle, XCircle, X } from 'lucide-react';

export default function EmployerDashboard() {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // UI State for tabs, filtering, and modals
  const [activeView, setActiveView] = useState('jobs'); 
  const [appFilter, setAppFilter] = useState('all'); 
  const [selectedJobId, setSelectedJobId] = useState(null); 
  const [viewingApplication, setViewingApplication] = useState(null);
  
  // NEW: State for Job Creation Modal
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    salary: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'employer') {
        navigate('/');
        return;
      }
      setUser(parsedUser);
      fetchDashboardData();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/jobs/employer-dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (response.ok) {
        setDashboardData(data);
      } else {
        setError(data.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      setError('Cannot connect to the server.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Function to handle creating a job
  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newJob)
      });

      if (response.ok) {
        // Close modal, reset form, and refresh data
        setIsPostingJob(false);
        setNewJob({ title: '', company: '', location: '', description: '', salary: '' });
        fetchDashboardData();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to post job');
      }
    } catch (err) {
      console.error('Error posting job:', err);
      alert('Server error while posting job.');
    }
  };

  const handleUpdateApplicationStatus = async (appId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchDashboardData();
        if (viewingApplication && viewingApplication._id === appId) {
          setViewingApplication({ ...viewingApplication, status: newStatus });
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchDashboardData(); 
      }
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      
      {/* Header */}
      <div className="bg-[#0f172a] pb-24 pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              Welcome back, {user.name}! 🏢
            </h1>
            <p className="mt-2 text-gray-300 text-lg">Manage your job postings and review top talent.</p>
          </div>
          {/* UPDATED: Added onClick to open the modal */}
          <button 
            onClick={() => setIsPostingJob(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" /> Post a New Job
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 space-y-6">
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading your dashboard...</p>
          </div>
        ) : dashboardData && (
          <>
            {/* INTERACTIVE STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                onClick={() => { setActiveView('jobs'); setSelectedJobId(null); }}
                className={`bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4 cursor-pointer transition-all ${
                  activeView === 'jobs' ? 'ring-2 ring-blue-500 border-transparent shadow-md' : 'border-gray-200 hover:shadow-md'
                }`}
              >
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><FileText className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Postings</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.activePostings}</p>
                </div>
              </div>
              
              <div 
                onClick={() => { setActiveView('applications'); setAppFilter('all'); setSelectedJobId(null); }}
                className={`bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4 cursor-pointer transition-all ${
                  activeView === 'applications' && appFilter === 'all' && !selectedJobId ? 'ring-2 ring-green-500 border-transparent shadow-md' : 'border-gray-200 hover:shadow-md'
                }`}
              >
                <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Users className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Applicants</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalApplicants}</p>
                </div>
              </div>
              
              <div 
                onClick={() => { setActiveView('applications'); setAppFilter('Accepted'); setSelectedJobId(null); }}
                className={`bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4 cursor-pointer transition-all ${
                  activeView === 'applications' && appFilter === 'Accepted' && !selectedJobId ? 'ring-2 ring-purple-500 border-transparent shadow-md' : 'border-gray-200 hover:shadow-md'
                }`}
              >
                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><TrendingUp className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Accepted Candidates</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.acceptedCandidates}</p>
                </div>
              </div>
            </div>

            {/* DYNAMIC CONTENT AREA */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
              
              {/* JOBS VIEW */}
              {activeView === 'jobs' && (
                <>
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">Your Job Postings</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-sm font-medium text-gray-500 border-b border-gray-200">
                          <th className="px-6 py-4">Job Title</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Applicants</th>
                          <th className="px-6 py-4">Posted Date</th>
                          <th className="px-6 py-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {dashboardData.jobs.map((job) => (
                          <tr key={job._id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                              <p className="font-medium text-gray-900">{job.title}</p>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <span className="text-gray-400">📍</span> {job.location}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">{job.applicantCount}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(job.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 flex gap-3">
                              <button 
                                onClick={() => { setActiveView('applications'); setAppFilter('all'); setSelectedJobId(job._id); }}
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium transition-colors"
                              >
                                <Eye className="h-4 w-4" /> View
                              </button>
                              <button onClick={() => handleDeleteJob(job._id)} className="text-gray-400 hover:text-red-600 transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* APPLICATIONS VIEW */}
              {activeView === 'applications' && (
                <>
                  <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">
                      {selectedJobId 
                        ? `Applicants for: ${dashboardData.jobs.find(j => j._id === selectedJobId)?.title}`
                        : appFilter === 'Accepted' ? 'Accepted Candidates' : 'All Applicants'}
                    </h2>
                    {selectedJobId && (
                      <button 
                        onClick={() => setSelectedJobId(null)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Clear Filter
                      </button>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-sm font-medium text-gray-500 border-b border-gray-200">
                          <th className="px-6 py-4">Applicant Name</th>
                          <th className="px-6 py-4">Applied For</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {dashboardData.applications
                          .filter(app => appFilter === 'all' || app.status === appFilter)
                          .filter(app => selectedJobId ? app.jobId?._id === selectedJobId : true) 
                          .map((app) => (
                          <tr key={app._id} className={`hover:bg-slate-50 ${app.status === 'Accepted' && appFilter === 'all' ? 'bg-purple-50/30' : ''}`}>
                            <td className="px-6 py-4">
                              <p className="font-medium text-gray-900">{app.applicantId?.name || 'Unknown'}</p>
                              <p className="text-sm text-gray-500">{app.applicantId?.email}</p>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-700">{app.jobId?.title || 'Deleted Job'}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                app.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {app.status || 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 flex gap-2">
                              <button 
                                onClick={() => setViewingApplication(app)}
                                className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors" title="View Application Details">
                                <FileText className="h-5 w-5" />
                              </button>
                              
                              {app.status !== 'Accepted' && (
                                <button 
                                  onClick={() => handleUpdateApplicationStatus(app._id, 'Accepted')}
                                  className="text-green-600 hover:bg-green-50 p-1.5 rounded transition-colors" title="Accept Candidate">
                                  <CheckCircle className="h-5 w-5" />
                                </button>
                              )}
                              {app.status !== 'Rejected' && (
                                <button 
                                  onClick={() => handleUpdateApplicationStatus(app._id, 'Rejected')}
                                  className="text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors" title="Reject Candidate">
                                  <XCircle className="h-5 w-5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {dashboardData.applications
                      .filter(app => appFilter === 'all' || app.status === appFilter)
                      .filter(app => selectedJobId ? app.jobId?._id === selectedJobId : true)
                      .length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                        No candidates found for this view.
                      </div>
                    )}
                  </div>
                </>
              )}

            </div>
          </>
        )}
      </div>

      {/* NEW: Job Creation Modal */}
      {isPostingJob && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" /> Post a New Job
              </h3>
              <button 
                onClick={() => setIsPostingJob(false)} 
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleCreateJob} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <input 
                    type="text" 
                    required 
                    value={newJob.title} 
                    onChange={e => setNewJob({...newJob, title: e.target.value})} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" 
                    placeholder="e.g. Senior Software Engineer" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input 
                    type="text" 
                    required 
                    value={newJob.company} 
                    onChange={e => setNewJob({...newJob, company: e.target.value})} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" 
                    placeholder="e.g. Auspify Tech" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input 
                    type="text" 
                    required 
                    value={newJob.location} 
                    onChange={e => setNewJob({...newJob, location: e.target.value})} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" 
                    placeholder="e.g. Remote, or Cairo, Egypt" 
                  />
                </div>

                {/* NEW: Salary Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary (Optional)</label>
                  <input 
                    type="text" 
                    value={newJob.salary} 
                    onChange={e => setNewJob({...newJob, salary: e.target.value})} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" 
                    placeholder="e.g. $80,000 - $100,000" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                  <textarea 
                    required 
                    rows="5" 
                    value={newJob.description} 
                    onChange={e => setNewJob({...newJob, description: e.target.value})} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" 
                    placeholder="Describe the role, responsibilities, and requirements..."
                  ></textarea>
                </div>
                
                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={() => setIsPostingJob(false)} 
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> Publish Job
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      {viewingApplication && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" /> Application Details
              </h3>
              <button 
                onClick={() => setViewingApplication(null)} 
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold tracking-wider text-gray-500 uppercase mb-1">Applicant</h4>
                  <p className="text-xl font-bold text-gray-900">{viewingApplication.applicantId?.name || 'Unknown'}</p>
                  <p className="text-gray-600">{viewingApplication.applicantId?.email}</p>
                </div>
                <div className="text-right">
                  <h4 className="text-xs font-bold tracking-wider text-gray-500 uppercase mb-1">Applied For</h4>
                  <p className="text-lg font-medium text-gray-900">{viewingApplication.jobId?.title}</p>
                  <p className="text-sm text-gray-500">On {new Date(viewingApplication.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  viewingApplication.status === 'Accepted' ? 'bg-green-100 text-green-800 border border-green-200' :
                  viewingApplication.status === 'Rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
                  'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  Current Status: {viewingApplication.status || 'Pending'}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Resume</h4>
                {(viewingApplication.resume || viewingApplication.resumeLink || viewingApplication.resumeUrl) ? (
                  <a 
                    href={viewingApplication.resume || viewingApplication.resumeLink || viewingApplication.resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg font-medium transition-colors"
                  >
                    <FileText className="h-4 w-4" /> View Attached Resume
                  </a>
                ) : (
                  <p className="text-gray-500 italic text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                    No resume link was provided with this application.
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Cover Letter / Note</h4>
                {viewingApplication.coverLetter ? (
                  <div className="p-4 bg-gray-50 rounded-xl text-gray-700 whitespace-pre-wrap text-sm leading-relaxed border border-gray-100">
                    {viewingApplication.coverLetter}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                    The applicant did not provide a cover letter.
                  </p>
                )}
              </div>

            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              {viewingApplication.status !== 'Rejected' && (
                <button 
                  onClick={() => handleUpdateApplicationStatus(viewingApplication._id, 'Rejected')}
                  className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </button>
              )}
              {viewingApplication.status !== 'Accepted' && (
                <button 
                  onClick={() => handleUpdateApplicationStatus(viewingApplication._id, 'Accepted')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" /> Accept Candidate
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}