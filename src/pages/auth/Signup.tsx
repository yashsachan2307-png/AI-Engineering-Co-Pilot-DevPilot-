import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Terminal } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg">
      <div className="panel bg-surface w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 text-primary hover:text-accent transition-colors">
            <Terminal size={28} className="text-accent" />
            <span className="font-bold text-xl tracking-tight">DevPilot</span>
          </Link>
          <h1 className="text-2xl font-bold text-primary mb-2">Create an account</h1>
          <p className="text-sm text-secondary">Start building better software today</p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {error && <div className="text-error bg-error/10 border border-error/20 p-3 rounded-md text-sm">{error}</div>}
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-primary" htmlFor="name">Full Name</label>
            <input 
              className="input w-full"
              id="name" 
              type="text" 
              placeholder="Jane Doe" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-primary" htmlFor="email">Email</label>
            <input 
              className="input w-full"
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-primary" htmlFor="password">Password</label>
            <input 
              className="input w-full"
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            {password && (
              <div className="mt-1">
                <div className="flex gap-1 mb-1">
                  <div className={`h-1 flex-1 rounded-sm transition-colors ${strength >= 1 ? 'bg-error' : 'bg-border'}`}></div>
                  <div className={`h-1 flex-1 rounded-sm transition-colors ${strength >= 2 ? 'bg-warning' : 'bg-border'}`}></div>
                  <div className={`h-1 flex-1 rounded-sm transition-colors ${strength >= 3 ? 'bg-success' : 'bg-border'}`}></div>
                </div>
                <div className="text-[10px] text-right font-medium">
                  {strength === 1 && <span className="text-error">Weak</span>}
                  {strength === 2 && <span className="text-warning">Medium</span>}
                  {strength === 3 && <span className="text-success">Strong</span>}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-primary" htmlFor="confirm">Confirm Password</label>
            <input 
              className="input w-full"
              id="confirm" 
              type="password" 
              placeholder="••••••••" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
          </div>

          <div className="mt-2 text-sm">
            <label className="flex items-start gap-2 cursor-pointer group">
              <input type="checkbox" className="mt-1 rounded border-border bg-[#0f172a] text-accent focus:ring-accent focus:ring-offset-bg cursor-pointer" required />
              <span className="text-secondary leading-relaxed group-hover:text-primary transition-colors">
                I agree to the <a href="#" className="text-accent hover:underline">Terms of Service</a> and <a href="#" className="text-accent hover:underline">Privacy Policy</a>.
              </span>
            </label>
          </div>

          <Button type="submit" className="btn-primary w-full mt-2">Create Account</Button>
        </form>

        <p className="text-center mt-8 text-sm text-secondary">
          Already have an account? <Link to="/login" className="text-accent font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
