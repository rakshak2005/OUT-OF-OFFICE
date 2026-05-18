import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { Users, Trash2, FileText, X, History, Plus, Palmtree, Crown, Settings, Key, ClipboardList, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  createdAt: string;
  leaveBalance: {
    casual: number;
    sick: number;
    annual: number;
    total: number;
  };
}

interface UserLeave {
  id: string;
  leaveType: string | { name: string };
  fromDate: string;
  toDate: string;
  totalDays: number;
  status: string;
  reason: string;
  decidedAt?: string;
}

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userLeaves, setUserLeaves] = useState<UserLeave[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  
  const [casualInput, setCasualInput] = useState(0);
  const [sickInput, setSickInput] = useState(0);
  const [annualInput, setAnnualInput] = useState(0);
  const [updatingBalance, setUpdatingBalance] = useState(false);

  
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);

  
  const [showAddModal, setShowAddModal] = useState(false);
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'employee',
    department: 'Operations',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error: any) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLeaves = async (targetUser: User) => {
    setSelectedUser(targetUser);
    setCasualInput(targetUser.leaveBalance?.casual || 0);
    setSickInput(targetUser.leaveBalance?.sick || 0);
    setAnnualInput(targetUser.leaveBalance?.annual || 0);
    setNewPasswordInput('');
    setHistoryLoading(true);
    try {
      const response = await api.get(`/users/${targetUser.id}/leaves`);
      setUserLeaves(response.data);
    } catch (error: any) {
      toast.error('Failed to fetch leave history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleUpdateBalance = async () => {
    if (!selectedUser) return;
    setUpdatingBalance(true);
    try {
      await api.put(`/users/${selectedUser.id}/leave-balance`, {
        casual: casualInput,
        sick: sickInput,
        annual: annualInput,
      });
      toast.success(`Leave balances for ${selectedUser.firstName} altered successfully!`);
      
      
      const updatedUsers = users.map(u => {
        if (u.id === selectedUser.id) {
          return {
            ...u,
            leaveBalance: {
              casual: casualInput,
              sick: sickInput,
              annual: annualInput,
              total: casualInput + sickInput + annualInput
            }
          };
        }
        return u;
      });
      setUsers(updatedUsers);
      setSelectedUser(prev => prev ? {
        ...prev,
        leaveBalance: {
          casual: casualInput,
          sick: sickInput,
          annual: annualInput,
          total: casualInput + sickInput + annualInput
        }
      } : null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to alter leave balances');
    } finally {
      setUpdatingBalance(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPasswordInput) return;
    if (newPasswordInput.length < 6) {
      toast.error('Password must be at least 6 characters long!');
      return;
    }
    setResettingPassword(true);
    try {
      await api.put(`/users/${selectedUser.id}/password`, { newPassword: newPasswordInput });
      toast.success(`Password for ${selectedUser.firstName} overridden successfully!`);
      setNewPasswordInput('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to override password');
    } finally {
      setResettingPassword(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addForm.password.length < 6) {
      toast.error('Password must be at least 6 characters long!');
      return;
    }
    setSubmittingAdd(true);
    try {
      await api.post('/users', addForm);
      toast.success(`Personnel account for ${addForm.firstName} provisioned successfully!`);
      setShowAddModal(false);
      setAddForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'employee',
        department: 'Operations',
      });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to provision account');
    } finally {
      setSubmittingAdd(false);
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
    if (!window.confirm('Are you sure you want to cancel this leave request? Any deducted leave quota will be automatically credited back to this employee account.')) {
      return;
    }

    try {
      await api.put(`/leaves/${leaveId}/cancel`);
      toast.success('Leave request cancelled successfully!');
      if (selectedUser) {
        
        const response = await api.get(`/users/${selectedUser.id}/leaves`);
        setUserLeaves(response.data);
        
        
        const dirRes = await api.get('/users');
        setUsers(dirRes.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel leave request');
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (id === currentUser?.id) {
      toast.error("You cannot delete your own account!");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the account for ${name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/users/${id}`);
      toast.success(`Account for ${name} deleted successfully`);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00236f] mb-4"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-[#00236f] opacity-40">Loading Directory...</span>
      </div>
    );
  }

  
  const groupedUsers = users.reduce((acc, u) => {
    const dept = u.department || 'Unassigned';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(u);
    return acc;
  }, {} as Record<string, User[]>);

  const departments = Object.keys(groupedUsers).sort();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 font-sans antialiased relative">
      
      
      <div className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-[#00236f] rounded-full" />
            <h1 className="text-5xl font-bold text-[#00236f] uppercase tracking-tight font-bebas">
              RESOURCE DIRECTORY
            </h1>
          </div>
          <p className="text-gray-500 font-medium ml-5 italic opacity-80 uppercase tracking-widest text-[10px]">Manage company segments and personnel leaves</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#00236f] hover:bg-[#1e3a8a] text-white px-6 py-3.5 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer border-none shadow-xl shadow-blue-900/10 flex items-center gap-2 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Personnel
        </button>
      </div>

      
      <div className="space-y-12">
        {departments.map((dept) => (
          <div key={dept} className="bg-white rounded-[40px] shadow-xl shadow-blue-900/5 p-8 border border-gray-50">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <Palmtree className="w-6 h-6 text-emerald-500" />
              <h2 className="text-2xl font-black text-[#00236f] uppercase tracking-widest font-bebas">
                {dept} Segment ({groupedUsers[dept].length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedUsers[dept].map((u) => (
                <div key={u.id} className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100/50 hover:bg-white hover:border-[#00236f]/35 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
                  
                  
                  {u.role !== 'employee' && (
                    <div className="absolute top-0 right-0 bg-[#00236f] text-white font-black text-[7px] uppercase tracking-widest px-3.5 py-1 rounded-bl-xl shadow-sm flex items-center gap-1">
                      <Crown className="w-2.5 h-2.5" /> {u.role}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-lg font-bold text-[#00236f] border border-gray-100">
                        {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide">
                          {u.firstName} {u.lastName}
                        </h3>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{u.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-2xl border border-gray-100 text-center mb-6">
                      <div className="border-r border-gray-100">
                        <span className="block text-[8px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Casual</span>
                        <span className="text-xs font-black text-[#00236f]">{u.leaveBalance?.casual ?? 0}</span>
                      </div>
                      <div className="border-r border-gray-100">
                        <span className="block text-[8px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Sick</span>
                        <span className="text-xs font-black text-[#00236f]">{u.leaveBalance?.sick ?? 0}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Annual</span>
                        <span className="text-xs font-black text-[#00236f]">{u.leaveBalance?.annual ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100/50">
                    <button
                      onClick={() => fetchUserLeaves(u)}
                      className="flex-1 bg-white hover:bg-[#00236f] text-[#00236f] hover:text-white px-4 py-2.5 rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all cursor-pointer border border-gray-200/80 hover:border-[#00236f] flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                    >
                      <History className="w-3.5 h-3.5 opacity-60" /> File History
                    </button>

                    <button
                      onClick={() => handleDeleteUser(u.id, `${u.firstName} ${u.lastName}`)}
                      disabled={u.id === currentUser?.id}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all
                        ${u.id === currentUser?.id 
                          ? 'bg-gray-50 text-gray-200 cursor-not-allowed opacity-20' 
                          : 'bg-gray-50 text-gray-300 hover:bg-rose-50 hover:text-rose-600 hover:shadow-lg hover:shadow-rose-900/10 active:scale-90'}`}
                      title={u.id === currentUser?.id ? "Administrative Protection" : "Terminate Account"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      
      {selectedUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-blue-950/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500 flex flex-col max-h-[90vh]">
            
            
            <div className="bg-[#00236f] p-8 flex justify-between items-center text-white">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-2xl font-bold font-bebas">
                  {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-3xl font-bold uppercase tracking-widest font-bebas">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Leave History & Balance Adjuster</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-white/10 transition-all border-none text-white cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            
            <div className="flex-1 overflow-y-auto p-10 bg-gray-50/30">
              
              
              <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm mb-8 relative overflow-hidden">
                <h3 className="text-xs font-black text-[#00236f] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Settings className="w-4 h-4" /> ADJUST LEAVE BALANCE ALLOCATION
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Casual Leaves</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={casualInput}
                      onChange={(e) => setCasualInput(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#00236f] focus:outline-none rounded-xl text-xs font-bold text-[#00236f]"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Sick Leaves</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={sickInput}
                      onChange={(e) => setSickInput(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#00236f] focus:outline-none rounded-xl text-xs font-bold text-[#00236f]"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Annual Leaves</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={annualInput}
                      onChange={(e) => setAnnualInput(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#00236f] focus:outline-none rounded-xl text-xs font-bold text-[#00236f]"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center bg-[#00236f]/5 p-4 rounded-2xl">
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#00236f]">
                    Calculated Total: <span className="text-sm font-black ml-1">{casualInput + sickInput + annualInput} Days</span>
                  </div>
                  <button
                    onClick={handleUpdateBalance}
                    disabled={updatingBalance}
                    className="bg-[#00236f] hover:bg-[#1e3a8a] text-white px-5 py-2.5 rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all cursor-pointer border-none shadow-md shadow-blue-900/10 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {updatingBalance ? 'Altering...' : 'Apply Allocations'}
                  </button>
                </div>
              </div>

              
              <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm mb-8 relative overflow-hidden">
                <h3 className="text-xs font-black text-rose-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Key className="w-4 h-4" /> RESET ACCOUNT PASSWORD
                </h3>
                
                <div className="flex flex-col md:flex-row items-end gap-6">
                  <div className="flex-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">New Password (Min 6 chars)</label>
                    <input
                      type="password"
                      placeholder="Enter new secure password"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#00236f] focus:outline-none rounded-xl text-xs font-bold text-[#00236f]"
                    />
                  </div>
                  
                  <button
                    onClick={handleResetPassword}
                    disabled={resettingPassword || !newPasswordInput}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-3.5 rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all cursor-pointer border-none shadow-md shadow-rose-900/10 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {resettingPassword ? 'Updating...' : 'Override Password'}
                  </button>
                </div>
              </div>

              
              <h3 className="text-xs font-black text-[#00236f] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <ClipboardList className="w-4 h-4" /> LEAVE HISTORY LOGS
              </h3>

              {historyLoading ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00236f] mb-4" />
                  <p className="text-[10px] font-black text-[#00236f] opacity-40 uppercase tracking-widest">Accessing Archives...</p>
                </div>
              ) : userLeaves.length === 0 ? (
                <div className="text-center py-20 opacity-30 grayscale">
                  <FileText className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-sm font-bold uppercase tracking-widest">No Leave Records Found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userLeaves.map((l) => (
                    <div key={l.id} className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-10 rounded-full ${
                            l.status === 'approved' ? 'bg-emerald-500' : 
                            l.status === 'pending' ? 'bg-amber-500' : 
                            l.status === 'cancelled' ? 'bg-gray-300' : 'bg-rose-500'
                          }`} />
                          <div>
                            <h4 className="text-lg font-bold text-[#00236f] uppercase tracking-wider font-bebas">
                              {typeof l.leaveType === 'string' ? l.leaveType : l.leaveType?.name} LEAVE
                            </h4>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{format(new Date(l.fromDate), 'MMM dd, yyyy')} — {format(new Date(l.toDate), 'MMM dd, yyyy')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border
                            ${l.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                              l.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                              l.status === 'cancelled' ? 'bg-gray-50 text-gray-500 border-gray-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                            {l.status}
                          </span>
                          <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest">{l.totalDays} Day(s)</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center gap-4">
                        <p className="text-xs text-gray-500 italic">"{l.reason}"</p>
                        <div className="flex items-center gap-2 shrink-0">
                          {(l.status === 'pending' || l.status === 'approved') && (
                            <>
                              {isCancelable(l.fromDate) ? (
                                <button
                                  onClick={() => handleCancelLeave(l.id)}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg font-bold text-[8px] uppercase tracking-widest transition-all cursor-pointer border border-rose-200"
                                >
                                  Cancel Leave
                                </button>
                              ) : (
                                <span className="flex items-center gap-1 text-[7px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded border border-gray-200 select-none">
                                  <Lock className="w-2 h-2" /> Locked (3d)
                                </span>
                              )}
                            </>
                          )}
                          {l.status === 'approved' && (
                            <button
                              onClick={() => window.open(`/app/leaves/${l.id}/report`, '_blank')}
                              className="bg-[#00236f] hover:bg-[#1e3a8a] text-white px-3 py-1.5 rounded-lg font-bold text-[8px] uppercase tracking-widest transition-all cursor-pointer border-none shrink-0"
                            >
                              PDF Report
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-blue-950/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500 flex flex-col">
            
            
            <div className="bg-[#00236f] p-8 flex justify-between items-center text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl font-bold">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold uppercase tracking-widest font-bebas">
                    ADD NEW PERSONNEL
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Provision account and segments</p>
                </div>
              </div>
              
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all border-none text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            
            <form onSubmit={handleAddUser} className="p-10 space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John"
                    value={addForm.firstName}
                    onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#00236f] focus:outline-none rounded-xl text-xs font-bold text-[#00236f]"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Doe"
                    value={addForm.lastName}
                    onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#00236f] focus:outline-none rounded-xl text-xs font-bold text-[#00236f]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john.doe@company.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#00236f] focus:outline-none rounded-xl text-xs font-bold text-[#00236f]"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Initial Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#00236f] focus:outline-none rounded-xl text-xs font-bold text-[#00236f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Corporate Role</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#00236f] focus:outline-none rounded-xl text-xs font-bold text-[#00236f]"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="hr">HR Representative</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Corporate Segment</label>
                  <select
                    value={addForm.department}
                    onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#00236f] focus:outline-none rounded-xl text-xs font-bold text-[#00236f]"
                  >
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-5 py-3.5 bg-gray-100 hover:bg-gray-200 text-[#444651] rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd}
                  className="flex-1 px-5 py-3.5 bg-[#00236f] hover:bg-[#1e3a8a] text-white rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all cursor-pointer border-none shadow-md shadow-blue-900/10"
                >
                  {submittingAdd ? 'Provisioning...' : 'Provision Account'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {!loading && users.length === 0 && (
        <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-gray-200">
          <Users className="w-16 h-16 text-gray-200 mx-auto mb-6" />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No personnel records found in database</p>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
