import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login }             = useAuthStore();
  const navigate              = useNavigate();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 👋');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)',
    }}>
      <motion.div
        className="card"
        style={{ width: 420, padding: '40px' }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 54, height: 54, borderRadius: 16, margin: '0 auto 14px',
            background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
          }}>⚡</div>
          <h1 style={{ fontWeight: 800, fontSize: 22, margin: 0, letterSpacing: '-0.03em' }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '6px 0 0', fontSize: 14 }}>
            Sign in to your ProductivityOS
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {[
            { label: 'Email',    key: 'email',    type: 'email',    placeholder: 'you@example.com' },
            { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••'        },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 7, color: 'var(--text-secondary)' }}>
                {label}
              </label>
              <input
                type={type}
                className="input"
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
                required
              />
            </div>
          ))}

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            style={{
              width: '100%', padding: '12px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)',
              color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
              marginTop: 8, opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing in…' : 'Sign In →'}
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 22, fontSize: 14, color: 'var(--text-muted)' }}>
          No account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-violet)', fontWeight: 700, textDecoration: 'none' }}>
            Create one free
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
