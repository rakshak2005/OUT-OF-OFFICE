import React, { useEffect, useState } from 'react';
import { leaveService } from '../services/leaveService';
import type { Leave } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isWithinInterval } from 'date-fns';
import { ChevronLeft, ChevronRight, Users, ClipboardList, Circle } from 'lucide-react';

const TeamCalendar: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDept, setSelectedDept] = useState<string>('All');

  useEffect(() => {
    fetchTeamLeaves();
  }, []);

  const fetchTeamLeaves = async () => {
    try {
      const data = await leaveService.getTeamCalendar();
      setLeaves(data);
    } catch (error) {
      console.error('Error fetching team leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const dateInterval = eachDayOfInterval({ start: monthStart, end: monthEnd });

  
  const startDayOfWeek = monthStart.getDay(); 
  const paddingDays = Array.from({ length: startDayOfWeek });

  
  const departments = ['All', ...Array.from(new Set(leaves.map(l => l.applicant?.department || 'Operations'))).filter(Boolean).sort()];

  
  const filteredLeaves = leaves.filter(l => {
    if (selectedDept === 'All') return true;
    return (l.applicant?.department || 'Operations').toLowerCase() === selectedDept.toLowerCase();
  });

  
  const getLeavesForDate = (date: Date) => {
    return filteredLeaves.filter(l => {
      const start = new Date(l.fromDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(l.toDate);
      end.setHours(23, 59, 59, 999);
      return isWithinInterval(date, { start, end });
    });
  };

  
  const getDeptColorClass = (dept: string) => {
    const d = dept?.toLowerCase() || '';
    if (d.includes('it') || d.includes('tech') || d.includes('dev')) {
      return 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100/50';
    }
    if (d.includes('hr') || d.includes('resource') || d.includes('peop')) {
      return 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100/50';
    }
    if (d.includes('sale') || d.includes('market') || d.includes('biz')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/50';
    }
    if (d.includes('fin') || d.includes('account')) {
      return 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100/50';
    }
    if (d.includes('op') || d.includes('exec') || d.includes('adm')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100/50';
    }
    return 'bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-100/50';
  };

  
  const upcomingAbsences = filteredLeaves.filter(l => {
    const end = new Date(l.toDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return end >= today;
  }).slice(0, 10);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00236f] mb-4"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-[#00236f] opacity-40">Loading Team Archives...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 font-sans antialiased">
      
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-[#00236f] rounded-full" />
            <h1 className="text-5xl font-bold text-[#00236f] uppercase tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              TEAM LEAVE PLANNER
            </h1>
          </div>
          <p className="text-gray-500 font-medium ml-5 italic opacity-80 uppercase tracking-widest text-[10px]">Coordinate absences and optimize segment workflows</p>
        </div>

        
        <div className="flex items-center gap-4 bg-white px-5 py-3 border border-gray-100 shadow-xl shadow-blue-900/5 rounded-2xl">
          <button 
            onClick={handlePrevMonth}
            className="p-2 text-gray-400 hover:text-[#00236f] hover:bg-gray-50 rounded-xl transition-all cursor-pointer border-none"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xl font-bold text-[#00236f] uppercase tracking-widest min-w-[140px] text-center" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button 
            onClick={handleNextMonth}
            className="p-2 text-gray-400 hover:text-[#00236f] hover:bg-gray-50 rounded-xl transition-all cursor-pointer border-none"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      
      <div className="mb-10 flex flex-wrap gap-2.5 items-center">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" /> Segment Filter:
        </span>
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer border
              ${selectedDept.toLowerCase() === dept.toLowerCase()
                ? 'bg-[#00236f] border-[#00236f] text-white shadow-lg shadow-blue-900/10'
                : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50 hover:text-[#00236f]'
              }`}
          >
            {dept}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[40px] shadow-xl shadow-blue-900/5 p-8 border border-gray-50 overflow-hidden">
            
            
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest py-2">
                  {d}
                </div>
              ))}
            </div>

            
            <div className="grid grid-cols-7 gap-3 min-h-[480px]">
              
              
              {paddingDays.map((_, i) => (
                <div key={`pad-${i}`} className="bg-gray-50/30 rounded-2xl border border-dashed border-gray-100/50" />
              ))}

              
              {dateInterval.map((date) => {
                const dayLeaves = getLeavesForDate(date);
                const isToday = isSameDay(date, new Date());
                
                return (
                  <div 
                    key={date.toString()}
                    className={`bg-white rounded-2xl border p-3 flex flex-col min-h-[100px] justify-between transition-all group hover:border-[#00236f]/30
                      ${isToday ? 'border-[#00236f]/30 shadow-md shadow-blue-900/5' : 'border-gray-100'}
                    `}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg transition-all
                        ${isToday 
                          ? 'bg-[#00236f] text-white font-black' 
                          : 'text-gray-600 group-hover:bg-gray-50'
                        }
                      `}>
                        {date.getDate()}
                      </span>
                    </div>

                    
                    <div className="space-y-1.5 flex-1 flex flex-col justify-end overflow-y-auto max-h-[70px] pr-0.5 custom-scrollbar">
                      {dayLeaves.map((l) => {
                        const initials = l.applicant 
                          ? `${l.applicant.firstName.charAt(0)}${l.applicant.lastName.charAt(0)}` 
                          : l.userName?.slice(0, 2).toUpperCase() || 'EMP';
                        
                        return (
                          <div 
                            key={l.id}
                            className={`px-1.5 py-1 rounded-lg border text-[8px] font-bold uppercase tracking-wide truncate flex items-center gap-1 transition-all ${getDeptColorClass(l.applicant?.department || 'Operations')}`}
                            title={`${l.applicant ? `${l.applicant.firstName} ${l.applicant.lastName}` : 'Employee'} (${l.applicant?.department || 'Operations'}) - ${typeof l.leaveType === 'string' ? l.leaveType : l.leaveType?.name}`}
                          >
                            <span className="font-black opacity-45 shrink-0 bg-white/40 px-1 rounded-[4px]">{initials}</span>
                            <span className="truncate">{l.applicant ? `${l.applicant.firstName}` : 'Colleague'}</span>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })}

            </div>

          </div>
        </div>

        
        <div className="space-y-6">
          <div className="bg-white rounded-[40px] shadow-xl shadow-blue-900/5 p-8 border border-gray-50 relative overflow-hidden h-full flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#00236f] mb-6 flex items-center gap-3 uppercase tracking-widest" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                <ClipboardList className="w-6 h-6 text-[#00236f]" /> UPCOMING ABSENCES
              </h2>

              {upcomingAbsences.length === 0 ? (
                <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-3xl flex items-center gap-3">
                  <Circle className="w-4 h-4 text-emerald-500 animate-pulse fill-emerald-500" />
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-[#065f46] block mb-0.5">Status: Operational</span>
                    <p className="text-[10px] font-bold text-[#065f46] uppercase leading-snug">All personnel present for the planning cycle</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                  {upcomingAbsences.map((l) => (
                    <div key={l.id} className="p-3.5 bg-gray-50/50 rounded-2xl border border-gray-100/50 hover:bg-[#dce1ff]/10 transition-all duration-300">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-[11px] font-bold text-[#00236f] uppercase tracking-wide">
                            {l.applicant ? `${l.applicant.firstName} ${l.applicant.lastName}` : 'Colleague'}
                          </p>
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                            {l.applicant?.department || 'Operations'}
                          </p>
                        </div>
                        <span className="bg-[#00236f]/5 text-[#00236f] px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">
                          {l.days || l.totalDays} Days
                        </span>
                      </div>
                      
                      <div className="mt-2.5 pt-2 border-t border-gray-100/50 flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-gray-400">
                        <span>{format(new Date(l.fromDate), 'MMM dd')} - {format(new Date(l.toDate), 'MMM dd')}</span>
                        <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">Approved</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 p-5 bg-blue-50/50 rounded-3xl border border-blue-100/50">
              <p className="text-[10px] font-bold text-[#00236f] uppercase tracking-widest opacity-40 mb-3 italic">Planning Rule</p>
              <p className="text-xs text-blue-900 leading-relaxed font-medium">
                Before submitting a leave request, ensure your team segment remains above 70% active allocation capacity.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default TeamCalendar;
