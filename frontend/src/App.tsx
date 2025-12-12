import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { NotFoundPage } from './pages/NotFoundPage';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { CreateProject } from './pages/CreateProject';
import { Editor } from './pages/Editor';
import { ProjectDetails } from './pages/ProjectDetails';
import { CreateUser } from './pages/admin/CreateUser';
import { LanguagesPage } from './pages/admin/Languages';
import { UsersPage } from './pages/admin/Users';
import { RolesPage } from './pages/admin/Roles';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { PublicProfile } from './pages/PublicProfile';
import { GlossaryPage } from './pages/GlossaryPage';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { useAuthStore } from './store/useAuthStore';
import { MaintenancePage } from './pages/MaintenancePage';
import { useState, useEffect } from 'react';
import api from './api/axios';
import { useThemeStore } from './store/useThemeStore';
import { useSystemStore } from './store/useSystemStore';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { token, user } = useAuthStore();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Super Admin Bypass
  if (user?.role === 'SUPER_ADMIN') {
    return <>{children}</>;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Redirect to dashboard if unauthorized
  }

  return <>{children}</>;
};

function App() {
  const [maintenance, setMaintenance] = useState(false);
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const { fetchSettings } = useSystemStore();
  const location = useLocation();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    // Force Light Mode on Landing Page
    if (location.pathname === '/') {
      root.classList.add('light');
    } else {
      root.classList.add(theme);
    }
  }, [theme, location.pathname]);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const res = await api.get('/public-settings');
        if (res.data.maintenance_mode) {
          setMaintenance(true);
        }
        if (res.data.system_name) {
          document.title = res.data.system_name;
        }
      } catch (error) {
        console.error('Failed to fetch public settings');
      }
    };
    checkMaintenance();
    fetchSettings(); // Load system settings into store
  }, []);

  // Allow Login page even in maintenance
  if (maintenance && user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN' && location.pathname !== '/login') {
    return <MaintenancePage />;
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/u/:id" element={<PublicProfile />} />

        <Route element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/new" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'CLIENT']}>
              <CreateProject />
            </ProtectedRoute>
          } />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="editor/:projectId/:fileId" element={<Editor />} />
          <Route path="editor" element={<Navigate to="/projects" replace />} />
          <Route path="users/create" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <CreateUser />
            </ProtectedRoute>
          } />
          <Route path="languages" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <LanguagesPage />
            </ProtectedRoute>
          } />
          <Route path="users" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <UsersPage />
            </ProtectedRoute>
          } />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <SettingsPage />
            </ProtectedRoute>
          } />
          <Route path="glossary" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'TRANSLATOR']}>
              <GlossaryPage />
            </ProtectedRoute>
          } />
          <Route path="roles" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <RolesPage />
            </ProtectedRoute>
          } />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
