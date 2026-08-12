import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';

export function CodeGenerator() {
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Code Generator</h1>
      <Card>
        <CardHeader>
          <CardTitle>Generate New Code</CardTitle>
          <CardDescription>Describe what you want to build and DevPilot will generate the boilerplate.</CardDescription>
        </CardHeader>
        <CardContent>
          <p style={{ color: 'var(--color-text-secondary)' }}>Code generation features will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
