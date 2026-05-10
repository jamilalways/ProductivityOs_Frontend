import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Target, CheckSquare, Zap,
  Calendar, BookOpen, BarChart3, Settings, LogOut, Flame, Star, X
} from 'lucide-react';
import { useAuthStore }  from '../../store/authStore';
import { levelProgress, levelTitle, calcLevel } from '../../utils/xp';

const NAV = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/goals',       icon: Target,          label: 'Goals'     },
  { to: '/tasks',       icon: CheckSquare,     label: 'Tasks'     },
  { to: '/skills',      icon: Zap,             label: 'Skills'    },
  { to: '/consistency', icon: Calendar,        label: 'Consistency'},
  { to: '/notes',       icon: BookOpen,        label: 'Journal'   },
  { to: '/analytics',   icon: BarChart3,       label: 'Analytics' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const xp    = user?.xp    ?? 0;
  const level = user?.level ?? calcLevel(xp);
  const pct   = levelProgress(xp);

  return (
    <motion.aside
      className={`sidebar ${isOpen ? 'open' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Close Button (Mobile only) ── */}
      <button 
        onClick={onClose}
        style={{
          position: 'absolute', top: 12, right: 12,
          background: 'none', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '10px', zIndex: 50, pointerEvents: 'auto'
        }}
        className="md:hidden"
      >
        <X size={20} />
      </button>

      {/* ── Logo ── */}
      {/* ── Logo ── */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>⚡</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.02em' }}>ProductivityOS</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Personal System</div>
          </div>
        </div>
      </div>

      {/* ── User card ── */}
      {user && (
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,#8b5cf6,#f43f5e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 15,
            }}>
              {user.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Star size={9} style={{ color: '#f59e0b' }} /> {levelTitle(level)}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>
              <Flame size={13} />{user.streak ?? 0}
            </div>
          </div>
          {/* XP bar */}
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>
            {xp % 200} / 200 XP — Lv.{level}
          </div>
          <div className="progress-track">
            <motion.div
              className="progress-fill"
              style={{ background: 'linear-gradient(90deg,#8b5cf6,#06b6d4)', width: `${pct}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, delay: 0.4 }}
            />
          </div>
        </div>
      )}

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── Bottom ── */}
      <div style={{ padding: '10px 10px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <NavLink to="/settings" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <Settings size={16} /><span>Settings</span>
        </NavLink>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="nav-link"
          style={{ color: 'var(--accent-rose)' }}
        >
          <LogOut size={16} /><span>Logout</span>
        </button>
      </div>
    </motion.aside>
  );
}
