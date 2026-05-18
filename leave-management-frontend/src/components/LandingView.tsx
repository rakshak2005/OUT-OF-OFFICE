import React from 'react';
import { Calendar, CheckCircle, CalendarDays, BarChart3, ArrowRight, PlayCircle } from 'lucide-react';
import Button from './common/Button';
import heroImage from './images/empty-well-equipped-business-office-with-computers-used-recruitment-process.jpg';

const LandingView: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#1a1b21] font-sans antialiased overflow-x-hidden">
      
      <header className="fixed top-0 left-0 w-full z-10 bg-[#faf8ff]/80 backdrop-blur-md border-b border-gray-100 px-6 md:px-10 py-3 max-w-7xl mx-auto left-0 right-0 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="font-bold text-lg tracking-tight text-[#00236f] flex items-center gap-2 group font-bebas">
            <div className="w-7 h-7 bg-[#00236f] rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 shadow-md shadow-blue-900/10">
              <span className="text-white text-lg font-bold">O</span>
            </div>
            <span className="font-bold tracking-widest text-2xl">OOO</span>
          </div>
        </div>
      </header>

      <main className="pt-16 pb-12">
        
        <section className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col items-center text-center py-8 lg:py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#dce1ff] text-[#00236f] rounded-full mb-6 border border-blue-200/50">
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">New Features Available</span>
          </div>

          <div className="flex flex-col items-center mb-6 font-bebas">
            <span className="text-[70px] md:text-[90px] leading-none font-bold text-[#00236f] tracking-widest drop-shadow-sm select-none">O.O.O</span>
            <span className="text-xs tracking-[0.6em] pl-[0.6em] text-[#444651] font-medium mt-1 uppercase text-center opacity-60">Out of Office</span>
          </div>

          <h1 className="mb-6 max-w-xl font-bebas">
            <span className="block text-3xl md:text-4xl font-bold tracking-[0.15em] text-[#00236f] uppercase leading-none">
              Simplify Leave Management
            </span>
          </h1>

          <p className="text-sm md:text-base text-[#444651] max-w-xl mb-10 font-semibold leading-relaxed opacity-80">
            A modern, efficient way to manage employee leaves. Apply, approve, and track all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-20 w-full sm:w-auto opacity-50">
            <Button disabled className="w-full bg-[#1e3a8a] text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-blue-900/10 border-none text-sm flex items-center justify-center gap-2">
              REGISTER
              <ArrowRight className="w-4 h-4" />
            </Button>
            <button disabled className="w-full px-8 py-4 bg-[#d0e1fb]/50 text-[#1e3a8a] border border-[#1e3a8a]/5 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
              <PlayCircle className="w-4 h-4" />
              SIGN IN
            </button>
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-left">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-teal-50 mb-6">
                <Calendar className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="text-lg font-black text-[#00236f] mb-2 tracking-tight">Easy Application</h3>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-left">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50 mb-6">
                <CheckCircle className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-black text-[#00236f] mb-2 tracking-tight">Quick Approvals</h3>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-left">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 mb-6">
                <CalendarDays className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-black text-[#00236f] mb-2 tracking-tight">Team Calendar</h3>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-left">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 mb-6">
                <BarChart3 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-black text-[#00236f] mb-2 tracking-tight">Real-time Tracking</h3>
            </div>
          </div>
        </section>

        
        <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
          <div className="relative w-full rounded-[32px] overflow-hidden shadow-xl max-w-6xl mx-auto">
            <img 
              alt="OOO Corporate Platform Interface" 
              className="w-full h-[400px] object-cover" 
              src={heroImage}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingView;
