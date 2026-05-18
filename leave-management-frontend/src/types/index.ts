export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'employee' | 'manager' | 'hr' | 'admin';
  department: string;
  managerId?: string;
  leaveBalance: LeaveBalance;
  createdAt: string;
}

export interface LeaveBalance {
  casual: number;
  sick: number;
  annual: number;
  total: number;
}

export interface Leave {
  id: string;
  userId: string;
  userName: string;
  leaveType: string | { name: string };
  fromDate: string;
  toDate: string;
  totalDays: number;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  appliedAt: string;
  decidedBy?: string;
  decidedAt?: string;
  decisionRemark?: string;
  rejectionReason?: string;
  documentPath?: string;
  applicant?: User;
  approver?: { firstName: string; lastName: string };
}

export interface LeaveStats {
  totalLeaves: number;
  pendingLeaves: number;
  approvedLeaves: number;
  rejectedLeaves: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
  department: string;
}