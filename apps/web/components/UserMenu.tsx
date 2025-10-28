import Link from 'next/link';
import { Button } from '@notania/ui';
import { useAuth } from '@/hooks/useAuth';

export function UserMenu() {
  const { user, loading } = useAuth();

  if (loading) {
    return <span className="text-sm text-slate-400">Loading…</span>;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-indigo-500 hover:text-white"
          href="/login"
        >
          Sign in
        </Link>
        <Link className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500" href="/signup">
          Create account
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-indigo-200">Hi, {user.displayName}</span>
      <Button
        variant="ghost"
        onClick={async () => {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
          });
          window.location.reload();
        }}
      >
        Sign out
      </Button>
    </div>
  );
}
