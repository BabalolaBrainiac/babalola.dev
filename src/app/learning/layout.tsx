import { ReactNode } from 'react';
import NavBar from '@/app/components/NavBar';

export default function LearningLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-[#d0ccc4]">
      <NavBar />
      {children}
    </div>
  );
}
