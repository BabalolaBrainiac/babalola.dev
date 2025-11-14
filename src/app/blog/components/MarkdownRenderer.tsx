'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import CodeExecution from './CodeExecution'

interface MarkdownRendererProps {
  content: string
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [processedContent, setProcessedContent] = useState('')
  const [codeExecutions, setCodeExecutions] = useState<any[]>([])

  useEffect(() => {
    // Extract CodeExecution components and replace with placeholders
    const codeExecutionRegex = /<CodeExecution\s+([^>]+)>\s*```(\w+)\s*([\s\S]*?)```\s*<\/CodeExecution>/g
    const matches = Array.from(content.matchAll(codeExecutionRegex))
    
    const executions: any[] = []
    let processed = content
    
    matches.forEach((match, index) => {
      const fullMatch = match[0]
      const props = match[1]
      const language = match[2]
      const code = match[3]
      
      // Extract props
      const titleMatch = props.match(/title="([^"]*)"/)
      const descriptionMatch = props.match(/description="([^"]*)"/)
      const executableMatch = props.match(/executable=\{([^}]+)\}/)
      
      const title = titleMatch ? titleMatch[1] : ''
      const description = descriptionMatch ? descriptionMatch[1] : ''
      const executable = executableMatch ? executableMatch[1] === 'true' : true
      
      executions.push({
        index,
        title,
        description,
        executable,
        language,
        code: code.trim()
      })
      
      // Replace with a unique placeholder
      const placeholder = `\n\nCODE_EXECUTION_${index}\n\n`
      processed = processed.replace(fullMatch, placeholder)
    })
    
    setCodeExecutions(executions)
    setProcessedContent(processed)
  }, [content])

  // Custom components for markdown rendering
  const components = {
    // Custom heading components with color separation
    h1({ children, ...props }: any) {
      return (
        <h1 className="text-3xl md:text-4xl font-bold font-mono gradient-text mb-6 mt-8 pb-3 border-b-2 border-[var(--accent)]/30" {...props}>
          {children}
        </h1>
      )
    },
    
    h2({ children, ...props }: any) {
      return (
        <h2 className="text-2xl md:text-3xl font-bold font-mono gradient-text mb-4 mt-6 pb-2 border-b border-[var(--accent)]/20" {...props}>
          {children}
        </h2>
      )
    },
    
    h3({ children, ...props }: any) {
      return (
        <h3 className="text-xl md:text-2xl font-bold font-mono text-[var(--accent)] mb-3 mt-5" {...props}>
          {children}
        </h3>
      )
    },
    
    h4({ children, ...props }: any) {
      return (
        <h4 className="text-lg md:text-xl font-semibold font-mono text-[var(--accent)] mb-2 mt-4" {...props}>
          {children}
        </h4>
      )
    },
    
    h5({ children, ...props }: any) {
      return (
        <h5 className="text-base md:text-lg font-semibold font-mono text-[var(--muted)] mb-2 mt-3" {...props}>
          {children}
        </h5>
      )
    },
    
    h6({ children, ...props }: any) {
      return (
        <h6 className="text-sm md:text-base font-semibold font-mono text-[var(--muted)] mb-2 mt-3" {...props}>
          {children}
        </h6>
      )
    },

    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '')
      const language = match ? match[1] : ''
      
      if (!inline && language) {
        return (
          <SyntaxHighlighter
            style={tomorrow}
            language={language}
            PreTag="div"
            className="rounded-lg"
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        )
      }
      
      return (
        <code className={className} {...props}>
          {children}
        </code>
      )
    },
    
    // Handle paragraphs with better spacing
    p({ children, ...props }: any) {
      const text = String(children)
      
      // Check if this paragraph contains a CodeExecution placeholder
      const placeholderMatch = text.match(/CODE_EXECUTION_(\d+)/)
      if (placeholderMatch) {
        const index = parseInt(placeholderMatch[1])
        
        if (codeExecutions[index]) {
          const execution = codeExecutions[index]
          return (
            <CodeExecution
              code={execution.code}
              language={execution.language}
              title={execution.title}
              description={execution.description}
              executable={execution.executable}
            />
          )
        }
      }
      
      return <p className="mb-4 leading-relaxed text-[var(--foreground)]" {...props}>{children}</p>
    },

    // Add better spacing for lists
    ul({ children, ...props }: any) {
      return <ul className="mb-4 ml-6 space-y-2" {...props}>{children}</ul>
    },

    ol({ children, ...props }: any) {
      return <ol className="mb-4 ml-6 space-y-2" {...props}>{children}</ol>
    },

    li({ children, ...props }: any) {
      return <li className="text-[var(--foreground)]" {...props}>{children}</li>
    },

    // Add better spacing for blockquotes
    blockquote({ children, ...props }: any) {
      return (
        <blockquote className="border-l-4 border-[var(--accent)] pl-4 py-2 mb-4 italic text-[var(--muted)] bg-[var(--glass-bg)] rounded-r" {...props}>
          {children}
        </blockquote>
      )
    },

    // Add better spacing for horizontal rules
    hr({ ...props }: any) {
      return <hr className="my-8 border-[var(--glass-border)]" {...props} />
    }
  }

  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown components={components}>
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}