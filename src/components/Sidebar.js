// src/components/Sidebar.js
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/', icon: '⬡', label: 'Dashboard', exact: true },
  { to: '/reports', icon: '◈', label: 'Field Reports' },
  { to: '/problems', icon: '◬', label: 'Problems' },
  { to: '/assign', icon: '◎', label: 'Assignment' },
  { to: '/analytics', icon: '◰', label: 'Analytics' },
  { to: '/map', icon: '◉', label: 'Resource Map' },
  { to: '/notifications', icon: '◑', label: 'Alerts' },
  { to: '/profile', icon: '◍', label: 'My Profile' },
  { to: '/about', icon: '◌', label: 'About Us' },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(interval);
  }, []);

  async function handleLogout() {
    await logout();
    toast.success('Signed out successfully');
    navigate('/login');
  }

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo" onClick={() => setCollapsed(v => !v)}>
        <div className="logo-emblem">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" stroke="#00d4aa" strokeWidth="1.5" fill="rgba(0,212,170,0.1)"/>
            <polygon points="14,7 21,11 21,17 14,21 7,17 7,11" stroke="#00d4aa" strokeWidth="1" fill="rgba(0,212,170,0.15)"/>
            <circle cx="14" cy="14" r="3" fill="#00d4aa"/>
          </svg>
        </div>
        {!collapsed && (
          <div className="logo-text">
            <span className="logo-impact">Impact</span>
            <span className="logo-connect">Connect</span>
          </div>
        )}
        <button className="collapse-btn" aria-label="Toggle sidebar">
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {!collapsed && (
        <div className="sidebar-status">
          <div className={`status-dot ${pulse ? 'pulse' : ''}`}></div>
          <span className="status-text">System Live</span>
        </div>
      )}

      <nav className="sidebar-nav">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : ''}
          >
            <span className="nav-icon-wrap">
              <span className="nav-icon">{item.icon}</span>
              {item.to === '/notifications' && <span className="nav-badge">3</span>}
            </span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
            {!collapsed && <span className="nav-arrow">›</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && (
          <div className="user-card">
            <div className="user-avatar-glow">
              <div className="user-avatar">{(userProfile?.name || currentUser?.displayName || 'U')[0].toUpperCase()}</div>
            </div>
            <div className="user-details">
              <div className="user-name">{userProfile?.name || currentUser?.displayName || 'User'}</div>
              <div className="user-role">
                {userProfile?.role === 'ngo_admin' ? '⬡ Admin' : '◎ Field Worker'}
              </div>
            </div>
          </div>
        )}
        <button className="logout-btn" onClick={handleLogout} title="Sign out">
          <span className="logout-icon">↩</span>
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
