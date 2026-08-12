import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';

export function Login() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your email and password to access DevPilot.</CardDescription>
      </CardHeader>
      <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input label="Email" type="email" placeholder="you@example.com" />
        <Input label="Password" type="password" />
        <div style={{ textAlign: 'right' }}>
          <Link to="/forgot-password" style={{ fontSize: '0.875rem', color: 'var(--color-accent)' }}>Forgot password?</Link>
        </div>
      </CardContent>
      <CardFooter>
        <Link to="/dashboard" style={{ width: '100%' }}>
          <Button variant="accent" style={{ width: '100%' }}>Sign In</Button>
        </Link>
      </CardFooter>
      <div style={{ padding: '0 1.5rem 1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>Don't have an account? </span>
        <Link to="/signup" style={{ color: 'var(--color-text-primary)' }}>Sign up</Link>
      </div>
    </Card>
  );
}
