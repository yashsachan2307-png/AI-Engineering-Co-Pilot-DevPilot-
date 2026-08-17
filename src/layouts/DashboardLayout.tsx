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

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', to: '/dashboard', exact: true },
  { icon: FolderOpen, label: 'Projects', to: '/dashboard/projects' },
  { icon: Bot, label: 'AI Copilot', to: '/dashboard/ai-assistant' },
  { icon: TerminalSquare, label: 'Code Review', to: '/dashboard/code-analyzer' },
  { icon: Bug, label: 'Debugger', to: '/dashboard/debugger' },
  { icon: Code2, label: 'Code Generator', to: '/dashboard/code-generator' },
  { icon: Network, label: 'Architecture', to: '/dashboard/architecture' },
  { icon: ShieldAlert, label: 'Security', to: '/dashboard/security' },
  { icon: Activity, label: 'Activity', to: '/dashboard/activity' },
];

export function DashboardLayout() {
  const location = useLocation();
  const currentPath = location.pathname.split('/').filter(Boolean).pop() || 'Overview';
  const pageTitle = currentPath.charAt(0).toUpperCase() + currentPath.slice(1).replace('-', ' ');

  return (
    <div className="layout-dashboard">
      <aside className="layout-sidebar">
        <div className="layout-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 16, height: 16, borderRadius: 2, backgroundColor: 'var(--color-accent)' }}></div>
            <span style={{ fontWeight: 600 }}>DevPilot</span>
          </div>
        </div>
        <div className="layout-sidebar-content">
          <div style={{ padding: '0 12px', marginBottom: '8px', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Workspace
          </div>
          <nav className="layout-sidebar-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `layout-sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="layout-sidebar-footer">
          <nav className="layout-sidebar-nav">
            <NavLink
              to="/dashboard/settings"
              className={({ isActive }) =>
                `layout-sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Settings size={16} />
              Settings
            </NavLink>
          </nav>
        </div>
      </aside>
      <main className="layout-main">
        <header className="layout-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-secondary)' }}>
            <span>DevPilot</span>
            <span style={{ color: 'var(--color-border)' }}>/</span>
            <span className="text-primary font-medium">{pageTitle}</span>
            <div style={{ width: 1, height: 16, backgroundColor: 'var(--color-border)', margin: '0 8px' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <GitBranch size={14} />
              <span>main</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <Cloud size={14} />
              <span>Synced</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Avatar fallback="U" />
          </div>
        </header>
        <div className="layout-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
