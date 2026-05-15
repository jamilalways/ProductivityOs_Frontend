import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ChevronDown, ChevronRight, Check, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSkillStore } from '../../store/skillStore';
import toast from 'react-hot-toast';

const CATEGORIES = ['main', 'soft'];
const ICONS = ['💡','⚡','🔥','🎯','📚','💻','🧠','🎨','🌐','🔧','📊','🚀'];
const COLORS = ['#8b5cf6','#10b981','#06b6d4','#f59e0b','#f43f5e','#3b82f6','#ec4899'];

function TopicRow({ topic, onToggle, onDelete }) {
  return (
    <motion.div
      layout
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 12px', borderRadius: 10,
        background: topic.completed ? 'rgba(16,185,129,0.06)' : 'var(--bg-input)',
        border: `1px solid ${topic.completed ? 'rgba(16,185,129,0.2)' : 'transparent'}`,
        transition: 'all 0.2s',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          width: 20, height: 20, borderRadius: 6, border: '2px solid',
          borderColor: topic.completed ? '#10b981' : 'var(--border-strong)',
          background:  topic.completed ? '#10b981' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {topic.completed && <Check size={11} color="#fff" />}
      </div>
      <span style={{
        fontSize: 13, fontWeight: 500, flex: 1,
        textDecoration: topic.completed ? 'line-through' : 'none',
        opacity: topic.completed ? 0.55 : 1,
      }}>
        {topic.name}
      </span>
      {topic.completed && (
        <span style={{ fontSize: 10, color: '#10b981', fontWeight: 600 }}>+20 XP</span>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', padding: 4, display: 'flex',
          opacity: 0.4, transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.4}
      >
        <Trash2 size={13} />
      </button>
    </motion.div>
  );
}

function SkillCard({ skill, onDelete, onToggleTopic, dragHandleProps }) {
  const [open, setOpen] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const { updateSkill } = useSkillStore();
  const pct = skill.progressPercentage ?? 0;

  const addTopic = async () => {
    if (!newTopic.trim()) return;
    const updated = [...skill.topics, { name: newTopic }];
    await updateSkill(skill._id, { topics: updated });
    setNewTopic('');
    toast.success('Topic added!');
  };

  return (
    <motion.div className="card" style={{ overflow: 'hidden' }} layout>
      {/* Card header */}
      <div
        style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
        onClick={() => setOpen((v) => !v)}
      >
        {dragHandleProps && (
          <div {...dragHandleProps} style={{ cursor: 'grab', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }} onClick={(e) => e.stopPropagation()}>
            <GripVertical size={16} />
          </div>
        )}
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: `${skill.color}20`, border: `1px solid ${skill.color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>
          {skill.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{skill.name}</span>
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 700,
              background: skill.category === 'main' ? 'rgba(139,92,246,0.14)' : 'rgba(16,185,129,0.14)',
              color: skill.category === 'main' ? '#8b5cf6' : '#10b981',
            }}>
              {skill.category === 'main' ? 'MAIN' : 'SOFT'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="progress-track" style={{ flex: 1 }}>
              <motion.div
                className="progress-fill"
                style={{ background: skill.color, width: `${pct}%` }}
                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: skill.color, flexShrink: 0 }}>
              {pct}%
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            {skill.topics.filter((t) => t.completed).length} / {skill.topics.length} topics
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(skill._id); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
          >
            <Trash2 size={14} />
          </button>
          {open ? <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                : <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />}
        </div>
      </div>

      {/* Topics accordion */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden', borderTop: '1px solid var(--border)' }}
          >
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 7 }}>
              {skill.topics.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '10px 0' }}>
                  No topics yet. Add your first one below.
                </div>
              )}
              {skill.topics.map((topic) => (
                <TopicRow
                  key={topic._id}
                  topic={topic}
                  onToggle={() => onToggleTopic(skill._id, topic._id)}
                  onDelete={() => {
                    const { deleteTopic } = useSkillStore.getState();
                    deleteTopic(skill._id, topic._id);
                    toast.success('Topic deleted');
                  }}
                />
              ))}

              {/* Add topic */}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <input
                  className="input"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTopic()}
                  placeholder="Add topic… (Enter)"
                  style={{ flex: 1 }}
                />
                <button className="btn-primary" onClick={addTopic} style={{ padding: '9px 14px' }}>
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SkillForm({ onClose }) {
  const { createSkill } = useSkillStore();
  const [form, setForm] = useState({ name: '', category: 'main', icon: '💡', color: '#8b5cf6' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Skill name required');
    setLoading(true);
    try {
      await createSkill(form);
      toast.success('Skill created! 🎯');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create skill');
    }
    setLoading(false);
  };

  return (
    <motion.div className="card" style={{ padding: '22px', marginBottom: 20 }}
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Create New Skill</div>

      <div className="grid-2" style={{ marginBottom: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-muted)' }}>SKILL NAME *</label>
          <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Django, DSA, English Speaking" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-muted)' }}>CATEGORY</label>
          <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
            <option value="main">Main Skill</option>
            <option value="soft">Soft Skill</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-muted)' }}>ICON</label>
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
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-muted)' }}>COLOR</label>
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
          {loading ? 'Creating…' : 'Create Skill'}
        </button>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </motion.div>
  );
}



function SortableSkillCard({ skill, onDelete, onToggleTopic }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: skill._id, data: { category: skill.category } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 1,
    position: isDragging ? 'relative' : 'static',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SkillCard skill={skill} onDelete={onDelete} onToggleTopic={onToggleTopic} dragHandleProps={{...attributes, ...listeners}} />
    </div>
  );
}

function CategorySection({ id, title, items, handleDelete, handleToggleTopic }) {
  const { setNodeRef } = useDroppable({ id, data: { isContainer: true } });
  
  return (
     <div ref={setNodeRef} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, minHeight: items.length === 0 ? 80 : 0 }}>
        {title && <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', margin: '10px 0 0' }}>{title}</h3>}
        <SortableContext items={items.map(s => s._id)} strategy={verticalListSortingStrategy}>
          {items.map((skill) => (
            <SortableSkillCard key={skill._id} skill={skill} onDelete={handleDelete} onToggleTopic={handleToggleTopic} />
          ))}
          {items.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 12, color: 'var(--text-muted)' }}>
              Drop {title ? title.toLowerCase() : 'skills'} here
            </div>
          )}
        </SortableContext>
     </div>
  );
}

export default function SkillTracker() {
  const { skills, fetchSkills, deleteSkill, toggleTopic, reorderSkills } = useSkillStore();
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState('all');
  const [mainHeadline, setMainHeadline] = useState(localStorage.getItem('skills-main-headline') || 'Django . Wordpress . English');
  const [softHeadline, setSoftHeadline] = useState(localStorage.getItem('skills-soft-headline') || 'ai . merrage . gig . git-github');

  useEffect(() => {
    localStorage.setItem('skills-main-headline', mainHeadline);
    localStorage.setItem('skills-soft-headline', softHeadline);
  }, [mainHeadline, softHeadline]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => { fetchSkills(); }, []);

  const mainSkills = skills.filter((s) => s.category === 'main');
  const softSkills = skills.filter((s) => s.category === 'soft');

  const handleToggleTopic = async (skillId, topicId) => {
    await toggleTopic(skillId, topicId);
    toast.success('Topic updated! +20 XP ⚡');
  };

  const handleDelete = async (id) => {
    await deleteSkill(id);
    toast.success('Skill deleted');
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const activeIndex = skills.findIndex((sk) => sk._id === active.id);
      let overIndex = skills.findIndex((sk) => sk._id === over.id);

      let newCategory = skills[activeIndex].category;
      if (over.id === 'main-container') {
         newCategory = 'main';
         const lastMain = skills.map((s, i) => s.category === 'main' ? i : -1).filter(i => i !== -1).pop();
         overIndex = lastMain !== undefined ? lastMain + 1 : skills.length;
      } else if (over.id === 'soft-container') {
         newCategory = 'soft';
         const lastSoft = skills.map((s, i) => s.category === 'soft' ? i : -1).filter(i => i !== -1).pop();
         overIndex = lastSoft !== undefined ? lastSoft + 1 : skills.length;
      } else {
         newCategory = over.data.current?.category || newCategory;
      }

      let newSkillsArray = [...skills];
      if (newSkillsArray[activeIndex].category !== newCategory) {
        newSkillsArray[activeIndex] = { ...newSkillsArray[activeIndex], category: newCategory };
      }

      newSkillsArray = arrayMove(newSkillsArray, activeIndex, overIndex);
      reorderSkills(newSkillsArray);
    }
  };

  return (
    <div>
      {/* Top Center Structured Status Area */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <div style={{ 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '12px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          width: '100%',
          maxWidth: '500px',
          position: 'relative'
        }}>
          {/* Main Skills Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ 
              fontSize: '11px', fontWeight: 800, color: '#8b5cf6', 
              textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap'
            }}>
              Main Skill Running:
            </span>
            <input
              value={mainHeadline}
              onChange={(e) => setMainHeadline(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid transparent',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                outline: 'none',
                width: '100%',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => e.target.style.borderBottom = '1px solid var(--accent-violet)'}
              onBlur={(e) => e.target.style.borderBottom = '1px solid transparent'}
            />
          </div>

          {/* Soft Skills Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ 
              fontSize: '11px', fontWeight: 800, color: '#10b981', 
              textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap'
            }}>
              Soft Skill Running:
            </span>
            <input
              value={softHeadline}
              onChange={(e) => setSoftHeadline(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid transparent',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                outline: 'none',
                width: '100%',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => e.target.style.borderBottom = '1px solid var(--accent-emerald)'}
              onBlur={(e) => e.target.style.borderBottom = '1px solid transparent'}
            />
          </div>

          <div style={{
            position: 'absolute', top: -6, right: -6,
            width: 14, height: 14, background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, color: 'var(--text-muted)'
          }}>
            ✎
          </div>
        </div>
      </div>

      {/* Header */}
      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        gap: 16, marginBottom: 20 
      }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 22, margin: 0, letterSpacing: '-0.03em' }}>Skills</h2>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: 14 }}>
            {mainSkills.length} main · {softSkills.length} soft
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ alignSelf: 'flex-start' }}>
          <Plus size={15} /> New Skill
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: 12, padding: 4, gap: 2, width: 'fit-content', marginBottom: 20 }}>
        {[['all', 'All Skills'], ['main', 'Main Skills'], ['soft', 'Soft Skills']].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} style={{
            padding: '7px 18px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: tab === v ? 'var(--accent-violet)' : 'transparent',
            color:      tab === v ? '#fff' : 'var(--text-secondary)',
            transition: 'all 0.2s',
          }}>{l}</button>
        ))}
      </div>

      <AnimatePresence>{showForm && <SkillForm onClose={() => setShowForm(false)} />}</AnimatePresence>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {tab === 'all' ? (
          <>
            <CategorySection id="main-container" title="Main Skills" items={mainSkills} handleDelete={handleDelete} handleToggleTopic={handleToggleTopic} />
            <CategorySection id="soft-container" title="Soft Skills" items={softSkills} handleDelete={handleDelete} handleToggleTopic={handleToggleTopic} />
          </>
        ) : (
          <CategorySection 
             id={`${tab}-container`} 
             title="" 
             items={tab === 'main' ? mainSkills : softSkills} 
             handleDelete={handleDelete} 
             handleToggleTopic={handleToggleTopic}
          />
        )}
      </DndContext>

      {skills.length === 0 && !showForm && (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No skills yet</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Track your Django, DSA, English — anything.</div>
        </div>
      )}
    </div>
  );
}
