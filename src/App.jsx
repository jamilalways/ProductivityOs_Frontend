import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';

import AppLayout  from './components/shared/AppLayout';
import Dashboard  from './pages/Dashboard';
import Goals      from './pages/Goals';
import Tasks      from './pages/Tasks';
import Skills     from './pages/Skills';
import Consistency from './pages/Consistency';
import Notes      from './pages/Notes';
import Analytics  from './pages/Analytics';
import Settings   from './pages/Settings';
import Login      from './pages/Login';
import Register   from './pages/Register';

const Protected = ({ children }) => {
  const { user } = useAuthStore();
  return user ? <AppLayout>{children}</AppLayout> : <Navigate to="/login" replace />;
};

export default function App() {
  const { theme } = useThemeStore();
  useEffect(() => { document.documentElement.className = theme; }, [theme]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/"           element={<Protected><Dashboard /></Protected>} />
        <Route path="/goals"      element={<Protected><Goals /></Protected>} />
        <Route path="/tasks"      element={<Protected><Tasks /></Protected>} />
        <Route path="/skills"     element={<Protected><Skills /></Protected>} />
        <Route path="/consistency" element={<Protected><Consistency /></Protected>} />
        <Route path="/notes"      element={<Protected><Notes /></Protected>} />
        <Route path="/analytics"  element={<Protected><Analytics /></Protected>} />
        <Route path="/settings"   element={<Protected><Settings /></Protected>} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
