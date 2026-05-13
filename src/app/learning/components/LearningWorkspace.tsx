'use client';

import { useState, useEffect, useRef } from 'react';
import { useLearning } from '../context/LearningContext';
import { mlopsWeek1, CourseDay } from '../data/mlopsWeek1';
import ReactMarkdown from 'react-markdown';
import Editor from '@monaco-editor/react';

// Script loader for Pyodide
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
}

type SidebarState = 'curriculum' | 'explorer' | 'none';

export default function LearningWorkspace() {
  const { state, updateProgress, updateFile, setActiveFile, unlockNextModule, setActiveModule } = useLearning();
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Layout State
  const [sidebarState, setSidebarState] = useState<SidebarState>('curriculum');
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);

  const activeModuleId = state.activeModuleId;
  const activeContentIndex = mlopsWeek1.findIndex(m => m.id === activeModuleId);
  const activeContent = activeContentIndex !== -1 ? mlopsWeek1[activeContentIndex] : mlopsWeek1[0];
  
  const activeFilePath = state.activeFile[activeContent.id] || activeContent.files?.[0]?.path || '';
  const currentFileMeta = activeContent.files?.find(f => f.path === activeFilePath);
  const activeCode = state.files[activeContent.id]?.[activeFilePath] ?? currentFileMeta?.content ?? '';

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalEndRef.current && isTerminalOpen) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output, isTerminalOpen]);

  // When a new day loads, auto-open the curriculum
  useEffect(() => {
    setSidebarState('curriculum');
  }, [activeContent.id]);

  const handleRunCode = async () => {
    setIsTerminalOpen(true);
    setIsRunning(true);
    setOutput('Initializing Pyodide (Python WebAssembly)...\\n');
    setSuccessMessage('');
    
    try {
      let fullCode = '';
      if (activeContent.files) {
         const sortedFiles = [...activeContent.files].sort((a, b) => a.path === 'main.py' ? 1 : b.path === 'main.py' ? -1 : 0);
         
         fullCode += `
import sys
from unittest.mock import MagicMock
sys.modules['data_contract'] = MagicMock()
sys.modules['monitor'] = MagicMock()
`;

         sortedFiles.forEach(f => {
            const code = state.files[activeContent.id]?.[f.path] ?? f.content;
            const cleanedCode = code.split('\\n').filter(line => !line.startsWith('from data_contract') && !line.startsWith('from monitor')).join('\\n');
            fullCode += `\\n# --- ${f.path} ---\\n` + cleanedCode + '\\n';
         });
      }

      await loadScript('https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js');
      
      let currentOutput = '';
      
      // @ts-ignore
      const pyodide = await window.loadPyodide({
        stdout: (text: string) => {
          currentOutput += text + '\\n';
          setOutput((prev) => prev + text + '\\n');
        },
        stderr: (text: string) => {
          currentOutput += text + '\\n';
          setOutput((prev) => prev + text + '\\n');
        },
      });
      
      setOutput('Running Code...\\n------------------------\\n');
      await pyodide.runPythonAsync(fullCode);
      
      if (activeContent.validation) {
        if (activeContent.validation.type === 'output_match') {
          if (currentOutput.includes(activeContent.validation.target)) {
            setSuccessMessage(activeContent.validation.successMessage);
            updateProgress(activeContent.id, 'completed');
            activeContent.tasks.forEach(t => updateProgress(t.id, 'completed'));
            // Auto-switch to curriculum to see the success message
            setSidebarState('curriculum');
          }
        }
      }

    } catch (err) {
      setOutput((prev) => prev + '\\n[Exception]: ' + String(err));
    } finally {
      setIsRunning(false);
    }
  };

  const handleRevealSolution = () => {
    if (currentFileMeta?.solution) {
      updateFile(activeContent.id, activeFilePath, currentFileMeta.solution);
    }
  };

  const handleNextDay = () => {
    unlockNextModule(activeContent.id);
    if (activeContentIndex < mlopsWeek1.length - 1) {
      setActiveModule(mlopsWeek1[activeContentIndex + 1].id);
      setSuccessMessage('');
      setOutput('');
    }
  };

  const handlePrevDay = () => {
    if (activeContentIndex > 0) {
      setActiveModule(mlopsWeek1[activeContentIndex - 1].id);
      setSuccessMessage('');
      setOutput('');
    }
  };

  const toggleSidebar = (state: SidebarState) => {
    setSidebarState(prev => prev === state ? 'none' : state);
  };

  return (
    <div className="flex w-full h-full text-[#c9d1d9] bg-[#0d1117] font-sans overflow-hidden">
      
      {/* 1. Activity Bar (Leftmost) */}
      <div className="w-14 shrink-0 bg-[#010409] border-r border-[#30363d] flex flex-col items-center py-4 gap-4 z-10">
        <button 
          onClick={() => toggleSidebar('curriculum')}
          className={`p-3 rounded-xl transition-colors \${sidebarState === 'curriculum' ? 'bg-[#1f6feb] text-white' : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]'}`}
          title="Curriculum"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </button>
        {activeContent.files && activeContent.files.length > 0 && (
          <button 
            onClick={() => toggleSidebar('explorer')}
            className={`p-3 rounded-xl transition-colors \${sidebarState === 'explorer' ? 'bg-[#1f6feb] text-white' : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]'}`}
            title="Explorer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </button>
        )}
      </div>

      {/* 2. Dynamic Sidebar (Curriculum or Explorer) */}
      {sidebarState !== 'none' && (
        <div className="w-[400px] shrink-0 border-r border-[#30363d] bg-[#0d1117] flex flex-col h-full overflow-hidden shadow-2xl z-0 relative">
          
          {sidebarState === 'curriculum' && (
            <>
              {/* Navigation Header */}
              <div className="h-14 border-b border-[#30363d] bg-[#161b22] flex items-center justify-between px-4 shrink-0">
                <button 
                  onClick={handlePrevDay} 
                  disabled={activeContentIndex === 0}
                  className="px-2 py-1 text-xs font-mono text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d] rounded disabled:opacity-30 transition-colors"
                >
                  ← Prev
                </button>
                <span className="text-[10px] font-mono font-bold text-[#1f6feb] uppercase tracking-widest">
                  {activeContent.id}
                </span>
                <button 
                  onClick={handleNextDay} 
                  disabled={activeContentIndex === mlopsWeek1.length - 1}
                  className="px-2 py-1 text-xs font-mono text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d] rounded disabled:opacity-30 transition-colors"
                >
                  Next →
                </button>
              </div>

              {/* Reading Material */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                <div className="mb-6">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#8b949e] mb-2 block uppercase">
                    {activeContent.duration} MODULE
                  </span>
                  <h1 className="text-2xl font-bold font-sans text-[#e6edf3] leading-tight tracking-tight">
                    {activeContent.title}
                  </h1>
                </div>
                
                <div className="prose prose-invert prose-sm max-w-none prose-headings:font-sans prose-headings:text-[#e6edf3] prose-headings:font-semibold prose-a:text-[#58a6ff] prose-code:text-[#ff7b72] prose-code:bg-[#161b22] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-[#30363d] prose-strong:text-[#c9d1d9] mb-10 leading-relaxed">
                  <ReactMarkdown>{activeContent.content}</ReactMarkdown>
                </div>

                <div className="bg-[#161b22] rounded-xl border border-[#30363d] p-5 mb-8">
                  <h3 className="font-mono text-xs font-bold text-[#8b949e] mb-4 uppercase tracking-widest">Objectives</h3>
                  <div className="space-y-3">
                    {activeContent.tasks.map((task) => {
                      const isCompleted = state.progress[task.id] === 'completed';
                      return (
                        <label key={task.id} className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={(e) => updateProgress(task.id, e.target.checked ? 'completed' : 'not_started')}
                            className="mt-1 shrink-0 accent-[#238636] bg-[#0d1117] border-[#30363d] rounded-sm"
                          />
                          <span className={`text-sm leading-snug \${isCompleted ? 'text-[#8b949e] line-through' : 'text-[#c9d1d9] group-hover:text-[#e6edf3]'}`}>
                            {task.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {successMessage && (
                  <div className="bg-[#238636]/10 border border-[#238636]/30 rounded-xl p-5 animate-pulse">
                    <p className="text-[#3fb950] font-mono text-xs mb-4 leading-relaxed">■ {successMessage}</p>
                    <button 
                      onClick={handleNextDay}
                      className="bg-[#238636] text-white font-bold font-mono text-xs px-6 py-2.5 rounded-lg hover:bg-[#2ea043] transition-colors w-full uppercase tracking-widest shadow-sm"
                    >
                      Advance Module →
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {sidebarState === 'explorer' && activeContent.files && (
            <>
              <div className="h-10 flex items-center px-4 uppercase tracking-widest text-[10px] font-mono text-[#8b949e] font-bold border-b border-[#30363d] bg-[#161b22]">
                Explorer
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                {activeContent.files.map((file) => {
                  const isActive = file.path === activeFilePath;
                  return (
                    <button
                      key={file.path}
                      onClick={() => setActiveFile(activeContent.id, file.path)}
                      className={`w-full text-left px-4 py-2 text-sm font-mono flex items-center gap-3 \${
                        isActive 
                          ? 'bg-[#1f6feb]/10 text-[#58a6ff] border-l-2 border-[#1f6feb]' 
                          : 'text-[#8b949e] hover:bg-[#161b22] hover:text-[#c9d1d9] border-l-2 border-transparent'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {file.path}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* 3. Main Area (Editor & Terminal) */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#010409]">
        
        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* File Tabs & Action Toolbar */}
          <div className="h-12 bg-[#0d1117] border-b border-[#30363d] flex items-center justify-between pr-4 select-none">
            
            {/* Tabs */}
            <div className="flex h-full overflow-x-auto hide-scrollbar">
              {activeContent.files ? activeContent.files.map((file) => {
                const isActive = file.path === activeFilePath;
                return (
                  <button
                    key={file.path}
                    onClick={() => setActiveFile(activeContent.id, file.path)}
                    className={`h-full px-5 flex items-center gap-2 border-r border-[#30363d] text-xs font-mono transition-colors \${
                      isActive 
                        ? 'bg-[#010409] text-[#e6edf3] border-t-2 border-t-[#1f6feb]' 
                        : 'bg-[#0d1117] text-[#8b949e] border-t-2 border-t-transparent hover:bg-[#161b22]'
                    }`}
                  >
                    {file.path}
                    {file.readOnly && <span className="opacity-50 ml-1 text-[9px]">(RO)</span>}
                  </button>
                );
              }) : (
                <div className="h-full px-5 flex items-center text-xs font-mono text-[#8b949e]">
                  No Workspace Files
                </div>
              )}
            </div>

            {/* Actions */}
            {activeContent.files && (
              <div className="flex items-center gap-3 shrink-0 pl-4">
                {currentFileMeta?.solution && (
                  <button
                    onClick={handleRevealSolution}
                    className="px-3 py-1.5 text-[11px] font-mono text-[#8b949e] hover:text-[#c9d1d9] border border-[#30363d] rounded-md transition-colors"
                  >
                    Reveal Solution
                  </button>
                )}
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md text-[11px] font-mono font-bold uppercase tracking-wide flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isRunning ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Executing
                    </>
                  ) : (
                    '▶ Run System'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Monaco Editor Canvas */}
          <div className="flex-1 relative min-h-0 w-full h-full overflow-hidden bg-[#010409]">
            {activeContent.files ? (
              <Editor
                height="100%"
                language={currentFileMeta?.language || 'python'}
                theme="vs-dark"
                value={activeCode}
                onChange={(val) => {
                  if (!currentFileMeta?.readOnly) {
                    updateFile(activeContent.id, activeFilePath, val || '');
                  }
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 15,
                  lineHeight: 24,
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'Menlo', monospace",
                  padding: { top: 24, bottom: 24 },
                  scrollBeyondLastLine: false,
                  readOnly: currentFileMeta?.readOnly || false,
                  suggestOnTriggerCharacters: true,
                  quickSuggestions: true,
                  parameterHints: { enabled: true },
                  wordWrap: 'on',
                  renderLineHighlight: 'all',
                  scrollbar: {
                    verticalScrollbarSize: 10,
                    horizontalScrollbarSize: 10,
                  }
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-[#30363d] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="text-[#8b949e] font-mono text-sm">Focus on the reading materials.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Terminal Area */}
        {activeContent.files && (
          <div className={`flex flex-col shrink-0 border-t border-[#30363d] bg-[#0d1117] transition-all duration-300 ${isTerminalOpen ? 'h-36' : 'h-10'}`}>
            
            {/* Terminal Header */}
            <div className="h-10 flex items-center px-4 justify-between select-none shrink-0">
              <div className="flex gap-6 h-full">
                <button 
                  onClick={() => setIsTerminalOpen(true)}
                  className={`h-full text-[11px] font-mono font-bold tracking-widest uppercase border-b-2 transition-colors \${isTerminalOpen ? 'border-[#1f6feb] text-[#c9d1d9]' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'}`}
                >
                  Output
                </button>
              </div>
              <div className="flex items-center gap-3">
                {isTerminalOpen && (
                  <button 
                    onClick={() => setOutput('')} 
                    className="text-[11px] font-mono text-[#8b949e] hover:text-[#c9d1d9] transition-colors"
                  >
                    Clear
                  </button>
                )}
                <button 
                  onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                  className="text-[#8b949e] hover:text-[#c9d1d9] transition-colors"
                  title={isTerminalOpen ? "Collapse Terminal" : "Expand Terminal"}
                >
                  <svg className={`w-4 h-4 transform transition-transform \${isTerminalOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Terminal Canvas */}
            {isTerminalOpen && (
              <div className="flex-1 p-4 overflow-y-auto bg-[#010409] font-mono text-[13px] leading-relaxed scrollbar-thin">
                {output ? (
                  <pre className="text-[#c9d1d9] whitespace-pre-wrap">{output}</pre>
                ) : (
                  <div className="text-[#8b949e] italic flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#30363d] animate-pulse"></span>
                    Ready for execution...
                  </div>
                )}
                <div ref={terminalEndRef} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
