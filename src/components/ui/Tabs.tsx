import { ReactNode, useState } from 'react';
import { cn } from '../../utils/cn';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  className?: string;
}

export function Tabs({ items, defaultTab, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id);

  return (
    <div className={cn('tabs-container', className)}>
      <div className="tabs-list">
        {items.map(item => (
          <button
            key={item.id}
            className="tabs-trigger"
            data-state={activeTab === item.id ? 'active' : 'inactive'}
            onClick={() => setActiveTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="tabs-content mt-4">
        {items.find(item => item.id === activeTab)?.content}
      </div>
    </div>
  );
}
