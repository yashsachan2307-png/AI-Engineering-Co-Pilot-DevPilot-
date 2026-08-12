import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Send } from 'lucide-react';

export function AIAssistant() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>AI Assistant</h1>
      
      <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', marginBottom: '1rem' }}>
        <CardHeader>
          <CardTitle>Chat with DevPilot</CardTitle>
        </CardHeader>
        <CardContent style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ alignSelf: 'flex-start', backgroundColor: 'var(--color-border)', padding: '0.75rem', borderRadius: 'var(--radius-md)', maxWidth: '80%' }}>
              Hello! I'm DevPilot. How can I help you with your code today?
            </div>
          </div>
        </CardContent>
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '0.5rem' }}>
          <Input placeholder="Ask anything about your codebase..." style={{ flex: 1 }} />
          <Button variant="accent"><Send size={18} /></Button>
        </div>
      </Card>
    </div>
  );
}
