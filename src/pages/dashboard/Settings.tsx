import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function Settings() {
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Settings</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your account settings and preferences.</CardDescription>
          </CardHeader>
          <CardContent>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>Profile settings will go here.</p>
            <Button variant="secondary">Edit Profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>Connect DevPilot with your external tools.</CardDescription>
          </CardHeader>
          <CardContent>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>GitHub, GitLab, and Jira integrations.</p>
            <Button variant="secondary">Manage Integrations</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
