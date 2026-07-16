import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      <AppSidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <AppHeader />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
