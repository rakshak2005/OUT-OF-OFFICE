import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle, CalendarDays, BarChart3, ArrowRight, PlayCircle } from 'lucide-react';
import Button from '../components/common/Button';
import heroImage from '../components/images/empty-well-equipped-business-office-with-computers-used-recruitment-process.jpg';
import logoImg from '../components/images/OOOlogo.jpeg';

const Welcome: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#1a1b21] font-sans antialiased overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      
      <header className="fixed top-0 left-0 w-full z-50 bg-[#faf8ff]/80 backdrop-blur-md border-b border-gray-100 px-6 md:px-10 py-3 max-w-7xl mx-auto left-0 right-0 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src={logoImg} 
              alt="OOO Portal Logo" 
              className="h-10 w-auto object-contain rounded-xl transition-all duration-300 group-hover:scale-105" 
            />
          </Link>
          
          <nav className="hidden md:flex gap-6 items-center">
            <Link to="#" className="text-[#00236f] font-bold border-b-2 border-[#00236f] py-0.5 text-xs tracking-wide">Platform</Link>
            <Link to="#" className="text-[#444651] hover:text-[#00236f] transition-colors text-xs font-bold uppercase tracking-wider">Solutions</Link>
            <Link to="#" className="text-[#444651] hover:text-[#00236f] transition-colors text-xs font-bold uppercase tracking-wider">Contact Us</Link>
            <Link to="#" className="text-[#444651] hover:text-[#00236f] transition-colors text-xs font-bold uppercase tracking-wider">Support</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            to="/login" 
            className="hidden sm:block px-4 py-2 rounded-lg text-[#444651] hover:text-[#00236f] hover:bg-white transition-all text-xs font-bold uppercase tracking-wider"
          >
            Sign In
          </Link>
          <Link to="/register">
            <Button className="bg-[#1e3a8a] hover:bg-[#00236f] text-white font-bold px-6 py-2 rounded-lg transition-all shadow-md shadow-blue-900/10 active:scale-95 border-none text-xs uppercase tracking-widest">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      <main className="pt-16 pb-12">
        
        <section className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col items-center text-center py-8 lg:py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#dce1ff] text-[#00236f] rounded-full mb-6 animate-fade-in border border-blue-200/50">
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">New Features Available</span>
          </div>

          <div className="flex flex-col items-center mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            <span className="text-[70px] md:text-[90px] leading-none font-bold text-[#00236f] tracking-widest drop-shadow-sm select-none">O.O.O</span>
            <span className="text-xs tracking-[0.6em] pl-[0.6em] text-[#444651] font-medium mt-1 uppercase text-center opacity-60">Out of Office</span>
          </div>

          <h1 className="mb-6 max-w-xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            <span className="block text-3xl md:text-4xl font-bold tracking-[0.15em] text-[#00236f] uppercase leading-none">
              Simplify Leave Management
            </span>
          </h1>

          <p className="text-sm md:text-base text-[#444651] max-w-xl mb-10 font-semibold leading-relaxed opacity-80">
            A modern, efficient way to manage employee leaves. Apply, approve, and track all in one place with our executive-grade dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-20 w-full sm:w-auto">
            <Link to="/register" className="w-full sm:w-auto">
              <Button className="w-full bg-[#1e3a8a]/80 backdrop-blur-md hover:bg-[#00236f]/90 text-white px-8 py-4 rounded-xl font-bold shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 border border-blue-400/30 text-sm">
                REGISTER
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <button className="w-full px-8 py-4 bg-white/40 backdrop-blur-md text-[#1e3a8a] border border-white/60 rounded-xl font-bold text-sm hover:bg-white/60 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex items-center justify-center gap-2">
                <PlayCircle className="w-4 h-4" />
                SIGN IN
              </button>
            </Link>
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
            
            <div className="bg-white/40 backdrop-blur-2xl p-8 rounded-[32px] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/50 text-left hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-teal-50 mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="text-lg font-black text-[#00236f] mb-2 tracking-tight">Easy Application</h3>
              <p className="text-[#444651] font-medium leading-relaxed text-xs opacity-70">
                Streamlined leave requests for your global team in just two clicks.
              </p>
            </div>

            
            <div className="bg-white/40 backdrop-blur-2xl p-8 rounded-[32px] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/50 text-left hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50 mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-black text-[#00236f] mb-2 tracking-tight">Quick Approvals</h3>
              <p className="text-[#444651] font-medium leading-relaxed text-xs opacity-70">
                Approve or deny requests directly from email or Slack notifications.
              </p>
            </div>

            
            <div className="bg-white/40 backdrop-blur-2xl p-8 rounded-[32px] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/50 text-left hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 mb-6 group-hover:scale-110 transition-transform">
                <CalendarDays className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-black text-[#00236f] mb-2 tracking-tight">Team Calendar</h3>
              <p className="text-[#444651] font-medium leading-relaxed text-xs opacity-70">
                Visual overview of department availability to prevent overlap.
              </p>
            </div>

            
            <div className="bg-white/40 backdrop-blur-2xl p-8 rounded-[32px] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/50 text-left hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-black text-[#00236f] mb-2 tracking-tight">Real-time Tracking</h3>
              <p className="text-[#444651] font-medium leading-relaxed text-xs opacity-70">
                Comprehensive dashboards with accrual balances and audit logs.
              </p>
            </div>
          </div>
        </section>

        
        <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
          <div className="relative w-full rounded-[32px] overflow-hidden shadow-xl group max-w-6xl mx-auto">
            <img 
              alt="OOO Corporate Platform Interface" 
              className="w-full h-[400px] object-cover transition-transform duration-1000 group-hover:scale-105" 
              src={heroImage}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#00236f]/90 via-[#00236f]/30 to-transparent flex items-end p-8 md:p-12">
              <div className="text-white max-w-xl">
                <span className="text-[9px] font-black bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full mb-4 inline-block uppercase tracking-widest border border-white/5">
                  Trusted by 500+ Companies
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mb-3 leading-tight tracking-widest uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Experience Clarity in HR Operations</h2>
                <p className="text-sm md:text-base font-medium opacity-80 leading-relaxed max-w-lg">
                  Our platform integrates seamlessly with your existing tools, providing a single source of truth for all employee absence management.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      
      <footer className="w-full py-12 px-6 md:px-10 bg-white border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
          <span className="font-black text-2xl text-[#00236f] tracking-tighter">OOO</span>
          <p className="text-[10px] font-bold text-[#444651] opacity-40 uppercase tracking-widest">
            © 2024 OOO Leave Management. All rights reserved.
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-6 md:gap-10">
          <Link to="#" className="text-[#444651] hover:text-[#00236f] transition-colors text-[10px] font-black uppercase tracking-[0.15em] opacity-60 hover:opacity-100">Privacy Policy</Link>
          <Link to="#" className="text-[#444651] hover:text-[#00236f] transition-colors text-[10px] font-black uppercase tracking-[0.15em] opacity-60 hover:opacity-100">Terms of Service</Link>
          <Link to="#" className="text-[#444651] hover:text-[#00236f] transition-colors text-[10px] font-black uppercase tracking-[0.15em] opacity-60 hover:opacity-100">Security</Link>
          <Link to="#" className="text-[#444651] hover:text-[#00236f] transition-colors text-[10px] font-black uppercase tracking-[0.15em] opacity-60 hover:opacity-100">Contact Support</Link>
        </nav>
      </footer>
    </div>
  );
};

export default Welcome;