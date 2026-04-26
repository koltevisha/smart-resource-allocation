// src/pages/Problems.js
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useProblems, useReports, addProblem, updateProblem } from '../hooks/useFirestore';
import { useAuth } from '../context/AuthContext';

const PROBLEMS = ['Food Shortage','Water Access','Medical Aid','Shelter','Education','Sanitation','Security','Livelihood'];
const URGENCIES = ['High','Medium','Low'];

export default function Problems() {
  const { data: problems, loading } = useProblems();
  const { data: reports } = useReports();
  const { userProfile } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title:'', location:'', problem:'', urgency:'High', description:'', estimatedPeople:''
  });
  const [submitting, setSubmitting] = useState(false);

  // Auto-suggestions
  const suggestions = React.useMemo(() => {
    const map = {};
    reports.forEach(r => {
      const key = `${r.location}__${r.problem}`;
      if (!map[key]) map[key] = { location: r.location, problem: r.problem, count: 0, urgencies: [] };
      map[key].count++;
      map[key].urgencies.push(r.urgency);
    });

    return Object.values(map)
      .filter(s => s.count >= 1)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map(s => ({
        ...s,
        suggestedUrgency: s.urgencies.includes('High')
          ? 'High'
          : s.urgencies.includes('Medium')
          ? 'Medium'
          : 'Low'
      }));
  }, [reports]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addProblem({
        ...form,
        estimatedPeople: Number(form.estimatedPeople) || 0,
        createdBy: userProfile?.name || 'Admin'
      });

      toast.success('✅ Problem created!');
      setForm({
        title:'', location:'', problem:'', urgency:'High', description:'', estimatedPeople:''
      });
      setShowForm(false);
    } catch(err) {
      toast.error(err.message);
    }
    setSubmitting(false);
  }

  // ✅ FIXED FUNCTION (renamed)
  function applySuggestion(s) {
    setForm({
      title: `${s.location} needs ${s.problem}`,
      location: s.location,
      problem: s.problem,
      urgency: s.suggestedUrgency,
      description: `${s.count} field reports indicate ${s.problem} issue in ${s.location}`,
      estimatedPeople: ''
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function updateStatus(id, status) {
    await updateProblem(id, { status });
    toast.success(`Status → ${status}`);
  }

  const statusColor = s => ({
    open:'#ef4444',
    'in-progress':'#f97316',
    resolved:'#22c55e'
  }[s] || '#64748b');

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Problem Management</h1>
          <p className="page-sub">Step 2–4 — Analysis, detection & problem creation</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '➕ Create Problem'}
        </button>
      </div>

      {showForm && (
        <div className="form-card mb-4">
          <h3>📋 Create Problem</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">

              <div className="field-group full-width">
                <label>Problem Title *</label>
                <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} required />
              </div>

              <div className="field-group">
                <label>Location *</label>
                <input value={form.location} onChange={e=>setForm(p=>({...p,location:e.target.value}))} required />
              </div>

              <div className="field-group">
                <label>Problem Type *</label>
                <select value={form.problem} onChange={e=>setForm(p=>({...p,problem:e.target.value}))} required>
                  <option value="">Select...</option>
                  {PROBLEMS.map(p=><option key={p}>{p}</option>)}
                </select>
              </div>

              <div className="field-group">
                <label>Urgency</label>
                <div className="urgency-btns">
                  {URGENCIES.map(u=>(
                    <button
                      type="button"
                      key={u}
                      className={`urg-btn urg-${u.toLowerCase()} ${form.urgency===u?'active':''}`}
                      onClick={()=>setForm(p=>({...p,urgency:u}))}
                    >
                      {u==='High'?'🔴':u==='Medium'?'🟡':'🟢'} {u}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label>Est. People</label>
                <input type="number" value={form.estimatedPeople} onChange={e=>setForm(p=>({...p,estimatedPeople:e.target.value}))} />
              </div>

              <div className="field-group full-width">
                <label>Description</label>
                <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={3} />
              </div>

            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting?'Saving...':'💾 Save Problem'}
            </button>
          </form>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="suggestion-section">
          <h3>🤖 Auto Suggestions</h3>
          <div className="suggestions-grid">
            {suggestions.map((s,i)=>(
              <div key={i} className="suggestion-card">
                <div>{s.location} → {s.problem}</div>
                <button className="btn-ghost" onClick={()=>applySuggestion(s)}>
                  Use Suggestion →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Problems */}
      <div className="problems-list">
        <h3>All Problems ({problems.length})</h3>
        {loading ? 'Loading...' : problems.map(p=>(
          <div key={p.id}>
            <h4>{p.title}</h4>
            <button onClick={()=>updateStatus(p.id,'resolved')}>Resolve</button>
          </div>
        ))}
      </div>
    </div>
  );
}