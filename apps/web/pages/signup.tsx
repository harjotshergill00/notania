import { useState } from 'react';
import { Button } from '@notania/ui';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('Creating account…');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName }),
      credentials: 'include',
    });
    if (response.ok) {
      setStatus('Welcome! Redirecting…');
      window.location.href = '/';
    } else {
      const body = await response.json();
      setStatus(body.message ?? 'Failed to create account.');
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-slate-900/70 p-8">
      <h1 className="mb-6 text-3xl font-semibold text-white">Create account</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2 text-sm text-slate-300">
          Display name
          <input
            required
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-slate-300">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-slate-300">
          Password
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
          />
        </label>
        <Button type="submit">Create account</Button>
        {status && <p className="text-sm text-slate-400">{status}</p>}
      </form>
    </div>
  );
}
