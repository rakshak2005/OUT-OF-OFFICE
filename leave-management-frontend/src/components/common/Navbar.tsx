import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogOut, User, Calendar, Home, BarChart3, Users } from 'lucide-react';
import logoImg from '../images/OOOlogo.jpeg';

const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-gray-100/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src={logoImg} 
                alt="OOO Portal Logo" 
                className="h-12 w-auto object-contain rounded-xl transition-all duration-300 group-hover:scale-105" 
              />
            </Link>
          </div>

          <div className="flex items-center">
            <div className="hidden lg:flex items-center gap-1 mr-8 pr-8 border-r border-gray-100">
              {[
                { to: '/app/dashboard', label: 'Overview', icon: Home },
                { to: '/app/my-leaves', label: 'Leaves', icon: Calendar },
                { to: '/app/team-calendar', label: 'Team Planner', icon: Users },
                { to: '/app/holidays', label: 'Holidays', icon: Calendar },
                { to: '/app/leave-balance', label: 'Resource', icon: BarChart3 },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#444651] hover:text-[#00236f] hover:bg-blue-50/50 transition-all active:scale-95"
                >
                  <link.icon className="w-3.5 h-3.5 opacity-40" />
                  {link.label}
                </Link>
              ))}

              {(user?.role === 'manager' || user?.role === 'hr') && (
                <Link
                  to="/app/approve-leaves"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#444651] hover:text-[#00236f] hover:bg-blue-50/50 transition-all active:scale-95"
                >
                  <User className="w-3.5 h-3.5 opacity-40" />
                  Approval
                </Link>
              )}

              {(user?.role === 'hr' || user?.role === 'admin' || user?.role === 'manager') && (
                <Link
                  to="/app/users"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#444651] hover:text-[#00236f] hover:bg-blue-50/50 transition-all active:scale-95"
                >
                  <Users className="w-3.5 h-3.5 opacity-40" />
                  Teams
                </Link>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-black text-[#00236f] uppercase tracking-wider">{user?.firstName} {user?.lastName}</span>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em]">{user?.role}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-50 text-[#444651] hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-90 border border-gray-100"
                title="Secure Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;