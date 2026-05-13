import AdminSidebar from "../components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-bg-base text-text-primary selection:bg-accent-primary/30">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-glass-border flex items-center justify-between px-8 bg-bg-base/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="font-display font-bold text-lg">Control Center</h1>
            <span className="px-2 py-1 rounded bg-accent-primary/10 text-accent-primary text-[10px] font-mono uppercase tracking-widest font-bold">Admin Alpha</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-text-primary">Brainiac</div>
              <div className="text-[10px] text-text-dim font-mono">2026-04-18 12:00:00</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-accent-glow/20 border border-accent-glow/30" />
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
