// src/pages/FieldReports.js
import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import { addReport, bulkImportReports, deleteReport } from '../hooks/useFirestore';
import { useReports } from '../hooks/useFirestore';
import { useAuth } from '../context/AuthContext';

const PROBLEMS = ['Food Shortage', 'Water Access', 'Medical Aid', 'Shelter', 'Education', 'Sanitation', 'Security', 'Livelihood'];
const URGENCIES = ['High', 'Medium', 'Low'];

export default function FieldReports() {
  const { data: reports, loading } = useReports();
  const { currentUser, userProfile } = useAuth();
  const [form, setForm] = useState({ location: '', problem: '', urgency: 'Medium', description: '', peopleAffected: '' });
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [activeTab, setActiveTab] = useState('form'); // form | csv | list
  const fileRef = useRef();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.location || !form.problem) return toast.error('Location and problem are required');
    setSubmitting(true);
    try {
      await addReport({
        ...form,
        peopleAffected: Number(form.peopleAffected) || 0,
        reporterName: userProfile?.name || currentUser?.displayName || 'Anonymous',
        reporterUid: currentUser?.uid
      });
      toast.success('✅ Report submitted!');
      setForm({ location: '', problem: '', urgency: 'Medium', description: '', peopleAffected: '' });
    } catch (err) {
      toast.error(err.message);
    }
    setSubmitting(false);
  }

  async function handleCSV(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data.map(row => ({
            location: row.location || row.Location || '',
            problem: row.problem || row.Problem || '',
            urgency: row.urgency || row.Urgency || 'Medium',
            description: row.description || row.Description || '',
            peopleAffected: Number(row.peopleAffected || row['People Affected'] || 0),
            reporterName: 'CSV Import'
          }));
          await bulkImportReports(rows);
          toast.success(`✅ Imported ${rows.length} reports!`);
        } catch (err) {
          toast.error(err.message);
        }
        setImporting(false);
        fileRef.current.value = '';
      }
    });
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this report?')) return;
    await deleteReport(id);
    toast.success('Deleted');
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Field Reports</h1>
          <p className="page-sub">Step 0 & 1 — Data collection & structuring</p>
        </div>
        <div className="tab-switcher">
          {['form', 'csv', 'list'].map(t => (
            <button key={t} className={activeTab === t ? 'active' : ''} onClick={() => setActiveTab(t)}>
              {t === 'form' ? '📝 Manual Entry' : t === 'csv' ? '📂 CSV Import' : `📋 All Reports (${reports.length})`}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'form' && (
        <div className="form-container">
          <div className="form-card">
            <h3>📍 Submit Field Report</h3>
            <p className="form-hint">NGO staff & field workers can submit reports from the ground.</p>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="field-group">
                  <label>Location / Area *</label>
                  <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Area A, Block 3, Village Name" required />
                </div>
                <div className="field-group">
                  <label>Problem Type *</label>
                  <select value={form.problem} onChange={e => setForm(p => ({ ...p, problem: e.target.value }))} required>
                    <option value="">Select problem...</option>
                    {PROBLEMS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="field-group">
                  <label>Urgency Level</label>
                  <div className="urgency-btns">
                    {URGENCIES.map(u => (
                      <button type="button" key={u} className={`urg-btn urg-${u.toLowerCase()} ${form.urgency === u ? 'active' : ''}`} onClick={() => setForm(p => ({ ...p, urgency: u }))}>
                        {u === 'High' ? '🔴' : u === 'Medium' ? '🟡' : '🟢'} {u}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="field-group">
                  <label>People Affected</label>
                  <input type="number" value={form.peopleAffected} onChange={e => setForm(p => ({ ...p, peopleAffected: e.target.value }))} placeholder="Estimated count" min="0" />
                </div>
                <div className="field-group full-width">
                  <label>Description</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Detailed description of the situation..." rows={3} />
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? '⏳ Submitting...' : '📤 Submit Report'}
              </button>
            </form>
          </div>

          <div className="info-card">
            <h4>📦 Data Structure Preview</h4>
            <pre className="json-preview">{JSON.stringify({
              location: form.location || "Area A",
              problem: form.problem || "Food Shortage",
              urgency: form.urgency,
              peopleAffected: form.peopleAffected || 0,
              status: "pending",
              createdAt: "serverTimestamp()"
            }, null, 2)}</pre>
          </div>
        </div>
      )}

      {activeTab === 'csv' && (
        <div className="csv-container">
          <div className="csv-card">
            <div className="csv-icon">📂</div>
            <h3>Bulk CSV Import</h3>
            <p>Upload a CSV file with columns: <code>location, problem, urgency, description, peopleAffected</code></p>
            <div className="csv-template">
              <strong>Example CSV:</strong>
              <pre>{`location,problem,urgency,peopleAffected,description
Area A,Food Shortage,High,200,Critical food supply needed
Area B,Water Access,Medium,50,Well needs repair
Area C,Medical Aid,High,30,Clinic closed`}</pre>
            </div>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleCSV} style={{ display: 'none' }} />
            <button className="btn-primary" onClick={() => fileRef.current.click()} disabled={importing}>
              {importing ? '⏳ Importing...' : '📤 Upload CSV'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'list' && (
        <div className="table-section">
          {loading ? <div className="loading-state">Loading...</div> : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Problem</th>
                    <th>Urgency</th>
                    <th>People</th>
                    <th>Reporter</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map(r => (
                    <tr key={r.id}>
                      <td>📍 {r.location}</td>
                      <td>{r.problem}</td>
                      <td><span className={`badge badge-${r.urgency?.toLowerCase()}`}>{r.urgency}</span></td>
                      <td>{r.peopleAffected || '—'}</td>
                      <td>{r.reporterName}</td>
                      <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                      <td>
                        <button className="btn-danger-sm" onClick={() => handleDelete(r.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                  {reports.length === 0 && (
                    <tr><td colSpan={7} className="empty-row">No reports yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
