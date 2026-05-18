import React, { useEffect, useState } from 'react';
import { leaveService } from '../services/leaveService';
import type { Leave } from '../types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ArrowUpDown, Paperclip } from 'lucide-react';

const ApproveLeaves: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'appliedAt-desc' | 'appliedAt-asc' | 'fromDate-asc' | 'fromDate-desc' | 'days-desc' | 'days-asc' | 'name-asc'>('appliedAt-desc');

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const fetchPendingLeaves = async () => {
    try {
      const data = await leaveService.getPendingLeaves();
      setLeaves(data);
    } catch (error) {
      console.error('Error fetching pending leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await leaveService.updateLeaveStatus(id, 'approved');
      toast.success('Leave approved successfully');
      fetchPendingLeaves();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve leave');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setActionLoading(id);
    try {
      await leaveService.updateLeaveStatus(id, 'rejected', rejectionReason);
      toast.success('Leave rejected');
      setRejectingId(null);
      setRejectionReason('');
      fetchPendingLeaves();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject leave');
    } finally {
      setActionLoading(null);
    }
  };

  const getSortedLeaves = () => {
    return [...leaves].sort((a, b) => {
      switch (sortBy) {
        case 'appliedAt-desc':
          return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
        case 'appliedAt-asc':
          return new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime();
        case 'fromDate-asc':
          return new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime();
        case 'fromDate-desc':
          return new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime();
        case 'days-desc':
          return (b.days || b.totalDays) - (a.days || a.totalDays);
        case 'days-asc':
          return (a.days || a.totalDays) - (b.days || b.totalDays);
        case 'name-asc':
          const nameA = `${a.applicant?.firstName || ''} ${a.applicant?.lastName || ''}`.toLowerCase();
          const nameB = `${b.applicant?.firstName || ''} ${b.applicant?.lastName || ''}`.toLowerCase();
          return nameA.localeCompare(nameB);
        default:
          return 0;
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00236f] mb-4" />
        <p className="text-[#00236f] text-[10px] font-black uppercase tracking-widest opacity-40">Syncing Approval Desk...</p>
      </div>
    );
  }

  const sortedLeaves = getSortedLeaves();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 font-sans antialiased">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-[#00236f] rounded-full" />
            <h1 className="text-5xl font-bold text-[#00236f] uppercase tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              APPROVAL DESK
            </h1>
          </div>
          <p className="text-gray-500 font-medium ml-5 italic opacity-80 uppercase tracking-widest text-[10px]">Strategic review and authorization of resource requests</p>
        </div>

        
        <div className="flex items-center gap-3 bg-white border border-gray-100 px-4 py-2.5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <ArrowUpDown className="w-4 h-4 text-[#00236f] opacity-80" />
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-[#00236f] outline-none cursor-pointer hover:opacity-85 transition-opacity pr-2"
          >
            <option value="appliedAt-desc">Submission: Newest First</option>
            <option value="appliedAt-asc">Submission: Oldest First</option>
            <option value="fromDate-asc">Start Date: Earliest First</option>
            <option value="fromDate-desc">Start Date: Latest First</option>
            <option value="days-desc">Duration: Longest First</option>
            <option value="days-asc">Duration: Shortest First</option>
            <option value="name-asc">Applicant Name: A-Z</option>
          </select>
        </div>
      </div>

      {sortedLeaves.length === 0 ? (
        <div className="bg-white rounded-[40px] border border-dashed border-gray-200 p-24 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-gray-300 text-3xl font-bold">0</span>
          </div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Queue Clear: All Directives Processed</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedLeaves.map((leave: any) => (
            <div key={leave.id} className="bg-white rounded-[40px] shadow-2xl shadow-blue-900/5 border border-gray-100 overflow-hidden group hover:shadow-blue-900/10 transition-all duration-500">
              <div className="flex flex-col lg:flex-row">
                
                <div className="lg:w-80 bg-gray-50/50 p-8 border-r border-gray-50">
                  <div className="text-center lg:text-left mb-8">
                    <div className="w-20 h-20 bg-[#00236f] rounded-3xl flex items-center justify-center text-white text-3xl font-bold mx-auto lg:mx-0 mb-4 shadow-lg shadow-blue-900/20" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      {leave.applicant?.firstName.charAt(0)}{leave.applicant?.lastName.charAt(0)}
                    </div>
                    <h3 className="text-xl font-bold text-[#00236f] uppercase tracking-wide" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      {leave.applicant?.firstName} {leave.applicant?.lastName}
                    </h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{leave.applicant?.department}</p>
                    <p className="text-[9px] font-medium text-gray-500 mt-2 truncate italic opacity-60">{leave.applicant?.email}</p>
                  </div>

                  
                  {leave.applicant?.leaves && leave.applicant.leaves.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#00236f] opacity-40">Previous History</span>
                      </div>
                      <div className="space-y-2">
                        {leave.applicant.leaves.slice(0, 3).map((prev: any) => (
                          <div key={prev.id} className="bg-white border border-gray-100 p-3 rounded-2xl shadow-sm">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[8px] font-black text-[#00236f] uppercase tracking-tighter">{typeof prev.leaveType === 'string' ? prev.leaveType : prev.leaveType?.name}</span>
                              <span className="text-[8px] font-bold text-gray-400">{prev.totalDays} Days</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[7px] font-bold text-gray-400 uppercase">{format(new Date(prev.fromDate), 'MMM dd')} - {format(new Date(prev.toDate), 'MMM dd')}</span>
                              {prev.approver && (
                                <span className="text-[6px] font-black text-[#00236f]/30 uppercase tracking-tighter">Auth: {prev.approver.lastName}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                
                <div className="flex-1 p-8 lg:p-10">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <span className="bg-[#00236f]/5 text-[#00236f] px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-900/10">
                        {typeof leave.leaveType === 'string' ? leave.leaveType : leave.leaveType?.name} LEAVE DIRECTIVE
                      </span>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="text-center">
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Duration</p>
                          <p className="text-2xl font-bold text-[#00236f]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{leave.days || leave.totalDays} DAYS</p>
                        </div>
                        <div className="h-8 w-px bg-gray-100" />
                        <div className="text-center">
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Period</p>
                          <p className="text-[11px] font-bold text-[#00236f] uppercase tracking-wider">{format(new Date(leave.fromDate), 'MMM dd')} — {format(new Date(leave.toDate), 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 text-right">Submission Date</p>
                      <p className="text-[10px] font-bold text-[#00236f] opacity-40 text-right uppercase tracking-widest">{format(new Date(leave.appliedAt), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 mb-10">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Stated Reason for Absence</p>
                    <p className="text-sm text-[#444651] font-medium italic opacity-80 leading-relaxed group-hover:opacity-100 transition-opacity">"{leave.reason}"</p>
                  </div>

                  {leave.documentPath && (
                    <div className="bg-[#dce1ff]/20 border border-[#00236f]/5 p-5 rounded-3xl mb-10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2.5 rounded-xl text-[#00236f] shadow-sm">
                          <Paperclip className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[8px] font-black uppercase tracking-widest text-[#00236f]/60 block mb-0.5">Supporting Document</span>
                          <p className="text-xs font-bold text-[#00236f] uppercase tracking-wider">Attachment Provided</p>
                        </div>
                      </div>
                      <a
                        href={`http://localhost:5000${leave.documentPath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#00236f] hover:bg-[#1e3a8a] text-white px-5 py-2.5 rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all shadow-md shadow-blue-900/10 active:scale-95 cursor-pointer no-underline"
                      >
                        Review Attachment
                      </a>
                    </div>
                  )}

                  
                  {rejectingId === leave.id ? (
                    <div className="animate-in slide-in-from-bottom-2 duration-300">
                      <textarea
                        className="w-full px-5 py-4 bg-rose-50/30 border border-rose-100 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none text-sm font-medium mb-4"
                        rows={3}
                        placeholder="State administrative grounds for denial..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      />
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleReject(leave.id)}
                          disabled={actionLoading === leave.id}
                          className="flex-1 bg-rose-500/70 backdrop-blur-xl border border-white/30 text-white px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-[0_8px_32px_0_rgba(225,29,72,0.2)] hover:bg-rose-500/80 hover:shadow-[0_8px_32px_0_rgba(225,29,72,0.3)] transition-all hover:-translate-y-0.5"
                        >
                          {actionLoading === leave.id ? 'DENYING...' : 'CONFIRM DENIAL'}
                        </button>
                        <button
                          onClick={() => {
                            setRejectingId(null);
                            setRejectionReason('');
                          }}
                          className="bg-white/50 backdrop-blur-xl border border-white/60 text-[#00236f] px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] hover:bg-white/70 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] transition-all hover:-translate-y-0.5"
                        >
                          ABORT
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleApprove(leave.id)}
                        disabled={actionLoading === leave.id}
                        className="flex-[2] bg-emerald-500/70 backdrop-blur-xl border border-white/30 text-white px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-[0_8px_32px_0_rgba(16,185,129,0.2)] hover:bg-emerald-500/80 hover:shadow-[0_8px_32px_0_rgba(16,185,129,0.3)] transition-all hover:-translate-y-1 active:translate-y-0"
                      >
                        {actionLoading === leave.id ? 'AUTHORIZING...' : 'AUTHORIZE REQUEST'}
                      </button>
                      <button
                        onClick={() => setRejectingId(leave.id)}
                        disabled={actionLoading === leave.id}
                        className="flex-1 bg-white/50 backdrop-blur-xl border border-white/60 text-[#00236f] px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] hover:bg-rose-500/20 hover:text-rose-700 hover:border-rose-300 hover:shadow-[0_8px_32px_0_rgba(225,29,72,0.15)] transition-all hover:-translate-y-1"
                      >
                        DENY
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApproveLeaves;