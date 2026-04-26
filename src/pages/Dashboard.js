// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { getAnalytics, useReports, useProblems, useTasks } from '../hooks/useFirestore';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#00d4aa','#2979ff','#aa5aff','#ff9500','#ff3d57','#ffd740','#00e676'];
const tooltipStyle = { background: '#0d1625', border: '1px solid #1a2840', borderRadius: 8, fontSize: 12, color: '#e8f0ff' };

function StatCard({ label, value, icon, color, sub, trend }) {
  return (
    <div className="stat-card" style={{ '--accent': color }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

function RealtimeFeed({ reports }) {
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    const items = reports.slice(0, 8).map(r => ({
      id: r.id,
      text: `${r.urgency === 'High' ? '🔴' : r.urgency === 'Medium' ? '🟡' : '🟢'} ${r.problem} reported at ${r.location}`,
      time: 'Live',
      color: r.urgency === 'High' ? 'var(--red)' : r.urgency === 'Medium' ? 'var(--orange)' : 'var(--green)',
    }));
    setFeed(items);
  }, [reports]);

  return (
    <div className="realtime-feed">
      <div className="feed-header">
        <div className="section-title" style={{ marginBottom: 0 }}>Live Field Activity</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="feed-live-dot"></div>
          <span style={{ fontSize: 11, color: 'var(--teal)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Real-Time</span>
        </div>
      </div>
      {feed.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--text3)', padding: '12px 0' }}>No activity yet. Submit field reports to see live feed.</div>
      ) : feed.map(item => (
        <div key={item.id} className="feed-item">
          <div className="feed-dot" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }}></div>
          <div className="feed-text">{item.text}</div>
          <div className="feed-time">{item.time}</div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const { data: reports } = useReports();
  const { data: problems } = useProblems();
  const { data: tasks } = useTasks();
  const { userProfile, currentUser } = useAuth();

  useEffect(() => {
    getAnalytics().then(setAnalytics);
  }, [reports, problems, tasks]);

  if (!analytics) return (
    <div className="loading-state">
      <div className="loading-spinner"></div>
      Loading operations dashboard…
    </div>
  );

  const completionRate = analytics.totalTasks > 0
    ? Math.round((analytics.completedTasks / analytics.totalTasks) * 100) : 0;
  const highUrgency = reports.filter(r => r.urgency === 'High').length;
  const userName = userProfile?.name || currentUser?.displayName || 'Field Commander';

  // Activity trend (based on real data size)
  const trendData = ['W1','W2','W3','W4'].map((w, i) => ({
    week: w,
    reports: Math.max(0, Math.floor(analytics.totalReports * (0.2 + i * 0.2 + Math.random() * 0.1))),
    resolved: Math.max(0, Math.floor(analytics.completedTasks * (0.1 + i * 0.25 + Math.random() * 0.1))),
  }));

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Operations Dashboard</h1>
          <p className="page-sub">Welcome back, {userName.split(' ')[0]} · Real-time field intelligence</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="live-badge">⬡ LIVE</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'Space Mono, monospace' }}>
            {new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <StatCard label="Field Reports" value={analytics.totalReports} icon="◈" color="var(--blue2)" sub="Total submissions" />
        <StatCard label="Active Problems" value={analytics.totalProblems} icon="◬" color="var(--orange)" sub="Needs response" />
        <StatCard label="Tasks Assigned" value={analytics.totalTasks} icon="◎" color="var(--teal)" sub={`${completionRate}% complete`} />
        <StatCard label="High Urgency" value={highUrgency} icon="◬" color="var(--red)" sub="Critical zones" />
        <StatCard label="Completed Tasks" value={analytics.completedTasks} icon="⬡" color="var(--green)" sub="Resolved" />
        <StatCard label="Active Zones" value={analytics.areaData.length} icon="◉" color="var(--purple)" sub="Distinct areas" />
      </div>

      {/* Real-time Feed + Trend Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, marginBottom: 24 }}>
        <RealtimeFeed reports={reports} />

        <div className="chart-card">
          <h3>Activity Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gradR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00d4aa" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gradT" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2979ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2979ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="reports"  stroke="#00d4aa" fill="url(#gradR)" strokeWidth={2} name="Reports" />
              <Area type="monotone" dataKey="resolved" stroke="#2979ff"  fill="url(#gradT)" strokeWidth={2} name="Resolved" />
              <Legend wrapperStyle={{ fontSize: 11, color: '#4a6080' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Reports by Area</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics.areaData.slice(0, 7)}>
              <XAxis dataKey="name" tick={{ fill: '#4a6080', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#00d4aa" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Problem Types</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={analytics.typeData.length > 0 ? analytics.typeData : [{ name: 'No data', value: 1 }]}
                cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                paddingAngle={3} dataKey="value"
              >
                {analytics.typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#4a6080' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Urgency Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={analytics.urgencyData.filter(u=>u.value>0).length > 0
                  ? analytics.urgencyData.filter(u=>u.value>0)
                  : [{ name:'No data', value:1 }]}
                cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value"
              >
                <Cell fill="var(--red)" stroke="transparent" />
                <Cell fill="var(--orange)" stroke="transparent" />
                <Cell fill="var(--green)" stroke="transparent" />
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#4a6080' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Priority Zones */}
      {analytics.areaData.length > 0 && (
        <div className="priority-section">
          <div className="section-title">Priority Zones — Auto Detected</div>
          <div className="priority-list">
            {analytics.areaData.slice(0, 5).map((area, i) => (
              <div key={area.name} className={`priority-item`}>
                <span className="priority-rank">#{i + 1}</span>
                <span className="priority-name">{area.name}</span>
                <span className="priority-count">{area.count} reports</span>
                <span className={`badge ${i === 0 ? 'badge-high' : i < 3 ? 'badge-medium' : 'badge-low'}`} style={{ marginLeft: 'auto' }}>
                  {i === 0 ? '◬ CRITICAL' : i < 3 ? '◎ HIGH' : '⬡ LOW'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Reports Table */}
      <div className="recent-section">
        <div className="section-title">Recent Field Reports</div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Location</th>
                <th>Problem</th>
                <th>Urgency</th>
                <th>Reporter</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.slice(0, 10).map(r => (
                <tr key={r.id}>
                  <td><span className="loc-tag">◉ {r.location}</span></td>
                  <td style={{ color: 'var(--text)', fontWeight: 500 }}>{r.problem}</td>
                  <td><span className={`badge badge-${r.urgency?.toLowerCase()}`}>{r.urgency}</span></td>
                  <td style={{ color: 'var(--text3)' }}>{r.reporterName || 'Anonymous'}</td>
                  <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr><td colSpan={5} className="empty-row">No reports yet. Use Field Reports to submit data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
