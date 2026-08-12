import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="layout-auth">
      <div className="layout-auth-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>DevPilot</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>AI Engineering Copilot</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
