import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import Input from '../common/Input';
import Button from '../common/Button';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';
import logoImg from '../images/OOOlogo.jpeg';
import heroImage from '../images/empty-well-equipped-business-office-with-computers-used-recruitment-process.jpg';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await authService.login({ email, password });
      setUser(user);
      toast.success(`Welcome back, ${user.firstName}! 👋`);
      
      if (['manager', 'hr', 'admin'].includes(user.role)) {
        navigate('/app/approve-leaves');
      } else {
        navigate('/app/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#faf8ff]">
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        <img 
          src={heroImage} 
          alt="Welcome Background" 
          className="w-full h-full object-cover blur-lg scale-105 opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#00236f]/25 via-transparent to-[#faf8ff]/60" />
      </div>

      <div className="absolute inset-0 bg-[#faf8ff]/20 z-10" />

      <div className="relative z-20 w-full max-w-md px-4 py-8 animate-in fade-in zoom-in duration-500">
        <div className="bg-white/40 backdrop-blur-2xl p-10 md:p-12 rounded-[40px] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/50 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full opacity-50 blur-3xl" />
          
          <div className="text-center mb-10 relative">
            <Link to="/" className="inline-flex items-center mb-8 group">
              <img 
                src={logoImg} 
                alt="OOO Portal Logo" 
                className="h-16 w-auto object-contain rounded-2xl transition-all duration-300 group-hover:scale-105" 
              />
            </Link>
            
            <h1 className="text-4xl font-bold text-[#00236f] mb-2 uppercase tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Welcome Back</h1>
            <p className="text-sm font-medium text-gray-500">Access your executive leave dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#444651] opacity-60 ml-1">Email Address</label>
              <Input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-50/50 border-gray-100 focus:bg-white transition-all rounded-xl py-3"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#444651] opacity-60 ml-1">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-50/50 border-gray-100 focus:bg-white transition-all rounded-xl py-3"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#1e3a8a]/80 backdrop-blur-md hover:bg-[#00236f]/90 text-white py-4 rounded-xl font-bold shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 border border-blue-400/30 text-xs uppercase tracking-widest mt-8" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </span>
              ) : (
                <>
                  SIGN IN
                  <LogIn className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs font-medium text-gray-400">
            New employee?{' '}
            <Link to="/register" className="text-[#1e3a8a] hover:text-[#00236f] font-bold underline decoration-2 underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;