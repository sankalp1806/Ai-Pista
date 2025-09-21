'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';

import HeaderBar from '@/components/app/HeaderBar';
import VoiceSelector from '@/components/modals/VoiceSelector';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { mergeModels, useCustomModels } from '@/lib/customModels';
import { ChatMessage, ApiKeys, ChatThread, AiModel } from '@/lib/types';
import { createChatActions } from '@/lib/chatActions';
import { useProjects } from '@/lib/useProjects';
import ModelsModal from '@/components/modals/ModelsModal';
import FirstVisitNote from '@/components/app/FirstVisitNote';
import HomeAiInput from '@/components/home/HomeAiInput';
import ThreadSidebar from '@/components/chat/ThreadSidebar';
import ChatGrid from '@/components/chat/ChatGrid';
import { useTheme } from '@/lib/themeContext';
import { BACKGROUND_STYLES } from '@/lib/themes';
import { safeUUID } from '@/lib/uuid';
import LaunchScreen from '@/components/ui/LaunchScreen';
import { useAuth } from '@/lib/auth';
import { fetchThreads, createThread as createThreadDb, deleteThread as deleteThreadDb } from '@/lib/db'
import { useRouter } from 'next/navigation';
import GithubStar from '@/components/app/GithubStar';
import ThemeToggle from '@/components/ThemeToggle';
import CustomModels from '@/components/modals/CustomModels';
import Settings from '@/components/app/Settings';
import { Layers, Home as HomeIcon, Sun, Moon } from 'lucide-react';
import SupportDropdown from '@/components/support-dropdown';
import Link from 'next/link';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProjectModal from '@/components/modals/ProjectModal';
import { Project } from '@/lib/projects';
import { cn } from '@/lib/utils';
import './globals.css';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const [isHydrated, setIsHydrated] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const backgroundClass = BACKGROUND_STYLES[theme.background].className;

  // Redirect to signin if not authenticated (wait for auth to finish loading) - REMOVED
  /* useEffect(() => {
    if (isHydrated && !loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, isHydrated, router]); */

  const [selectedIds, setSelectedIds] = useLocalStorage<string[]>('ai-pista:selected-models', [
    'gemini-2.5-pro',
    'unstable-gpt-5-chat',
    'unstable-claude-sonnet-4',
    'perplexity/llama-3-sonar-large-32k-online',
    'unstable-grok-4',
  ]);
  const [keys] = useLocalStorage<ApiKeys>('ai-pista:keys', {});
  const [threads, setThreads] = useLocalStorage<ChatThread[]>('ai-pista:threads', []);
  const [activeId, setActiveId] = useLocalStorage<string | null>('ai-pista:active-thread', null);
  const [sidebarOpen, setSidebarOpen] = useLocalStorage<boolean>('ai-pista:sidebar-open', true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [modelsModalOpen, setModelsModalOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useLocalStorage<string>(
    'ai-pista:selected-voice',
    'alloy',
  );

  const [customModels] = useCustomModels();
  const allModels = useMemo(() => mergeModels(customModels), [customModels]);

  // Projects hook from main
  const {
    projects,
    activeProjectId,
    activeProject,
    createProject,
    updateProject,
    deleteProject,
    selectProject,
  } = useProjects();
  
  // Project modal handlers
  const handleCreateProject = () => {
    setEditingProject(null);
    setProjectModalOpen(true);
  };
  
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectModalOpen(true);
  };
  
  const handleSaveProject = (project: Project) => {
    if (editingProject) {
      updateProject(project);
    } else {
      createProject(project);
    }
    setEditingProject(null);
    setProjectModalOpen(false);
  };

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeId) || null,
    [threads, activeId],
  );
  // Only show chats for the active project (or all if none selected)
  const visibleThreads = useMemo(
    () => {
      const scope = threads.filter((t) => t.pageType === 'compare');
      return activeProjectId ? scope.filter((t) => t.projectId === activeProjectId) : scope
    },
    [threads, activeProjectId],
  );
  const messages = useMemo(() => activeThread?.messages ?? [], [activeThread]);

  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  // Allow collapsing a model column without unselecting it
  const [collapsedIds, setCollapsedIds] = useState<string[]>([]);
  const selectedModels = useMemo(
    () => selectedIds.map((id) => allModels.find((m) => m.id === id)).filter(Boolean) as AiModel[],
    [selectedIds, allModels],
  );
  // Build grid template: collapsed => fixed narrow, expanded => normal
  const headerTemplate = useMemo(() => {
    if (selectedModels.length === 0) return '';
    const isCompact = selectedModels.length < 5;
    const parts = selectedModels.map((m) => {
      const collapsed = collapsedIds.includes(m.id);
      if (collapsed) return '90px';
      // If fewer than 5 models, allow columns to flex and fill available width.
      // Otherwise keep fixed width for consistent 5-column comparison.
      return isCompact ? 'minmax(240px, 1fr)' : '320px';
    });
    return parts.join(' ');
  }, [selectedModels, collapsedIds]);

  const anyLoading = loadingIds.length > 0;

  const [firstNoteDismissed, setFirstNoteDismissed] = useLocalStorage<boolean>(
    'ai-pista:first-visit-note-dismissed',
    false,
  );
  const showFirstVisitNote =
    isHydrated && !firstNoteDismissed && (!keys?.openrouter || !keys?.gemini);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      const valid = new Set(allModels.map((m) => m.id));
      const currentValidCount = prev.filter((x) => valid.has(x)).length;
      if (currentValidCount >= 5) return prev;
      return [...prev, id];
    });
  };

  // Chat actions (send and onEditUser) moved to lib/chatActions.ts to avoid state races
  const { send, onEditUser } = useMemo(
    () =>
      createChatActions({
        selectedModels,
        keys,
        threads,
        activeThread,
        setThreads,
        setActiveId,
        setLoadingIds: (updater) => setLoadingIds(updater),
        setLoadingIdsInit: (ids) => setLoadingIds(ids),
        activeProject, // include project system prompt/context
        selectedVoice, // pass voice selection for audio models
        userId: user?.id,
        pageType: 'compare',
      }),
    [
      selectedModels,
      keys,
      threads,
      activeThread,
      setThreads,
      setActiveId,
      activeProject,
      selectedVoice,
      user?.id,
    ],
  );

  // This effect will run once on component mount to handle data loading logic
  useEffect(() => {
    // Only run logic after the component has hydrated and user state is known
    if (!isHydrated || loading) return;

    const loadData = async () => {
      // Prioritize local storage. If there's already chat history, don't overwrite it.
      const localThreadsRaw = localStorage.getItem('ai-pista:threads');
      if (localThreadsRaw) {
        try {
          const localThreads = JSON.parse(localThreadsRaw);
          if (Array.isArray(localThreads) && localThreads.length > 0) {
            // Local data exists, we trust it and do nothing more.
            // useLocalStorage hook has already loaded it into the `threads` state.
            return;
          }
        } catch (e) {
          console.warn("Could not parse local chat history, will try fetching from DB.", e);
        }
      }

      // If local storage is empty AND the user is logged in, fetch from DB as a one-time fallback.
      if (user?.id) {
        try {
          const dbThreads = await fetchThreads(user.id);
          // Only set threads if we got some from the DB and local is empty.
          if (dbThreads.length > 0) {
            setThreads(dbThreads);
            const compareThreads = dbThreads.filter(t => t.pageType === 'compare');
            const preferredThread = activeProjectId
              ? compareThreads.find(t => t.projectId === activeProjectId)
              : compareThreads[0];
            setActiveId(preferredThread?.id || null);
          }
        } catch (e) {
          console.warn('Failed to load compare threads from Supabase:', e);
        }
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isHydrated, loading]); // Depend on user and hydration state

  // group assistant messages by turn for simple compare view
  const pairs = useMemo(() => {
    const rows: { user: ChatMessage; answers: ChatMessage[] }[] = [];
    let currentUser: ChatMessage | null = null;
    for (const m of messages) {
      if (m.role === 'user') {
        currentUser = m;
        rows.push({ user: m, answers: [] });
      } else if (m.role === 'assistant' && currentUser) {
        rows[rows.length - 1]?.answers.push(m);
      }
    }
    return rows;
  }, [messages]);

  // For compare page only: while waiting for model responses, inject a placeholder
  // "Thinking…" message for each loading model on the latest turn so the UI
  // shows a loading indicator instead of "No response".
  const pairsWithPlaceholders = useMemo(() => {
    const cloned = pairs.map(r => ({ user: r.user, answers: [...r.answers] }));
    if (cloned.length === 0) return cloned;
    const last = cloned[cloned.length - 1];
    const answeredIds = new Set(last.answers.map(a => a.modelId).filter(Boolean) as string[]);
    // Show placeholders for any selected model that hasn't answered yet
    selectedModels.forEach(m => {
      if (!answeredIds.has(m.id)) {
        last.answers.push({
          id: `thinking-${m.id}-${safeUUID()}`,
          role: 'assistant',
          content: 'Thinking…',
          modelId: m.id,
          createdAt: new Date().toISOString(),
        } as ChatMessage);
      }
    });
    return cloned;
  }, [pairs, loadingIds, selectedModels]);

  // Delete a full user turn (user + all its answers)
  const onDeleteUser = (turnIndex: number) => {
    if (!activeThread) return;
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== activeThread.id) return t;
        const msgs = t.messages;
        const userStarts: number[] = [];
        for (let i = 0; i < msgs.length; i++) if (msgs[i].role === 'user') userStarts.push(i);
        const start = userStarts[turnIndex];
        if (start === undefined) return t;
        const end = userStarts[turnIndex + 1] ?? msgs.length; // exclusive
        const nextMsgs = msgs.filter((_, idx) => idx < start || idx >= end);
        return { ...t, messages: nextMsgs };
      }),
    );
  };

  // Delete a specific model's answer within a turn
  const onDeleteAnswer = (turnIndex: number, modelId: string) => {
    if (!activeThread) return;
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== activeThread.id) return t;
        const msgs = t.messages;
        const userStarts: number[] = [];
        for (let i = 0; i < msgs.length; i++) if (msgs[i].role === 'user') userStarts.push(i);
        const start = userStarts[turnIndex];
        if (start === undefined) return t;
        const end = userStarts[turnIndex + 1] ?? msgs.length; // exclusive
        let removed = false;
        const nextMsgs = msgs.filter((m, idx) => {
          if (idx <= start || idx >= end) return true;
          if (!removed && m.role === 'assistant' && m.modelId === modelId) {
            removed = true;
            return false;
          }
          return true;
        });
        return { ...t, messages: nextMsgs };
      }),
    );
  };

  useEffect(() => {
    if (isHydrated) {
      const t = setTimeout(() => setShowSplash(false), 1500); // Extended splash screen duration
      return () => clearTimeout(t);
    }
  }, [isHydrated]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <div className={cn("compare-page min-h-screen w-full relative", isDark ? "dark" : "")}>
      {/* Background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/compare-bg.jpg')",
        }}
      />
      <div
        className="absolute inset-0 z-0 bg-black/50"
      />

      {showSplash && (
        <div className="fixed inset-0 z-[9999]">
          <LaunchScreen backgroundClass={BACKGROUND_STYLES[theme.background].className} dismissed={!showSplash} />
        </div>
      )}

      <div className="relative z-10 px-3 lg:px-4 py-4 lg:py-6">
        <div className="flex gap-3 lg:gap-4">
          {/* Sidebar */}
          <ThreadSidebar
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            threads={visibleThreads}
            activeId={activeId}
            onSelectThread={(id) => setActiveId(id)}
            onNewChat={() => {
              const newThread: ChatThread = {
                id: safeUUID(),
                title: 'New Chat',
                messages: [],
                createdAt: Date.now(),
                projectId: activeProjectId,
                pageType: 'compare',
              };
              setThreads((prev) => [newThread, ...prev]);
              setActiveId(newThread.id);
            }}
            mobileSidebarOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
            onOpenMobile={() => setMobileSidebarOpen(true)}
            onDeleteThread={async (id) => {
              setThreads((prev) => {
                const next = prev.filter((t) => t.id !== id);
                if (activeId === id) {
                  const inScope = next.filter((t) => t.pageType === 'compare');
                  const nextInScope =
                    (activeProjectId ? inScope.find((t) => t.projectId === activeProjectId) : inScope[0])
                      ?.id ?? null;
                  setActiveId(nextInScope);
                }
                return next;
              });
              if (user?.id) {
                try {
                  await deleteThreadDb(user.id, id);
                } catch (e) {
                  console.warn('Failed to delete compare thread in DB:', e);
                }
              }
            }}
            selectedModels={selectedModels}
            // Projects (from main)
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={selectProject}
            onCreateProject={handleCreateProject}
            onUpdateProject={handleEditProject}
            onDeleteProject={deleteProject}
          />

          {/* Main content */}
          <div className="flex-1 min-w-0 flex flex-col h-[calc(100vh-2rem)] lg:h-[calc(100vh-3rem)] overflow-hidden ">
            {/* Mobile Header with Hamburger */}
          <div className={cn(
            "lg:hidden flex items-center justify-between p-4 border-b",
            isDark ? "border-white/10" : "border-rose-200/40"
          )}>
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className={cn(
                  "inline-flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95",
                  isDark
                    ? "bg-gradient-to-r from-white/12 to-white/8 border border-white/15 text-white hover:from-white/18 hover:to-white/12 hover:border-white/25 backdrop-blur-sm shadow-lg"
                    : "bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50 shadow-sm"
                )}
                aria-label="Open menu"
                title="Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              {/* Right: Actions trigger (mobile) */}
              <div className="relative flex items-center gap-2">
                {/* Inline Support button on mobile header */}
                <div>
                  <SupportDropdown inline theme={theme.mode === 'dark' ? 'dark' : 'light'} />
                </div>
                <button
                  onClick={() => setMobileActionsOpen((v) => !v)}
                  className={cn(
                    "inline-flex items-center justify-center h-9 w-9 rounded-md border shadow",
                    isDark
                      ? "border-white/15 bg-white/5 hover:bg-white/10"
                      : "border-rose-200/60 bg-rose-50/60 hover:bg-rose-100/80"
                  )}
                  aria-label="Open quick actions"
                  title="Actions"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                    <circle cx="7" cy="7" r="2" />
                    <circle cx="17" cy="7" r="2" />
                    <circle cx="7" cy="17" r="2" />
                    <circle cx="17" cy="17" r="2" />
                  </svg>
                </button>

                {mobileActionsOpen && (
                  <div className={cn(
                    "absolute right-0 top-11 z-50 rounded-xl border shadow-xl p-2 flex items-center gap-2 backdrop-blur-md",
                    isDark
                      ? "border-white/15 bg-black/60"
                      : "border-rose-200/50 bg-white/95"
                  )}>
                    <Link
                      href="/"
                      className={cn(
                        "inline-flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95",
                        isDark
                          ? "bg-gradient-to-r from-white/12 to-white/8 border border-white/15 text-white hover:from-white/18 hover:to-white/12 hover:border-white/25 backdrop-blur-sm shadow-lg"
                          : "bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50 shadow-sm"
                      )}
                      aria-label="Go to home"
                      title="Home"
                    >
                      <HomeIcon size={18} />
                    </Link>
                    <button
                      onClick={() => { setModelsModalOpen(true); setMobileActionsOpen(false); }}
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs h-9 w-9 justify-center rounded-md border shadow",
                        isDark
                          ? "border-white/15 bg-white/5 hover:bg-white/10"
                          : "border-rose-200/60 bg-rose-50/60 hover:bg-rose-100/80"
                      )}
                      title="Change models"
                      aria-label="Change models"
                    >
                      <Layers size={14} />
                    </button>
                    <CustomModels compact />
                    <button
                      onClick={toggleMode}
                      className={cn(
                        'inline-flex items-center gap-1.5 text-xs h-9 w-9 justify-center rounded-md border shadow transition-all duration-200',
                        isDark
                          ? 'border-white/15 bg-white/5 text-white hover:bg-white/10'
                          : 'border-rose-200/60 bg-rose-50/60 text-gray-700 hover:bg-rose-100/80'
                      )}
                      title="Toggle theme"
                      aria-label="Toggle theme"
                    >
                      {isDark ? <Sun size={14} /> : <Moon size={14} />}
                    </button>
                    <Settings compact />
                    <GithubStar owner="sankalp1806" repo="Ai-Pista" />
                  </div>
                )}
              </div>
            </div>
            {/* Top bar - Desktop only */}
            <div className="hidden lg:block">
              <HeaderBar
                onOpenMenu={() => setMobileSidebarOpen(true)}
                title="AI Pista"
                githubOwner="sankalp1806"
                githubRepo="Ai-Pista"
                onOpenModelsModal={() => setModelsModalOpen(true)}
                className="-mr-3 sm:mr-0"
              />
            </div>

            {/* Voice selector for audio models */}
            {isHydrated && selectedModels.some((m) => m.category === 'audio') && (
              <div className="mb-3 px-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Voice:</span>
                  <VoiceSelector selectedVoice={selectedVoice} onVoiceChange={setSelectedVoice} />
                </div>
              </div>
            )}

            <ModelsModal
              open={modelsModalOpen}
              onClose={() => setModelsModalOpen(false)}
              selectedIds={selectedIds}
              selectedModels={selectedModels}
              customModels={customModels}
              onToggle={toggle}
            />

            {isHydrated && (
              <FirstVisitNote
                open={showFirstVisitNote}
                onClose={() => setFirstNoteDismissed(true)}
              />
            )}

            {isHydrated && (
              <ChatGrid
                selectedModels={selectedModels}
                headerTemplate={headerTemplate}
                collapsedIds={collapsedIds}
                setCollapsedIds={setCollapsedIds}
                loadingIds={loadingIds}
                pairs={pairsWithPlaceholders}
                onEditUser={onEditUser}
                onDeleteUser={onDeleteUser}
                onToggle={toggle}
              />
            )}

            {isHydrated && (
              <div className="px-3 lg:px-4">
                <HomeAiInput
                  isDark={isDark}
                  onSubmit={(text) => {
                    try { console.log('[Compare] HomeAiInput onSubmit:', text); } catch {}
                    send(text);
                  }}
                />
                <div className="sr-only" aria-hidden>
                  {/* Debug counter for messages to ensure state updates */}
                  activeId: {String(activeId || '')} • messages: {String(messages.length)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toasts for share notifications */}
      <ProjectModal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSave={handleSaveProject}
        project={editingProject}
      />

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}
