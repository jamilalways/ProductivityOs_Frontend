import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, CheckCircle2, Clock, PauseCircle } from 'lucide-react';
import { useGoalStore } from '../../store/goalStore';
import { formatDate, daysUntil, isOverdue } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

const TYPES   = ['long-term','monthly','weekly'];
const ICONS   = ['🎯','🚀','💡','📚','💪','🏆','⚡','🌟','🔥','🎨'];
const COLORS  = ['#8b5cf6','#10b981','#06b6d4','#f59e0b','#f43f5e','#3b82f6'];
const STATUS_META = {
  active:    { icon: Clock,        color:'#06b6d4', label:'Active'    },
  completed: { icon: CheckCircle2, color:'#10b981', label:'Completed' },
  paused:    { icon: PauseCircle,  color:'#f59e0b', label:'Paused'    },
};

function GoalCard({ goal, onDelete, onUpdate }) {
  const days   = daysUntil(goal.deadline);
  const over   = isOverdue(goal.deadline) && goal.status !== 'completed';
  const { icon: StatusIcon, color: statusColor, label: statusLabel } = STATUS_META[goal.status] || STATUS_META.active;

  return (
    <motion.div
      className="card"
      style={{ padding:'20px' }}
      layout
      initial={{ opacity:0, y:12 }}
      animate={{ opacity:1, y:0 }}
      exit={{ opacity:0, scale:0.96 }}
    >
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:42, height:42, borderRadius:12, flexShrink:0,
            background:`${goal.color}20`, border:`1px solid ${goal.color}40`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:20,
          }}>
            {goal.icon}
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:15 }}>{goal.title}</div>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:3 }}>
              <span className={`badge badge-${goal.type === 'long-term' ? 'active' : goal.type === 'monthly' ? 'medium' : 'low'}`}>
                {goal.type}
              </span>
              <span style={{ display:'flex', alignItems:'center', gap:3, fontSize:11, color: statusColor }}>
                <StatusIcon size={11} />{statusLabel}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {goal.status !== 'completed' && (
            <button onClick={() => onUpdate(goal._id, { status:'completed', progress:100 })}
              style={{ width:30, height:30, borderRadius:8, border:'1px solid var(--border)',
                background:'var(--bg-input)', cursor:'pointer', display:'flex',
                alignItems:'center', justifyContent:'center', color:'#10b981' }}>
              <CheckCircle2 size={14} />
            </button>
          )}
          <button onClick={() => onDelete(goal._id)}
            style={{ width:30, height:30, borderRadius:8, border:'1px solid var(--border)',
              background:'var(--bg-input)', cursor:'pointer', display:'flex',
              alignItems:'center', justifyContent:'center', color:'var(--text-muted)' }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Description */}
      {goal.description && (
        <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:14, lineHeight:1.5 }}>
          {goal.description}
        </p>
      )}

      {/* Progress */}
      <div style={{ marginBottom:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6 }}>
          <span style={{ color:'var(--text-muted)' }}>Progress</span>
          <span style={{ fontWeight:700, color: goal.color }}>{goal.progress}%</span>
        </div>
        <div className="progress-track">
          <motion.div className="progress-fill"
            style={{ background: goal.color, width:`${goal.progress}%` }}
            initial={{ width:0 }} animate={{ width:`${goal.progress}%` }}
            transition={{ duration:0.8 }}
          />
        </div>
        {/* Progress slider */}
        <input type="range" min={0} max={100} value={goal.progress}
          onChange={(e) => onUpdate(goal._id, { progress: Number(e.target.value) })}
          style={{ width:'100%', marginTop:8, accentColor: goal.color, cursor:'pointer' }}
        />
      </div>

      {/* Deadline */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        fontSize:12, padding:'8px 12px', borderRadius:8,
        background: over ? 'rgba(244,63,94,0.08)' : 'var(--bg-input)',
        border: over ? '1px solid rgba(244,63,94,0.2)' : '1px solid transparent',
      }}>
        <span style={{ color:'var(--text-muted)' }}>Deadline: {formatDate(goal.deadline)}</span>
        <span style={{ fontWeight:600, color: over ? '#f43f5e' : days <= 3 ? '#f59e0b' : 'var(--text-secondary)' }}>
          {over ? '⚠️ Overdue' : days === 0 ? 'Due today!' : `${days}d left`}
        </span>
      </div>

      {/* Milestones */}
      {goal.milestones?.length > 0 && (
        <div style={{ marginTop:14 }}>
          <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:8, fontWeight:600 }}>
            Milestones ({goal.milestones.filter(m=>m.completed).length}/{goal.milestones.length})
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            {goal.milestones.map((m) => (
              <div key={m._id} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13 }}>
                <div style={{
                  width:16, height:16, borderRadius:4, border:'1.5px solid',
                  borderColor: m.completed ? '#10b981' : 'var(--border-strong)',
                  background:  m.completed ? '#10b981' : 'transparent',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  flexShrink:0, fontSize:10, color:'#fff',
                }}>
                  {m.completed && '✓'}
                </div>
                <span style={{ opacity: m.completed ? 0.5 : 1,
                  textDecoration: m.completed ? 'line-through' : 'none' }}>
                  {m.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function GoalForm({ onClose, onCreated }) {
  const { createGoal } = useGoalStore();
  const [form, setForm] = useState({
    title:'', description:'', type:'monthly', deadline:'',
    icon:'🎯', color:'#8b5cf6', milestones:[],
  });
  const [loading, setLoading] = useState(false);
  const [milestone, setMilestone] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]:v }));

  const addMilestone = () => {
    if (!milestone.trim()) return;
    setForm((f) => ({ ...f, milestones:[...f.milestones, { title:milestone }] }));
    setMilestone('');
  };

  const handleSubmit = async () => {
    if (!form.title || !form.deadline) return toast.error('Title and deadline required');
    setLoading(true);
    try {
      await createGoal(form);
      toast.success('Goal created! 🎯');
      onCreated();
    } catch { toast.error('Failed to create goal'); }
    setLoading(false);
  };

  return (
    <motion.div
      className="card"
      style={{ padding:'24px', marginBottom:20 }}
      initial={{ opacity:0, y:-10 }}
      animate={{ opacity:1, y:0 }}
    >
      <div style={{ fontWeight:700, fontSize:16, marginBottom:18 }}>Create New Goal</div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        <div>
          <label style={{ display:'block', fontSize:12, fontWeight:600, marginBottom:6, color:'var(--text-muted)' }}>TITLE *</label>
          <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Goal title" />
        </div>
        <div>
          <label style={{ display:'block', fontSize:12, fontWeight:600, marginBottom:6, color:'var(--text-muted)' }}>TYPE</label>
          <select className="input" value={form.type} onChange={(e) => set('type', e.target.value)}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom:14 }}>
        <label style={{ display:'block', fontSize:12, fontWeight:600, marginBottom:6, color:'var(--text-muted)' }}>DESCRIPTION</label>
        <textarea className="input" rows={2} value={form.description}
          onChange={(e) => set('description', e.target.value)} placeholder="What does achieving this look like?" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        <div>
          <label style={{ display:'block', fontSize:12, fontWeight:600, marginBottom:6, color:'var(--text-muted)' }}>DEADLINE *</label>
          <input className="input" type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} />
        </div>
        <div>
          <label style={{ display:'block', fontSize:12, fontWeight:600, marginBottom:6, color:'var(--text-muted)' }}>ICON</label>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            {ICONS.map((ic) => (
              <button key={ic} onClick={() => set('icon', ic)}
                style={{
                  width:32, height:32, borderRadius:8, fontSize:16, cursor:'pointer', border:'2px solid',
                  borderColor: form.icon === ic ? 'var(--accent-violet)' : 'var(--border)',
                  background:  form.icon === ic ? 'var(--accent-violet-muted)' : 'var(--bg-input)',
                }}>{ic}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Color */}
      <div style={{ marginBottom:14 }}>
        <label style={{ display:'block', fontSize:12, fontWeight:600, marginBottom:6, color:'var(--text-muted)' }}>COLOR</label>
        <div style={{ display:'flex', gap:8 }}>
          {COLORS.map((c) => (
            <button key={c} onClick={() => set('color', c)}
              style={{ width:28, height:28, borderRadius:'50%', background:c, cursor:'pointer',
                border:'3px solid', borderColor: form.color === c ? '#fff' : 'transparent' }} />
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div style={{ marginBottom:18 }}>
        <label style={{ display:'block', fontSize:12, fontWeight:600, marginBottom:6, color:'var(--text-muted)' }}>MILESTONES</label>
        <div style={{ display:'flex', gap:8, marginBottom:8 }}>
          <input className="input" value={milestone} onChange={(e) => setMilestone(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addMilestone()}
            placeholder="Add milestone and press Enter" style={{ flex:1 }} />
          <button className="btn-primary" onClick={addMilestone}>Add</button>
        </div>
        {form.milestones.map((m, i) => (
          <div key={i} style={{ fontSize:13, padding:'6px 10px', background:'var(--bg-input)',
            borderRadius:8, marginBottom:4, display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ color:'#10b981' }}>◆</span> {m.title}
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:10 }}>
        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating...' : 'Create Goal'}
        </button>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </motion.div>
  );
}

export default function GoalManager() {
  const { goals, fetchGoals, updateGoal, deleteGoal } = useGoalStore();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter]     = useState('all');

  useEffect(() => { fetchGoals(); }, []);

  const filtered = filter === 'all' ? goals : goals.filter((g) => g.type === filter || g.status === filter);

  const handleDelete = async (id) => {
    await deleteGoal(id);
    toast.success('Goal deleted');
  };
  const handleUpdate = async (id, patch) => {
    await updateGoal(id, patch);
    if (patch.status === 'completed') toast.success('Goal completed! +100 XP 🏆');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <h2 style={{ fontWeight:800, fontSize:22, margin:0, letterSpacing:'-0.03em' }}>Goals</h2>
          <p style={{ color:'var(--text-muted)', margin:'4px 0 0', fontSize:14 }}>
            {goals.filter(g=>g.status==='active').length} active · {goals.filter(g=>g.status==='completed').length} completed
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={15} /> New Goal
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:20, flexWrap:'wrap' }}>
        {['all','long-term','monthly','weekly','active','completed','paused'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding:'5px 14px', borderRadius:99, border:'1px solid', fontSize:12, fontWeight:600, cursor:'pointer',
              borderColor: filter===f ? 'var(--accent-violet)' : 'var(--border)',
              background:  filter===f ? 'var(--accent-violet-muted)' : 'var(--bg-card)',
              color:       filter===f ? 'var(--accent-violet)' : 'var(--text-muted)',
              textTransform:'capitalize',
            }}>
            {f}
          </button>
        ))}
      </div>

      <AnimatePresence>{showForm && <GoalForm onClose={() => setShowForm(false)} onCreated={() => setShowForm(false)} />}</AnimatePresence>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(360px,1fr))', gap:16 }}>
        <AnimatePresence>
          {filtered.map((g) => (
            <GoalCard key={g._id} goal={g} onDelete={handleDelete} onUpdate={handleUpdate} />
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && !showForm && (
        <div className="card" style={{ padding:'60px 20px', textAlign:'center' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🎯</div>
          <div style={{ fontWeight:700, fontSize:16, marginBottom:6 }}>No goals yet</div>
          <div style={{ color:'var(--text-muted)', fontSize:14 }}>Start by creating your first goal above.</div>
        </div>
      )}
    </div>
  );
}
