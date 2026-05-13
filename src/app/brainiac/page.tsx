import React from 'react';

export default function AdminDashboard() {
  const stats = [
    { label: 'Posts', value: '12', sub: '3 Drafts' },
    { label: 'Views', value: '847', sub: '+12% from last week' },
    { label: 'Files', value: '5', sub: '2.4 GB used' },
    { label: 'Projects', value: '7', sub: '2 Featured' },
  ];

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-3xl font-bold font-display mb-2">Good morning, Brainiac</h2>
        <p className="text-text-muted font-mono">Saturday · April 18, 2026</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-6 rounded-2xl">
            <div className="text-text-dim text-xs uppercase tracking-widest mb-1 font-mono">{s.label}</div>
            <div className="text-3xl font-bold font-display text-accent-primary mb-2">{s.value}</div>
            <div className="text-[10px] text-text-muted">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold font-display text-xl">Recent Activity</h3>
            <button className="text-xs text-accent-cyan font-mono hover:underline">View all</button>
          </div>
          <div className="space-y-6">
            {[
              { type: 'Published', target: 'Post X', time: '2 hours ago', icon: '✦' },
              { type: 'Edited', target: 'Project Y', time: '5 hours ago', icon: '◈' },
              { type: 'Uploaded', target: 'avatar.jpg', time: 'Yesterday', icon: '◻' },
              { type: 'New Lead', target: 'Inquiry from X', time: '2 days ago', icon: '✉' },
            ].map((act, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-bg-overlay flex items-center justify-center text-accent-glow">{act.icon}</div>
                <div>
                  <div className="text-sm font-medium">
                    <span className="text-text-muted">{act.type}</span> <span className="text-text-primary">{act.target}</span>
                  </div>
                  <div className="text-[10px] text-text-dim font-mono mt-1">{act.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl">
          <h3 className="font-bold font-display text-xl mb-8">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center p-6 glass rounded-2xl hover:border-accent-primary transition-colors group">
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📝</span>
              <span className="text-xs font-bold uppercase tracking-widest text-text-muted group-hover:text-accent-primary">New Post</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 glass rounded-2xl hover:border-accent-cyan transition-colors group">
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">◻</span>
              <span className="text-xs font-bold uppercase tracking-widest text-text-muted group-hover:text-accent-cyan">Add Project</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 glass rounded-2xl hover:border-accent-glow transition-colors group">
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">☁</span>
              <span className="text-xs font-bold uppercase tracking-widest text-text-muted group-hover:text-accent-glow">Upload File</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 glass rounded-2xl hover:border-accent-purple transition-colors group">
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">⚙</span>
              <span className="text-xs font-bold uppercase tracking-widest text-text-muted group-hover:text-accent-purple">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
