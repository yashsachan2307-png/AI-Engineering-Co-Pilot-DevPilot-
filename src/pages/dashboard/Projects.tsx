import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

const MOCK_PROJECTS = [
  { id: '1', name: 'devpilot-frontend', description: 'React foundation for the copilot.', status: 'Active' },
  { id: '2', name: 'devpilot-backend', description: 'Spring Boot backend services.', status: 'Planning' }
];

export function Projects() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Projects</h1>
        <Button variant="accent">New Project</Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {MOCK_PROJECTS.map(p => (
          <Card key={p.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '1.5rem' }}>
              <CardHeader>
                <CardTitle>
                  <Link to={`/dashboard/projects/${p.id}`} style={{ textDecoration: 'none' }}>
                    {p.name}
                  </Link>
                </CardTitle>
                <CardDescription>{p.description}</CardDescription>
              </CardHeader>
              <Badge variant={p.status === 'Active' ? 'success' : 'default'}>{p.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
