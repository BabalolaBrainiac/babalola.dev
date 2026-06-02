import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const executeJavaScript = (code: string, userInputs: string[] = []): string => {
  const logs: string[] = []
  let inputIndex = 0

  const promptPattern = /prompt\((['"`])([^'"`]*)\1\)/g
  code.replace(promptPattern, (_match, _quote, message) => {
    const input = inputIndex < userInputs.length ? userInputs[inputIndex++] : '[No input provided]'
    logs.push(`> ${message || 'Enter input:'} ${input}`)
    return ''
  })

  const consolePattern = /console\.log\(([^;]*)\)/g
  let match: RegExpExecArray | null
  while ((match = consolePattern.exec(code)) !== null) {
    const expression = match[1].trim()
    const quoted = expression.match(/^(['"`])([\s\S]*)\1$/)
    logs.push(quoted ? quoted[2] : expression)
  }

  return logs.join('\n') || 'JavaScript preview completed. Server-side execution is disabled.'
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
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { code, language, userInputs = [] } = body

    if (typeof code !== 'string' || typeof language !== 'string' || !code || !language) {
      return NextResponse.json({ error: 'Code and language are required' }, { status: 400 })
    }

    if (!Array.isArray(userInputs) || userInputs.some(input => typeof input !== 'string')) {
      return NextResponse.json({ error: 'userInputs must be an array of strings' }, { status: 400 })
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
