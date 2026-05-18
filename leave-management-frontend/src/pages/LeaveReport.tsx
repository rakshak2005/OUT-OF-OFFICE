import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leaveService } from '../services/leaveService';
import type { Leave } from '../types';
import { format } from 'date-fns';
import { Printer, XCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const LeaveReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [leave, setLeave] = useState<Leave | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchLeaveDetail();
    }
  }, [id]);

  const fetchLeaveDetail = async () => {
    try {
      const data = await leaveService.getLeaveById(id!);
      setLeave(data);
    } catch (error: any) {
      console.error('Error fetching leave report:', error);
      toast.error('Failed to load leave report details');
      navigate('/app/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00236f] mb-3" />
        <span className="text-[10px] font-black uppercase tracking-widest text-[#00236f] opacity-40">Compiling Report Archives...</span>
      </div>
    );
  }

  if (!leave) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-sans">
        <XCircle className="w-12 h-12 text-rose-500 mb-3" />
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Report Not Found</p>
      </div>
    );
  }

  const applicantName = leave.applicant 
    ? `${leave.applicant.firstName} ${leave.applicant.lastName}` 
    : leave.userName || 'Employee';

  const approverName = leave.approver 
    ? `${leave.approver.firstName} ${leave.approver.lastName}` 
    : 'System Administrator';

  const formatedFromDate = format(new Date(leave.fromDate), 'MMMM dd, yyyy');
  const formatedToDate = format(new Date(leave.toDate), 'MMMM dd, yyyy');
  const formatedApplied = format(new Date(leave.appliedAt), 'MMMM dd, yyyy');
  const formatedDecided = leave.decidedAt ? format(new Date(leave.decidedAt), 'MMMM dd, yyyy') : '';

  return (
    <div className="min-h-screen bg-gray-100/50 py-8 print:bg-white print:py-0 font-sans antialiased">
      
      <div className="max-w-4xl mx-auto mb-6 px-4 print:hidden">
        <div className="bg-white border border-gray-100 shadow-xl shadow-blue-900/5 px-6 py-4 rounded-3xl flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 block">Status: Verified</span>
              <span className="text-xs font-bold text-[#00236f] uppercase tracking-wider">Leave Report #{leave.id.toString().slice(0, 8).toUpperCase()}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-[#00236f] hover:bg-[#1e3a8a] text-white px-5 py-2.5 rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-md shadow-blue-900/10 cursor-pointer border-none"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={() => window.close()}
              className="bg-gray-100 text-[#444651] px-5 py-2.5 rounded-xl font-bold text-[9px] uppercase tracking-widest hover:bg-gray-200 transition-all cursor-pointer border-none"
            >
              Close Tab
            </button>
          </div>
        </div>
      </div>

      
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 print:border-none p-12 print:p-0 rounded-[32px] shadow-2xl shadow-blue-900/5 print:shadow-none min-h-[1050px] relative overflow-hidden flex flex-col justify-between">
        
        
        <div>
          
          <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-6 bg-[#00236f] rounded-full" />
                <span className="text-2xl font-black text-[#00236f] tracking-tighter uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  OOO PORTAL
                </span>
              </div>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Official Absence Certification</p>
              <p className="text-[8px] font-medium text-gray-500">Document Authority Ref: OOO-ABS-{leave.id.toUpperCase()}</p>
            </div>
            <div className="text-right">
              <span className="bg-emerald-500/10 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 inline-block mb-3">
                {leave.status}
              </span>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Date of Issue</p>
              <p className="text-[10px] font-bold text-[#00236f]">{format(new Date(), 'MMMM dd, yyyy')}</p>
            </div>
          </div>

          <div className="mb-10 text-center relative">
            <h1 className="text-4xl font-bold text-[#00236f] uppercase tracking-tight mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              ABSENCE DIRECTIVE REPORT
            </h1>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Approved leave directive details & administrative audit logs</p>
            
            
            <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] border-4 border-emerald-500/20 text-emerald-500/10 rounded-3xl p-6 text-7xl font-black uppercase tracking-widest rotate-[-12deg] pointer-events-none select-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              AUTHORIZED
            </div>
          </div>

          
          <div className="mb-10">
            <h3 className="text-[10px] font-black text-[#00236f] uppercase tracking-[0.25em] border-b border-gray-100 pb-2 mb-4">
              I. Employee Profile Credentials
            </h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
              <div>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Employee Name</span>
                <span className="text-xs font-bold text-[#444651] uppercase">{applicantName}</span>
              </div>
              <div>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Department / Segment</span>
                <span className="text-xs font-bold text-[#444651] uppercase">{leave.applicant?.department || 'Operations'}</span>
              </div>
              <div>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Contact Identity</span>
                <span className="text-xs font-semibold text-gray-600">{leave.applicant?.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Employee ID Code</span>
                <span className="text-xs font-semibold text-gray-600 uppercase">EMP-{leave.userId.slice(0, 8)}</span>
              </div>
            </div>
          </div>

          
          <div className="mb-10">
            <h3 className="text-[10px] font-black text-[#00236f] uppercase tracking-[0.25em] border-b border-gray-100 pb-2 mb-4">
              II. Absence Directive Details
            </h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 mb-4">
              <div>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Leave Directive Type</span>
                <span className="text-xs font-bold text-[#00236f] uppercase">{typeof leave.leaveType === 'string' ? leave.leaveType : leave.leaveType?.name} LEAVE</span>
              </div>
              <div>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Total Duration Stated</span>
                <span className="text-xs font-bold text-[#00236f] uppercase">{leave.days || leave.totalDays} Work Day(s)</span>
              </div>
              <div>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Start Date</span>
                <span className="text-xs font-bold text-[#444651]">{formatedFromDate}</span>
              </div>
              <div>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">End Date</span>
                <span className="text-xs font-bold text-[#444651]">{formatedToDate}</span>
              </div>
            </div>
            
            
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-2">Stated Reason for Absence</span>
              <p className="text-xs text-gray-600 font-medium italic leading-relaxed">
                "{leave.reason}"
              </p>
            </div>
          </div>

          
          <div className="mb-10">
            <h3 className="text-[10px] font-black text-[#00236f] uppercase tracking-[0.25em] border-b border-gray-100 pb-2 mb-4">
              III. Administrative Authorization Log
            </h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 mb-4">
              <div>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Authorized Stated Authority</span>
                <span className="text-xs font-bold text-[#00236f] uppercase">{approverName}</span>
              </div>
              <div>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Decision Timestamp</span>
                <span className="text-xs font-semibold text-gray-600">{formatedDecided || 'System Auto'}</span>
              </div>
              <div>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Date Submitted</span>
                <span className="text-xs font-semibold text-gray-600">{formatedApplied}</span>
              </div>
              <div>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Directive Code</span>
                <span className="text-xs font-semibold text-gray-600 uppercase">SYS-AUTH-{leave.id.slice(0, 8)}</span>
              </div>
            </div>
            
            
            {(leave.decisionRemark || leave.rejectionReason) && (
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-2">Administrative Decision Remarks</span>
                <p className="text-xs text-gray-600 font-medium italic leading-relaxed">
                  "{leave.decisionRemark || leave.rejectionReason}"
                </p>
              </div>
            )}
          </div>
        </div>

        
        <div className="border-t border-gray-100 pt-16 mt-16">
          <div className="flex justify-between items-center px-12">
            <div className="text-center w-56">
              <div className="h-px bg-gray-300 w-full mb-3" />
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">Signature of Employee</span>
              <p className="text-[10px] font-bold text-[#00236f] uppercase mt-1">{applicantName}</p>
            </div>
            <div className="text-center w-56">
              <div className="h-px bg-gray-300 w-full mb-3" />
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">Authorized Signatory</span>
              <p className="text-[10px] font-bold text-[#00236f] uppercase mt-1">{approverName}</p>
            </div>
          </div>
          
          
          <div className="text-center mt-16 text-[8px] font-black text-gray-300 uppercase tracking-[0.35em]">
            Authorized Directive Certificate • Generated by OOO System
          </div>
        </div>

      </div>
    </div>
  );
};

export default LeaveReport;
