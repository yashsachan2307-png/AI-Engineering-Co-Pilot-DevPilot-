import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { TerminalSquare, ArrowLeft, MailCheck } from 'lucide-react';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending email
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)', padding: '16px', fontFamily: 'var(--font-ui)' }}>
      <div style={{ backgroundColor: 'var(--color-surface)', width: '100%', maxWidth: '400px', padding: '32px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--color-accent)', textDecoration: 'none' }}>
            <TerminalSquare size={28} />
            <span style={{ fontWeight: 700, fontSize: '20px', letterSpacing: '0.5px', fontFamily: 'var(--font-code)' }}>DEV_PILOT</span>
          </Link>
          
          {submitted ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <div style={{ padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-md)' }}>
                  <MailCheck size={48} style={{ color: 'var(--color-success)' }} />
                </div>
              </div>
              <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px', fontFamily: 'var(--font-code)' }}>VERIFY_COMMUNICATIONS</h1>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginTop: '16px', fontFamily: 'var(--font-code)' }}>
                We sent a password reset link to <br />
                <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong>
              </p>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px', fontFamily: 'var(--font-code)' }}>RESET_CREDENTIALS</h1>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-code)' }}>Enter your email and we'll send you a link</p>
            </>
          )}
        </div>

        {!submitted ? (
          <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={handleSubmit}>
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
            
            <Button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px', padding: '10px', fontSize: '12px', fontFamily: 'var(--font-code)' }}>TRANSMIT_RESET_LINK</Button>
          </form>
        ) : (
          <Button 
            className="btn-secondary" 
            style={{ width: '100%', padding: '10px', fontSize: '12px', fontFamily: 'var(--font-code)' }}
            onClick={() => setSubmitted(false)}
          >
            RETRANSMIT_LINK
          </Button>
        )}

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--color-text-secondary)', textDecoration: 'none', fontFamily: 'var(--font-code)' }}>
            <ArrowLeft size={14} /> BACK_TO_LOGIN
          </Link>
        </div>
      </div>
    </div>
  );
}
