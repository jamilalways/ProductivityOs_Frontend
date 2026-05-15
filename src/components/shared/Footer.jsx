import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      textAlign: 'center',
      padding: '24px',
      fontSize: '13px',
      color: 'var(--text-muted)',
      width: '100%',
    }}>
      © 2026 • Designed & Developed by{' '}
      <a 
        href="https://www.linkedin.com/in/jamilalways" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          color: 'var(--accent-violet)',
          textDecoration: 'none',
          fontWeight: 600,
          transition: 'color 0.2s',
        }}
        onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'}
        onMouseOut={(e) => e.target.style.color = 'var(--accent-violet)'}
      >
        Jamil Ahmed
      </a>
    </footer>
  );
}
