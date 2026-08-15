import { Outlet, NavLink } from 'react-router-dom';
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
  ShieldAlert
} from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', to: '/dashboard', exact: true },
  { icon: FolderOpen, label: 'Projects', to: '/dashboard/projects' },
  { icon: Bot, label: 'AI Assistant', to: '/dashboard/ai-assistant' },
  { icon: Code2, label: 'Code Generator', to: '/dashboard/code-generator' },
  { icon: Bug, label: 'Debugger', to: '/dashboard/debugger' },
  { icon: TerminalSquare, label: 'Code Analyzer', to: '/dashboard/code-analyzer' },
  { icon: Network, label: 'Architecture', to: '/dashboard/architecture' },
  { icon: ShieldAlert, label: 'Security', to: '/dashboard/security' },
  { icon: Activity, label: 'Activity', to: '/dashboard/activity' },
];

export function DashboardLayout() {
  return (
    <div className="layout-dashboard">
      <aside className="layout-sidebar">
        <div className="layout-sidebar-header">
          <span style={{ color: 'var(--color-accent)' }}>Dev</span>Pilot
        </div>
        <div className="layout-sidebar-content">
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
                <item.icon size={18} />
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
              <Settings size={18} />
              Settings
            </NavLink>
          </nav>
        </div>
      </aside>
      <main className="layout-main">
        <header className="layout-header">
          <div style={{ fontWeight: 500 }}>Workspace</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
