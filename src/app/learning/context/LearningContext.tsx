'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type ModuleProgress = 'locked' | 'not_started' | 'in_progress' | 'completed';

interface FileSystem {
  [path: string]: string;
}

interface LearningState {
  progress: Record<string, ModuleProgress>;
  // Virtual File System for the IDE
  files: Record<string, FileSystem>; // moduleId -> FileSystem
  activeFile: Record<string, string>; // moduleId -> activePath
  activeModuleId: string;
}

interface LearningContextType {
  state: LearningState;
  updateProgress: (moduleId: string, status: ModuleProgress) => void;
  updateFile: (moduleId: string, path: string, content: string) => void;
  setActiveFile: (moduleId: string, path: string) => void;
  setActiveModule: (moduleId: string) => void;
  unlockNextModule: (currentModuleId: string) => void;
}

const defaultState: LearningState = {
  progress: {
    'day-1': 'not_started',
    'day-2': 'locked',
    'day-3': 'locked',
    'day-4': 'locked',
    'day-5': 'locked',
    'weekend-sat': 'locked',
    'weekend-sun': 'locked',
  },
  files: {},
  activeFile: {},
  activeModuleId: 'day-1',
};

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export function LearningProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LearningState>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('learning_state_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed);
      } catch (e) {
        console.error('Failed to parse learning state', e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('learning_state_v2', JSON.stringify(state));
    }
  }, [state, isLoaded]);

  const updateProgress = (moduleId: string, status: ModuleProgress) => {
    setState((prev) => ({
      ...prev,
      progress: { ...prev.progress, [moduleId]: status },
    }));
  };

  const updateFile = (moduleId: string, path: string, content: string) => {
    setState((prev) => {
      const moduleFiles = prev.files[moduleId] || {};
      return {
        ...prev,
        files: {
          ...prev.files,
          [moduleId]: { ...moduleFiles, [path]: content },
        },
      };
    });
  };

  const setActiveFile = (moduleId: string, path: string) => {
    setState((prev) => ({
      ...prev,
      activeFile: { ...prev.activeFile, [moduleId]: path },
    }));
  };

  const setActiveModule = (moduleId: string) => {
    setState((prev) => ({
      ...prev,
      activeModuleId: moduleId,
    }));
  };

  const unlockNextModule = (currentModuleId: string) => {
    const keys = Object.keys(state.progress);
    const currentIndex = keys.indexOf(currentModuleId);
    if (currentIndex !== -1 && currentIndex < keys.length - 1) {
      const nextId = keys[currentIndex + 1];
      setState((prev) => ({
        ...prev,
        progress: {
          ...prev.progress,
          [currentModuleId]: 'completed',
          [nextId]: prev.progress[nextId] === 'locked' ? 'not_started' : prev.progress[nextId],
        },
      }));
    }
  };

  return (
    <LearningContext.Provider value={{ 
      state, 
      updateProgress, 
      updateFile, 
      setActiveFile, 
      setActiveModule,
      unlockNextModule 
    }}>
      {children}
    </LearningContext.Provider>
  );
}

export function useLearning() {
  const context = useContext(LearningContext);
  if (context === undefined) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
}
