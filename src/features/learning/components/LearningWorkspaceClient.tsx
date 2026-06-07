'use client';

import Editor, { loader, Monaco } from '@monaco-editor/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import { useSession } from 'next-auth/react';
import { strToU8, zipSync } from 'fflate';

import {
  FlattenedModule,
  LearningCourse,
  LearningStatePayload,
  ProjectTemplate,
  TaskStatus,
  VirtualFileTemplate,
} from '@/features/learning/types';
import { getModuleRoute, getProjectRoute } from '@/features/learning/paths';
import { FileIcon } from './FileIcon';
import { useAutoSave } from '@/features/learning/hooks/useLearningState';

declare global {
  interface Window {
    loadPyodide?: (options?: Record<string, unknown>) => Promise<any>;
    __learningMonacoRegistered?: boolean;
  }
}

type WorkspaceMode = 'module' | 'project';
type GuideTab = 'guide' | 'notes' | 'reflection' | 'checks'; // 'notes' kept for backward compat; now rendered inline within 'guide'

interface SessionRow {
  id: string;
  device_label: string;
  last_active_at: string;
}

type SaveBadgeState = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

interface LearningWorkspaceClientProps {
  course: LearningCourse;
  moduleContext?: FlattenedModule;
  projectTemplate?: ProjectTemplate;
  initialState: LearningStatePayload;
}

function localStorageKey(courseSlug: string) {
  return `learning-platform:${courseSlug}:state:v1`;
}

function sidebarKey() {
  return 'learning:sidebar:collapsed';
}

function sidebarWidthKey() {
  return 'learning:sidebar:width';
}

function mergeState(serverState: LearningStatePayload, localState?: LearningStatePayload): LearningStatePayload {
  if (!localState) return serverState;
  return {
    taskProgress: { ...serverState.taskProgress, ...localState.taskProgress },
    notesByModule: { ...serverState.notesByModule, ...localState.notesByModule },
    reflectionsByModule: { ...serverState.reflectionsByModule, ...localState.reflectionsByModule },
    quizAnswers: { ...serverState.quizAnswers, ...localState.quizAnswers },
    activeProjectSlug: localState.activeProjectSlug ?? serverState.activeProjectSlug,
    projects: { ...serverState.projects, ...localState.projects },
  };
}

async function loadScript(src: string) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
}

function normalizeFiles(files: VirtualFileTemplate[], overrides?: Record<string, string>) {
  return files.map((file) => ({ ...file, content: overrides?.[file.path] ?? file.content }));
}

function detectValidationSuccess(output: string, target?: string) {
  return Boolean(target && output.includes(target));
}

function saveBadgeTone(state: SaveBadgeState) {
  switch (state) {
    case 'unsaved':
      return 'text-[#9aa5b1]';
    case 'saving':
      return 'text-[#61afef]';
    case 'saved':
      return 'text-[#98c379]';
    case 'error':
      return 'text-[#e06c75]';
    default:
      return 'text-[#555555]';
  }
}

function getTerminalLineColor(line: string): string {
  if (!line.trim()) return 'text-[#333333]';
  const l = line.toLowerCase();
  if (l.includes('exception') || l.includes('error') || l.includes('traceback') || l.includes('critical') || l.includes('failed') || l.includes('halted')) {
    return 'text-[#e06c75]';
  }
  if (l.includes('success') || l.includes('verified') || l.includes('passed') || l.includes('nominal') || l.includes('completed')) {
    return 'text-[#98c379]';
  }
  if (l.includes('alert') || l.includes('warning') || l.includes('drift') || l.includes('mismatch')) {
    return 'text-[#e5c07b]';
  }
  if (l.startsWith('---') || l.startsWith('===') || l.startsWith('***')) {
    return 'text-[#56b6c2]';
  }
  if (l.startsWith('#') || l.startsWith('//')) {
    return 'text-[#5c6370] italic';
  }
  if (l.includes('initializing') || l.includes('running') || l.includes('loading')) {
    return 'text-[#61afef]';
  }
  return 'text-[#d0ccc4]';
}

function getDeviceLabel(): string {
  const ua = navigator.userAgent;
  const os = ua.includes('Mac') ? 'Mac' : ua.includes('Win') ? 'Windows' : ua.includes('Linux') ? 'Linux' : ua.includes('Android') ? 'Android' : ua.includes('iPhone') || ua.includes('iPad') ? 'iOS' : 'Device';
  const browser = ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') ? 'Safari' : ua.includes('Edge') ? 'Edge' : 'Browser';
  return `${browser} on ${os}`;
}

