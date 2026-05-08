import { useEffect } from 'react';
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

const WEEK = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => ({
  day, tasks: Math.floor(Math.random() * 9) + 1, xp: Math.floor(Math.random() * 110) + 30,
}));

const Tip = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'8px 14px', fontSize:13 }}>
      <div style={{ fontWeight:600, marginBottom:3 }}>{label}</div>
      {payload.map((p) => <div key={p.name} style={{ color:p.color }}>{p.name}: {p.value}</div>)}
    </div>
  ) : null;

const stagger = { hidden:{ opacity:0 }, show:{ opacity:1, transition:{ staggerChildren:0.07 } } };
const item    = { hidden:{ opacity:0, y:14 }, show:{ opacity:1, y:0, transition:{ type:'spring', stiffness:260, damping:22 } } };

export default function DashboardHome() {
  const { user }                    = useAuthStore();
  const { tasks,  fetchTasks  }     = useTaskStore();
  const { goals,  fetchGoals  }     = useGoalStore();
  const { skills, fetchSkills }     = useSkillStore();

  useEffect(() => { fetchTasks({ plannerType:'daily' }); fetchGoals(); fetchSkills(); }, []);

  const todayTasks    = tasks.filter((t) => t.plannerType === 'daily');
  const doneTasks     = todayTasks.filter((t) => t.status === 'done').length;
  const activeGoals   = goals.filter((g) => g.status === 'active').length;
  const mainSkills    = skills.filter((s) => s.category === 'main');
  const xp            = user?.xp ?? 0;
  const level         = user?.level ?? calcLevel(xp);
  const pct           = levelProgress(xp);

  const STATS = [
    { label:'Day Streak',   value: user?.streak ?? 0,         icon:Flame,       color:'#f59e0b', bg:'rgba(245,158,11,0.12)'  },
    { label:'Done Today',   value:`${doneTasks}/${todayTasks.length}`, icon:CheckSquare, color:'#10b981', bg:'rgba(16,185,129,0.12)' },
    { label:'Active Goals', value: activeGoals,                icon:Target,      color:'#8b5cf6', bg:'rgba(139,92,246,0.12)'  },
    { label:'Total XP',     value: xp,                         icon:Zap,         color:'#06b6d4', bg:'rgba(6,182,212,0.12)'   },
  ];

  const SKILL_COLORS = ['#8b5cf6','#10b981','#06b6d4','#f59e0b','#f43f5e'];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">

      {/* ── Greeting ── */}
      <motion.div variants={item} style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:800, margin:0, letterSpacing:'-0.03em' }}>
          {greeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color:'var(--text-muted)', margin:'4px 0 0', fontSize:15 }}>
          Here's your productivity overview.
        </p>
      </motion.div>

      {/* ── Stat Cards ── */}
      <motion.div variants={item} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14, marginBottom:20 }}>
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

      {/* ── Charts ── */}
      <motion.div variants={item} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        <div className="card" style={{ padding:'20px 16px' }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>Weekly Tasks</div>
          <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:16 }}>Completed per day</div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={WEEK} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize:11, fill:'var(--text-muted)' }} />
              <YAxis hide />
              <Tooltip content={<Tip />} cursor={{ fill:'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="tasks" fill="#8b5cf6" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding:'20px 16px' }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>XP Trend</div>
          <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:16 }}>Experience earned</div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={WEEK}>
              <defs>
                <linearGradient id="xg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize:11, fill:'var(--text-muted)' }} />
              <YAxis hide />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="xp" stroke="#06b6d4" strokeWidth={2}
                    fill="url(#xg)" dot={{ fill:'#06b6d4', strokeWidth:0, r:3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ── Skills + Tasks ── */}
      <motion.div variants={item} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
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
              <div key={t._id} style={{
                display:'flex', alignItems:'center', gap:10, padding:'9px 12px',
                borderRadius:10, background:'var(--bg-input)',
                opacity: t.status === 'done' ? 0.5 : 1,
              }}>
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
        <div className="card" style={{
          padding:'18px 22px',
          background:'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(6,182,212,0.08))',
          border:'1px solid rgba(139,92,246,0.2)',
          display:'flex', alignItems:'center', gap:16,
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
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <div style={{ fontSize:28, fontWeight:800, color:'#f59e0b' }}>{user?.streak ?? 0}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)' }}>day streak 🔥</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
