'use client';
import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

import type { ChatThread, AiModel } from '@/lib/types';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import ProjectsSection from '@/components/app/ProjectsSection';
import ThreadItem from './ThreadItem';
import { useTheme } from '@/lib/themeContext';
import { ACCENT_COLORS } from '@/lib/themes';
import type { Project } from '@/lib/projects';

type Props = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  threads: ChatThread[];
  activeId: string | null;
  onSelectThread: (id: string) => void;
  onNewChat: () => void;
  mobileSidebarOpen: boolean;
  onCloseMobile: () => void;
  onOpenMobile: () => void;
  onDeleteThread: (id: string) => void;
  selectedModels: AiModel[];
  // Projects props
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  onCreateProject: () => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
};

export default function ThreadSidebar({
  sidebarOpen,
  onToggleSidebar,
  threads,
  activeId,
  onSelectThread,
  onNewChat,
  mobileSidebarOpen,
  onCloseMobile,
  onDeleteThread,
  selectedModels,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
}: Props) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isThreadSwitching, setIsThreadSwitching] = useState(false);
  const { theme } = useTheme();
  const accent = ACCENT_COLORS[theme.accent];

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const groupedThreads = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const filteredThreads = threads.filter(thread =>
      !searchQuery ||
      (thread.title || 'Untitled').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groups = {
      today: [] as ChatThread[],
      yesterday: [] as ChatThread[],
      older: [] as ChatThread[]
    };

    filteredThreads.forEach(thread => {
      const threadDate = new Date(thread.createdAt);
      const threadDay = new Date(threadDate.getFullYear(), threadDate.getMonth(), threadDate.getDate());

      if (threadDay.getTime() === today.getTime()) {
        groups.today.push(thread);
      } else if (threadDay.getTime() === yesterday.getTime()) {
        groups.yesterday.push(thread);
      } else {
        groups.older.push(thread);
      }
    });

    return groups;
  }, [threads, searchQuery]);

  const hasUnusedRecentThread = useMemo(() => {
    const recentThread = threads.find(t =>
      (!t.messages || t.messages.length === 0) &&
      (!t.title || t.title === 'New Chat')
    );
    return recentThread;
  }, [threads]);

  const handleThreadSelect = async (id: string) => {
    if (id === activeId) return;

    setIsThreadSwitching(true);
    await new Promise(resolve => setTimeout(resolve, 150));
    onSelectThread(id);
    setIsThreadSwitching(false);
  };

  const handleNewChat = () => {
    if (hasUnusedRecentThread) {
      handleThreadSelect(hasUnusedRecentThread.id);
    } else {
      onNewChat();
    }
  };

  useEffect(() => {
    const onOutside = (ev: MouseEvent) => {
      if (!openMenuId) return;
      const target = ev.target as HTMLElement | null;
      if (!target) return setOpenMenuId(null);
      const root = document.querySelector(`[data-menu-root="${openMenuId}"]`);
      if (root && (root.contains(target) || (ev.composedPath ? ev.composedPath().includes(root) : false))) return;
      setOpenMenuId(null);
    };
    document.addEventListener('click', onOutside);
    return () => document.removeEventListener('click', onOutside);
  }, [openMenuId]);


  const sidebarContent = (isMobile: boolean) => (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      {/* Projects Section */}
      <div className={cn("mb-6", isMobile ? "px-0" : "px-4")}>
        <ProjectsSection
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={onSelectProject}
          onCreateProject={onCreateProject}
          onUpdateProject={onUpdateProject}
          onDeleteProject={onDeleteProject}
          collapsed={false}
        />
      </div>

      {/* Search Bar */}
      <div className={cn("mb-3 xl:mb-6", isMobile ? "px-0" : "px-4")}>
        <div className="relative group">
          <Search className={cn(
            "absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors",
            theme.mode === 'dark' 
              ? "text-white/50 group-focus-within:text-white/70" 
              : "text-gray-500 group-focus-within:text-gray-700"
          )} />
          <input
            type="text"
            placeholder="Search threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-12 pr-10 py-2 xl:py-3 rounded-lg xl:rounded-xl text-sm focus:outline-none focus:ring-2 transition-all duration-200 backdrop-blur-sm",
              theme.mode === 'dark'
                ? "bg-black/20 border border-white/20 text-white placeholder-white/60 focus:ring-red-500/30 focus:border-red-500/50 focus:bg-black/30 shadow-lg"
                : "bg-white/30 border border-white/40 text-gray-700 placeholder-gray-500 focus:ring-white/30 focus:border-white/50 focus:bg-white/40"
            )}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={cn(
                "absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors p-1 rounded-md",
                theme.mode === 'dark'
                  ? "text-white/50 hover:text-white/80 hover:bg-white/10"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/20"
              )}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* New Chat */}
      <div className={cn("mb-4", isMobile ? "px-0" : "px-4")}>
        <button
          onClick={() => {
            handleNewChat();
            if (isMobile) onCloseMobile();
          }}
          className="w-full text-sm font-semibold px-4 py-2 xl:py-3 rounded-lg xl:rounded-xl shadow-lg text-white bg-gradient-to-r hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border border-white/20"
          style={{
            backgroundImage: `linear-gradient(135deg, ${accent.primary}, ${accent.primary}dd)`,
          }}
        >
          <Plus className="inline-block w-4 h-4 mr-2" />
          New Chat
        </button>
      </div>

      {/* Loading state for thread switching */}
      {isThreadSwitching && (
        <div className="flex items-center justify-center py-4">
          <div className="flex space-x-1">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accent.primary }}></div>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accent.primary, animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accent.primary, animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}

      {/* Thread list */}
      <div className={cn("flex-1 space-y-3 min-h-0", isMobile ? "pr-1" : "px-4")}>
        {!isHydrated ? (
          <div className="text-xs opacity-60">Loading...</div>
        ) : threads.length === 0 ? (
          <div className="text-xs opacity-60">No chats yet</div>
        ) : searchQuery && Object.values(groupedThreads).every(group => group.length === 0) ? (
          <div className="text-xs opacity-60 text-center py-4">No threads found</div>
        ) : null}

        {isHydrated && Object.entries(groupedThreads).map(([groupName, groupThreads]) =>
          groupThreads.length > 0 && (
            <div key={groupName} className="mb-4">
              <div className={cn(
                "text-xs font-semibold uppercase tracking-wider mb-3 px-2",
                theme.mode === 'dark' ? "text-white/60" : "text-gray-700/80"
              )}>{groupName}</div>
              <div className="space-y-1">
                {groupThreads.map((t) => (
                  <ThreadItem
                    key={t.id}
                    thread={t}
                    isActive={t.id === activeId}
                    onSelect={() => {
                      handleThreadSelect(t.id);
                      if (isMobile) onCloseMobile();
                    }}
                    onMenuToggle={(id) => setOpenMenuId(prev => prev === id ? null : id)}
                    isMenuOpen={openMenuId === t.id}
                    onDelete={(id) => {
                      setOpenMenuId(null);
                      setConfirmDeleteId(id);
                    }}
                    projects={projects}
                    selectedModels={selectedModels}
                  />
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          `relative hidden lg:flex shrink-0 h-[calc(100vh-2rem)] lg:h-[calc(100vh-3rem)] rounded-xl backdrop-blur-xl shadow-2xl flex-col transition-[width] duration-300`,
          theme.mode === 'dark' 
            ? 'border border-white/10 bg-gradient-to-b from-black/40 via-black/30 to-black/20'
            : 'border border-white/30 bg-gradient-to-b from-white/60 via-white/40 to-white/20',
          sidebarOpen ? 'w-72' : 'w-16'
        )}
      >
        <button
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          onClick={onToggleSidebar}
          className={cn(
            "absolute -right-3 top-6 z-10 h-7 w-7 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-200 shadow-lg",
            theme.mode === 'dark'
              ? "bg-gradient-to-r from-white/15 to-white/10 border border-white/20 hover:from-white/25 hover:to-white/15 hover:border-white/30"
              : "bg-gradient-to-r from-white/40 to-white/30 border border-white/40 hover:from-white/50 hover:to-white/40 hover:border-white/50"
          )}
        >
          {sidebarOpen ? (
            <ChevronLeft size={16} className={theme.mode === 'dark' ? "text-white/90" : "text-gray-700"} />
          ) : (
            <ChevronRight size={16} className={theme.mode === 'dark' ? "text-white/90" : "text-gray-700"} />
          )}
        </button>

        {sidebarOpen ? (
          <div className="flex flex-col flex-1 p-4 overflow-y-auto">
            {sidebarContent(false)}
          </div>
        ) : (
          <div className="flex-1 overflow-y-hidden flex flex-col items-center pt-4">
            <div className="mb-4 w-full">
              <ProjectsSection
                projects={projects}
                activeProjectId={activeProjectId}
                onSelectProject={onSelectProject}
                onCreateProject={onCreateProject}
                onUpdateProject={onUpdateProject}
                onDeleteProject={onDeleteProject}
                collapsed={true}
              />
            </div>
            <button
              title="New Chat"
              onClick={handleNewChat}
              className="w-8 h-8 xl:h-10 xl:w-10 rounded-lg xl:rounded-xl cursor-pointer flex items-center justify-center mb-6 mx-auto shrink-0 transition-all duration-200 hover:scale-110 shadow-lg border border-white/20"
              style={{
                background: `linear-gradient(135deg, ${accent.primary}, ${accent.primary}dd)`,
              }}
            >
              <Plus size={16} className="text-white" />
            </button>
            <div className="flex-1 overflow-y-hidden w-full flex flex-col items-center gap-2 pt-1 pb-2 min-h-0">
              {threads.map((t) => {
                const isActive = t.id === activeId;
                const letter = (t.title || 'Untitled').trim()[0]?.toUpperCase() || 'N';
                return (
                  <button
                    key={t.id}
                    title={t.title || 'Untitled'}
                    onClick={() => handleThreadSelect(t.id)}
                    className={`h-6 w-6 aspect-square rounded-full flex items-center justify-center transition-all duration-200 mx-auto shrink-0 hover:scale-110
                      ${isActive
                        ? 'bg-white/20 ring-1 ring-white/30 ring-offset-1 ring-offset-black'
                        : 'bg-white/5 hover:bg-white/10'
                      }`}
                  >
                    <span className="text-[10px] font-semibold leading-none">{letter}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-black/60" onClick={onCloseMobile} />
          <div className={cn(
            "absolute left-0 top-0 h-full w-80 max-w-[85vw] rounded-r-xl border p-4 backdrop-blur-xl shadow-2xl flex flex-col",
            theme.mode === 'dark'
              ? "border-white/10 bg-gradient-to-b from-black/40 via-black/30 to-black/20"
              : "border-white/30 bg-gradient-to-b from-white/60 via-white/40 to-white/20"
          )}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Chats</h2>
              <button
                aria-label="Close"
                onClick={onCloseMobile}
                className={cn(
                  "h-7 w-7 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-200 shadow-lg",
                  theme.mode === 'dark'
                    ? "bg-gradient-to-r from-white/15 to-white/10 border border-white/20 hover:from-white/25 hover:to-white/15 hover:border-white/30"
                    : "bg-gradient-to-r from-white/40 to-white/30 border border-white/40 hover:from-white/50 hover:to-white/40 hover:border-white/50"
                )}
              >
                <X size={14} className={theme.mode === 'dark' ? "text-white/90" : "text-gray-700"} />
              </button>
            </div>
            {sidebarContent(true)}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete this chat?"
        message="This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) {
            onDeleteThread(confirmDeleteId);
          }
          setConfirmDeleteId(null);
        }}
      />
    </>
  );
}
