// src/pages/TaskAssignment.js
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useTasks, useProblems, useVolunteers, createTask, updateTask } from '../hooks/useFirestore';
import { useAuth } from '../context/AuthContext';

const SKILL_OPTIONS = ['Medical','Food Distribution','Construction','Education','Counseling','Logistics','IT','Water & Sanitation'];

export default function TaskAssignment() {
  const { data: tasks, loading: tasksLoading } = useTasks();
  const { data: problems } = useProblems();
  const { volunteers } = useVolunteers();
  const { userProfile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [form, setForm] = useState({ title:'', description:'', requiredSkills:[], deadline:'' });
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('assign'); // assign | tasks | volunteers

  // Smart match: score volunteers for a problem
  function smartMatch(problem) {
    if (!problem) return volunteers;
    return volunteers
      .map(v => {
        let score = 0;
        if (v.availability) score += 30;
        if (v.location && problem.location && v.location.toLowerCase().includes(problem.location.toLowerCase().split(' ')[0])) score += 40;
        const skillMatch = (v.skills||[]).filter(s => form.requiredSkills.includes(s)).length;
        score += skillMatch * 20;
        return { ...v, matchScore: score };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  const matchedVolunteers = smartMatch(selectedProblem);

  async function handleAssign(e) {
    e.preventDefault();
    if (!selectedProblem) return toast.error('Select a problem first');
    if (!selectedVolunteer) return toast.error('Select a volunteer');
    setSubmitting(true);
    try {
      await createTask({
        ...form,
        problemId: selectedProblem.id,
        problemTitle: selectedProblem.title,
        location: selectedProblem.location,
        urgency: selectedProblem.urgency,
        volunteerId: selectedVolunteer.id,
        volunteerName: selectedVolunteer.name,
        volunteerEmail: selectedVolunteer.email,
        assignedBy: userProfile?.name || 'Admin',
      });
      toast.success(`✅ Task assigned to ${selectedVolunteer.name}!`);
      setShowForm(false);
      setSelectedProblem(null);
      setSelectedVolunteer(null);
      setForm({ title:'', description:'', requiredSkills:[], deadline:'' });
      setActiveTab('tasks');
    } catch(err) { toast.error(err.message); }
    setSubmitting(false);
  }

  async function changeTaskStatus(id, status) {
    await updateTask(id, { status });
    toast.success(`Task marked as ${status}`);
  }

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
  const statusIcon = s => ({ assigned:'🔵', 'in-progress':'🟡', completed:'🟢', cancelled:'🔴' }[s] || '⚪');

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Smart Assignment</h1>
          <p className="page-sub">Steps 5 & 6 — Intelligent volunteer matching & task execution</p>
        </div>
        <div className="tab-switcher">
          {['assign','tasks','volunteers'].map(t=>(
            <button key={t} className={activeTab===t?'active':''} onClick={()=>setActiveTab(t)}>
              {t==='assign'?'🎯 Assign':t==='tasks'?`📋 Tasks (${tasks.length})`:`👥 Volunteers (${volunteers.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* ASSIGN TAB */}
      {activeTab === 'assign' && (
        <div className="assign-layout">
          {/* Step 1: Pick Problem */}
          <div className="assign-step">
            <div className="step-label"><span className="step-num">1</span> Select Problem</div>
            <div className="problem-picker">
              {problems.filter(p=>p.status!=='resolved').length === 0 && <div className="empty-state">No open problems. Create problems first.</div>}
              {problems.filter(p=>p.status!=='resolved').map(p=>(
                <div key={p.id} className={`picker-item ${selectedProblem?.id===p.id?'selected':''}`} onClick={()=>{setSelectedProblem(p);setForm(f=>({...f,title:`Handle: ${p.title}`,description:p.description||''}));}}>
                  <div className="picker-header">
                    <span className={`badge badge-${p.urgency?.toLowerCase()}`}>{p.urgency}</span>
                    <span className="picker-loc">📍 {p.location}</span>
                  </div>
                  <div className="picker-title">{p.title}</div>
                  <div className="picker-type">🏷️ {p.problem}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Required Skills */}
          <div className="assign-step">
            <div className="step-label"><span className="step-num">2</span> Required Skills</div>
            <div className="skills-grid">
              {SKILL_OPTIONS.map(s=>(
                <button key={s} type="button"
                  className={`skill-chip ${form.requiredSkills.includes(s)?'selected':''}`}
                  onClick={()=>setForm(f=>({...f,requiredSkills:f.requiredSkills.includes(s)?f.requiredSkills.filter(x=>x!==s):[...f.requiredSkills,s]}))}>
                  {s}
                </button>
              ))}
            </div>
            <div className="field-group mt-2">
              <label>Task Title</label>
              <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Task description..." />
            </div>
            <div className="field-group">
              <label>Deadline</label>
              <input type="date" value={form.deadline} onChange={e=>setForm(f=>({...f,deadline:e.target.value}))} />
            </div>
          </div>

          {/* Step 3: Smart Match Volunteers */}
          <div className="assign-step">
            <div className="step-label"><span className="step-num">3</span> Smart Match <span className="badge-info">AI Ranked</span></div>
            <div className="volunteer-matcher">
              {matchedVolunteers.length === 0 && <div className="empty-state">No volunteers registered yet.</div>}
              {matchedVolunteers.map(v=>(
                <div key={v.id} className={`volunteer-card ${selectedVolunteer?.id===v.id?'selected':''} ${!v.availability?'unavailable':''}`}
                  onClick={()=>v.availability && setSelectedVolunteer(v)}>
                  <div className="vol-avatar">{(v.name||'?')[0].toUpperCase()}</div>
                  <div className="vol-info">
                    <div className="vol-name">{v.name} {!v.availability && <span className="badge-unavail">Unavailable</span>}</div>
                    <div className="vol-loc">📍 {v.location || 'Location not set'}</div>
                    <div className="vol-skills">{(v.skills||[]).map(s=><span key={s} className="skill-tag">{s}</span>)}</div>
                  </div>
                  <div className="vol-score">
                    <div className="score-val">{v.matchScore || 0}%</div>
                    <div className="score-label">Match</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 4: Confirm */}
          <div className="assign-step">
            <div className="step-label"><span className="step-num">4</span> Confirm Assignment</div>
            {selectedProblem && selectedVolunteer ? (
              <div className="confirm-card">
                <div className="confirm-row"><span>Problem</span><strong>{selectedProblem.title}</strong></div>
                <div className="confirm-row"><span>Location</span><strong>📍 {selectedProblem.location}</strong></div>
                <div className="confirm-row"><span>Urgency</span><span className={`badge badge-${selectedProblem.urgency?.toLowerCase()}`}>{selectedProblem.urgency}</span></div>
                <div className="confirm-row"><span>Volunteer</span><strong>{selectedVolunteer.name}</strong></div>
                <div className="confirm-row"><span>Match Score</span><strong>{selectedVolunteer.matchScore}%</strong></div>
                {form.deadline && <div className="confirm-row"><span>Deadline</span><strong>{form.deadline}</strong></div>}
                <button className="btn-primary full-width mt-2" onClick={handleAssign} disabled={submitting}>
                  {submitting ? '⏳ Assigning...' : '🚀 Assign Task'}
                </button>
              </div>
            ) : (
              <div className="empty-state">Select a problem and volunteer to confirm.</div>
            )}
          </div>
        </div>
      )}

      {/* TASKS TAB */}
      {activeTab === 'tasks' && (
        <div className="tasks-section">
          <div className="filter-bar">
            {['all','assigned','in-progress','completed','cancelled'].map(f=>(
              <button key={f} className={filter===f?'active':''} onClick={()=>setFilter(f)}>
                {statusIcon(f)} {f.charAt(0).toUpperCase()+f.slice(1)} {f==='all'?`(${tasks.length})`:``}
              </button>
            ))}
          </div>
          <div className="tasks-grid">
            {tasksLoading ? <div className="loading-state">Loading...</div> :
              filteredTasks.map(t => (
                <div key={t.id} className={`task-card task-${t.status}`}>
                  <div className="task-header">
                    <span className={`badge badge-${t.urgency?.toLowerCase()}`}>{t.urgency}</span>
                    <span className="task-status">{statusIcon(t.status)} {t.status}</span>
                  </div>
                  <h4>{t.title}</h4>
                  <div className="task-meta">
                    <span>📍 {t.location}</span>
                    <span>👤 {t.volunteerName}</span>
                    {t.deadline && <span>📅 {t.deadline}</span>}
                  </div>
                  <div className="task-actions">
                    {t.status === 'assigned' && <button className="btn-sm-orange" onClick={()=>changeTaskStatus(t.id,'in-progress')}>▶ Start</button>}
                    {t.status === 'in-progress' && <button className="btn-sm-green" onClick={()=>changeTaskStatus(t.id,'completed')}>✓ Complete</button>}
                    {t.status !== 'completed' && t.status !== 'cancelled' && <button className="btn-sm-gray" onClick={()=>changeTaskStatus(t.id,'cancelled')}>✕ Cancel</button>}
                  </div>
                </div>
              ))
            }
            {filteredTasks.length === 0 && <div className="empty-state">No tasks found.</div>}
          </div>
        </div>
      )}

      {/* VOLUNTEERS TAB */}
      {activeTab === 'volunteers' && (
        <div className="table-section">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Location</th><th>Skills</th><th>Availability</th><th>Tasks Done</th></tr>
              </thead>
              <tbody>
                {volunteers.map(v=>(
                  <tr key={v.id}>
                    <td><div className="vol-row"><div className="vol-avatar-sm">{(v.name||'?')[0]}</div>{v.name}</div></td>
                    <td>{v.email}</td>
                    <td>{v.location||'—'}</td>
                    <td>{(v.skills||[]).map(s=><span key={s} className="skill-tag">{s}</span>)}</td>
                    <td><span className={v.availability?'badge-avail':'badge-unavail'}>{v.availability?'✅ Available':'❌ Busy'}</span></td>
                    <td>{v.tasksCompleted||0}</td>
                  </tr>
                ))}
                {volunteers.length===0 && <tr><td colSpan={6} className="empty-row">No volunteers registered yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
