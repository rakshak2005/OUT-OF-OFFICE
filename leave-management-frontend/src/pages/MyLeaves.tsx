import React, { useEffect, useState } from 'react';
import { leaveService } from '../services/leaveService';
import type { Leave } from '../types';
import { format } from 'date-fns';
import { Clock, CheckCircle, XCircle, Calendar, Shield, Paperclip } from 'lucide-react';
import { toast } from 'sonner';

const MyLeaves: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const data = await leaveService.getMyLeaves();
      setLeaves(data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const isCancelable = (fromDateStr: string) => {
    const fromDate = new Date(fromDateStr);
    fromDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = fromDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 3;
  };

  const handleCancelLeave = async (leaveId: string) => {
    if (!window.confirm('Are you sure you want to cancel this leave request? Any deducted leave quota will be automatically credited back to your account.')) {
      return;
    }

    try {
      await leaveService.cancelLeave(leaveId);
      toast.success('Leave request cancelled successfully!');
      fetchLeaves();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel leave request');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-500 border border-gray-200',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status as keyof typeof colors]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00236f] mb-4"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-[#00236f] opacity-40">Loading Archive Logs...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 font-sans antialiased">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-8 bg-[#00236f] rounded-full" />
          <h1 className="text-5xl font-bold text-[#00236f] uppercase tracking-tight font-bebas">
            APPLICATION LOGS
          </h1>
        </div>
        <p className="text-gray-500 font-medium ml-5 italic opacity-80 uppercase tracking-widest text-[10px]">Your Personal Leave Request History & Status</p>
      </div>

      {leaves.length === 0 ? (
        <div className="bg-white rounded-[40px] border border-dashed border-gray-200 p-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No active applications found in archives</p>
        </div>
      ) : (
        <div className="space-y-6">
          {leaves.map((leave) => (
            <div key={leave.id} className="bg-white rounded-[32px] shadow-xl shadow-blue-900/5 border border-gray-100 p-8 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 group relative overflow-hidden">
              
              <div className={`absolute top-0 left-0 bottom-0 w-2 ${
                leave.status === 'approved' ? 'bg-emerald-500' :
                leave.status === 'pending' ? 'bg-amber-500' :
                leave.status === 'cancelled' ? 'bg-gray-300' :
                'bg-rose-500'
              }`} />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
                    leave.status === 'approved' ? 'bg-emerald-50' :
                    leave.status === 'pending' ? 'bg-amber-50' :
                    leave.status === 'cancelled' ? 'bg-gray-50' :
                    'bg-rose-50'
                  }`}>
                    {getStatusIcon(leave.status)}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-[#00236f] uppercase tracking-wider font-bebas">
                        {typeof leave.leaveType === 'string' ? leave.leaveType : leave.leaveType?.name} LEAVE
                      </h3>
                      <div className="w-1 h-1 bg-gray-300 rounded-full" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{leave.days} DAY(S)</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      <span className="text-[#00236f]">{format(new Date(leave.fromDate), 'MMM dd, yyyy')}</span>
                      <span className="opacity-30">—</span>
                      <span className="text-[#00236f]">{format(new Date(leave.toDate), 'MMM dd, yyyy')}</span>
                    </div>
                    
                    <p className="text-xs text-gray-400 mt-2 font-medium italic">"{leave.reason}"</p>
                    {leave.documentPath && (
                      <div className="mt-3">
                        <a
                          href={`http://localhost:5000${leave.documentPath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#00236f] bg-[#dce1ff]/50 px-3 py-1.5 rounded-lg hover:bg-[#dce1ff] transition-all"
                        >
                          <span className="flex items-center gap-1"><Paperclip className="w-3 h-3" /> Attached File</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  {getStatusBadge(leave.status)}
                  
                  {leave.status !== 'pending' && (
                    <div className="mt-4 flex flex-col items-end gap-2 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3 text-[#00236f] opacity-40" />
                        <span className="text-[9px] font-black text-[#00236f] uppercase tracking-widest opacity-40">System Audit Trail</span>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-[#444651]">
                          {leave.status === 'approved' ? 'Authorized by' : 
                           leave.status === 'cancelled' ? 'Cancelled by' : 'Denied by'} 
                          <span className="text-[#00236f] ml-1 uppercase">
                            {leave.approver ? `${leave.approver.firstName} ${leave.approver.lastName}` : 'User / System Admin'}
                          </span>
                        </p>
                        {leave.decidedAt && (
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                            {format(new Date(leave.decidedAt), 'MMM dd, yyyy HH:mm')}
                          </p>
                        )}
                      </div>

                      {(leave.decisionRemark || leave.rejectionReason) && (
                        <div className="mt-2 pt-2 border-t border-gray-100 w-full text-right">
                          <p className="text-[9px] text-gray-400 font-medium italic">
                            "{leave.decisionRemark || leave.rejectionReason}"
                          </p>
                        </div>
                      )}

                      {leave.status === 'approved' && (
                        <div className="mt-3 pt-2 border-t border-gray-100 w-full text-right">
                          <button
                            onClick={() => window.open(`/app/leaves/${leave.id}/report`, '_blank')}
                            className="inline-flex items-center gap-1.5 bg-[#00236f] hover:bg-[#1e3a8a] text-white px-3.5 py-2 rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all cursor-pointer border-none shadow-sm"
                          >
                            <span>📥 Download PDF Report</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  
                  {(leave.status === 'pending' || leave.status === 'approved') && (
                    <div className="mt-2">
                      {isCancelable(leave.fromDate) ? (
                        <button
                          onClick={() => handleCancelLeave(leave.id)}
                          className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2 rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all cursor-pointer border border-rose-200 shadow-sm active:scale-95"
                        >
                          <span>🚫 Cancel Leave</span>
                        </button>
                      ) : (
                        <span className="inline-block text-[8px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg select-none">
                          🔒 Cancellation Locked (Requires 3 days notice)
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 opacity-20">
                    <span className="text-[8px] font-bold uppercase tracking-widest">Ref ID: {leave.id.toString().slice(0, 8).toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLeaves;