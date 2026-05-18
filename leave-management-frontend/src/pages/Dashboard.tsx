import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { leaveService } from '../services/leaveService';
import DashboardCalendar from '../components/dashboard/DashboardCalendar';
import { Calendar, Clock, CheckCircle, XCircle, PlusCircle } from 'lucide-react';
import Button from '../components/common/Button';
import type { LeaveStats, Leave } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<LeaveStats>({
    totalLeaves: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
  });

  const [activeAbsences, setActiveAbsences] = useState<Leave[]>([]);
  const [absencesLoading, setAbsencesLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchActiveAbsences();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await leaveService.getLeaveStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchActiveAbsences = async () => {
    try {
      const data = await leaveService.getActiveToday();
      setActiveAbsences(data);
    } catch (error) {
      console.error('Error fetching active absences:', error);
    } finally {
      setAbsencesLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 font-sans antialiased">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-8 bg-[#00236f] rounded-full" />
          <h1 className="text-5xl font-bold text-[#00236f] uppercase tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            EXECUTIVE DASHBOARD
          </h1>
        </div>
        <p className="text-gray-500 font-medium ml-5">Welcome back, <span className="text-[#00236f] font-black">{user?.firstName} {user?.lastName}</span>. Here is your operational overview.</p>
      </div>

      
      <div className="relative bg-[#00236f]/80 backdrop-blur-2xl border border-blue-400/30 rounded-[40px] shadow-[0_8px_32px_0_rgba(0,35,111,0.3)] p-8 md:p-12 mb-12 text-white overflow-hidden group">
        
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-blue-400/10 rounded-full blur-3xl group-hover:bg-blue-400/20 transition-all duration-700" />
        <div className="absolute bottom-[-10%] left-[5%] w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200/60 mb-2">Resource Allocation</h2>
              <p className="text-3xl font-bold uppercase tracking-widest" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Leave Balance Summary</p>
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-100">FY 2024-25</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Casual Leave', value: user?.leaveBalance.casual, color: 'text-emerald-400' },
              { label: 'Sick Leave', value: user?.leaveBalance.sick, color: 'text-rose-400' },
              { label: 'Annual Leave', value: user?.leaveBalance.annual, color: 'text-amber-400' },
              { label: 'Total Available', value: user?.leaveBalance.total, color: 'text-white' }
            ].map((item) => (
              <div key={item.label} className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-200/50 mb-3">{item.label}</span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-bold ${item.color}`} style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{item.value}</span>
                  <span className="text-[10px] font-bold opacity-30 uppercase tracking-tighter">Days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { title: 'Total Applications', value: stats.totalLeaves, icon: Calendar, color: 'bg-blue-50/40 border-blue-200/50 text-blue-600' },
          { title: 'Awaiting Review', value: stats.pendingLeaves, icon: Clock, color: 'bg-amber-50/40 border-amber-200/50 text-amber-600' },
          { title: 'Authorized', value: stats.approvedLeaves, icon: CheckCircle, color: 'bg-emerald-50/40 border-emerald-200/50 text-emerald-600' },
          { title: 'Declined', value: stats.rejectedLeaves, icon: XCircle, color: 'bg-rose-50/40 border-rose-200/50 text-rose-600' }
        ].map((stat) => (
          <div key={stat.title} className={`p-6 rounded-[32px] border backdrop-blur-xl flex items-center justify-between shadow-[0_4px_20px_0_rgba(31,38,135,0.05)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] transition-all group ${stat.color}`}>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{stat.title}</p>
              <p className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{stat.value}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white shadow-sm group-hover:scale-110 transition-transform">
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="bg-white/40 backdrop-blur-2xl rounded-[40px] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] p-2 border border-white/60 overflow-hidden">
            <div className="p-8 pb-0">
              <h3 className="text-xl font-bold text-[#00236f] uppercase tracking-widest" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Operational Calendar</h3>
            </div>
            <DashboardCalendar />
          </div>
        </div>
        
        <div className="space-y-6">
          
          <div className="bg-white/40 backdrop-blur-2xl rounded-[40px] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] p-8 border border-white/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <PlusCircle className="w-24 h-24 text-[#00236f]" />
            </div>
            
            <h2 className="text-xl font-bold text-[#00236f] mb-8 flex items-center gap-3 uppercase tracking-widest" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Quick Directives
            </h2>
            <div className="flex flex-col space-y-4">
              <Button
                onClick={() => navigate('/app/apply-leave')}
                className="w-full bg-blue-600/70 backdrop-blur-xl hover:bg-blue-600/80 text-white py-6 rounded-2xl font-bold shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.3)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 border border-white/30 text-xs uppercase tracking-widest"
              >
                <PlusCircle className="w-5 h-5" />
                Draft Request
              </Button>
              
              <button
                onClick={() => navigate('/app/my-leaves')}
                className="w-full py-5 bg-white/50 backdrop-blur-xl text-[#00236f] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/70 transition-all border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
              >
                <Calendar className="w-4 h-4 opacity-40" />
                History & Logs
              </button>

              {(user?.role === 'manager' || user?.role === 'hr' || user?.role === 'admin') && (
                <button
                  onClick={() => navigate('/app/approve-leaves')}
                  className="w-full py-5 bg-white/50 backdrop-blur-xl text-[#00236f] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/70 transition-all border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
                >
                  <CheckCircle className="w-4 h-4 opacity-40" />
                  Approval Desk
                </button>
              )}
            </div>
            
            <div className="mt-8 p-5 bg-blue-50/50 rounded-3xl border border-blue-100/50">
              <p className="text-[10px] font-bold text-[#00236f] uppercase tracking-widest opacity-40 mb-3 italic">System Note</p>
              <p className="text-xs text-blue-900 leading-relaxed font-medium">
                Ensure all leave requests are submitted at least 48 hours in advance for operational clearance.
              </p>
            </div>
          </div>

          
          <div className="bg-white/40 backdrop-blur-2xl rounded-[40px] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] p-8 border border-white/60 relative overflow-hidden">
            <h2 className="text-xl font-bold text-[#00236f] mb-6 flex items-center gap-3 uppercase tracking-widest" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              🌴 OUT OF OFFICE TODAY
            </h2>
            
            {absencesLoading ? (
              <div className="flex items-center gap-3 py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#00236f]" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Checking active logs...</span>
              </div>
            ) : activeAbsences.length === 0 ? (
              <div className="p-5 bg-emerald-50/50 border border-emerald-100/50 rounded-3xl flex items-center gap-3">
                <span className="text-emerald-500 animate-pulse text-xs">🟢</span>
                <div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#065f46] block mb-0.5">Status: All Present</span>
                  <p className="text-[10px] font-bold text-[#065f46] uppercase">No active absences today</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
                {activeAbsences.map((absence: any) => (
                  <div key={absence.id} className="flex items-center justify-between p-3.5 bg-gray-50/50 hover:bg-[#dce1ff]/10 rounded-2xl border border-gray-100/50 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#00236f]/5 text-[#00236f] flex items-center justify-center text-xs font-black" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                        {absence.applicant?.firstName?.charAt(0)}{absence.applicant?.lastName?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-[#00236f] uppercase tracking-wide">
                          {absence.applicant?.firstName} {absence.applicant?.lastName}
                        </p>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                          {absence.applicant?.department}
                        </p>
                      </div>
                    </div>
                    <span className="bg-[#00236f]/5 text-[#00236f] px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest">
                      {typeof absence.leaveType === 'string' ? absence.leaveType : absence.leaveType?.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;