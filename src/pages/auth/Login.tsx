import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { TerminalSquare } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)', padding: '16px', fontFamily: 'var(--font-ui)' }}>
      <div style={{ backgroundColor: 'var(--color-surface)', width: '100%', maxWidth: '400px', padding: '32px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--color-accent)', textDecoration: 'none' }}>
            <TerminalSquare size={28} />
            <span style={{ fontWeight: 700, fontSize: '20px', letterSpacing: '0.5px', fontFamily: 'var(--font-code)' }}>DEV_PILOT</span>
          </Link>
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px', fontFamily: 'var(--font-code)' }}>AUTHENTICATE_USER</h1>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-code)' }}>Log in to your workspace to continue</p>
        </div>

        <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={handleSubmit}>
          {error && <div style={{ color: 'var(--color-error)', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontFamily: 'var(--font-code)' }}>[ERROR]: {error}</div>}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-code)' }} htmlFor="email">EMAIL_ADDRESS</label>
            <input 
              style={{ width: '100%', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: 'var(--color-text-primary)', fontSize: '12px', fontFamily: 'var(--font-code)', outline: 'none', boxSizing: 'border-box' }}
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-code)' }} htmlFor="password">PASSWORD</label>
            <input 
              style={{ width: '100%', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: 'var(--color-text-primary)', fontSize: '12px', fontFamily: 'var(--font-code)', outline: 'none', boxSizing: 'border-box' }}
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-code)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" style={{ cursor: 'pointer' }} />
              <span style={{ color: 'var(--color-text-secondary)', transition: 'color 0.2s' }}>Remember me</span>
            </label>
            <Link to="/forgot-password" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Forgot password?</Link>
          </div>

          <Button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px', padding: '10px', fontSize: '12px', fontFamily: 'var(--font-code)' }}>LOG_IN</Button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center', margin: '24px 0', color: 'var(--color-text-secondary)', fontSize: '11px', fontFamily: 'var(--font-code)' }}>
          <div style={{ flex: 1, borderBottom: '1px solid var(--color-border)' }}></div>
          <span style={{ padding: '0 16px' }}>or continue with</span>
          <div style={{ flex: 1, borderBottom: '1px solid var(--color-border)' }}></div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', gap: '8px', fontSize: '12px', fontFamily: 'var(--font-code)' }} type="button">
            <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/>
            </svg> GITHUB
          </Button>
          <Button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', gap: '8px', fontSize: '12px', fontFamily: 'var(--font-code)' }} type="button">
            <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            GOOGLE
          </Button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-code)' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}>SIGN_UP</Link>
        </p>
      </div>
    </div>
  );
}
