'use client';

import { useState } from 'react';
import { MessageSquare, AtSign, Clock, Users } from 'lucide-react';
import type { AdminChatWorkspaceState } from '../rce/adapter-helpers';

interface ChatwootNavRailProps {
  workspace: AdminChatWorkspaceState;
}

interface NavItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: MessageSquare, label: 'Conversations' },
  { icon: AtSign,        label: 'Mentions'      },
  { icon: Clock,         label: 'Waiting'        },
  { icon: Users,         label: 'Teams'          },
];

export function ChatwootNavRail({ workspace }: ChatwootNavRailProps) {
  const [activeNav, setActiveNav] = useState<number>(0);

  const waitingCount = workspace.queueInsights.waitingOnAdmin;

  return (
    <aside className="w-[52px] flex-shrink-0 h-full bg-[var(--cw-bg-rail)] border-r border-[var(--cw-border)] flex flex-col items-center">
      {/* Icon group */}
      <nav className="flex flex-col items-center gap-1 pt-3 pb-2">
        {NAV_ITEMS.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeNav === index;
          const isConversations = index === 0;

          return (
            <button
              key={item.label}
              type="button"
              aria-label={item.label}
              aria-pressed={isActive}
              onClick={() => setActiveNav(index)}
              className={[
                'relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150',
                isActive
                  ? 'text-[var(--cw-accent)] bg-white/[0.08]'
                  : 'text-[var(--cw-text-3)] hover:text-[var(--cw-text-2)] hover:bg-white/[0.04]',
              ].join(' ')}
            >
              <Icon size={20} />

              {/* Unread badge on Conversations icon */}
              {isConversations && waitingCount > 0 && (
                <span
                  aria-label={`${waitingCount} waiting`}
                  className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 text-[9px] text-white font-bold flex items-center justify-center leading-none"
                >
                  {waitingCount > 9 ? '9+' : waitingCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User avatar */}
      <div className="pb-3">
        <div className="w-7 h-7 rounded-full bg-[var(--cw-accent)] flex items-center justify-center text-white text-[10px] font-bold select-none">
          A
        </div>
      </div>
    </aside>
  );
}
