// src/pages/VolunteerProfile.js
import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../hooks/useFirestore';
import toast from 'react-hot-toast';

const SKILL_OPTIONS = ['Medical','Food Distribution','Construction','Education','Counseling','Logistics','IT','Water & Sanitation'];

export default function VolunteerProfile() {
  const { currentUser, userProfile } = useAuth();
  const { data: tasks } = useTasks();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name:'', location:'', skills:[], availability: true, bio:'' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setForm({
        name: userProfile.name || '',
        location: userProfile.location || '',
        skills: userProfile.skills || [],
        availability: userProfile.availability !== false,
        bio: userProfile.bio || ''
      });
    }
  }, [userProfile]);

  const myTasks = tasks.filter(t => t.volunteerId === currentUser?.uid);
  const completedCount = myTasks.filter(t => t.status === 'completed').length;
  const activeCount = myTasks.filter(t => t.status === 'assigned' || t.status === 'in-progress').length;

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { ...form });
      toast.success('✅ Profile updated!');
      setEditing(false);
    } catch(err) { toast.error(err.message); }
    setSaving(false);
  }

  async function toggleSkill(s) {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(s) ? f.skills.filter(x=>x!==s) : [...f.skills, s]
    }));
  }

  const statusIcon = s => ({ assigned:'🔵', 'in-progress':'🟡', completed:'🟢', cancelled:'🔴' }[s]||'⚪');

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-sub">Manage your volunteer profile & view assigned tasks</p>
        </div>
        <button className="btn-primary" onClick={()=>setEditing(v=>!v)}>
          {editing ? '✕ Cancel' : '✏️ Edit Profile'}
        </button>
      </div>

      <div className="profile-layout">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar">
            {(userProfile?.name||currentUser?.displayName||'U')[0].toUpperCase()}
          </div>
          {editing ? (
            <form onSubmit={handleSave}>
              <div className="field-group">
                <label>Name</label>
                <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
              </div>
              <div className="field-group">
                <label>Location</label>
                <input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} placeholder="Your area/city" />
              </div>
              <div className="field-group">
                <label>Bio</label>
                <textarea value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))} rows={2} placeholder="Brief intro..." />
              </div>
              <div className="field-group">
                <label>Skills</label>
                <div className="skills-grid">
                  {SKILL_OPTIONS.map(s=>(
                    <button type="button" key={s} className={`skill-chip ${form.skills.includes(s)?'selected':''}`} onClick={()=>toggleSkill(s)}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="field-group">
                <label>Availability</label>
                <div className="toggle-row">
                  <button type="button" className={`toggle-btn ${form.availability?'on':''}`} onClick={()=>setForm(f=>({...f,availability:!f.availability}))}>
                    {form.availability ? '✅ Available' : '❌ Not Available'}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-primary full-width" disabled={saving}>{saving?'Saving...':'💾 Save Profile'}</button>
            </form>
          ) : (
            <div className="profile-view">
              <h2 className="profile-name">{userProfile?.name || currentUser?.displayName}</h2>
              <div className="profile-email">✉️ {currentUser?.email}</div>
              <div className="profile-role">
                <span className={`role-badge role-${userProfile?.role}`}>
                  {userProfile?.role === 'ngo_admin' ? '🏢 NGO Admin' : '🙋 Field Worker'}
                </span>
              </div>
              {userProfile?.location && <div className="profile-loc">📍 {userProfile.location}</div>}
              {userProfile?.bio && <p className="profile-bio">{userProfile.bio}</p>}
              <div className="profile-avail">
                <span className={userProfile?.availability ? 'badge-avail' : 'badge-unavail'}>
                  {userProfile?.availability ? '✅ Available for tasks' : '❌ Currently Unavailable'}
                </span>
              </div>
              {(userProfile?.skills||[]).length > 0 && (
                <div className="profile-skills">
                  <label>Skills</label>
                  <div>{(userProfile.skills||[]).map(s=><span key={s} className="skill-tag">{s}</span>)}</div>
                </div>
              )}
              <div className="profile-stats">
                <div className="pstat"><div className="pstat-val">{completedCount}</div><div className="pstat-label">Completed</div></div>
                <div className="pstat"><div className="pstat-val">{activeCount}</div><div className="pstat-label">Active</div></div>
                <div className="pstat"><div className="pstat-val">{myTasks.length}</div><div className="pstat-label">Total</div></div>
              </div>
            </div>
          )}
        </div>

        {/* My Tasks */}
        <div className="my-tasks">
          <h3>📋 My Assigned Tasks</h3>
          {myTasks.length === 0 ? (
            <div className="empty-state">No tasks assigned to you yet.</div>
          ) : (
            <div className="tasks-list">
              {myTasks.map(t=>(
                <div key={t.id} className={`task-row task-${t.status}`}>
                  <div className="task-row-icon">{statusIcon(t.status)}</div>
                  <div className="task-row-body">
                    <div className="task-row-title">{t.title}</div>
                    <div className="task-row-meta">
                      <span>📍 {t.location}</span>
                      {t.deadline && <span>📅 {t.deadline}</span>}
                      <span className={`badge badge-${t.urgency?.toLowerCase()}`}>{t.urgency}</span>
                    </div>
                  </div>
                  <div className="task-row-status">{t.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
