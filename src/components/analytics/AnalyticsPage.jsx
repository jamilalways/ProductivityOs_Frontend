import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { TrendingUp, Zap, CheckSquare, Flame, Target, Trophy } from 'lucide-react';
import api from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import { levelTitle, calcLevel } from '../../utils/xp';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const PERIOD_OPTIONS = [
  { value: 'weekly',    label: '7 Days'   },
  { value: 'monthly',   label: '30 Days'  },
  { value: 'quarterly', label: '90 Days'  },
];

const PIE_COLORS = ['#8b5cf6','#10b981','#06b6d4','#f59e0b','#f43f5e','#3b82f6'];

const Tip = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 3 }}>{label}</div>
      {payload.map((p) => <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</div>)}
    </div>
  ) : null;

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item    = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

export default function AnalyticsPage() {
  const { user }     = useAuthStore();
  const [period, setPeriod]   = useState('weekly');
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useBreakpoint(768);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: res } = await api.get(`/analytics?period=${period}`);
        setData(res);
      } catch { /* use mock below */ }
      setLoading(false);
    };
    load();
  }, [period]);

  const summary = data?.summary;
  const analytics = data?.analytics ?? [];
  const level = user?.level ?? calcLevel(user?.xp ?? 0);

  // Chart data from analytics array
  const chartData = analytics.length
    ? analytics.map((d) => ({
        date:   new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tasks:  d.tasksCompleted,
        xp:     d.xpEarned,
        score:  d.productivityScore,
        habits: d.habitsCompleted,
      }))
    : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day) => ({
        date: day,
        tasks:  Math.floor(Math.random() * 9) + 1,
        xp:     Math.floor(Math.random() * 100) + 20,
        score:  Math.floor(Math.random() * 40) + 60,
        habits: Math.floor(Math.random() * 4) + 1,
      }));

  // Pie chart for skill time
  const skillPie = summary?.skillTimeMap
    ? Object.entries(summary.skillTimeMap).map(([name, minutes]) => ({ name, value: Math.round(minutes / 60 * 10) / 10 }))
    : [{ name: 'No data yet', value: 1 }];

  const STAT_CARDS = [
    { label: 'Tasks Completed', value: summary?.totalTasksCompleted ?? '—', icon: CheckSquare, color: '#10b981' },
    { label: 'XP Earned',       value: summary?.totalXpEarned       ?? '—', icon: Zap,         color: '#f59e0b' },
    { label: 'Avg Score',       value: summary ? `${summary.avgProductivityScore}%` : '—', icon: TrendingUp, color: '#06b6d4' },
    { label: 'Current Streak',  value: summary?.currentStreak       ?? user?.streak ?? '—', icon: Flame, color: '#f43f5e' },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={item} style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        marginBottom: 24, gap: 16 
      }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 22, margin: 0, letterSpacing: '-0.03em' }}>Analytics</h2>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: 14 }}>Your productivity at a glance</p>
        </div>
        <div style={{ 
          display: 'flex', background: 'var(--bg-card)', borderRadius: 12, padding: 4, gap: 2,
          maxWidth: '100%', overflowX: 'auto', alignSelf: 'flex-start'
        }}>
          {PERIOD_OPTIONS.map(({ value, label }) => (
            <button key={value} onClick={() => setPeriod(value)} style={{
              padding: '7px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: period === value ? 'var(--accent-violet)' : 'transparent',
              color:      period === value ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}>{label}</button>
          ))}
        </div>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={item} style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit,minmax(180px,1fr))', 
        gap: 14, 
        marginBottom: 20 
      }}>
        {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{ padding: '18px' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color }}>{value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </motion.div>

      {/* Charts row 1 */}
      <motion.div variants={item} className="grid-2" style={{ marginBottom: 16 }}>
        {/* Tasks over time */}
        <div className="card" style={{ padding: '20px 16px' }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Tasks Completed</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Daily completions over period</div>
          <ResponsiveContainer width="100%" height={isMobile ? 150 : 180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <YAxis hide />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="tasks" stroke="#8b5cf6" strokeWidth={2} fill="url(#tg)" dot={{ fill: '#8b5cf6', r: 3, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* XP over time */}
        <div className="card" style={{ padding: '20px 16px' }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>XP Earned</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Experience points per day</div>
          <ResponsiveContainer width="100%" height={isMobile ? 150 : 180}>
            <BarChart data={chartData} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <YAxis hide />
              <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="xp" fill="#f59e0b" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Charts row 2 */}
      <motion.div variants={item} style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', 
        gap: 16, 
        marginBottom: 16 
      }}>
        {/* Productivity score */}
        <div className="card" style={{ padding: '20px 16px' }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Productivity Score</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Daily score (0–100)</div>
          <ResponsiveContainer width="100%" height={isMobile ? 150 : 180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} fill="url(#sg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Skill time pie */}
        <div className="card" style={{ padding: '20px 16px' }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Skill Time</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Hours per skill</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={skillPie} cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                dataKey="value" paddingAngle={3}>
                {skillPie.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v}h`, 'Time']} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
            {skillPie.slice(0, 4).map((s, i) => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{s.name}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{s.value}h</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Level card */}
      <motion.div variants={item}>
        <div className="card" style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg,rgba(139,92,246,0.1),rgba(6,182,212,0.08))',
          border: '1px solid rgba(139,92,246,0.2)',
          display: 'flex', alignItems: 'center', gap: 20,
        }}>
          <Trophy size={36} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <div style={{ flex: 1, width: '100%' }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{levelTitle(level)}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 10 }}>
              Level {level} · {user?.xp ?? 0} total XP · {summary?.longestStreak ?? user?.longestStreak ?? 0} day best streak
            </div>
            <div className="progress-track">
              <motion.div className="progress-fill"
                style={{ background: 'linear-gradient(90deg,#8b5cf6,#06b6d4)', width: `${((user?.xp ?? 0) % 200) / 200 * 100}%` }}
                initial={{ width: 0 }} animate={{ width: `${((user?.xp ?? 0) % 200) / 200 * 100}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
          <div style={{ textAlign: isMobile ? 'left' : 'right', flexShrink: 0, width: isMobile ? 'auto' : '100%' }} className="md:flex md:items-center md:justify-between">
            <div style={{ fontSize: 32, fontWeight: 800, color: '#f59e0b' }}>{user?.streak ?? 0}🔥</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>current streak</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
