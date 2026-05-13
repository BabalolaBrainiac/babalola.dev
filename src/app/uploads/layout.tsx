import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Secure File Upload | babalola.dev',
  robots: { index: false, follow: false },
}

export default function UploadsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {children}
    </div>
  )
}
