import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Trash2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface Holiday {
  id: string;
  date: string;
  name: string;
  isOptional: boolean;
}

const HolidayCalendar: React.FC = () => {
  const { user } = useAuthStore();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '', isOptional: false });

  useEffect(() => {
    fetchHolidays();
  }, [currentYear]);

  const fetchHolidays = async () => {
    try {
      const response = await api.get(`/holidays?year=${currentYear}`);
      setHolidays(response.data);
    } catch (error) {
      console.error('Error fetching holidays:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post('/holidays', {
        date: newHoliday.date,
        name: newHoliday.name,
        isOptional: newHoliday.isOptional
      });

      toast.success('Holiday added successfully!');
      setNewHoliday({ date: '', name: '', isOptional: false });
      setShowForm(false);
      fetchHolidays();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error adding holiday');
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;

    try {
      await api.delete(`/holidays/${id}`);
      toast.success('Holiday deleted');
      fetchHolidays();
    } catch (error: any) {
      toast.error('Error deleting holiday');
    }
  };

  const holidaysByMonth = holidays.reduce((acc, holiday) => {
    const month = new Date(holiday.date).getMonth();
    if (!acc[month]) acc[month] = [];
    acc[month].push(holiday);
    return acc;
  }, {} as Record<number, Holiday[]>);

  const months = Array.from({ length: 12 }, (_, i) => ({
    index: i,
    name: new Date(currentYear, i, 1).toLocaleDateString('en-US', { month: 'long' })
  }));

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 font-sans antialiased">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-[#00236f] rounded-full" />
            <h1 className="text-5xl font-bold text-[#00236f] uppercase tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              ANNUAL CALENDAR
            </h1>
          </div>
          <p className="text-gray-500 font-medium ml-5 italic opacity-80 uppercase tracking-widest text-[10px]">Official Holiday Schedule & Observances for {currentYear}</p>
        </div>

        <div className="flex items-center gap-4">
          <select 
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="px-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#00236f] outline-none font-bold text-[#00236f] uppercase tracking-widest text-[10px] appearance-none cursor-pointer hover:bg-gray-50 transition-all"
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <button 
              onClick={() => setShowForm(!showForm)} 
              className="bg-[#1e3a8a] hover:bg-[#00236f] text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-900/10 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 border-none text-[10px] uppercase tracking-widest"
            >
              <Plus className="w-4 h-4" />
              Add Record
            </button>
          )}
        </div>
      </div>

      
      {showForm && (user?.role === 'admin' || user?.role === 'manager') && (
        <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-white rounded-[40px] shadow-2xl shadow-blue-900/5 p-10 border border-gray-50">
            <h3 className="text-xl font-bold text-[#00236f] mb-8 uppercase tracking-widest" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>New Calendar Entry</h3>
            <form onSubmit={handleAddHoliday}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#444651] opacity-60 ml-1">Event Date</label>
                  <input
                    type="date"
                    value={newHoliday.date}
                    onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                    required
                    className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#00236f] outline-none transition-all font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#444651] opacity-60 ml-1">Event Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Annual Summit"
                    value={newHoliday.name}
                    onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                    required
                    className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#00236f] outline-none transition-all font-medium"
                  />
                </div>
                <div className="flex items-end pb-3">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={newHoliday.isOptional}
                      onChange={(e) => setNewHoliday({ ...newHoliday, isOptional: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-200 text-[#00236f] focus:ring-[#00236f] cursor-pointer"
                    />
                    <span className="text-[10px] font-black text-[#444651] uppercase tracking-widest group-hover:text-[#00236f] transition-colors">Optional Observance</span>
                  </label>
                </div>
              </div>
              <div className="mt-10 flex gap-4">
                <button type="submit" className="bg-[#00236f] text-white px-8 py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/10 hover:-translate-y-0.5 transition-all">Submit Entry</button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-50 text-[#444651] px-8 py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00236f] mb-4" />
          <p className="text-[#00236f] text-[10px] font-black uppercase tracking-widest opacity-40">Syncing Corporate Calendar...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {months.map((month) => {
            const monthHolidays = holidaysByMonth[month.index] || [];
            
            return (
              <div key={month.index} className="flex flex-col">
                <div className="mb-6 flex items-center justify-between px-2">
                  <h2 className="text-2xl font-bold text-[#00236f] uppercase tracking-wider" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{month.name}</h2>
                  <span className="text-[8px] font-black bg-[#00236f]/5 text-[#00236f] px-3 py-1.5 rounded-full tracking-widest">
                    {monthHolidays.length} {monthHolidays.length === 1 ? 'EVENT' : 'EVENTS'}
                  </span>
                </div>
                
                <div className="bg-white rounded-[40px] shadow-xl shadow-blue-900/5 border border-gray-100 p-6 flex-1 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500">
                  {monthHolidays.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 opacity-10">
                      <CalendarIcon className="w-12 h-12 mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Open Schedule</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {monthHolidays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((holiday) => (
                        <div
                          key={holiday.id}
                          className={`group relative flex justify-between items-center p-5 rounded-[24px] transition-all duration-300 border
                            ${holiday.isOptional ? 'bg-amber-50/30 border-amber-100/50' : 'bg-blue-50/30 border-blue-100/50'}`}
                        >
                          <div className="flex gap-4 items-center">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm
                              ${holiday.isOptional ? 'bg-white text-amber-500' : 'bg-white text-blue-500'}`}>
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-black text-[#00236f] uppercase tracking-wide text-xs leading-tight mb-1">
                                {holiday.name}
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  {format(new Date(holiday.date), 'EEE, MMM dd')}
                                </p>
                                {holiday.isOptional && (
                                  <span className="text-[7px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">Optional</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {(user?.role === 'admin' || user?.role === 'manager') && (
                            <button
                              onClick={() => handleDeleteHoliday(holiday.id)}
                              className="text-gray-300 hover:text-rose-600 hover:bg-rose-50 w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HolidayCalendar;