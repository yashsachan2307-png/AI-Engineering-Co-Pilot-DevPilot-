import { Settings as SettingsIcon, User, Link as LinkIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function Settings() {
  return (
    <div className="flex flex-col gap-4 h-full bg-bg overflow-hidden p-6">
      <div className="flex items-center gap-2 mb-2">
        <SettingsIcon size={18} className="text-primary" />
        <h1 className="text-lg font-semibold text-primary m-0">Settings</h1>
      </div>
      
      <div className="flex flex-col gap-4 max-w-3xl">
        <div className="panel bg-surface p-5">
          <div className="flex items-center gap-2 mb-1">
            <User size={16} className="text-secondary" />
            <h2 className="text-sm font-semibold text-primary m-0">Profile</h2>
          </div>
          <p className="text-xs text-secondary mb-4 m-0">Manage your account settings and preferences.</p>
          <div className="bg-[#0f172a] border border-border rounded-md p-4 mb-4">
            <p className="text-xs text-muted">Profile settings will go here.</p>
          </div>
          <Button className="btn-secondary text-xs py-1.5 px-4">Edit Profile</Button>
        </div>

        <div className="panel bg-surface p-5">
          <div className="flex items-center gap-2 mb-1">
            <LinkIcon size={16} className="text-secondary" />
            <h2 className="text-sm font-semibold text-primary m-0">Integrations</h2>
          </div>
          <p className="text-xs text-secondary mb-4 m-0">Connect DevPilot with your external tools.</p>
          <div className="bg-[#0f172a] border border-border rounded-md p-4 mb-4">
            <p className="text-xs text-muted">GitHub, GitLab, and Jira integrations.</p>
          </div>
          <Button className="btn-secondary text-xs py-1.5 px-4">Manage Integrations</Button>
        </div>
      </div>
    </div>
  );
}
