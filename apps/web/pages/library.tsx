import { useEffect, useState } from 'react';
import { Grid } from '@notania/ui';
import { GameCard } from '@/components/GameCard';
import { Game } from '@/lib/types';

export default function LibraryPage() {
  const [favorites, setFavorites] = useState<Game[]>([]);

  useEffect(() => {
    const loadFavorites = () => {
      const stored = localStorage.getItem('notania-favorite-games');
      if (stored) {
        setFavorites(JSON.parse(stored));
      } else {
        setFavorites([]);
      }
    };

    loadFavorites();
    window.addEventListener('storage', loadFavorites);
    return () => window.removeEventListener('storage', loadFavorites);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold text-white">My library</h1>
      {favorites.length === 0 ? (
        <p className="text-slate-400">You have not saved any games yet. Explore the catalog and add a few favorites!</p>
      ) : (
        <Grid>
          {favorites.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </Grid>
      )}
    </div>
  );
}
