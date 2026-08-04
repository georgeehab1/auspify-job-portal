import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Building, Users, ArrowRight, Briefcase } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'employer') return '/employer';
    if (user.role === 'admin') return '/admin';
    return '/seeker'; 
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* HERO SECTION */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-900 text-white py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-800/50 text-blue-100 text-sm font-medium mb-8 backdrop-blur-sm border border-blue-400/30">
            <Briefcase className="h-4 w-4" /> Welcome to Auspify
          </span>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Your Next Great Opportunity <br className="hidden sm:block"/> Awaits Right Here.
          </h1>
          
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Connect with top employers or find the perfect candidate. Auspify is the modern job portal designed for a seamless, transparent hiring experience.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {user ? (
              <Link 
                to={getDashboardPath()} 
                className="px-8 py-3.5 text-lg font-bold bg-white text-blue-700 hover:bg-gray-50 rounded-full transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Go to Dashboard <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link 
                  to="/register" 
                  className="px-8 py-3.5 text-lg font-bold bg-white text-blue-700 hover:bg-gray-50 rounded-full transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Get Started <ArrowRight className="h-5 w-5" />
                </Link>
                <Link 
                  to="/login" 
                  className="px-8 py-3.5 text-lg font-bold bg-transparent border-2 border-white/30 hover:border-white text-white rounded-full transition-all"
                >
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* FEATURES / HOW IT WORKS SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Why choose Auspify?</h2>
          <p className="mt-4 text-lg text-gray-600">Everything you need in a modern job board, built for speed and simplicity.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow group">
            <div className="mx-auto bg-blue-50 group-hover:bg-blue-100 transition-colors w-16 h-16 flex items-center justify-center rounded-2xl mb-6 rotate-3 group-hover:rotate-6">
              <Search className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Discover Jobs</h3>
            <p className="text-gray-600 leading-relaxed">
              Browse hundreds of active job postings from top companies looking for talent like you. Filter by title or company instantly.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow group">
            <div className="mx-auto bg-green-50 group-hover:bg-green-100 transition-colors w-16 h-16 flex items-center justify-center rounded-2xl mb-6 -rotate-3 group-hover:-rotate-6">
              <Building className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">For Employers</h3>
            <p className="text-gray-600 leading-relaxed">
              Employers can easily post new roles, manage active listings, and review candidate applications all from a secure dashboard.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow group">
            <div className="mx-auto bg-purple-50 group-hover:bg-purple-100 transition-colors w-16 h-16 flex items-center justify-center rounded-2xl mb-6 rotate-3 group-hover:rotate-6">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Seamless Hiring</h3>
            <p className="text-gray-600 leading-relaxed">
              Submit your resume and cover letter with a single click. Our secure platform ensures your data gets straight to the hiring manager.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}