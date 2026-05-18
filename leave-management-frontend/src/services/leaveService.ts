import api from './api';
import type { Leave, LeaveStats } from '../types';

export const leaveService = {
  applyLeave: async (leaveData: any) => {
    const response = await api.post('/leaves', leaveData);
    return response.data;
  },

  getMyLeaves: async (): Promise<Leave[]> => {
    const response = await api.get('/leaves/my-leaves');
    return response.data;
  },

  getAllLeaves: async (): Promise<Leave[]> => {
    const response = await api.get('/leaves/all');
    return response.data;
  },

  getPendingLeaves: async (): Promise<Leave[]> => {
    const response = await api.get('/leaves/pending');
    return response.data;
  },

  updateLeaveStatus: async (id: string, status: string, rejectionReason?: string) => {
    const response = await api.put(`/leaves/${id}`, { status, rejectionReason });
    return response.data;
  },

  getLeaveStats: async (): Promise<LeaveStats> => {
    const response = await api.get('/leaves/stats');
    return response.data;
  },

  getAiAssist: async (draft: string, tone: string): Promise<{ suggestion: string }> => {
    const response = await api.post('/leaves/ai-assist', { draft, tone });
    return response.data;
  },

  getActiveToday: async (): Promise<Leave[]> => {
    const response = await api.get('/leaves/active-today');
    return response.data;
  },

  getLeaveById: async (id: string): Promise<Leave> => {
    const response = await api.get(`/leaves/detail/${id}`);
    return response.data;
  },

  getTeamCalendar: async (): Promise<Leave[]> => {
    const response = await api.get('/leaves/team-calendar');
    return response.data;
  },

  cancelLeave: async (id: string): Promise<any> => {
    const response = await api.put(`/leaves/${id}/cancel`);
    return response.data;
  },
};