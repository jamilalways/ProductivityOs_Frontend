import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore }  from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function Settings() {
  const { user, updateUser }    = useAuthStore();
  const { theme, toggle }       = useThemeStore();
  const [form, setForm]         = useState({ name: user?.name ?? '', notifications: user?.notifications ?? { taskReminders: true, deadlineAlerts: true } });
  const [loading, setLoading]   = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await api.patch('/auth/update', form);
      updateUser(data.user);
      toast.success('Settings saved!');
    } catch { toast.error('Failed to save'); }
    setLoading(false);
  };

  const SectionCard = ({ title, children }) => (
    <div className="card" style={{ padding: '24px', marginBottom: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 18 }}>{title}</div>
      {children}
    </div>
  );

  const Toggle = ({ label, desc, checked, onChange }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>}
      </div>
      <button
        onClick={onChange}
        style={{
          width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer', position: 'relative',
          background: checked ? 'var(--accent-violet)' : 'var(--bg-input)',
          transition: 'background 0.2s',
        }}
      >
        <div style={{
          position: 'absolute', top: 3, left: checked ? 22 : 3,
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s',
        }} />
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontWeight: 800, fontSize: 22, margin: 0, letterSpacing: '-0.03em' }}>Settings</h2>
        <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: 14 }}>Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <SectionCard title="👤 Profile">
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-muted)' }}>DISPLAY NAME</label>
        <input className="input" style={{ marginBottom: 18 }} value={form.name} onChange={(e) => set('name', e.target.value)} />
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-muted)' }}>EMAIL</label>
        <input className="input" value={user?.email ?? ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed', marginBottom: 6 }} />
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18 }}>Email cannot be changed</div>
        <button className="btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? 'Saving…' : 'Save Profile'}
        </button>
      </SectionCard>

      {/* Appearance */}
      <SectionCard title="🎨 Appearance">
        <Toggle
          label="Dark Mode"
          desc="Use dark theme across the app"
          checked={theme === 'dark'}
          onChange={toggle}
        />
      </SectionCard>

      {/* Notifications */}
      <SectionCard title="🔔 Notifications">
        <Toggle
          label="Task Reminders"
          desc="Get reminded about upcoming tasks"
          checked={form.notifications.taskReminders}
          onChange={() => setForm((f) => ({ ...f, notifications: { ...f.notifications, taskReminders: !f.notifications.taskReminders } }))}
        />
        <Toggle
          label="Deadline Alerts"
          desc="Alert when goals or tasks are due soon"
          checked={form.notifications.deadlineAlerts}
          onChange={() => setForm((f) => ({ ...f, notifications: { ...f.notifications, deadlineAlerts: !f.notifications.deadlineAlerts } }))}
        />
        <button className="btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? 'Saving…' : 'Save Notifications'}
        </button>
      </SectionCard>

      {/* Stats */}
      <SectionCard title="⚡ Your Stats">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            { label: 'Level',          value: user?.level ?? 1    },
            { label: 'Total XP',       value: user?.xp ?? 0       },
            { label: 'Best Streak',    value: `${user?.longestStreak ?? 0}d` },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center', padding: '14px', background: 'var(--bg-input)', borderRadius: 12 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-violet)' }}>{value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
