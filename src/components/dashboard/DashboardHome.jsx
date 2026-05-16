import { useEffect, useState } from 'react';
import { motion }    from 'framer-motion';
import { Flame, Target, CheckSquare, Zap, TrendingUp, Trophy } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useAuthStore }  from '../../store/authStore';
import { useTaskStore }  from '../../store/taskStore';
import { useGoalStore }  from '../../store/goalStore';
import { useSkillStore } from '../../store/skillStore';
import { greeting }      from '../../utils/dateUtils';
import { levelTitle, levelProgress, calcLevel } from '../../utils/xp';
import PerformanceAnalytics from '../analytics/PerformanceAnalytics';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const stagger = { hidden:{ opacity:0 }, show:{ opacity:1, transition:{ staggerChildren:0.07 } } };
const item    = { hidden:{ opacity:0, y:14 }, show:{ opacity:1, y:0, transition:{ type:'spring', stiffness:260, damping:22 } } };

const QUOTES = [
  "Consistency is key",
  "Focus on progress, not perfection",
  "Small wins lead to big victories",
  "Your only limit is you",
  "Deep work over busy work",
  "Start where you are. Use what you have",
  "Productivity is being able to do things that you were never able to do before"
];

export default function DashboardHome() {
  const { user, saveProfile }      = useAuthStore();
  const { tasks,  fetchTasks  }     = useTaskStore();
  const { goals,  fetchGoals  }     = useGoalStore();
  const { skills, fetchSkills }     = useSkillStore();
  const [analyticsSummary, setAnalyticsSummary] = useState(null);
  const [period, setPeriod] = useState('weekly');
  const [isEditingMantra, setIsEditingMantra] = useState(false);
  const [tempMantra, setTempMantra] = useState('');

  const loadSummary = async () => {
    try {
      const { data } = await api.get(`/analytics?period=weekly`);
      setAnalyticsSummary(data.summary);
    } catch (err) {}
  };

  useEffect(() => { 
    fetchTasks({ plannerType:'daily' }); 
    fetchGoals(); 
    fetchSkills(); 
    loadSummary();
  }, []);

  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const dailyQuote = QUOTES[dayOfYear % QUOTES.length];
  const currentMantra = user?.mantra || dailyQuote;

  const handleUpdateMantra = async () => {
    if (!tempMantra.trim()) {
      setIsEditingMantra(false);
      return;
    }
    try {
      await saveProfile({ mantra: tempMantra });
      toast.success('Mantra updated!');
    } catch (err) {
      toast.error('Failed to update mantra');
    }
    setIsEditingMantra(false);
  };

  const handleToggleTask = async (task) => {
    try {
      const newStatus = task.status === 'done' ? 'todo' : 'done';
      await useTaskStore.getState().updateTask(task._id, { status: newStatus });
      if (newStatus === 'done') toast.success('Task completed! +XP');
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const todayTasks    = tasks.filter((t) => t.plannerType === 'daily');
  const doneTasks     = todayTasks.filter((t) => t.status === 'done').length;
  const activeGoals   = goals.filter((g) => g.status === 'active').length;
  const mainSkills    = skills.filter((s) => s.category === 'main');
  const xp            = user?.xp ?? 0;
  const level         = user?.level ?? calcLevel(xp);
  const pct           = levelProgress(xp);

  const STATS = [
    { label:'Day Streak',   value: analyticsSummary?.currentStreak ?? user?.streak ?? 0, icon:Flame,       color:'#f59e0b', bg:'rgba(245,158,11,0.12)'  },
    { label:'Done Today',   value:`${doneTasks}/${todayTasks.length}`, icon:CheckSquare, color:'#10b981', bg:'rgba(16,185,129,0.12)' },
    { label:'Active Goals', value: activeGoals,                icon:Target,      color:'#8b5cf6', bg:'rgba(139,92,246,0.12)'  },
    { label:'Total XP',     value: xp,                         icon:Zap,         color:'#06b6d4', bg:'rgba(6,182,212,0.12)'   },
  ];

  const SKILL_COLORS = ['#8b5cf6','#10b981','#06b6d4','#f59e0b','#f43f5e'];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">

      {/* ── Header ── */}
      <motion.div variants={item} style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: 28,
        position: 'relative'
      }}>
        {/* Left: Greeting */}
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: 15 }}>
            Here's your productivity overview.
          </p>
        </div>

        {/* Center: Daily Reminder (Hidden on small screens) */}
        <div style={{ 
          position: 'absolute', 
          left: '50%', 
          transform: 'translateX(-50%)',
          textAlign: 'center',
          width: '100%',
          maxWidth: '400px',
          zIndex: 10
        }} className="hidden md:flex items-center justify-center">
          <div 
            onClick={() => {
              setTempMantra(currentMantra);
              setIsEditingMantra(true);
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              background: 'rgba(var(--accent-violet-rgb), 0.05)',
              border: '1px solid rgba(var(--accent-violet-rgb), 0.1)',
              backdropFilter: 'blur(4px)',
              cursor: 'pointer',
              pointerEvents: 'auto',
              transition: 'all 0.2s',
            }}
            className="hover-scale"
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(var(--accent-violet-rgb), 0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(var(--accent-violet-rgb), 0.05)'}
          >
            {isEditingMantra ? (
              <input
                autoFocus
                value={tempMantra}
                onChange={(e) => setTempMantra(e.target.value)}
                onBlur={handleUpdateMantra}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateMantra()}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-violet)',
                  fontSize: 13,
                  fontWeight: 600,
                  textAlign: 'center',
                  outline: 'none',
                  width: '100%',
                  fontStyle: 'italic'
                }}
              />
            ) : (
              <p style={{ 
                fontSize: 13, 
                fontWeight: 600, 
                margin: 0, 
                color: 'var(--accent-violet)',
                letterSpacing: '0.02em',
                fontStyle: 'italic'
              }}>
                "{currentMantra}"
              </p>
            )}
          </div>
        </div>

        {/* Right: Date (Hidden on mobile) */}
        <div className="hidden md:block text-right">
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <motion.div variants={item} className="grid-4" style={{ marginBottom:20, gap:14 }}>
        {STATS.map(({ label, value, icon:Icon, color, bg }) => (
          <div key={label} className="card" style={{ padding:'18px' }}>
            <div style={{ width:36, height:36, borderRadius:10, background:bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div style={{ fontSize:28, fontWeight:800, letterSpacing:'-0.03em', color }}>{value}</div>
            <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>{label}</div>
          </div>
        ))}
      </motion.div>

      {/* ── Performance Section Header ── */}
      <motion.div variants={item} style={{ 
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', 
        marginBottom: 20, gap: 16 
      }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 20, margin: 0, letterSpacing: '-0.02em' }}>Performance Analytics</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '2px 0 0' }}>Daily activities performance overview</p>
        </div>
        <div style={{ 
          display: 'flex', background: 'var(--bg-card)', borderRadius: 12, padding: 4, gap: 2,
          border: '1px solid var(--border)'
        }}>
          {[
            { v: 'weekly',    l: 'Last 7' },
            { v: 'monthly',   l: 'Last 30' },
            { v: 'quarterly', l: 'Last 90' },
            { v: 'yearly',    l: 'All Time' },
          ].map(({ v, l }) => (
            <button key={v} onClick={() => setPeriod(v)} style={{
              padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
              background: period === v ? 'var(--accent-violet)' : 'transparent',
              color:      period === v ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}>{l}</button>
          ))}
        </div>
      </motion.div>

      <PerformanceAnalytics period={period} />

      {/* ── Skills + Tasks ── */}
      <motion.div variants={item} className="grid-2" style={{ marginBottom:16 }}>
        {/* Skills */}
        <div className="card" style={{ padding:'20px' }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>Skill Progress</div>
          <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:16 }}>Main skills overview</div>
          {mainSkills.length === 0 ? (
            <div style={{ textAlign:'center', color:'var(--text-muted)', fontSize:13, padding:'20px 0' }}>
              No skills yet — add some in Skills 🎯
            </div>
          ) : mainSkills.slice(0,5).map((sk, i) => {
            const p = sk.progressPercentage ?? 0;
            return (
              <div key={sk._id} style={{ marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6 }}>
                  <span style={{ fontWeight:600 }}>{sk.icon} {sk.name}</span>
                  <span style={{ color:'var(--text-muted)' }}>{p}%</span>
                </div>
                <div className="progress-track">
                  <motion.div className="progress-fill"
                    style={{ background: SKILL_COLORS[i % SKILL_COLORS.length], width:`${p}%` }}
                    initial={{ width:0 }} animate={{ width:`${p}%` }}
                    transition={{ duration:0.8, delay: i * 0.1 }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Today tasks */}
        <div className="card" style={{ padding:'20px' }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>Today's Tasks</div>
          <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:16 }}>
            {doneTasks} / {todayTasks.length} completed
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {todayTasks.length === 0 ? (
              <div style={{ textAlign:'center', color:'var(--text-muted)', fontSize:13, padding:'20px 0' }}>
                No tasks yet — add some in Tasks ✅
              </div>
            ) : todayTasks.slice(0,6).map((t) => (
              <div 
                key={t._id} 
                onClick={() => handleToggleTask(t)}
                style={{
                  display:'flex', alignItems:'center', gap:10, padding:'9px 12px',
                  borderRadius:10, background:'var(--bg-input)',
                  opacity: t.status === 'done' ? 0.5 : 1,
                  cursor: 'pointer',
                  transition: 'transform 0.1s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{
                  width:17, height:17, borderRadius:5, border:'2px solid',
                  borderColor: t.status === 'done' ? '#10b981' : 'var(--border-strong)',
                  background:  t.status === 'done' ? '#10b981' : 'transparent',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  flexShrink:0, fontSize:10, color:'#fff',
                }}>
                  {t.status === 'done' && '✓'}
                </div>
                <span style={{ fontSize:13, fontWeight:500, flex:1,
                  textDecoration: t.status === 'done' ? 'line-through' : 'none' }}>
                  {t.title}
                </span>
                <span className={`badge badge-${t.priority}`}>{t.priority}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Level Banner ── */}
      <motion.div variants={item}>
        <div className="card flex flex-col md:flex-row items-start md:items-center gap-4" style={{
          padding:'18px 22px',
          background:'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(6,182,212,0.08))',
          border:'1px solid rgba(139,92,246,0.2)',
        }}>
          <div style={{
            width:50, height:50, borderRadius:14, flexShrink:0,
            background:'linear-gradient(135deg,#8b5cf6,#06b6d4)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <Trophy size={22} color="#fff" />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:15 }}>Level {level} — {levelTitle(level)}</div>
            <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:8 }}>
              {xp % 200} / 200 XP to next level
            </div>
            <div className="progress-track">
              <motion.div className="progress-fill"
                style={{ background:'linear-gradient(90deg,#8b5cf6,#06b6d4)', width:`${pct}%` }}
                initial={{ width:0 }} animate={{ width:`${pct}%` }}
                transition={{ duration:1 }}
              />
            </div>
          </div>
          <div className="text-left md:text-right w-full md:w-auto" style={{ flexShrink:0 }}>
            <div style={{ fontSize:28, fontWeight:800, color:'#f59e0b' }}>{analyticsSummary?.currentStreak ?? user?.streak ?? 0}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)' }}>day streak 🔥</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
