import { useCallback, useRef, useState } from 'react';

type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

export function useAutoSave(courseSlug: string, moduleId: string = '', delay = 1500) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track status for notes, reflection, and code files individually
  const [statusMap, setStatusMap] = useState<Record<string, SaveStatus>>({});

  const setStatus = (key: string, status: SaveStatus) => {
    setStatusMap(prev => ({ ...prev, [key]: status }));
    if (status === 'saved') {
      setTimeout(() => {
        setStatusMap(prev => prev[key] === 'saved' ? { ...prev, [key]: 'idle' } : prev);
      }, 2000);
    }
  };

  const saveNotes = useCallback(
    (noteType: 'notes' | 'reflection', content: string) => {
      const key = `${noteType}-${moduleId}`;
      setStatus(key, 'unsaved');
      
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        setStatus(key, 'saving');
        try {
          const res = await fetch('/api/learning/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseSlug, moduleId, noteType, content }),
          });
          if (!res.ok) throw new Error('Failed to save');
          setStatus(key, 'saved');
        } catch (e) {
          console.error('Failed to auto-save notes', e);
          setStatus(key, 'error');
        }
      }, delay);
    },
    [courseSlug, moduleId, delay]
  );

  const saveCode = useCallback(
    (labId: string, path: string, content: string) => {
      const key = `code-${labId}-${path}`;
      setStatus(key, 'unsaved');
      
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        setStatus(key, 'saving');
        try {
          const res = await fetch('/api/learning/code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseSlug, moduleId, labId, path, content }),
          });
          if (!res.ok) throw new Error('Failed to save code');
          setStatus(key, 'saved');
        } catch (e) {
          console.error('Failed to auto-save code', e);
          setStatus(key, 'error');
        }
      }, delay);
    },
    [courseSlug, moduleId, delay]
  );

  const saveTask = useCallback(
    async (taskId: string, taskStatus: 'completed' | 'not_started') => {
      const key = `task-${taskId}`;
      setStatus(key, 'saving');
      try {
        const res = await fetch('/api/learning/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseSlug, taskId, status: taskStatus }),
        });
        if (!res.ok) throw new Error('Failed to save task');
        setStatus(key, 'saved');
      } catch (e) {
        console.error('Failed to save task', e);
        setStatus(key, 'error');
      }
    },
    [courseSlug]
  );

  const getStatus = useCallback((type: 'notes' | 'reflection' | 'code', identifier: string) => {
    let state: SaveStatus = 'idle';
    if (type === 'notes' || type === 'reflection') {
      state = statusMap[`${type}-${identifier}`] || 'idle';
    } else {
      state = statusMap[`code-${identifier}`] || 'idle';
    }
    
    let message = '';
    if (state === 'unsaved') message = 'Unsaved changes';
    else if (state === 'saving') message = 'Saving...';
    else if (state === 'saved') message = 'Saved';
    else if (state === 'error') message = 'Save failed';
    
    return { state, message };
  }, [statusMap]);

  return { saveNotes, saveCode, saveTask, getStatus };
}
