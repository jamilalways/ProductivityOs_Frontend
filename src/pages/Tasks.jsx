import { useState } from 'react';
import TaskBoard from '../components/tasks/TaskBoard';

const TABS = [
  { value: 'daily',   label: 'Daily'   },
  { value: 'weekly',  label: 'Weekly'  },
  { value: 'monthly', label: 'Monthly' },
];

export default function Tasks() {
  const [tab, setTab] = useState('daily');

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 22, margin: 0, letterSpacing: '-0.03em' }}>Task Planner</h2>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: 14 }}>
            Drag tasks between columns · incomplete daily tasks carry over automatically
          </p>
        </div>

        {/* Period tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: 12, padding: 4, gap: 2 }}>
          {TABS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              style={{
                padding: '7px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                background: tab === value ? 'var(--accent-violet)' : 'transparent',
                color:      tab === value ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <TaskBoard plannerType={tab} />
    </div>
  );
}
