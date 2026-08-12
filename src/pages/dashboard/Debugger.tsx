import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';

export function Debugger() {
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Debugger</h1>
      <Card>
        <CardHeader>
          <CardTitle>Interactive Debugging</CardTitle>
          <CardDescription>Paste an error trace or connect your repository for automatic debugging.</CardDescription>
        </CardHeader>
        <CardContent>
          <p style={{ color: 'var(--color-text-secondary)' }}>Debugger features will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
