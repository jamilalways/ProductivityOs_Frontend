import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Pin, PinOff, Eye, Edit3, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useNoteStore } from '../../store/noteStore';
import { formatDate } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

const TYPES = [
  { value: 'learning',         label: '📘 Learning Log'     },
  { value: 'problem-solution', label: '🐛 Problem + Solution'},
  { value: 'general',          label: '📝 General'           },
];

const TYPE_COLORS = {
  'learning':         { bg: 'rgba(6,182,212,0.1)',  border: 'rgba(6,182,212,0.2)',  color: '#06b6d4' },
  'problem-solution': { bg: 'rgba(244,63,94,0.1)',  border: 'rgba(244,63,94,0.2)',  color: '#f43f5e' },
  'general':          { bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)', color: '#8b5cf6' },
};

function NoteCard({ note, onDelete, onPin, onSelect, selected }) {
  const meta = TYPE_COLORS[note.type] || TYPE_COLORS.general;
  return (
    <motion.div
      layout
      className="card"
      style={{
        padding: '16px 18px', cursor: 'pointer',
        border: selected ? '1px solid var(--accent-violet)' : '1px solid var(--border)',
        background: selected ? 'var(--accent-violet-muted)' : 'var(--bg-card)',
      }}
      onClick={() => onSelect(note)}
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {note.pinned && '📌 '}{note.title}
          </div>
          <div style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 600,
            display: 'inline-block', marginBottom: 6,
            background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color,
          }}>
            {TYPES.find((t) => t.value === note.type)?.label || note.type}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {note.content || note.problem || 'No content'}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
          <button onClick={(e) => { e.stopPropagation(); onPin(note._id, !note.pinned); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: note.pinned ? '#f59e0b' : 'var(--text-muted)', padding: 2 }}>
            {note.pinned ? <Pin size={13} /> : <PinOff size={13} />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(note._id); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
        {formatDate(note.date)}
        {note.tags?.length > 0 && (
          <span style={{ marginLeft: 8 }}>
            {note.tags.map((t) => (
              <span key={t} style={{ background: 'var(--bg-input)', padding: '1px 6px', borderRadius: 99, marginRight: 4 }}>#{t}</span>
            ))}
          </span>
        )}
      </div>
    </motion.div>
  );
}

function NoteDetailEditor({ note, onSave, onClose }) {
  const [form, setForm] = useState({ ...note });
  const [preview, setPreview] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    await onSave(note._id, form);
    toast.success('Note saved!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <input
          className="input"
          style={{ flex: 1, fontWeight: 700, fontSize: 16 }}
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="Note title"
        />
        <button onClick={() => setPreview((v) => !v)} className="btn-ghost" style={{ padding: '9px 14px' }}>
          {preview ? <Edit3 size={14} /> : <Eye size={14} />}
          <span style={{ marginLeft: 6, fontSize: 13 }}>{preview ? 'Edit' : 'Preview'}</span>
        </button>
        <button onClick={handleSave} className="btn-primary" style={{ padding: '9px 16px' }}>Save</button>
        <button onClick={onClose} className="btn-ghost" style={{ padding: '9px 14px' }}>✕</button>
      </div>

      {/* Type selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {TYPES.map(({ value, label }) => (
          <button key={value} onClick={() => set('type', value)} style={{
            padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid',
            borderColor: form.type === value ? 'var(--accent-violet)' : 'var(--border)',
            background:  form.type === value ? 'var(--accent-violet-muted)' : 'var(--bg-card)',
            color:       form.type === value ? 'var(--accent-violet)' : 'var(--text-muted)',
          }}>{label}</button>
        ))}
      </div>

      {/* Problem/Solution mode */}
      {form.type === 'problem-solution' ? (
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#f43f5e', marginBottom: 8 }}>🐛 PROBLEM</label>
            <textarea className="input" style={{ flex: 1, resize: 'none', lineHeight: 1.7 }}
              value={form.problem} onChange={(e) => set('problem', e.target.value)}
              placeholder="Describe the problem…" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>✅ SOLUTION</label>
            <textarea className="input" style={{ flex: 1, resize: 'none', lineHeight: 1.7 }}
              value={form.solution} onChange={(e) => set('solution', e.target.value)}
              placeholder="How did you solve it?…" />
          </div>
        </div>
      ) : preview ? (
        <div style={{
          flex: 1, padding: '16px', background: 'var(--bg-input)', borderRadius: 10,
          overflow: 'auto', lineHeight: 1.8, fontSize: 14,
        }}>
          <ReactMarkdown>{form.content || '*No content yet*'}</ReactMarkdown>
        </div>
      ) : (
        <textarea
          className="input"
          style={{ flex: 1, resize: 'none', lineHeight: 1.8, fontFamily: 'monospace', fontSize: 13 }}
          value={form.content}
          onChange={(e) => set('content', e.target.value)}
          placeholder="Write in Markdown…&#10;&#10;# Heading&#10;**bold**, _italic_, `code`&#10;&#10;- List item"
        />
      )}
    </div>
  );
}

