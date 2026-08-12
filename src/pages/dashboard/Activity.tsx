import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export function Activity() {
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Activity</h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p style={{ color: 'var(--color-text-secondary)' }}>Your recent AI generations, debug sessions, and repo scans will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
