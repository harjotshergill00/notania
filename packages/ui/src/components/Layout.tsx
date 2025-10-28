import { ReactNode } from 'react';

export interface LayoutProps {
  children: ReactNode;
  actions?: ReactNode;
}

export function Layout({ children, actions }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="text-lg font-semibold uppercase tracking-wide text-indigo-300">Notania Arcade</span>
          <nav className="flex items-center gap-6 text-sm text-slate-300">
            <a className="hover:text-white" href="/">Home</a>
            <a className="hover:text-white" href="/search">Search</a>
            <a className="hover:text-white" href="/library">My Library</a>
          </nav>
          <div className="ml-auto">{actions}</div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-12">{children}</main>
      <footer className="border-t border-white/10 bg-slate-950/70 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} Notania. All rights reserved.
      </footer>
    </div>
  );
}
