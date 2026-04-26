// src/pages/NotificationsPage.js
import React, { useState, useEffect } from 'react';
import { useReports, useProblems, useTasks } from '../hooks/useFirestore';

function timeAgo(date) {
  const diff = Date.now() - (date?.toDate?.() || new Date(date)).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsPage() {
  const { data: reports } = useReports();
  const { data: problems } = useProblems();
  const { data: tasks } = useTasks();
  const [filter, setFilter] = useState('all');
  const [dismissed, setDismissed] = useState(new Set());

  // Build notifications from real data
  const notifications = [
    ...reports.slice(0, 5).map(r => ({
      id: `report-${r.id}`,
      type: r.urgency === 'High' ? 'critical' : r.urgency === 'Medium' ? 'warning' : 'info',
      category: 'report',
      icon: r.urgency === 'High' ? '◬' : '◈',
      title: `New Field Report — ${r.urgency} Urgency`,
      desc: `${r.problem} reported at ${r.location} by ${r.reporterName || 'Anonymous'}`,
      time: r.createdAt,
      unread: true,
    })),
    ...problems.filter(p => p.status === 'open').slice(0, 4).map(p => ({
      id: `prob-${p.id}`,
      type: p.urgency === 'High' ? 'critical' : 'warning',
      category: 'problem',
      icon: '◬',
      title: `Open Problem Needs Attention`,
      desc: `"${p.title}" in ${p.location} — ${p.urgency} priority, no assignment yet`,
      time: p.createdAt,
      unread: true,
    })),
    ...tasks.filter(t => t.status === 'completed').slice(0, 3).map(t => ({
      id: `task-${t.id}`,
      type: 'success',
      category: 'task',
      icon: '◎',
      title: `Task Completed ✓`,
      desc: `"${t.title}" completed by ${t.volunteerName} in ${t.location}`,
      time: t.updatedAt || t.createdAt,
      unread: false,
    })),
    ...tasks.filter(t => t.status === 'in-progress').slice(0, 3).map(t => ({
      id: `prog-${t.id}`,
      type: 'info',
      category: 'task',
      icon: '◑',
      title: `Task In Progress`,
      desc: `${t.volunteerName} is working on "${t.title}"`,
      time: t.updatedAt || t.createdAt,
      unread: false,
    })),
    // System notifications
    { id: 'sys-1', type: 'info', category: 'system', icon: '⬡', title: 'System Health: All systems operational', desc: 'Firebase Firestore, Auth, and real-time sync are running normally.', time: null, unread: false },
  ].filter(n => !dismissed.has(n.id));

  const filtered = filter === 'all' ? notifications
    : notifications.filter(n => n.category === filter);

  const unreadCount = notifications.filter(n => n.unread).length;

  const typeColors = {
    critical: 'var(--red)',
    warning:  'var(--orange)',
    success:  'var(--teal)',
    info:     'var(--blue2)',
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Alerts & Notifications</h1>
          <p className="page-sub">{unreadCount} unread · Real-time system alerts</p>
        </div>
        {unreadCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text3)' }}>{unreadCount} unread</span>
            <div className="live-badge">◑ LIVE</div>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Critical', count: notifications.filter(n=>n.type==='critical').length, color: 'var(--red)' },
          { label: 'Warnings', count: notifications.filter(n=>n.type==='warning').length, color: 'var(--orange)' },
          { label: 'Completed', count: notifications.filter(n=>n.type==='success').length, color: 'var(--teal)' },
          { label: 'Info', count: notifications.filter(n=>n.type==='info').length, color: 'var(--blue2)' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ '--accent': s.color }}>
            <div className="stat-body">
              <div className="stat-value" style={{ fontSize: 22 }}>{s.count}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="filter-bar" style={{ marginBottom: 16 }}>
        {['all','report','problem','task','system'].map(f => (
          <button key={f} className={filter===f?'active':''} onClick={()=>setFilter(f)}>
            {f.charAt(0).toUpperCase()+f.slice(1)} {f==='all'?`(${notifications.length})`:''}
          </button>
        ))}
        <button
          onClick={() => {
            const unread = notifications.filter(n=>n.unread).map(n=>n.id);
            setDismissed(prev => new Set([...prev, ...unread]));
          }}
          style={{ marginLeft: 'auto', padding: '6px 14px', background: 'none', border: '1px solid var(--border)', borderRadius: 20, color: 'var(--text3)', fontSize: 12, cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}
        >
          Clear Unread
        </button>
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">◌</div>
          <div>No notifications in this category</div>
        </div>
      ) : (
        <div className="notification-list">
          {filtered.map(n => (
            <div
              key={n.id}
              className={`notification-item ${n.unread ? 'unread' : ''} ${n.unread ? n.type : ''}`}
            >
              <div style={{ fontSize: 22, flexShrink: 0, color: typeColors[n.type] || 'var(--text3)', marginTop: 1 }}>
                {n.icon}
              </div>
              <div className="notif-body">
                <div className="notif-title">{n.title}</div>
                <div className="notif-desc">{n.desc}</div>
                {n.time && (
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, fontFamily: 'Space Mono, monospace' }}>
                    {(() => { try { return timeAgo(n.time); } catch { return 'recently'; } })()}
                  </div>
                )}
              </div>
              {n.unread && <div className="notif-dot" style={{ background: typeColors[n.type] || 'var(--teal)', boxShadow: `0 0 6px ${typeColors[n.type] || 'var(--teal)'}` }}></div>}
              <button
                onClick={() => setDismissed(prev => new Set([...prev, n.id]))}
                style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16, padding: '0 4px', flexShrink: 0 }}
                title="Dismiss"
              >×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
