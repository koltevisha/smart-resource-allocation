// src/App.js
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import FieldReports from './pages/FieldReports';
import Problems from './pages/Problems';
import TaskAssignment from './pages/TaskAssignment';
import VolunteerProfile from './pages/VolunteerProfile';
import LoginPage from './pages/LoginPage';
import AboutUs from './pages/AboutUs';
import Analytics from './pages/Analytics';
import NotificationsPage from './pages/NotificationsPage';
import ResourceMap from './pages/ResourceMap';
import './styles.css';

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reports" element={<FieldReports />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/assign" element={<TaskAssignment />} />
          <Route path="/profile" element={<VolunteerProfile />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/map" element={<ResourceMap />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0f172a',
              color: '#f1f5f9',
              border: '1px solid #1e3a5f',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#00d4aa', secondary: '#0a0f1a' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#0a0f1a' } },
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
