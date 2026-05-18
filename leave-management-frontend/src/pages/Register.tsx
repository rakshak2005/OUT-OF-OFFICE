import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';
import logoImg from '../components/images/OOOlogo.jpeg';
import heroImage from '../components/images/empty-well-equipped-business-office-with-computers-used-recruitment-process.jpg';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    department: '',
    joiningCode: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const user = await authService.register(registerData);
      setUser(user);
      toast.success('Registration successful!');
      navigate('/app/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden py-10 bg-[#faf8ff]">
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        <img 
          src={heroImage} 
          alt="Welcome Background" 
          className="w-full h-full object-cover blur-lg scale-105 opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#00236f]/25 via-transparent to-[#faf8ff]/60" />
      </div>

      <div className="absolute inset-0 bg-[#faf8ff]/20 z-10" />

      <div className="relative z-20 w-full max-w-xl px-4 py-4 animate-in fade-in zoom-in duration-500">
        <div className="bg-white/40 backdrop-blur-2xl p-8 md:p-10 rounded-[40px] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/50 relative overflow-hidden">
          <div className="text-center mb-8 relative">
            <Link to="/" className="inline-flex items-center mb-6 group">
              <img 
                src={logoImg} 
                alt="OOO Portal Logo" 
                className="h-16 w-auto object-contain rounded-2xl transition-all duration-300 group-hover:scale-105" 
              />
            </Link>
            
            <h1 className="text-3xl font-bold text-[#00236f] mb-1 uppercase tracking-tight font-bebas">Join the Team</h1>
            <p className="text-xs font-medium text-gray-500">Create your employee account below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#444651] opacity-60 ml-1">First Name</label>
                <Input
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="bg-gray-50/50 border-gray-100 focus:bg-white transition-all rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#444651] opacity-60 ml-1">Last Name</label>
                <Input
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="bg-gray-50/50 border-gray-100 focus:bg-white transition-all rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-[#444651] opacity-60 ml-1">Email Address</label>
              <Input
                type="email"
                name="email"
                placeholder="john.doe@company.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-gray-50/50 border-gray-100 focus:bg-white transition-all rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#444651] opacity-60 ml-1">Department</label>
                <select
                  name="department"
                  className="w-full px-4 py-2 bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#00236f] focus:border-transparent focus:bg-white outline-none transition-all text-sm font-medium"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Customer Support">Customer Support</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#444651] opacity-60 ml-1">Joining Code</label>
                <Input
                  name="joiningCode"
                  placeholder="OOO-2024"
                  value={formData.joiningCode}
                  onChange={handleChange}
                  required
                  className="bg-blue-50/50 border-blue-100 focus:bg-white transition-all rounded-xl font-bold text-[#00236f]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#444651] opacity-60 ml-1">Password</label>
                <Input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-gray-50/50 border-gray-100 focus:bg-white transition-all rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#444651] opacity-60 ml-1">Confirm</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="bg-gray-50/50 border-gray-100 focus:bg-white transition-all rounded-xl"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600/70 backdrop-blur-xl hover:bg-blue-600/80 text-white py-4 rounded-xl font-bold shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.3)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 border border-white/30 text-xs uppercase tracking-widest mt-6" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <>
                  Create Account
                  <UserPlus className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs font-medium text-gray-400">
            Already a member?{' '}
            <Link to="/login" className="text-[#1e3a8a] hover:text-[#00236f] font-bold underline decoration-2 underline-offset-4">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;