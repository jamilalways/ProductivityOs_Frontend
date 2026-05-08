import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Flame, Check, Trash2 } from 'lucide-react';
import { useHabitStore } from '../../store/habitStore';
import { useAuthStore } from '../../store/authStore';
import { format, startOfWeek, addDays, subDays, isToday } from 'date-fns';
import toast from 'react-hot-toast';

const ICONS   = ['💪','📚','🧘','🏃','💧','🎯','✍️','🌅','🧠','🎵','🥗','😴'];
const COLORS  = ['#10b981','#8b5cf6','#06b6d4','#f59e0b','#f43f5e','#3b82f6','#ec4899'];
const DAY_LABELS = ['S','M','T','W','T','F','S'];

function dateStr(d) {
  if (!d) return '';
  try {
    return format(typeof d === 'string' ? new Date(d) : d, 'yyyy-MM-dd');
  } catch (e) { return ''; }
}

function StreakCalendar({ completedDates = [], color }) {
  const today     = new Date();
  const startDate = subDays(today, 11 * 7); // 12 weeks back
  const weeks     = [];
  let cur = startOfWeek(startDate);
  let safety = 0;
  while (cur <= today && safety < 50) {
    safety++;
    const week = [];
    for (let d = 0; d < 7; d++) {
      const day = addDays(cur, d);
      if (day > today) { week.push(null); continue; }
      week.push({
        date:      day,
        done:      (completedDates || []).some((cd) => cd && dateStr(cd) === dateStr(day)),
        isToday:   isToday(day),
      });
    }
    weeks.push(week);
    cur = addDays(cur, 7);
  }

  return (
    <div>
      {/* Day labels */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
        <div style={{ width: 20 }} /> {/* spacer for week column */}
        {DAY_LABELS.map((l, i) => (
          <div key={i} style={{ width: 14, textAlign: 'center', fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>{l}</div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 2 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {week.map((day, di) => (
              <div
                key={di}
                title={day && day.date instanceof Date && !isNaN(day.date) ? format(day.date, 'MMM d, yyyy') : ''}
                className={`h-cell${day?.done ? ' done' : ''}`}
                style={{
                  background: !day ? 'transparent'
                    : day.done ? color
                    : day.isToday ? 'var(--border-strong)' : undefined,
                  outline: day?.isToday ? `2px solid ${color}` : 'none',
                  outlineOffset: 1,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, fontSize: 10, color: 'var(--text-muted)' }}>
        <span>Less</span>
        {[0.15, 0.4, 0.65, 0.85, 1].map((o, i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: color, opacity: o }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

function HabitCard({ habit, onCheckIn, onDelete }) {
  const today    = dateStr(new Date());
  const doneToday = habit.completedDates?.some((d) => dateStr(d) === today);

  return (
    <motion.div className="card" style={{ padding: '20px' }}
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: `${habit.color}20`, border: `1px solid ${habit.color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          }}>
            {habit.icon}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{habit.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, fontSize: 12, color: 'var(--text-muted)' }}>
              <Flame size={12} style={{ color: '#f59e0b' }} />
              <span style={{ fontWeight: 600, color: '#f59e0b' }}>{habit.streak}</span> day streak
              {habit.longestStreak > 0 && (
                <span>· best: <strong>{habit.longestStreak}</strong></span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => !doneToday && onCheckIn(habit._id)}
            style={{
              padding: '8px 16px', borderRadius: 10, border: 'none', cursor: doneToday ? 'default' : 'pointer',
              background: doneToday ? habit.color : 'var(--bg-input)',
              color:      doneToday ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.2s',
            }}
          >
            {doneToday && <Check size={13} />}
            {doneToday ? 'Done!' : 'Check In'}
          </motion.button>
          <button onClick={() => onDelete(habit._id)} style={{
            width: 36, height: 36, borderRadius: 10, background: 'var(--bg-input)',
            border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <StreakCalendar completedDates={habit?.completedDates || []} color={habit?.color || '#10b981'} />
    </motion.div>
  );
}

function HabitForm({ onClose }) {
  const { createHabit } = useHabitStore();
  const [form, setForm] = useState({ name: '', icon: '💪', color: '#10b981' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Habit name required');
    setLoading(true);
    try {
      await createHabit(form);
      toast.success('Habit created! 🔥');
      onClose();
    } catch { toast.error('Failed'); }
    setLoading(false);
  };

  return (
    <motion.div className="card" style={{ padding: '22px', marginBottom: 20 }}
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Create New Habit</div>
      <input className="input" style={{ marginBottom: 14 }} value={form.name}
        onChange={(e) => set('name', e.target.value)} placeholder="Habit name (e.g. Daily Reading)" />

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 7, color: 'var(--text-muted)' }}>ICON</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {ICONS.map((ic) => (
            <button key={ic} onClick={() => set('icon', ic)} style={{
              width: 36, height: 36, borderRadius: 8, fontSize: 18, cursor: 'pointer', border: '2px solid',
              borderColor: form.icon === ic ? 'var(--accent-violet)' : 'var(--border)',
              background:  form.icon === ic ? 'var(--accent-violet-muted)' : 'var(--bg-input)',
            }}>{ic}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 7, color: 'var(--text-muted)' }}>COLOR</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {COLORS.map((c) => (
            <button key={c} onClick={() => set('color', c)} style={{
              width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
              border: '3px solid', borderColor: form.color === c ? '#fff' : 'transparent',
            }} />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating…' : 'Create Habit'}
        </button>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </motion.div>
  );
}

export default function ConsistencyTracker() {
  const { habits, fetchHabits, checkIn, deleteHabit } = useHabitStore();
  const { refreshUser } = useAuthStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchHabits(); }, []);

  const today     = dateStr(new Date());
  const doneCount = (habits || []).filter((h) => {
    try {
      return (h.completedDates || []).some((d) => dateStr(d) === today);
    } catch (e) { return false; }
  }).length;

  const handleCheckIn = async (id) => {
    try {
      await checkIn(id);
      await refreshUser(); // Update XP in sidebar
      toast.success('✅ Habit checked in! +10 XP 🔥');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    }
  };
  const handleDelete = async (id) => { await deleteHabit(id); toast.success('Habit deleted'); };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 22, margin: 0, letterSpacing: '-0.03em' }}>Consistency</h2>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: 14 }}>
            {doneCount} / {habits.length} habits done today
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={15} /> New Habit
        </button>
      </div>

      <AnimatePresence>{showForm && <HabitForm onClose={() => setShowForm(false)} />}</AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <AnimatePresence>
          {habits.map((h) => (
            <HabitCard key={h._id} habit={h} onCheckIn={handleCheckIn} onDelete={handleDelete} />
          ))}
        </AnimatePresence>
      </div>

      {habits.length === 0 && !showForm && (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔥</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No habits yet</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Start building consistency. One habit at a time.
          </div>
        </div>
      )}
    </div>
  );
}
