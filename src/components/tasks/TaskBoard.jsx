import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors, useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Trash2, Check, Clock, AlertCircle, Loader } from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import toast from 'react-hot-toast';

const COLS = [
  { id:'todo',        label:'To Do',       color:'#71717a', icon:Clock        },
  { id:'in-progress', label:'In Progress', color:'#f59e0b', icon:AlertCircle  },
  { id:'done',        label:'Done',        color:'#10b981', icon:Check        },
];

function DroppableColumn({ id, children, ...props }) {
  const { setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef} {...props}>{children}</div>;
}

/* ── Single task card ───────────────────────────────────────── */
function TaskCard({ task, onDelete, onToggle, dragHandle = {} }) {
  return (
    <motion.div
      className="card"
      style={{ padding:'12px 14px', marginBottom:8 }}
      layout whileHover={{ y:-1 }}
    >
      <div style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
        {/* drag handle */}
        <div {...dragHandle} style={{ color:'var(--text-muted)', cursor:'grab', marginTop:2, flexShrink:0 }}>
          <GripVertical size={13} />
        </div>

        {/* checkbox */}
        <button onClick={() => onToggle(task._id, task.status)}
          style={{
            width:17, height:17, borderRadius:5, border:'2px solid', cursor:'pointer',
            borderColor: task.status==='done' ? '#10b981' : 'var(--border-strong)',
            background:  task.status==='done' ? '#10b981' : 'transparent',
            display:'flex', alignItems:'center', justifyContent:'center',
            flexShrink:0, marginTop:2,
          }}>
          {task.status==='done' && <Check size={9} color="#fff" />}
        </button>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{
            fontSize:13, fontWeight:500, lineHeight:1.4,
            textDecoration: task.status==='done' ? 'line-through' : 'none',
            opacity:        task.status==='done' ? 0.5 : 1,
          }}>{task.title}</div>

          {task.description && (
            <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:3, lineHeight:1.4 }}>
              {task.description.slice(0,70)}{task.description.length>70 ? '…' : ''}
            </div>
          )}

          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:7 }}>
            <span className={`badge badge-${task.priority}`}>{task.priority}</span>
            {task.dueDate && (
              <span style={{ fontSize:10, color:'var(--text-muted)' }}>
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
            {task.carriedOver && (
              <span style={{ fontSize:10, background:'rgba(245,158,11,0.12)', color:'#f59e0b',
                padding:'1px 6px', borderRadius:99 }}>carried over</span>
            )}
          </div>
        </div>

        <button onClick={() => onDelete(task._id)}
          style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:2 }}>
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  );
}

function SortableTask({ task, onDelete, onToggle }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}>
      <TaskCard task={task} onDelete={onDelete} onToggle={onToggle} dragHandle={{ ...attributes, ...listeners }} />
    </div>
  );
}

/* ── Add task inline input ──────────────────────────────────── */
function AddTaskInput({ columnId, onAdd, onCancel }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  return (
    <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
      exit={{ opacity:0, height:0 }} style={{ marginBottom:8, overflow:'hidden' }}>
      <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => { if (e.key==='Enter') onAdd(title, priority, columnId); if (e.key==='Escape') onCancel(); }}
        placeholder="Task title… (Enter to save)" className="input" style={{ marginBottom:6 }} />
      <div style={{ display:'flex', gap:6 }}>
        {['high','medium','low'].map((p) => (
          <button key={p} onClick={() => setPriority(p)}
            style={{
              padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:600, cursor:'pointer', border:'1px solid',
              borderColor: priority===p ? 'transparent' : 'var(--border)',
              background:  priority===p
                ? p==='high' ? '#f43f5e' : p==='medium' ? '#f59e0b' : '#10b981'
                : 'var(--bg-input)',
              color: priority===p ? '#fff' : 'var(--text-muted)',
            }}>{p}</button>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Main board ─────────────────────────────────────────────── */
export default function TaskBoard({ plannerType = 'daily' }) {
  const { tasks, fetchTasks, createTask, updateTask, deleteTask } = useTaskStore();
  const [addingTo, setAddingTo] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => { fetchTasks({ plannerType }); }, [plannerType]);

  const col = (status) => tasks.filter((t) => t.plannerType === plannerType && t.status === status);

  const handleAdd = async (title, priority, status) => {
    if (!title.trim()) return;
    await createTask({ title, priority, status, plannerType, dueDate: new Date().toISOString() });
    setAddingTo(null);
    toast.success('Task created! +10 XP ⚡');
  };

  const handleToggle = async (id, currentStatus) => {
    const next = currentStatus === 'done' ? 'todo' : 'done';
    await updateTask(id, { status: next });
    if (next === 'done') toast.success('Task done! 🎉');
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    toast.success('Task deleted');
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveId(null);
    if (!over) return;

    const activeTask = tasks.find((t) => t._id === active.id);
    if (!activeTask) return;

    // Determine target status
    let targetStatus = over.id;
    const overTask = tasks.find((t) => t._id === over.id);
    if (overTask) {
      targetStatus = overTask.status;
    }

    // Only update if status changed
    if (targetStatus !== activeTask.status && COLS.some(c => c.id === targetStatus)) {
      await updateTask(active.id, { status: targetStatus });
      toast.success(`Moved to ${targetStatus}`);
    }
  };

  const activeTask = activeId ? tasks.find((t) => t._id === activeId) : null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragEnd={handleDragEnd}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
        {COLS.map(({ id, label, color, icon: Icon }) => {
          const colTasks = col(id);
          return (
            <DroppableColumn key={id} id={id} style={{
              background:'var(--bg-card)', border:'1px solid var(--border)',
              borderRadius:16, padding:'14px 12px', minHeight:440,
            }}>
              {/* Column header */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <Icon size={14} style={{ color }} />
                  <span style={{ fontWeight:700, fontSize:14 }}>{label}</span>
                  <span style={{ background:'var(--bg-input)', color:'var(--text-muted)',
                    fontSize:11, padding:'1px 8px', borderRadius:99, fontWeight:600 }}>
                    {colTasks.length}
                  </span>
                </div>
                <button onClick={() => setAddingTo(id)}
                  style={{ width:26, height:26, borderRadius:7, background:'var(--bg-input)',
                    border:'1px solid var(--border)', cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-secondary)' }}>
                  <Plus size={13} />
                </button>
              </div>

              {/* Add input */}
              <AnimatePresence>
                {addingTo === id && (
                  <AddTaskInput columnId={id} onAdd={handleAdd} onCancel={() => setAddingTo(null)} />
                )}
              </AnimatePresence>

              {/* Tasks */}
              <SortableContext items={colTasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
                {colTasks.map((task) => (
                  <SortableTask key={task._id} task={task} onDelete={handleDelete} onToggle={handleToggle} />
                ))}
              </SortableContext>

              {colTasks.length === 0 && addingTo !== id && (
                <div style={{
                  textAlign:'center', color:'var(--text-muted)', fontSize:12, padding:'28px 0',
                  border:'1.5px dashed var(--border)', borderRadius:10, marginTop:4,
                }}>
                  Drop tasks here
                </div>
              )}
            </DroppableColumn>
          );
        })}
      </div>
      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} onDelete={() => {}} onToggle={() => {}} />}
      </DragOverlay>
    </DndContext>
  );
}
