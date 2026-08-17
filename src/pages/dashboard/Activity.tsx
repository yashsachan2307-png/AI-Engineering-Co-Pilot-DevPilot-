import { Activity as ActivityIcon, History } from 'lucide-react';

export function Activity() {
  return (
    <div className="flex flex-col gap-4 h-full bg-bg overflow-hidden p-6">
      <div className="flex items-center gap-2 mb-2">
        <ActivityIcon size={18} className="text-primary" />
        <h1 className="text-lg font-semibold text-primary m-0">Activity</h1>
      </div>

      <div className="panel bg-surface p-5 max-w-3xl">
        <div className="flex items-center gap-2 mb-4">
          <History size={16} className="text-secondary" />
          <h2 className="text-sm font-semibold text-primary m-0">Recent Activity</h2>
        </div>
        
        <div className="bg-[#0f172a] border border-dashed border-border rounded-md p-8 flex flex-col items-center justify-center text-center">
          <History size={32} className="text-muted/50 mb-3" />
          <p className="text-sm text-primary mb-1">No recent activity</p>
          <p className="text-xs text-muted">Your recent AI generations, debug sessions, and repo scans will appear here.</p>
        </div>
      </div>
    </div>
  );
}
