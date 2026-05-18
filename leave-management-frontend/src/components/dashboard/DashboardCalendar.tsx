import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import api from '../../services/api';

interface Holiday {
  id: string;
  date: string;
  name: string;
  isOptional: boolean;
}

interface Leave {
  id: string;
  fromDate: string;
  toDate: string;
  leaveType: any;
  status: string;
}

const DashboardCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    try {
      const year = currentDate.getFullYear();
      const [holidayRes, leaveRes] = await Promise.all([
        api.get(`/holidays?year=${year}`),
        api.get('/leaves/my-leaves')
      ]);
      setHolidays(holidayRes.data);
      setLeaves(leaveRes.data);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getHolidayForDay = (day: Date) => {
    return holidays.find(h => isSameDay(new Date(h.date), day));
  };

  const getLeaveForDay = (day: Date) => {
    return leaves.find(l => {
      const start = new Date(l.fromDate);
      const end = new Date(l.toDate);
      return day >= start && day <= end && l.status !== 'cancelled';
    });
  };

  return (
    <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100/80 transition-all duration-500 hover:shadow-blue-900/5">
      
      <div className="bg-[#faf8ff] p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-[#dce1ff] text-[#00236f] p-2.5 rounded-xl shadow-sm">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-[#00236f]">Calendar</h2>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Operational Planner</p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 bg-white border border-gray-200/60 rounded-full p-1 shadow-sm">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-gray-50 text-[#444651] hover:text-[#00236f] rounded-full transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-bold text-[#00236f] text-xs uppercase tracking-widest min-w-[120px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-gray-50 text-[#444651] hover:text-[#00236f] rounded-full transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center mt-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-[10px] font-black uppercase tracking-widest text-[#00236f]/60">
              {day}
            </div>
          ))}
        </div>
      </div>

      
      <div className="p-6 bg-white">
        <div className="grid grid-cols-7 gap-2.5">
          
          {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="h-14" />
          ))}

          {days.map((day) => {
            const holiday = getHolidayForDay(day);
            const leave = getLeaveForDay(day);
            const active = isToday(day);
            
            return (
              <div
                key={day.toString()}
                className={`group relative h-14 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 cursor-default border
                  ${active 
                    ? 'bg-[#00236f] text-white shadow-lg shadow-blue-900/20 scale-105 z-10 border-transparent' 
                    : 'hover:bg-[#faf8ff] hover:text-[#00236f] bg-transparent border-transparent'}
                  ${holiday ? 'border-orange-200/80 bg-orange-50/5' : ''}
                  ${leave && !active ? 'border-blue-200/80 bg-blue-50/5' : ''}`}
              >
                <span className={`text-sm font-bold ${active ? 'text-white font-black' : 'text-[#444651] group-hover:text-[#00236f]'}`}>
                  {format(day, 'd')}
                </span>
                
                {holiday && (
                  <div className={`absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-white
                    ${active ? 'bg-white' : 'bg-orange-500'}`} />
                )}

                {leave && (
                  <div className={`absolute top-2 left-2 w-2 h-2 rounded-full border-2 border-white
                    ${active ? 'bg-white' : 'bg-blue-400'}`} />
                )}

                
                {(holiday || leave) && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-gray-900/95 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20 shadow-xl backdrop-blur-sm">
                    {holiday && (
                      <div className="flex items-start space-x-1.5 mb-1.5 last:mb-0">
                        <MapPin className="w-3.5 h-3.5 text-orange-400 mt-0.5" />
                        <span className="font-semibold uppercase tracking-wider text-orange-300">{holiday.name} (Holiday)</span>
                      </div>
                    )}
                    {leave && (
                      <div className="flex items-start space-x-1.5 last:mb-0">
                        <div className="w-3.5 h-3.5 bg-blue-400 rounded-full mt-0.5" />
                        <span className="font-semibold uppercase tracking-wider text-blue-200">
                          {typeof leave.leaveType === 'string' ? leave.leaveType : leave.leaveType?.name} ({leave.status.toUpperCase()})
                        </span>
                      </div>
                    )}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      
      <div className="px-6 py-4 border-t border-gray-100 bg-[#faf8ff] rounded-b-[32px]">
        <div className="flex items-center space-x-6 text-[10px] font-black uppercase tracking-widest text-[#00236f]/60">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00236f]" />
            <span>Today</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span>Holiday</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <span>Leave</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCalendar;
