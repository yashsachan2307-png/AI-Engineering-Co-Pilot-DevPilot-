import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  Bot,
  Code2,
  Bug,
  Activity,
  Settings,
  TerminalSquare,
  Network,
  ShieldAlert,
  GitBranch,
  Cloud
} from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { EngineeringCopilotStatus } from '../components/EngineeringCopilotStatus';

const workspaceItems = [
  { icon: LayoutDashboard, label: 'Overview', to: '/dashboard', exact: true },
  { icon: FolderOpen, label: 'Projects', to: '/dashboard/projects' },
  { icon: Activity, label: 'Activity', to: '/dashboard/activity' },
];

const intelligenceItems = [
  { icon: Bot, label: 'AI Assistant', to: '/dashboard/ai-assistant' },
  { icon: Code2, label: 'Code Generator', to: '/dashboard/code-generator' },
  { icon: TerminalSquare, label: 'Code Analyzer', to: '/dashboard/code-analyzer' },
  { icon: Network, label: 'Architecture', to: '/dashboard/architecture' },
  { icon: ShieldAlert, label: 'Security', to: '/dashboard/security' },
];

const toolItems = [
  { icon: Bug, label: 'Debugger', to: '/dashboard/debugger' },
  { icon: Settings, label: 'Settings', to: '/dashboard/settings' },
];

function NavGroup({ title, items }: { title: string, items: any[] }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ 
        padding: '0 16px', 
        marginBottom: '6px', 
        fontSize: '11px', 
        fontWeight: 600, 
        color: 'var(--color-text-muted)', 
        textTransform: 'uppercase', 
        letterSpacing: '0.5px' 
      }}>
        {title}
      </div>
      <nav className="layout-sidebar-nav" style={{ padding: '0 8px' }}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `layout-sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={14} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function DashboardLayout() {
  const location = useLocation();
  const currentPath = location.pathname.split('/').filter(Boolean).pop() || 'overview';
  const pageTitle = currentPath.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="layout-dashboard">
      <aside className="layout-sidebar">
        <div className="layout-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 14, height: 14, backgroundColor: 'var(--color-accent)' }}></div>
            <span style={{ fontWeight: 600, letterSpacing: '1px' }}>DEV▸PILOT</span>
          </div>
        </div>
        
        <EngineeringCopilotStatus />

        <div className="layout-sidebar-content">
          <NavGroup title="Workspace" items={workspaceItems} />
          <NavGroup title="Intelligence" items={intelligenceItems} />
          <NavGroup title="Tools" items={toolItems} />
        </div>
        
        <div className="layout-sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 8px' }}>
            <Avatar fallback="U" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-primary)' }}>Engineer</span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Workspace Active</span>
            </div>
          </div>
        </div>
      </aside>
      
      <main className="layout-main">
        <header className="layout-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-secondary)' }}>
            <span style={{ fontFamily: 'var(--font-code)', fontSize: '12px' }}>DevPilot</span>
            <span style={{ color: 'var(--color-border)' }}>/</span>
            <span className="text-primary font-medium" style={{ fontFamily: 'var(--font-code)', fontSize: '12px' }}>{pageTitle}</span>
            <div style={{ width: 1, height: 16, backgroundColor: 'var(--color-border)', margin: '0 8px' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-code)' }}>
              <GitBranch size={12} />
              <span>main</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-code)', color: 'var(--color-success)' }}>
              <Cloud size={12} />
              <span>Synced</span>
            </div>
          </div>
        </header>
        <div className="layout-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

