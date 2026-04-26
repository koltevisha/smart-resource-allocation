// src/pages/ResourceMap.js
import React, { useState } from 'react';
import { useReports, useProblems } from '../hooks/useFirestore';

const RESOURCES = [
  { id: 1, name: 'Medical Camp Alpha', type: 'Medical', location: 'Zone A', status: 'active', x: '22%', y: '35%', capacity: '200 beds', urgency: 'high' },
  { id: 2, name: 'Food Distribution Hub', type: 'Food', location: 'Zone B', status: 'active', x: '55%', y: '25%', capacity: '500 meals/day', urgency: 'medium' },
  { id: 3, name: 'Water Purification Unit', type: 'Water', location: 'Zone C', status: 'active', x: '75%', y: '55%', capacity: '10K liters/day', urgency: 'medium' },
  { id: 4, name: 'Shelter Camp 3', type: 'Shelter', location: 'Zone D', status: 'critical', x: '35%', y: '65%', capacity: '150 families', urgency: 'high' },
  { id: 5, name: 'Education Center', type: 'Education', location: 'Zone E', status: 'active', x: '65%', y: '75%', capacity: '80 students', urgency: 'low' },
  { id: 6, name: 'Emergency Supply Depot', type: 'Logistics', location: 'Zone F', status: 'active', x: '45%', y: '45%', capacity: '2T supplies', urgency: 'medium' },
  { id: 7, name: 'Crisis Counseling Center', type: 'Counseling', location: 'Zone G', status: 'active', x: '15%', y: '70%', capacity: '50 sessions/day', urgency: 'low' },
];

const RESOURCE_ICONS = {
  Medical: '⊕', Food: '◈', Water: '◎', Shelter: '⬡',
  Education: '◰', Logistics: '◬', Counseling: '◑',
};

const urgencyColor = { high: 'var(--red)', medium: 'var(--orange)', low: 'var(--green)' };

