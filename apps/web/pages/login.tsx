import { useState } from 'react';
import { Button } from '@notania/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('Signing in…');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    if (response.ok) {
      setStatus('Success! Redirecting…');
      window.location.href = '/';
    } else {
      const body = await response.json();
      setStatus(body.message ?? 'Failed to sign in.');
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-slate-900/70 p-8">
      <h1 className="mb-6 text-3xl font-semibold text-white">Sign in</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
          />
        </label>
        <Button type="submit">Sign in</Button>
        {status && <p className="text-sm text-slate-400">{status}</p>}
      </form>
    </div>
  );
}
