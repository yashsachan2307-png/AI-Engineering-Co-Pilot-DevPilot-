import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Terminal } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/landing.css';

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
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'inherit' }}>
            <Terminal size={24} style={{ color: 'var(--color-accent)' }} />
            <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>DevPilot</span>
          </Link>
          <h1 className="auth-title">Create an account</h1>
          <p className="auth-subtitle">Start building better software today</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
          <div className="auth-form-group">
            <label className="auth-form-label" htmlFor="name">Full Name</label>
            <Input 
              id="name" 
              type="text" 
              placeholder="Jane Doe" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-form-label" htmlFor="email">Email</label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="auth-form-group">
            <label className="auth-form-label" htmlFor="password">Password</label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            {password && (
              <div style={{ marginTop: '0.25rem' }}>
                <div className="password-strength">
                  <div className="strength-bar" style={{ backgroundColor: strength >= 1 ? '#ef4444' : 'var(--color-border)' }}></div>
                  <div className="strength-bar" style={{ backgroundColor: strength >= 2 ? '#f59e0b' : 'var(--color-border)' }}></div>
                  <div className="strength-bar" style={{ backgroundColor: strength >= 3 ? '#10b981' : 'var(--color-border)' }}></div>
                </div>
                <div className="strength-text">
                  {strength === 1 && <span style={{ color: '#ef4444' }}>Weak</span>}
                  {strength === 2 && <span style={{ color: '#f59e0b' }}>Medium</span>}
                  {strength === 3 && <span style={{ color: '#10b981' }}>Strong</span>}
                </div>
              </div>
            )}
          </div>

          <div className="auth-form-group">
            <label className="auth-form-label" htmlFor="confirm">Confirm Password</label>
            <Input 
              id="confirm" 
              type="password" 
              placeholder="••••••••" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
          </div>

          <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: 'var(--color-accent)', marginTop: '0.25rem' }} required />
              <span style={{ color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                I agree to the <a href="#" className="auth-link">Terms of Service</a> and <a href="#" className="auth-link">Privacy Policy</a>.
              </span>
            </label>
          </div>

          <Button type="submit" variant="primary" className="w-full" style={{ marginTop: '0.5rem' }}>Create Account</Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Already have an account? <Link to="/login" className="auth-link" style={{ fontWeight: 500 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