export default function ResourceMap() {
  const { data: reports } = useReports();
  const { data: problems } = useProblems();
  const [selected, setSelected] = useState(null);
  const [filterType, setFilterType] = useState('all');

  const types = ['all', ...new Set(RESOURCES.map(r => r.type))];
  const visible = filterType === 'all' ? RESOURCES : RESOURCES.filter(r => r.type === filterType);

  const activeProblems = problems.filter(p => p.status !== 'resolved').length;
  const highUrgency = reports.filter(r => r.urgency === 'High').length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Resource Map</h1>
          <p className="page-sub">Live deployment overview — {RESOURCES.length} active resources</p>
        </div>
        <div className="live-badge">◉ LIVE</div>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card" style={{ '--accent': 'var(--teal)' }}>
          <div className="stat-body">
            <div className="stat-value">{RESOURCES.length}</div>
            <div className="stat-label">Active Resources</div>
          </div>
        </div>
        <div className="stat-card" style={{ '--accent': 'var(--red)' }}>
          <div className="stat-body">
            <div className="stat-value">{highUrgency}</div>
            <div className="stat-label">High Urgency Zones</div>
          </div>
        </div>
        <div className="stat-card" style={{ '--accent': 'var(--orange)' }}>
          <div className="stat-body">
            <div className="stat-value">{activeProblems}</div>
            <div className="stat-label">Open Problems</div>
          </div>
        </div>
        <div className="stat-card" style={{ '--accent': 'var(--green)' }}>
          <div className="stat-body">
            <div className="stat-value">{RESOURCES.filter(r=>r.status==='active').length}</div>
            <div className="stat-label">Operational</div>
          </div>
        </div>
      </div>

      {/* Type Filter */}
      <div className="filter-bar" style={{ marginBottom: 16 }}>
        {types.map(t => (
          <button key={t} className={filterType===t?'active':''} onClick={()=>setFilterType(t)}>
            {t === 'all' ? `All (${RESOURCES.length})` : `${RESOURCE_ICONS[t] || '◎'} ${t}`}
          </button>
        ))}
      </div>

      {/* Map + Side Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, marginBottom: 24 }}>
        {/* Map */}
        <div className="map-container">
          <div className="map-grid-lines"></div>

          {/* Background styling */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 60% 60% at 40% 40%, rgba(0,212,170,0.04) 0%, transparent 60%), var(--bg3)',
          }}></div>

          {/* Zone labels */}
          {['A','B','C','D','E','F','G'].map((z, i) => {
            const positions = [
              { left: '18%', top: '30%' }, { left: '51%', top: '20%' },
              { left: '71%', top: '50%' }, { left: '31%', top: '60%' },
              { left: '61%', top: '70%' }, { left: '41%', top: '40%' },
              { left: '11%', top: '65%' },
            ];
            return (
              <div key={z} style={{
                position: 'absolute',
                left: positions[i].left, top: positions[i].top,
                width: 80, height: 80,
                border: '1px dashed rgba(26,40,64,0.8)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, color: 'var(--text3)',
                pointerEvents: 'none',
                zIndex: 1,
              }}>Zone {z}</div>
            );
          })}

          {/* Resource pins */}
          {visible.map(r => (
            <button
              key={r.id}
              onClick={() => setSelected(r.id === selected ? null : r.id)}
              title={r.name}
              style={{
                position: 'absolute',
                left: r.x, top: r.y,
                transform: 'translate(-50%,-50%)',
                zIndex: 10,
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 0,
              }}
            >
              <div style={{
                width: selected === r.id ? 44 : 36,
                height: selected === r.id ? 44 : 36,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${urgencyColor[r.urgency]}22, ${urgencyColor[r.urgency]}44)`,
                border: `2px solid ${urgencyColor[r.urgency]}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: selected === r.id ? 18 : 14,
                boxShadow: `0 0 ${selected === r.id ? 20 : 10}px ${urgencyColor[r.urgency]}66`,
                transition: 'all 0.2s',
                animation: r.urgency === 'high' ? 'pinPulse 2s ease-in-out infinite' : 'none',
              }}>
                {RESOURCE_ICONS[r.type] || '◎'}
              </div>
              {selected === r.id && (
                <div style={{
                  position: 'absolute',
                  bottom: '110%', left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--bg2)', border: '1px solid var(--border2)',
                  borderRadius: 8, padding: '6px 10px',
                  fontSize: 11, color: 'var(--text)', fontWeight: 600,
                  whiteSpace: 'nowrap', zIndex: 20,
                  boxShadow: 'var(--shadow)',
                }}>
                  {r.name}
                </div>
              )}
            </button>
          ))}

          {/* Legend */}
          <div className="map-legend">
            <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--red)' }}></div> Critical</div>
            <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--orange)' }}></div> Medium</div>
            <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--green)' }}></div> Low</div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="map-info-panel">
          <div className="section-title">
            {selected ? 'Resource Detail' : 'All Resources'}
          </div>

          {selected ? (() => {
            const r = RESOURCES.find(x => x.id === selected);
            return r ? (
              <div>
                <div style={{ marginBottom: 16, padding: 14, background: 'var(--bg3)', borderRadius: 10, border: `1px solid ${urgencyColor[r.urgency]}44` }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{RESOURCE_ICONS[r.type]}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{r.type} · {r.location}</div>
                </div>
                {[
                  { label: 'Capacity', value: r.capacity },
                  { label: 'Status', value: r.status },
                  { label: 'Urgency', value: r.urgency },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span style={{ color: 'var(--text3)' }}>{item.label}</span>
                    <span style={{ color: 'var(--text)', fontWeight: 600 }}>{item.value}</span>
                  </div>
                ))}
                <button className="btn-secondary" style={{ width: '100%', marginTop: 14 }} onClick={() => setSelected(null)}>
                  ← Back to List
                </button>
              </div>
            ) : null;
          })() : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {visible.map(r => (
                <div
                  key={r.id}
                  className="resource-item"
                  style={{ cursor: 'pointer', padding: '8px 0' }}
                  onClick={() => setSelected(r.id)}
                >
                  <div className="resource-icon" style={{ color: urgencyColor[r.urgency] }}>{RESOURCE_ICONS[r.type]}</div>
                  <div>
                    <div className="resource-name">{r.name}</div>
                    <div className="resource-loc">◉ {r.location}</div>
                  </div>
                  <div className="resource-status">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: urgencyColor[r.urgency], boxShadow: `0 0 6px ${urgencyColor[r.urgency]}` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Problem Hotspots from real data */}
      {reports.filter(r => r.urgency === 'High').length > 0 && (
        <div className="card">
          <div className="section-title">Live Field Report Hotspots</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 10 }}>
            {reports.filter(r => r.urgency === 'High').slice(0, 6).map(r => (
              <div key={r.id} style={{
                padding: 12, background: 'var(--bg3)',
                border: '1px solid rgba(255,61,87,0.25)',
                borderLeft: '3px solid var(--red)',
                borderRadius: 8, fontSize: 13,
              }}>
                <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{r.location}</div>
                <div style={{ color: 'var(--text3)', fontSize: 12 }}>{r.problem}</div>
                <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4, fontWeight: 600 }}>● HIGH URGENCY</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
