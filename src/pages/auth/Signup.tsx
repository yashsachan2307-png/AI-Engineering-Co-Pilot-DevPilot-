import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { TerminalSquare } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function Signup() {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const [strength, setStrength] = useState(0); // 0-3
  
  // Calculate password strength visually
  useEffect(() => {
    let score = 0;
    if (password.length > 5) score += 1;
    if (password.length > 10) score += 1;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score += 1;
    setStrength(score);
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    try {
      await signup(name, email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
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
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px', fontFamily: 'var(--font-code)' }}>INITIALIZE_ACCOUNT</h1>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-code)' }}>Start building better software today</p>
        </div>

        <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={handleSubmit}>
          {error && <div style={{ color: 'var(--color-error)', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontFamily: 'var(--font-code)' }}>[ERROR]: {error}</div>}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-code)' }} htmlFor="name">FULL_NAME</label>
            <input 
              style={{ width: '100%', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: 'var(--color-text-primary)', fontSize: '12px', fontFamily: 'var(--font-code)', outline: 'none' }}
              id="name" 
              type="text" 
              placeholder="Jane Doe" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-code)' }} htmlFor="email">EMAIL_ADDRESS</label>
            <input 
              style={{ width: '100%', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: 'var(--color-text-primary)', fontSize: '12px', fontFamily: 'var(--font-code)', outline: 'none' }}
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
              style={{ width: '100%', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: 'var(--color-text-primary)', fontSize: '12px', fontFamily: 'var(--font-code)', outline: 'none' }}
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            {password && (
              <div style={{ marginTop: '4px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                  <div style={{ height: '4px', flex: 1, borderRadius: '2px', backgroundColor: strength >= 1 ? 'var(--color-error)' : 'var(--color-border)', transition: 'background-color 0.2s' }}></div>
                  <div style={{ height: '4px', flex: 1, borderRadius: '2px', backgroundColor: strength >= 2 ? 'var(--color-warning)' : 'var(--color-border)', transition: 'background-color 0.2s' }}></div>
                  <div style={{ height: '4px', flex: 1, borderRadius: '2px', backgroundColor: strength >= 3 ? 'var(--color-success)' : 'var(--color-border)', transition: 'background-color 0.2s' }}></div>
                </div>
                <div style={{ fontSize: '10px', textAlign: 'right', fontWeight: 600, fontFamily: 'var(--font-code)' }}>
                  {strength === 1 && <span style={{ color: 'var(--color-error)' }}>WEAK</span>}
                  {strength === 2 && <span style={{ color: 'var(--color-warning)' }}>MEDIUM</span>}
                  {strength === 3 && <span style={{ color: 'var(--color-success)' }}>STRONG</span>}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-code)' }} htmlFor="confirm">CONFIRM_PASSWORD</label>
            <input 
              style={{ width: '100%', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: 'var(--color-text-primary)', fontSize: '12px', fontFamily: 'var(--font-code)', outline: 'none', boxSizing: 'border-box' }}
              id="confirm" 
              type="password" 
              placeholder="••••••••" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
          </div>

          <div style={{ marginTop: '8px', fontSize: '11px', fontFamily: 'var(--font-code)' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" style={{ marginTop: '2px', cursor: 'pointer' }} required />
              <span style={{ color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                I agree to the <a href="#" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Privacy Policy</a>.
              </span>
            </label>
          </div>

          <Button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px', padding: '10px', fontSize: '12px', fontFamily: 'var(--font-code)' }}>CREATE_ACCOUNT</Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-code)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}>LOGIN</Link>
        </p>
      </div>
    </div>
  );
}
