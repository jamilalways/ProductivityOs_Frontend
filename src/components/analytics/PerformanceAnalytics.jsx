import { useEffect, useState } from 'react';
import { motion }    from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import api from '../../utils/api';

const Tip = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'8px 14px', fontSize:13 }}>
      <div style={{ fontWeight:600, marginBottom:3 }}>{label}</div>
      {payload.map((p) => <div key={p.name} style={{ color:p.color }}>{p.name}: {p.value}</div>)}
    </div>
  ) : null;

const item = { hidden:{ opacity:0, y:14 }, show:{ opacity:1, y:0, transition:{ type:'spring', stiffness:260, damping:22 } } };

export default function PerformanceAnalytics({ period = 'weekly' }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      const { data } = await api.get(`/analytics?period=${period}`);
      setAnalyticsData(data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadAnalytics();
  }, [period]);

  const chartData = analyticsData?.analytics?.length 
    ? analyticsData.analytics.map((d) => ({
        day:   period === 'weekly' 
                ? new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })
                : new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tasks: d.tasksCompleted,
        xp:    d.xpEarned,
        score: d.productivityScore,
        habits: d.habitsCompleted || 0,
      }))
    : [];

  if (loading && !analyticsData) return <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading analytics...</div>;

  return (
    <motion.div variants={item} className="card" style={{ padding: '24px 20px', marginBottom: 20 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
          {period === 'weekly' ? 'Weekly' : period === 'monthly' ? 'Monthly' : period === 'quarterly' ? 'Quarterly' : 'Yearly'} Activity Chart
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Detailed daily activity performance breakdown.
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            interval={period === 'weekly' ? 0 : 'preserveStartEnd'}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
          <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="tasks" name="Tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="score" name="Score" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="xp"    name="XP"    fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="habits" name="Habits" fill="#f43f5e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{ 
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20, marginTop: 24,
        paddingTop: 16, borderTop: '1px solid var(--border)'
      }}>
        {[
          { label: 'Tasks', color: '#3b82f6' },
          { label: 'Score', color: '#10b981' },
          { label: 'XP',    color: '#8b5cf6' },
          { label: 'Habits', color: '#f43f5e' },
        ].map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: l.color }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
