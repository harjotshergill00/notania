import { useEffect, useState } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  favorites: string[];
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/auth/me`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = (await response.json()) as UserProfile;
          setUser(data);
        }
      } catch (error) {
        console.warn('Failed to load user', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { user, loading };
}
