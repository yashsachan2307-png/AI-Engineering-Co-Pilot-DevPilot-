import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';

export function Signup() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Get started with DevPilot today.</CardDescription>
      </CardHeader>
      <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input label="Name" placeholder="John Doe" />
        <Input label="Email" type="email" placeholder="you@example.com" />
        <Input label="Password" type="password" />
      </CardContent>
      <CardFooter>
        <Link to="/dashboard" style={{ width: '100%' }}>
          <Button variant="accent" style={{ width: '100%' }}>Sign Up</Button>
        </Link>
      </CardFooter>
      <div style={{ padding: '0 1.5rem 1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>Already have an account? </span>
        <Link to="/login" style={{ color: 'var(--color-text-primary)' }}>Log in</Link>
      </div>
    </Card>
  );
}
