import useSWR from 'swr';
import type { Game, PaginatedResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useFeaturedGames() {
  return useSWR<PaginatedResponse<Game>>(`${API_URL}/games?featured=true&page=1&pageSize=12`, fetcher);
}

export function useGameBySlug(slug: string | undefined) {
  return useSWR<Game>(slug ? `${API_URL}/games/${slug}` : null, fetcher);
}

export function useGameSearch(query: string) {
  return useSWR<PaginatedResponse<Game>>(query ? `${API_URL}/games/search?q=${encodeURIComponent(query)}` : null, fetcher);
}

export function useCategoryGames(category: string) {
  return useSWR<PaginatedResponse<Game>>(`${API_URL}/games?category=${encodeURIComponent(category)}&page=1&pageSize=12`, fetcher);
}

export async function updateFavorite(gameId: string, favorite: boolean) {
  const endpoint = `${API_URL}/users/me/favorites${favorite ? '' : `/${gameId}`}`;
  await fetch(endpoint, {
    method: favorite ? 'POST' : 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: favorite ? JSON.stringify({ gameId }) : undefined,
    credentials: 'include',
  });
}
