import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory code execution for demo purposes
// In production, you'd want to use a proper sandboxed execution environment

const executeJavaScript = (code: string, userInputs: string[] = []): string => {
  try {
    // Capture console.log output
    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args) => {
      logs.push(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '))
    }

    // Mock prompt function for user input
    let inputIndex = 0
    const originalPrompt = global.prompt
    global.prompt = (message?: string, _default?: string) => {
      const promptMessage = message || 'Enter input:'
      if (inputIndex < userInputs.length) {
        const input = userInputs[inputIndex]
        inputIndex++
        logs.push(`> ${promptMessage} ${input}`)
        return input
      } else {
        logs.push(`> ${promptMessage} [No input provided]`)
        return null
      }
    }

    // Execute the code
    const result = eval(code)
    
    // Restore original functions
    console.log = originalLog
    global.prompt = originalPrompt

    // Return output
    let output = logs.join('\n')
    if (result !== undefined && !logs.length) {
      output = String(result)
    }
    
    return output || 'Code executed successfully (no output)'
  } catch (error) {
    throw new Error(`JavaScript Error: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const executePython = (code: string): string => {
  // For demo purposes, we'll simulate Python execution
  // In production, you'd use a Python execution service
  try {
    // Simple Python-like syntax simulation
    if (code.includes('print(')) {
      const printMatches = code.match(/print\(([^)]+)\)/g)
      if (printMatches) {
        return printMatches.map(match => 
          match.replace(/print\(|\)/g, '').replace(/['"]/g, '')
        ).join('\n')
      }
    }
    
    // Simulate some basic Python operations
    if (code.includes('for ') && code.includes('range(')) {
      return '0\n1\n2\n3\n4'
    }
    
    return 'Python code executed successfully (simulated)'
  } catch (error) {
    throw new Error(`Python Error: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const executeJava = (code: string): string => {
  // For demo purposes, we'll simulate Java execution
  try {
    if (code.includes('System.out.println')) {
      const printMatches = code.match(/System\.out\.println\(([^)]+)\)/g)
      if (printMatches) {
        return printMatches.map(match => 
          match.replace(/System\.out\.println\(|\)/g, '').replace(/['"]/g, '')
        ).join('\n')
      }
    }
    
    return 'Java code executed successfully (simulated)'
  } catch (error) {
    throw new Error(`Java Error: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const executeCode = (code: string, language: string, userInputs: string[] = []): string => {
  const lang = language.toLowerCase()
  
  switch (lang) {
    case 'javascript':
    case 'js':
      return executeJavaScript(code, userInputs)
    case 'python':
    case 'py':
      return executePython(code)
    case 'java':
      return executeJava(code)
    case 'typescript':
    case 'ts':
      return executeJavaScript(code, userInputs) // TypeScript can be executed as JavaScript for demo
    default:
      throw new Error(`Unsupported language: ${language}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, language, userInputs = [] } = body

    if (!code || !language) {
      return NextResponse.json({ error: 'Code and language are required' }, { status: 400 })
    }

    // Basic security checks
    if (code.length > 10000) {
      return NextResponse.json({ error: 'Code too long (max 10,000 characters)' }, { status: 400 })
    }

    // Block potentially dangerous operations
    const dangerousPatterns = [
      'require(',
      'import(',
      'eval(',
      'Function(',
      'setTimeout',
      'setInterval',
      'process.',
      'fs.',
      'child_process',
      'exec',
      'spawn'
    ]

    const hasDangerousCode = dangerousPatterns.some(pattern => 
      code.toLowerCase().includes(pattern.toLowerCase())
    )

    if (hasDangerousCode) {
      return NextResponse.json({ 
        error: 'Code contains potentially dangerous operations and cannot be executed' 
      }, { status: 400 })
    }

    const output = executeCode(code, language, userInputs)
    
    return NextResponse.json({ output })
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Code execution failed' 
    }, { status: 500 })
  }
}
