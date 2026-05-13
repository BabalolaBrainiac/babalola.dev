import { ReactNode } from 'react';

export default function LearningLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[#090d12] text-[#e5edf5]">{children}</div>;
}
