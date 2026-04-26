// src/pages/AboutUs.js
import React from 'react';

const TEAM = [
  { name: 'Priya Sharma', role: 'Executive Director', bio: 'Humanitarian operations expert with 12+ years in field coordination across South Asia.', initial: 'P', color: 'linear-gradient(135deg,#00d4aa,#0070ff)' },
  { name: 'Arjun Mehta', role: 'Tech Lead', bio: 'Full-stack engineer building real-time systems for disaster response since 2018.', initial: 'A', color: 'linear-gradient(135deg,#aa5aff,#2979ff)' },
  { name: 'Sara Khan', role: 'Field Operations', bio: 'Deployed in 20+ crisis zones. Expert in last-mile resource distribution logistics.', initial: 'S', color: 'linear-gradient(135deg,#ff9500,#ff3d57)' },
  { name: 'Ravi Nair', role: 'Data Analyst', bio: 'Specialist in humanitarian analytics, turning field data into actionable insights.', initial: 'R', color: 'linear-gradient(135deg,#00d8ff,#00d4aa)' },
  { name: 'Meera Joshi', role: 'Volunteer Lead', bio: 'Coordinates a network of 500+ volunteers across 12 states. Former social worker.', initial: 'M', color: 'linear-gradient(135deg,#00e676,#2979ff)' },
  { name: 'Dev Patel', role: 'Partnerships', bio: 'Builds strategic alliances with government, UN agencies, and local NGOs.', initial: 'D', color: 'linear-gradient(135deg,#ffd740,#ff9500)' },
];

const MILESTONES = [
  { year: '2019', event: 'ImpactConnect founded during Kerala floods response' },
  { year: '2020', event: 'Expanded to COVID-19 supply chain coordination across 5 states' },
  { year: '2021', event: 'Deployed in Assam cyclone — coordinated 800+ volunteers in 48 hours' },
  { year: '2022', event: 'Launched digital platform v1.0 with real-time field reporting' },
  { year: '2023', event: '50,000+ people reached, 200+ partner organizations onboarded' },
  { year: '2024', event: 'AI-powered volunteer matching introduced, response time cut by 60%' },
  { year: '2025', event: 'ImpactConnect Pro launched — full resource coordination suite' },
];

const FEATURES = [
  { icon: '⬡', title: 'Real-Time Coordination', desc: 'Live field reports instantly sync across all devices, ensuring every team member has up-to-date situational awareness at all times.' },
  { icon: '◎', title: 'Smart Volunteer Matching', desc: 'Our AI-powered algorithm matches volunteers to tasks based on skills, location, and availability — maximizing impact per deployment.' },
  { icon: '◈', title: 'Crisis Analytics', desc: 'Advanced dashboards aggregate field data into actionable intelligence, enabling data-driven decisions during high-pressure situations.' },
  { icon: '◬', title: 'Resource Optimization', desc: 'Track, allocate, and monitor resources from medical supplies to manpower with granular precision across multiple zones.' },
  { icon: '◉', title: 'Geo-Spatial Mapping', desc: 'Visualize problem hotspots, resource deployments, and volunteer positions on interactive maps for total situational clarity.' },
  { icon: '◑', title: 'Instant Alerts', desc: 'Critical notifications reach the right people at the right time — from field reports to task escalations, nothing falls through the cracks.' },
];

export default function AboutUs() {
  return (
    <div className="page">
      {/* Hero */}
      <div className="about-hero">
        <div className="about-badge">◆ Since 2019</div>
        <h1 className="about-title">Coordinating Compassion<br/>at Scale</h1>
        <p className="about-subtitle">
          ImpactConnect is a next-generation NGO operations platform built to solve the toughest challenge in humanitarian work: getting the right resources to the right people, fast.
        </p>
        <div className="about-stats">
          <div className="about-stat">
            <div className="about-stat-num">50K+</div>
            <div className="about-stat-label">People Reached</div>
          </div>
          <div className="about-stat">
            <div className="about-stat-num">1,200+</div>
            <div className="about-stat-label">Volunteers</div>
          </div>
          <div className="about-stat">
            <div className="about-stat-num">38</div>
            <div className="about-stat-label">Deployments</div>
          </div>
          <div className="about-stat">
            <div className="about-stat-num">200+</div>
            <div className="about-stat-label">Partner NGOs</div>
          </div>
        </div>
      </div>

      {/* Mission */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        <div className="card">
          <div className="section-title">Our Mission</div>
          <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>
            To eliminate coordination failures in humanitarian response. Every minute of delay in disaster zones costs lives. ImpactConnect ensures that field intelligence, volunteer capacity, and resources are perfectly synchronized — so teams can act with speed and precision when it matters most.
          </p>
        </div>
        <div className="card">
          <div className="section-title">Our Vision</div>
          <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>
            A world where no crisis response fails due to poor coordination. We envision a connected ecosystem of NGOs, volunteers, and government bodies operating from a single source of truth — transparent, accountable, and relentlessly effective.
          </p>
        </div>
      </div>

      {/* Core Features */}
      <div className="section-title">Platform Capabilities</div>
      <div className="about-grid">
        {FEATURES.map(f => (
          <div key={f.title} className="about-card">
            <div className="about-card-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Team */}
      <div className="section-title" style={{ marginBottom: 16 }}>The Team</div>
      <div className="team-grid" style={{ marginBottom: 28 }}>
        {TEAM.map(m => (
          <div key={m.name} className="team-card">
            <div className="team-avatar" style={{ background: m.color }}>{m.initial}</div>
            <div className="team-name">{m.name}</div>
            <div className="team-role">{m.role}</div>
            <div className="team-bio">{m.bio}</div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="section-title">Our Journey</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {MILESTONES.map((m, i) => (
            <div key={m.year} style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: i < MILESTONES.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'flex-start' }}>
              <div style={{ minWidth: 44, fontFamily: 'Space Mono, monospace', fontSize: 12, fontWeight: 700, color: 'var(--teal)', paddingTop: 1 }}>{m.year}</div>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)', marginTop: 4, flexShrink: 0, boxShadow: '0 0 6px var(--teal)' }}></div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{m.event}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="section-title">Built With</div>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 14 }}>
          ImpactConnect is built on battle-tested open technologies, designed for reliability under the toughest field conditions.
        </p>
        <div className="tech-stack">
          {['React 19', 'Firebase Realtime DB', 'Firestore', 'Firebase Auth', 'React Router v7', 'Recharts', 'PapaParse', 'Node.js', 'Cloud Functions', 'Google Maps API'].map(t => (
            <span key={t} className="tech-chip">{t}</span>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="card">
        <div className="section-title">Get In Touch</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 16 }}>
          {[
            { icon: '◈', label: 'Email', value: 'ops@impactconnect.org' },
            { icon: '◬', label: 'Emergency Hotline', value: '+91-1800-IMPACT1' },
            { icon: '◎', label: 'HQ', value: 'Pune, Maharashtra, India' },
            { icon: '⬡', label: 'Website', value: 'www.impactconnect.org' },
          ].map(c => (
            <div key={c.label} style={{ padding: '14px', background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{c.icon}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{c.label}</div>
              <div style={{ fontSize: 13, color: 'var(--teal)', fontWeight: 600 }}>{c.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
