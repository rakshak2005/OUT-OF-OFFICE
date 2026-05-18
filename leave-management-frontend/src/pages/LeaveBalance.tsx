import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { BarChart3 } from 'lucide-react';

interface LeaveType {
  type: string;
  allocated: number;
  used: number;
  remaining: number;
  carriedForward: number;
}

const LeaveBalance: React.FC = () => {
  const { user } = useAuthStore();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      
      const types: LeaveType[] = [
        {
          type: 'Casual',
          allocated: 12,
          used: 12 - user.leaveBalance.casual,
          remaining: user.leaveBalance.casual,
          carriedForward: 0,
        },
        {
          type: 'Sick',
          allocated: 10,
          used: 10 - user.leaveBalance.sick,
          remaining: user.leaveBalance.sick,
          carriedForward: 0,
        },
        {
          type: 'Annual',
          allocated: 20,
          used: 20 - user.leaveBalance.annual,
          remaining: user.leaveBalance.annual,
          carriedForward: 0,
        },
      ];
      setLeaveTypes(types);
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 font-sans antialiased">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-8 bg-[#00236f] rounded-full" />
          <h1 className="text-5xl font-bold text-[#00236f] uppercase tracking-tight font-bebas">
            RESOURCE QUOTA
          </h1>
        </div>
        <p className="text-gray-500 font-medium ml-5 italic opacity-80 uppercase tracking-widest text-[10px]">Individual Leave Entitlements & Utilization</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00236f]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {leaveTypes.map((leave) => {
            const usedPercentage = (leave.used / leave.allocated) * 100;
            return (
              <div key={leave.type} className="bg-white rounded-[40px] shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden group hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500">
                <div className="p-8 md:p-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#00236f]/5 rounded-2xl flex items-center justify-center text-[#00236f]">
                        <BarChart3 className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-[#00236f] uppercase tracking-wider font-bebas">{leave.type} LEAVE</h2>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Entitlement</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-10">
                      <div className="text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Allocated</p>
                        <p className="text-3xl font-bold text-[#00236f] font-bebas">{leave.allocated}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Used</p>
                        <p className="text-3xl font-bold text-rose-500 font-bebas">{leave.used}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Remaining</p>
                        <p className="text-3xl font-bold text-emerald-500 font-bebas">{leave.remaining}</p>
                      </div>
                    </div>
                  </div>

                  
                  <div className="relative">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00236f] opacity-40">Utilization Efficiency</span>
                      <span className={`text-xs font-bold ${usedPercentage > 80 ? 'text-rose-600' : 'text-[#00236f]'}`}>
                        {Math.round(usedPercentage)}% Consumed
                      </span>
                    </div>
                    
                    <div className="h-4 w-full bg-gray-50 rounded-full overflow-hidden p-1 border border-gray-100">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
                          usedPercentage >= 80 ? 'bg-gradient-to-r from-rose-400 to-rose-600' : 
                          usedPercentage >= 50 ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 
                          'bg-gradient-to-r from-emerald-400 to-emerald-600'
                        }`}
                        style={{ width: `${Math.min(usedPercentage, 100)}%` }}
                      />
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between opacity-30">
                      <span className="text-[8px] font-bold uppercase tracking-widest">Base Allocation</span>
                      <span className="text-[8px] font-bold uppercase tracking-widest">Limit Reach</span>
                    </div>
                  </div>
                </div>
                
                
                <div className="bg-gray-50/50 px-8 py-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Audited Real-time</span>
                  </div>
                  <span className="text-[9px] font-bold text-[#00236f] opacity-40 uppercase tracking-widest">Carried Forward: {leave.carriedForward} Days</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LeaveBalance;