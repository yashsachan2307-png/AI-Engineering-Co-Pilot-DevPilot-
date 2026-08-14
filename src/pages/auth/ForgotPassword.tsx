import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Terminal, ArrowLeft, MailCheck } from 'lucide-react';
import '../../styles/landing.css';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending email
    setSubmitted(true);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'inherit' }}>
            <Terminal size={24} style={{ color: 'var(--color-accent)' }} />
            <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>DevPilot</span>
          </Link>
          
          {submitted ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%' }}>
                  <MailCheck size={48} style={{ color: 'var(--color-success)' }} />
                </div>
              </div>
              <h1 className="auth-title">Check your email</h1>
              <p className="auth-subtitle" style={{ lineHeight: 1.5, marginTop: '1rem' }}>
                We sent a password reset link to <br />
                <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong>
              </p>
            </>
          ) : (
            <>
              <h1 className="auth-title">Reset password</h1>
              <p className="auth-subtitle">Enter your email and we'll send you a link</p>
            </>
          )}
        </div>

        {!submitted ? (
          <form className="auth-form" onSubmit={handleSubmit}>
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
            
            <Button type="submit" variant="primary" className="w-full" style={{ marginTop: '0.5rem' }}>Send Reset Link</Button>
          </form>
        ) : (
          <Button 
            variant="secondary" 
            className="w-full" 
            onClick={() => setSubmitted(false)}
          >
            Didn't receive the email? Try again
          </Button>
        )}

        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }} className="auth-link hover-none">
            <ArrowLeft size={16} /> Back to log in
          </Link>
        </div>
      </div>
    </div>
  );
}
