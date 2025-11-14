'use client'

import { useState, useRef, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import Editor from '@monaco-editor/react'

interface CodeExecutionProps {
  code: string
  language: string
  title?: string
  description?: string
  executable?: boolean
  height?: string
}

export default function CodeExecution({ 
  code, 
  language, 
  title, 
  description, 
  executable = true,
  height = '400px'
}: CodeExecutionProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [userCode, setUserCode] = useState(code || '// Enter your code here...')
  const [userInputs, setUserInputs] = useState<string[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [showInputDialog, setShowInputDialog] = useState(false)
  const [inputPrompt, setInputPrompt] = useState('')
  const [showCode, setShowCode] = useState(false)

  const executeCode = async () => {
    if (!executable) return
    
    setIsRunning(true)
    setOutput('')
    setError('')

    try {
      const response = await fetch('/api/execute-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: userCode,
          language: language.toLowerCase(),
          userInputs: userInputs
        })
      })

      const result = await response.json()

      if (result.error) {
        setError(result.error)
      } else {
        setOutput(result.output || 'Code executed successfully!')
      }
    } catch (err) {
      setError('Failed to execute code. Please try again.')
      console.error('Code execution error:', err)
    } finally {
      setIsRunning(false)
    }
  }

  const handleInputSubmit = () => {
    if (currentInput.trim()) {
      setUserInputs(prev => [...prev, currentInput])
      setCurrentInput('')
      setShowInputDialog(false)
    }
  }

  const resetInputs = () => {
    setUserInputs([])
    setCurrentInput('')
    setShowInputDialog(false)
  }

  const resetCode = () => {
    setUserCode(code)
    setOutput('')
    setError('')
    resetInputs()
  }

  const copyCode = () => {
    navigator.clipboard.writeText(userCode)
  }

  return (
    <div className="glass-card p-6 my-6">
      {title && (
        <div className="mb-4">
          <h3 className="text-xl font-bold font-mono gradient-text">{title}</h3>
          {description && (
            <p className="text-[var(--muted)] mt-2">{description}</p>
          )}
        </div>
      )}

      <div className="space-y-4">
        {/* Code Editor */}
        <div className="relative">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-mono text-[var(--muted)]">
              {language.toUpperCase()} Code
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCode(!showCode)}
                className="text-xs px-2 py-1 glass rounded hover:bg-[var(--accent)] transition-colors"
                style={{ color: 'var(--muted)' }}
              >
                {showCode ? 'Hide Code' : 'Show Code'}
              </button>
              {showCode && (
                <>
                  <button
                    onClick={copyCode}
                    className="text-xs px-2 py-1 glass rounded hover:bg-[var(--accent)] transition-colors"
                    style={{ color: 'var(--muted)' }}
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs px-2 py-1 glass rounded hover:bg-[var(--accent)] transition-colors"
                    style={{ color: 'var(--muted)' }}
                  >
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </button>
                </>
              )}
            </div>
          </div>

          {showCode ? (
            <div className="relative">
              <div 
                className="w-full border border-[var(--glass-border)] rounded-lg overflow-hidden"
                style={{ 
                  minHeight: isExpanded ? height : '200px',
                  maxHeight: isExpanded ? '600px' : '300px'
                }}
              >
              <Editor
                height={isExpanded ? '600px' : '200px'}
                defaultLanguage={language}
                value={userCode}
                onChange={(value) => setUserCode(value || '')}
                theme="vs-dark"
                loading={<div className="flex items-center justify-center h-48 text-[var(--muted)]">
                  <div className="text-center">
                    <div className="animate-spin w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p>Loading editor...</p>
                  </div>
                </div>}
                beforeMount={(monaco) => {
                  // Configure Monaco for better IntelliSense
                  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                    target: monaco.languages.typescript.ScriptTarget.ES2020,
                    allowNonTsExtensions: true,
                    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                    module: monaco.languages.typescript.ModuleKind.CommonJS,
                    noEmit: true,
                    esModuleInterop: true,
                    jsx: monaco.languages.typescript.JsxEmit.React,
                    reactNamespace: 'React',
                    allowJs: true,
                    typeRoots: ['node_modules/@types']
                  })

                  // Add extra libraries for better IntelliSense
                  monaco.languages.typescript.javascriptDefaults.addExtraLib(`
                    declare var console: {
                      log(...data: any[]): void;
                      error(...data: any[]): void;
                      warn(...data: any[]): void;
                      info(...data: any[]): void;
                      debug(...data: any[]): void;
                    };
                    
                    declare var setTimeout: (callback: () => void, delay: number) => number;
                    declare var setInterval: (callback: () => void, delay: number) => number;
                    declare var clearTimeout: (id: number) => void;
                    declare var clearInterval: (id: number) => void;
                    
                    declare var Math: {
                      random(): number;
                      floor(x: number): number;
                      ceil(x: number): number;
                      round(x: number): number;
                      abs(x: number): number;
                      max(...values: number[]): number;
                      min(...values: number[]): number;
                      sqrt(x: number): number;
                      pow(x: number, y: number): number;
                    };
                    
                    declare var Array: {
                      from<T>(arrayLike: ArrayLike<T>): T[];
                      isArray(arg: any): arg is any[];
                    };
                    
                    declare var Object: {
                      keys(o: object): string[];
                      values(o: object): any[];
                      entries(o: object): [string, any][];
                    };
                  `, 'globals.d.ts')

                  // Define custom theme
                  monaco.editor.defineTheme('custom-dark', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [],
                    colors: {
                      'editor.background': '#1a1a1a',
                      'editor.foreground': '#f8f6f0',
                      'editorLineNumber.foreground': '#666666',
                      'editorLineNumber.activeForeground': '#999999',
                      'editor.selectionBackground': '#264f78',
                      'editor.selectionHighlightBackground': '#264f78',
                      'editorCursor.foreground': '#d4a574',
                      'editorWhitespace.foreground': '#404040',
                      'editorIndentGuide.background': '#404040',
                      'editorIndentGuide.activeBackground': '#666666'
                    }
                  })
                }}
                onMount={(editor, monaco) => {
                  monaco.editor.setTheme('custom-dark')
                  
                  // Enable IntelliSense
                  editor.updateOptions({
                    suggestOnTriggerCharacters: true,
                    acceptSuggestionOnEnter: 'on',
                    tabCompletion: 'on',
                    wordBasedSuggestions: 'off'
                  })
                }}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  lineNumbers: 'on',
                  wordWrap: 'on',
                  automaticLayout: true,
                  tabSize: 2,
                  insertSpaces: true,
                  renderWhitespace: 'selection',
                  contextmenu: true,
                  mouseWheelZoom: true,
                  suggestOnTriggerCharacters: true,
                  acceptSuggestionOnEnter: 'on',
                  tabCompletion: 'on',
                  wordBasedSuggestions: 'off',
                  suggest: {
                    showKeywords: true,
                    showSnippets: true,
                    showFunctions: true,
                    showConstructors: true,
                    showFields: true,
                    showVariables: true,
                    showClasses: true,
                    showStructs: true,
                    showInterfaces: true,
                    showModules: true,
                    showProperties: true,
                    showEvents: true,
                    showOperators: true,
                    showUnits: true,
                    showValues: true,
                    showConstants: true,
                    showEnums: true,
                    showEnumMembers: true,
                    showColors: true,
                    showFiles: true,
                    showReferences: true,
                    showFolders: true,
                    showTypeParameters: true,
                    showIssues: true,
                    showUsers: true,
                    showWords: true
                  },
                  quickSuggestions: {
                    other: true,
                    comments: true,
                    strings: true
                  },
                  parameterHints: {
                    enabled: true
                  },
                  hover: {
                    enabled: true
                  },
                  formatOnPaste: true,
                  formatOnType: true,
                  bracketPairColorization: {
                    enabled: true
                  },
                  guides: {
                    bracketPairs: true,
                    indentation: true
                  }
                }}
              />
              </div>
            </div>
          ) : (
            <div className="w-full border border-[var(--glass-border)] rounded-lg p-4 bg-[var(--background)] text-center">
              <p className="text-[var(--muted)] text-sm">
                Click "Show Code" to view and edit the code
              </p>
            </div>
          )}
        </div>

        {/* User Inputs Section */}
        {executable && userCode.includes('prompt(') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-mono font-semibold" style={{ color: 'var(--foreground)' }}>
                User Inputs ({userInputs.length})
              </h4>
              <button
                onClick={() => setShowInputDialog(true)}
                className="text-xs px-2 py-1 glass rounded hover:bg-[var(--accent)] transition-colors"
                style={{ color: 'var(--muted)' }}
              >
                Add Input
              </button>
            </div>
            
            {userInputs.length > 0 && (
              <div className="space-y-2">
                {userInputs.map((input, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 glass rounded">
                    <span className="text-xs font-mono text-[var(--muted)]">Input {index + 1}:</span>
                    <span className="text-sm">{input}</span>
                    <button
                      onClick={() => setUserInputs(prev => prev.filter((_, i) => i !== index))}
                      className="text-xs text-red-400 hover:text-red-300 ml-auto"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={resetInputs}
                  className="text-xs px-2 py-1 glass rounded hover:bg-red-500 transition-colors text-red-400 hover:text-white"
                >
                  Clear All Inputs
                </button>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {executable && (
          <div className="flex gap-3">
            <button
              onClick={executeCode}
              disabled={isRunning}
              className="btn btn-primary flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Running...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" />
                  </svg>
                  Run Code
                </>
              )}
            </button>
            
            <button
              onClick={resetCode}
              className="btn btn-secondary"
            >
              Reset
            </button>
          </div>
        )}

        {/* Output */}
        {(output || error) && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-mono text-[var(--muted)]">
                Output
              </span>
              <button
                onClick={() => {
                  setOutput('')
                  setError('')
                }}
                className="text-xs px-2 py-1 glass rounded hover:bg-[var(--accent)] transition-colors"
                style={{ color: 'var(--muted)' }}
              >
                Clear
              </button>
            </div>
            
            <div className="bg-[var(--background)] border border-[var(--glass-border)] rounded-lg p-4">
              <pre className="text-sm font-mono whitespace-pre-wrap">
                {error ? (
                  <span className="text-red-400">❌ Error: {error}</span>
                ) : (
                  <span className="text-green-400">✅ {output}</span>
                )}
              </pre>
            </div>
          </div>
        )}


        {/* Input Dialog */}
        {showInputDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="glass-card p-6 max-w-md mx-4">
              <h3 className="text-lg font-bold font-mono mb-4 gradient-text">
                Add User Input
              </h3>
              <p className="text-[var(--muted)] mb-4">
                Enter the input value that will be provided when the code calls <code>prompt()</code>:
              </p>
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                className="w-full px-4 py-2 glass rounded-lg border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none mb-4"
                placeholder="Enter input value..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleInputSubmit()
                  } else if (e.key === 'Escape') {
                    setShowInputDialog(false)
                    setCurrentInput('')
                  }
                }}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleInputSubmit}
                  disabled={!currentInput.trim()}
                  className="btn btn-primary"
                >
                  Add Input
                </button>
                <button
                  onClick={() => {
                    setShowInputDialog(false)
                    setCurrentInput('')
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