export default function NoteEditor() {
  const { notes, fetchNotes, createNote, updateNote, deleteNote } = useNoteStore();
  const [selected, setSelected] = useState(null);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [newNote, setNewNote]   = useState({ title: '', type: 'learning', content: '', problem: '', solution: '', tags: [] });

  useEffect(() => { fetchNotes(); }, []);

  const visible = notes
    .filter((n) => filter === 'all' || n.type === filter)
    .filter((n) => !search || n.title.toLowerCase().includes(search.toLowerCase())
                           || n.content?.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async () => {
    if (!newNote.title.trim()) return toast.error('Title required');
    const created = await createNote(newNote);
    toast.success('Note created! +5 XP');
    setShowForm(false);
    setNewNote({ title: '', type: 'learning', content: '', problem: '', solution: '', tags: [] });
    setSelected(created);
  };

  const handlePin = async (id, pinned) => { await updateNote(id, { pinned }); };
  const handleDelete = async (id) => {
    await deleteNote(id);
    if (selected?._id === id) setSelected(null);
    toast.success('Note deleted');
  };
  const handleSave = async (id, patch) => {
    const updated = await updateNote(id, patch);
    setSelected(updated);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, height: 'calc(100vh - 160px)' }}>
      {/* ── Left panel — list ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" style={{ paddingLeft: 34 }} value={search}
            onChange={(e) => setSearch(e.target.value)} placeholder="Search notes…" />
        </div>

        {/* Filter + New */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <select className="input" style={{ flex: 1, fontSize: 12 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Notes</option>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <button className="btn-primary" style={{ padding: '9px 12px', flexShrink: 0 }} onClick={() => setShowForm(true)}>
            <Plus size={14} />
          </button>
        </div>

        {/* Quick create */}
        <AnimatePresence>
          {showForm && (
            <motion.div className="card" style={{ padding: '16px' }}
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <input className="input" style={{ marginBottom: 8 }} value={newNote.title}
                onChange={(e) => setNewNote((n) => ({ ...n, title: e.target.value }))} placeholder="Note title" autoFocus />
              <select className="input" style={{ marginBottom: 10 }} value={newNote.type}
                onChange={(e) => setNewNote((n) => ({ ...n, type: e.target.value }))}>
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleCreate}>Create</button>
                <button className="btn-ghost" onClick={() => setShowForm(false)}>✕</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Note list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AnimatePresence>
            {visible.map((n) => (
              <NoteCard key={n._id} note={n} selected={selected?._id === n._id}
                onSelect={setSelected} onDelete={handleDelete} onPin={handlePin} />
            ))}
          </AnimatePresence>
          {visible.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '30px 0' }}>
              {search ? 'No results found' : 'No notes yet'}
            </div>
          )}
        </div>
      </div>

      {/* ── Right panel — editor ── */}
      {selected ? (
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <NoteDetailEditor note={selected} onSave={handleSave} onClose={() => setSelected(null)} />
        </div>
      ) : (
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 48 }}>📝</div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Select a note to edit</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Or create a new one from the left panel</div>
        </div>
      )}
    </div>
  );
}
