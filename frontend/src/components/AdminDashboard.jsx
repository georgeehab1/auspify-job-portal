import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, FileText, Loader2, ShieldCheck, Activity, Trash2, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // NEW: UI State for interactive tabs and highlighting
  const [activeView, setActiveView] = useState('users'); // 'users', 'jobs', 'applications'
  const [highlightRole, setHighlightRole] = useState('all'); // 'all', 'employer'
  
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'admin') {
        navigate('/');
        return;
      }
      setUser(parsedUser);
      fetchAdminStats();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchAdminStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (response.ok) {
        setDashboardData(data);
      } else {
        setError(data.message || 'Failed to load admin stats');
      }
    } catch (err) {
      setError('Cannot connect to the server.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to completely remove ${userName} from the platform?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const updatedUsers = dashboardData.users.filter(u => u._id !== userId);
        setDashboardData({
          ...dashboardData,
          stats: { ...dashboardData.stats, totalUsers: dashboardData.stats.totalUsers - 1 },
          users: updatedUsers
        });

        setSuccessMessage(`User ${userName} has been deleted.`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Server error while deleting user.');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-12 relative">
      
      {successMessage && (
        <div className="fixed top-24 right-4 sm:right-8 z-50 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <p className="font-semibold text-sm">{successMessage}</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-purple-900 pb-24 pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-800 rounded-lg">
              <ShieldCheck className="h-8 w-8 text-purple-200" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">System Admin Panel</h1>
              <p className="mt-1 text-purple-200 text-lg">Monitor platform activity and manage users.</p>
            </div>
          </div>
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
            <Loader2 className="h-12 w-12 text-purple-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Gathering system data...</p>
          </div>
        ) : dashboardData && (
          <>
            {/* INTERACTIVE STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Total Users Card */}
              <div 
                onClick={() => { setActiveView('users'); setHighlightRole('all'); }}
                className={`bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4 cursor-pointer transition-all ${
                  activeView === 'users' && highlightRole === 'all' ? 'ring-2 ring-blue-500 border-transparent shadow-md' : 'border-gray-200 hover:shadow-md'
                }`}
              >
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalUsers}</p>
                </div>
              </div>
              
              {/* Job Postings Card */}
              <div 
                onClick={() => setActiveView('jobs')}
                className={`bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4 cursor-pointer transition-all ${
                  activeView === 'jobs' ? 'ring-2 ring-green-500 border-transparent shadow-md' : 'border-gray-200 hover:shadow-md'
                }`}
              >
                <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Briefcase className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Job Postings</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalJobs}</p>
                </div>
              </div>
              
              {/* Applications Card */}
              <div 
                onClick={() => setActiveView('applications')}
                className={`bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4 cursor-pointer transition-all ${
                  activeView === 'applications' ? 'ring-2 ring-purple-500 border-transparent shadow-md' : 'border-gray-200 hover:shadow-md'
                }`}
              >
                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><FileText className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Applications Submitted</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalApplications}</p>
                </div>
              </div>

              {/* Employers Card */}
              <div 
                onClick={() => { setActiveView('users'); setHighlightRole('employer'); }}
                className={`bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4 cursor-pointer transition-all ${
                  activeView === 'users' && highlightRole === 'employer' ? 'ring-2 ring-orange-500 border-transparent shadow-md' : 'border-gray-200 hover:shadow-md'
                }`}
              >
                <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><Activity className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Employers</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalEmployers}</p>
                </div>
              </div>
            </div>

            {/* DYNAMIC CONTENT AREA */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
              
              {/* USERS TABLE */}
              {activeView === 'users' && (
                <>
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">User Management</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-sm font-medium text-gray-500 border-b border-gray-200">
                          <th className="px-6 py-4">Name</th>
                          <th className="px-6 py-4">Email</th>
                          <th className="px-6 py-4">Role</th>
                          <th className="px-6 py-4">Joined Date</th>
                          <th className="px-6 py-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {dashboardData.users.map((u) => {
                          // Check if this row should be highlighted based on the filter
                          const isHighlighted = highlightRole === 'employer' && u.role === 'employer';
                          
                          return (
                            <tr key={u._id} className={`transition-colors ${isHighlighted ? 'bg-orange-50/70 border-l-4 border-orange-400' : 'hover:bg-slate-50'}`}>
                              <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                              <td className="px-6 py-4 text-gray-500">{u.email}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                  u.role === 'employer' ? 'bg-blue-100 text-blue-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {new Date(u.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4">
                                {user._id !== u._id && (
                                  <button onClick={() => handleDeleteUser(u._id, u.name)} className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors" title="Delete User">
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* JOBS TABLE */}
              {activeView === 'jobs' && (
                <>
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">Platform Job Postings</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-sm font-medium text-gray-500 border-b border-gray-200">
                          <th className="px-6 py-4">Job Title</th>
                          <th className="px-6 py-4">Company</th>
                          <th className="px-6 py-4">Location</th>
                          <th className="px-6 py-4">Posted Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {dashboardData.jobs.map((job) => (
                          <tr key={job._id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{job.title}</td>
                            <td className="px-6 py-4 text-gray-500">{job.company}</td>
                            <td className="px-6 py-4 text-gray-500">{job.location}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(job.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* APPLICATIONS TABLE */}
              {activeView === 'applications' && (
                <>
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">Submitted Applications</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-sm font-medium text-gray-500 border-b border-gray-200">
                          <th className="px-6 py-4">Applicant</th>
                          <th className="px-6 py-4">Job Applied For</th>
                          <th className="px-6 py-4">Company</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {dashboardData.applications.map((app) => (
                          <tr key={app._id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{app.applicantId?.name || 'Unknown User'}</td>
                            <td className="px-6 py-4 text-gray-900">{app.jobId?.title || 'Job Deleted'}</td>
                            <td className="px-6 py-4 text-gray-500">{app.jobId?.company || '-'}</td>
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  );
}