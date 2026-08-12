import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Bot, Code2, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Overview() {
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <Card>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FolderOpen size={20} style={{ color: 'var(--color-accent)' }} />
              Projects
            </CardTitle>
            <CardDescription>Manage your repositories and codebases.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/projects">
              <Button variant="secondary" style={{ width: '100%' }}>View Projects</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bot size={20} style={{ color: 'var(--color-success)' }} />
              AI Assistant
            </CardTitle>
            <CardDescription>Chat with DevPilot for architectural guidance.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/ai-assistant">
              <Button variant="secondary" style={{ width: '100%' }}>Open Assistant</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code2 size={20} style={{ color: 'var(--color-warning)' }} />
              Code Generator
            </CardTitle>
            <CardDescription>Generate boilerplate, tests, and components.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/code-generator">
              <Button variant="secondary" style={{ width: '100%' }}>Start Generating</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
