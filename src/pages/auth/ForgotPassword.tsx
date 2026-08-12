import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';

export function ForgotPassword() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>Enter your email and we'll send you a link to reset your password.</CardDescription>
      </CardHeader>
      <CardContent>
        <Input label="Email" type="email" placeholder="you@example.com" />
      </CardContent>
      <CardFooter>
        <Button variant="accent" style={{ width: '100%' }}>Send Reset Link</Button>
      </CardFooter>
      <div style={{ padding: '0 1.5rem 1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
        <Link to="/login" style={{ color: 'var(--color-text-primary)' }}>Back to login</Link>
      </div>
    </Card>
  );
}
