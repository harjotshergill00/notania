import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { AdSlot, Button, Grid } from '@notania/ui';
import { useGameBySlug, useFeaturedGames, updateFavorite } from '@/lib/api';
import { GameCard } from '@/components/GameCard';

export default function GameDetailPage() {
  const router = useRouter();
  const { slug } = router.query as { slug?: string };
  const { data: game } = useGameBySlug(slug);
  const { data: featured } = useFeaturedGames();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (game) {
      const favorites = JSON.parse(localStorage.getItem('notania-favorites') ?? '[]') as string[];
      setIsFavorite(favorites.includes(game.id));
    }
  }, [game]);

  if (!game) {
    return <p>Loading…</p>;
  }

  const handleFavorite = async () => {
    const nextFavorite = !isFavorite;
    setIsFavorite(nextFavorite);
    const favoriteIds = new Set<string>(JSON.parse(localStorage.getItem('notania-favorites') ?? '[]'));
    const favoriteGames = new Map<string, typeof game>(
      (JSON.parse(localStorage.getItem('notania-favorite-games') ?? '[]') as typeof game[]).map((item) => [item.id, item]),
    );
    if (nextFavorite) {
      favoriteIds.add(game.id);
      favoriteGames.set(game.id, game);
    } else {
      favoriteIds.delete(game.id);
      favoriteGames.delete(game.id);
    }
    localStorage.setItem('notania-favorites', JSON.stringify(Array.from(favoriteIds)));
    localStorage.setItem('notania-favorite-games', JSON.stringify(Array.from(favoriteGames.values())));
    await updateFavorite(game.id, nextFavorite);
  };

  return (
    <div className="flex flex-col gap-10">
      <Head>
        <title>{game.title} – Notania Arcade</title>
      </Head>
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="flex flex-col gap-6">
          <div className="aspect-video overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
            <iframe
              src={game.playUrl}
              title={`Play ${game.title}`}
              className="h-full w-full"
              allow="fullscreen"
              allowFullScreen
            />
          </div>
          <AdSlot id="notania-game-leaderboard" className="h-32 w-full rounded-2xl border border-white/10" />
          <article className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-3xl font-semibold text-white">{game.title}</h1>
              <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs uppercase tracking-wide text-indigo-200">
                {game.genre}
              </span>
            </div>
            <p className="text-slate-300">{game.description}</p>
            <dl className="grid gap-2 text-sm text-slate-400 sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-slate-200">Developer</dt>
                <dd>{game.developer}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-200">Publisher</dt>
                <dd>{game.publisher}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-200">Released</dt>
                <dd>{new Date(game.releaseDate).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-200">Players</dt>
                <dd>{game.players.toLocaleString()}</dd>
              </div>
            </dl>
            <div className="flex items-center gap-3">
              <Button onClick={handleFavorite}>{isFavorite ? 'Remove favorite' : 'Add to favorites'}</Button>
              <span className="text-sm text-slate-400">Rating {game.rating.toFixed(1)} / 5</span>
            </div>
          </article>
        </div>
        <aside className="flex flex-col gap-6">
          <AdSlot id="notania-game-rail" className="h-80 w-full rounded-3xl border border-white/10" />
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">More like this</h2>
            <Grid>
              {featured?.data.slice(0, 4).map((item) => (
                <GameCard key={item.id} game={item} />
              ))}
            </Grid>
          </div>
        </aside>
      </section>
    </div>
  );
}
