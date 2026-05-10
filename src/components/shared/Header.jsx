import { useState } from 'react';
import { Bell, Sun, Moon, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore }       from '../../store/themeStore';
import { useNotifications }    from '../../hooks/useNotifications';

export default function Header({ onMenuClick }) {
  const { theme, toggle }           = useThemeStore();
  const { notifications, count }    = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 10, marginBottom: 28, paddingBottom: 20,
      borderBottom: '1px solid var(--border)',
    }}>
      {/* Mobile Menu & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onMenuClick}
          className="md:hidden"
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)',
          }}
        >
          <Menu size={18} />
        </button>
        <div className="md:hidden" style={{ fontWeight: 800, fontSize: 16 }}>ProductivityOS</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* Theme toggle */}
      <button
        onClick={toggle}
        style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-secondary)',
        }}
      >
        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      {/* Notifications */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowNotifs((v) => !v)}
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)', position: 'relative',
          }}
        >
          <Bell size={15} />
          {count > 0 && (
            <span style={{
              position: 'absolute', top: 6, right: 6, width: 8, height: 8,
              borderRadius: '50%', background: '#f43f5e',
              border: '1.5px solid var(--bg-primary)',
            }} />
          )}
        </button>

        <AnimatePresence>
          {showNotifs && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute', top: 44, right: 0, width: 300,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '14px', zIndex: 50,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
                Notifications {count > 0 && <span style={{ color: '#f43f5e' }}>({count})</span>}
              </div>
              {notifications.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>
                  All caught up! ✅
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {notifications.map((n) => (
                    <div key={n.id} style={{
                      padding: '10px 12px', borderRadius: 10,
                      background: n.priority === 'high'
                        ? 'rgba(244,63,94,0.1)' : 'rgba(245,158,11,0.1)',
                      border: `1px solid ${n.priority === 'high' ? 'rgba(244,63,94,0.2)' : 'rgba(245,158,11,0.2)'}`,
                      fontSize: 13,
                    }}>
                      {n.message}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </header>
  );
}