const PORTFOLIO_DARK_THEME = {
  base: 'vs-dark' as const,
  inherit: true,
  rules: [
    { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
    { token: 'comment.doc', foreground: '5c6370', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'c678dd' },
    { token: 'keyword.control', foreground: 'c678dd' },
    { token: 'storage', foreground: 'c678dd' },
    { token: 'storage.type', foreground: 'e5c07b' },
    { token: 'string', foreground: '98c379' },
    { token: 'string.escape', foreground: '56b6c2' },
    { token: 'number', foreground: 'd19a66' },
    { token: 'constant.numeric', foreground: 'd19a66' },
    { token: 'constant.language', foreground: 'd19a66' },
    { token: 'type', foreground: 'e5c07b' },
    { token: 'type.identifier', foreground: 'e5c07b' },
    { token: 'entity.name.type', foreground: 'e5c07b' },
    { token: 'entity.name.class', foreground: 'e5c07b' },
    { token: 'function', foreground: '61afef' },
    { token: 'entity.name.function', foreground: '61afef' },
    { token: 'support.function', foreground: '61afef' },
    { token: 'variable', foreground: 'e06c75' },
    { token: 'variable.other', foreground: 'abb2bf' },
    { token: 'operator', foreground: '56b6c2' },
    { token: 'delimiter', foreground: 'abb2bf' },
    { token: 'tag', foreground: 'e06c75' },
    { token: 'attribute.name', foreground: 'd19a66' },
    { token: 'attribute.value', foreground: '98c379' },
    { token: 'punctuation', foreground: 'abb2bf' },
    { token: 'meta.decorator', foreground: 'c678dd' },
  ],
  colors: {
    'editor.background': '#0a0a0a',
    'editor.foreground': '#d0ccc4',
    'editor.lineHighlightBackground': '#161616',
    'editor.selectionBackground': '#222222',
    'editor.inactiveSelectionBackground': '#3a3f4b',
    'editorCursor.foreground': '#e8a000',
    'editorLineNumber.foreground': '#555555',
    'editorLineNumber.activeForeground': '#d0ccc4',
    'editorIndentGuide.background': '#3b4048',
    'editorIndentGuide.activeBackground': '#333333',
    'editorWhitespace.foreground': '#3b4048',
    'editorWidget.background': '#111111',
    'editorWidget.border': '#3e4452',
    'editorSuggestWidget.background': '#111111',
    'editorSuggestWidget.border': '#3e4452',
    'editorSuggestWidget.selectedBackground': '#161616',
    'editorSuggestWidget.foreground': '#d0ccc4',
    'editorSuggestWidget.highlightForeground': '#61afef',
    'editor.wordHighlightBackground': '#344b5a33',
    'editor.findMatchBackground': '#42557b',
    'editor.findMatchHighlightBackground': '#314365',
    'editorGutter.background': '#0a0a0a',
    'editorGutter.addedBackground': '#3d5213',
    'editorGutter.deletedBackground': '#6b1e1e',
    'editorGutter.modifiedBackground': '#5b4b00',
    'scrollbar.shadow': '#00000050',
    'scrollbarSlider.background': '#4e566440',
    'scrollbarSlider.hoverBackground': '#5a637566',
    'scrollbarSlider.activeBackground': '#747d8c99',
    'tab.activeBackground': '#0a0a0a',
    'tab.inactiveBackground': '#111111',
    'tab.border': '#222222',
    'tab.activeBorderTop': '#e8a000',
    'tab.unfocusedActiveBorderTop': '#e8a00080',
    'editorGroupHeader.tabsBackground': '#111111',
    'editorGroupHeader.tabsBorder': '#222222',
    'sideBar.background': '#111111',
    'sideBar.foreground': '#d0ccc4',
    'sideBar.border': '#222222',
    'sideBarSectionHeader.background': '#0a0a0a',
    'sideBarSectionHeader.foreground': '#888888',
    'panel.background': '#111111',
    'panel.border': '#222222',
    'panelTitle.activeForeground': '#d0ccc4',
    'panelTitle.activeBorder': '#e8a000',
    'statusBar.background': '#111111',
    'statusBar.foreground': '#888888',
    'titleBar.activeBackground': '#111111',
    'titleBar.activeForeground': '#d0ccc4',
    'activityBar.background': '#111111',
    'activityBar.foreground': '#d0ccc4',
    'activityBarBadge.background': '#e8a000',
    'activityBarBadge.foreground': '#ffffff',
    'terminal.background': '#0a0a0a',
    'terminal.foreground': '#d0ccc4',
    'terminal.ansiBlack': '#3f4451',
    'terminal.ansiRed': '#e06c75',
    'terminal.ansiGreen': '#98c379',
    'terminal.ansiYellow': '#e5c07b',
    'terminal.ansiBlue': '#61afef',
    'terminal.ansiMagenta': '#c678dd',
    'terminal.ansiCyan': '#56b6c2',
    'terminal.ansiWhite': '#d0ccc4',
    'terminal.ansiBrightBlack': '#4f5666',
    'terminal.ansiBrightRed': '#be5046',
    'terminal.ansiBrightGreen': '#7ec069',
    'terminal.ansiBrightYellow': '#d19a66',
    'terminal.ansiBrightBlue': '#4aa5f0',
    'terminal.ansiBrightMagenta': '#a626a4',
    'terminal.ansiBrightCyan': '#42b3c2',
    'terminal.ansiBrightWhite': '#ffffff',
    'focusBorder': '#e8a000',
    'contrastBorder': '#00000000',
    'input.background': '#1d2025',
    'input.border': '#222222',
    'input.foreground': '#d0ccc4',
    'button.background': '#e8a000',
    'button.hoverBackground': '#f0b429',
    'list.activeSelectionBackground': '#161616',
    'list.activeSelectionForeground': '#d0ccc4',
    'list.hoverBackground': '#16161650',
  },
};

export default function LearningWorkspaceClient({
  course,
  moduleContext,
  projectTemplate,
  initialState,
}: LearningWorkspaceClientProps) {
  const router = useRouter();
  const { status } = useSession();
  const mode: WorkspaceMode = moduleContext ? 'module' : 'project';
  const module = moduleContext?.module;
  const week = moduleContext?.week;
  const currentLab = module?.labs?.[0];

  const initialFiles = useMemo(() => {
    if (projectTemplate) {
      return normalizeFiles(projectTemplate.files, initialState.projects[projectTemplate.slug]);
    }
    if (currentLab) return normalizeFiles(currentLab.files);
    return [];
  }, [currentLab, initialState.projects, projectTemplate]);

  const [hydrated, setHydrated] = useState(false);
  const [learningState, setLearningState] = useState<LearningStatePayload>(initialState);
  const [activeFilePath, setActiveFilePath] = useState<string>(initialFiles[0]?.path ?? '');
  const [workspaceFiles, setWorkspaceFiles] = useState<VirtualFileTemplate[]>(initialFiles);
  const [terminalOutput, setTerminalOutput] = useState<string>('Ready.');
  const [isRunning, setIsRunning] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [visibleHintCount, setVisibleHintCount] = useState(1);
  const [selectedTab, setSelectedTab] = useState<GuideTab>('guide');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [terminalHeight, setTerminalHeight] = useState(220);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [runMs, setRunMs] = useState<number | null>(null);
  const [guidePanelWidth, setGuidePanelWidth] = useState(440);
  const [monacoLoadAttempt, setMonacoLoadAttempt] = useState(0);
  const [monacoReady, setMonacoReady] = useState(false);
  const [monacoError, setMonacoError] = useState('');

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const terminalDragRef = useRef<{ startY: number; startH: number } | null>(null);
  const sidebarDragRef = useRef<{ startX: number; startW: number } | null>(null);
  const guidePanelDragRef = useRef<{ startX: number; startW: number } | null>(null);
  const runValidationRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const notesUndoStack = useRef<string[]>([]);
  const notesRedoStack = useRef<string[]>([]);
  const { saveNotes, saveCode, saveTask, getStatus } = useAutoSave(course.slug, module?.id);

  // Use the installed Monaco package. The default loader points at jsDelivr,
  // which is intentionally blocked by the site's self-only script CSP.
  useEffect(() => {
    let active = true;
    setMonacoReady(false);
    setMonacoError('');

    import('monaco-editor')
      .then((localMonaco) => {
        if (!active) return;
        loader.config({ monaco: localMonaco });
        setMonacoReady(true);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setMonacoError(error instanceof Error ? error.message : String(error));
      });

    return () => {
      active = false;
    };
  }, [monacoLoadAttempt]);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const collapsed = localStorage.getItem(sidebarKey());
      if (collapsed === 'true') setSidebarCollapsed(true);

      const savedSidebarWidth = Number(localStorage.getItem(sidebarWidthKey()));
      if (Number.isFinite(savedSidebarWidth) && savedSidebarWidth >= 200 && savedSidebarWidth <= 640) {
        setSidebarWidth(savedSidebarWidth);
      }

      const raw = localStorage.getItem(localStorageKey(course.slug));
      if (raw) {
        const parsed = JSON.parse(raw) as LearningStatePayload;
        const merged = mergeState(initialState, parsed);
        setLearningState(merged);
        if (projectTemplate) {
          const next = normalizeFiles(projectTemplate.files, merged.projects[projectTemplate.slug]);
          setWorkspaceFiles(next);
          setActiveFilePath(next[0]?.path ?? '');
        }
      }
    } catch {
      // keep server state
    } finally {
      setHydrated(true);
    }
  }, [course.slug, initialState, projectTemplate]);

  // Persist sidebar collapse preference
  useEffect(() => {
    if (hydrated) localStorage.setItem(sidebarKey(), String(sidebarCollapsed));
  }, [sidebarCollapsed, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(sidebarWidthKey(), String(sidebarWidth));
  }, [hydrated, sidebarWidth]);

  // Reset workspace when initialFiles change (module navigation)
  useEffect(() => {
    setWorkspaceFiles(initialFiles);
    setActiveFilePath(initialFiles[0]?.path ?? '');
    setTerminalOutput('Ready.');
    setSuccessMessage('');
    setVisibleHintCount(1);
    setRunMs(null);
  }, [initialFiles]);

  // Context-aware tab auto-switch
  useEffect(() => {
    if (module?.kind === 'weekend') setSelectedTab('checks');
    else if (currentLab) setSelectedTab('guide');
    else setSelectedTab('guide');
  }, [module?.id, currentLab, module?.kind]);

  // Save to server (debounced 500ms)
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(localStorageKey(course.slug), JSON.stringify(learningState));
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [course.slug, hydrated, learningState]);

  useEffect(() => {
    if (!hydrated || status !== 'authenticated') return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      try {
        await fetch('/api/learning/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseSlug: course.slug, state: learningState }),
        });
      } catch {
        // local cache remains fallback
      }
    }, 1200);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [course.slug, hydrated, learningState, status]);

  useEffect(() => {
    if (status !== 'authenticated' || !module?.id) return;

    const labId = currentLab?.id;
    Promise.all([
      fetch(`/api/learning/notes?courseSlug=${course.slug}&moduleId=${module.id}`),
      fetch(`/api/learning/tasks?courseSlug=${course.slug}`),
      labId
        ? fetch(`/api/learning/code?courseSlug=${course.slug}&moduleId=${module.id}&labId=${labId}`)
        : Promise.resolve(new Response(JSON.stringify({ files: [] }))),
    ])
      .then(async ([notesRes, tasksRes, codeRes]) => {
        const notesData = await notesRes.json();
        const tasksData = await tasksRes.json();
        const codeData = await codeRes.json();

        setLearningState((prev) => ({
          ...prev,
          notesByModule:
            typeof notesData?.notes === 'string'
              ? { ...prev.notesByModule, [module.id]: notesData.notes as string }
              : prev.notesByModule,
          reflectionsByModule:
            typeof notesData?.reflection === 'string'
              ? {
                  ...prev.reflectionsByModule,
                  [module.id]: notesData.reflection
                    ? (notesData.reflection as string).split('\n---\n')
                    : prev.reflectionsByModule[module.id] ?? [],
                }
              : prev.reflectionsByModule,
          taskProgress: Array.isArray(tasksData?.tasks)
            ? {
                ...prev.taskProgress,
                ...Object.fromEntries(
                  (tasksData.tasks as Array<{ task_id: string; status: TaskStatus }>).map((row) => [row.task_id, row.status]),
                ),
              }
            : prev.taskProgress,
        }));

        if (labId && Array.isArray(codeData?.files) && codeData.files.length > 0) {
          setWorkspaceFiles((prev) =>
            prev.map((file) => {
              const persisted = (codeData.files as Array<{ path: string; content: string }>).find((item) => item.path === file.path);
              return persisted ? { ...file, content: persisted.content } : file;
            }),
          );
        }
      })
      .catch(() => {
        // local cache remains fallback
      });
  }, [course.slug, currentLab?.id, module?.id, status]);

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        runValidationRef.current();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Session ping + load sessions
  useEffect(() => {
    if (status !== 'authenticated') return;
    const label = getDeviceLabel();
    fetch('/api/learning/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseSlug: course.slug, deviceLabel: label }),
    }).catch(() => {});

    fetch(`/api/learning/session?courseSlug=${course.slug}`)
      .then((r) => r.json())
      .then((data) => { if (data?.sessions) setSessions(data.sessions); })
      .catch(() => {});
  }, [course.slug, status]);

  // Guide panel horizontal drag resize
  function handleSidebarDragStart(e: React.MouseEvent) {
    if (sidebarCollapsed) return;
    e.preventDefault();
    sidebarDragRef.current = { startX: e.clientX, startW: sidebarWidth };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    function onMove(ev: MouseEvent) {
      if (!sidebarDragRef.current) return;
      const delta = ev.clientX - sidebarDragRef.current.startX;
      setSidebarWidth(Math.max(200, Math.min(640, sidebarDragRef.current.startW + delta)));
    }

    function onUp() {
      sidebarDragRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function handleGuidePanelDragStart(e: React.MouseEvent) {
    e.preventDefault();
    guidePanelDragRef.current = { startX: e.clientX, startW: guidePanelWidth };
    function onMove(ev: MouseEvent) {
      if (!guidePanelDragRef.current) return;
      const delta = ev.clientX - guidePanelDragRef.current.startX;
      setGuidePanelWidth(Math.max(240, Math.min(720, guidePanelDragRef.current.startW + delta)));
    }
    function onUp() {
      guidePanelDragRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  // Terminal drag resize
  function handleTerminalDragStart(e: React.MouseEvent) {
    e.preventDefault();
    terminalDragRef.current = { startY: e.clientY, startH: terminalHeight };
    function onMove(e: MouseEvent) {
      if (!terminalDragRef.current) return;
      const delta = terminalDragRef.current.startY - e.clientY;
      setTerminalHeight(Math.max(80, Math.min(520, terminalDragRef.current.startH + delta)));
    }
    function onUp() {
      terminalDragRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  const activeFile = workspaceFiles.find((f) => f.path === activeFilePath) ?? workspaceFiles[0];

  const totalRequired = module?.tasks.filter((t) => t.required !== false).length ?? 0;
  const completedRequired = module?.tasks.filter((t) => learningState.taskProgress[t.id] === 'completed').length ?? 0;
  const moduleCompletion = totalRequired > 0 ? Math.round((completedRequired / totalRequired) * 100) : 0;

  function getModuleStatus(moduleId: string, tasks: Array<{ id: string }>) {
    if (tasks.length === 0) return 'not_started';
    const done = tasks.filter((t) => learningState.taskProgress[t.id] === 'completed').length;
    if (done === tasks.length) return 'completed';
    if (done > 0) return 'in_progress';
    return 'not_started';
  }

  // State updaters
  function updateTask(taskId: string, checked: boolean) {
    const nextStatus = (checked ? 'completed' : 'not_started') as TaskStatus;
    setLearningState((prev) => ({
      ...prev,
      taskProgress: { ...prev.taskProgress, [taskId]: nextStatus },
    }));
    if (status === 'authenticated') void saveTask(taskId, nextStatus);
  }

  function updateNotes(moduleId: string, content: string, pushUndo = false) {
    if (pushUndo && module) {
      notesUndoStack.current.push(learningState.notesByModule[module.id] ?? '');
      notesRedoStack.current = [];
    }
    setLearningState((prev) => ({ ...prev, notesByModule: { ...prev.notesByModule, [moduleId]: content } }));
    if (status === 'authenticated') saveNotes('notes', content);
  }

  function insertMarkdown(before: string, after: string = '', placeholder: string = 'text') {
    if (!module) return;
    const el = notesRef.current;
    const current = learningState.notesByModule[module.id] ?? '';
    // Push current value onto undo stack before mutating
    notesUndoStack.current.push(current);
    notesRedoStack.current = [];
    if (!el) {
      updateNotes(module.id, current + before + placeholder + after);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = current.slice(start, end) || placeholder;
    const next = current.slice(0, start) + before + selected + after + current.slice(end);
    updateNotes(module.id, next);
    requestAnimationFrame(() => {
      el.focus();
      const newStart = start + before.length;
      el.setSelectionRange(newStart, newStart + selected.length);
    });
  }

  function updateReflection(moduleId: string, index: number, content: string) {
    setLearningState((prev) => {
      const existing = [...(prev.reflectionsByModule[moduleId] ?? [])];
      existing[index] = content;
      if (status === 'authenticated') saveNotes('reflection', existing.join('\n---\n'));
      return { ...prev, reflectionsByModule: { ...prev.reflectionsByModule, [moduleId]: existing } };
    });
  }

  function updateQuizAnswer(moduleId: string, answer: string) {
    setLearningState((prev) => ({ ...prev, quizAnswers: { ...prev.quizAnswers, [moduleId]: answer } }));
  }

  function updateFile(path: string, content: string) {
    setWorkspaceFiles((prev) => prev.map((f) => (f.path === path ? { ...f, content } : f)));
    if (status === 'authenticated' && currentLab && !projectTemplate) {
      saveCode(currentLab.id, path, content);
    }
    if (projectTemplate) {
      setLearningState((prev) => ({
        ...prev,
        activeProjectSlug: projectTemplate.slug,
        projects: {
          ...prev.projects,
          [projectTemplate.slug]: { ...(prev.projects[projectTemplate.slug] ?? {}), [path]: content },
        },
      }));
    }
  }

  function revealSolution() {
    if (!activeFile?.solution) return;
    updateFile(activeFile.path, activeFile.solution);
  }

  function downloadWorkspaceAsZip() {
    const fileMap: Record<string, Uint8Array> = {};
    for (const file of workspaceFiles) {
      fileMap[file.path] = strToU8(file.content);
    }
    const zipped = zipSync(fileMap);
    const blob = new Blob([zipped], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${projectTemplate?.slug ?? course.slug}-workspace.zip`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function importWorkspace(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const parsedFiles = parsed.files as Array<{ path: string; content: string }>;
        const next = workspaceFiles.map((existing) => {
          const incoming = parsedFiles.find((item) => item.path === existing.path);
          return incoming ? { ...existing, content: incoming.content } : existing;
        });
        setWorkspaceFiles(next);
        if (projectTemplate) {
          setLearningState((prev) => ({
            ...prev,
            activeProjectSlug: projectTemplate.slug,
            projects: {
              ...prev.projects,
              [projectTemplate.slug]: Object.fromEntries(next.map((wf) => [wf.path, wf.content])),
            },
          }));
        }
        setTerminalOutput('Workspace imported from local snapshot.\nReady.');
      } catch {
        setTerminalOutput('Import failed. Use a workspace .zip or .json exported by this platform.');
      }
    };
    reader.readAsText(file);
  }

  async function runPython(files: VirtualFileTemplate[], target?: string) {
    setIsRunning(true);
    setSuccessMessage('');
    setTerminalOutput('Initializing Pyodide (Python WASM)...\n');
    const t0 = performance.now();
    try {
      await loadScript('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');
      if (!window.loadPyodide) throw new Error('Pyodide loader unavailable.');
      let currentOutput = '';
      const pyodide = await window.loadPyodide({
        stdout: (text: string) => { currentOutput += `${text}\n`; setTerminalOutput((p) => `${p}${text}\n`); },
        stderr: (text: string) => { currentOutput += `${text}\n`; setTerminalOutput((p) => `${p}${text}\n`); },
      });
      setTerminalOutput('Running...\n--- output ---\n');
      files.forEach((file) => { pyodide.FS.writeFile(file.path, file.content); });
      await pyodide.runPythonAsync(`import runpy\nrunpy.run_path("main.py", run_name="__main__")`);
      const elapsed = Math.round(performance.now() - t0);
      setRunMs(elapsed);
      setTerminalOutput((p) => `${p}\n--- done in ${elapsed}ms ---`);
      if (detectValidationSuccess(currentOutput, target)) setSuccessMessage('Validation passed.');
      else if (target) setTerminalOutput((p) => `${p}\nValidation did not match target: "${target}"`);
      return currentOutput;
    } catch (error) {
      setTerminalOutput((p) => `${p}\n[Exception]: ${String(error)}`);
      return '';
    } finally {
      setIsRunning(false);
    }
  }

  function runSourceValidation(patterns: string[] | undefined, message: string) {
    const src = workspaceFiles.map((f) => f.content).join('\n');
    const matched = (patterns ?? []).every((p) => src.includes(p));
    if (matched) {
      setSuccessMessage(message);
      setTerminalOutput(`Source validation passed.\n\n${message}`);
    } else {
      setTerminalOutput(`Validation failed.\n\nExpected patterns not found:\n${(patterns ?? []).map((p) => `  - ${p}`).join('\n')}`);
    }
  }

  async function runValidation() {
    if (projectTemplate) {
      if (projectTemplate.validation.mode === 'source_contains') {
        runSourceValidation(projectTemplate.validation.patterns, projectTemplate.validation.successMessage);
      }
      return;
    }
    if (!currentLab) return;
    if (currentLab.validation.mode === 'python_output') {
      const output = await runPython(workspaceFiles, currentLab.validation.target);
      if (detectValidationSuccess(output, currentLab.validation.target)) {
        setSuccessMessage(currentLab.validation.successMessage);
        module?.tasks.forEach((task) => { if (task.type === 'coding') updateTask(task.id, true); });
      }
      return;
    }
    if (currentLab.validation.mode === 'source_contains') {
      runSourceValidation(currentLab.validation.patterns, currentLab.validation.successMessage);
    }
  }

  function goToNextModule() {
    if (!moduleContext?.next) return;
    router.push(getModuleRoute(course.slug, moduleContext.next.weekSlug, moduleContext.next.moduleSlug));
  }

  function goToPreviousModule() {
    if (!moduleContext?.previous) return;
    router.push(getModuleRoute(course.slug, moduleContext.previous.weekSlug, moduleContext.previous.moduleSlug));
  }

  function handleMonacoBeforeMount(monaco: Monaco) {
    // Themes are cheap to redefine and must survive Next.js hot reloads.
    monaco.editor.defineTheme('portfolio-dark', PORTFOLIO_DARK_THEME as Parameters<typeof monaco.editor.defineTheme>[1]);

    if (window.__learningMonacoRegistered) return;
    window.__learningMonacoRegistered = true;

    const PY_KEYWORDS = [
      'False','None','True','and','as','assert','async','await','break','class',
      'continue','def','del','elif','else','except','finally','for','from',
      'global','if','import','in','is','lambda','not','or','pass','raise',
      'return','try','while','with','yield',
    ];
    const PY_BUILTINS = [
      'abs','all','any','bin','bool','breakpoint','bytearray','bytes','callable',
      'chr','classmethod','compile','complex','delattr','dict','dir','divmod',
      'enumerate','eval','exec','filter','float','format','frozenset','getattr',
      'globals','hasattr','hash','help','hex','id','input','int','isinstance',
      'issubclass','iter','len','list','locals','map','max','memoryview','min',
      'next','object','oct','open','ord','pow','print','property','range',
      'repr','reversed','round','set','setattr','slice','sorted','staticmethod',
      'str','sum','super','tuple','type','vars','zip',
    ];

    // Known Python callables that should always get `(` appended
    const PY_EXCEPTIONS = new Set([
      'ValueError','TypeError','KeyError','IndexError','AttributeError',
      'RuntimeError','NotImplementedError','StopIteration','OSError',
      'IOError','FileNotFoundError','PermissionError','TimeoutError',
      'OverflowError','ZeroDivisionError','AssertionError','ImportError',
      'ModuleNotFoundError','RecursionError','MemoryError','UnicodeError',
      'Exception','BaseException',
    ]);
    const PY_BUILTIN_CALLABLES = new Set([
      'print','len','range','enumerate','zip','map','filter','sorted',
      'reversed','list','dict','set','tuple','str','int','float','bool',
      'bytes','bytearray','type','isinstance','issubclass','hasattr',
      'getattr','setattr','delattr','callable','iter','next','open',
      'abs','round','min','max','sum','any','all','hash','id','repr',
      'format','vars','dir','help','input','chr','ord','hex','bin','oct',
      'pow','divmod','staticmethod','classmethod','property','super',
    ]);

    // ── Provider 1: live document identifiers ──────────────────────────────
    // Scans the current file for every identifier and returns matching ones.
    // Callables (classes, def'd functions, known exceptions) get `(${1})`.
    monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        if (!word.word || word.word.length < 2) return { suggestions: [] };

        const range = {
          startLineNumber: position.lineNumber, endLineNumber: position.lineNumber,
          startColumn: word.startColumn, endColumn: word.endColumn,
        };
        const K = monaco.languages.CompletionItemKind;
        const R = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
        const prefix = word.word.toLowerCase();

        // Extract identifiers from the document; also track which are callable
        const content = model.getValue();
        const identifiers = new Set<string>();
        const definedFunctions = new Set<string>(); // `def name` in content
        const definedClasses = new Set<string>();   // `class Name` in content

        let m: RegExpExecArray | null;
        const idRe = /\b([a-zA-Z_][a-zA-Z0-9_]{1,})\b/g;
        while ((m = idRe.exec(content)) !== null) identifiers.add(m[1]);

        const defRe = /\bdef\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
        while ((m = defRe.exec(content)) !== null) definedFunctions.add(m[1]);

        const clsRe = /\bclass\s+([A-Z][a-zA-Z0-9_]*)\b/g;
        while ((m = clsRe.exec(content)) !== null) definedClasses.add(m[1]);

        identifiers.delete(word.word);

        const docSuggestions = Array.from(identifiers)
          .filter(id => id.toLowerCase().startsWith(prefix))
          .map(id => {
            const isException = PY_EXCEPTIONS.has(id);
            const isBuiltinCallable = PY_BUILTIN_CALLABLES.has(id);
            const isDefinedFn = definedFunctions.has(id);
            const isDefinedClass = definedClasses.has(id) || /^[A-Z]/.test(id);
            const isCallable = isException || isBuiltinCallable || isDefinedFn || isDefinedClass;

            const kind = isException ? K.Class
              : isDefinedClass ? K.Class
              : isDefinedFn ? K.Function
              : isBuiltinCallable ? K.Function
              : K.Variable;

            return {
              label: id,
              kind,
              insertText: isCallable ? `${id}(\${1})` : id,
              insertTextRules: isCallable ? R : undefined,
              range,
              sortText: '0' + id,
              detail: isException ? 'exception' : isDefinedFn ? 'function' : isDefinedClass ? 'class' : 'identifier',
            };
          });

        // Python keywords
        const kwSuggestions = PY_KEYWORDS
          .filter(k => k.startsWith(prefix))
          .map(k => ({
            label: k,
            kind: K.Keyword,
            insertText: k,
            range,
            sortText: '1' + k,
            detail: 'keyword',
          }));

        // Python builtins
        const builtinSuggestions = PY_BUILTIN_CALLABLES.has(prefix)
          ? [] // already covered by doc scan if it appears in file
          : Array.from(PY_BUILTIN_CALLABLES)
              .filter(b => b.startsWith(prefix))
              .map(b => ({
                label: b,
                kind: K.Function,
                insertText: `${b}(\${1})`,
                insertTextRules: R,
                range,
                sortText: '2' + b,
                detail: 'builtin',
              }));

        return { suggestions: [...docSuggestions, ...kwSuggestions, ...builtinSuggestions] };
      },
    });

    // ── Provider 2: ML snippets ────────────────────────────────────────────
    monaco.languages.registerCompletionItemProvider('python', {
      triggerCharacters: ['.', '('],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber, endLineNumber: position.lineNumber,
          startColumn: word.startColumn, endColumn: word.endColumn,
        };
        const K = monaco.languages.CompletionItemKind;
        const R = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
        return {
          suggestions: [
            { label: 'ifmain',          kind: K.Snippet, insertText: 'if __name__ == "__main__":\n    ${1:main()}', insertTextRules: R, detail: 'snippet: Python entrypoint', range, sortText: '3ifmain' },
            { label: 'dataclass',       kind: K.Snippet, insertText: 'from dataclasses import dataclass\n\n@dataclass\nclass ${1:Name}:\n    ${2:field}: ${3:str}', insertTextRules: R, detail: 'snippet: dataclass', range, sortText: '3dataclass' },
            { label: 'dataclass_frozen',kind: K.Snippet, insertText: 'from dataclasses import dataclass\n\n@dataclass(frozen=True)\nclass ${1:Config}:\n    ${2:field}: ${3:str} = ${4:"default"}', insertTextRules: R, detail: 'snippet: frozen config dataclass', range, sortText: '3dataclass_frozen' },
            { label: 'validate_payload',kind: K.Snippet, insertText: 'def validate_payload(raw_data: dict) -> dict:\n    age = raw_data.get("age")\n    if age is not None and age < 0:\n        raise ValueError("Age cannot be negative")\n    features = raw_data.get("features", [])\n    if not all(isinstance(v, float) for v in features):\n        raise ValueError("Features must be floats")\n    return raw_data', insertTextRules: R, detail: 'snippet: ML payload validator', range, sortText: '3validate' },
            { label: 'detect_drift',    kind: K.Snippet, insertText: 'def detect_drift(batch: list[float], baseline: float, threshold: float) -> str:\n    mean = sum(batch) / len(batch)\n    if abs(mean - baseline) > threshold:\n        return "ALERT: drift detected"\n    return "OK: stable"', insertTextRules: R, detail: 'snippet: mean drift detector', range, sortText: '3detect' },
            { label: 'hash_config',     kind: K.Snippet, insertText: 'import hashlib, json\n\ndef hash_config(config: dict) -> str:\n    canonical = json.dumps(config, sort_keys=True).encode("utf-8")\n    return hashlib.sha256(canonical).hexdigest()', insertTextRules: R, detail: 'snippet: config hash', range, sortText: '3hash' },
            { label: 'fastapi_app',     kind: K.Snippet, insertText: 'from fastapi import FastAPI\nfrom pydantic import BaseModel\n\napp = FastAPI()\n\nclass PredictRequest(BaseModel):\n    ${1:features}: list[float]\n\n@app.post("/predict")\ndef predict(payload: PredictRequest):\n    return {"prediction": ${2:None}}', insertTextRules: R, detail: 'snippet: FastAPI serving', range, sortText: '3fastapi' },
            { label: 'train_model',     kind: K.Snippet, insertText: 'from sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.metrics import accuracy_score\n\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\nmodel = LogisticRegression(max_iter=200)\nmodel.fit(X_train, y_train)\nacc = accuracy_score(y_test, model.predict(X_test))\nprint(f"accuracy={acc:.3f}")', insertTextRules: R, detail: 'snippet: sklearn training', range, sortText: '3train' },
            { label: 'dag_runner',      kind: K.Snippet, insertText: 'from collections import deque\n\ndef topological_sort(graph: dict) -> list:\n    in_degree = {node: 0 for node in graph}\n    for deps in graph.values():\n        for dep in deps:\n            in_degree[dep] = in_degree.get(dep, 0) + 1\n    queue = deque([n for n, d in in_degree.items() if d == 0])\n    order = []\n    while queue:\n        node = queue.popleft()\n        order.append(node)\n        for dep in graph.get(node, []):\n            in_degree[dep] -= 1\n            if in_degree[dep] == 0:\n                queue.append(dep)\n    return order', insertTextRules: R, detail: 'snippet: DAG topological sort', range, sortText: '3dag' },
            { label: 'typeddict',       kind: K.Snippet, insertText: 'from typing import TypedDict\n\nclass ${1:Name}(TypedDict):\n    ${2:field}: ${3:str}', insertTextRules: R, detail: 'snippet: TypedDict', range, sortText: '3typeddict' },
          ],
        };
      },
    });

    // ── Provider 3: dict method completions after `.` ──────────────────────
    monaco.languages.registerCompletionItemProvider('python', {
      triggerCharacters: ['.'],
      provideCompletionItems: (model, position) => {
        const lineText = model.getLineContent(position.lineNumber);
        const beforeDot = lineText.slice(0, position.column - 2);
        const varMatch = beforeDot.match(/([a-zA-Z_][a-zA-Z0-9_]*)$/);
        if (!varMatch) return { suggestions: [] };

        const range = {
          startLineNumber: position.lineNumber, endLineNumber: position.lineNumber,
          startColumn: position.column, endColumn: position.column,
        };
        const K = monaco.languages.CompletionItemKind;
        const R = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;

        return {
          suggestions: [
            { label: 'get(key)',          kind: K.Method, insertText: 'get("${1:key}")', insertTextRules: R, detail: 'dict.get(key) → value or None', range },
            { label: 'get(key, default)', kind: K.Method, insertText: 'get("${1:key}", ${2:None})', insertTextRules: R, detail: 'dict.get(key, default)', range },
            { label: 'items()',           kind: K.Method, insertText: 'items()', detail: 'dict key-value pairs', range },
            { label: 'keys()',            kind: K.Method, insertText: 'keys()', detail: 'dict keys', range },
            { label: 'values()',          kind: K.Method, insertText: 'values()', detail: 'dict values', range },
            { label: 'append(item)',      kind: K.Method, insertText: 'append(${1:item})', insertTextRules: R, detail: 'list.append(item)', range },
            { label: 'extend(iterable)', kind: K.Method, insertText: 'extend(${1:iterable})', insertTextRules: R, detail: 'list.extend', range },
            { label: 'split(sep)',        kind: K.Method, insertText: 'split("${1: }")', insertTextRules: R, detail: 'str.split', range },
            { label: 'strip()',           kind: K.Method, insertText: 'strip()', detail: 'str.strip whitespace', range },
            { label: 'lower()',           kind: K.Method, insertText: 'lower()', detail: 'str.lower', range },
            { label: 'upper()',           kind: K.Method, insertText: 'upper()', detail: 'str.upper', range },
            { label: 'encode()',          kind: K.Method, insertText: 'encode("${1:utf-8}")', insertTextRules: R, detail: 'str.encode', range },
            { label: 'hexdigest()',       kind: K.Method, insertText: 'hexdigest()', detail: 'hash.hexdigest()', range },
            { label: 'format()',          kind: K.Method, insertText: 'format(${1:})', insertTextRules: R, detail: 'str.format', range },
          ],
        };
      },
    });

    monaco.languages.registerHoverProvider('python', {
      provideHover(model, position) {
        const currentWord = model.getWordAtPosition(position)?.word;
        if (!currentWord) return null;
        const docs: Record<string, string> = {
          validate_payload: 'Validate untrusted upstream data. Fail loudly at the boundary so corruption never reaches training or serving.',
          detect_drift:     'Compare live batch statistics against a training baseline. This is the core monitoring primitive.',
          hash_config:      'SHA-256 hash a canonicalized config dict — every experiment gets a deterministic identity.',
          isinstance:       '`isinstance(obj, type)` → bool. Use for runtime type checking: `isinstance(x, float)`.',
          all:              '`all(iterable)` → True if every element is truthy. e.g. `all(isinstance(v, float) for v in lst)`',
          any:              '`any(iterable)` → True if at least one element is truthy.',
          FastAPI:          'FastAPI: typed HTTP framework. Validates requests via Pydantic. Use for model-serving APIs.',
        };
        if (!docs[currentWord]) return null;
        const word = model.getWordUntilPosition(position);
        return {
          range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
          contents: [{ value: `**${currentWord}**\n\n${docs[currentWord]}` }],
        };
      },
    });

    // ── Rust completions ───────────────────────────────────────────────────
    monaco.languages.registerCompletionItemProvider('rust', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        if (!word.word || word.word.length < 2) return { suggestions: [] };
        const range = {
          startLineNumber: position.lineNumber, endLineNumber: position.lineNumber,
          startColumn: word.startColumn, endColumn: word.endColumn,
        };
        const K = monaco.languages.CompletionItemKind;
        const R = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
        const prefix = word.word.toLowerCase();

        // Document identifiers for Rust too
        const content = model.getValue();
        const identifiers = new Set<string>();
        const rustIdRe = /\b([a-zA-Z_][a-zA-Z0-9_]{1,})\b/g;
        let rm: RegExpExecArray | null;
        while ((rm = rustIdRe.exec(content)) !== null) identifiers.add(rm[1]);
        identifiers.delete(word.word);
        const docSuggestions = Array.from(identifiers)
          .filter(id => id.toLowerCase().startsWith(prefix))
          .map(id => ({ label: id, kind: K.Variable, insertText: id, range, sortText: '0' + id, detail: 'identifier' }));

        const snippets = [
          { label: 'result_main',  insertText: 'fn main() -> Result<(), Box<dyn std::error::Error>> {\n    ${1:Ok(())}\n}', detail: 'snippet: Result main' },
          { label: 'match',        insertText: 'match ${1:value} {\n    ${2:pattern} => ${3:todo!()},\n    _ => ${4:todo!()},\n}', detail: 'snippet: match expression' },
          { label: 'struct_impl',  insertText: 'struct ${1:Name} {\n    ${2:field}: ${3:f64},\n}\n\nimpl ${1:Name} {\n    fn new(${2:field}: ${3:f64}) -> Self {\n        Self { ${2:field} }\n    }\n}', detail: 'snippet: struct + impl' },
          { label: 'result_fn',    insertText: 'fn ${1:name}(${2:}) -> Result<${3:()}, Box<dyn std::error::Error>> {\n    ${4:todo!()}\n}', detail: 'snippet: Result fn' },
          { label: 'vec_mean',     insertText: 'let mean = values.iter().sum::<f64>() / values.len() as f64;', detail: 'snippet: Vec<f64> mean' },
          { label: 'derive',       insertText: '#[derive(Debug, Clone, PartialEq)]', detail: 'snippet: derive macros' },
          { label: 'enum_error',   insertText: '#[derive(Debug)]\nenum ${1:AppError} {\n    ${2:Io}(String),\n}\nimpl std::fmt::Display for ${1:AppError} {\n    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {\n        match self { ${1:AppError}::${2:Io}(msg) => write!(f, "{}", msg) }\n    }\n}\nimpl std::error::Error for ${1:AppError} {}', detail: 'snippet: custom error enum' },
          { label: 'impl_display', insertText: 'impl std::fmt::Display for ${1:Type} {\n    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {\n        write!(f, "${2:{}}", ${3:self.0})\n    }\n}', detail: 'snippet: Display impl' },
        ].filter(s => s.label.toLowerCase().startsWith(prefix))
         .map(s => ({ ...s, kind: K.Snippet, insertTextRules: R, range, sortText: '3' + s.label }));

        return { suggestions: [...docSuggestions, ...snippets] };
      },
    });
  }

  // Keep runValidationRef current so the keyboard shortcut never has a stale closure
  runValidationRef.current = runValidation;

  const guideMarkdown = module
    ? module.narrative
    : `# ${projectTemplate?.title}\n\n${projectTemplate?.description}\n\nUse this workspace to build outside the daily modules. Save as you go, export snapshots when needed, and treat the file tree like a real working project.`;

  const hasWorkspace = workspaceFiles.length > 0;
  const notesTracker = getStatus('notes', module?.id ?? '');
  const reflectionTracker = getStatus('reflection', module?.id ?? '');
  const codeTracker = getStatus('code', `${currentLab?.id ?? ''}:${activeFile?.path ?? ''}`);

  // Module position within the current week for the position indicator
  const weekModules = week ? (course.weeks.find(w => w.slug === week.slug)?.modules ?? []) : [];
  const modulePosition = weekModules.findIndex(m => m.id === module?.id) + 1;
  const moduleCount = weekModules.length;

  function renderSaveBadge(state: SaveBadgeState, message: string) {
    if (state === 'idle') return null;

    const dotClass =
      state === 'saving'
        ? 'animate-pulse bg-[#61afef]'
        : state === 'saved'
          ? 'bg-[#98c379]'
          : state === 'error'
            ? 'bg-[#e06c75]'
            : 'bg-[#9aa5b1]';

    return (
      <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono ${saveBadgeTone(state)}`}>
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotClass}`} />
        {message}
      </span>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-black text-[#d0ccc4] overflow-hidden pt-11 font-mono">

      {/* ── Header ── */}
      <header className="shrink-0 h-11 bg-black border-b border-[#222222] flex items-center justify-between px-3 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/learning" className="text-[#e8a000] hover:text-[#f0b429] text-xs font-mono transition-colors shrink-0">
            ← courses
          </Link>
          <span className="text-[#555555] text-xs">›</span>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#555555] truncate hidden sm:block">{course.slug}</span>
          {week && <>
            <span className="text-[#555555] text-xs hidden sm:block">›</span>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#777777] truncate hidden md:block">{week.slug}</span>
          </>}
          {module && <>
            <span className="text-[#555555] text-xs hidden md:block">›</span>
            <span className="text-xs text-[#888888] truncate hidden lg:block">{module.title}</span>
          </>}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {sessions.length > 0 && (
            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-[#555555] font-mono">
              {sessions.slice(0, 4).map((s) => (
                <span key={s.id} title={`${s.device_label} · last active ${new Date(s.last_active_at).toLocaleDateString()}`} className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#98c379] inline-block" />
                  <span className="hidden xl:inline">{s.device_label}</span>
                </span>
              ))}
            </div>
          )}
          {status !== 'authenticated' && (
            <span className="text-[10px] font-mono text-[#e5c07b] border border-[#e5c07b]/30 rounded px-2 py-1">local</span>
          )}
        </div>
      </header>

      {/* ── Workspace ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Collapsible Sidebar ── */}
        <aside
          style={{ width: sidebarCollapsed ? 40 : sidebarWidth }}
          className="shrink-0 bg-black flex flex-col overflow-hidden transition-[width] duration-200"
        >
          <div className={`h-9 border-b border-[#222222] flex items-center shrink-0 ${sidebarCollapsed ? 'justify-center' : 'justify-between px-3'}`}>
            {!sidebarCollapsed && (
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#555555]">Curriculum</span>
            )}
            <button
              onClick={() => setSidebarCollapsed((c) => !c)}
              className="w-6 h-6 flex items-center justify-center text-[#555555] hover:text-[#d0ccc4] hover:bg-[#161616] rounded text-sm transition-colors"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? '›' : '‹'}
            </button>
          </div>

          {!sidebarCollapsed && (
            <div className="flex-1 overflow-y-auto py-2">
              {course.weeks.map((courseWeek) => {
                const weekDone = courseWeek.modules.filter(m => getModuleStatus(m.id, m.tasks) === 'completed').length;
                const weekTotal = courseWeek.modules.length;
                const weekPct = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0;
                return (
                  <div key={courseWeek.id} className="px-2 mb-1">
                    <div className="px-2 py-1.5 flex items-center gap-2">
                      <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#555555] flex-1 leading-relaxed">{courseWeek.title ?? courseWeek.slug}</p>
                      {weekDone > 0 && (
                        <span className="text-[9px] font-mono text-[#555555] shrink-0">{weekDone}/{weekTotal}</span>
                      )}
                    </div>
                    {weekDone > 0 && (
                      <div className="mx-2 mb-1.5 h-0.5 rounded-full bg-[#222222] overflow-hidden">
                        <div className="h-full rounded-full bg-[#e8a000]/60 transition-all" style={{ width: `${weekPct}%` }} />
                      </div>
                    )}
                    {courseWeek.modules.map((courseModule) => {
                      const href = getModuleRoute(course.slug, courseWeek.slug, courseModule.slug);
                      const isActive = module?.id === courseModule.id;
                      const mStatus = getModuleStatus(courseModule.id, courseModule.tasks);
                      return (
                        <Link
                          key={courseModule.id}
                          href={href}
                          className={`flex items-center gap-2 border-l px-2 py-1.5 text-xs transition-colors ${isActive ? 'border-[#e8a000] bg-[#111111] text-[#d0ccc4]' : 'border-transparent text-[#777777] hover:border-[#333333] hover:bg-[#111111] hover:text-[#d0ccc4]'}`}
                        >
                          <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${mStatus === 'completed' ? 'bg-[#98c379]' : mStatus === 'in_progress' ? 'bg-[#e5c07b]' : 'bg-[#222222]'}`} />
                          <span className="min-w-0 whitespace-normal break-words leading-5">{courseModule.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </aside>

        <div
          onMouseDown={handleSidebarDragStart}
          className={`group relative shrink-0 w-1 border-r border-[#222222] transition-colors ${sidebarCollapsed ? 'cursor-default' : 'cursor-col-resize hover:border-[#e8a000] active:border-[#e8a000]'}`}
          title={sidebarCollapsed ? 'Expand the curriculum before resizing' : 'Drag to resize curriculum'}
        >
          {!sidebarCollapsed && (
            <span className="absolute left-1/2 top-1/2 h-10 w-1 -translate-x-1/2 -translate-y-1/2 bg-[#333333] opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </div>

        {/* ── Guide Panel ── */}
        <section style={{ width: guidePanelWidth }} className="shrink-0 border-r border-[#222222] bg-black flex flex-col overflow-hidden">
          {/* Module header */}
          <div className="shrink-0 border-b border-[#222222] px-5 pt-4 pb-3">
            {module && (
              <>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#555555] truncate">{week?.title}</p>
                  {moduleCount > 0 && (
                    <span className="text-[9px] font-mono text-[#222222] shrink-0">{modulePosition}/{moduleCount}</span>
                  )}
                </div>
                <h2 className="mt-1.5 text-base font-bold text-[#d0ccc4] leading-snug">{module.title}</h2>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-[#222222] overflow-hidden">
                    <div className="h-full rounded-full bg-[#e8a000] transition-all" style={{ width: `${moduleCompletion}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-[#555555] shrink-0">{moduleCompletion}%</span>
                </div>
              </>
            )}
            {projectTemplate && !module && (
              <>
                <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#555555]">Project workspace</p>
                <h2 className="mt-1.5 text-sm font-semibold text-[#d0ccc4] leading-snug">{projectTemplate.title}</h2>
              </>
            )}
          </div>

          {/* Tabs */}
          <div className="shrink-0 border-b border-[#222222] px-3 py-1.5 flex gap-0.5">
            {(['guide', 'reflection', 'checks'] as const).map((tab) => {
              const hasBadge = tab === 'checks' && module && completedRequired < totalRequired;
              const label = tab === 'guide' ? 'Guide + Notes' : tab === 'reflection' ? 'Reflect' : 'Checks';
              return (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`relative flex items-center gap-1 border-b px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-widest transition-colors ${selectedTab === tab ? 'border-[#e8a000] text-[#e8a000]' : 'border-transparent text-[#777777] hover:text-[#d0ccc4]'}`}
                >
                  {label}
                  {hasBadge && <span className="w-1.5 h-1.5 rounded-full bg-[#e5c07b] shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">

            {(selectedTab === 'guide' || selectedTab === ('notes' as GuideTab)) && (
              <div className="p-5 space-y-5">
                {module && (
                  <div className="border-l border-[#e8a000] bg-[#111111] p-4">
                    <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#e8a000] mb-2">Session brief</p>
                    <p className="text-xs leading-relaxed text-[#d0ccc4]">{module.summary}</p>
                    <div className="mt-4 border-t border-[#222222] pt-3">
                      <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#555555] mb-2">You should leave able to</p>
                      <ul className="space-y-1.5">
                        {module.outcomes.map((outcome) => (
                          <li key={outcome} className="flex gap-2 text-[11px] leading-relaxed text-[#888888]">
                            <span className="text-[#e8a000] shrink-0">&gt;</span>
                            <span>{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {module?.schedule && (
                  <div className="border border-[#222222] bg-[#111111] p-4">
                    <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#e8a000] mb-3">Run of session</p>
                    <ul className="space-y-1.5 text-xs text-[#d0ccc4] leading-relaxed">
                      {module.schedule.map((item) => <li key={item} className="flex gap-2"><span className="text-[#e8a000] shrink-0">›</span><span>{item}</span></li>)}
                    </ul>
                  </div>
                )}

                {currentLab && (
                  <div className="border-l border-[#e8a000] bg-[#111111] p-4">
                    <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#e8a000] mb-2">Applied lab</p>
                    <p className="text-xs font-semibold text-[#d0ccc4] mb-1">{currentLab.title}</p>
                    <p className="text-xs text-[#888888] leading-relaxed">{currentLab.objective}</p>
                  </div>
                )}

                <article className="prose prose-invert prose-xs max-w-none [&_h1]:text-sm [&_h1]:font-semibold [&_h1]:text-[#d0ccc4] [&_h2]:text-xs [&_h2]:font-semibold [&_h2]:text-[#d0ccc4] [&_h3]:text-xs [&_h3]:font-medium [&_h3]:text-[#d0ccc4] [&_p]:text-xs [&_p]:text-[#888888] [&_p]:leading-relaxed [&_li]:text-xs [&_li]:text-[#888888] [&_li]:leading-relaxed [&_strong]:text-[#d0ccc4] [&_code]:text-[#98c379] [&_code]:bg-[#111111] [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[11px] [&_blockquote]:border-l-2 [&_blockquote]:border-[#e8a000] [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-[#777777]">
                  <ReactMarkdown>{guideMarkdown}</ReactMarkdown>
                </article>

                {module?.references && module.references.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#555555]">References</p>
                    {module.references.map((ref) => (
                      <div key={ref.title} className="rounded-lg border border-[#222222] bg-[#111111] p-3">
                        {ref.url ? (
                          <a
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-[#d0ccc4] hover:text-[#e8a000]"
                          >
                            {ref.title}
                          </a>
                        ) : (
                          <p className="text-xs font-medium text-[#d0ccc4]">{ref.title}</p>
                        )}
                        {ref.author && <p className="text-[11px] text-[#555555] mt-0.5">{ref.author}</p>}
                        {ref.note && <p className="mt-1 text-[11px] leading-relaxed text-[#777777]">{ref.note}</p>}
                        <div className="flex gap-2 mt-1">
                          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#555555] border border-[#222222] rounded px-1.5 py-0.5">{ref.kind}</span>
                          {ref.required && <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#e5c07b] border border-[#e5c07b]/30 rounded px-1.5 py-0.5">required</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Inline Notes: edit on top, live preview below ── */}
                {module && (
                  <div className="rounded-xl border border-[#222222] bg-[#111111] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#222222]">
                      <div className="flex items-center gap-2">
                        <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#555555]">Notes</p>
                        {renderSaveBadge(notesTracker.state as SaveBadgeState, notesTracker.message)}
                      </div>
                      <span className="text-[9px] text-[#222222] font-mono">markdown · live preview below</span>
                    </div>

                    {/* Formatting toolbar — always visible */}
                    <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-[#222222] bg-[#0a0a0a] flex-wrap">
                      {[
                        { label: 'B',   title: 'Bold ⌘B',          action: () => insertMarkdown('**', '**', 'bold text'),       cls: 'font-bold' },
                        { label: 'I',   title: 'Italic ⌘I',        action: () => insertMarkdown('*', '*', 'italic text'),        cls: 'italic' },
                        { label: 'H2',  title: 'Heading',           action: () => insertMarkdown('\n## ', '', 'Heading'),         cls: '' },
                        { label: 'H3',  title: 'Sub-heading',       action: () => insertMarkdown('\n### ', '', 'Sub-heading'),    cls: '' },
                        { label: '•',   title: 'Bullet list',       action: () => insertMarkdown('\n- ', '', 'item'),             cls: '' },
                        { label: '1.',  title: 'Numbered list',     action: () => insertMarkdown('\n1. ', '', 'item'),            cls: '' },
                        { label: '[ ]', title: 'Checklist item',    action: () => insertMarkdown('\n- [ ] ', '', 'task'),         cls: 'font-mono text-[10px]' },
                        { label: '`',   title: 'Inline code',       action: () => insertMarkdown('`', '`', 'code'),              cls: 'font-mono' },
                        { label: '```', title: 'Code block',        action: () => insertMarkdown('\n```\n', '\n```', 'code'),     cls: 'font-mono text-[10px]' },
                        { label: '❝',   title: 'Blockquote',        action: () => insertMarkdown('\n> ', '', 'key insight'),      cls: '' },
                        { label: '—',   title: 'Divider',           action: () => insertMarkdown('\n\n---\n\n', '', ''),          cls: '' },
                      ].map(({ label, title, action, cls }) => (
                        <button
                          key={label}
                          onMouseDown={(e) => { e.preventDefault(); action(); }}
                          title={title}
                          className={`px-2 py-1 rounded text-[11px] text-[#777777] hover:text-[#d0ccc4] hover:bg-[#222222] transition-colors ${cls}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* Edit area */}
                    <textarea
                        ref={notesRef}
                        value={learningState.notesByModule[module.id] ?? ''}
                        onChange={(e) => {
                          // Push to undo stack every ~50 chars or on word boundary
                          const prev = learningState.notesByModule[module.id] ?? '';
                          const last = notesUndoStack.current[notesUndoStack.current.length - 1] ?? '';
                          if (Math.abs(e.target.value.length - last.length) > 50 || e.target.value.endsWith(' ') || e.target.value.endsWith('\n')) {
                            notesUndoStack.current.push(prev);
                            notesRedoStack.current = [];
                          }
                          updateNotes(module.id, e.target.value);
                        }}
                        placeholder={'Take notes here — markdown is supported.\n\n## Heading\n- bullet point\n**bold** or *italic*\n`code` or ```code block```\n> blockquote / highlight'}
                        className="w-full min-h-[240px] p-4 text-xs leading-relaxed text-[#d0ccc4] placeholder:text-[#222222] outline-none bg-[#111111] resize-none font-mono"
                        style={{ lineHeight: '1.7' }}
                        onKeyDown={(e) => {
                          const meta = e.metaKey || e.ctrlKey;
                          // Ctrl+Z → undo
                          if (meta && e.key === 'z' && !e.shiftKey) {
                            e.preventDefault();
                            const prev = notesUndoStack.current.pop();
                            if (prev !== undefined) {
                              notesRedoStack.current.push(learningState.notesByModule[module.id] ?? '');
                              updateNotes(module.id, prev);
                            }
                            return;
                          }
                          // Ctrl+Shift+Z or Ctrl+Y → redo
                          if (meta && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                            e.preventDefault();
                            const next = notesRedoStack.current.pop();
                            if (next !== undefined) {
                              notesUndoStack.current.push(learningState.notesByModule[module.id] ?? '');
                              updateNotes(module.id, next);
                            }
                            return;
                          }
                          if (meta && e.key === 'b') { e.preventDefault(); insertMarkdown('**', '**', 'bold text'); }
                          if (meta && e.key === 'i') { e.preventDefault(); insertMarkdown('*', '*', 'italic text'); }
                          if (meta && e.key === 's') { e.preventDefault(); }
                          if (e.key === 'Tab') {
                            e.preventDefault();
                            const el = e.currentTarget;
                            const s = el.selectionStart;
                            const val = el.value;
                            const next = val.slice(0, s) + '  ' + val.slice(el.selectionEnd);
                            notesUndoStack.current.push(val);
                            updateNotes(module.id, next);
                            requestAnimationFrame(() => { el.setSelectionRange(s + 2, s + 2); });
                          }
                          // Enter → auto-continue list items
                          if (e.key === 'Enter') {
                            const el = e.currentTarget;
                            const s = el.selectionStart;
                            const lineStart = el.value.lastIndexOf('\n', s - 1) + 1;
                            const currentLine = el.value.slice(lineStart, s);
                            const bulletMatch = currentLine.match(/^(\s*)([-*+]|\d+\.)\s/);
                            if (bulletMatch) {
                              e.preventDefault();
                              const prefix = bulletMatch[0];
                              const val = el.value;
                              const next = val.slice(0, s) + '\n' + prefix + val.slice(s);
                              notesUndoStack.current.push(val);
                              updateNotes(module.id, next);
                              requestAnimationFrame(() => { el.setSelectionRange(s + 1 + prefix.length, s + 1 + prefix.length); });
                            }
                          }
                        }}
                      />

                    {/* Live preview — always rendered below the edit area */}
                    {learningState.notesByModule[module.id] ? (
                      <article className="px-4 pb-4 pt-3 border-t border-[#222222] prose prose-invert prose-xs max-w-none [&_h2]:text-xs [&_h2]:font-semibold [&_h2]:text-[#d0ccc4] [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-xs [&_h3]:font-medium [&_h3]:text-[#d0ccc4] [&_h3]:mt-2 [&_h3]:mb-1 [&_p]:text-xs [&_p]:text-[#888888] [&_p]:leading-relaxed [&_p]:my-1 [&_li]:text-xs [&_li]:text-[#888888] [&_li]:leading-relaxed [&_strong]:text-[#d0ccc4] [&_em]:text-[#d0ccc4] [&_code]:text-[#98c379] [&_code]:bg-[#0a0a0a] [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[11px] [&_pre]:bg-[#0a0a0a] [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:text-[11px] [&_pre]:overflow-x-auto [&_blockquote]:border-l-2 [&_blockquote]:border-[#e8a000] [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-[#777777] [&_blockquote]:my-2 [&_ul]:my-1 [&_ol]:my-1 [&_hr]:border-[#222222] [&_input[type=checkbox]]:accent-[#e8a000]">
                        <ReactMarkdown>{learningState.notesByModule[module.id]}</ReactMarkdown>
                      </article>
                    ) : null}
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'reflection' && module && (
              <div className="p-5 space-y-4">
                {module.reflectionPrompts.map((prompt, idx) => (
                  <div key={prompt}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-xs font-medium text-[#d0ccc4] leading-relaxed">{prompt}</p>
                      {idx === 0 && renderSaveBadge(reflectionTracker.state as SaveBadgeState, reflectionTracker.message)}
                    </div>
                    <textarea
                      value={learningState.reflectionsByModule[module.id]?.[idx] ?? ''}
                      onChange={(e) => updateReflection(module.id, idx, e.target.value)}
                      placeholder="Direct answer. Name the weak spots, not just the easy parts."
                      className="w-full min-h-[160px] rounded-xl border border-[#222222] bg-[#111111] p-4 text-xs leading-relaxed text-[#d0ccc4] placeholder:text-[#222222] outline-none focus:border-[#e8a000]/50 resize-none"
                    />
                  </div>
                ))}
              </div>
            )}

            {selectedTab === 'checks' && (
              <div className="p-5 space-y-5">
                {module?.tasks && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#555555] mb-3">Tasks · {completedRequired}/{totalRequired} done</p>
                    {module.tasks.map((task) => {
                      const checked = learningState.taskProgress[task.id] === 'completed';
                      return (
                        <label key={task.id} className="flex items-start gap-3 rounded-xl border border-[#222222] bg-[#111111] p-3 cursor-pointer hover:border-[#e8a000]/30 transition-colors">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => updateTask(task.id, e.target.checked)}
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#e8a000]"
                          />
                          <div className="min-w-0">
                            <p className={`text-xs leading-snug ${checked ? 'text-[#555555] line-through' : 'text-[#d0ccc4]'}`}>{task.label}</p>
                            <p className="mt-1 text-[9px] font-mono uppercase tracking-[0.2em] text-[#222222]">{task.type}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}

                {module?.quiz?.[0] && (
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#555555] mb-3">Checkpoint</p>
                    <div className="rounded-xl border border-[#222222] bg-[#111111] p-4">
                      <p className="text-xs font-medium text-[#d0ccc4] mb-3 leading-relaxed">{module.quiz[0].prompt}</p>
                      <div className="space-y-2">
                        {module.quiz[0].options.map((option) => {
                          const selected = learningState.quizAnswers[module.id] === option;
                          return (
                            <button
                              key={option}
                              onClick={() => updateQuizAnswer(module.id, option)}
                              className={`w-full text-left rounded-lg border px-3 py-2.5 text-xs leading-relaxed transition-colors ${selected ? 'border-[#e8a000] bg-[#e8a000]/10 text-[#d0ccc4]' : 'border-[#222222] bg-[#0a0a0a] text-[#888888] hover:border-[#333333]'}`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                      {learningState.quizAnswers[module.id] && (
                        <div className="mt-3 rounded-lg border border-[#222222] p-3 text-xs leading-relaxed">
                          {learningState.quizAnswers[module.id] === module.quiz[0].answer
                            ? <p className="text-[#98c379]">Correct - {module.quiz[0].explanation}</p>
                            : <p className="text-[#e5c07b]">Not quite. Correct: <strong className="text-[#d0ccc4]">{module.quiz[0].answer}</strong>. {module.quiz[0].explanation}</p>
                          }
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {successMessage && (
                  <div className="rounded-xl border border-[#98c379]/30 bg-[#98c379]/5 p-4 text-xs text-[#98c379] leading-relaxed">
                    PASS: {successMessage}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── Drag handle between guide panel and IDE ── */}
        <div
          onMouseDown={handleGuidePanelDragStart}
          className="shrink-0 w-1 bg-[#222222] hover:bg-[#e8a000] active:bg-[#e8a000] cursor-col-resize transition-colors z-10"
          title="Drag to resize panels"
        />

        {/* ── IDE Workspace ── */}
        <section className="flex-1 flex flex-col min-h-0 min-w-0 bg-[#0a0a0a]">

          {/* IDE toolbar */}
          <div className="shrink-0 h-10 bg-[#111111] border-b border-[#222222] flex items-center justify-between px-2 gap-2">
            {/* File tabs */}
            <div className="flex h-full items-end overflow-x-auto hide-scrollbar">
              {workspaceFiles.map((file) => {
                const isActive = file.path === activeFilePath;
                return (
                  <button
                    key={file.path}
                    onClick={() => setActiveFilePath(file.path)}
                    className={`h-9 flex items-center gap-1.5 px-3 text-[11px] font-mono border-t-2 border-r border-r-[#222222] transition-colors shrink-0 ${isActive ? 'bg-[#0a0a0a] text-[#d0ccc4] border-t-[#e8a000]' : 'bg-[#111111] text-[#777777] border-t-transparent hover:text-[#d0ccc4] hover:bg-[#16161650]'}`}
                  >
                    <FileIcon path={file.path} className={`w-3 h-3 shrink-0 ${isActive ? 'text-[#e8a000]' : 'text-[#555555]'}`} />
                    {file.path.split('/').pop()}
                    {file.readOnly && <span className="text-[9px] text-[#222222] font-mono">RO</span>}
                  </button>
                );
              })}
              {workspaceFiles.length === 0 && (
                <span className="px-3 text-[11px] text-[#555555] font-mono">No workspace files</span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              {mode === 'module' && moduleContext?.previous && (
                <button
                  onClick={goToPreviousModule}
                  title={moduleContext.previous.moduleSlug}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-[#777777] hover:text-[#d0ccc4] hover:bg-[#161616] rounded transition-colors border border-[#222222] hover:border-[#333333]"
                >
                  ← Prev
                </button>
              )}
              {mode === 'module' && moduleContext?.next && (
                <button
                  onClick={goToNextModule}
                  title={moduleContext.next.moduleSlug}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-[#777777] hover:text-[#d0ccc4] hover:bg-[#161616] rounded transition-colors border border-[#222222] hover:border-[#333333]"
                >
                  Next →
                </button>
              )}
              {module?.deliverables && course.projects[0] && (
                <Link
                  href={getProjectRoute(course.slug, course.projects[0].slug)}
                  title="Persistent project workspace — build the week's capstone system here"
                  className="px-2.5 py-1 text-[11px] font-mono text-[#777777] hover:text-[#e8a000] border border-[#222222] hover:border-[#e8a000]/50 rounded transition-colors"
                >
                  Project →
                </Link>
              )}
              {activeFile?.solution && (
                <button onClick={revealSolution} className="px-2.5 py-1 text-[11px] font-mono text-[#777777] hover:text-[#e5c07b] border border-[#222222] hover:border-[#e5c07b]/50 rounded transition-colors">
                  Reveal
                </button>
              )}
              {hasWorkspace && (
                <button
                  onClick={runValidation}
                  disabled={isRunning}
                  title="Run (⌘↵)"
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#e8a000] hover:bg-[#f0b429] text-white text-[11px] font-mono font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRunning ? (
                    <><span className="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin shrink-0" />Running</>
                  ) : (
                    <>{projectTemplate ? 'Run checks' : 'Run'}<span className="hidden sm:inline opacity-50 text-[9px]">⌘↵</span></>
                  )}
                </button>
              )}
              <button onClick={downloadWorkspaceAsZip} className="px-2.5 py-1 text-[11px] font-mono text-[#777777] hover:text-[#d0ccc4] border border-[#222222] hover:border-[#333333] rounded transition-colors" title="Download workspace as .zip with real file structure">
                .zip
              </button>
            </div>
          </div>

          {/* Editor + file tree */}
          <div className="flex flex-1 min-h-0 min-w-0">
            {/* File tree */}
            {hasWorkspace && (
              <div className="w-44 shrink-0 border-r border-[#222222] bg-[#111111] flex flex-col overflow-hidden">
                <div className="px-3 py-2 text-[9px] font-mono uppercase tracking-[0.25em] text-[#555555] border-b border-[#222222]">Files</div>
                <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
                  {workspaceFiles.map((file) => {
                    const isActive = file.path === activeFilePath;
                    return (
                      <button
                        key={file.path}
                        onClick={() => setActiveFilePath(file.path)}
                        className={`w-full flex items-start gap-1.5 rounded px-2 py-1.5 text-left transition-colors ${isActive ? 'bg-[#161616] text-[#d0ccc4]' : 'text-[#777777] hover:bg-[#16161650] hover:text-[#d0ccc4]'}`}
                      >
                        <FileIcon path={file.path} className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isActive ? 'text-[#e8a000]' : 'text-[#555555]'}`} />
                        <span className="text-[11px] font-mono leading-snug break-all">{file.path}</span>
                      </button>
                    );
                  })}
                </div>

                {currentLab?.hints && currentLab.hints.length > 0 && (
                  <div className="border-t border-[#222222] p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#555555]">Hints</p>
                      {visibleHintCount < currentLab.hints.length && (
                        <button onClick={() => setVisibleHintCount((n) => n + 1)} className="text-[10px] text-[#e8a000] hover:text-[#f0b429]">+1</button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {currentLab.hints.slice(0, visibleHintCount).map((hint) => (
                        <p key={hint} className="text-[10px] leading-relaxed text-[#888888]">{hint}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Monaco Editor */}
            <div className="flex-1 min-w-0 overflow-hidden">
              {activeFile && monacoReady ? (
                <Editor
                  beforeMount={handleMonacoBeforeMount}
                  path={activeFile.path}
                  language={activeFile.language}
                  theme="portfolio-dark"
                  value={activeFile.content}
                  onChange={(val) => { if (!activeFile.readOnly) updateFile(activeFile.path, val ?? ''); }}
                  options={{
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
                    lineHeight: 1.6 * 13,
                    minimap: { enabled: false },
                    fontLigatures: true,
                    padding: { top: 16, bottom: 16 },
                    scrollBeyondLastLine: false,
                    readOnly: activeFile.readOnly ?? false,
                    tabSize: 4,
                    insertSpaces: true,
                    wordWrap: 'on',
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    renderLineHighlight: 'all',
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
                    suggestOnTriggerCharacters: true,
                    acceptSuggestionOnEnter: 'on',
                    tabCompletion: 'on',
                    wordBasedSuggestions: 'currentDocument',
                    parameterHints: { enabled: true },
                    quickSuggestions: { other: true, comments: false, strings: true },
                    suggest: {
                      showFields: true,
                      showFunctions: true,
                      showVariables: true,
                      showClasses: true,
                      showModules: true,
                      showKeywords: true,
                      showSnippets: true,
                      filterGraceful: true,
                      insertMode: 'replace',
                    },
                    bracketPairColorization: { enabled: true },
                    renderWhitespace: 'selection',
                  }}
                />
              ) : activeFile ? (
                <div className="h-full flex items-center justify-center p-6">
                  <div className="max-w-sm border-l border-[#e8a000] bg-[#111111] p-5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#e8a000]">
                      {monacoError ? 'Editor failed to load' : 'Loading local editor'}
                    </p>
                    <p className="mt-3 text-xs leading-relaxed text-[#888888]">
                      {monacoError || 'Preparing the Monaco runtime from the installed application bundle.'}
                    </p>
                    {monacoError && (
                      <button
                        onClick={() => setMonacoLoadAttempt((attempt) => attempt + 1)}
                        className="mt-4 border border-[#e8a000] px-3 py-1.5 text-[10px] uppercase tracking-widest text-[#e8a000] hover:bg-[#e8a000] hover:text-black"
                      >
                        Retry editor
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center flex-col gap-3">
                  <svg className="w-12 h-12 text-[#222222]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <p className="text-sm text-[#555555] font-mono">Focus on the reading material in the guide panel.</p>
                </div>
              )}
            </div>
          </div>

          {/* Terminal — resizable */}
          {hasWorkspace && (
            <>
              <div
                onMouseDown={handleTerminalDragStart}
                className="shrink-0 h-1 bg-[#222222] hover:bg-[#e8a000] cursor-ns-resize transition-colors"
                title="Drag to resize terminal"
              />
              <div style={{ height: terminalHeight }} className="shrink-0 flex flex-col border-t border-[#222222] bg-[#111111] overflow-hidden">
                <div className="h-8 shrink-0 flex items-center justify-between px-3 border-b border-[#222222]">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#555555]">Output</span>
                    {renderSaveBadge(codeTracker.state as SaveBadgeState, codeTracker.message)}
                    {runMs !== null && <span className="text-[9px] font-mono text-[#555555]">⏱ {runMs}ms</span>}
                  </div>
                  <button onClick={() => { setTerminalOutput('Ready.'); setRunMs(null); }} className="text-[10px] font-mono text-[#555555] hover:text-[#d0ccc4] transition-colors">Clear</button>
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-2" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 12, lineHeight: '20px' }}>
                  {terminalOutput.split('\n').map((line, i) => (
                    <div key={i} className={getTerminalLineColor(line)}>{line || ' '}</div>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
