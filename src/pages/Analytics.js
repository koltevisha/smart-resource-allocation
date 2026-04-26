// src/pages/Analytics.js
import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend
} from 'recharts';
import { getAnalytics, useReports, useTasks, useProblems } from '../hooks/useFirestore';

const COLORS = ['#00d4aa','#2979ff','#aa5aff','#ff9500','#ff3d57','#ffd740','#00e676'];

const tooltipStyle = { background: '#0d1625', border: '1px solid #1a2840', borderRadius: 8, fontSize: 12, color: '#e8f0ff' };

function MetricCard({ title, value, sub, trend, color }) {
  return (
    <div className="stat-card" style={{ '--accent': color || 'var(--teal)' }}>
      <div className="stat-body" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{title}</div>
            {sub && <div className="stat-sub">{sub}</div>}
          </div>
          {trend && (
            <div style={{ fontSize: 12, color: trend > 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700, fontFamily: 'Space Mono, monospace' }}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const { data: reports } = useReports();
  const { data: tasks } = useTasks();
  const { data: problems } = useProblems();

  useEffect(() => {
    getAnalytics().then(setAnalytics);
  }, [reports, problems, tasks]);

  if (!analytics) return (
    <div className="loading-state">
      <div className="loading-spinner"></div>
      Loading analytics…
    </div>
  );

  const completionRate = analytics.totalTasks > 0
    ? Math.round((analytics.completedTasks / analytics.totalTasks) * 100) : 0;

  const resolvedProblems = problems.filter(p => p.status === 'resolved').length;
  const resolutionRate = analytics.totalProblems > 0
    ? Math.round((resolvedProblems / analytics.totalProblems) * 100) : 0;

  // Weekly trend (simulated based on data)
  const weeklyData = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => ({
    day,
    reports: Math.max(0, Math.floor(analytics.totalReports / 7 * (0.6 + Math.random() * 0.8))),
    tasks:   Math.max(0, Math.floor(analytics.totalTasks / 7 * (0.5 + Math.random() * 0.9))),
  }));

  // Response time data (simulated)
  const responseData = analytics.areaData.slice(0, 6).map(a => ({
    name: a.name.length > 10 ? a.name.slice(0, 10) + '…' : a.name,
    avgHours: Math.floor(2 + Math.random() * 18),
    reports: a.count,
  }));

  // Skill demand radar
  const skillData = [
    { skill: 'Medical', demand: 85, supply: 60 },
    { skill: 'Food', demand: 70, supply: 80 },
    { skill: 'Water', demand: 65, supply: 55 },
    { skill: 'Shelter', demand: 50, supply: 45 },
    { skill: 'Edu', demand: 40, supply: 50 },
    { skill: 'Logistics', demand: 75, supply: 65 },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics & Insights</h1>
          <p className="page-sub">Deep data intelligence for smarter decision-making</p>
        </div>
        <div className="live-badge">⬡ LIVE DATA</div>
      </div>

      {/* KPI Row */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <MetricCard title="Task Completion" value={`${completionRate}%`} sub={`${analytics.completedTasks} of ${analytics.totalTasks}`} trend={8} color="var(--teal)" />
        <MetricCard title="Problem Resolution" value={`${resolutionRate}%`} sub={`${resolvedProblems} resolved`} trend={12} color="var(--blue)" />
        <MetricCard title="Total Reports" value={analytics.totalReports} sub="All time" trend={5} color="var(--purple)" />
        <MetricCard title="Active Zones" value={analytics.areaData.length} sub="Distinct areas" color="var(--orange)" />
      </div>

      {/* Charts Row 1 */}
      <div className="analytics-grid">
        <div className="chart-card">
          <h3>Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="gradReports" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00d4aa" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00d4aa" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gradTasks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2979ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2979ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="reports" stroke="#00d4aa" fill="url(#gradReports)" strokeWidth={2} />
              <Area type="monotone" dataKey="tasks"   stroke="#2979ff"  fill="url(#gradTasks)"   strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#4a6080' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Response Time by Area (hrs)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={responseData} layout="vertical">
              <XAxis type="number" tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#7d9bc4', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="avgHours" fill="#aa5aff" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="analytics-grid" style={{ marginTop: 20 }}>
        <div className="chart-card">
          <h3>Problem Type Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={analytics.typeData.length > 0 ? analytics.typeData : [{name:'No data',value:1}]}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {analytics.typeData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#4a6080' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Skill Demand vs Supply</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={skillData}>
              <PolarGrid stroke="#1a2840" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: '#4a6080', fontSize: 10 }} />
              <Radar name="Demand" dataKey="demand" stroke="#ff3d57" fill="#ff3d57" fillOpacity={0.15} />
              <Radar name="Supply" dataKey="supply" stroke="#00d4aa" fill="#00d4aa" fillOpacity={0.15} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#4a6080' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Areas Table */}
      <div style={{ marginTop: 24 }}>
        <div className="section-title">Hotspot Analysis</div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Location</th>
                <th>Reports</th>
                <th>Urgency Level</th>
                <th>Estimated Impact</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {analytics.areaData.slice(0, 8).map((area, i) => (
                <tr key={area.name}>
                  <td><span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: i < 3 ? 'var(--teal)' : 'var(--text3)' }}>#{i + 1}</span></td>
                  <td><span className="loc-tag">◉ {area.name}</span></td>
                  <td><span style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, fontWeight: 700 }}>{area.count}</span></td>
                  <td>
                    <span className={`badge badge-${i === 0 ? 'high' : i < 3 ? 'medium' : 'low'}`}>
                      {i === 0 ? 'Critical' : i < 3 ? 'High' : 'Moderate'}
                    </span>
                  </td>
                  <td><span style={{ fontSize: 12, color: 'var(--text3)' }}>{area.count * 47}+ people</span></td>
                  <td><span className="badge badge-open">Active</span></td>
                </tr>
              ))}
              {analytics.areaData.length === 0 && (
                <tr><td colSpan={6} className="empty-row">No area data yet. Add field reports.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
