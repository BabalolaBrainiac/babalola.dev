interface FileIconProps {
  path: string;
  className?: string;
}

export function FileIcon({ path, className = 'w-4 h-4' }: FileIconProps) {
  const lower = path.toLowerCase();
  const ext = lower.split('.').pop() ?? '';
  const base = lower.split('/').pop() ?? '';

  if (base === 'dockerfile' || base.startsWith('dockerfile.')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" />
      </svg>
    );
  }

  if (ext === 'py') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.007 2.752h5.814v.826H3.9S0 5.789 0 11.969c0 6.18 3.403 5.96 3.403 5.96h2.032v-2.867s-.109-3.403 3.347-3.403h5.771s3.24.052 3.24-3.13V3.13S18.28 0 11.914 0zM8.708 1.81a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1z"/>
        <path d="M12.086 24c6.094 0 5.714-2.656 5.714-2.656l-.007-2.752h-5.814v-.826h8.121S24 18.211 24 12.031c0-6.18-3.403-5.96-3.403-5.96h-2.032v2.867s.109 3.403-3.347 3.403H9.447s-3.24-.052-3.24 3.13v5.399S5.72 24 12.086 24zm3.206-1.81a1.05 1.05 0 1 1 0-2.1 1.05 1.05 0 0 1 0 2.1z"/>
      </svg>
    );
  }

  if (ext === 'rs') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.8 11.9l-1.1-.7c0-.1 0-.2-.1-.3l1-1.1a.2.2 0 0 0 0-.3l-1.2-1.2a.2.2 0 0 0-.3 0l-1.1 1a5.7 5.7 0 0 0-.3 0l-.7-1.2a.2.2 0 0 0-.3-.1l-1.6.7a5.3 5.3 0 0 0-.2-.2l.2-1.6a.2.2 0 0 0-.2-.2l-1.7-.3a.2.2 0 0 0-.2.2l-.2 1.6-.3.1-1.3-.9a.2.2 0 0 0-.3 0L14 7.8a.2.2 0 0 0 0 .3l.9 1.3v.3l-1.5.6a.2.2 0 0 0-.1.3l.7 1.6.2.2-1 1.2a.2.2 0 0 0 0 .3l1.2 1.2.3 0 1-1 .3.1.6 1.5a.2.2 0 0 0 .3 0l1.6-.7.2.2.1 1.6a.2.2 0 0 0 .2.2l1.7.3a.2.2 0 0 0 .2-.2l.2-1.6.3-.1 1.3.9a.2.2 0 0 0 .3 0l1.2-1.2a.2.2 0 0 0 0-.3l-.9-1.3.1-.3 1.5-.6a.2.2 0 0 0 .1-.3zm-6 1a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4zM12 0a12 12 0 1 0 0 24A12 12 0 0 0 12 0zm0 21.6a9.6 9.6 0 1 1 0-19.2 9.6 9.6 0 0 1 0 19.2z"/>
      </svg>
    );
  }

  if (ext === 'md' || ext === 'mdx') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  }

  if (ext === 'toml' || ext === 'yaml' || ext === 'yml' || ext === 'json') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  }

  if (ext === 'txt' || ext === 'text') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
