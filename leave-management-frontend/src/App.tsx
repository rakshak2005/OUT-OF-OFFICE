import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from './store/authStore';

import MainLayout from './layouts/MainLayout';

import Login from './components/auth/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ApplyLeave from './pages/ApplyLeave';
import MyLeaves from './pages/MyLeaves';
import ApproveLeaves from './pages/ApproveLeaves';
import Welcome from './pages/Welcome';
import HolidayCalendar from './pages/HolidayCalendar';
import LeaveBalance from './pages/LeaveBalance';
import UserManagement from './pages/UserManagement';
import LeaveReport from './pages/LeaveReport';
import TeamCalendar from './pages/TeamCalendar';

import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <>
      <BrowserRouter>
        <Routes>
          
          <Route path="/" element={<Welcome />} />

          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          
          <Route path="/holidays-public" element={<HolidayCalendar />} />
          <Route path="/leave-balance-public" element={<LeaveBalance />} />

          
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="apply-leave" element={<ApplyLeave />} />
            <Route path="my-leaves" element={<MyLeaves />} />
            <Route path="leaves/:id/report" element={<LeaveReport />} />
            <Route path="leave-balance" element={<LeaveBalance />} />
            <Route path="holidays" element={<HolidayCalendar />} />
            <Route path="team-calendar" element={<TeamCalendar />} />
            <Route path="users" element={<ProtectedRoute allowedRoles={['hr', 'admin', 'manager']}><UserManagement /></ProtectedRoute>} />
            <Route
              path="approve-leaves"
              element={
                <ProtectedRoute allowedRoles={['manager', 'hr']}>
                  <ApproveLeaves />
                </ProtectedRoute>
              }
            />
          </Route>

          
          <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/apply-leave" element={<Navigate to="/app/apply-leave" replace />} />
          <Route path="/my-leaves" element={<Navigate to="/app/my-leaves" replace />} />
          <Route path="/approve-leaves" element={<Navigate to="/app/approve-leaves" replace />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;