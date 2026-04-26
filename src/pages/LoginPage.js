// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('field_worker');
  const [loading, setLoading] = useState(false);
  const { login, signup, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else await signup(email, password, name, role);
      toast.success('Welcome to ImpactConnect!');
      navigate('/');
    } catch (err) { toast.error(err.message); }
    setLoading(false);
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Signed in with Google!');
      navigate('/');
    } catch (err) { toast.error(err.message); }
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-bg"></div>
      <div className="auth-grid"></div>

      {/* Floating hexagon decorations */}
      <svg style={{ position:'absolute', top: '10%', left: '8%', opacity: 0.06 }} width="120" height="120" viewBox="0 0 120 120">
        <polygon points="60,5 113,32 113,88 60,115 7,88 7,32" stroke="#00d4aa" strokeWidth="1" fill="none"/>
        <polygon points="60,20 98,40 98,80 60,100 22,80 22,40" stroke="#00d4aa" strokeWidth="0.5" fill="none"/>
      </svg>
      <svg style={{ position:'absolute', bottom: '15%', right: '10%', opacity: 0.05 }} width="180" height="180" viewBox="0 0 180 180">
        <polygon points="90,8 170,48 170,132 90,172 10,132 10,48" stroke="#2979ff" strokeWidth="1" fill="none"/>
      </svg>

      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-emblem-auth">
            <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
              <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" stroke="#00d4aa" strokeWidth="1.5" fill="rgba(0,212,170,0.15)"/>
              <polygon points="14,7 21,11 21,17 14,21 7,17 7,11" stroke="#00d4aa" strokeWidth="1" fill="rgba(0,212,170,0.2)"/>
              <circle cx="14" cy="14" r="3" fill="#00d4aa"/>
            </svg>
          </div>
          <h1><span>Impact</span>Connect</h1>
          <p>NGO Operations Platform · Pune, India</p>
        </div>

        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Sign In</button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Register</button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <>
              <div className="field-group">
                <label>Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required />
              </div>
              <div className="field-group">
                <label>Role</label>
                <select value={role} onChange={e => setRole(e.target.value)}>
                  <option value="ngo_admin">⬡ NGO Admin</option>
                  <option value="field_worker">◎ Field Worker / Volunteer</option>
                </select>
              </div>
            </>
          )}
          <div className="field-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@organization.org" required />
          </div>
          <div className="field-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? (
              <><div className="loading-spinner" style={{ width: 14, height: 14, borderWidth: 2 }}></div> Please wait…</>
            ) : mode === 'login' ? '→ Sign In' : '→ Create Account'}
          </button>
        </form>

        <div className="auth-divider"><span>or continue with</span></div>

        <button className="btn-google" onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', marginTop: 20, lineHeight: 1.5 }}>
          Secure access for authorized NGO staff only. All data protected by Firebase Auth.
        </p>
      </div>
    </div>
  );
}
