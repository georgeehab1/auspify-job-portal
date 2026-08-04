import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import Home from './components/Home';
import JobSeekerDashboard from './components/JobSeekerDashboard';
import EmployerDashboard from './components/EmployerDashboard';
import AdminDashboard from './components/AdminDashboard';
import Register from './components/Register';
import Login from './components/Login';

// A simple Navigation component to keep App clean
function Navigation() {
  const navigate = useNavigate();
  // Check if user exists in local storage
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/register');
  };

  // Helper to get the correct dashboard path based on role
  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'employer') return '/employer';
    if (user.role === 'admin') return '/admin';
    return '/seeker';
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors">
              <Briefcase className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Auspify</span>
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Home</Link>
            
            {user ? (
              <>
                {/* Dynamically link to their specific dashboard based on role */}
                <Link 
                  to={getDashboardPath()} 
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Dashboard
                </Link>
                <div className="h-6 w-px bg-gray-200"></div>
                <button 
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
        <Navigation />

        {/* Route Configuration */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/seeker" element={<JobSeekerDashboard />} />
            <Route path="/employer" element={<EmployerDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;