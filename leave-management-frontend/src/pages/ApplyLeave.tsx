import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveService } from '../services/leaveService';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';
import { differenceInDays, parseISO } from 'date-fns';
import { Info, Clock, ArrowRight, Sparkles, Paperclip, X } from 'lucide-react';

const ApplyLeave: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [fileData, setFileData] = useState<{ document: string; documentName: string } | null>(null);

  
  const [showAiAssist, setShowAiAssist] = useState(false);
  const [aiTone, setAiTone] = useState<'formal' | 'medical' | 'vacation' | 'urgent'>('formal');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = parseISO(formData.startDate);
      const end = parseISO(formData.endDate);
      return differenceInDays(end, start) + 1;
    }
    return 0;
  };

  const days = calculateDays();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileData({
          document: reader.result as string,
          documentName: file.name,
        });
        toast.success(`Attached: ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiAssist = async () => {
    if (!formData.reason || formData.reason.trim().length < 3) {
      toast.error('Please write a short draft in the reason field first (at least 3 characters)');
      return;
    }
    setAiLoading(true);
    setAiSuggestion('');
    try {
      const response = await leaveService.getAiAssist(formData.reason, aiTone);
      setAiSuggestion(response.suggestion);
      toast.success('AI generated a professional draft suggestion!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'AI Assist failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (days <= 0) {
      toast.error('End date must be after start date');
      return;
    }

    type LeaveBalanceKey = 'casual' | 'sick' | 'annual';

    if (formData.leaveType !== 'unpaid') {
      const balanceKey = formData.leaveType as LeaveBalanceKey;

      if (user!.leaveBalance[balanceKey] < days) {
        toast.error('Insufficient leave balance');
        return;
      }
    }
    setLoading(true);
    try {
      await leaveService.applyLeave({
        ...formData,
        days,
        document: fileData?.document || undefined,
        documentName: fileData?.documentName || undefined,
      });
      toast.success('Leave application submitted successfully!');
      navigate('/app/my-leaves');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to apply leave');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 font-sans antialiased">
      
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-1.5 h-6 bg-[#00236f] rounded-full" />
          <h1 className="text-3xl font-bold text-[#00236f] uppercase tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            LEAVE APPLICATION
          </h1>
        </div>
        <p className="text-gray-400 font-medium ml-4 italic opacity-85 uppercase tracking-widest text-[9px]">
          Request time off and notify management instantly
        </p>
      </div>

      
      <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 p-6 sm:p-8 border border-gray-100/80">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-[#444651] opacity-60 ml-0.5">
              Select Leave Type
            </label>
            <div className="relative">
              <select
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#00236f] focus:border-transparent outline-none transition-all font-bold text-xs uppercase tracking-wider text-[#00236f] appearance-none cursor-pointer hover:bg-gray-100"
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                required
              >
                <option value="casual">Casual Leave ({user?.leaveBalance.casual} available)</option>
                <option value="sick">Sick Leave ({user?.leaveBalance.sick} available)</option>
                <option value="annual">Annual Leave ({user?.leaveBalance.annual} available)</option>
                <option value="unpaid">Unpaid Leave (Unlimited)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                <Info className="w-4 h-4 text-[#00236f]" />
              </div>
            </div>
          </div>

          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-[#444651] opacity-60 ml-0.5">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#00236f] focus:border-transparent outline-none transition-all font-semibold text-sm text-[#00236f]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-[#444651] opacity-60 ml-0.5">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate}
                required
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#00236f] focus:border-transparent outline-none transition-all font-semibold text-sm text-[#00236f]"
              />
            </div>
          </div>

          
          {days > 0 && (
            <div className="p-4 bg-[#dce1ff]/40 border border-[#00236f]/5 rounded-2xl flex items-center justify-between animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2.5 rounded-xl text-[#00236f] shadow-sm">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#00236f]/60 block mb-0.5">Calculated Duration</span>
                  <p className="text-sm font-black text-[#00236f] uppercase tracking-wider">
                    {days} Day{days > 1 ? 's' : ''} of absence
                  </p>
                </div>
              </div>
              <div className="bg-[#00236f] text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">
                VERIFIED
              </div>
            </div>
          )}

          
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[9px] font-black uppercase tracking-widest text-[#444651] opacity-60 ml-0.5">
                Provide Reason
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowAiAssist(!showAiAssist);
                  setAiSuggestion('');
                }}
                className="bg-blue-500/20 backdrop-blur-md hover:bg-blue-500/30 text-[#00236f] px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-1 border border-blue-400/30 cursor-pointer shadow-[0_4px_12px_rgba(31,38,135,0.05)] hover:shadow-[0_4px_12px_rgba(31,38,135,0.1)]"
              >
                <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Sentence Assist</span>
              </button>
            </div>
            <textarea
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#00236f] focus:border-transparent outline-none transition-all font-semibold text-sm text-gray-700 hover:bg-gray-100/50 placeholder-gray-400"
              rows={4}
              placeholder="Please explain the details of your request... (e.g. sick leave today)"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
            />
          </div>

          
          {showAiAssist && (
            <div className="p-5 bg-gradient-to-r from-[#faf8ff] to-[#f4f6ff] border border-[#00236f]/5 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#00236f]/60 block mb-0.5">AI Assist Active</span>
                  <p className="text-xs font-bold text-[#00236f] uppercase">Formulate formal text from draft</p>
                </div>
                
                
                <div className="flex flex-wrap gap-1.5">
                  {(['formal', 'medical', 'vacation', 'urgent'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAiTone(t)}
                      className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border-none cursor-pointer
                        ${aiTone === t 
                          ? 'bg-[#00236f] text-white shadow-sm' 
                          : 'bg-white text-gray-400 hover:text-[#00236f]'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-100/50">
                <button
                  type="button"
                  onClick={handleAiAssist}
                  disabled={aiLoading}
                  className="bg-blue-600/70 backdrop-blur-xl hover:bg-blue-600/80 text-white px-4 py-2 rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all border border-white/30 cursor-pointer flex items-center gap-1.5 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.3)] hover:-translate-y-0.5"
                >
                  {aiLoading ? 'Analyzing...' : <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Auto-Formulate</span>}
                </button>
              </div>

              {aiSuggestion && (
                <div className="space-y-3 pt-3 border-t border-gray-100/50 animate-in fade-in duration-300">
                  <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-0.5">AI Suggestion Preview</p>
                    <p className="text-xs text-gray-600 font-medium italic leading-relaxed">"{aiSuggestion}"</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, reason: aiSuggestion });
                        setShowAiAssist(false);
                        setAiSuggestion('');
                        toast.success('AI Suggestion applied successfully!');
                      }}
                      className="bg-emerald-500/70 backdrop-blur-xl hover:bg-emerald-500/80 text-white px-4 py-2 rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all border border-white/30 cursor-pointer shadow-[0_8px_32px_0_rgba(16,185,129,0.2)] hover:shadow-[0_8px_32px_0_rgba(16,185,129,0.3)] hover:-translate-y-0.5"
                    >
                      Apply Suggestion
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiSuggestion('')}
                      className="bg-white/50 backdrop-blur-xl text-[#00236f] px-4 py-2 rounded-xl font-bold text-[9px] uppercase tracking-widest hover:bg-white/70 transition-all border border-white/60 cursor-pointer shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:-translate-y-0.5"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-[#444651] opacity-60 ml-0.5">
              Supporting Document (Optional, Max 5MB)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-gray-200 hover:border-[#00236f] hover:bg-gray-50/50 rounded-2xl p-4 cursor-pointer transition-all duration-300">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                  {fileData ? <span className="flex items-center justify-center gap-1"><Paperclip className="w-3 h-3" /> {fileData.documentName}</span> : 'Select Document (PDF, JPEG, PNG...)'}
                </span>
              </label>
              {fileData && (
                <button
                  type="button"
                  onClick={() => setFileData(null)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-4 py-4 rounded-2xl text-xs transition-all border-none cursor-pointer"
                  title="Remove attachment"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          
          <div className="pt-4 border-t border-gray-100 flex flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600/70 backdrop-blur-xl hover:bg-blue-600/80 text-white px-6 py-2.5 rounded-xl font-bold shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.3)] hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-white/30 text-[9px] uppercase tracking-widest"
            >
              {loading ? 'Submitting...' : 'Submit'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/dashboard')}
              className="bg-white/50 backdrop-blur-xl text-[#00236f] px-6 py-2.5 rounded-xl font-bold text-[9px] uppercase tracking-widest hover:bg-white/70 active:scale-95 transition-all shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:-translate-y-0.5 border border-white/60"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeave;