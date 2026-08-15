import { createBrowserRouter } from 'react-router-dom';

import { Landing } from '../pages/Landing';
import { AuthLayout } from '../layouts/AuthLayout';
import { Login } from '../pages/auth/Login';
import { Signup } from '../pages/auth/Signup';
import { ForgotPassword } from '../pages/auth/ForgotPassword';

import { DashboardLayout } from '../layouts/DashboardLayout';
import { Overview } from '../pages/dashboard/Overview';
import { Projects } from '../pages/dashboard/Projects';
import { ProjectDetails } from '../pages/dashboard/ProjectDetails';
import { AIAssistant } from '../pages/dashboard/AIAssistant';
import { CodeGenerator } from '../pages/dashboard/CodeGenerator';
import { Debugger } from '../pages/dashboard/Debugger';
import { CodeAnalyzer } from '../pages/dashboard/CodeAnalyzer';
import { Architecture } from '../pages/dashboard/Architecture';
import { Security } from '../pages/dashboard/Security';
import { Activity } from '../pages/dashboard/Activity';
import { Settings } from '../pages/dashboard/Settings';
import { GitHubCallback } from '../pages/dashboard/GitHubCallback';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/signup', element: <Signup /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
    ],
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Overview /> },
      { path: 'projects', element: <Projects /> },
      { path: 'projects/:id', element: <ProjectDetails /> },
      { path: 'ai-assistant', element: <AIAssistant /> },
      { path: 'code-generator', element: <CodeGenerator /> },
      { path: 'debugger', element: <Debugger /> },
      { path: 'code-analyzer', element: <CodeAnalyzer /> },
      { path: 'architecture', element: <Architecture /> },
      { path: 'security', element: <Security /> },
      { path: 'activity', element: <Activity /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
  {
    path: '/github/callback',
    element: <GitHubCallback />
  }
]);
