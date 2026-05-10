import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const { register }          = useAuthStore();
  const navigate              = useNavigate();

  const set = (k, v) => {
    setError('');
    setForm((f) => ({ ...f, [k]: v }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    if (form.name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome 🎉');
      navigate('/');
    } catch (err) {
      console.error('Register error:', err);
      const msg =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK' ? 'Cannot connect to server. Is the backend running?' : null) ||
        (err.code === 'ECONNABORTED' ? 'Request timed out. Try again.' : null) ||
        'Registration failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}
    >
      <motion.div
        className="card"
        style={{ width: '100%', maxWidth: 420, padding: '40px' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 54, height: 54, borderRadius: 16,
              margin: '0 auto 14px',
              background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 26,
            }}
          >
            ⚡
          </div>
          <h1 style={{ fontWeight: 800, fontSize: 22, margin: 0, letterSpacing: '-0.03em' }}>
            Create your account
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '6px 0 0', fontSize: 14 }}>
            Start your productivity journey
          </p>
        </div>

        {/* Error box */}
        {error && (
          <div
            style={{
              background: 'rgba(244,63,94,0.1)',
              border: '1px solid rgba(244,63,94,0.3)',
              borderRadius: 10, padding: '10px 14px',
              marginBottom: 16, fontSize: 13,
              color: '#f43f5e', lineHeight: 1.5,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {[
            { label: 'Full Name', key: 'name',     type: 'text',     placeholder: 'Jamil Ahmed'       },
            { label: 'Email',     key: 'email',    type: 'email',    placeholder: 'you@example.com'   },
            { label: 'Password',  key: 'password', type: 'password', placeholder: 'Min 6 characters'  },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: 'block', fontSize: 13,
                  fontWeight: 600, marginBottom: 7,
                  color: 'var(--text-secondary)',
                }}
              >
                {label}
              </label>
              <input
                type={type}
                className="input"
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
                required
                autoComplete={
                  key === 'name' ? 'name'
                  : key === 'email' ? 'email'
                  : 'new-password'
                }
              />
            </div>
          ))}

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            style={{
              width: '100%', padding: '12px',
              borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)',
              color: '#fff', fontWeight: 700, fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 8, opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Creating account…' : 'Get Started →'}
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 22, fontSize: 14, color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ color: 'var(--accent-violet)', fontWeight: 700, textDecoration: 'none' }}
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
