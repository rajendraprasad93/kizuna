import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { CitizenDashboard } from '@/pages/CitizenDashboard';
import { NewReportPage } from '@/pages/NewReportPage';
import { ReportDetailPage } from '@/pages/ReportDetailPage';
import { MyReportsPage } from '@/pages/MyReportsPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { DepartmentDashboard } from '@/pages/DepartmentDashboard';
import { DepartmentReportsPage } from '@/pages/DepartmentReportsPage';
import { DepartmentMapPage } from '@/pages/DepartmentMapPage';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { AdminReportsPage } from '@/pages/AdminReportsPage';
import { AdminUsersPage } from '@/pages/AdminUsersPage';
import { AdminDepartmentsPage } from '@/pages/AdminDepartmentsPage';
import type { UserRole } from '@/types';
import type { ReactNode } from 'react';

function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: UserRole[] }) {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  if (roles && profile && !roles.includes(profile.role)) {
    const redirect = profile.role === 'admin' ? '/admin/dashboard' : profile.role === 'department' ? '/department/dashboard' : '/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
}

function RootRedirect() {
  const { session, profile, loading } = useAuth();
  if (loading) return null;
  if (!session) return <LandingPage />;
  const redirect = profile?.role === 'admin' ? '/admin/dashboard' : profile?.role === 'department' ? '/department/dashboard' : '/dashboard';
  return <Navigate to={redirect} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Citizen routes */}
          <Route path="/dashboard" element={<ProtectedRoute roles={['citizen']}><CitizenDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/my-reports" element={<ProtectedRoute roles={['citizen']}><MyReportsPage /></ProtectedRoute>} />
          <Route path="/dashboard/map" element={<ProtectedRoute roles={['citizen']}><DepartmentMapPage /></ProtectedRoute>} />
          <Route path="/report/new" element={<ProtectedRoute roles={['citizen']}><NewReportPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Shared routes */}
          <Route path="/reports/:id" element={<ProtectedRoute><ReportDetailPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

          {/* Department routes */}
          <Route path="/department/dashboard" element={<ProtectedRoute roles={['department', 'admin']}><DepartmentDashboard /></ProtectedRoute>} />
          <Route path="/department/reports" element={<ProtectedRoute roles={['department', 'admin']}><DepartmentReportsPage /></ProtectedRoute>} />
          <Route path="/department/map" element={<ProtectedRoute roles={['department', 'admin']}><DepartmentMapPage /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><AdminReportsPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/admin/departments" element={<ProtectedRoute roles={['admin']}><AdminDepartmentsPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
