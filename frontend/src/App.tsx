import React, { useState, useEffect } from 'react';
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
import { usePageTracking } from './hooks/usePageTracking';
import { LiveDashboard } from './pages/admin/LiveDashboard';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { PublicProfile } from './pages/PublicProfile';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { GlossaryPage } from './pages/GlossaryPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';
import { useSystemStore } from './store/useSystemStore';
import api from './api/axios';

// ...

import { ActivityTracker } from './components/ActivityTracker';
import { ActivityLogPage } from './pages/admin/ActivityLogPage';

function App() {
  const [maintenance, setMaintenance] = useState(false);
  const { user } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <>
      <ActivityTracker />
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
            <ProtectedRoute allowedRoles={['ADMIN', 'CLIENT', 'SUPER_ADMIN']}>
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
          <Route path="activity" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <ActivityLogPage />
            </ProtectedRoute>
          } />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
