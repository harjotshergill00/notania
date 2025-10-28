import { useState } from 'react';
import { useRouter } from 'next/router';
import { AdSlot, Grid, Hero, SearchBar } from '@notania/ui';
import { GameCard } from '@/components/GameCard';
import { useFeaturedGames, useCategoryGames } from '@/lib/api';

const categories = ['Action', 'Adventure', 'Puzzle', 'Strategy', 'Sports', 'Multiplayer'];

export default function HomePage() {
  const { data: featured } = useFeaturedGames();
  const categoryData = categories.map((category) => ({ category, swr: useCategoryGames(category) }));

  return (
    <div className="flex flex-col gap-12">
      <Hero
        title="Play instantly. Discover endlessly."
        description="Dive into a curated library of browser-ready games spanning every genre. Save favorites, track your history, and keep the fun rolling."
      />

      <AdSlot id="notania-hero-top" className="mx-auto h-32 w-full max-w-5xl rounded-2xl border border-dashed border-white/10" />

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold text-white">Featured games</h2>
        <SearchSection />
        <Grid>
          {featured?.data.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </Grid>
      </section>

      {categoryData.map(({ category, swr }) => (
        <section key={category} className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">{category}</h2>
            <a className="text-sm text-indigo-300 hover:text-indigo-200" href={`/search?category=${category}`}>
              View all
            </a>
          </div>
          <Grid>
            {swr.data?.data.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </Grid>
          <AdSlot id={`notania-${category.toLowerCase()}-mid`} className="h-24 w-full rounded-xl border border-white/10" />
        </section>
      ))}
    </div>
  );
}

function SearchSection() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  return (
    <SearchBar
      query={query}
      onQueryChange={setQuery}
      onSubmit={() => {
        if (!query) return;
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }}
    />
  );
}
